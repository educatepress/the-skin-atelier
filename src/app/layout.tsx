import type { Metadata } from "next";
import { Noto_Sans_JP, Cormorant_Garamond, Shippori_Mincho } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const shippori = Shippori_Mincho({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-shippori",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skin-atelier.jp"),
  title: "The Skin Atelier by Dr. Miyaka | 美容皮膚科医 みやか先生",
  description:
    "ヒト臨床試験に基づく美容医療と、心・栄養・肌を整えるインナーウェルネス。美容皮膚科医みやかが、流行に流されない「引き算の美しさ」で、10年後の自分をもっと好きになるためのヒントをお届けします。",
  keywords: [
    "美容皮膚科医",
    "みやか先生",
    "エビデンスベース美容医療",
    "インナーケア",
    "インナーウェルネス",
    "引き算の美容",
    "肌育",
    "光老化",
    "ボトックス",
    "ヒアルロン酸",
    "IPL治療",
    "レチノール",
    "スキンケア"
  ],
  openGraph: {
    // 画像は app/opengraph-image.tsx が自動生成 (Next.js File Convention)
    title: "The Skin Atelier by Dr. Miyaka",
    description:
      "エビデンス × インナーウェルネス × 引き算の美容医療。流行に流されず、10年後の自分をもっと好きになるための、美容皮膚科医みやかのジャーナル。",
    locale: "ja_JP",
    type: "website",
    siteName: "The Skin Atelier",
  },
  twitter: {
    // 画像は app/twitter-image.tsx がない場合 opengraph-image が使われる
    card: "summary_large_image",
    title: "The Skin Atelier by Dr. Miyaka",
    description:
      "エビデンスとインナーウェルネスで、10年後の自分をもっと好きに。美容皮膚科医みやかのジャーナル。",
  },
  alternates: {
    canonical: "https://skin-atelier.jp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shippori.variable} ${notoSansJP.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "The Skin Atelier by Dr. Miyaka",
              alternateName: "スキンアトリエ",
              url: "https://skin-atelier.jp",
              inLanguage: "ja-JP",
              description:
                "美容皮膚科医みやかによる、エビデンスとインナーウェルネスを大切にする美容ジャーナル。引き算の美容医療で、10年後の自分をもっと好きになるためのヒントをお届けします。",
              publisher: {
                "@type": "Person",
                name: "Dr. Miyaka",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://skin-atelier.jp/blog?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Dr. Miyaka",
              alternateName: ["みやか先生", "みやか"],
              description:
                "美容皮膚科医。自身の長年の肌悩みと向き合う中で辿り着いた「エビデンスベースの美容医療」と「心・栄養・肌を整えるインナーウェルネス」を融合した独自のアプローチを発信。流行に流されない引き算の美しさを提唱。",
              jobTitle: "美容皮膚科医",
              knowsAbout: [
                "美容皮膚科学",
                "エビデンスベース美容医療",
                "インナーウェルネス",
                "レチノール",
                "ボトックス",
                "ヒアルロン酸",
                "IPL治療",
                "肌育",
                "光老化対策",
              ],
              url: "https://skin-atelier.jp",
              sameAs: [
                "https://www.instagram.com/dr_miyaka_skin/",
                "https://x.com/dr_miyaka",
              ],
            }),
          }}
        />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
