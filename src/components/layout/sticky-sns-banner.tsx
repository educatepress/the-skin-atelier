"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SNS_LINKS = {
  instagram: "https://www.instagram.com/dr_miyaka_skin/",
  line: "https://line.me/R/ti/p/@534uwuav",
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
          {/* 公式LINE */}
          <a
            href={SNS_LINKS.line}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="公式LINE で Dr. Miyaka とつながる"
            className="w-12 h-12 rounded-full bg-[var(--color-text-mocha)] border border-[var(--color-text-mocha)] shadow-[var(--shadow-float)] flex items-center justify-center hover:bg-[#5a5248] transition-all duration-300 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M12 2C6.48 2 2 5.64 2 10.13c0 4.02 3.55 7.39 8.35 8.03.33.07.77.22.88.5.1.26.07.66.03.92l-.14.86c-.04.26-.2 1.01.89.55 1.09-.46 5.87-3.46 8.01-5.92C21.5 13.4 22 11.83 22 10.13 22 5.64 17.52 2 12 2ZM8.09 12.71H6.1a.4.4 0 0 1-.4-.4V8.36a.4.4 0 0 1 .8 0v3.55h1.59a.4.4 0 1 1 0 .8Zm1.63-.4a.4.4 0 0 1-.8 0V8.36a.4.4 0 0 1 .8 0v3.95Zm4.13 0a.4.4 0 0 1-.72.24l-2.03-2.76v2.52a.4.4 0 0 1-.8 0V8.36a.4.4 0 0 1 .72-.24l2.03 2.76V8.36a.4.4 0 0 1 .8 0v3.95Zm2.65-2.37a.4.4 0 1 1 0 .8h-1.13v.77h1.13a.4.4 0 0 1 0 .8h-1.53a.4.4 0 0 1-.4-.4V8.36a.4.4 0 0 1 .4-.4h1.53a.4.4 0 0 1 0 .8h-1.13v.78h1.13Z" />
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
