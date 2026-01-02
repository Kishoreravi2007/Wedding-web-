/**
 * LiveModeIndicator Component
 * 
 * Visual indicator showing real-time photo sync status
 * Displays when Live Mode is active and shows photo count updates
 */

import React from 'react';
import { Radio, Camera, RefreshCw, CheckCircle } from 'lucide-react';

interface LiveModeIndicatorProps {
    isActive: boolean;
    isConnected: boolean;
    photoCount: number;
    newPhotoNotification?: string | null;
    onToggle: () => void;
}

const LiveModeIndicator: React.FC<LiveModeIndicatorProps> = ({
    isActive,
    isConnected,
    photoCount,
    newPhotoNotification,
    onToggle
}) => {
    return (
        <div className="relative">
            {/* Live Mode Toggle Button */}
            <button
                onClick={onToggle}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300
          ${isActive
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-200 animate-pulse'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
        `}
            >
                <Radio className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                <span>{isActive ? 'LIVE' : 'Go Live'}</span>
                {isActive && isConnected && (
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                )}
            </button>

            {/* Status Indicator */}
            {isActive && (
                <div className="mt-3 space-y-2">
                    {/* Connection Status */}
                    <div className="flex items-center gap-2 text-sm">
                        {isConnected ? (
                            <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">Connected to live updates</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                                <span className="text-amber-600">Connecting...</span>
                            </>
                        )}
                    </div>

                    {/* Photo Count */}
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                        <Camera className="w-5 h-5 text-blue-500" />
                        <div>
                            <span className="font-bold text-blue-700">{photoCount}</span>
                            <span className="text-blue-600 text-sm ml-1">
                                {photoCount === 1 ? 'photo' : 'photos'} of you found
                            </span>
                        </div>
                    </div>

                    {/* New Photo Notification */}
                    {newPhotoNotification && (
                        <div className="bg-green-50 border border-green-200 px-3 py-2 rounded-lg animate-bounce">
                            <div className="flex items-center gap-2">
                                <span className="text-green-600 text-sm font-medium">
                                    🎉 {newPhotoNotification}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveModeIndicator;
