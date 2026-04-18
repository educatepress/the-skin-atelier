"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { PostMetadata } from "@/lib/blog";

export default function BlogArticleClient({
  slug,
  metadata,
  children,
  relatedPosts = [],
}: {
  slug: string;
  metadata: PostMetadata;
  children: React.ReactNode;
  relatedPosts?: PostMetadata[];
}) {
  return (
    <main className="min-h-screen bg-[#FDFCFA]">
      {/* Article header */}
      <section className="pt-32 pb-16 px-6 relative">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 30% 30%, rgba(232,211,201,0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, rgba(245,230,216,0.2) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative z-10 max-w-[680px] mx-auto">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[11px] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500 mb-6 md:mb-12"
            >
              ← Journal
            </Link>
          </motion.div>

          {/* Category + Date */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="font-brand text-[11px] tracking-[0.5em] text-[var(--color-pink-gold-deep)] uppercase">
              {metadata.category}
            </span>
            <span className="w-8 h-[1px] bg-[var(--color-marble-vein)]" />
            <span className="font-brand text-[11px] text-[var(--color-text-muted)] tracking-[0.15em]">
              {metadata.date}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-[clamp(1.3rem,3.5vw,2.2rem)] leading-[1.7] tracking-[0.08em] text-[var(--color-text-mocha)] font-normal mb-8"
            style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            {metadata.title}
          </motion.h1>

          {/* Author + Read time */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-6 pb-10 border-b border-[var(--color-marble-vein)]"
          >
            <Image
              src="/images/profile/dr-miyaka-avatar.jpg"
              alt="Dr. みやか"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-[0.75rem] text-[var(--color-text-mocha)] tracking-[0.03em]">
                Dr. みやか
              </p>
              <p className="font-brand text-[11px] tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
                {metadata.readTime}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article body — typography-focused */}
      <section className="px-6 pb-32">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-[680px] mx-auto prose-atelier"
        >
          {children}

          {/* Medical disclaimer */}
          <p className="text-[11px] text-[var(--color-text-muted)] mt-14 tracking-[0.03em] opacity-70 leading-[2]">
            ※ この記事は一般的な情報提供を目的としたものであり、個別の医療アドバイスではありません。
            効果には個人差がございます。具体的な治療については専門医にご相談ください。
          </p>
        </motion.article>
      </section>

      {/* SNS Follow CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-[680px] mx-auto">
          <div className="bg-white/60 border border-[var(--color-marble-vein)] rounded-sm p-8 md:p-10 text-center">
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-4">
              Stay Connected
            </p>
            <h3 className="text-[1.1rem] text-[var(--color-text-mocha)] tracking-[0.08em] leading-[2] mb-6">
              日々の気づきや、論文から見えてきた新しい美しさのヒントを、
              <br className="hidden md:block" />
              Instagram と X でもお届けしています。
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.instagram.com/dr_miyaka_skin/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram で Dr. Miyaka をフォロー"
                className="btn-atelier inline-flex justify-center items-center text-xs px-6 py-3"
              >
                <span className="tracking-[0.15em]">Instagram をフォロー</span>
                <span className="arrow ml-2">→</span>
              </a>
              <a
                href="https://x.com/dr_miyaka"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) で Dr. Miyaka をフォロー"
                className="btn-atelier inline-flex justify-center items-center text-xs px-6 py-3"
              >
                <span className="tracking-[0.15em]">X (Twitter) をフォロー</span>
                <span className="arrow ml-2">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="px-6 pb-32 border-t border-[var(--color-marble-vein)] pt-16">
          <div className="max-w-[1100px] mx-auto">
            <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-text-muted)] uppercase mb-4 text-center">
              Related Journal
            </p>
            <h2 className="font-brand text-[clamp(1.4rem,3vw,2rem)] text-[var(--color-text-mocha)] italic tracking-[0.08em] text-center mb-12">
              あわせて読みたい記事
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  {post.image && (
                    <div className="aspect-[4/5] overflow-hidden mb-5 relative bg-[var(--color-marble-vein)]">
                      <Image
                        src={post.image}
                        alt={post.title.replace(/\n/g, "")}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-brand text-[10px] tracking-[0.3em] text-[var(--color-pink-gold-deep)] uppercase">
                      {post.category}
                    </span>
                    <span className="w-4 h-[1px] bg-[var(--color-marble-vein)]" />
                    <span className="font-brand text-[10px] text-[var(--color-text-muted)] tracking-[0.15em]">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-[0.95rem] text-[var(--color-text-mocha)] tracking-[0.05em] leading-[1.8] group-hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500 mb-3">
                    {post.title.replace(/\n/g, "")}
                  </h3>
                  <p className="text-[0.75rem] text-[var(--color-text-soft)] leading-[2] tracking-[0.03em] line-clamp-3">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[11px] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[var(--color-pink-gold-deep)] transition-colors duration-500"
              >
                すべての記事を読む →
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
