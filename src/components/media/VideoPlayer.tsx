import React, { useState } from 'react';
import ReactPlayer from "react-player";
import { Play } from 'lucide-react';

interface VideoPlayerProps {
    url?: string; // Legacy support
    providerId?: string;
    platform?: 'youtube' | 'vimeo' | 'custom';
    previewUrl?: string; // WebP animated or static
    className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    url,
    providerId,
    platform = 'youtube',
    previewUrl,
    className = '',
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Construct full URL if providerId is present
    const videoUrl = providerId
        ? platform === 'youtube'
            ? `https://www.youtube.com/watch?v=${providerId}`
            : platform === 'vimeo'
                ? `https://vimeo.com/${providerId}`
                : url
        : url;

    if (!videoUrl) return <div className={`bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 ${className}`}>No Video</div>;

    return (
        <div className={`relative overflow-hidden rounded-xl bg-slate-900 ${className} group`}>
            {/* 
        OPTIMIZATION STRATEGY:
        1. Show lightweight WebP/Image preview initially.
        2. Only load heavy Youtube Iframe when 'isPlaying' is true.
      */}

            {!isPlaying && (
                <div
                    className="absolute inset-0 cursor-pointer z-10"
                    onClick={() => setIsPlaying(true)}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Video preview"
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <span className="text-slate-500 text-sm">Preview Unavailable</span>
                        </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full group-hover:bg-white/30 transition-all transform group-hover:scale-110">
                            <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs text-white font-medium">
                        {platform === 'youtube' ? 'YouTube' : 'Video'}
                    </div>
                </div>
            )}

            {/* Actual Player */}
            {(isPlaying || !previewUrl) && (
                <ReactPlayer
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    controls={true}
                    light={false} // We handle our own light mode with previewUrl
                    className="absolute inset-0"
                />
            )}
        </div>
    );
};
