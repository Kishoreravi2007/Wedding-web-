import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UploadPhotoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    children?: React.ReactNode;
    initialData?: {
        id: string;
        title: string;
        sister: string;
        eventType: string;
        publicUrl: string;
    } | null;
}

export function UploadPhotoModal({ open, onOpenChange, onSuccess, children, initialData }: UploadPhotoModalProps) {
    const { token } = useAuth();
    const [title, setTitle] = useState("");
    const [sister, setSister] = useState<string>("");
    const [weddings, setWeddings] = useState<any[]>([]);
    const [eventType, setEventType] = useState("Wedding");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditing = !!initialData;

    // Reset/Initialize form when modal opens or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setTitle(initialData.title || "");
                setSister(initialData.sister || "");
                setEventType(initialData.eventType || "Wedding");
                setPreview(initialData.publicUrl || null);
                setFile(null);
            } else {
                setTitle("");
                // keep sister if we already have weddings or set default later
                setEventType("Wedding");
                setPreview(null);
                setFile(null);
            }
        }
    }, [open, initialData]);

    // Fetch weddings on mount
    useEffect(() => {
        const fetchWeddings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/weddings`);
                if (res.ok) {
                    const data = await res.json();
                    setWeddings(data.weddings || []);
                    // Set default if exists
                    if (data.weddings && data.weddings.length > 0) {
                        const first = data.weddings[0];
                        // Use wedding_code as the identifier for 'sister' field for now
                        setSister(first.wedding_code || first.id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch weddings", err);
            }
        };
        fetchWeddings();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
        }
    };

    const handleClearFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing && !file) {
            toast.error("Please select a photo");
            return;
        }

        setUploading(true);

        try {
            let response;

            if (isEditing) {
                // Metadata update only for now (matching backend PATCH)
                response = await fetch(`${API_BASE_URL}/api/photos/${initialData.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        sister,
                        eventType,
                        tags: [] // could add tag management later
                    })
                });
            } else {
                const formData = new FormData();
                formData.append("photo", file!);
                formData.append("title", title);
                formData.append("sister", sister);
                formData.append("eventType", eventType);

                response = await fetch(`${API_BASE_URL}/api/photos`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || (isEditing ? "Update failed" : "Upload failed"));
            }

            toast.success(isEditing ? "Photo updated successfully!" : "Photo uploaded successfully!");
            onOpenChange(false);
            if (onSuccess) onSuccess();

            if (!isEditing) {
                setTitle("");
                setFile(null);
                setPreview(null);
            }

        } catch (error: any) {
            console.error("Portfolio action error:", error);
            toast.error(error.message || "Action failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Portfolio Item" : "Upload to Portfolio"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update photo details and metadata." : "Add a new photo to your showcase gallery."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title (Optional)</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Beachside Ceremony"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Wedding</Label>
                            {weddings.length > 0 ? (
                                <Select value={sister} onValueChange={(v) => setSister(v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select wedding" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {weddings.map((w) => (
                                            <SelectItem key={w.id} value={w.wedding_code || w.id}>
                                                {w.bride_name} & {w.groom_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={sister}
                                    onChange={(e) => setSister(e.target.value)}
                                    placeholder="Enter wedding code or name"
                                />
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Event Type</Label>
                            <Select value={eventType} onValueChange={setEventType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Wedding">Wedding</SelectItem>
                                    <SelectItem value="Engagement">Engagement</SelectItem>
                                    <SelectItem value="Haldi">Haldi</SelectItem>
                                    <SelectItem value="Reception">Reception</SelectItem>
                                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{isEditing ? "Current Image" : "Photo"}</Label>
                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-rose-200 transition-colors"
                            >
                                <Upload className="h-6 w-6 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500 font-medium">Click to upload image</span>
                                <span className="text-xs text-slate-400 mt-1">JPG, PNG up to 10MB</span>
                            </div>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleClearFile(); }}
                                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white" disabled={uploading || (!isEditing && !file)}>
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditing ? "Updating..." : "Uploading..."}
                                </>
                            ) : (
                                isEditing ? "Save Changes" : "Upload Photo"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
