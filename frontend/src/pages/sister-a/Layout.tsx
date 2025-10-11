import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const SisterALayout = () => {
  return (
    <div
      className="font-sans min-h-screen text-[#8C3B3B] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/sister-a-background.png')" }}
    >
      <div className="bg-[#FFF8E1]/50 min-h-screen">
        <main className="pb-20 md:pb-0">
          <Outlet />
        </main>
        <BottomNav basePath="/parvathy" activeColor="#D4AF37" />
      </div>
    </div>
  );
};

export default SisterALayout;
