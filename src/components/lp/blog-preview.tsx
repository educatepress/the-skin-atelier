"use client";

import FadeIn from "@/components/common/fade-in";

const samplePosts = [
  {
    title: "美しき「引き算」の流儀：冬の肌に静寂を。",
    excerpt:
      "多くのものを与えすぎる現代のケア。今、私たちに必要なのは、真に必要なものだけを厳選する心地よさかもしれません。",
    date: "Coming Soon",
    category: "Skincare",
  },
  {
    title: "アトリエが選ぶ、至高のエッセンス。",
    excerpt:
      "世界中から丁寧に選ばれた、生命力溢れる植物の恩恵。肌が真に喜ぶ対話を。",
    date: "Coming Soon",
    category: "Inner Care",
  },
  {
    title: "光を纏う、朝のルーティン。",
    excerpt: "",
    date: "Coming Soon",
    category: "Lifestyle",
    isPlaceholder: true,
  },
];

export default function BlogPreview() {
  return (
    <section
      id="blog"
      className="section-padding relative bg-[var(--color-marble)]"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header — Stitch editorial style with horizontal line */}
        <FadeIn>
          <div className="flex items-center gap-[var(--space-lg)] mb-[var(--space-2xl)]">
            <h2 className="font-brand text-[clamp(2rem,4vw,3.5rem)] italic font-light tracking-[0.1em] text-[var(--color-text-mocha)]">
              Journal
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--color-marble-vein)]" />
          </div>
        </FadeIn>

        {/* Articles grid — Stitch 3-column grayscale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-xl)] md:gap-[var(--space-2xl)]">
          {samplePosts.map((post, i) => (
            <FadeIn key={i} delay={0.1 + i * 0.15}>
              <article
                className={`space-y-[var(--space-md)] group cursor-pointer ${
                  (post as { isPlaceholder?: boolean }).isPlaceholder ? "opacity-30" : ""
                }`}
              >
                {/* Image area */}
                <div className="overflow-hidden bg-[var(--color-surface)]">
                  {(post as { isPlaceholder?: boolean }).isPlaceholder ? (
                    <div className="h-64 md:h-80 border border-[var(--color-marble-vein)] flex items-center justify-center">
                      <span className="font-brand italic text-[0.8rem] text-[var(--color-text-muted)] tracking-[0.15em] opacity-50">
                        Archive Coming Soon
                      </span>
                    </div>
                  ) : (
                    <div className="h-64 md:h-80 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-marble-warm)] to-[var(--color-champagne-light)] grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1200ms]">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-brand text-[1.5rem] text-[var(--color-pink-gold)] opacity-20">✦</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="space-y-[var(--space-xs)]">
                  <p className="font-brand text-[0.5rem] tracking-[0.4em] text-[var(--color-text-muted)] uppercase">
                    {post.date}
                  </p>

                  <h4 className="text-[1rem] tracking-[0.06em] leading-[1.8] text-[var(--color-text-mocha)] group-hover:text-[var(--color-pink-gold-deep)] transition-colors duration-[800ms]">
                    {post.title}
                  </h4>

                  {post.excerpt && (
                    <p className="text-[0.75rem] text-[var(--color-text-muted)] leading-[2] tracking-[0.02em]">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
