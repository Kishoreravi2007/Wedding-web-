import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, GripVertical, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UploadPhotoModal } from "./UploadPhotoModal";

export function PortfolioGrid() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { token } = useAuth();

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/photos?limit=8`);
                if (!response.ok) {
                    throw new Error('Failed to fetch portfolio');
                }
                const data = await response.json();
                setItems(data.photos || []);
            } catch (err) {
                console.error("Error fetching portfolio:", err);
                setError("Could not load portfolio");
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, [refreshTrigger]);

    // Listen for external updates (e.g. from Hero section upload)
    useEffect(() => {
        const handleUpdate = () => setRefreshTrigger(prev => prev + 1);
        window.addEventListener('portfolio-updated', handleUpdate);
        return () => window.removeEventListener('portfolio-updated', handleUpdate);
    }, []);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setEditingItem(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this portfolio item?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete");
            }

            toast.success("Photo removed from portfolio");
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            console.error("Delete error:", err);
            toast.error(err.message || "Could not delete photo");
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem({
            id: item.id,
            title: item.title,
            sister: item.sister,
            eventType: item.eventType,
            publicUrl: item.publicUrl
        });
        setIsUploadOpen(true);
    };

    return (
        <div className="space-y-6" id="portfolio">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Portfolio Highlights</h2>
                <Button
                    variant="outline"
                    className="text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors"
                    onClick={() => { setEditingItem(null); setIsUploadOpen(true); }}
                >
                    <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-slate-500">
                    <p>{error}</p>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm inline-flex mb-4">
                        <Plus className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No portfolio items yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Upload your best work to showcase your skills to potential clients.
                    </p>
                    <UploadPhotoModal
                        open={isUploadOpen}
                        onOpenChange={setIsUploadOpen}
                        onSuccess={handleUploadSuccess}
                    >
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                            Upload First Photo
                        </Button>
                    </UploadPhotoModal>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            viewport={{ once: true }}
                            className="group relative"
                        >
                            <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.publicUrl || "/placeholder.svg"}
                                        alt={item.title || "Portfolio Item"}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="rounded-full shadow-lg hover:scale-110 transition-transform"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="rounded-full shadow-lg hover:scale-110 transition-transform"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 shadow-sm hover:bg-white">
                                        {item.eventType || "Wedding"}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-slate-900 truncate">{item.title || "Untitled Shot"}</h3>
                                    <p className="text-sm text-slate-500 mt-1 capitalize">
                                        {item.sister ? item.sister.replace('-', ' ') : 'General'} • {new Date(item.uploadedAt).getFullYear()}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            <UploadPhotoModal
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                initialData={editingItem}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}
