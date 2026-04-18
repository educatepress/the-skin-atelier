"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitLead, type LeadSubmitResult } from "./actions";

export default function GuideForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<LeadSubmitResult | null>(null);

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitLead(formData);
      setResult(res);
    });
  }

  if (result?.ok) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <span
            className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[var(--color-pink-gold)]"
            aria-hidden
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-[var(--color-pink-gold-deep)]"
            >
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <h3 className="text-[1.05rem] leading-[2] tracking-[0.05em] text-[var(--color-text-mocha)]">
          ご登録ありがとうございます。
        </h3>

        <p className="text-[0.85rem] leading-[2.2] text-[var(--color-text-soft)] tracking-[0.02em]">
          以下のボタンから、ガイドをご覧いただけます。
          <br />
          お時間のあるときに、ゆっくり目を通してみてください。
        </p>

        <Link
          href={result.downloadUrl}
          className="btn-atelier inline-flex justify-center items-center text-xs px-8 py-4 w-full"
        >
          <span className="tracking-[0.15em]">ガイドを開く</span>
          <span className="arrow ml-2">→</span>
        </Link>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="block font-brand text-[10px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mb-2"
        >
          お名前 (任意)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="山田 花子"
          className="w-full border-b border-[var(--color-marble-vein)] bg-transparent py-2 text-[0.9rem] text-[var(--color-text-mocha)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-pink-gold-deep)] focus:outline-none transition-colors tracking-[0.03em]"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block font-brand text-[10px] tracking-[0.3em] text-[var(--color-text-muted)] uppercase mb-2"
        >
          メールアドレス *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full border-b border-[var(--color-marble-vein)] bg-transparent py-2 text-[0.9rem] text-[var(--color-text-mocha)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-pink-gold-deep)] focus:outline-none transition-colors tracking-[0.03em]"
        />
      </div>

      <input type="hidden" name="source" value="guide-3-subtractions" />

      <div className="flex items-start gap-3 pt-2">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 accent-[var(--color-pink-gold-deep)]"
        />
        <label
          htmlFor="consent"
          className="text-[11px] leading-[1.9] text-[var(--color-text-soft)] tracking-[0.02em] cursor-pointer"
        >
          ガイドの配信、および、月に数回の美容ジャーナルのお届けに、メールアドレスを使用することに同意します。いつでも配信停止できます。
        </label>
      </div>

      {result?.ok === false && (
        <p className="text-[0.8rem] text-[#A4564F] leading-[1.9] tracking-[0.02em]">
          {result.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn-atelier inline-flex justify-center items-center text-xs px-8 py-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="tracking-[0.15em]">
          {isPending ? "送信中..." : "ガイドを受け取る"}
        </span>
        {!isPending && <span className="arrow ml-2">→</span>}
      </button>
    </form>
  );
}
