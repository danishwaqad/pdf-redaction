import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { PageHero } from "@/components/layout/page-hero";
import { ContentWithAds } from "@/components/layout/content-with-ads";
import { Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF Redaction Blog — Court, GDPR, Adobe & iPhone Guides",
  description:
    "Expert guides on redact pdf online free, permanent redaction, Adobe alternatives, GDPR checklists, and safe mobile workflows.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <PageHero
        badge="Resources"
        title="PDF Redaction Blog"
        subtitle="In-depth guides for legal, privacy, and security teams. No fluff — practical workflows you can use today."
      />
      <ContentWithAds>
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
                      <Calendar className="h-3.5 w-3.5" />
                      {post.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </ContentWithAds>
    </>
  );
}
