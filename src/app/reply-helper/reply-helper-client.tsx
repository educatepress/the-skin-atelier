"use client";

import { useState, useTransition } from "react";
import { generateReplyDrafts, type ReplyDraftsResult, type ReplyDraft } from "./actions";

export default function ReplyHelperClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ReplyDraftsResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [originalTweet, setOriginalTweet] = useState("");
  const [context, setContext] = useState("");

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      setResult(null);
      const res = await generateReplyDrafts(formData);
      setResult(res);
    });
  }

  async function copyToClipboard(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  }

  function regenerate() {
    const fd = new FormData();
    fd.append("tweet", originalTweet);
    fd.append("context", context);
    onSubmit(fd);
  }

  return (
    <main className="min-h-screen bg-[#FDFCFA] py-16 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <header className="mb-12">
          <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-3">
            Internal Tool
          </p>
          <h1 className="text-[clamp(1.6rem,3.5vw,2.2rem)] tracking-[0.08em] text-[var(--color-text-mocha)] mb-4">
            Reply Helper
          </h1>
          <p className="text-[0.9rem] leading-[2] text-[var(--color-text-soft)] tracking-[0.04em] max-w-[640px]">
            Xで気になったツイートへの返信案を、3つのトーンで瞬時に生成します。
            <br />
            気に入った案をコピーして、X アプリで貼り付けるだけ。
          </p>
        </header>

        <div className="grid md:grid-cols-[420px_1fr] gap-10 items-start">
          {/* Left: Form */}
          <aside className="md:sticky md:top-8">
            <form action={onSubmit} className="bg-white/70 border border-[var(--color-marble-vein)] p-6 md:p-8 space-y-5">
              <div>
                <label
                  htmlFor="tweet"
                  className="block font-brand text-[10px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mb-2"
                >
                  相手のツイート本文 *
                </label>
                <textarea
                  id="tweet"
                  name="tweet"
                  required
                  value={originalTweet}
                  onChange={(e) => setOriginalTweet(e.target.value)}
                  placeholder="ここに相手のツイート本文をそのまま貼り付けてください"
                  rows={7}
                  className="w-full border border-[var(--color-marble-vein)] bg-white p-3 text-[0.9rem] leading-[1.8] text-[var(--color-text-mocha)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-pink-gold-deep)] focus:outline-none tracking-[0.02em] resize-y"
                />
              </div>

              <div>
                <label
                  htmlFor="context"
                  className="block font-brand text-[10px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mb-2"
                >
                  文脈メモ (任意)
                </label>
                <textarea
                  id="context"
                  name="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="例: 明らかな誤解があるので優しく訂正したい / 既にフォロワー同士で好意的なトーン / 論文を補足したい"
                  rows={3}
                  className="w-full border border-[var(--color-marble-vein)] bg-white p-3 text-[0.85rem] leading-[1.8] text-[var(--color-text-mocha)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-pink-gold-deep)] focus:outline-none tracking-[0.02em] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !originalTweet.trim()}
                className="btn-atelier inline-flex justify-center items-center text-xs px-8 py-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="tracking-[0.15em]">
                  {isPending ? "生成中..." : "3種類のリプライを生成"}
                </span>
                {!isPending && <span className="arrow ml-2">→</span>}
              </button>

              {result?.ok === false && (
                <p className="text-[0.8rem] text-[#A4564F] leading-[1.9] tracking-[0.02em]">
                  {result.error}
                </p>
              )}

              {result?.ok && (
                <button
                  type="button"
                  onClick={regenerate}
                  disabled={isPending}
                  className="text-[11px] font-brand tracking-[0.3em] text-[var(--color-text-muted)] uppercase hover:text-[var(--color-pink-gold-deep)] transition-colors disabled:opacity-50"
                >
                  ↻ もう一度生成
                </button>
              )}
            </form>
          </aside>

          {/* Right: Output */}
          <section>
            {!result && !isPending && (
              <div className="text-center py-24 text-[var(--color-text-muted)]">
                <p className="font-brand text-[11px] tracking-[0.3em] uppercase mb-2">Waiting</p>
                <p className="text-[0.85rem] leading-[2] tracking-[0.03em]">
                  左のフォームにツイート本文を貼り付けて、
                  <br />
                  「3種類のリプライを生成」を押してください。
                </p>
              </div>
            )}

            {isPending && (
              <div className="text-center py-24 text-[var(--color-text-muted)]">
                <p className="font-brand text-[11px] tracking-[0.3em] uppercase">Generating...</p>
              </div>
            )}

            {result?.ok && (
              <div className="space-y-6">
                {result.drafts.map((draft: ReplyDraft, idx: number) => (
                  <div
                    key={draft.tone}
                    className="bg-white/80 border border-[var(--color-marble-vein)] p-6 md:p-7"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <p className="font-brand text-[11px] tracking-[0.4em] text-[var(--color-pink-gold-deep)] uppercase mb-2">
                          <span className="mr-2">{draft.icon}</span>
                          {draft.label}
                        </p>
                        <p className="text-[0.75rem] leading-[1.8] text-[var(--color-text-muted)] tracking-[0.02em]">
                          {draft.description}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(draft.text, idx)}
                        className="shrink-0 border border-[var(--color-marble-vein)] px-4 py-2 text-[11px] font-brand tracking-[0.2em] uppercase text-[var(--color-text-mocha)] hover:bg-[var(--color-champagne-light)] hover:border-[var(--color-pink-gold)] transition-all"
                      >
                        {copiedIdx === idx ? "✓ Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="bg-white border-l-2 border-[var(--color-pink-gold)] p-5">
                      <p className="text-[0.95rem] leading-[2] text-[var(--color-text-mocha)] tracking-[0.04em] whitespace-pre-wrap">
                        {draft.text}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--color-text-muted)] tracking-[0.03em]">
                      <span>{draft.text.length} 文字</span>
                      {draft.text.length > 140 && (
                        <span className="text-[#A4564F]">⚠️ 140字を超えています</span>
                      )}
                    </div>
                  </div>
                ))}

                <div className="text-center pt-4">
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-[2] tracking-[0.03em]">
                    気に入った案の「Copy」を押して、X アプリで貼り付けてください。
                    <br />
                    必要に応じて微調整 → 投稿。
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
