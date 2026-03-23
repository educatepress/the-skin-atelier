"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// TODO: 本番URLに差し替え
const SNS_LINKS = {
  // x: "https://x.com/dr_miyaka_skin", // TODO: Xアカウント作成後に有効化
  instagram: "https://www.instagram.com/dr_miyaka_skin/",
};

export default function StickySnsBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
        >
          {/* X (Twitter) */}
          <a
            href="https://x.com/dr_miyaka"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[var(--color-marble-vein)] shadow-[var(--shadow-float)] flex items-center justify-center hover:bg-[var(--color-champagne-light)] hover:border-[var(--color-pink-gold)] transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-text-mocha)]">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href={SNS_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[var(--color-marble-vein)] shadow-[var(--shadow-float)] flex items-center justify-center hover:bg-[var(--color-champagne-light)] hover:border-[var(--color-pink-gold)] transition-all duration-300 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-text-mocha)] group-hover:text-[var(--color-text-mocha)] transition-colors"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
