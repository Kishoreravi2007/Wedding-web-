import PhotoGallerySimple from '@/components/PhotoGallery-simple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, Easing } from 'framer-motion';
import { Camera, Heart, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PhotoGalleryPageProps {
  sister: 'a' | 'b';
}

const PhotoGalleryPage = ({ sister }: PhotoGalleryPageProps) => {
  const { t } = useTranslation();
  // Determine theme colors based on sister
  const themeColors = sister === 'a'
    ? {
        primary: '#8C3B3B',
        accent: '#D4AF37',
        bg: 'bg-[#FFF8E1]',
        text: 'text-[#8C3B3B]',
        activeColor: '#D4AF37'
      }
    : {
        primary: '#1B5E20',
        accent: '#B8860B',
        bg: 'bg-[#E8F5E9]',
        text: 'text-[#1B5E20]',
        activeColor: '#B8860B'
      };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
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
        duration: 0.6,
        ease: "easeOut" as Easing
      }
    }
  };

  // Both sisters now have galleries enabled
  const galleryPath = sister === 'a' ? '/sister-a-gallery' : '/sister-b-gallery';
  const galleryTitle = sister === 'a' ? "Parvathy's Wedding Gallery" : "Sreedevi's Wedding Gallery";

  return (
    <motion.div
      className={`font-sans ${themeColors.bg} min-h-screen ${themeColors.text} pb-20`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: `${themeColors.primary}20` }}
          >
            <Camera className="w-8 h-8" style={{ color: themeColors.primary }} />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: themeColors.primary }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {galleryTitle}
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Browse and download your favorite moments from the wedding celebrations
          </motion.p>
        </motion.div>

        {/* Photo Gallery */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl" style={{ color: themeColors.primary }}>
                Wedding Memories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoGallerySimple galleryPath={galleryPath} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PhotoGalleryPage;
