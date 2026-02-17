
import { Photo } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { MoreVertical, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardActivityTableProps {
    photos: Photo[];
    onManage: (photo: Photo) => void;
}

export const DashboardActivityTable = ({ photos, onManage }: DashboardActivityTableProps) => {
    return (
        <section className="mt-10 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold">Upload History</h2>
                <div className="flex gap-2">
                    <select className="form-select text-sm rounded-lg border-gray-200 focus:ring-primary/20 outline-none p-2 border">
                        <option>All Events</option>
                        <option>Last 30 Days</option>
                        <option>Completed</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-[#636f88] uppercase tracking-wider">Photo / Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#636f88] uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#636f88] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#636f88] uppercase tracking-wider">AI Milestone</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#636f88] uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {photos.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    No photos uploaded yet.
                                </td>
                            </tr>
                        ) : (
                            photos.map((photo) => (
                                <tr key={photo.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                <img
                                                    className="w-full h-full object-cover"
                                                    src={photo.thumbnail || photo.url}
                                                    alt={photo.title}
                                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=IMG'; }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm truncate max-w-[200px]" title={photo.title}>{photo.title}</p>
                                                <p className="text-xs text-[#636f88]">{photo.event || 'General'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[#636f88]">
                                        {photo.date ? format(new Date(photo.date), 'MMM dd, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Completed
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-[#111318]">Indexing Complete</span>
                                            <div className="flex gap-1 items-center">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                <span className="text-[10px] text-[#636f88]">
                                                    {photo.faces ? `${photo.faces.length} faces recognized` : 'Processing...'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => onManage(photo)}
                                            className="text-primary hover:underline text-sm font-bold"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            {photos.length > 0 && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-[#636f88]">Showing {photos.length} recent uploads</p>
                </div>
            )}
        </section>
    );
};
