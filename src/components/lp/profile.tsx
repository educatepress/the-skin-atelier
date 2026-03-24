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
                  className="w-full h-full object-cover max-md:grayscale-0 md:grayscale md:hover:grayscale-0 transition-all duration-[2000ms] brightness-105"
                />
              </div>
            </div>
          </FadeIn>

          {/* Right: Bio only — no credentials */}
          <FadeIn delay={0.2} className="w-full md:w-7/12 space-y-[var(--space-lg)]">
            <div>
              <p className="font-brand text-[0.7rem] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-[var(--space-xs)]">
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

            <div className="space-y-[var(--space-md)]">
              <p className="text-[0.95rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.03em]">
                美容皮膚科医として診療を続ける中で、外側のケアだけでなく、
                身体の内側（分子栄養学）からのアプローチが肌の根本的な変化に繋がると実感。
              </p>
              <p className="text-[0.95rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.03em]">
                このサイトでは、肌と美容について、医師として正直な目線でお届けしています。
                難しい情報をわかりやすく、そして飾らずに。
              </p>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
