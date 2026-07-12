import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/blog");

/**
 * MDX(CommonMark)の強調記法は、閉じ ** の直前が全角約物（）」』"など）だと
 * right-flanking と判定されず、** が生のまま本文に露出する（CJK特有の既知挙動）。
 * これを回避するため、コードブロック外の **太字** を <strong> に正規化する。
 * ・イタリックの単体 * には手を触れない
 * ・``` で囲われたコードブロック内は変換しない
 */
function normalizeStrongEmphasis(md: string): string {
  let inFence = false;
  return md
    .split("\n")
    .map((line) => {
      if (line.trimStart().startsWith("```")) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      // 同一行内の **...** を <strong>...</strong> に（開始直後の空白は除外）
      return line
        .replace(/\*\*(?!\s)(.+?)\*\*/g, "<strong>$1</strong>")
        // <strong>直後に句読点・約物が来ると、インライン境界でその約物が行頭に送られる。
        // word-joiner(U+2060/改行禁止)を挟んで、約物を直前の語に貼り付ける（行頭禁則の担保）。
        .replace(/<\/strong>([、。，．」』）】〉》！？：；])/g, "</strong>⁠$1");
    })
    .join("\n");
}

export interface PostMetadata {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  image?: string;
  /** 近似重複記事を正規URLへ集約するための優先記事スラッグ。未指定なら自分自身が正規。 */
  canonical?: string;
}

export interface Post {
  metadata: PostMetadata;
  content: string;
}

/**
 * Get all blog post slugs
 */
export function getPostSlugs() {
  if (!fs.existsSync(POSTS_DIRECTORY)) return [];
  return fs.readdirSync(POSTS_DIRECTORY).filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.mdx?$/, "");
  const mdPath = path.join(POSTS_DIRECTORY, `${realSlug}.md`);
  const mdxPath = path.join(POSTS_DIRECTORY, `${realSlug}.mdx`);
  
  let fullPath = "";
  if (fs.existsSync(mdxPath)) {
    fullPath = mdxPath;
  } else if (fs.existsSync(mdPath)) {
    fullPath = mdPath;
  } else {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    metadata: {
      slug: realSlug,
      title: data.title || "",
      excerpt: data.excerpt || "",
      category: data.category || "Journal",
      date: data.date || "",
      readTime: data.readTime || "5 min read",
      featured: typeof data.featured === "boolean" ? data.featured : false,
      image: data.image || "",
      canonical: typeof data.canonical === "string" && data.canonical ? data.canonical : undefined,
    },
    content: normalizeStrongEmphasis(content),
  };
}

/**
 * Get all posts sorted by date
 */
export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((post1, post2) => (post1.metadata.date > post2.metadata.date ? -1 : 1));
  return posts;
}

/**
 * Get related posts: same category first, then recent others.
 * Excludes the current post itself.
 */
export function getRelatedPosts(currentSlug: string, limit = 3): PostMetadata[] {
  const all = getAllPosts();
  const current = all.find((p) => p.metadata.slug === currentSlug);
  if (!current) return [];

  const others = all.filter((p) => p.metadata.slug !== currentSlug);

  // Same category first, sorted by date desc (already sorted by getAllPosts)
  const sameCategory = others.filter(
    (p) => p.metadata.category === current.metadata.category
  );
  const differentCategory = others.filter(
    (p) => p.metadata.category !== current.metadata.category
  );

  return [...sameCategory, ...differentCategory]
    .slice(0, limit)
    .map((p) => p.metadata);
}
