"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Treatments", href: "#treatments" },
  { label: "Journal", href: "#blog" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled
          ? "glass-marble py-3 shadow-[var(--shadow-silk)] border-b border-[var(--color-marble-vein)]"
          : "bg-white/40 backdrop-blur-xl py-5"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="group">
          <p className="font-brand text-[0.65rem] tracking-[0.3em] text-[var(--color-text-mocha)] uppercase group-hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300">
            The Skin Atelier
          </p>
          <p className="font-brand text-[0.5rem] tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
            by Dr. Miyaka
          </p>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-[var(--space-xl)]">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-brand text-[0.65rem] tracking-[0.2em] text-[var(--color-text-soft)] uppercase link-underline hover:text-[var(--color-text-mocha)] transition-colors duration-300"
            >
              {item.label}
            </a>
          ))}

          {/* CTA */}
          <a
            href="#invitation"
            className="font-brand text-[0.7rem] tracking-[0.18em] text-[var(--color-text-mocha)] uppercase px-6 py-2 border border-[var(--color-pink-gold)] hover:bg-[var(--color-champagne-light)] transition-all duration-500"
          >
            LINE予約
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col gap-[5px] p-2"
          aria-label="メニュー"
        >
          <motion.span
            animate={isMobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1px] bg-[var(--color-text-mocha)]"
          />
          <motion.span
            animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-[1px] bg-[var(--color-text-mocha)]"
          />
          <motion.span
            animate={isMobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-[1px] bg-[var(--color-text-mocha)]"
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden glass-marble"
          >
            <div className="px-6 py-[var(--space-xl)] flex flex-col gap-[var(--space-lg)]">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-brand text-[0.75rem] tracking-[0.2em] text-[var(--color-text-soft)] uppercase"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#invitation"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-atelier justify-center mt-[var(--space-sm)]"
              >
                LINE予約
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
