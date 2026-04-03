import { Metadata } from "next";
import BlogListClient from "./blog-list-client";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Journal | The Skin Atelier by Dr. Miyaka",
  description:
    "美容皮膚科医 Dr.みやかが、エビデンスに基づく美容医療の知識と、内側から輝く美しさのヒントをお届けするジャーナル。",
};

export default function BlogPage() {
  const posts = getAllPosts();
  
  const articles = posts.map(post => ({
    slug: post.metadata.slug,
    title: post.metadata.title,
    excerpt: post.metadata.excerpt,
    category: post.metadata.category,
    date: post.metadata.date,
    readTime: post.metadata.readTime,
    featured: post.metadata.featured || false,
    image: post.metadata.image || "",
  }));

  return <BlogListClient articles={articles} />;
}
