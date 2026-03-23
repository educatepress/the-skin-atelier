"use client";

import Image from "next/image";
import FadeIn from "@/components/common/fade-in";

export default function Profile() {
  return (
    <section id="profile" className="section-padding relative bg-white border-t border-[var(--color-marble-vein)]">
      <div className="max-w-[960px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          
          {/* Left: Portrait */}
          <FadeIn delay={0.1} className="w-full md:w-5/12">
            <div className="aspect-[4/5] overflow-hidden bg-[var(--color-marble-warm)] relative p-4">
              <div className="absolute inset-0 border border-[var(--color-pink-gold)] m-4 opacity-30" />
              <div className="w-full h-full bg-[var(--color-surface)] relative overflow-hidden">
                <Image
                  src="/images/philosophy-portrait.png" // 仮画像（後で白衣の宣材写真等に差し替え）
                  alt="Dr. Miyaka Portrait"
                  width={500}
                  height={625}
                  className="w-full h-full object-cover max-md:grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-[2000ms] brightness-105"
                />
              </div>
            </div>
          </FadeIn>

          {/* Right: Credentials */}
          <FadeIn delay={0.2} className="w-full md:w-7/12 space-y-[var(--space-lg)]">
            <div>
              <p className="font-brand text-[0.7rem] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-[var(--space-xs)]">
                Medical Director
              </p>
              <h3 className="text-[1.8rem] tracking-[0.1em] text-[var(--color-text-mocha)] leading-[1.4]">
                Dr. みやか
                <span className="block text-[0.95rem] tracking-[0.05em] text-[var(--color-text-soft)] mt-2">
                  Miyaka Sato, M.D.
                </span>
              </h3>
            </div>

            <div className="divider-gold" />

            {/* Dummy Bio (to be written by Doctor) */}
            <div className="space-y-[var(--space-md)]">
              <p className="text-[0.95rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.03em]">
                ここに院長ご自身による経歴・実績のサマリーが入ります（仮テキスト）。長年の皮膚科診療の中で、外側からのアプローチだけでなく、内側（分子栄養学）からのケアの重要性を痛感。
              </p>
              <p className="text-[0.95rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.03em]">
                数多くの患者様の肌トラブルと向き合ってきた経験から、「削る・不自然に埋める」美容医療ではなく、本質的な透明感を引き立てる「育てる美容医療」を提唱。
              </p>
            </div>

            {/* Credentials List */}
            <div className="pt-[var(--space-md)] mt-[var(--space-md)] border-t border-[var(--color-marble-vein)]">
              <ul className="space-y-3">
                <li className="flex items-start gap-4 text-[0.9rem] text-[var(--color-text-mocha)] tracking-[0.03em]">
                  <span className="text-[var(--color-pink-gold-deep)] text-[0.75rem] mt-1 shrink-0">✦</span>
                  <span>日本美容皮膚科学会 所属</span>
                </li>
                <li className="flex items-start gap-4 text-[0.9rem] text-[var(--color-text-mocha)] tracking-[0.03em]">
                  <span className="text-[var(--color-pink-gold-deep)] text-[0.75rem] mt-1 shrink-0">✦</span>
                  <span>臨床分子栄養医学研究会 認定医（ダミー）</span>
                </li>
                <li className="flex items-start gap-4 text-[0.9rem] text-[var(--color-text-mocha)] tracking-[0.03em]">
                  <span className="text-[var(--color-pink-gold-deep)] text-[0.75rem] mt-1 shrink-0">✦</span>
                  <span>アラガン社認定 ボトックス・ヒアルロン酸施注医（ダミー）</span>
                </li>
              </ul>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
