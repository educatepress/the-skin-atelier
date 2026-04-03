"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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
          {/* Back link: 小さすぎた文字を text-xs(12px) に引き上げ、ホバーでモカ色へ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-brand tracking-[0.15em] text-[var(--color-text-muted)] uppercase hover:text-[#B5998C] transition-colors duration-500 mb-12"
            >
              ← Journal
            </Link>
          </motion.div>

          {/* Category + Date: 白飛びする色をモカブラウン(#A88D82)にし、最小11px確保 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="font-brand text-[11px] sm:text-xs font-medium tracking-[0.2em] text-[#A88D82] uppercase">
              {metadata.category}
            </span>
            <span className="w-8 h-[1px] bg-[var(--color-marble-vein)]" />
            <span className="text-[11px] sm:text-xs text-[var(--color-text-muted)] tracking-[0.05em]">
              {metadata.date}
            </span>
          </motion.div>

          {/* Title: 英語向けの広すぎる行間を、日本語が美しく見える leading-[1.45] に変更 */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.45] tracking-[0.05em] text-[var(--color-text-mocha)] font-normal mb-8 whitespace-pre-line"
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
            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-[var(--color-marble-vein)] shrink-0">
              <Image src="/images/profile/dr-miyaka-1.jpg" alt="Dr. Miyaka" fill className="object-cover object-[center_15%]" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-mocha)] tracking-[0.03em]">
                Dr. みやか
              </p>
              <p className="font-brand text-[11px] tracking-[0.1em] text-[var(--color-text-muted)] uppercase mt-0.5">
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

          {/* Medical disclaimer: 0.5rem(8px)＋opacity-40 では読めないので、11px＋opacity-70に調整 */}
          <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-16 pt-8 border-t border-[var(--color-marble-vein)] tracking-[0.03em] opacity-70 leading-[2]">
            ※ この記事は一般的な情報提供を目的としたものであり、個別の医療アドバイスではありません。
            効果には個人差がございます。具体的な治療については専門医にご相談ください。
          </p>
        </motion.article>
      </section>
    </main>
  );
}
