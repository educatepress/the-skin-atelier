import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "3つの引き算ガイド | The Skin Atelier",
  description:
    "10年後の自分を、もっと好きになる。美容皮膚科医みやかが贈る、3つの引き算ガイド。",
  robots: { index: false, follow: false }, // 登録者のみが辿り着くページなので検索対象外
};

export default function GuideDownloadPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFA]">
      {/* Print-friendly container */}
      <article className="max-w-[760px] mx-auto px-6 md:px-12 py-16 md:py-24 print:py-10">
        {/* Cover */}
        <header className="text-center mb-20 md:mb-28 print:mb-16">
          <p className="font-brand text-[11px] tracking-[0.5em] text-[var(--color-pink-gold-deep)] uppercase mb-8">
            A Free Guide by Dr. Miyaka
          </p>
          <h1 className="text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.5] tracking-[0.08em] text-[var(--color-text-mocha)] mb-6"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            10年後の自分を、
            <br />
            もっと好きになる。
          </h1>
          <p className="text-[1.1rem] md:text-[1.3rem] text-[var(--color-pink-gold-deep)] italic tracking-[0.1em]">
            3つの「引き算」ガイド
          </p>
          <div className="flex justify-center mt-12">
            <Image
              src="/logo-noback.png"
              alt="The Skin Atelier"
              width={120}
              height={60}
              className="opacity-70"
            />
          </div>
        </header>

        {/* Opening letter */}
        <section className="mb-20 md:mb-24 print:mb-16">
          <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-4">
            はじめに
          </p>
          <h2 className="text-[1.3rem] md:text-[1.5rem] tracking-[0.08em] text-[var(--color-text-mocha)] leading-[1.6] mb-8">
            あなたへ
          </h2>
          <div className="space-y-6 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
            <p>このガイドを受け取ってくださって、ありがとうございます。</p>
            <p>
              美容の情報は、毎日のように増えていきます。新しい成分、新しい施術、新しい「正解」。追いかけるほどに、肌は疲れ、心も少しだけ置き去りになってしまう——そんな声を、これまで何度も聞いてきました。
            </p>
            <p>
              わたしが、10年間ずっと大切にしている考え方は、とてもシンプルです。
              「足すより、引く。続けられることだけを、深く整える。」
            </p>
            <p>
              これからお届けする3つの習慣は、すべて「ヒトの臨床試験」で有効性が確認されたもの。そして、忙しい日々の中でも、無理なく続けられることにこだわりました。
            </p>
            <p className="italic text-[var(--color-text-mocha)]">
              どうか、気負わずに、できるところから一つずつ。
              <br />
              10年後のあなたが、今日のあなたに「ありがとう」と言える時間に、なりますように。
            </p>
          </div>
        </section>

        {/* ───────────────────── Rule 01 ───────────────────── */}
        <section className="mb-20 md:mb-24 print:break-before-page print:mb-16">
          <div className="flex items-baseline gap-5 mb-8 border-b border-[var(--color-marble-vein)] pb-4">
            <span className="font-brand text-[3rem] md:text-[4rem] text-[var(--color-pink-gold-deep)] italic leading-none">
              01
            </span>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase">
              The One Thing You Should Never Skip
            </p>
          </div>

          <h2 className="text-[1.3rem] md:text-[1.6rem] tracking-[0.08em] text-[var(--color-text-mocha)] leading-[1.5] mb-6">
            唯一「引き算しない」ケア、<br />
            日焼け止めの真実。
          </h2>

          <div className="space-y-6 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
            <p>
              わたしが10年間、たった一日も欠かさず続けてきたケアがあります。それは、日焼け止めを塗ること。
            </p>
            <p>
              肌老化の約80%は、紫外線による「光老化」が原因だと報告されています（Flament et al., 2013, etc.）。シミ、しわ、たるみ——気になる変化の多くが、日々の紫外線の積み重ねから生まれているのです。
            </p>

            <div className="bg-white/60 border-l-2 border-[var(--color-pink-gold)] p-6 my-8">
              <p className="font-brand text-[10px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-3">
                大切なこと
              </p>
              <ul className="space-y-3 text-[0.9rem] leading-[2.2] tracking-[0.03em]">
                <li>
                  <strong className="text-[var(--color-text-mocha)]">曇りの日も必要。</strong>
                  晴天時の60〜80%の紫外線が雲を貫通します。
                </li>
                <li>
                  <strong className="text-[var(--color-text-mocha)]">室内でも必要。</strong>
                  窓ガラスを透過するUVA（長波長紫外線）が、真皮にダメージを与えます。
                </li>
                <li>
                  <strong className="text-[var(--color-text-mocha)]">2〜3時間おきに塗り直す。</strong>
                  一度塗って終わり、ではありません。朝、お昼、夕方の3回が目安です。
                </li>
                <li>
                  <strong className="text-[var(--color-text-mocha)]">日常ならSPF30、PA+++で十分。</strong>
                  海やスポーツのときは SPF50+、PA++++ を選びましょう。
                </li>
              </ul>
            </div>

            <p>
              「高価な美容液を買う前に、まずここから。」わたしが患者さまにもっとも強く伝え続けている習慣です。10年後の肌への、一番確実な投資です。
            </p>
          </div>
        </section>

        {/* ───────────────────── Rule 02 ───────────────────── */}
        <section className="mb-20 md:mb-24 print:break-before-page print:mb-16">
          <div className="flex items-baseline gap-5 mb-8 border-b border-[var(--color-marble-vein)] pb-4">
            <span className="font-brand text-[3rem] md:text-[4rem] text-[var(--color-pink-gold-deep)] italic leading-none">
              02
            </span>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase">
              Three Ingredients That Actually Work
            </p>
          </div>

          <h2 className="text-[1.3rem] md:text-[1.6rem] tracking-[0.08em] text-[var(--color-text-mocha)] leading-[1.5] mb-6">
            本当に効く3つの成分と、<br />
            その組み合わせ方。
          </h2>

          <div className="space-y-6 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
            <p>
              化粧品棚の前で、情報量に圧倒された経験はありませんか。わたしも同じでした。でも、ヒトの臨床試験で「確かに効果がある」と確認されている成分は、実はそれほど多くありません。
            </p>
            <p>
              その中から、忙しい日々でも続けやすい3つを選びました。すべて、長年にわたる研究でエビデンスが蓄積されている成分です。
            </p>

            <div className="space-y-5 mt-8">
              <div className="bg-white/70 border border-[var(--color-marble-vein)] p-6">
                <p className="font-brand text-[0.85rem] tracking-[0.3em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                  Vitamin C — 朝に
                </p>
                <h3 className="text-[1.05rem] text-[var(--color-text-mocha)] tracking-[0.05em] mb-3">
                  ビタミンC誘導体
                </h3>
                <p className="text-[0.85rem] leading-[2.2] tracking-[0.02em]">
                  抗酸化作用でメラニンの生成を抑え、紫外線ダメージから肌を守ります。朝の日焼け止めの前に、1プッシュ。
                </p>
              </div>

              <div className="bg-white/70 border border-[var(--color-marble-vein)] p-6">
                <p className="font-brand text-[0.85rem] tracking-[0.3em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                  Retinol — 夜に
                </p>
                <h3 className="text-[1.05rem] text-[var(--color-text-mocha)] tracking-[0.05em] mb-3">
                  レチノール (ビタミンA)
                </h3>
                <p className="text-[0.85rem] leading-[2.2] tracking-[0.02em]">
                  肌のターンオーバーを整え、しわ・ハリ・毛穴に総合的にアプローチ。初めての方は低濃度（0.1%前後）を週1〜2回から。秋冬の乾燥期は保湿を厚めに。
                </p>
              </div>

              <div className="bg-white/70 border border-[var(--color-marble-vein)] p-6">
                <p className="font-brand text-[0.85rem] tracking-[0.3em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                  Niacinamide — 朝・夜
                </p>
                <h3 className="text-[1.05rem] text-[var(--color-text-mocha)] tracking-[0.05em] mb-3">
                  ナイアシンアミド
                </h3>
                <p className="text-[0.85rem] leading-[2.2] tracking-[0.02em]">
                  皮脂バランス、毛穴、くすみに穏やかに働きかける万能選手。敏感肌の方にもやさしい成分です。5%前後の濃度が使いやすい目安。
                </p>
              </div>
            </div>

            <p className="mt-8">
              この3つに、朝夜の保湿と日焼け止めを加えれば、基本のケアは完成です。それ以上は「引き算」してしまって大丈夫。
            </p>
          </div>
        </section>

        {/* ───────────────────── Rule 03 ───────────────────── */}
        <section className="mb-20 md:mb-24 print:break-before-page print:mb-16">
          <div className="flex items-baseline gap-5 mb-8 border-b border-[var(--color-marble-vein)] pb-4">
            <span className="font-brand text-[3rem] md:text-[4rem] text-[var(--color-pink-gold-deep)] italic leading-none">
              03
            </span>
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase">
              From The Inside Out
            </p>
          </div>

          <h2 className="text-[1.3rem] md:text-[1.6rem] tracking-[0.08em] text-[var(--color-text-mocha)] leading-[1.5] mb-6">
            内側を整える、<br />
            インナーウェルネスの基礎。
          </h2>

          <div className="space-y-6 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em]">
            <p>
              肌は、身体の中で「最後に栄養が届く臓器」だと言われています。どんなに良い化粧品を塗っても、「材料」となる栄養と、修復の時間が足りなければ、肌は健やかに育ちません。
            </p>
            <p>
              完璧を目指さなくて大丈夫です。今日から、ひとつだけ。
            </p>

            <div className="bg-white/60 border-l-2 border-[var(--color-pink-gold)] p-6 my-8 space-y-5">
              <div>
                <p className="font-brand text-[10px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                  Sleep
                </p>
                <h3 className="text-[1rem] text-[var(--color-text-mocha)] tracking-[0.05em] mb-2">
                  22〜23時の就寝を、まずは週に2回から。
                </h3>
                <p className="text-[0.85rem] leading-[2.2] tracking-[0.02em]">
                  睡眠中に分泌される成長ホルモンが、肌の修復と再生を担います。高価な美容液よりも、1時間早い就寝のほうが、肌への効果が大きいことも珍しくありません。
                </p>
              </div>

              <div>
                <p className="font-brand text-[10px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                  Iron
                </p>
                <h3 className="text-[1rem] text-[var(--color-text-mocha)] tracking-[0.05em] mb-2">
                  鉄を意識する。
                </h3>
                <p className="text-[0.85rem] leading-[2.2] tracking-[0.02em]">
                  日本人女性の多くが「隠れ鉄欠乏」と言われています。赤身肉・レバー・あさり・ほうれん草などを、週に数回取り入れるだけでも、肌のくすみや疲れやすさに違いが出ることがあります。気になる方は、血液検査でフェリチン値を確認するのも良い一歩です。
                </p>
              </div>

              <div>
                <p className="font-brand text-[10px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                  Mind
                </p>
                <h3 className="text-[1rem] text-[var(--color-text-mocha)] tracking-[0.05em] mb-2">
                  1日3分の「何もしない時間」を持つ。
                </h3>
                <p className="text-[0.85rem] leading-[2.2] tracking-[0.02em]">
                  ストレスは、肌バリア機能の低下・炎症・コラーゲン分解促進など、ほぼすべての肌老化経路に関与します。深呼吸、温かい飲み物、窓の外を眺める——たった3分で、整うこともあります。
                </p>
              </div>
            </div>

            <p>
              完璧にやろうとすると、続きません。3つのうち、今日から1つだけ。それで十分です。
            </p>
          </div>
        </section>

        {/* Closing */}
        <section className="print:break-before-page pt-10 border-t border-[var(--color-marble-vein)]">
          <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-6 text-center">
            Closing
          </p>
          <h2 className="text-[1.2rem] md:text-[1.4rem] tracking-[0.08em] text-[var(--color-text-mocha)] leading-[1.6] mb-8 text-center italic">
            最後に、心を込めて。
          </h2>

          <div className="space-y-6 text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.04em] max-w-[560px] mx-auto">
            <p>
              この3つを、すべて完璧にやる必要はありません。ひとつだけ、今日から始めてみてください。
              それを3ヶ月続けられたら、肌はきっと、静かに応えてくれます。
            </p>
            <p>
              美容医療は、魔法ではありません。でも、正しく使えば、あなたの人生を少しだけ軽くしてくれる道具になります。派手な変化ではなく、静かな肯定感を。流行ではなく、あなた自身の物語を。
            </p>
            <p className="text-[var(--color-text-mocha)] italic">
              10年後のあなたが、今日のあなたを振り返って、
              <br />
              「あの時、選んでよかった」と笑えますように。
            </p>
          </div>

          <div className="flex justify-end mt-12">
            <Image
              src="/images/miyaka-signature-new.png"
              alt="Dr. Miyaka Signature"
              width={180}
              height={80}
              className="opacity-80"
            />
          </div>
        </section>

        {/* Next steps */}
        <section className="mt-20 md:mt-24 pt-10 border-t border-[var(--color-marble-vein)] text-center print:hidden">
          <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-4">
            Stay Connected
          </p>
          <h3 className="text-[1rem] leading-[2] tracking-[0.05em] text-[var(--color-text-mocha)] mb-8">
            日々の診療や論文から見えてきた<br className="hidden md:block" />
            小さなヒントを、SNSでもお届けしています。
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="https://www.instagram.com/dr_miyaka_skin/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-atelier inline-flex justify-center items-center text-xs px-8 py-4"
            >
              <span className="tracking-[0.15em]">Instagram をフォロー</span>
              <span className="arrow ml-2">→</span>
            </a>
            <a
              href="https://x.com/dr_miyaka_skin"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-atelier inline-flex justify-center items-center text-xs px-8 py-4"
            >
              <span className="tracking-[0.15em]">X (Twitter) をフォロー</span>
              <span className="arrow ml-2">→</span>
            </a>
          </div>
          <div className="flex gap-6 justify-center text-[11px] font-brand tracking-[0.3em] uppercase">
            <Link
              href="/philosophy"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-pink-gold-deep)] transition-colors"
            >
              Philosophy
            </Link>
            <Link
              href="/blog"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-pink-gold-deep)] transition-colors"
            >
              Journal
            </Link>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-10 leading-[1.9] tracking-[0.02em] opacity-70">
            ※ この情報は一般的な情報提供を目的としており、個別の医療アドバイスではありません。
            <br />
            効果には個人差があります。具体的な治療については専門医にご相談ください。
          </p>
        </section>
      </article>
    </main>
  );
}
