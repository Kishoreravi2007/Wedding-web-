import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useTranslation } from "react-i18next";

const SisterALayout = () => {
  const { t } = useTranslation();
  return (
    <div
      className="font-sans min-h-screen text-[#8C3B3B] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://storage.googleapis.com/sub-projects-483107-wedding-frontend/sister-a-background.png')" }}
    >
      <div className="bg-[#FFF8E1]/50 min-h-screen">
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <BottomNav basePath="/parvathy" activeColor="#D4AF37" showVideo={false} />
      </div>
    </div>
  );
};

export default SisterALayout;
