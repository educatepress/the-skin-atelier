"use client";

import FadeIn from "@/components/common/fade-in";

const steps = [
  {
    num: "01",
    title: "Personal Consultation",
    jp: "肌との対話",
    desc: "まずは、今のあなたの肌がどんな状態にあるのかを紐解きます。視診だけでなく、日々のライフスタイルやスキンケア習慣まで、じっくりと時間をかけてお話を伺います。不安なこと、これまで諦めていたお悩みも遠慮なくお聞かせください。",
  },
  {
    num: "02",
    title: "Tailored Diagnosis",
    jp: "診断とプランニング",
    desc: "肌の土台・栄養状態を総合的に見極め、あなただけの「美肌へのロードマップ」を作成します。不要な治療は「必要ない」と正直にお伝えし、本当に必要なケアだけを厳選してご提案いたします。",
  },
  {
    num: "03",
    title: "Artisan Treatment",
    jp: "丁寧な施術",
    desc: "完全個室のプライベート空間で、ゆったりと施術をお受けいただきます。光治療による土台づくりから、0.1ml単位でこだわり抜くヒアルロン酸・ボトックス注入まで、一つ一つの所作に美意識を込めて行います。",
  },
  {
    num: "04",
    title: "Inner Harmony",
    jp: "内側からの充足",
    desc: "外側からのアプローチだけでなく、分子栄養学に基づいたサプリメントや内服薬のアドバイスも並行して行います。一時的な変化ではなく、肌が自ら潤い、輝き続けるための「本質的な美しさ」を一緒に育てていきましょう。",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="section-padding relative bg-white">
      {/* Background marble overlay */}
      <div className="absolute inset-0 bg-[#FDFCFA] opacity-80" />
      <div className="absolute inset-0 marble-texture opacity-30" />

      <div className="relative z-10 max-w-[1000px] mx-auto px-6">
        <FadeIn>
          <div className="mb-[var(--space-2xl)]">
            <p className="font-brand text-[0.7rem] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-[var(--space-md)]">
              The Journey
            </p>
            <h2 className="font-brand text-[clamp(1.8rem,4vw,3rem)] tracking-[0.1em] text-[var(--color-text-mocha)] italic leading-[1.4]">
              The Atelier Experience
              <span className="block font-body-jp text-[1.2rem] text-[var(--color-text-soft)] tracking-[0.08em] mt-[var(--space-md)] not-italic font-normal">
                あなただけの、美しさを育む時間
              </span>
            </h2>
          </div>
        </FadeIn>

        <div className="space-y-[var(--space-xl)] md:space-y-0 relative">
          {/* Timeline Line (Desktop only) */}
          <div className="hidden md:block absolute left-[5rem] top-0 bottom-0 w-[1px] bg-[var(--color-marble-vein)] z-0" />

          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={0.1 + i * 0.1}>
              <div className="flex flex-col md:flex-row gap-[var(--space-md)] md:gap-[var(--space-xl)] relative z-10 group md:items-start">
                
                {/* Number Indicator */}
                <div className="md:w-[10rem] shrink-0 pt-2 flex items-center md:items-start gap-4 md:gap-0">
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border border-[var(--color-pink-gold)] bg-[var(--color-surface)] flex items-center justify-center shrink-0 shadow-[var(--shadow-silk)] group-hover:bg-white group-hover:border-[var(--color-pink-gold-deep)] transition-colors duration-500">
                    <span className="font-brand text-[1rem] md:text-[1.3rem] text-[var(--color-text-mocha)] tracking-widest">
                      {step.num}
                    </span>
                  </div>
                  {/* Mobile connecting line handling inside text diff */}
                </div>

                {/* Content */}
                <div className="flex-1 md:bg-[rgba(255,255,255,0.6)] md:backdrop-blur-sm md:border md:border-[var(--color-marble-vein)] md:p-[var(--space-xl)] md:border-l-[var(--color-pink-gold)] transition-all duration-[800ms] group-hover:shadow-[var(--shadow-float)] group-hover:bg-white pb-[var(--space-xl)] md:pb-0 border-b border-[var(--color-marble-vein)] md:border-b-0">
                  <p className="font-brand text-[0.85rem] tracking-[0.2em] text-[var(--color-pink-gold-deep)] uppercase mb-[var(--space-xs)]">
                    {step.title}
                  </p>
                  <h3 className="text-[1.2rem] text-[var(--color-text-mocha)] tracking-[0.08em] mb-[var(--space-md)]">
                    {step.jp}
                  </h3>
                  <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.03em]">
                    {step.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* CTA to complete the journey */}
        <FadeIn delay={0.6}>
          <div className="mt-[var(--space-2xl)] pt-[var(--space-xl)] flex flex-col items-center">
            <p className="text-[0.95rem] leading-[2.4] text-[var(--color-text-soft)] tracking-[0.03em] mb-[var(--space-lg)] text-center">
              すべては、あなた自身が持つ「治癒力」と「美しさ」を最大限に引き出すために。
              <br className="hidden md:block"/>
              アトリエでの特別な時間が、そのきっかけになれば幸いです。
            </p>
            <a href="#invitation" className="btn-atelier inline-flex justify-center text-[0.7rem]">
              <span>公式LINEで相談をはじめる</span>
              <span className="arrow">→</span>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
