
// import { Face, Save, Palette } from '@mui/icons-material'; // Removed unused MUI import
import { User, Tag, Palette as PaletteIcon, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardStatsProps {
    stats: {
        totalPhotos: number;
        photosWithFaces: number;
        processing: boolean;
        processedCount: number;
    };
    onContextAction?: (action: string) => void;
}

export const DashboardStats = ({ stats, onContextAction }: DashboardStatsProps) => {
    // Calculate percentages
    const faceCoverage = stats.totalPhotos > 0
        ? Math.round((stats.photosWithFaces / stats.totalPhotos) * 100)
        : 0;

    return (
        <div className="space-y-8">
            <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-6">AI Task Monitor</h2>
                <div className="space-y-5">

                    {/* Face Recognition Task */}
                    <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <p className="text-sm font-bold">Face Recognition</p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${stats.processing ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>
                                    {stats.processing ? 'Processing' : 'Active'}
                                </span>
                            </div>
                            <p className="text-xs text-[#636f88] mb-2">
                                {stats.processing
                                    ? `Scanning photos... (${stats.processedCount} processed)`
                                    : `${stats.photosWithFaces} photos indexed with faces`}
                            </p>
                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${faceCoverage}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Auto Tagging (Mock for now or map to events) */}
                    <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between mb-1">
                                <p className="text-sm font-bold">Auto-Tagging</p>
                                <span className="text-[10px] font-bold text-green-600 px-1.5 py-0.5 bg-green-50 rounded uppercase">Complete</span>
                            </div>
                            <p className="text-xs text-[#636f88]">Event tagging enabled</p>
                        </div>
                    </div>

                </div>

                <Button
                    variant="outline"
                    className="w-full mt-6 text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() => onContextAction?.('configure_ai')}
                >
                    Configure AI Settings
                </Button>
            </section>

            <section className="bg-primary rounded-xl p-6 text-white shadow-lg shadow-primary/20">
                <div className="flex items-center gap-2 mb-4">
                    <Database className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Storage Status</h2>
                </div>
                {/* Mock Storage for now - assuming 1TB plan */}
                <p className="text-sm opacity-90 mb-4">
                    You have used {Math.round(stats.totalPhotos * 3.5 / 1024 * 100) / 100} GB (estimated)
                </p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-6">
                    <div className="bg-white h-full" style={{ width: '15%' }}></div>
                </div>
                <button className="w-full py-2.5 bg-white text-primary rounded font-bold text-sm hover:bg-gray-50 transition-colors">
                    Upgrade Storage Plan
                </button>
            </section>
        </div>
    );
};
