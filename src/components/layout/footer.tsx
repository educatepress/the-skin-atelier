import FadeIn from "@/components/common/fade-in";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-marble-vein)]">
      <div className="max-w-5xl mx-auto px-6 py-[var(--space-2xl)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-xl)]">
          {/* Brand */}
          <div>
            <p className="font-brand text-[0.8rem] tracking-[0.2em] text-[var(--color-text-mocha)] uppercase mb-[var(--space-sm)]">
              The Skin Atelier
            </p>
            <p className="font-brand text-[0.6rem] tracking-[0.15em] text-[var(--color-text-muted)] uppercase mb-[var(--space-lg)]">
              by Dr. Miyaka
            </p>
            <p className="text-[0.75rem] leading-[2] text-[var(--color-text-muted)] tracking-[0.02em]">
              美容皮膚科学会所属
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-brand text-[0.65rem] tracking-[0.2em] text-[var(--color-text-muted)] uppercase mb-[var(--space-md)]">
              Navigation
            </p>
            <div className="flex flex-col gap-[var(--space-sm)]">
              {[
                { label: "Philosophy", href: "/#philosophy" },
                { label: "Treatments", href: "/#treatments" },
                { label: "Menu", href: "/menu" },
                { label: "Journal", href: "/#blog" },
                { label: "FAQ", href: "/#faq" },
                { label: "Invitation", href: "/#invitation" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[0.75rem] text-[var(--color-text-soft)] hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300 tracking-[0.03em]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact / SNS */}
          <div>
            <p className="font-brand text-[0.65rem] tracking-[0.2em] text-[var(--color-text-muted)] uppercase mb-[var(--space-md)]">
              Connect
            </p>
            <div className="flex flex-col gap-[var(--space-sm)]">
              <a
                href="#"
                className="text-[0.75rem] text-[var(--color-text-soft)] hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300 tracking-[0.03em]"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-[0.75rem] text-[var(--color-text-soft)] hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300 tracking-[0.03em]"
              >
                X (Twitter)
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-[var(--space-2xl)] pt-[var(--space-lg)] border-t border-[var(--color-marble-vein)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-[var(--space-md)]">
            <p className="text-[0.65rem] text-[var(--color-text-muted)] tracking-[0.05em]">
              © 2026 The Skin Atelier by Dr. Miyaka. All rights reserved.
            </p>
            <div className="flex gap-[var(--space-lg)]">
              <a
                href="#"
                className="text-[0.6rem] text-[var(--color-text-muted)] hover:text-[var(--color-text-soft)] transition-colors tracking-[0.05em]"
              >
                プライバシーポリシー
              </a>
              <a
                href="#"
                className="text-[0.6rem] text-[var(--color-text-muted)] hover:text-[var(--color-text-soft)] transition-colors tracking-[0.05em]"
              >
                特定商取引法に基づく表記
              </a>
            </div>
          </div>

          {/* Medical advertising compliance */}
          <p className="text-[0.55rem] text-[var(--color-text-muted)] text-center mt-[var(--space-lg)] leading-[1.8] tracking-[0.03em]">
            ※ 当サイトは医療広告ガイドラインに準拠しています。掲載されている治療には個人差があり、効果を保証するものではありません。
            <br />
            治療のリスク・副作用・費用については、カウンセリング時に詳しくご説明いたします。
          </p>
        </div>
      </div>
    </footer>
  );
}
