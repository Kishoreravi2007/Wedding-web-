import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title = "Engagement Video" }) => {
  // Determine if the video is from YouTube, Vimeo, or a direct file
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  let embedUrl = videoUrl;

  if (isYouTube) {
    const videoId = videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("youtu.be/")[1]?.split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (isVimeo) {
    const videoId = videoUrl.split("vimeo.com/")[1]?.split("?")[0];
    embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}> {/* 16:9 Aspect Ratio */}
      {isYouTube || isVimeo ? (
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <video
          className="absolute top-0 left-0 w-full h-full"
          controls
          src={videoUrl}
          title={title}
          poster="/placeholder.svg" // Placeholder image for direct video
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
