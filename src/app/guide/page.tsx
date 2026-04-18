import { Metadata } from "next";
import GuideForm from "./guide-form";
import Link from "next/link";
import Image from "next/image";

const SITE_URL = "https://skin-atelier.jp";
const PAGE_URL = `${SITE_URL}/guide`;

export const metadata: Metadata = {
  title: "10年後の自分を好きになる、3つの引き算ガイド | The Skin Atelier",
  description:
    "美容皮膚科医みやかが、エビデンスとインナーウェルネスに基づいて選び抜いた「最小で、最大の変化」を生む3つの習慣。無料ガイドをメールアドレスの登録でお届けします。",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "10年後の自分を好きになる、3つの引き算ガイド",
    description:
      "エビデンスとインナーウェルネスに基づく、最小で最大の変化を生む3つの習慣。無料ガイド。",
    url: PAGE_URL,
    type: "website",
    locale: "ja_JP",
    siteName: "The Skin Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "10年後の自分を好きになる、3つの引き算ガイド",
    description:
      "エビデンスとインナーウェルネスに基づく、最小で最大の変化を生む3つの習慣。",
  },
};

export default function GuideLandingPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFA]">
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6 relative">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 30%, rgba(232,211,201,0.4) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 70%, rgba(245,230,216,0.3) 0%, transparent 60%)
            `,
          }}
        />

        <div className="relative z-10 max-w-[1100px] mx-auto grid md:grid-cols-[1fr_440px] gap-12 md:gap-20 items-start">
          {/* Left: Copy */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[11px] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500 mb-10"
            >
              ← The Skin Atelier
            </Link>

            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-6">
              Free Guide
            </p>

            <h1 className="text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.5] tracking-[0.08em] text-[var(--color-text-mocha)] mb-8"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              10年後の自分を、もっと好きになる。
              <br />
              <span className="text-[var(--color-pink-gold-deep)] italic">
                3つの「引き算」ガイド
              </span>
            </h1>

            <div className="divider-gold mb-8" />

            <div className="space-y-6 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
              <p>
                美容の情報は、毎日のように増えていきます。「あれも、これも」と足していくほど、なぜか肌は疲れていく——そんな経験はありませんか？
              </p>
              <p>
                このガイドは、美容皮膚科医として10年以上、自分自身の肌と患者さまの肌に向き合ってきたわたしが、「これだけは、本当に大切」と感じている3つの習慣をまとめたものです。
              </p>
              <p>
                すべて、ヒトの臨床試験で効果が確認されたものだけ。そして、続けやすいシンプルさを大切にしました。
              </p>
            </div>

            {/* What's inside */}
            <div className="mt-12 bg-white/60 border border-[var(--color-marble-vein)] p-8">
              <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-6">
                What&apos;s Inside
              </p>
              <ul className="space-y-5">
                {[
                  {
                    num: "01",
                    title: "唯一「引き算しない」ケア、日焼け止めの真実",
                    body: "曇りの日も、室内でも必要な理由。正しい選び方と塗り直しのコツ。",
                  },
                  {
                    num: "02",
                    title: "本当に効く3つの成分と、その組み合わせ方",
                    body: "ビタミンC、レチノール、ナイアシンアミド——迷わないで選べるように。",
                  },
                  {
                    num: "03",
                    title: "内側を整える、インナーウェルネスの基礎",
                    body: "睡眠・鉄・心のバランス。肌は、最後に栄養が届く臓器です。",
                  },
                ].map((item) => (
                  <li key={item.num} className="flex gap-5 items-start">
                    <span className="font-brand text-[1.4rem] text-[var(--color-pink-gold-deep)] italic leading-none shrink-0 mt-1">
                      {item.num}
                    </span>
                    <div>
                      <p className="text-[0.95rem] text-[var(--color-text-mocha)] leading-[1.7] tracking-[0.04em] mb-1">
                        {item.title}
                      </p>
                      <p className="text-[0.82rem] text-[var(--color-text-soft)] leading-[2] tracking-[0.02em]">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Form card */}
          <div className="md:sticky md:top-32">
            <div className="bg-white border border-[var(--color-marble-vein)] shadow-[var(--shadow-silk)] p-8 md:p-10">
              <div className="flex flex-col items-center mb-8">
                <Image
                  src="/images/profile/dr-miyaka-avatar.jpg"
                  alt="Dr. Miyaka"
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-full object-cover mb-4"
                />
                <p className="font-brand text-[11px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase">
                  From Dr. Miyaka
                </p>
              </div>

              <h2 className="text-[1.05rem] leading-[2] tracking-[0.05em] text-[var(--color-text-mocha)] mb-6 text-center">
                メールアドレスをお知らせください。
                <br />
                すぐにガイドをお届けします。
              </h2>

              <GuideForm />

              <p className="text-[11px] leading-[1.9] text-[var(--color-text-muted)] tracking-[0.02em] mt-6 text-center">
                いつでも配信停止できます。
                <br />
                いただいたアドレスは、ガイドの配信と、月に数回の美容ジャーナルのお届けにのみ使用します。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
