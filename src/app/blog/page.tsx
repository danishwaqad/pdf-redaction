import type { Metadata } from "next";
import { getPostsForPage } from "@/lib/blog";
import { PageHero } from "@/components/layout/page-hero";
import { ContentWithAds } from "@/components/layout/content-with-ads";
import { BlogPostList } from "@/components/blog/blog-post-list";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "PDF Redaction Blog — Court, GDPR, Adobe & iPhone Guides",
  "Expert guides on redact pdf online free, permanent redaction, Adobe alternatives, GDPR checklists, and safe mobile workflows.",
  "/blog"
);

export default function BlogPage() {
  const posts = getPostsForPage(1);

  return (
    <>
      <PageHero
        badge="Resources"
        title="PDF Redaction Blog"
        subtitle="In-depth guides for legal, privacy, and security teams. No fluff — practical workflows you can use today."
      />
      <ContentWithAds>
        <BlogPostList posts={posts} currentPage={1} />
      </ContentWithAds>
    </>
  );
}
