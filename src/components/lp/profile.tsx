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
                  src="/images/profile/dr-miyaka-3.jpg"
                  alt="Dr. Miyaka"
                  width={500}
                  height={625}
                  className="w-full h-full object-cover transition-all duration-[2000ms] brightness-105 hover:scale-[1.02]"
                />
              </div>
            </div>
          </FadeIn>

          {/* Right: Bio only — no credentials */}
          <FadeIn delay={0.2} className="w-full md:w-7/12 space-y-[var(--space-lg)]">
            <div>
              <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-[var(--space-xs)]">
                About
              </p>
              <h3 className="text-[1.8rem] tracking-[0.1em] text-[var(--color-text-mocha)] leading-[1.4]">
                みやか先生
                <span className="block text-[0.95rem] tracking-[0.05em] text-[var(--color-text-soft)] mt-2">
                  Dr. Miyaka
                </span>
              </h3>
            </div>

            <div className="divider-gold" />

            <div className="space-y-[var(--space-lg)]">
              
              {/* 略歴 */}
              <div>
                <h4 className="font-brand text-[0.85rem] tracking-[0.15em] text-[var(--color-text-mocha)] font-medium mb-[var(--space-sm)]">
                  略歴
                </h4>
                <ul className="text-[0.9rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.03em] space-y-1">
                  <li>・ 札幌医科大学医学部 卒業</li>
                  <li>・ 日本赤十字社医療センター 初期研修修了</li>
                  <li>・ 都内美容皮膚科にて勤務、院長などを歴任</li>
                </ul>
              </div>

              {/* 資格・所属学会 */}
              <div>
                <h4 className="font-brand text-[0.85rem] tracking-[0.15em] text-[var(--color-text-mocha)] font-medium mb-[var(--space-sm)]">
                  資格・所属学会
                </h4>
                <ul className="text-[0.9rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.03em] space-y-1">
                  <li>・ 日本美容皮膚科学会 会員</li>
                  <li>・ アラガン・ジャパン社 ボトックスビスタ® 認定医</li>
                </ul>
              </div>

              {/* 専門・得意分野 */}
              <div>
                <h4 className="font-brand text-[0.85rem] tracking-[0.15em] text-[var(--color-text-mocha)] font-medium mb-[var(--space-sm)]">
                  専門・得意分野
                </h4>
                <ul className="text-[0.9rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.03em] space-y-4">
                  <li>
                    <span className="block text-[var(--color-text-mocha)] font-medium">・ 肌育治療（Skin Quality Improvement）</span>
                    <span className="block text-[0.85rem] mt-1">
                      最新の美容機器を駆使し、<br className="md:hidden" />
                      肌の土台から<br className="md:hidden" />
                      健やかさを引き出す治療。
                    </span>
                  </li>
                  <li>
                    <span className="block text-[var(--color-text-mocha)] font-medium">・ ボトックス注入（Facial Contouring）</span>
                    <span className="block text-[0.85rem] mt-1">
                      自然な表情を保ちつつ、<br className="md:hidden" />
                      シワやたるみを改善する<br className="md:hidden" />
                      精密な注入。
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
