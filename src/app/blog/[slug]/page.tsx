import { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticleClient from "./blog-article-client";
import { getPostBySlug } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";

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

  return {
    title: `${post.metadata.title.replace(/\n/g, "")} | Journal — The Skin Atelier`,
    description: post.metadata.excerpt,
  };
}

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

  return (
    <BlogArticleClient slug={slug} metadata={post.metadata}>
      {/* サーバーコンポーネントでMDXをコンパイルし、クライアントに渡す */}
      <MDXRemote source={post.content} />
    </BlogArticleClient>
  );
}
