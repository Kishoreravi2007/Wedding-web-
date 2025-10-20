import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useTranslation } from "react-i18next";

const SisterALayout = () => {
  const { t } = useTranslation();
  return (
    <div
      className="font-sans min-h-screen text-[#8C3B3B] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/sister-a-background.png')" }}
    >
      <div className="bg-[#FFF8E1]/50 min-h-screen">
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="relative w-full h-64 mb-8 overflow-hidden rounded-lg shadow-lg">
            <img
              src="/sister-a-schedule-banner.jpg"
              alt={t('sisterAScheduleBanner')}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4">
              <p className="text-white text-sm md:text-base mb-2 font-sans uppercase tracking-widest">
                {t('weAreGettingMarried')}
              </p>
              <h1 className="font-heading text-5xl md:text-7xl text-center text-white font-bold mb-4">
                {t('sisterAAndPartner')}
              </h1>
              <p className="text-white text-sm md:text-base mb-2 font-sans uppercase tracking-widest">
                {t('saveTheDate')}
              </p>
              <p className="text-white text-lg md:text-xl mb-6 font-serif">
                {t('sisterADate')}
              </p>
            </div>
          </div>
          <Outlet />
        </main>
        <div className="fixed bottom-20 left-4 text-[#8C3B3B] text-sm bg-white p-2 rounded z-20">
          <a href="mailto:help.weddingweb@gmail.com" className="underline">help.weddingweb@gmail.com</a>
        </div>
        <BottomNav basePath="/parvathy" activeColor="#D4AF37" />
      </div>
    </div>
  );
};

export default SisterALayout;
