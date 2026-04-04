"use client";

import FadeIn from "@/components/common/fade-in";

const faqs = [
  {
    q: "高価なスキンケア（デパコス）と美容医療、どちらにお金をかけるべきですか？",
    a: "目的によって異なります。肌の「土台作り」や「保湿」には日々のスキンケアが必須ですが、「シミを消す」「たるみを引き上げる」といった構造的な変化はスキンケアでは限界があります。限られた予算であれば、ベースの保湿はシンプルなものにし、根本改善には美容医療を取り入れる「メリハリ引き算美容」をおすすめしています。",
  },
  {
    q: "30代・40代から美容医療を始める場合、何から始めるのがおすすめですか？",
    a: "まずは「光治療（IPL）」などで肌のトーンや色ムラを整えること、または「ボトックス」で将来の深いシワを予防することから始める方が多いです。今の肌の現在地によって優先順位は大きく変わるため、適切な情報の取捨選択が美肌への最短ルートになります。",
  },
  {
    q: "シミ取りレーザーと光治療（IPL）の違いは何ですか？",
    a: "「レーザー」は目立つシミをピンポイントで強力に破壊する治療、「光治療（IPL）」はお顔全体にマイルドな光を当て、薄いシミや赤み、くすみなどを総合的に少しずつ薄くしていく治療です。肌全体の透明感を底上げしたい場合はIPLが適しています。",
  },
  {
    q: "ボトックスは「やりすぎる」と表情が不自然になりませんか？",
    a: "注入する「量」と「打つ場所」によって仕上がりはコントロールできます。シワを完全に消そうとして大量に打つと不自然になりがちですが、「表情は残しつつ、深く刻まれるシワだけをマイルドに抑える」という自然な打ち方も可能です。",
  },
  {
    q: "インナーケア（サプリや食事）は、本当に肌に効果があるのでしょうか？",
    a: "非常に重要です。肌は「最後に栄養が届く臓器」と言われており、鉄分やタンパク質などの栄養素が不足していると、外から高価な美容液を塗ってもすこやかな肌は作られにくいです。外からのケアと内からのケア両方が美肌づくりには不可欠です。",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="section-padding relative">
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
          {/* 冷たい英語を「体温のある日本語」へ */}
          <p className="font-brand text-[11px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase text-center mb-[var(--space-sm)]">
            あなたの不安に寄り添って
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="text-[clamp(1.2rem,2.5vw,1.8rem)] text-center leading-[1.6] tracking-[0.06em] text-[var(--color-text-mocha)] mb-[var(--space-md)]">
            心に浮かぶ、いくつかの疑問へ
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
                  {/* Qマークは濃い色（pink-gold-deep）にする */}
                  <span className="font-brand text-[15px] text-[var(--color-pink-gold-deep)] font-medium tracking-[0.15em] mt-1 shrink-0">
                    Q.
                  </span>
                  <span className="text-[1rem] leading-[1.6] text-[var(--color-text-mocha)] tracking-[0.03em] group-hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300">
                    {faq.q}
                  </span>
                  <span className="ml-auto text-[var(--color-pink-gold-deep)] text-[1.2rem] shrink-0 transition-transform duration-300 group-open:rotate-45 mt-1">
                    +
                  </span>
                </summary>
                {/* 回答部分に A. を装飾として付与（ブログと同じUI体験） */}
                <div className="pb-[var(--space-lg)] pl-[calc(var(--space-md)+1.5rem)] relative">
                  <span className="absolute left-[0.2rem] top-[0.1rem] font-brand text-lg text-[#D4C1B3] leading-none">
                    A.
                  </span>
                  <p className="text-[0.95rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.02em]">
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
