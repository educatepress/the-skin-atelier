import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticleClient from "./blog-article-client";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";

const SITE_URL = "https://skin-atelier.jp";

// Dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: `Not Found | Journal — The Skin Atelier` };
  }

  const cleanTitle = post.metadata.title.replace(/\n/g, "");
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const imageUrl = post.metadata.image
    ? `${SITE_URL}${post.metadata.image}`
    : `${SITE_URL}/opengraph-image`;

  return {
    title: `${cleanTitle} | Journal — The Skin Atelier`,
    description: post.metadata.excerpt,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: cleanTitle,
      description: post.metadata.excerpt,
      url: articleUrl,
      type: "article",
      locale: "ja_JP",
      siteName: "The Skin Atelier",
      publishedTime: post.metadata.date,
      authors: ["Dr. Miyaka"],
      tags: [post.metadata.category],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: cleanTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: cleanTitle,
      description: post.metadata.excerpt,
      images: [imageUrl],
    },
  };
}

// ビルド時に存在しない新規ブログ記事もSSRで表示できるようにする
export const dynamicParams = true;

export async function generateStaticParams() {
  const { getPostSlugs } = await import("@/lib/blog");
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx?$/, ""),
  }));
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const cleanTitle = post.metadata.title.replace(/\n/g, "");
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  const imageUrl = post.metadata.image
    ? `${SITE_URL}${post.metadata.image}`
    : `${SITE_URL}/opengraph-image`;
  const relatedPosts = getRelatedPosts(slug, 3);

  // Article Schema (BlogPosting) for Google rich results
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: cleanTitle,
    description: post.metadata.excerpt,
    image: imageUrl,
    datePublished: post.metadata.date,
    dateModified: post.metadata.date,
    author: {
      "@type": "Person",
      name: "Dr. Miyaka",
      url: SITE_URL,
      sameAs: [
        "https://www.instagram.com/dr_miyaka_skin/",
        "https://x.com/dr_miyaka",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "The Skin Atelier",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-noback.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: post.metadata.category,
    inLanguage: "ja-JP",
  };

  // Breadcrumb
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cleanTitle,
        item: articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogArticleClient slug={slug} metadata={post.metadata} relatedPosts={relatedPosts}>
        {/* サーバーコンポーネントでMDXをコンパイルし、クライアントに渡す */}
        <MDXRemote source={post.content} />
      </BlogArticleClient>
    </>
  );
}
