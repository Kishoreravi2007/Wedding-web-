import React from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { motion } from 'framer-motion';

const EngagementVideo: React.FC = () => {
  const genericVideoUrl = "https://youtu.be/egGMIfRgNTg";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4"
    >
      <h1 className="text-3xl font-bold text-center mb-8">Engagement Video</h1>
      <div className="max-w-3xl mx-auto">
        <VideoPlayer videoUrl={genericVideoUrl} title="Engagement Video" />
      </div>
      <p className="text-center mt-4 text-gray-600">
        Enjoy this video!
      </p>
    </motion.div>
  );
};

export default EngagementVideo;
