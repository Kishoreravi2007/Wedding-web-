import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const EngagementVideo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4"
    >
      <h1 className="text-3xl font-bold text-center mb-8">{t('engagementVideo')}</h1>
      <div className="max-w-3xl mx-auto text-center text-2xl font-semibold text-gray-700">
        {t('willBeReleasedSoon')}
      </div>
    </motion.div>
  );
};

export default EngagementVideo;
