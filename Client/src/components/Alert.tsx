// src/components/Alert.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAlert } from "../Context/Alert_context";
import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

export default function Alert() {
  const { alert, hideAlert } = useAlert();

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert, hideAlert]);

  if (!alert) return null;

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.message}
          className={`fixed left-0 right-0 w-full top-[64px] sm:top-[72px] z-40
            flex items-center justify-between px-6 py-4 shadow-lg
            ${
              alert.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          initial={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Left side with icon + message */}
          <div className="flex items-center space-x-3">
            {alert.type === "success" ? (
              <FiCheckCircle className="text-2xl" />
            ) : (
              <FiXCircle className="text-2xl" />
            )}
            <span className="font-medium text-sm md:text-base">
              {alert.message}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Undo button if undoAction exists */}
            {alert.undoAction && (
              <button
                onClick={() => {
                  alert.undoAction?.();
                  hideAlert();
                }}
                className="px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-sm font-medium"
              >
                Undo
              </button>
            )}

            {/* Close button */}
            <button
              onClick={hideAlert}
              className="text-white/90 hover:text-white text-xl"
              aria-label="Close alert"
            >
              <FiX />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}