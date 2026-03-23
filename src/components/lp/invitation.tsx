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

        {/* SNS Follow Buttons (LINE準備中のため一時的にSNSフォローに差し替え) */}
        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* X (Twitter) */}
            <motion.a
              href="https://x.com/dr_miyaka"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[var(--color-text-mocha)] text-white px-10 py-4 font-brand text-[0.75rem] tracking-[0.2em] uppercase hover:bg-[var(--color-text-soft)] transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X をフォロー
            </motion.a>

            {/* Instagram */}
            <motion.a
              href="https://www.instagram.com/dr.miyaka/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-[var(--color-pink-gold)] text-[var(--color-text-mocha)] px-10 py-4 font-brand text-[0.75rem] tracking-[0.2em] uppercase hover:bg-[var(--color-champagne-light)] transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              Instagram をフォロー
            </motion.a>
          </div>
          <p className="text-[0.75rem] text-[var(--color-text-muted)] tracking-[0.1em] mt-[var(--space-md)]">
            美容医療の正しい知識を毎日お届け中
          </p>
        </FadeIn>

        {/* Trust signals */}
        <FadeIn delay={0.4}>
          <div className="mt-[var(--space-2xl)] flex flex-wrap justify-center gap-[var(--space-xl)] text-[0.7rem] text-[var(--color-text-muted)] tracking-[0.08em]">
            <span>✦ エビデンスに基づく情報</span>
            <span>✦ 医師監修コンテンツ</span>
            <span>✦ 毎日更新</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
