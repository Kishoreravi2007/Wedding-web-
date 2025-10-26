import PhotoBooth from "@/components/PhotoBooth";

const SisterAPhotoBooth = () => {
  return (
    <PhotoBooth 
      sister="a"
      primaryColor="#8C3B3B"
      buttonClass="bg-[#8C3B3B] hover:bg-[#6d2d2d] text-white"
      overlayImageSrc="/couple-frame-placeholder.png"
      weddingId="parvathy-wedding" // Pass the weddingId
    />
  );
};

export default SisterAPhotoBooth;
