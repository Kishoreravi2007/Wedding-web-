import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, Sun, Contrast, Droplet, Check, X, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface BackgroundAdjusterModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    onConfirm: (blob: Blob, adjustments: ImageAdjustments) => void;
}

export interface ImageAdjustments {
    brightness: number;
    contrast: number;
    blur: number;
    saturation: number;
}

const BackgroundAdjusterModal: React.FC<BackgroundAdjusterModalProps> = ({
    isOpen,
    onClose,
    imageSrc,
    onConfirm
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [adjustments, setAdjustments] = useState<ImageAdjustments>({
        brightness: 100,
        contrast: 100,
        blur: 0,
        saturation: 100
    });
    const [processing, setProcessing] = useState(false);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;

        const toastId = toast.loading("Processing image...");
        try {
            setProcessing(true);
            console.log("✂️ Starting image crop with pixels:", croppedAreaPixels);
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels, adjustments);
            if (blob) {
                console.log("✅ Crop successful, blob size:", blob.size);
                toast.success("Image processed!", { id: toastId });
                onConfirm(blob, adjustments);
            } else {
                throw new Error("Failed to generate image blob");
            }
        } catch (e: any) {
            console.error("❌ Cropping error:", e);
            toast.error(`Cropping failed: ${e.message || 'Unknown error'}`, { id: toastId });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-white/10 text-white">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                            <Sun className="w-5 h-5" />
                        </div>
                        Adjust Background Image
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col md:flex-row min-h-0">
                    {/* Cropper Area */}
                    <div className="flex-[2] relative bg-black min-h-[300px]">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            style={{
                                containerStyle: { background: '#000' },
                                imageStyle: {
                                    filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) blur(${adjustments.blur}px) saturate(${adjustments.saturation}%)`
                                }
                            }}
                        />
                    </div>

                    {/* Adjustments Sidebar */}
                    <div className="flex-1 p-6 space-y-8 bg-slate-900 overflow-y-auto border-l border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
                                    <Sun className="w-4 h-4" /> Brightness
                                </Label>
                                <span className="text-xs text-rose-400 font-mono">{adjustments.brightness}%</span>
                            </div>
                            <Slider
                                value={[adjustments.brightness]}
                                min={50}
                                max={150}
                                step={1}
                                onValueChange={([val]) => setAdjustments(prev => ({ ...prev, brightness: val }))}
                                className="py-2"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
                                    <Contrast className="w-4 h-4" /> Contrast
                                </Label>
                                <span className="text-xs text-rose-400 font-mono">{adjustments.contrast}%</span>
                            </div>
                            <Slider
                                value={[adjustments.contrast]}
                                min={50}
                                max={150}
                                step={1}
                                onValueChange={([val]) => setAdjustments(prev => ({ ...prev, contrast: val }))}
                                className="py-2"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
                                    <Droplet className="w-4 h-4" /> Blur
                                </Label>
                                <span className="text-xs text-rose-400 font-mono">{adjustments.blur}px</span>
                            </div>
                            <Slider
                                value={[adjustments.blur]}
                                min={0}
                                max={10}
                                step={0.5}
                                onValueChange={([val]) => setAdjustments(prev => ({ ...prev, blur: val }))}
                                className="py-2"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
                                    <Droplet className="w-4 h-4" /> Saturation
                                </Label>
                                <span className="text-xs text-rose-400 font-mono">{adjustments.saturation}%</span>
                            </div>
                            <Slider
                                value={[adjustments.saturation]}
                                min={0}
                                max={200}
                                step={1}
                                onValueChange={([val]) => setAdjustments(prev => ({ ...prev, saturation: val }))}
                                className="py-2"
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-medium text-white/70">Zoom</Label>
                                <span className="text-xs text-white/50">{zoom.toFixed(1)}x</span>
                            </div>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={([val]) => setZoom(val)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-black/40 border-t border-white/10 gap-2">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 text-white border border-white/10">
                        <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={processing}
                        className="bg-rose-500 hover:bg-rose-600 text-white min-w-[140px]"
                    >
                        {processing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                        Apply & Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BackgroundAdjusterModal;

/**
 * Helper to process the image on canvas
 */
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: any,
    adjustments: ImageAdjustments
): Promise<Blob | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Apply filters to context
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) blur(${adjustments.blur}px) saturate(${adjustments.saturation}%)`;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg');
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}
