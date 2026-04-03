"use client";

import Image from "next/image";
import FadeIn from "@/components/common/fade-in";

const treatments = [
  {
    number: "01",
    category: "Phototherapy",
    nameEn: "IPL Treatment",
    nameJp: "IPL治療（光治療）",
    image: "/images/pool/pool-img-19.webp",
    description:
      "肌の土台を整える第一歩。穏やかな光のエネルギーが、シミ・くすみ・赤みにアプローチし、肌本来の透明感を引き出します。",
    note: "「まず土台を丁寧に耕す」——それが、遠回りしない美肌への道です。",
  },
  {
    number: "02",
    category: "Infusion",
    nameEn: "Electroporation",
    nameJp: "エレクトロポレーション",
    image: "/images/pool/pool-img-20.webp",
    description:
      "針を使わずに、美容成分を肌の奥深くまで届ける先進技術。ヒアルロン酸やビタミンC誘導体を、イオン導入の約20倍の浸透率で届けます。",
    note: "整えた土台に、必要な栄養を丁寧に届ける。それが本当のスキンケアです。",
  },
  {
    number: "03",
    category: "Precision",
    nameEn: "Injection",
    nameJp: "ヒアルロン酸・ボトックス注入",
    image: "/images/pool/pool-img-21.webp",
    description:
      "「どこに、どれだけ、どの製剤を」——すべてはあなたのお顔立ちとバランスから逆算するデザイン。自然で上品な仕上がりのために、0.1ml単位でこだわります。",
    note: "あなたの美の基準を共有し、「やりすぎない洗練」を一緒に追求します。",
  },
  {
    number: "04",
    category: "Holistic",
    nameEn: "Inner Care",
    nameJp: "分子栄養学（インナーケア）",
    image: "/images/pool/pool-img-22.webp",
    description:
      "外側からのケアだけでは届かない、細胞レベルの美しさを。必要な栄養素を正しく満たすことで、肌は内側から輝きを取り戻します。",
    note: "美容医療と分子栄養学の融合——それが、このアトリエの独自のアプローチです。",
  },
];

export default function Treatments() {
  return (
    <section
      id="treatments"
      className="section-padding relative bg-[var(--color-marble-warm)]"
    >
      {/* Section header — Stitch editorial style */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 mb-[var(--space-2xl)]">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <FadeIn>
            <div className="space-y-[var(--space-sm)]">
              <p className="font-brand text-[11px] tracking-[0.5em] text-[var(--color-text-muted)] uppercase">
                Curated Services
              </p>
              <h2 className="font-brand text-[clamp(1.8rem,4vw,3rem)] tracking-[0.15em] text-[var(--color-text-mocha)] italic">
                Artisan Treatments
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-[0.95rem] text-[var(--color-text-muted)] max-w-sm leading-[2] tracking-[0.03em]">
              不要な治療は「必要ない」と伝えること。
              必要な治療だけを丁寧に組み合わせること。それがプロの仕事です。
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Treatment grid — Stitch gap-px hairline divider / 1+3 Layout */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-[var(--color-marble-vein)]">
          {treatments.map((t, i) => (
            <FadeIn key={t.nameEn} delay={0.15 + i * 0.1} className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
              <div className="bg-[var(--color-marble)] group cursor-pointer overflow-hidden p-[var(--space-xl)] md:p-[var(--space-2xl)] transition-all duration-[1200ms] hover:bg-white relative h-full">
                {/* Placeholder image area — grayscale with hover */}
                <div className="aspect-[4/5] mb-[var(--space-xl)] overflow-hidden bg-[var(--color-surface)]">
                  <Image
                    src={t.image}
                    alt={`${t.nameEn} — ${t.nameJp}`}
                    width={600}
                    height={750}
                    className="w-full h-full object-cover brightness-105 group-hover:scale-[1.03] transition-all duration-[1200ms]"
                  />
                </div>

                {/* Content */}
                <div className="space-y-[var(--space-sm)]">
                  {/* Numbered category */}
                  <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase">
                    {t.number}. {t.category}
                  </p>

                  {/* Treatment name */}
                  <h3 className="text-[1.3rem] tracking-[0.12em] text-[var(--color-text-mocha)]">
                    {t.nameEn}
                  </h3>
                  <p className="text-[0.95rem] tracking-[0.04em] text-[var(--color-text-soft)] mb-[var(--space-md)]">
                    {t.nameJp}
                  </p>

                  {/* Description */}
                  <p className="text-[1rem] leading-[2.1] text-[var(--color-text-soft)] tracking-[0.02em]">
                    {t.description}
                  </p>

                  {/* Doctor's note — left border accent */}
                  <div className="border-l border-[var(--color-pink-gold)] pl-[var(--space-md)] mt-[var(--space-md)] opacity-80">
                    <p className="text-[0.95rem] leading-[2] text-[var(--color-text-mocha)] italic tracking-[0.02em]">
                      {t.note}
                    </p>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-champagne-light)] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-[1200ms] pointer-events-none" />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Medical disclaimer */}
        <FadeIn delay={0.6}>
          <div className="mt-[var(--space-xl)] text-center">
            <p className="text-[11px] text-[var(--color-text-muted)] tracking-[0.03em] opacity-70">
              ※ 効果には個人差がございます。施術には副作用・リスクを伴う場合があります。
              <br />
              料金・詳しい施術内容は、カウンセリング時にご案内いたします。
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
