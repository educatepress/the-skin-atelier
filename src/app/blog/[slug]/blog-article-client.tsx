"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function BlogArticleClient({ slug }: { slug: string }) {
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
              className="inline-flex items-center gap-2 text-[0.6rem] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[#E8D3C9] transition-colors duration-500 mb-12"
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
              Treatment
            </span>
            <span className="w-8 h-[1px] bg-[var(--color-marble-vein)]" />
            <span className="text-[0.5rem] text-[var(--color-text-muted)] tracking-[0.1em]">
              2026.03
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.8] tracking-[0.1em] text-[var(--color-text-mocha)] font-normal mb-8"
          >
            フォトフェイシャルとレーザーの違い。
            <br />
            正しい選び方とは。
          </motion.h1>

          {/* Author + Read time */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-6 pb-10 border-b border-[var(--color-marble-vein)]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-champagne-light)] to-[var(--color-surface)]" />
            <div>
              <p className="text-[0.75rem] text-[var(--color-text-mocha)] tracking-[0.03em]">
                Dr. みやか
              </p>
              <p className="font-brand text-[0.5rem] tracking-[0.2em] text-[var(--color-text-muted)] uppercase">
                5 min read
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
          {/* Smart Brevity: The Lede */}
          <div className="mb-14">
            <p className="text-[1rem] leading-[2.4] text-[var(--color-text-mocha)] tracking-[0.03em]">
              <strong>
                「シミ取り＝レーザー」と思い込んでいませんか？
              </strong>{" "}
              実はフォトフェイシャル（IPL）とレーザーでは、肌へのアプローチが根本的に異なります。どちらが「正解」かは、あなたの肌の状態次第です。
            </p>
          </div>

          {/* Why it matters */}
          <div className="mb-14">
            <h2 className="font-brand text-[0.6rem] tracking-[0.5em] text-[#E8D3C9] uppercase mb-6">
              Why It Matters
            </h2>
            <ul className="space-y-4 text-[0.9rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.02em]">
              <li className="flex gap-3">
                <span className="text-[#E8D3C9] font-brand text-[0.7rem] mt-1">✦</span>
                <span>
                  フォトフェイシャルは「肌全体の底上げ」、レーザーは「ピンポイント治療」。目的を間違えると遠回りに。
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E8D3C9] font-brand text-[0.7rem] mt-1">✦</span>
                <span>
                  IPLは複数の波長を同時に照射するため、シミ・赤み・毛穴を一度に改善できる。
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#E8D3C9] font-brand text-[0.7rem] mt-1">✦</span>
                <span>
                  ダウンタイムがほぼゼロのIPLは、「日常に美容医療を取り入れたい」人の最初の一歩に最適。
                </span>
              </li>
            </ul>
          </div>

          {/* Go Deeper */}
          <div className="mb-14 space-y-10">
            <h2 className="font-brand text-[0.6rem] tracking-[0.5em] text-[#E8D3C9] uppercase mb-6">
              Go Deeper
            </h2>

            <div>
              <h3 className="text-[1.05rem] tracking-[0.06em] text-[var(--color-text-mocha)] mb-4 leading-[1.6]">
                IPLとレーザーの違いを30秒で理解する
              </h3>
              <p className="text-[0.9rem] leading-[2.3] text-[var(--color-text-soft)] tracking-[0.02em]">
                この記事はサンプルです。実際のブログ記事では、ここにSmart Brevity形式のエビデンスベースの解説が入ります。PubMedやAADガイドラインからの引用を含みます。
              </p>
            </div>

            <div className="border-l-2 border-[#E8D3C9] pl-8 py-2">
              <p className="text-[0.85rem] leading-[2.2] text-[var(--color-text-mocha)] italic tracking-[0.02em]">
                「肌の土台を丁寧に耕すこと——それが、遠回りしない美肌への最短ルートです」
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-14">
            <h2 className="font-brand text-[0.6rem] tracking-[0.5em] text-[#E8D3C9] uppercase mb-6">
              FAQ
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-[0.9rem] text-[var(--color-text-mocha)] tracking-[0.03em] font-medium mb-2">
                  Q. フォトフェイシャルは何回で効果が出ますか？
                </p>
                <p className="text-[0.85rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.02em]">
                  一般的に3〜5回の施術で効果を実感される方が多いと報告されています。
                </p>
              </div>
              <div>
                <p className="text-[0.9rem] text-[var(--color-text-mocha)] tracking-[0.03em] font-medium mb-2">
                  Q. フォトフェイシャルのダウンタイムは？
                </p>
                <p className="text-[0.85rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.02em]">
                  ほぼありません。施術直後からメイク可能です。
                </p>
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div className="pt-10 border-t border-[var(--color-marble-vein)]">
            <p className="text-[0.9rem] leading-[2.2] text-[var(--color-text-mocha)] tracking-[0.03em]">
              あなたの肌にとっての「正解」は、あなたの肌の状態を知ることから始まります。
            </p>
          </div>

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
