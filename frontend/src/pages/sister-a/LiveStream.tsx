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
            <Radio className="w-8 h-8 text-[#D4AF37] animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold text-[#8C3B3B] font-serif">
              Watch Live
            </h1>
          </div>
          <p className="text-lg text-[#8C3B3B] font-medium">
            Join us as we celebrate Parvathy's special day
          </p>
        </div>

        {/* Live Stream Container */}
        <motion.div
          className="space-y-8"
          variants={itemVariants}
        >
          {/* Parvathy's Live Stream */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border-2 border-[#D4AF37]/20">
            <div className="bg-gradient-to-r from-[#8C3B3B] to-[#D4AF37] p-4">
              <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
                <Radio className="w-6 h-6 animate-pulse" />
                Live Stream
              </h2>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/8TioaoIUJUg"
                title="Parvathy's Live Stream"
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
          <p className="text-[#8C3B3B] text-sm">
            Having trouble viewing? Try refreshing the page or check your internet connection.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LiveStream;

