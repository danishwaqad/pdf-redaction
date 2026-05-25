import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");
const BLOG_ALIASES: Record<string, string> = {
  "how-to-redact-a-pdf-on-iphone-ipad": "redact-pdf-on-iphone-guide",
};

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  readTime: string;
  faqs?: BlogFaq[];
}

export interface BlogPostMeta extends BlogFrontmatter {
  slug: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export function resolveBlogSlug(slug: string): string {
  return BLOG_ALIASES[slug] ?? slug;
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function toMeta(post: BlogPost): BlogPostMeta {
  const { slug, title, description, date, readTime, faqs } = post;
  return { slug, title, description, date, readTime, faqs };
}

export function getAllPosts(): BlogPostMeta[] {
  return getAllPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is BlogPost => p !== null)
    .map(toMeta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const resolvedSlug = resolveBlogSlug(slug);
  const filePath = path.join(BLOG_DIR, `${resolvedSlug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug: resolvedSlug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    readTime: data.readTime as string,
    faqs: (data.faqs as BlogFaq[]) ?? [],
    content,
  };
}
