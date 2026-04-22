"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Marble background — Stitch large radial + subtle veining */}
      <div className="absolute inset-0 bg-[#FDFCFA]">
        {/* Marble vein texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 40%, rgba(232,211,201,0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 75% 25%, rgba(197,212,192,0.12) 0%, transparent 45%),
              radial-gradient(ellipse at 55% 75%, rgba(245,230,216,0.18) 0%, transparent 50%),
              radial-gradient(ellipse at 15% 80%, rgba(212,184,169,0.1) 0%, transparent 40%)
            `,
          }}
        />
        {/* Central radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(253,252,250,1)_100%)]" />
      </div>

      {/* Thin decorative line — top (below header) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-pink-gold)] to-transparent opacity-30" />

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24"
      >
        {/* Main catch copy */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(1.6rem,4.5vw,3rem)] leading-[1.5] tracking-[0.08em] text-[var(--color-text-mocha)] font-normal mb-[var(--space-lg)]"
        >
          もう、スキンケアで
          <br className="md:hidden" />
          迷わない。
        </motion.h1>

        {/* Sub copy — generous line height for readability */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg mx-auto mb-[var(--space-2xl)]"
        >
          <p className="text-[1rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
            <span className="inline-block">自らも肌荒れに悩み、</span>
            <span className="inline-block">遠回りをしてきたからこそ</span>
            <span className="inline-block">伝えたい。</span>
            <br className="hidden md:block" />
            <span className="inline-block">情報に疲れた大人の肌に、</span>
            <br className="hidden md:block" />
            <span className="inline-block">皮膚科学という明確な答えと、</span>
            <span className="inline-block">『引き算の美容医療』を。</span>
          </p>
        </motion.div>

        {/* CTA: Instagramフォロー誘導 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mb-[var(--space-2xl)] flex flex-col items-center gap-4"
        >
          <a
            href="https://www.instagram.com/dr_miyaka_skin/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-atelier whitespace-nowrap inline-flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span className="tracking-[0.1em]">Instagramで美肌の知恵を受け取る</span>
            <span className="arrow ml-1">→</span>
          </a>
          <a href="/blog" className="text-[0.75rem] tracking-[0.08em] text-[var(--color-text-muted)] hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500">
            美容ジャーナルを読む
          </a>
        </motion.div>

        {/* Vertical divider — moved below CTA for better flow */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="w-[1px] h-16 md:h-20 bg-[var(--color-text-mocha)] opacity-15 mx-auto origin-top"
        />

        {/* Medical disclaimer: 11px & opacity-70 で誠実にリスクを開示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-[11px] text-[var(--color-text-muted)] mt-[var(--space-xl)] tracking-[0.03em] opacity-70"
        >
          ※当サイトの情報は美容・健康に関する一般的な知識を提供するものであり、医療行為を代替するものではありません。
        </motion.p>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-marble)] to-transparent" />
    </section>
  );
}
