import { Metadata } from "next";
import BlogListClient from "./blog-list-client";

export const metadata: Metadata = {
  title: "Journal | The Skin Atelier by Dr. Miyaka",
  description:
    "美容皮膚科医 Dr.みやかが、エビデンスに基づく美容医療の知識と、内側から輝く美しさのヒントをお届けするジャーナル。",
};

// Sample articles (later: fetch from MDX/CMS)
const articles = [
  {
    slug: "photofacial-vs-laser",
    title: "フォトフェイシャルとレーザーの違い。\n正しい選び方とは。",
    excerpt:
      "「シミ取り＝レーザー」と思い込んでいませんか？ 実はフォトフェイシャル（IPL）とレーザーでは、肌へのアプローチが根本的に異なります。",
    category: "Treatment",
    date: "2026.03",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "molecular-nutrition-skin",
    title: "美容皮膚科医が自分の肌で実感した、\n分子栄養学の力。",
    excerpt:
      "外側からの美容医療だけで満足していた私が、インナーケアの世界に足を踏み入れた理由。",
    category: "Inner Care",
    date: "2026.03",
    readTime: "7 min read",
    featured: true,
  },
  {
    slug: "hyaluronic-acid-subtraction",
    title: "「やりすぎない」ヒアルロン酸。\n0.1mlへのこだわり。",
    excerpt:
      "注入治療で最も大切なのは「引き算」の美学。あなたの骨格と表情に合わせたデザインで、気づかれないほど自然な変化を。",
    category: "Injectable",
    date: "2026.04",
    readTime: "4 min read",
    featured: false,
  },
  {
    slug: "skincare-routine-dermatologist",
    title: "皮膚科医のスキンケアルーティン。\n本当に必要なものだけ。",
    excerpt:
      "10ステップの韓国式ケアに疲れたあなたへ。皮膚科医が毎日使うのは、たった3つのアイテムです。",
    category: "Skincare",
    date: "2026.04",
    readTime: "3 min read",
    featured: false,
  },
  {
    slug: "first-time-aesthetic-30s",
    title: "30代、はじめての美容医療。\n「何から始めればいい？」",
    excerpt:
      "最初の一歩が最も大切。遠回りしないための、美容皮膚科医からのロードマップ。",
    category: "Beginner",
    date: "2026.04",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "botox-how-many-times",
    title: "ボトックスは何回打てばいい？\n持続期間と最適な頻度。",
    excerpt:
      "「打ち続けないといけないの？」その不安にエビデンスで答えます。",
    category: "Injectable",
    date: "2026.05",
    readTime: "4 min read",
    featured: false,
  },
];

export default function BlogPage() {
  return <BlogListClient articles={articles} />;
}
