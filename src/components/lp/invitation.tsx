"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/common/fade-in";

export default function Invitation() {
  return (
    <section
      id="invitation"
      className="section-padding relative overflow-hidden bg-white"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-marble)] via-white to-[var(--color-marble)]" />

      {/* Radial glow — Stitch style */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-pink-gold)] opacity-[0.08] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Icon */}
        <FadeIn>
          <div className="text-[var(--color-text-muted)] opacity-30 mb-[var(--space-lg)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="mx-auto">
              <rect x="3" y="11" width="18" height="11" rx="0" ry="0" />
              <path d="m3 11 9-7 9 7" />
            </svg>
          </div>
        </FadeIn>

        {/* Title — Stitch style but silk tone compliant */}
        <FadeIn delay={0.1}>
          <h2 className="font-brand text-[clamp(1.8rem,4vw,3rem)] tracking-[0.15em] text-[var(--color-text-mocha)] mb-[var(--space-md)] leading-[1.5]">
            Invitation to
            <br />
            <span className="italic">&ldquo;The Skin Atelier&rdquo;</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="divider-gold mx-auto mb-[var(--space-xl)]" />
        </FadeIn>

        {/* Body — silk tone compliant (NOT elitist) */}
        <FadeIn delay={0.2}>
          <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.03em] mb-[var(--space-md)]">
            心地よく美しさを育みたい方へ、
            <br />
            「公式LINE」を先行でご案内しております。
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-muted)] tracking-[0.03em] mb-[var(--space-xl)]">
            今のあなたに必要なケアがわかる
            <br />
            「Dr.みやか パーソナル美肌診断」や、
            <br />
            美容医療の正しい知識をお届けする限定コンテンツを
            <br />
            ささやかなギフトとしてお届けしております。
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em] mb-[var(--space-xl)]">
            ぜひ、新しいご自身と出会う扉を開いてみてください。
          </p>
        </FadeIn>

        {/* CTA Button — Solid primary action matching Marketing best practice */}
        <FadeIn delay={0.35}>
          <motion.a
            href="#"
            className="inline-block bg-[var(--color-text-mocha)] text-white px-10 md:px-16 py-5 font-brand text-[0.75rem] tracking-[0.2em] uppercase hover:bg-[var(--color-text-soft)] hover:text-white transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            公式LINEを追加して無料美肌診断へ
          </motion.a>
          <p className="text-[0.75rem] text-[var(--color-text-muted)] tracking-[0.1em] mt-[var(--space-md)]">
            無料パーソナル美肌診断つき
          </p>
        </FadeIn>

        {/* Trust signals */}
        <FadeIn delay={0.4}>
          <div className="mt-[var(--space-2xl)] flex flex-wrap justify-center gap-[var(--space-xl)] text-[0.7rem] text-[var(--color-text-muted)] tracking-[0.08em]">
            <span>✦ 完全無料</span>
            <span>✦ いつでも解除可能</span>
            <span>✦ 個人情報厳守</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
