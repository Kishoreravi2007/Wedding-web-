import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Shirt, Settings, Camera } from "lucide-react";
import { useWebsite } from "@/contexts/WebsiteContext";
import { motion, Easing } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"; // Import useMusicPlayer

const Index = () => {
  const { content } = useWebsite();
  const { t } = useTranslation();
  const { playTrack } = useMusicPlayer(); // Get playTrack from the context
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as Easing
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as Easing
      }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as Easing
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut" as Easing
      }
    }
  };

  const heartbeatVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as Easing
      }
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden animated-gradient-background"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background decorative elements */}
      <motion.div 
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-[#D4AF37]/20 to-transparent rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
      ></motion.div>
      <motion.div 
        className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-r from-[#8C3B3B]/15 to-transparent rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 1 }}
      ></motion.div>

      <motion.div className="text-center mb-12 flex items-center justify-center" variants={itemVariants}>
        <motion.div
            variants={heartbeatVariants}
            animate="animate"
        >
            <Heart className="w-8 h-8 text-[#8C3B3B]" />
        </motion.div>
        <motion.h1 
          className="font-heading text-4xl md:text-7xl text-[#5D4037] bg-gradient-to-r from-[#5D4037] to-[#8C3B3B] bg-clip-text text-transparent mx-4"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {t('homeScreenTitle')}
        </motion.h1>
        <motion.div
            variants={heartbeatVariants}
            animate="animate"
        >
            <Heart className="w-8 h-8 text-[#8C3B3B]" />
        </motion.div>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12" variants={containerVariants}>
        <motion.div variants={cardVariants}>
          <Link to="/parvathy" className="group" onClick={() => playTrack('/wedding-music.mp3')}>
            <motion.div
              whileHover="hover"
              variants={cardVariants}
            >
              <Card className="text-center cursor-hover border-2 border-transparent hover:border-[#D4AF37] bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-500 relative overflow-hidden">
                {/* Background Image for Parvathy */}
                <motion.div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                  style={{
                    backgroundImage: "url('/couple-frame-placeholder.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Decorative overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-[#8C3B3B]/10 via-transparent to-[#D4AF37]/10 group-hover:from-[#8C3B3B]/20 group-hover:to-[#D4AF37]/20 transition-all duration-500"
                  whileHover={{ opacity: 0.3 }}
                />
                
                <div className="relative z-10">
                  <CardHeader className="pb-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                        <CardTitle className="font-heading text-3xl text-[#8C3B3B] group-hover:text-[#6d2d2d] transition-colors duration-300 drop-shadow-sm">
                          {t('sisterAWedding')}
                        </CardTitle>
                      </motion.div>
                    </CardHeader>
                    <CardContent>
                      <motion.p
                        className="text-base text-stone-700 group-hover:text-stone-800 transition-colors duration-300 drop-shadow-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {/* Description removed as per user request */}
                      </motion.p>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Heart className="w-8 h-8 mx-auto mt-4 text-[#8C3B3B] group-hover:text-[#6d2d2d] transition-all duration-300 drop-shadow-sm" />
                      </motion.div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Link to="/sreedevi" className="group" onClick={() => playTrack('/another-song.mp3')}> {/* Add onClick handler */}
              <motion.div
                whileHover="hover"
                variants={cardVariants}
              >
                <Card className="text-center cursor-hover border-2 border-transparent hover:border-[#B8860B] bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-500">
                  <CardHeader className="pb-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                        <CardTitle className="font-heading text-3xl text-[#1B5E20] group-hover:text-[#0d3d12] transition-colors duration-300">
                          {t('sisterBWedding')}
                        </CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <motion.p
                      className="text-base text-stone-700 group-hover:text-stone-800 transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {/* Description removed as per user request */}
                    </motion.p>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Heart className="w-8 h-8 mx-auto mt-4 text-[#1B5E20] group-hover:text-[#0d3d12] transition-all duration-300" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
      </motion.div>

      <motion.div 
        className="w-full max-w-4xl pb-8" 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2 
          className="font-heading text-3xl text-center my-8 text-[#5D4037] bg-gradient-to-r from-[#5D4037] to-[#8C3B3B] bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {t('View Wedding Photos')}
        </motion.h2>
        <div className="w-full">
        </div>

        {/* Quick Access Gallery */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-stone-200 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-hover">
              <CardContent className="p-6">
                <motion.h3
                  className="text-lg font-semibold text-center mb-6 text-stone-800"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  viewport={{ once: true }}
                >
                  {t('')}
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <motion.div 
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Camera className="w-5 h-5 text-[#8C3B3B]" />
                    </motion.div>
                    <Link to="/parvathy/gallery">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="text-[#8C3B3B] hover:text-[#6d2d2d] border-[#8C3B3B] hover:border-[#6d2d2d] font-medium">
                          {t('sisterAPhotos')}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Camera className="w-5 h-5 text-[#1B5E20]" />
                    </motion.div>
                    <Link to="/sreedevi/gallery">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="outline" className="text-[#1B5E20] hover:text-[#0d3d12] border-[#1B5E20] hover:border-[#0d3d12] font-medium">
                          {t('sisterBPhotos')}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Portal Access */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-2 border-stone-200 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-hover">
              <CardContent className="p-6">
                <motion.h3 
                  className="text-lg font-semibold text-center mb-6 text-stone-800"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.7 }}
                  viewport={{ once: true }}
                >
                  {t('portalAccess')}
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div 
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Heart className="w-5 h-5 text-stone-600" />
                    </motion.div>
                    <Link to="/couple-login">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="ghost" className="text-stone-600 hover:text-stone-800 font-medium">
                          {t('couplePortal')}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 2.0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Camera className="w-5 h-5 text-stone-600" />
                    </motion.div>
                    <Link to="/photographer-login">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="ghost" className="text-stone-600 hover:text-stone-800 font-medium">
                          {t('photographerPortal')}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 2.2 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Settings className="w-5 h-5 text-stone-600" />
                    </motion.div>
                    <Link to="/admin-login">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="ghost" className="text-stone-600 hover:text-stone-800 font-medium">
                          {t('adminPortal')}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

    </motion.div>
  );
};

export default Index;
