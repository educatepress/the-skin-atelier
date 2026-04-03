"use client";

import FadeIn from "@/components/common/fade-in";

const faqs = [
  // --- 既存（リライト） ---
  {
    q: "初めて美容医療を受けるのですが、何から始めればいいですか？",
    a: "まずは、今のお肌の「現在地」を知ることが大切です。LINEのパーソナル美肌診断で、あなたに合ったケアの方向性をお伝えしています。無理に施術をおすすめすることはありませんので、安心してご相談ください。",
  },
  {
    q: "なぜ最初からレーザー（ピコレーザー等）ではなく、IPL治療（光治療）なのですか？",
    a: "多くの方は、肌の「土台」が整っていない状態でレーザーを当ててしまいます。まずはIPL治療で肌の土台をしっかりと耕し、ポレーションで栄養を届ける。この順番を守ることで、より少ない回数で、より美しい仕上がりが期待できます。",
  },
  {
    q: "注入治療（ヒアルロン酸・ボトックス）は「やりすぎ」になりませんか？",
    a: "「やりすぎない洗練」が私のデザイン哲学です。あなたのお顔立ち、骨格、表情の動きを丁寧に診察し、0.1ml単位で調整します。自然で上品な仕上がりにこだわりますので、周りの方に気づかれないくらいの変化を一緒に目指しましょう。",
  },
  {
    q: "分子栄養学（インナーケア）とはどのような治療ですか？",
    a: "血液検査をもとに不足している栄養素（鉄・亜鉛・ビタミンDなど）を特定し、サプリメントや食事指導で内側から肌の土台を整えるアプローチです。外側からの美容医療との相乗効果で、より持続的な美しさを実現します。",
  },
  {
    q: "今からできることはありますか？",
    a: "はい。公式LINEにて「Dr.みやか パーソナル美肌診断」を無料でお受けいただけます。今のあなたの肌に本当に必要なケアがわかりますので、正しいスキンケア習慣を身につけていただけます。",
  },
  // --- AEOスニペット狙い（新規） ---
  {
    q: "IPL治療（光治療）は何回で効果が出ますか？",
    a: "一般的に3〜5回の施術で効果を実感される方が多いです。1回でも肌のトーンアップやハリ感を感じられますが、回数を重ねるごとに透明感が増していきます。最適な回数は肌の状態によって異なりますので、カウンセリングでご提案いたします。",
  },
  {
    q: "IPL治療（光治療）は痛いですか？",
    a: "「輪ゴムで軽くはじかれる程度」と表現される方が多いです。痛みに敏感な方には冷却ジェルや出力調整で対応しますので、ほとんどの方が我慢できる範囲です。ダウンタイムもほぼなく、施術直後からメイク可能です。",
  },
  {
    q: "ボトックスで表情がなくなりませんか？",
    a: "適切な量を適切な場所に注入すれば、表情は自然に保たれます。「表情は残して、シワだけ減らす」がモットーです。初回は控えめな量から始め、2週間後のチェックで微調整することで、自然で上品な仕上がりを実現します。",
  },
  {
    q: "ヒアルロン酸注入のダウンタイムはどのくらいですか？",
    a: "注入部位によりますが、一般的に腫れは1〜3日程度、内出血が出た場合は1〜2週間で消退します。注入直後からお仕事や外出は可能です。大事なイベント前は2週間以上の余裕を持ってご来院いただくことをおすすめします。",
  },
  {
    q: "エレクトロポレーションの効果はどのくらい続きますか？",
    a: "個人差はありますが、1回の施術で2〜4週間程度の効果が持続します。月に1〜2回のペースで継続すると、肌のハリ・透明感が安定して維持できます。IPL治療との組み合わせで相乗効果が期待できます。",
  },
  {
    q: "美容皮膚科の初診ではどんなことをしますか？",
    a: "まず問診票をご記入いただき、肌の状態や生活習慣、お悩みについて詳しくお話を伺います。その後、視診と必要に応じて肌の検査を行い、あなたに最適な治療プランをご提案します。初診はカウンセリングのみでも問題ありません。",
  },
  {
    q: "40代から美容医療を始めても効果はありますか？",
    a: "もちろんです。40代は肌のターンオーバーが遅くなり変化を感じやすい年代ですが、だからこそ美容医療の効果を実感しやすいとも言えます。大切なのは年齢ではなく、今の肌に合った適切なアプローチを選ぶことです。",
  },
  {
    q: "施術にかかる費用の目安を教えてください。",
    a: "IPL治療は1回あたり2〜3万円、エレクトロポレーションは1〜2万円が目安です。ヒアルロン酸は使用する製剤と量によって5〜15万円、ボトックスは部位により2〜5万円程度です。詳細はカウンセリング時にご案内いたします。",
  },
  {
    q: "予約やカウンセリングの方法を教えてください。",
    a: "公式LINEからご予約いただけます。LINEでお悩みやご希望を事前にお伝えいただくことで、当日のカウンセリングがスムーズに進みます。まずはお気軽にお友達追加からお声がけください。",
  },
  {
    q: "施術の通院頻度はどのくらいですか？",
    a: "肌質改善が目的の場合、最初の3〜6ヶ月は月1回のペースが理想的です。肌の土台が整ったあとは、2〜3ヶ月に1回のメンテナンスで美しさを維持できます。ボトックスは3〜4ヶ月ごと、ヒアルロン酸は6〜18ヶ月ごとが一般的な目安です。",
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
