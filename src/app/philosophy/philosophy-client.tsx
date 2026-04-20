"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import FadeIn from "@/components/common/fade-in";

const pillars = [
  {
    num: "01",
    en: "Evidence",
    jp: "エビデンス",
    tagline: "流行ではなく、論文で選ぶ。",
    body:
      "新しい成分や施術は毎年のように登場します。その中で、本当に「ヒトに対して効果が確認されたもの」は、実はほんの一握りです。わたしは、動物実験や試験管レベルの話ではなく、ヒトの臨床試験（メタアナリシス・システマティックレビュー・RCT）で有効性が示された選択肢だけを、あなたに提案することを大切にしています。",
    closing: "「とりあえず人気だから」ではなく、「あなたに必要だから」を、一緒に選ぶために。",
  },
  {
    num: "02",
    en: "Inner Wellness",
    jp: "インナーウェルネス",
    tagline: "肌だけを診ない。心と栄養も含めて、整える。",
    body:
      "肌は、最後に栄養が届く臓器だと言われています。どんなに良い美容液を塗っても、鉄やタンパク質といった「材料」が足りなければ、肌は健やかに育ちません。そして、睡眠・ストレス・自律神経のバランスもまた、肌の透明感と深く結びついています。外側のケアと、内側の整え——両方をそっと束ねていくことが、本当の美しさに近づく道だと信じています。",
    closing: "完璧を目指すのではなく、今日、ひとつだけ自分を労わってみる。それで十分です。",
  },
  {
    num: "03",
    en: "Subtraction",
    jp: "引き算",
    tagline: "足すよりも、引く。「やらない選択」も、提案する。",
    body:
      "美容医療の世界では、どうしても「もっと、もっと」と足していきたくなる瞬間があります。でも、本当に美しい肌は、やり過ぎた肌ではありません。わたしは、流行の治療法に対して「いまのあなたには必要ない」と正直にお伝えすることも、誠実さの一部だと考えています。10ステップのスキンケアよりも、本当に効く3つ。5つの施術よりも、合う1つ。引き算の先に、品のある美しさが待っています。",
    closing: "「やらない」という選択肢を、一緒に見つける時間を大切にしています。",
  },
];

const principles = [
  {
    title: "架空の症例やエピソードは、書かない。",
    body: "「今日こんな患者さんが来ました」という物語は、AI時代にいくらでも作れます。だからこそわたしは、一次資料（論文・公的機関の情報・自分自身の経験）だけを頼りに発信することを誓っています。",
  },
  {
    title: "他のクリニックや医師を、貶めない。",
    body: "比較してけなすことで自分を高く見せる方法は、長続きしません。わたしは、他の方の仕事を尊重しながら、わたし自身の言葉と判断で選ばれる存在でありたいと思っています。",
  },
  {
    title: "「絶対」「最高」「No.1」とは、言わない。",
    body: "医療に絶対はありません。効果には個人差があり、合う合わないがあります。確実なのは、あなたの肌と向き合って、丁寧に選んでいくこと。その誠実さを、言葉の端々まで守ります。",
  },
  {
    title: "不安を煽って、治療に誘わない。",
    body: "「このままでは取り返しがつかなくなる」といった言葉で急かすことは、わたしの美学に反します。情報はフラットに、選ぶのはあなた自身。わたしは、そっと伴走するだけです。",
  },
];

export default function PhilosophyClient() {
  return (
    <main className="min-h-screen bg-[#FDFCFA]">
      {/* ─── Hero ─── */}
      <section className="pt-32 pb-24 px-6 relative">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 30%, rgba(232,211,201,0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(245,230,216,0.3) 0%, transparent 50%)
            `,
          }}
        />
        <div className="relative z-10 max-w-[720px] mx-auto text-center">
          <FadeIn>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500 mb-12"
            >
              ← The Skin Atelier
            </Link>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-6">
              My Philosophy
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.7] tracking-[0.1em] text-[var(--color-text-mocha)] font-normal mb-8"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              わたしが大切にしていること
            </motion.h1>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="divider-gold mx-auto mb-8" />
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-[1rem] md:text-[1.05rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.05em] max-w-[560px] mx-auto">
              美容医療を、誰のために、どう使うか。
              <br />
              流行に追われる前に、立ち止まって考えたい。
              <br className="hidden md:block" />
              わたしが日々の診療と発信で大切にしているのは、<br className="hidden md:block" />
              ３つの、とてもシンプルな軸です。
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── 3 Pillars ─── */}
      <section className="pb-24 px-6">
        <div className="max-w-[960px] mx-auto space-y-24 md:space-y-32">
          {pillars.map((p, i) => (
            <FadeIn key={p.num} delay={0.1 + i * 0.05}>
              <div className="grid md:grid-cols-[180px_1fr] gap-8 md:gap-16 items-start">
                {/* Number + EN tag */}
                <div className="md:pt-2">
                  <p className="font-brand text-[clamp(3rem,6vw,4.5rem)] text-[var(--color-pink-gold-deep)] italic leading-none tracking-[0.05em]">
                    {p.num}
                  </p>
                  <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mt-4">
                    {p.en}
                  </p>
                </div>

                {/* Body */}
                <div>
                  <h2 className="text-[clamp(1.4rem,3vw,2rem)] tracking-[0.1em] text-[var(--color-text-mocha)] leading-[1.5] mb-6">
                    {p.jp}
                  </h2>
                  <p className="text-[1.1rem] md:text-[1.15rem] italic text-[var(--color-pink-gold-deep)] leading-[1.8] tracking-[0.05em] mb-8 font-light">
                    {p.tagline}
                  </p>
                  <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em] mb-6">
                    {p.body}
                  </p>
                  <div className="border-l-2 border-[var(--color-pink-gold)] pl-5 py-2">
                    <p className="text-[0.9rem] italic leading-[2] text-[var(--color-text-mocha)] tracking-[0.03em]">
                      {p.closing}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── Origin Narrative ─── */}
      <section className="py-24 px-6 bg-white/60 border-y border-[var(--color-marble-vein)]">
        <div className="max-w-[680px] mx-auto">
          <FadeIn>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase text-center mb-4">
              Origin Story
            </p>
            <h2 className="font-brand text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-text-mocha)] italic tracking-[0.08em] text-center mb-12">
              わたしが、この考え方にたどり着くまで
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-8 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
              <p>
                20代の頃、わたしの肌はひどいニキビに覆われていました。ファンデーションでなんとか隠しながら、鏡を見るのが少しだけ辛い時期が、何年も続きました。
              </p>
              <p>
                皮膚科医になって、様々な治療に触れるうちに気づいたのは——「外からのケアには、どうしても限界がある」ということ。施術で一時的に整っても、食事や睡眠、心の状態が荒れていると、また元に戻ってしまう。その繰り返しの中で、内側を整える大切さを、自分の肌で少しずつ学んでいきました。
              </p>
              <p>
                そして、40代に入った今。わたしは、人生で一番自分の肌が好きです。完璧ではないけれど、「このままでいい」と思える肌になりました。
              </p>
              <p>
                その過程で気づいたのは、美容医療は「若く見せる道具」ではなく、「自分を好きでいられる時間を伸ばす道具」だということ。だからわたしは、あなたにも同じ道のりを、遠回りせずに歩んでほしい。そのために、このアトリエで言葉を綴っています。
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── わたしがしないこと ─── */}
      <section className="py-24 px-6">
        <div className="max-w-[880px] mx-auto">
          <FadeIn>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase text-center mb-4">
              What I Don&apos;t Do
            </p>
            <h2 className="font-brand text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-text-mocha)] italic tracking-[0.08em] text-center mb-4">
              わたしが、しないこと
            </h2>
            <p className="text-center text-[0.9rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.03em] mb-12 max-w-[520px] mx-auto">
              「する」ことを語るより、「しない」ことを語るほうが、
              <br className="hidden md:block" />
              その人の信念がよく見えるような気がするのです。
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {principles.map((p, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.05}>
                <div className="bg-white/70 border border-[var(--color-marble-vein)] p-8 h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-[var(--color-pink-gold-deep)] text-2xl leading-none mt-1">
                      ×
                    </span>
                    <h3 className="text-[1rem] leading-[1.8] tracking-[0.06em] text-[var(--color-text-mocha)]">
                      {p.title}
                    </h3>
                  </div>
                  <p className="text-[0.85rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.03em] pl-9">
                    {p.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Letter ─── */}
      <section className="py-24 px-6 bg-white/60 border-t border-[var(--color-marble-vein)]">
        <div className="max-w-[640px] mx-auto">
          <FadeIn>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase text-center mb-4">
              A Letter
            </p>
            <h2 className="font-brand text-[clamp(1.3rem,3vw,1.8rem)] text-[var(--color-text-mocha)] italic tracking-[0.08em] text-center mb-12">
              最後に、心を込めて。
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="space-y-6 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
              <p>
                美容医療は、魔法ではありません。
                でも、正しく使えば、あなたの人生を少しだけ軽くしてくれる道具になります。
              </p>
              <p>
                鏡を見るのが少し楽しくなる。
                仕事の集中力が戻る。人と会うのが楽しみになる。
                そんな、日々の小さな変化こそが、わたしが届けたい「本当の効果」です。
              </p>
              <p>
                派手な変化ではなく、静かな肯定感を。
                流行ではなく、あなた自身の物語を。
                そんな美しさを、ここで一緒に育てていけたら嬉しいです。
              </p>
              <p className="text-[var(--color-text-mocha)] italic pt-4">
                10年後のあなたが、今のあなたを振り返って、
                「あの時、選んでよかった」と笑えますように。
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-12 flex justify-end">
              <Image
                src="/images/miyaka-signature-new.png"
                alt="Dr. Miyaka Signature"
                width={180}
                height={80}
                className="opacity-80"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <div className="max-w-[760px] mx-auto text-center">
          <FadeIn>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-6">
              Stay Connected
            </p>
            <h2 className="text-[clamp(1.2rem,2.5vw,1.6rem)] leading-[2] tracking-[0.08em] text-[var(--color-text-mocha)] mb-10">
              日々の診療や論文から見えてきた
              <br className="hidden md:block" />
              小さなヒントを、SNSでもお届けしています。
            </h2>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a
                href="https://www.instagram.com/dr_miyaka_skin/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram で Dr. Miyaka をフォロー"
                className="btn-atelier inline-flex justify-center items-center text-xs px-8 py-4"
              >
                <span className="tracking-[0.15em]">Instagram をフォロー</span>
                <span className="arrow ml-2">→</span>
              </a>
              <a
                href="https://x.com/dr_miyaka_skin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) で Dr. Miyaka をフォロー"
                className="btn-atelier inline-flex justify-center items-center text-xs px-8 py-4"
              >
                <span className="tracking-[0.15em]">X (Twitter) をフォロー</span>
                <span className="arrow ml-2">→</span>
              </a>
            </div>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[11px] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500"
            >
              Journal を読む →
            </Link>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
