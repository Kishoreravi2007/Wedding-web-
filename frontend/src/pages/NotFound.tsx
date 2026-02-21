import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fdf8e9] font-sans p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl w-full bg-white rounded-[40px] shadow-sm flex flex-col md:flex-row items-center justify-between p-8 md:p-20 relative gap-12"
      >
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left z-10">
          <span className="text-gray-900 text-lg font-medium tracking-tight block mb-2">ERROR 404</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111318] mb-6 tracking-tight leading-tight">
            Page not found!
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-10 max-w-md mx-auto md:mx-0 leading-relaxed font-medium">
            The page you're trying to access doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="bg-[#6372c1] hover:bg-[#5260a1] text-white px-10 h-14 rounded-2xl text-lg font-bold shadow-md hover:shadow-lg transition-all hover:scale-105">
              Go Back Home
            </Button>
          </Link>
        </div>

        {/* Illustration (Mammoth) */}
        <div className="flex-1 relative">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* 
                            Note: We'll use a placeholder image for the mammoth since 
                            image generation is at capacity. The user can replace this 
                            with the desired path 'not_found_mammoth.png' later.
                        */}
            <img
              src="https://img.freepik.com/free-vector/404-error-with-cute-animal-concept-illustration_114360-1931.jpg"
              alt="404 Illustration"
              className="w-full max-w-md mx-auto rounded-3xl"
            />

            {/* Floating elements like snow/confetti if desired */}
            <div className="absolute -top-10 -right-10 w-20 h-20 opacity-20 pointer-events-none">
              {/* Decorative shapes */}
              <div className="w-4 h-4 rounded-full bg-blue-300 absolute top-0 left-0 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-rose-300 absolute bottom-0 right-0 animate-bounce"></div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#fdf8e9] rounded-full -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#fdf8e9] rounded-full -ml-16 -mb-16 opacity-50 pointer-events-none"></div>
      </motion.div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-400 font-medium tracking-wide">
        &copy; 2026 WeddingWeb AI Inc. | Modern Event Solutions
      </p>
    </div>
  );
};

export default NotFound;
