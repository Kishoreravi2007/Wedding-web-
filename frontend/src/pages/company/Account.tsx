import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { X, Search, MapPin, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { detectFaces, loadFaceDetectionModels } from "@/utils/faceDetection";
// import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/lib/api";

interface ProfileData {
  fullName: string;
  email: string;
  bio: string;
  location: string;
  photo: string | null;
}

interface EditorSettings {
  zoom: number;
  cropX: number;
  cropY: number;
  brightness: number;
  contrast: number;
  saturate: number;
  sepia: number;
}

const initialEditorSettings = (): EditorSettings => ({
  zoom: 1,
  cropX: 50,
  cropY: 50,
  brightness: 110,
  contrast: 110,
  saturate: 110,
  sepia: 0,
});

const buildFilterString = (settings: EditorSettings) => {
  return `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturate}%) sepia(${settings.sepia}%)`;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const EDITOR_PREVIEW_SIZE = 360;

const createCroppedDataUrl = async (
  source: string,
  settings: EditorSettings,
  size: number = EDITOR_PREVIEW_SIZE,
): Promise<string> => {
  const image = new Image();
  image.src = source;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create canvas context");
  }

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.filter = buildFilterString(settings);

  const zoomFactor = settings.zoom;
  const scaledWidth = image.width * zoomFactor;
  const scaledHeight = image.height * zoomFactor;
  const maxOffsetX = Math.max(0, scaledWidth - size);
  const maxOffsetY = Math.max(0, scaledHeight - size);
  const offsetX = clamp((settings.cropX / 100) * maxOffsetX, 0, maxOffsetX);
  const offsetY = clamp((settings.cropY / 100) * maxOffsetY, 0, maxOffsetY);

  ctx.drawImage(image, -offsetX, -offsetY, scaledWidth, scaledHeight);
  return canvas.toDataURL("image/jpeg", 0.95);
};

const detectFaceForPhoto = async (dataUrl: string) => {
  try {
    await loadFaceDetectionModels();
    const image = new Image();
    image.src = dataUrl;
    await image.decode();

    const faces = await detectFaces(image);
    if (!faces.length) {
      return null;
    }

    const box = faces[0].box;
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;
    const size = Math.max(box.width, box.height);
    const zoom = clamp(360 / size, 1, 2.5);
    const cropX = clamp((centerX / image.width) * 100, 0, 100);
    const cropY = clamp((centerY / image.height) * 100, 0, 100);

    return { zoom, cropX, cropY };
  } catch (error) {
    console.error("Automatic face detection failed:", error);
    return null;
  }
};

const filterControls: Array<{ label: string; field: keyof EditorSettings; min: number; max: number }> = [
  { label: "Brightness", field: "brightness", min: 80, max: 150 },
  { label: "Contrast", field: "contrast", min: 80, max: 150 },
  { label: "Saturation", field: "saturate", min: 70, max: 140 },
  { label: "Sepia", field: "sepia", min: 0, max: 60 },
];

const CompanyAccount = () => {
  const { currentUser, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState<ProfileData>({
    fullName: "",
    email: "",
    bio: "",
    location: "",
    photo: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSource, setEditorSource] = useState<string | null>(null);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(initialEditorSettings());
  const [uploadedPhotoSource, setUploadedPhotoSource] = useState<string | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null);

  // Location Search State
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Location Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formState.location.length < 3) {
        setLocationSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearchingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formState.location)}&addressdetails=1&limit=5&featuretype=city`
        );
        const data = await response.json();

        const formatted = data.map((item: any) => ({
          id: item.place_id,
          display: `${item.address.city || item.address.town || item.address.district || item.display_name.split(',')[0]}, ${item.address.state || ''}`,
          fullName: item.display_name
        }));

        setLocationSuggestions(formatted);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Location search failed:", error);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formState.location]);

  const handleSelectLocation = (loc: any) => {
    handleInput("location", loc.display);
    setShowSuggestions(false);
  };

  const handleInput = useCallback(
    (field: "fullName" | "email" | "bio" | "location", value: string) => {
      setFormState((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  useEffect(() => {
    if (!currentUser) {
      setFormState({
        fullName: "",
        email: "",
        bio: "",
        location: "",
        photo: null,
      });
      setUploadedPhotoSource(null);
      return;
    }

    setFormState({
      fullName: currentUser.profile?.full_name ?? "",
      email: currentUser.profile?.email ?? currentUser.email ?? "",
      bio: currentUser.profile?.bio ?? "",
      location: currentUser.profile?.location ?? "",
      photo: currentUser.profile?.avatar_url ?? null,
    });
    setUploadedPhotoSource(currentUser.profile?.avatar_url ?? null);
  }, [currentUser]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setUploadedPhotoSource(dataUrl);
      setEditorSettings(initialEditorSettings());
      setEditorSource(dataUrl);
      setIsEditorOpen(true);
      const focused = await detectFaceForPhoto(dataUrl);
      if (focused) {
        setEditorSettings((prev) => ({
          ...prev,
          ...focused,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const openEditorWithCurrentPhoto = useCallback(async () => {
    const baseSource = uploadedPhotoSource || formState.photo;
    if (!baseSource) {
      return;
    }
    setEditorSettings(initialEditorSettings());
    setEditorSource(baseSource);
    setIsEditorOpen(true);
    const focused = await detectFaceForPhoto(baseSource);
    if (focused) {
      setEditorSettings((prev) => ({
        ...prev,
        ...focused,
      }));
    }
  }, [formState.photo, uploadedPhotoSource]);

  const applyAutoAdjust = useCallback(async () => {
    if (!editorSource) {
      return;
    }

    setPreviewLoading(true);
    const focused = await detectFaceForPhoto(editorSource);
    if (focused) {
      setEditorSettings((prev) => ({
        ...prev,
        ...focused,
      }));
    }
    setPreviewLoading(false);
  }, [editorSource]);

  const handleEditorPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      setIsDragging(true);
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        cropX: editorSettings.cropX,
        cropY: editorSettings.cropY,
      };
    },
    [editorSettings.cropX, editorSettings.cropY]
  );

  const handleEditorPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = dragStartRef.current;
      if (!isDragging || !start || !previewRef.current) {
        return;
      }
      const rect = previewRef.current.getBoundingClientRect();
      const deltaX = ((event.clientX - start.x) / rect.width) * 100;
      const deltaY = ((event.clientY - start.y) / rect.height) * 100;
      setEditorSettings((prev) => ({
        ...prev,
        cropX: clamp(start.cropX + deltaX, 0, 100),
        cropY: clamp(start.cropY + deltaY, 0, 100),
      }));
    },
    [isDragging]
  );

  const handleEditorPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStartRef.current = null;
    setIsDragging(false);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditorSource(null);
    setPreviewDataUrl(null);
    setPreviewLoading(false);
  }, []);

  const applyEditedPhoto = async () => {
    if (!editorSource) {
      return;
    }
    const finalPhoto =
      previewDataUrl ??
      (await createCroppedDataUrl(editorSource, editorSettings, EDITOR_PREVIEW_SIZE));
    setFormState((prev) => ({
      ...prev,
      photo: finalPhoto,
    }));
    closeEditor();
  };

  useEffect(() => {
    if (!editorSource) {
      setPreviewDataUrl(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    createCroppedDataUrl(editorSource, editorSettings, EDITOR_PREVIEW_SIZE)
      .then((url) => {
        if (!cancelled) {
          setPreviewDataUrl(url);
        }
      })
      .catch((error) => {
        console.error("Failed to generate preview", error);
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editorSource, editorSettings]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('auth_token');

    try {
      // 1. Update Profile Data (Profiles table)
      const profileResponse = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          email: formState.email, // Storing email in profiles too
          full_name: formState.fullName,
          location: formState.location,
          bio: formState.bio,
          avatar_url: formState.photo
        })
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to update profile details');
      }

      // 2. Update Auth Data (Users table) - if email/username changed
      // Note: Changing sensitivity fields might require re-login or password check in a real app
      if (formState.email !== currentUser.email) {
        const authResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            username: formState.email // Usage of email as username
          })
        });
        if (!authResponse.ok) {
          console.warn('Failed to update auth username');
        }
      }

      toast({
        title: "Profile updated",
        description: "Your account details and avatar are synced.",
      });

      refreshProfile?.();
    } catch (error: any) {
      console.error("Unable to save profile:", error);
      toast({
        title: "Unable to save",
        description: error?.message || "Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = useCallback(async () => {
    await logout();
    toast({
      title: "Signed out",
      description: "Come back anytime to manage your plan.",
    });
    navigate("/company/login");
  }, [logout, navigate]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-16 text-slate-900">
        <div className="mx-auto max-w-2xl space-y-6 rounded-3xl bg-white p-10 shadow-2xl shadow-slate-200">
          <h1 className="text-3xl font-semibold text-slate-900">Access your WeddingWeb account</h1>
          <p className="text-slate-500">
            Please log in to see and update your profile, upload new photos, or manage your guests.
          </p>
          <Link to="/company/login">
            <Button className="bg-gradient-to-r from-rose-500 to-purple-600 text-white">
              Go to login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-5xl transform overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_40px_70px_rgba(15,23,42,0.15)] transition-all duration-500 sm:p-10">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="border border-slate-200 text-slate-700 hover:border-slate-400">
              Back to Home
            </Button>
          </Link>
          <p className="text-xs uppercase tracking-[0.6em] text-slate-500">Personal dashboard</p>
        </div>
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between py-2">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Account</p>
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {formState.fullName}</h1>
            <p className="text-sm text-slate-500">Adjust your profile details any time.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
            <Link to="/">
              <Button variant="ghost" className="border border-white/30 text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar className="h-36 w-36">
                {formState.photo ? (
                  <AvatarImage src={formState.photo} alt={formState.fullName} />
                ) : (
                  <AvatarFallback>
                    {(formState.fullName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="text-lg font-semibold text-slate-900">{formState.fullName}</p>
              <p className="text-sm text-slate-500">{formState.email}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-600">Profile photo</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-rose-500/80 file:px-3 file:py-1 file:text-white"
              />
              {formState.photo && (
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full border border-slate-200 bg-white text-slate-900"
                    onClick={() => openEditorWithCurrentPhoto()}
                    type="button"
                  >
                    Edit photo
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full border border-slate-200 text-slate-900"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        photo: null,
                      }))
                    }
                    type="button"
                  >
                    Remove photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={formState.fullName}
                onChange={(event) => handleInput("fullName", event.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(event) => handleInput("email", event.target.value)}
                placeholder="you@weddingweb.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="location"
                  value={formState.location}
                  onChange={(event) => {
                    handleInput("location", event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => formState.location.length >= 3 && setShowSuggestions(true)}
                  placeholder="Search location (e.g. Palakkad, Kerala)"
                  className="pl-10"
                />
                {isSearchingLocation && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                  </div>
                )}

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[250px] overflow-y-auto"
                    >
                      {locationSuggestions.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{loc.display}</p>
                            <p className="text-[10px] text-slate-400 truncate">{loc.fullName}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formState.bio}
                onChange={(event) => handleInput("bio", event.target.value)}
                placeholder="Tell us a little about you."
                rows={4}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </section>
      </div>
      {isEditorOpen && editorSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 px-4 py-10">
          <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/50">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Profile photo editor</p>
                <h2 className="text-xl font-semibold text-slate-900">Perfect the circle</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={closeEditor}>
                <X className="h-4 w-4 text-slate-600" />
              </Button>
            </div>

            <div className="flex flex-col gap-6 px-6 py-6 md:flex-row">
              <div className="flex-1">
                <p className="text-sm text-slate-500">Drag to reposition, or use the sliders below.</p>
                <div
                  ref={previewRef}
                  className={`relative mx-auto mt-6 h-[360px] w-[360px] overflow-hidden rounded-full border-4 border-white bg-slate-900 shadow-2xl ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  onPointerDown={handleEditorPointerDown}
                  onPointerMove={handleEditorPointerMove}
                  onPointerUp={handleEditorPointerUp}
                  onPointerLeave={handleEditorPointerUp}
                >
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Photo preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/60">
                      Preparing preview…
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Circle crop</span>
                  <span>|</span>
                  <span>Filters stay live</span>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Framing</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={applyAutoAdjust}
                      disabled={!editorSource || previewLoading}
                    >
                      Auto
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500">Zoom ({editorSettings.zoom.toFixed(2)}x)</label>
                    <input
                      type="range"
                      min={1}
                      max={2.5}
                      step={0.01}
                      value={editorSettings.zoom}
                      onChange={(event) =>
                        setEditorSettings((prev) => ({
                          ...prev,
                          zoom: Number(event.target.value),
                        }))
                      }
                      className="slider"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500">Horizontal</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editorSettings.cropX}
                      onChange={(event) =>
                        setEditorSettings((prev) => ({
                          ...prev,
                          cropX: Number(event.target.value),
                        }))
                      }
                      className="slider"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs text-slate-500">Vertical</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editorSettings.cropY}
                      onChange={(event) =>
                        setEditorSettings((prev) => ({
                          ...prev,
                          cropY: Number(event.target.value),
                        }))
                      }
                      className="slider"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filter stack</p>
                  <div className="grid gap-4">
                    {filterControls.map((control) => (
                      <div key={control.field}>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{control.label}</span>
                          <span>{editorSettings[control.field]}%</span>
                        </div>
                        <input
                          type="range"
                          min={control.min}
                          max={control.max}
                          value={editorSettings[control.field]}
                          onChange={(event) =>
                            setEditorSettings((prev) => ({
                              ...prev,
                              [control.field]: Number(event.target.value),
                            }))
                          }
                          className="slider"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-slate-300 text-slate-600" onClick={closeEditor}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 text-white"
                    onClick={applyEditedPhoto}
                    disabled={previewLoading || previewDataUrl === null}
                  >
                    Save photo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyAccount;

