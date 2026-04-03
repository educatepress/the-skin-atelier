import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import StickySnsBanner from "@/components/layout/sticky-sns-banner";
import FadeIn from "@/components/common/fade-in";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access | The Skin Atelier by Dr. Miyaka",
  description:
    "The Skin Atelier へのアクセス情報。最寄り駅からの行き方をご案内します。",
};

export default function AccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--color-marble)] pt-[100px] md:pt-[120px] pb-[var(--space-3xl)]">
        {/* Title Section */}
        <div className="max-w-[800px] mx-auto px-6 text-center mb-[var(--space-2xl)]">
          <FadeIn>
            <p className="font-brand text-[0.75rem] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-[var(--space-sm)]">
              Location
            </p>
            <h1 className="font-brand text-[2.5rem] md:text-[3.5rem] text-[var(--color-text-mocha)] tracking-[0.1em] italic">
              Access
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="divider-gold mx-auto my-[var(--space-lg)]" />
          </FadeIn>
        </div>

        {/* Map + Info Grid */}
        <div className="max-w-[960px] mx-auto px-6">
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[var(--color-marble-vein)] bg-white overflow-hidden">
              {/* Google Maps Embed */}
              <div className="aspect-square md:aspect-auto md:min-h-[480px] relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3242.0!2d139.7220!3d35.6503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDM5JzAxLjEiTiAxMznCsDQzJzE5LjIiRQ!5e0!3m2!1sja!2sjp!4v1700000000000"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="The Skin Atelier Location"
                  style={{
                    filter: "saturate(0.85) contrast(1.05)",
                  }}
                />
              </div>

              {/* Access Info */}
              <div className="p-[var(--space-xl)] md:p-[var(--space-2xl)] flex flex-col justify-center">
                <p className="font-brand text-[0.65rem] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mb-[var(--space-lg)]">
                  The Skin Atelier
                </p>

                <div className="space-y-[var(--space-lg)]">
                  {/* Address */}
                  <div>
                    <p className="text-[0.7rem] tracking-[0.15em] text-[var(--color-pink-gold-deep)] uppercase mb-1 font-medium">
                      Address
                    </p>
                    <p className="text-[0.95rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.03em]">
                      〒150-0012
                      <br />
                      東京都渋谷区広尾 5-00-00
                      <br />
                      広尾メディカルビル 3F
                    </p>
                  </div>

                  {/* Access */}
                  <div>
                    <p className="text-[0.7rem] tracking-[0.15em] text-[var(--color-pink-gold-deep)] uppercase mb-1 font-medium">
                      Nearest Station
                    </p>
                    <p className="text-[0.95rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.03em]">
                      東京メトロ日比谷線
                      <br />
                      <span className="text-[var(--color-text-mocha)] font-medium">
                        広尾駅
                      </span>{" "}
                      1番出口より徒歩3分
                    </p>
                  </div>

                  {/* Hours */}
                  <div>
                    <p className="text-[0.7rem] tracking-[0.15em] text-[var(--color-pink-gold-deep)] uppercase mb-1 font-medium">
                      Hours
                    </p>
                    <div className="text-[0.95rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.03em]">
                      <div className="flex justify-between max-w-[260px]">
                        <span>月〜金</span>
                        <span>10:00 – 19:00</span>
                      </div>
                      <div className="flex justify-between max-w-[260px]">
                        <span>土・祝</span>
                        <span>10:00 – 17:00</span>
                      </div>
                      <p className="text-[0.8rem] text-[var(--color-text-muted)] mt-1">
                        休診日：日曜日
                      </p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="divider-gold mt-[var(--space-xl)] mb-[var(--space-lg)]" />

                {/* Note */}
                <p className="text-[0.8rem] leading-[2] text-[var(--color-text-muted)] tracking-[0.02em]">
                  ※ 完全予約制のため、ご来院前に
                  <br />
                  公式LINEよりご予約をお願いいたします。
                </p>

                {/* Route Search Button */}
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=35.6503,139.7220&travelmode=transit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[var(--space-lg)] inline-flex items-center justify-center gap-2 w-full bg-[var(--color-text-mocha)] text-white px-6 py-4 text-[0.85rem] tracking-[0.08em] hover:bg-[var(--color-text-soft)] transition-all duration-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 0 0 1.3 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8z" />
                  </svg>
                  現在地からの経路を検索する
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Directions Card */}
          <FadeIn delay={0.25}>
            <div className="mt-[var(--space-xl)] bg-[var(--color-surface)] border border-[var(--color-marble-vein)] p-[var(--space-lg)] md:p-[var(--space-xl)]">
              <h2 className="text-[0.85rem] tracking-[0.12em] text-[var(--color-text-mocha)] mb-[var(--space-md)] font-medium">
                広尾駅からの道順
              </h2>
              <ol className="text-[0.9rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.02em] space-y-1 list-none">
                <li className="flex gap-3">
                  <span className="text-[var(--color-pink-gold)] font-brand text-[0.75rem] mt-0.5 shrink-0">
                    01
                  </span>
                  <span>
                    広尾駅{" "}
                    <span className="text-[var(--color-text-mocha)] font-medium">
                      1番出口
                    </span>{" "}
                    を出て、左方向（広尾散歩通り方面）へ進みます。
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-pink-gold)] font-brand text-[0.75rem] mt-0.5 shrink-0">
                    02
                  </span>
                  <span>
                    広尾散歩通りを約200m直進。右手にナチュラルローソンが見えたら、その先の角を右折。
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--color-pink-gold)] font-brand text-[0.75rem] mt-0.5 shrink-0">
                    03
                  </span>
                  <span>
                    30m先、左手の白いビル{" "}
                    <span className="text-[var(--color-text-mocha)] font-medium">
                      「広尾メディカルビル」3F
                    </span>{" "}
                    が当院です。
                  </span>
                </li>
              </ol>
              <p className="text-[0.75rem] text-[var(--color-text-muted)] mt-[var(--space-md)] tracking-[0.03em]">
                ※ 当ビルにはエレベーターがございます。ベビーカーでもお越しいただけます。
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
