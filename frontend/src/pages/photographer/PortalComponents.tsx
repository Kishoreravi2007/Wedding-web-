
import { cn } from "@/lib/utils";
import { UploadCloud, FileImage, X, CheckCircle2, RotateCw } from "lucide-react";

export const UploadProgress = ({
    fileName,
    fileSize,
    progress,
    status,
    onCancel
}: {
    fileName: string;
    fileSize: string;
    progress: number;
    status: 'uploading' | 'completed' | 'failed';
    onCancel?: () => void
}) => {
    return (
        <div className="p-6 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        {status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : status === 'failed' ? (
                            <X className="w-6 h-6 text-red-500" />
                        ) : (
                            <FileImage className="w-6 h-6 text-primary/60" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-[#111318] line-clamp-1">{fileName}</h4>
                        <p className="text-xs text-[#636f88]">{fileSize}</p>
                    </div>
                </div>
                {onCancel && status === 'uploading' && (
                    <button onClick={onCancel} className="text-[#636f88] hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        status === 'completed' ? "bg-green-500" :
                            status === 'failed' ? "bg-red-500" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between mt-2">
                <span className={cn(
                    "text-xs font-bold",
                    status === 'completed' ? "text-green-600" :
                        status === 'failed' ? "text-red-600" : "text-primary"
                )}>
                    {status === 'completed' ? 'Uploaded' : status === 'failed' ? 'Failed' : `${Math.round(progress)}% Uploaded`}
                </span>
                <span className="text-xs font-medium text-[#636f88]">
                    {status === 'uploading' ? 'Uploading...' : status}
                </span>
            </div>
        </div>
    );
};

export const DragDropZone = ({
    isDragActive,
    onClick
}: {
    isDragActive: boolean;
    onClick: () => void
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all cursor-pointer group relative overflow-hidden",
                isDragActive
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
            )}
        >
            <div className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center text-primary mb-2 transition-colors">
                    <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-[#111318] text-xl font-bold">Drag and drop photos here</h3>
                <p className="text-[#636f88] text-sm max-w-[320px]">
                    Support for high-resolution JPG, PNG up to 50MB each.
                </p>
            </div>

            <div className="flex gap-4 relative z-10 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none min-w-[140px] items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Browse Files
                </button>
            </div>
        </div>
    );
};
