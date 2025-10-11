import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button'; // Another comment to force refresh

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div id="my-language-switcher" className="fixed top-4 right-4 z-50">
      <Button
        className="w-10 h-10 rounded-full p-0 flex items-center justify-center text-lg font-bold bg-white/80 backdrop-blur-sm hover:bg-white text-slate-900"
        onClick={() => changeLanguage(i18n.language === 'en' ? 'ml' : 'en')}
      >
        {i18n.language === 'en' ? 'മ' : 'E'}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
