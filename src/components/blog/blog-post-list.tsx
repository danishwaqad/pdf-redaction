import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blog";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { formatBlogDate, formatReadTime } from "@/lib/utils";

export function BlogPostList({
  posts,
  currentPage,
}: {
  posts: BlogPostMeta[];
  currentPage: number;
}) {
  return (
    <>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="group rounded-2xl border bg-white p-6 shadow-card transition-shadow hover:shadow-drop">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-semibold text-foreground group-hover:text-brand">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {formatReadTime(post.readTime)}
                  </span>
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ul>
      <BlogPagination currentPage={currentPage} />
    </>
  );
}
