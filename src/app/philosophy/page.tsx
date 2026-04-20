import { Metadata } from "next";
import PhilosophyClient from "./philosophy-client";

const SITE_URL = "https://skin-atelier.jp";
const PAGE_URL = `${SITE_URL}/philosophy`;

export const metadata: Metadata = {
  title: "わたしが大切にしていること | My Philosophy — The Skin Atelier by Dr. Miyaka",
  description:
    "美容医療を、誰のために、どう使うか。美容皮膚科医みやかが大切にしている3つの軸——エビデンス、インナーウェルネス、引き算。流行に流されず、10年後の自分をもっと好きになるための考え方をお伝えします。",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "わたしが大切にしていること | The Skin Atelier",
    description:
      "美容医療を、誰のために、どう使うか。エビデンス × インナーウェルネス × 引き算。美容皮膚科医みやかの考え方。",
    url: PAGE_URL,
    type: "article",
    locale: "ja_JP",
    siteName: "The Skin Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "わたしが大切にしていること | The Skin Atelier",
    description:
      "美容医療を、誰のために、どう使うか。美容皮膚科医みやかの考え方。",
  },
};

export default function PhilosophyPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Philosophy", item: PAGE_URL },
    ],
  };

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "わたしが大切にしていること — My Philosophy",
    url: PAGE_URL,
    inLanguage: "ja-JP",
    description:
      "美容皮膚科医みやかが大切にしている3つの軸——エビデンス、インナーウェルネス、引き算。",
    mainEntity: {
      "@type": "Person",
      name: "Dr. Miyaka",
      alternateName: "みやか先生",
      jobTitle: "美容皮膚科医",
      url: SITE_URL,
      sameAs: [
        "https://www.instagram.com/dr_miyaka_skin/",
        "https://x.com/dr_miyaka_skin",
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <PhilosophyClient />
    </>
  );
}
