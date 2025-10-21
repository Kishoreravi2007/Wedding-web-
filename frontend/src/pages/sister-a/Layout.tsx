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
