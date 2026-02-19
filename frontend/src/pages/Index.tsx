import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Heart, Gift, Shirt, Camera } from "lucide-react";
import { useWebsite } from "@/contexts/WebsiteContext";
import { motion, Easing } from "framer-motion";
import { useTranslation } from "react-i18next";
const Index = () => {
  const { content } = useWebsite();
  const { t } = useTranslation();

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
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-wedding.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Overlay to make text more readable */}
      <div className="absolute inset-0 bg-white/0" />

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

      <motion.div className="text-center mb-12 flex flex-col items-center justify-center gap-4 relative z-10" variants={itemVariants}>
        <motion.h1
          className="font-heading text-4xl md:text-7xl bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] bg-clip-text text-transparent drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {t('homeScreenTitle')}
        </motion.h1>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12 relative z-10" variants={containerVariants}>
        <motion.div variants={cardVariants}>
          <Link to="/parvathy" className="group">
            <motion.div
              whileHover="hover"
              variants={cardVariants}
            >
              <Card className="text-center cursor-hover border-2 border-transparent hover:border-[#D4AF37] bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-500 relative overflow-hidden">
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
                      <CardTitle className="font-heading text-3xl text-[#FFD700] group-hover:text-[#FFA500] transition-colors duration-300 drop-shadow-lg">
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
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Link to="/sreedevi" className="group">
            <motion.div
              whileHover="hover"
              variants={cardVariants}
            >
              <Card className="text-center cursor-hover border-2 border-transparent hover:border-[#B8860B] bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-500">
                <CardHeader className="pb-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardTitle className="font-heading text-3xl text-[#FFD700] group-hover:text-[#FFA500] transition-colors duration-300 drop-shadow-md">
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
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full max-w-4xl pb-8 relative z-10"
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
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
            <Card className="bg-white/15 backdrop-blur-sm border-2 border-stone-200 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-hover">
              <CardContent className="p-6">
                <motion.h3
                  className="text-lg font-semibold text-center mb-6 text-[#FFD700] drop-shadow-md"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.7 }}
                  viewport={{ once: true }}
                >
                  {t('portalAccess')}
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.8 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-white/20"
                    >
                      <img src="/logo.png" alt="WeddingWeb" className="w-5 h-5 object-contain" />
                    </motion.div>
                    <Link to="/couple-login">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="ghost" className="text-[#FFD700] hover:text-[#FFA500] font-medium bg-white/10 hover:bg-white/20 backdrop-blur-sm drop-shadow-md">
                          {t('couplePortal')}
                        </Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-center gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 2.0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.3, rotate: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Camera className="w-5 h-5 text-[#FFD700]" />
                    </motion.div>
                    <Link to="/photographer-login">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button variant="ghost" className="text-[#FFD700] hover:text-[#FFA500] font-medium bg-white/10 hover:bg-white/20 backdrop-blur-sm drop-shadow-md">
                          {t('photographerPortal')}
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
