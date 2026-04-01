"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { PostMetadata } from "@/lib/blog";

export default function BlogArticleClient({
  slug,
  metadata,
  children,
}: {
  slug: string;
  metadata: PostMetadata;
  children: React.ReactNode;
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
              className="inline-flex items-center gap-2 text-[0.6rem] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[#E8D3C9] transition-colors duration-500 mb-6 md:mb-12"
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
            <span className="font-brand text-[0.5rem] tracking-[0.5em] text-[#E8D3C9] uppercase">
              {metadata.category}
            </span>
            <span className="w-8 h-[1px] bg-[var(--color-marble-vein)]" />
            <span className="font-brand text-[0.5rem] text-[var(--color-text-muted)] tracking-[0.15em]">
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
              <p className="font-brand text-[0.5rem] tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
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
          <p className="text-[0.5rem] text-[var(--color-text-muted)] mt-14 tracking-[0.03em] opacity-40 leading-[2]">
            ※ この記事は一般的な情報提供を目的としたものであり、個別の医療アドバイスではありません。
            効果には個人差がございます。具体的な治療については専門医にご相談ください。
          </p>
        </motion.article>
      </section>
    </main>
  );
}
