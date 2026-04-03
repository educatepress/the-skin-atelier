"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured: boolean;
  image?: string;
}

export default function BlogListClient({
  articles,
}: {
  articles: Article[];
}) {
  const featured = articles.filter((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <main className="min-h-screen bg-[#FDFCFA]">
      {/* Hero header — VOGUE editorial style */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Marble texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 25% 40%, rgba(232,211,201,0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(197,212,192,0.12) 0%, transparent 40%)
            `,
          }}
        />

        <div className="relative z-10 max-w-[960px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="flex items-end gap-8"
          >
            <h1 className="font-brand text-[clamp(3rem,8vw,6rem)] italic font-light tracking-[0.08em] text-[var(--color-text-mocha)] leading-none">
              Journal
            </h1>
            <div className="flex-1 h-[1px] bg-[var(--color-marble-vein)] mb-3" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-[0.8rem] text-[var(--color-text-muted)] tracking-[0.04em] leading-[2] mt-8 max-w-md"
          >
            エビデンスに基づく美容医療の知識と、
            <br />
            内側から輝く美しさのヒントを。
          </motion.p>
        </div>
      </section>

      {/* Featured articles — 2-column large grid */}
      {featured.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-[960px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-[var(--color-marble-vein)]">
              {featured.map((article, i) => (
                <motion.article
                  key={article.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.15 }}
                  className="bg-[#FDFCFA] group"
                >
                  <Link href={`/blog/${article.slug}`} className="block p-10 md:p-14">
                    {/* Image / Placeholder */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-marble-warm)] to-[var(--color-champagne-light)] mb-8 overflow-hidden relative">
                      {article.image ? (
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1200ms]"
                        />
                      ) : (
                        <div className="w-full h-full grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1200ms] flex items-center justify-center">
                          <span className="font-brand text-[2rem] text-[#E8D3C9] opacity-20">✦</span>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="font-brand text-[0.5rem] tracking-[0.4em] text-[#E8D3C9] uppercase">
                          {article.category}
                        </span>
                        <span className="font-brand text-[0.5rem] text-[var(--color-text-muted)] tracking-[0.15em]">
                          {article.date}
                        </span>
                      </div>

                      <h2
                        className="text-[1.15rem] leading-[1.9] tracking-[0.06em] text-[var(--color-text-mocha)] group-hover:text-[#E8D3C9] transition-colors duration-[800ms]"
                        style={{ textWrap: 'balance' } as React.CSSProperties}
                      >
                        {article.title}
                      </h2>

                      <p className="text-[0.8rem] leading-[2] text-[var(--color-text-muted)] tracking-[0.02em]">
                        {article.excerpt}
                      </p>

                      <p className="font-brand text-[0.5rem] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mt-4">
                        {article.readTime}
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rest of articles — 3-column grid */}
      <section className="px-6 pb-32">
        <div className="max-w-[960px] mx-auto">
          {/* Section divider */}
          <div className="flex items-center gap-6 mb-14">
            <p className="font-brand text-[0.5rem] tracking-[0.5em] text-[var(--color-text-muted)] uppercase whitespace-nowrap">
              Archive
            </p>
            <div className="flex-1 h-[1px] bg-[var(--color-marble-vein)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {rest.map((article, i) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={`/blog/${article.slug}`} className="block space-y-3">
                  {/* Image / Placeholder */}
                  <div className="aspect-[4/5] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-marble-warm)] overflow-hidden relative">
                    {article.image ? (
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1200ms]"
                      />
                    ) : (
                      <div className="w-full h-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1200ms] flex items-center justify-center">
                        <span className="font-brand text-[1.5rem] text-[#E8D3C9] opacity-15">✦</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <span className="font-brand text-[0.45rem] tracking-[0.4em] text-[#E8D3C9] uppercase">
                      {article.category}
                    </span>
                    <span className="font-brand text-[0.45rem] text-[var(--color-text-muted)] tracking-[0.15em]">
                      {article.date}
                    </span>
                  </div>

                  <h3
                    className="text-[0.9rem] leading-[1.8] tracking-[0.04em] text-[var(--color-text-mocha)] group-hover:text-[#E8D3C9] transition-colors duration-[800ms]"
                    style={{ textWrap: 'balance' } as React.CSSProperties}
                  >
                    {article.title}
                  </h3>

                  <p className="text-[0.7rem] leading-[1.9] text-[var(--color-text-muted)] tracking-[0.02em]">
                    {article.excerpt}
                  </p>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
