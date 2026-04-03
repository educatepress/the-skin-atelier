import Link from "next/link";
import FadeIn from "@/components/common/fade-in";
import { getAllPosts } from "@/lib/blog";

export default function BlogPreview() {
  const posts = getAllPosts().slice(0, 3); // View latest 3 posts

  return (
    <section id="blog" className="section-padding relative bg-[var(--color-marble)]">
      <div className="max-w-[1200px] mx-auto px-6">
        <FadeIn>
          <div className="flex items-center gap-[var(--space-lg)] mb-[var(--space-2xl)]">
            <h2 className="font-brand text-[clamp(2rem,4vw,3.5rem)] italic font-light tracking-[0.1em] text-[var(--color-text-mocha)]">
              Journal
            </h2>
            <div className="flex-1 h-[1px] bg-[var(--color-marble-vein)]" />
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-xl)] md:gap-[var(--space-2xl)]">
          {posts.map(({ metadata }, i) => (
            <FadeIn key={metadata.slug} delay={0.1 + i * 0.15}>
              <Link href={`/blog/${metadata.slug}`} className="block group cursor-pointer space-y-[var(--space-md)]">
                {/* Image placeholder area with hover expansion effect */}
                <div className="overflow-hidden bg-[var(--color-surface)]">
                  <div className="h-64 md:h-80 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-marble-warm)] to-[var(--color-champagne-light)] relative">
                    {metadata.image ? (
                      <img 
                        src={metadata.image} 
                        alt={metadata.title} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1200ms]"
                      />
                    ) : (
                      <div className="w-full h-full group-hover:scale-105 transition-all duration-[1200ms] flex items-center justify-center">
                        <span className="font-brand text-[1.5rem] text-[var(--color-pink-gold)] opacity-20">✦</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-[var(--space-xs)]">
                  <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase">
                    {metadata.date}
                  </p>

                  <h4
                    className="text-[1rem] tracking-[0.06em] leading-[1.8] text-[var(--color-text-mocha)] group-hover:text-[var(--color-pink-gold-deep)] transition-colors duration-[800ms] line-clamp-2"
                    style={{ textWrap: 'balance' } as React.CSSProperties}
                  >
                    {metadata.title}
                  </h4>

                  {metadata.excerpt && (
                    <p className="text-[0.75rem] text-[var(--color-text-muted)] leading-[2] tracking-[0.02em] line-clamp-3">
                      {metadata.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6}>
          <div className="mt-[var(--space-2xl)] flex justify-center">
            <Link
              href="/blog"
              className="font-brand text-[0.75rem] tracking-[0.2em] text-[var(--color-text-soft)] uppercase px-8 py-4 border border-[var(--color-marble-vein)] hover:bg-[var(--color-champagne-light)] hover:text-[var(--color-text-mocha)] transition-all duration-500"
            >
              View all journal entries
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
