import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface WebsiteContent {
  title: string;
  parvathy: {
    name: string;
    role: string;
    description: string;
  };
  sreedevi: {
    name: string;
    role: string;
    description: string;
  };
  weddingDate: string;
  venue: string;
  totalGuests: number;
  dressCode: string;
  giftRegistry: string;
}

interface WebsiteContextType {
  content: WebsiteContent;
  updateContent: (updates: Partial<WebsiteContent>) => void;
  updateNestedContent: (path: string, value: string) => void;
}

const defaultContent: WebsiteContent = {
  title: "Double Wedding Celebration",
  parvathy: {
    name: "Parvathy C",
    role: "Bride",
    description: "Join Parvathy's beautiful wedding celebration with traditional ceremonies and modern touches"
  },
  sreedevi: {
    name: "Sreedevi C",
    role: "Bride", 
    description: "Join Sreedevi's special wedding celebration filled with love, joy, and cherished moments"
  },
  weddingDate: "December 15, 2024",
  venue: "Grand Wedding Hall, Kerala",
  totalGuests: 300,
  dressCode: "Traditional Kerala attire preferred",
  giftRegistry: "Your presence and blessings are the greatest gift"
};

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

export const WebsiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();

  const [content, setContent] = useState<WebsiteContent>(() => {
    // Initialize state with translated content
    return {
      title: t("homeScreenTitle"),
      parvathy: {
        name: t("Parvathy C", "Parvathy C"),
        role: "Bride",
        description: t("sisterADescription")
      },
      sreedevi: {
        name: t("Sreedevi C", "Sreedevi C"),
        role: "Bride",
        description: t("sisterBDescription")
      },
      weddingDate: "December 15, 2024", // These can also be moved to translation files if needed
      venue: "Grand Wedding Hall, Kerala",
      totalGuests: 300,
      dressCode: t("dressCodeDescription"),
      giftRegistry: t("giftRegistryDescription")
    };
  });

  // Effect to update content when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setContent(prevContent => ({
        ...prevContent,
        title: t("homeScreenTitle"),
        parvathy: {
          ...prevContent.parvathy,
          name: t("Parvathy C", "Parvathy C"),
          description: t("sisterADescription")
        },
        sreedevi: {
          ...prevContent.sreedevi,
          name: t("Sreedevi C", "Sreedevi C"),
          description: t("sisterBDescription")
        },
        dressCode: t("dressCodeDescription"),
        giftRegistry: t("giftRegistryDescription")
      }));
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup listener on component unmount
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, t]);

  const updateContent = (updates: Partial<WebsiteContent>) => {
    setContent(prev => ({ ...prev, ...updates }));
  };

  const updateNestedContent = (path: string, value: string) => {
    setContent(prev => {
      const [parent, child] = path.split('.');
      const parentObj = prev[parent as keyof typeof prev] as any;
      return {
        ...prev,
        [parent]: {
          ...parentObj,
          [child]: value
        }
      };
    });
  };

  return (
    <WebsiteContext.Provider value={{ content, updateContent, updateNestedContent }}>
      {children}
    </WebsiteContext.Provider>
  );
};

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (context === undefined) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
};
