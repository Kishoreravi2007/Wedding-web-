import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";

const LiveStream = () => {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen py-8 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="max-w-6xl mx-auto"
        variants={itemVariants}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Radio className="w-8 h-8 text-[#B8860B] animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold text-[#800000] font-serif">
              Watch Live
            </h1>
          </div>
          <p className="text-lg text-[#1B5E20] font-medium">
            Join us as we celebrate Sreedevi & Vaishag's special day
          </p>
        </div>

        {/* Live Stream Container */}
        <motion.div
          className="space-y-8"
          variants={itemVariants}
        >
          {/* Sister B Live Stream */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border-2 border-[#B8860B]/20">
            <div className="bg-gradient-to-r from-[#B8860B] to-[#FFD700] p-4">
              <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
                <Radio className="w-6 h-6 animate-pulse" />
                Live Stream
              </h2>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/2qXrxmf0LpU"
                title="Sister B Live Stream"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="mt-8 text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
          variants={itemVariants}
        >
          <p className="text-[#1B5E20] text-sm">
            Having trouble viewing? Try refreshing the page or check your internet connection.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LiveStream;

