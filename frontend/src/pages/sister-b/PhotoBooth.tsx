import PhotoBooth from "@/components/PhotoBooth";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext"; // Import the hook

const SisterBPhotoBooth = () => {
  const { goToNextTrack } = useMusicPlayer(); // Get the goToNextTrack function from context

  // Updated function to call the actual goToNextTrack from the context
  const handlePlayNextTrack = () => {
    console.log("Sreedevi wedding context detected. Calling goToNextTrack...");
    if (goToNextTrack) {
      goToNextTrack();
    } else {
      console.error("goToNextTrack function not available from MusicPlayerContext.");
    }
  };

  return (
    <PhotoBooth
      primaryColor="#1B5E20"
      buttonClass="bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
      overlayImageSrc="/couple-frame-placeholder.png"
      weddingId="sreedevi-wedding" // Pass the weddingId
      galleryPath="/sister-b-gallery"
      playNextTrack={handlePlayNextTrack} // Pass the actual callback function
    />
  );
};

export default SisterBPhotoBooth;
