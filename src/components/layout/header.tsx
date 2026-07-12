"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navItems = [
  { label: "Philosophy", href: "/philosophy" },
  { label: "Journal", href: "/blog" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // モバイルメニュー展開中は背後のスクロールをロックする
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isScrolled
          ? "glass-marble py-3 shadow-[var(--shadow-silk)] border-b border-[var(--color-marble-vein)]"
          : "bg-[#FDFCFA]/95 backdrop-blur-xl py-5"
      }`}
    >
      <nav className="relative z-10 max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/#hero" className="group">
          <p className="font-brand text-[0.8rem] tracking-[0.3em] text-[var(--color-text-mocha)] uppercase group-hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300">
            The Skin Atelier
          </p>
          <p className="font-brand text-[11px] tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
            by Dr. Miyaka
          </p>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-[var(--space-xl)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-brand text-[0.75rem] tracking-[0.2em] text-[var(--color-text-soft)] uppercase link-underline hover:text-[var(--color-text-mocha)] transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}

          {/* CTA — LINE準備中のためSNSリンクに差し替え */}
          <a
            href="https://www.instagram.com/dr_miyaka_skin/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-brand text-[0.75rem] tracking-[0.18em] text-[var(--color-text-mocha)] uppercase px-6 py-2.5 border border-[var(--color-pink-gold)] hover:bg-[var(--color-champagne-light)] transition-all duration-500"
          >
            Follow
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

    </header>

    {/* Mobile 全画面メニュー — ヘッダー外に置くことで position:fixed が
        ヘッダーの backdrop-filter 含有ブロックに閉じ込められず、全画面を確実に覆う */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-[#FDFCFA] flex flex-col items-center justify-center gap-[var(--space-xl)]"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-brand text-[1rem] tracking-[0.3em] text-[var(--color-text-mocha)] uppercase"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-4 mt-[var(--space-md)] w-64">
            <a
              href="https://www.instagram.com/dr_miyaka_skin/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-atelier justify-center"
            >
              Follow on Instagram
            </a>
            <a
              href="https://line.me/R/ti/p/@534uwuav"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-atelier justify-center"
            >
              公式LINE を追加
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
