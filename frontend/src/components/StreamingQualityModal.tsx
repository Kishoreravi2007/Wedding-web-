import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export type StreamingQuality = "HD" | "4K";

export const streamingBasePrices: Record<StreamingQuality, number> = {
  HD: 999,
  "4K": 1999
};

interface StreamingQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuality: StreamingQuality;
  onSelect: (quality: StreamingQuality) => void;
}

const overlayVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const contentVariant = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 }
};

const StreamingQualityModal = ({
  isOpen,
  onClose,
  selectedQuality,
  onSelect
}: StreamingQualityModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariant}
        >
          <motion.div
            key="streaming-modal"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            variants={contentVariant}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                  Choose Streaming Quality
                </p>
                <h3 className="text-2xl font-bold text-slate-900">Live Streaming</h3>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="text-slate-500 transition hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {(["HD", "4K"] as StreamingQuality[]).map((quality) => {
                const price = streamingBasePrices[quality];
                const isActive = quality === selectedQuality;
                return (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => onSelect(quality)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-rose-500 bg-rose-50 text-rose-700 shadow-inner"
                        : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50/30"
                    }`}
                  >
                    <div>
                      <p className="text-base font-semibold">{quality} Streaming</p>
                      <p className="text-sm text-slate-500">Smooth coverage for your wedding</p>
                    </div>
                    <span className="text-lg font-bold text-slate-900">₹{price.toLocaleString("en-IN")}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-sm italic text-slate-500">
              Note: WiFi internet connection must be provided by the users.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StreamingQualityModal;

