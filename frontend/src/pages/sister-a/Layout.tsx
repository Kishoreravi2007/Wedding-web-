import { Outlet } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

const SisterALayout = () => {
  const { t } = useTranslation();
  const { setWeddingMusic } = useMusicPlayer();

  useEffect(() => {
    setWeddingMusic('/wedding-music.mp3');
    // Optional: Reset on unmount if we don't want it to persist at all elsewhere
    // return () => setWeddingMusic(null);
  }, [setWeddingMusic]);

  return (
    <div
      className="font-sans min-h-screen text-[#8C3B3B] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/sister-a-background.png')" }}
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
