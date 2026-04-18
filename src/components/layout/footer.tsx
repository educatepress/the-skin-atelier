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
            <p className="font-brand text-[11px] tracking-[0.15em] text-[var(--color-text-muted)] uppercase mb-[var(--space-lg)]">
              by Dr. Miyaka
            </p>
            <p className="text-[0.75rem] leading-[2] text-[var(--color-text-muted)] tracking-[0.02em]">
              美容皮膚科学会所属
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-brand text-[11px] tracking-[0.2em] text-[var(--color-text-muted)] uppercase mb-[var(--space-md)]">
              Navigation
            </p>
            <div className="flex flex-col gap-[var(--space-sm)]">
              {[
                { label: "Philosophy", href: "/#philosophy" },
                { label: "Journal", href: "/#blog" },
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
            <p className="font-brand text-[11px] tracking-[0.2em] text-[var(--color-text-muted)] uppercase mb-[var(--space-md)]">
              Connect
            </p>
            <div className="flex flex-col gap-[var(--space-sm)]">
              <a
                href="https://www.instagram.com/dr_miyaka_skin/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram で Dr. Miyaka をフォロー"
                className="text-[0.75rem] text-[var(--color-text-soft)] hover:text-[var(--color-pink-gold-deep)] transition-colors duration-300 tracking-[0.03em]"
              >
                Instagram
              </a>
              <a
                href="https://x.com/dr_miyaka"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) で Dr. Miyaka をフォロー"
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
            <p className="text-[11px] text-[var(--color-text-muted)] tracking-[0.05em]">
              © 2026 The Skin Atelier by Dr. Miyaka. All rights reserved.
            </p>
          </div>

          {/* Medical advertising compliance */}
          <p className="text-[11px] text-[var(--color-text-muted)] text-center mt-[var(--space-lg)] leading-[1.8] tracking-[0.03em] opacity-70">
            ※当サイトは美容医療に関する一般的な情報を提供するメディアであり、特定の医療機関での診療を代替するものではありません。
            <br />
            ご自身の肌質や体質に合わせた個別の判断については、身近な医療機関にご相談ください。
          </p>
        </div>
      </div>
    </footer>
  );
}
