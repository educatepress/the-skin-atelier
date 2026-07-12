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
  title: "The Skin Atelier by Dr. Miyaka | 大人ニキビとエビデンス肌育",
  description:
    "繰り返す大人ニキビ・ニキビ跡に、皮膚科学の根拠で。ホルモン・インナーケア・スキンケアまで、美容皮膚科医みやかが「隠す肌」を「育てる肌」へ導く、エビデンスベースの肌育ジャーナル。",
  keywords: [
    "大人ニキビ",
    "大人ニキビ 治し方",
    "ニキビ跡",
    "繰り返すニキビ",
    "月経前ニキビ",
    "ホルモン ニキビ",
    "スピロノラクトン",
    "イソトレチノイン",
    "ナイアシンアミド",
    "レチノール",
    "インナーケア",
    "エビデンスベース美容医療",
    "肌育",
    "美容皮膚科医",
    "みやか先生"
  ],
  openGraph: {
    // 画像は app/opengraph-image.tsx が自動生成 (Next.js File Convention)
    title: "The Skin Atelier by Dr. Miyaka｜大人ニキビとエビデンス肌育",
    description:
      "繰り返す大人ニキビ・ニキビ跡に、皮膚科学の根拠で。ホルモン・インナーケア・スキンケアまで、美容皮膚科医みやかの肌育ジャーナル。",
    locale: "ja_JP",
    type: "website",
    siteName: "The Skin Atelier",
  },
  twitter: {
    // 画像は app/twitter-image.tsx がない場合 opengraph-image が使われる
    card: "summary_large_image",
    title: "The Skin Atelier by Dr. Miyaka｜大人ニキビとエビデンス肌育",
    description:
      "繰り返す大人ニキビ・ニキビ跡に、皮膚科学の根拠で。美容皮膚科医みやかの肌育ジャーナル。",
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
                "美容皮膚科医みやかによる、大人ニキビ・ニキビ跡を皮膚科学の根拠で紐解く肌育ジャーナル。ホルモン・インナーケア・スキンケアまで、エビデンスベースで「隠す肌」を「育てる肌」へ。",
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
                "美容皮膚科医。自身の長年の肌悩み（大人ニキビ）と向き合う中で辿り着いた、エビデンスベースの肌育とインナーケアを発信。繰り返す大人ニキビ・ニキビ跡に、皮膚科学の根拠で寄り添う。",
              jobTitle: "美容皮膚科医",
              knowsAbout: [
                "大人ニキビ",
                "ニキビ跡",
                "ホルモンとニキビ",
                "スピロノラクトン",
                "イソトレチノイン",
                "ナイアシンアミド",
                "レチノール",
                "インナーケア",
                "エビデンスベース美容医療",
                "肌育",
              ],
              url: "https://skin-atelier.jp",
              sameAs: [
                "https://www.instagram.com/dr_miyaka_skin/",
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
