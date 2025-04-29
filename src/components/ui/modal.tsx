import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import Button from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  withPanel?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnClickOutside = true,
  showCloseButton = true,
  withPanel = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, closeOnClickOutside]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      // Add styles to prevent scrolling but maintain position
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position when modal closes
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }

    return () => {
      // Clean up in case component unmounts while modal is open
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      onClose();
    }, 200);
  };

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    full: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm"
          />

          {withPanel ? (
            <motion.div
              ref={modalRef}
              className={`${sizeClasses[size]} w-full bg-neutral-900 rounded-xl border border-neutral-700 overflow-hidden z-10`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                  {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                  {showCloseButton && (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-8 h-8 !p-0 flex items-center justify-center rounded-full"
                      onClick={handleClose}
                      icon={<X className="w-5 h-5" />}
                    />
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="p-4 border-t border-neutral-700 flex justify-end gap-2">
                  {footer}
                </div>
              )}
            </motion.div>
          ) : (
            <>{children}</>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
