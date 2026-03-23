"use client";

import Image from "next/image";
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
                <h2 className="text-[clamp(1.6rem,3.5vw,2.5rem)] leading-[1.6] tracking-[0.08em] text-[var(--color-text-mocha)]">
                  まっさらな私に、
                  <br />
                  還るとき。
                </h2>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="font-brand text-[0.75rem] tracking-[0.3em] text-[var(--color-text-muted)] uppercase">
                A Quiet Return to Your True Self
              </p>
            </FadeIn>

            {/* Story body — Silk tone compliant A案 */}
            <FadeIn delay={0.2}>
              <div className="space-y-[var(--space-lg)] text-[var(--color-text-soft)] leading-[2.3]">
                <p className="text-[0.95rem] tracking-[0.03em]">
                  都会の喧騒を離れた、広尾の静かなアトリエ。
                </p>
                <p className="text-[0.95rem] tracking-[0.03em]">
                  着飾るのではなく、本来の透明感を引き出す。それは、先進の技術と内側からの調和が織りなす、あなただけの心地よい時間です。
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="space-y-[var(--space-lg)] text-[var(--color-text-soft)] leading-[2.3]">
                <p className="text-[0.95rem] tracking-[0.03em]">
                  鏡を見るたび、自分の肌を好きになれるように。
                </p>
                <p className="text-[0.95rem] tracking-[0.03em]">
                  そんな想いで、私は美容医療と分子栄養学の探求へと向かいました。
                </p>
              </div>
            </FadeIn>

            {/* Pull quote — Stitch style left border / Margins expanded for rhythm */}
            <FadeIn delay={0.35} className="my-[var(--space-2xl)]">
              <div className="py-[var(--space-lg)] px-[var(--space-xl)] border-l border-[var(--color-pink-gold)] bg-gradient-to-r from-[var(--color-champagne-light)] to-transparent">
                <p className="text-[1rem] leading-[2.2] text-[var(--color-text-mocha)] tracking-[0.04em] italic">
                  「まっさらな自分に還れる場所を、つくりたい」
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="space-y-[var(--space-lg)] text-[var(--color-text-soft)] leading-[2.3]">
                <p className="text-[0.95rem] tracking-[0.03em]">
                  外側からは、肌に負担をかけず丁寧に整える美容医療を。
                  <br />
                  内側からは、身体の隅々まで必要な成分で満たすインナーケアを。
                </p>
                <p className="text-[0.95rem] tracking-[0.03em]">
                  あらゆるアプローチを自らの肌で確かめながら、少しずつ、自分の肌と対話する術を身につけてきました。
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.45}>
              <div className="space-y-[var(--space-lg)] text-[var(--color-text-soft)] leading-[2.3]">
                <p className="text-[0.95rem] tracking-[0.03em]">
                  40歳を迎えた今。かつての悩みをふわりと手放した私の肌は、これまでで一番、心地よく透明な状態を保っています。
                </p>
                <p className="text-[0.95rem] tracking-[0.03em]">
                  年齢を重ねることは、決して美しさを失うことではなく、より上質に、しなやかに自分を磨き上げていくフェーズなのだと、今の私自身が実感しています。
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="divider-gold mx-auto my-[var(--space-md)]" />
            </FadeIn>

            <FadeIn delay={0.55}>
              <div className="space-y-[var(--space-md)]">
                <p className="text-[0.95rem] leading-[2.3] text-[var(--color-text-mocha)] tracking-[0.03em] font-medium">
                  美しさは、生まれ持った特別な才能ではありません。
                </p>
                <p className="text-[0.95rem] leading-[2.3] text-[var(--color-text-soft)] tracking-[0.03em]">
                  正しい知識で肌を慈しみ、最適なケアを選択することで、肌は必ず応えてくれます。
                </p>
                <p className="text-[0.95rem] leading-[2.3] text-[var(--color-text-soft)] tracking-[0.03em]">
                  遠回りをした私だからこそ、あなたのお悩みに心から寄り添い、本来の美しさを引き出すお手伝いができる。このアトリエで、あなただけの理想の肌を一緒に見つけていきませんか。
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
                  alt="Miyaka Sato, M.D. — 手書きサイン"
                  width={280}
                  height={140}
                  className="mix-blend-multiply opacity-90"
                  style={{ objectFit: "contain" }}
                  priority={false}
                />
                <p className="font-brand text-[0.7rem] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mt-[var(--space-sm)]">
                  Founder & Director — 美容皮膚科学会所属
                </p>
              </motion.div>
            </FadeIn>
          </div>

          {/* Right column: Portrait image — Stitch VOGUE style */}
          <FadeIn delay={0.3} className="w-full flex-1 order-1 md:order-2 mb-[var(--space-2xl)] md:mb-0">
            <div className="w-full md:sticky md:top-32">
              <div className="aspect-[3/4] overflow-hidden bg-[var(--color-surface)]">
                <Image
                  src="/images/philosophy-portrait.png"
                  alt="Dr. Miyaka — The Skin Atelier"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover max-md:grayscale-0 md:grayscale contrast-[1.15] brightness-110 md:hover:grayscale-0 transition-all duration-[2000ms]"
                  priority={true}
                />
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Medical disclaimer */}
        <FadeIn delay={0.65}>
          <p className="text-[0.7rem] text-[var(--color-text-muted)] mt-[var(--space-2xl)] text-center tracking-[0.03em] opacity-50">
            ※効果には個人差がございます。
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
