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
            SNSにて美容医療の正しい知識や
            <br />
            日々のスキンケアのヒントをお届けしています。
          </p>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-muted)] tracking-[0.03em] mb-[var(--space-xl)]">
            あなたの「美しさのかかりつけ医」として、
            <br />
            日常に寄り添う情報を丁寧にお届けいたします。
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em] mb-[var(--space-xl)]">
            ぜひ、お気軽にフォローしてみてください。
          </p>
        </FadeIn>

        {/* Official LINE CTA */}
        <FadeIn delay={0.35}>
          <div className="flex flex-col items-center justify-center gap-4">
            <motion.a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#06C755] text-white px-12 py-5 font-brand text-[0.85rem] tracking-[0.1em] rounded-full hover:bg-[#05b34c] transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.5 9.8c0-4.3-4.3-7.8-9.6-7.8s-9.6 3.5-9.6 7.8c0 3.8 3.4 7.1 8 7.7.4.1.9.2 1 .5.1.3 0 .7 0 .7l-.2 1.2c0 .1-.1.4.3.6.4.2.9-.1 1-.2 1.1-.9 6.2-5 6.2-5 .2-.2.3-.4.3-.6.1-1.6 2.6-3 2.6-4.9z"/>
              </svg>
              公式LINEで無料相談・予約する
            </motion.a>
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)] tracking-[0.1em] mt-[var(--space-md)]">
            パーソナル美肌診断を実施中
          </p>
        </FadeIn>

        {/* Trust signals */}
        <FadeIn delay={0.4}>
          <div className="mt-[var(--space-2xl)] flex flex-wrap justify-center gap-[var(--space-xl)] text-[11px] text-[var(--color-text-muted)] tracking-[0.08em]">
            <span>✦ エビデンスに基づく情報</span>
            <span>✦ 医師監修コンテンツ</span>
            <span>✦ 毎日更新</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
