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
  title: "The Skin Atelier by Dr. Miyaka | 美容皮膚科 みやか先生",
  description:
    "「今の肌が一番好き」と言える贅沢を、あなたへ。美容皮膚科学会所属の医師みやかが、先進の美容医療と分子栄養学であなた本来の透明感を引き出します。",
  openGraph: {
    title: "The Skin Atelier by Dr. Miyaka",
    description:
      "かつて肌トラブルに悩み、遠回りをした美容皮膚科医だからこそ辿り着いた答え。先進の美容医療と分子栄養学で、あなた本来の透明感を。",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Skin Atelier by Dr. Miyaka",
    description:
      "「今の肌が一番好き」と言える贅沢を。美容皮膚科みやか先生のプライベート・スキンアトリエ。",
  },
  robots: { index: true, follow: true },
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
              "@type": "MedicalBusiness",
              name: "The Skin Atelier by Dr. Miyaka",
              description:
                "美容皮膚科医 みやか先生の情報発信サイト。先進の美容医療と分子栄養学の知識を、わかりやすくお届けしています。",
              url: "https://skin-atelier.jp",
              medicalSpecialty: "Dermatology",
              currenciesAccepted: "JPY",
              paymentAccepted: "Cash, Credit Card",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Physician",
              name: "Dr. Miyaka",
              description:
                "美容皮膚科学会所属。長年のニキビ治療経験を持つ美容皮膚科医。先進の美容医療と分子栄養学を融合した独自アプローチ。",
              medicalSpecialty: "Dermatology",
              url: "https://skin-atelier.jp",
            }),
          }}
        />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
