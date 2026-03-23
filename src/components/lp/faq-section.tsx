"use client";

import FadeIn from "@/components/common/fade-in";

const faqs = [
  {
    q: "初めて美容医療を受けるのですが、何から始めればいいですか？",
    a: "まずは、今のお肌の「現在地」を知ることが大切です。LINEのパーソナル美肌診断で、あなたに合ったケアの方向性をお伝えしています。無理に施術をおすすめすることはありませんので、安心してご相談ください。",
  },
  {
    q: "なぜ最初からレーザー（ピコレーザー等）ではなく、フォトフェイシャルなのですか？",
    a: "多くの方は、肌の「土台」が整っていない状態でレーザーを当ててしまいます。まずはフォトフェイシャル（IPL）で肌の土台をしっかりと耕し、ポレーションで栄養を届ける。この順番を守ることで、より少ない回数で、より美しい仕上がりが期待できます。遠回りしないための、私がたどり着いた答えです。",
  },
  {
    q: "注入治療（ヒアルロン酸・ボトックス）は「やりすぎ」になりませんか？",
    a: "「やりすぎない洗練」が私のデザイン哲学です。あなたのお顔立ち、骨格、表情の動きを丁寧に診察し、0.1ml単位で調整します。自然で上品な仕上がりにこだわりますので、周りの方に気づかれないくらいの変化を一緒に目指しましょう。",
  },
  {
    q: "分子栄養学（インナーケア）とはどのような治療ですか？",
    a: "外側からの美容医療だけでは補えない、細胞レベルでの栄養状態を整えるアプローチです。血液検査をもとに、あなたに不足している栄養素を特定し、サプリメントや食事指導を通じて内側から肌の土台を整えます。美容医療との相乗効果で、より持続的な美しさを実現します。",
  },
  {
    q: "今からできることはありますか？",
    a: "はい。公式LINEにて「Dr.みやか パーソナル美肌診断」を無料でお受けいただけます。今のあなたの肌に本当に必要なケアがわかりますので、正しいスキンケア習慣を身につけていただけます。",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="section-padding relative">
      {/* JSON-LD for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
              },
            })),
          }),
        }}
      />

      <div className="max-w-3xl mx-auto px-6">
        <FadeIn>
          <p className="font-brand text-[0.75rem] tracking-[0.3em] text-[var(--color-text-muted)] uppercase text-center mb-[var(--space-sm)]">
            Questions
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="text-[clamp(1.2rem,2.5vw,1.8rem)] text-center leading-[1.8] tracking-[0.06em] text-[var(--color-text-mocha)] mb-[var(--space-md)]">
            よくいただくご質問
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="divider-gold mx-auto mb-[var(--space-2xl)]" />
        </FadeIn>

        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={0.15 + i * 0.08}>
              <details className="group border-b border-[var(--color-marble-vein)] last:border-b-0">
                <summary className="flex items-start gap-[var(--space-md)] py-[var(--space-lg)] cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-brand text-[0.75rem] text-[var(--color-pink-gold)] tracking-[0.15em] mt-1 shrink-0">
                    Q.
                  </span>
                  <span className="text-[1rem] leading-[1.9] text-[var(--color-text-mocha)] tracking-[0.03em] group-hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300">
                    {faq.q}
                  </span>
                  <span className="ml-auto text-[var(--color-pink-gold)] text-[0.85rem] shrink-0 transition-transform duration-300 group-open:rotate-45 mt-1">
                    +
                  </span>
                </summary>
                <div className="pb-[var(--space-lg)] pl-[calc(var(--space-md)+1rem)]">
                  <p className="text-[1rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.02em]">
                    {faq.a}
                  </p>
                </div>
              </details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
