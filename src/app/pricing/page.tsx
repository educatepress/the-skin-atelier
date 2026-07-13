import { notFound } from "next/navigation";
import { CLINIC_OPEN } from "@/lib/clinic";

// 開業「公開OK」まではフラグOFF＝このページは404（noindex）。開業時に NEXT_PUBLIC_CLINIC_OPEN=true で解禁。
export const metadata = {
  title: "料金 | The Skin Atelier",
  description: "大人ニキビ専門の料金一覧（総額主義）。",
  ...(CLINIC_OPEN ? {} : { robots: { index: false, follow: false } }),
};

// ── 本命ピラミッド（金額は案・要院長承認。開業時に確定値へ差し替え）──
const HERO = {
  name: "6ヶ月 大人ニキビ跡・根本改善 オーダーメイド",
  price: "498,000円",
  desc: "ポテンツァ複数回＋サブシジョン/TCA CROSS＋内服（イソトレ/スピロノ）＋導入・物販。毎月の診察でオーダーメイドに微調整する伴走型プログラム。",
  note: "分割可。施術構成・回数は診察で個別設計します。",
};

const ENTRY = [
  { name: "体験：ポテンツァ 初回体験", price: "49,800円", desc: "まず1回試したい方に。当日6ヶ月プログラムご契約で体験費を全額充当。" },
  { name: "回数券：ポテンツァ跡治療 3回", price: "198,000円", desc: "1回 66,000円。治療中に本命プログラムへ移行する場合は代金を充当。" },
];

const SUBSCRIPTION = [
  { name: "ニキビ サブスク ライト", price: "3,300円/月", desc: "内服の継続（診察・採血込み総額）。" },
  { name: "ニキビ サブスク スタンダード", price: "11,000円/月", desc: "内服＋月1メディカルピーリング＋物販10%OFF＋予約優先。" },
  { name: "ニキビ サブスク プレミアム", price: "18,000円/月", desc: "内服＋月1ピーリング＋月1導入＋物販15%OFF。" },
];

const MENU: { category: string; items: { name: string; price: string }[] }[] = [
  {
    category: "内服・外用",
    items: [
      { name: "スピロノラクトン 50mg（診察・採血込み総額）", price: "3,300円/月" },
      { name: "イソトレチノイン 10/20mg（診察・採血込み・追加なし）", price: "10,800円/月" },
      { name: "アダパレン/BPO 外用", price: "2,750円〜" },
      { name: "アゼライン酸 外用（15-20%）", price: "3,300円〜" },
      { name: "漢方・亜鉛/ビタミン", price: "2,200円〜/月" },
    ],
  },
  {
    category: "ピーリング・直接治療",
    items: [
      { name: "メディカルピーリング（サリチル酸）", price: "8,800円 / 5回 37,400円" },
      { name: "ハイドラフェイシャル", price: "19,800円" },
      { name: "面皰圧出", price: "2,200円〜" },
      { name: "アグネス（絶縁針RF）", price: "16,500円〜 / 全顔 89,100円" },
    ],
  },
  {
    category: "ニキビ跡",
    items: [
      { name: "ダーマペン4", price: "29,700円 / 3回 77,100円" },
      { name: "ポテンツァ（マックーム）", price: "66,000円" },
      { name: "ポテンツァ（ジュベルック）", price: "79,800円" },
      { name: "サブシジョン", price: "33,000円/回" },
      { name: "TCA CROSS", price: "16,500円（5ヶ所）" },
      { name: "フラクショナルRFマイクロニードリング", price: "55,000円" },
    ],
  },
  {
    category: "色素・赤み・点滴・導入",
    items: [
      { name: "ピコトーニング（全顔）", price: "13,200円 / 10回 107,800円" },
      { name: "IPL（フォトフェイシャル・全顔）", price: "33,000円 / 6回 192,500円" },
      { name: "Vビーム / ジェネシス", price: "24,200円〜" },
      { name: "高濃度ビタミンC点滴（25g）", price: "18,700円" },
      { name: "エレクトロポレーション / イオン導入", price: "5,500円〜" },
    ],
  },
  {
    category: "ホームケア（物販）",
    items: [
      { name: "ナイアシンアミド美容液（4-5%）", price: "6,600円前後" },
      { name: "ビタミンC誘導体（SAP5%）", price: "6,600円前後" },
      { name: "レチナール美容液", price: "8,800円前後" },
      { name: "セラミド保湿＋SPF30+", price: "4,400円〜" },
    ],
  },
];

function Row({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-[var(--color-marble-vein)]">
      <span className="text-[0.9rem] text-[var(--color-text-mocha)] tracking-[0.02em]">{name}</span>
      <span className="text-[0.9rem] text-[var(--color-text-mocha)] whitespace-nowrap font-medium">{price}</span>
    </div>
  );
}

export default function PricingPage() {
  if (!CLINIC_OPEN) notFound();

  return (
    <main className="min-h-screen bg-[#FDFCFA] pt-32 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase text-center mb-4">
          Price
        </p>
        <h1 className="text-center text-[clamp(1.6rem,4vw,2.4rem)] tracking-[0.08em] text-[var(--color-text-mocha)] mb-4">
          料金
        </h1>
        <p className="text-center text-[0.85rem] text-[var(--color-text-soft)] leading-[2] mb-16">
          薬剤費だけでなく、診察・採血・薬剤を含めた<strong>総額</strong>で表示しています。
          <br className="hidden md:block" />
          「これ以上かからない」安心を、開業から。
        </p>

        {/* 本命プログラム */}
        <section className="bg-white/60 border border-[var(--color-pink-gold)] rounded-sm p-8 md:p-10 mb-14">
          <p className="font-brand text-[10px] tracking-[0.3em] text-[var(--color-pink-gold-deep)] uppercase mb-3">
            Signature Program
          </p>
          <h2 className="text-[1.2rem] text-[var(--color-text-mocha)] tracking-[0.06em] leading-[1.7] mb-3">
            {HERO.name}
          </h2>
          <p className="text-[1.5rem] text-[var(--color-text-mocha)] tracking-[0.02em] mb-4">{HERO.price}</p>
          <p className="text-[0.85rem] text-[var(--color-text-soft)] leading-[2] mb-2">{HERO.desc}</p>
          <p className="text-[0.75rem] text-[var(--color-text-muted)] leading-[1.9]">{HERO.note}</p>
        </section>

        {/* 入口 */}
        <section className="mb-14">
          <h2 className="text-[1.05rem] text-[var(--color-text-mocha)] tracking-[0.08em] mb-6">まずは、はじめやすく</h2>
          <div className="grid gap-4">
            {ENTRY.map((e) => (
              <div key={e.name} className="border border-[var(--color-marble-vein)] rounded-sm p-6">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <span className="text-[0.95rem] text-[var(--color-text-mocha)] tracking-[0.03em]">{e.name}</span>
                  <span className="text-[1rem] text-[var(--color-text-mocha)] whitespace-nowrap font-medium">{e.price}</span>
                </div>
                <p className="text-[0.8rem] text-[var(--color-text-soft)] leading-[1.9]">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* サブスク */}
        <section className="mb-14">
          <h2 className="text-[1.05rem] text-[var(--color-text-mocha)] tracking-[0.08em] mb-2">続けるほど、応える肌へ（月額プラン）</h2>
          <p className="text-[0.75rem] text-[var(--color-text-muted)] mb-6">縛りなし・解約自由。</p>
          <div className="grid gap-3">
            {SUBSCRIPTION.map((s) => (
              <div key={s.name} className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 border-b border-[var(--color-marble-vein)] pb-3">
                <div>
                  <span className="text-[0.9rem] text-[var(--color-text-mocha)] tracking-[0.03em]">{s.name}</span>
                  <p className="text-[0.78rem] text-[var(--color-text-soft)] leading-[1.8]">{s.desc}</p>
                </div>
                <span className="text-[0.95rem] text-[var(--color-text-mocha)] whitespace-nowrap font-medium">{s.price}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 通常メニュー */}
        <section className="mb-14">
          <h2 className="text-[1.05rem] text-[var(--color-text-mocha)] tracking-[0.08em] mb-6">メニュー一覧</h2>
          {MENU.map((cat) => (
            <div key={cat.category} className="mb-8">
              <h3 className="font-brand text-[11px] tracking-[0.3em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                {cat.category}
              </h3>
              {cat.items.map((it) => (
                <Row key={it.name} name={it.name} price={it.price} />
              ))}
            </div>
          ))}
        </section>

        {/* 医療広告・注記 */}
        <p className="text-[0.72rem] text-[var(--color-text-muted)] leading-[2] tracking-[0.02em]">
          ※ 表示は税込・総額です。効果や必要な回数・期間には個人差があります。イソトレチノイン等の未承認医薬品を用いる場合は、
          未承認である旨・入手経路・国内承認薬の有無・リスクを診察時にご説明します。副作用・リスク・禁忌がありますので、
          詳細は医師にご相談ください。
        </p>
      </div>
    </main>
  );
}
