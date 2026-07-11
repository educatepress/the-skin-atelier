import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://skin-atelier.jp";

  // 近似重複記事（canonical で他記事を指すもの）は sitemap から除外し、
  // 正規記事のみを Google に送信してカニバリ・薄いコンテンツ評価を防ぐ。
  const blogEntries = getAllPosts()
    .filter((post) => !post.metadata.canonical)
    .map((post) => ({
      url: `${baseUrl}/blog/${post.metadata.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/philosophy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...blogEntries,
  ];
}
