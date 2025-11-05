import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const SisterBLayout = () => {
  return (
    <div
      className="font-sans min-h-screen text-[#1B5E20] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/sister-b-wedding-illustration.png')" }}
    >
      <div className="bg-[#E8F5E9]/50 min-h-screen">
        <main className="py-12 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <BottomNav basePath="/sreedevi" activeColor="#B8860B" />
      </div>
    </div>
  );
};

export default SisterBLayout;
