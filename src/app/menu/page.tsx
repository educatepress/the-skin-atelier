import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StickySnsBanner from "@/components/layout/sticky-sns-banner";
import FadeIn from "@/components/common/fade-in";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu & Pricing | The Skin Atelier",
  description: "The Skin Atelier の施術メニュー・料金表です。",
};

const menuCategories = [
  {
    category: "IPL治療（光治療）",
    description: "肌の土台を整え、シミ・赤み・くすみを同時にケアします。",
    items: [
      { name: "全顔（初回トライアル）", price: "¥22,000", isFeatured: true },
      { name: "全顔（通常1回）", price: "¥33,000" },
      { name: "全顔（5回コース）", price: "¥148,000", note: "※1回あたり ¥29,600" },
    ],
  },
  {
    category: "エレクトロポレーション",
    description: "有効成分を肌の深部へ届け、潤いとハリを与えます。",
    items: [
      { name: "高濃度ビタミンC＋ヒアルロン酸", price: "¥16,500" },
      { name: "トラネキサム酸＋成長因子", price: "¥22,000", isFeatured: true },
    ],
  },
  {
    category: "注入治療",
    description: "解剖学に基づいた0.1ml単位の緻密なデザイン。※別途、再診料・カニューレ代がかかる場合があります。",
    items: [
      { name: "ボトックス注射（1部位：眉間・目尻・額など）", price: "¥27,500" },
      { name: "ボトックス注射（エラ・小顔）", price: "¥55,000" },
      { name: "ヒアルロン酸注射（1本 / 1cc）", price: "¥88,000", isFeatured: true },
    ],
  },
  {
    category: "インナーケア（分子栄養学）",
    description: "血液検査のデータから、身体の内側からの美しさをサポートします。",
    items: [
      { name: "詳細血液検査＋栄養解析レポート", price: "¥25,000", isFeatured: true },
      { name: "高濃度ビタミンC点滴（25g）", price: "¥16,500" },
      { name: "白玉点滴（グルタチオン）", price: "¥11,000" },
    ],
  },
  {
    category: "診察料",
    items: [
      { name: "初診料（カウンセリング含む）", price: "¥3,300" },
      { name: "再診料", price: "¥1,100" },
    ],
  },
];

export default function MenuPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--color-marble)] pt-[100px] md:pt-[120px] pb-[var(--space-3xl)]">
        
        {/* Title Section */}
        <div className="max-w-[800px] mx-auto px-6 text-center mb-[var(--space-2xl)]">
          <FadeIn>
            <p className="font-brand text-[0.75rem] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-[var(--space-sm)]">
              Treatments & Pricing
            </p>
            <h1 className="font-brand text-[2.5rem] md:text-[3.5rem] text-[var(--color-text-mocha)] tracking-[0.1em] italic">
              Menu
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="divider-gold mx-auto my-[var(--space-lg)]" />
            <p className="text-[0.95rem] text-[var(--color-text-soft)] leading-[2] tracking-[0.04em]">
              あなたのお肌にとって「本当に必要な治療だけ」を。<br className="hidden md:block"/>
              無理な勧誘や不要なオプションの追加は一切行いません。<br/>
              記載の料金はすべて税込価格です。
            </p>
          </FadeIn>
        </div>

        {/* Menu Listings */}
        <div className="max-w-[800px] mx-auto px-6 space-y-[var(--space-xl)]">
          {menuCategories.map((cat, idx) => (
            <FadeIn key={cat.category} delay={0.15 + idx * 0.1}>
              <div className="bg-white border border-[var(--color-marble-vein)] p-[var(--space-lg)] md:p-[var(--space-xl)] relative overflow-hidden group hover:shadow-sm transition-shadow duration-700">
                {/* Decorative border */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[var(--color-pink-gold)] to-transparent opacity-30" />
                
                <h2 className="text-[1.2rem] md:text-[1.4rem] tracking-[0.08em] text-[var(--color-text-mocha)] mb-1">
                  {cat.category}
                </h2>
                {cat.description && (
                  <p className="text-[0.85rem] leading-[1.8] text-[var(--color-text-muted)] mb-[var(--space-lg)]">
                    {cat.description}
                  </p>
                )}
                
                <div className="space-y-4 mt-[var(--space-md)]">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-baseline justify-between py-2 border-b border-dashed border-[var(--color-marble-vein)] last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[0.95rem] tracking-[0.03em] ${item.isFeatured ? 'text-[var(--color-text-mocha)] font-medium' : 'text-[var(--color-text-soft)]'}`}>
                          {item.name}
                        </span>
                        {item.isFeatured && (
                          <span className="text-[0.6rem] bg-[var(--color-champagne)] text-[var(--color-text-mocha)] px-2 py-0.5 rounded tracking-[0.1em]">
                            Recommend
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1 md:mt-0 text-right">
                        {item.note && (
                          <span className="text-[0.75rem] text-[var(--color-text-muted)]">
                            {item.note}
                          </span>
                        )}
                        <span className="font-brand text-[1.1rem] tracking-widest text-[var(--color-text-mocha)]">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Note / Disclaimer */}
        <div className="max-w-[800px] mx-auto px-6 mt-[var(--space-xl)]">
          <FadeIn delay={0.8}>
            <div className="bg-[var(--color-surface)] p-[var(--space-lg)] border border-[var(--color-marble-vein)]">
              <h3 className="text-[0.85rem] tracking-[0.1em] text-[var(--color-text-mocha)] mb-[var(--space-sm)] font-medium">
                お支払いについて
              </h3>
              <p className="text-[0.85rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.02em]">
                各種クレジットカード（VISA, MasterCard, JCB, AMEX, Diners）をご利用いただけます。<br/>
                ご不明な点は、カウンセリング時にご遠慮なくお尋ねください。
              </p>
            </div>
          </FadeIn>
        </div>

      </main>
      <StickySnsBanner />
      <Footer />
    </>
  );
}
