"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import FadeIn from "@/components/common/fade-in";

export default function Philosophy() {
  return (
    <section
      id="philosophy"
      className="section-padding relative bg-[var(--color-marble)] overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        {/* 2-column layout — Stitch VOGUE editorial style */}
        <div className="flex flex-col md:flex-row items-start gap-16 md:gap-24">
          {/* Left column: Text */}
          <div className="flex-1 space-y-[var(--space-xl)] order-2 md:order-1">
            {/* Title with left border accent */}
            <FadeIn>
              <div className="border-l-2 border-[var(--color-pink-gold)] pl-[var(--space-lg)] py-[var(--space-sm)]">
                <h2 className="text-[clamp(1.4rem,3vw,2.2rem)] leading-[1.6] tracking-[0.08em] text-[var(--color-text-mocha)] font-medium">
                  肌の悩みを知る私だからこそ、
                  <br />
                  伝えられることがあります。
                </h2>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="font-brand text-[0.75rem] tracking-[0.3em] text-[var(--color-text-muted)] uppercase">
                A Message from the Doctor
              </p>
            </FadeIn>

            {/* Story body */}
            <FadeIn delay={0.2}>
              <div className="space-y-[var(--space-lg)] text-[var(--color-text-soft)] leading-[2.3]">
                <p className="text-[0.95rem] tracking-[0.03em]">
                  10代の頃、私はニキビに悩み、<br className="md:hidden" />
                  自分の肌に強いコンプレックスを<br className="md:hidden" />持っていました。<br className="hidden md:block" />
                  鏡を見るのが辛かったあの頃、<br className="md:hidden" />
                  私自身も一人の患者でした。
                </p>
                <p className="text-[0.95rem] tracking-[0.03em]">
                  しかし、その経験があったからこそ、<br className="md:hidden" />
                  私は美容医療の専門家として<br className="hidden md:block" />
                  患者様の悩みに寄り添いたいと<br className="md:hidden" />
                  強く願うようになりました。
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="space-y-[var(--space-lg)] text-[var(--color-text-soft)] leading-[2.3]">
                <p className="text-[0.95rem] tracking-[0.03em]">
                  美容医療は魔法ではありません。<br className="md:hidden" />
                  しかし、毎日のコツコツとした積み重ねに、<br className="md:hidden" />
                  肌は必ず応えてくれます。
                </p>
                <p className="text-[0.95rem] tracking-[0.03em]">
                  私自身、適切な治療と<br className="md:hidden" />
                  スキンケアを10年継続したことで、<br className="hidden md:block" />
                  今ではノーファンデーションで過ごせる肌を<br className="md:hidden" />
                  手に入れることができました。
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="space-y-[var(--space-lg)] text-[var(--color-text-soft)] leading-[2.3]">
                <p className="text-[0.95rem] tracking-[0.03em]">
                  育児や仕事など、<br className="md:hidden" />女性の毎日は多忙を極めます。<br className="md:hidden" />
                  けれど、肌の老化もまた待ってはくれません。<br className="hidden md:block" />
                  完璧を目指さなくても大丈夫です。<br className="md:hidden" />
                  できる範囲で、<br className="md:hidden" />今日からエイジングケアを始めてみませんか？
                </p>
              </div>
            </FadeIn>

            {/* Pull quote */}
            <FadeIn delay={0.5} className="my-[var(--space-2xl)]">
              <div className="py-[var(--space-lg)] px-[var(--space-xl)] border-l border-[var(--color-pink-gold)] bg-gradient-to-r from-[var(--color-champagne-light)] to-transparent">
                <p className="text-[1rem] leading-[2.2] text-[var(--color-text-mocha)] tracking-[0.04em] italic font-medium">
                  「10年後の自分を好きになれるよう、<br className="md:hidden" />その一歩を全力でサポートさせていただきます。」
                </p>
              </div>
            </FadeIn>

            {/* Signature — real handwritten image */}
            <FadeIn delay={0.6}>
              <motion.div
                className="flex flex-col items-center pt-[var(--space-md)]"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
              >
                <Image
                  src="/images/miyaka-signature-new.png"
                  alt="みやか先生 — 手書きサイン"
                  width={280}
                  height={140}
                  className="opacity-90"
                  style={{ objectFit: "contain" }}
                  priority={false}
                />
                <p className="font-brand text-[11px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mt-[var(--space-sm)]">
                  Dr. Miyaka
                </p>
              </motion.div>
            </FadeIn>

            {/* Link to full Philosophy page */}
            <FadeIn delay={0.7}>
              <div className="pt-[var(--space-xl)] flex justify-center">
                <Link
                  href="/philosophy"
                  className="inline-flex items-center gap-3 text-[11px] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500 border-b border-[var(--color-marble-vein)] hover:border-[var(--color-pink-gold)] pb-2"
                >
                  わたしが大切にしていることを、もう少し詳しく
                  <span>→</span>
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Right column: Portrait image — Stitch VOGUE style */}
          <FadeIn delay={0.3} className="w-full flex-1 order-1 md:order-2 mb-[var(--space-2xl)] md:mb-0">
            <div className="w-full md:sticky md:top-32">
              <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface)]">
                <Image
                  src="/images/profile/dr-miyaka-2.jpg"
                  alt="Dr. Miyaka — The Skin Atelier"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover contrast-[1.05] brightness-105 hover:brightness-110 transition-all duration-[2000ms]"
                  priority={true}
                />
              </div>
            </div>
          </FadeIn>
        </div>


      </div>
    </section>
  );
}
