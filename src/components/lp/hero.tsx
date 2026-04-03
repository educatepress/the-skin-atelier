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
        {/* Brand label: 0.7rem -> 11px */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-brand text-[11px] sm:text-xs tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-[var(--space-xl)]"
        >
          The Skin Atelier by Dr. Miyaka
        </motion.p>

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
          className="max-w-md mx-auto mb-[var(--space-2xl)]"
        >
          <p className="text-[13px] md:text-[1rem] leading-[2.1] text-[var(--color-text-soft)] tracking-[0.04em]">
            自らも肌荒れに悩み、
            <br className="block md:hidden" />
            遠回りをしてきたからこそ伝えたい。
            <br />
            情報に疲れた大人の肌に、
            <br />
            皮膚科学という明確な答えと、
            <br className="block md:hidden" />
            『引き算の美容医療』を。
          </p>
        </motion.div>

        {/* CTA: 機械的なコピーから情緒的なコピーへ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-[var(--space-2xl)]"
        >
          <a href="#invitation" className="btn-atelier">
            <span className="tracking-[0.1em]">毎日の美しさを育む、無料の美容情報</span>
            <span className="arrow">→</span>
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
          ※自由診療のため公的医療保険は適用されません。効果には個人差がございます。
        </motion.p>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-marble)] to-transparent" />
    </section>
  );
}
