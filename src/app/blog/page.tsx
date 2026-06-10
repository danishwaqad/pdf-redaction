import type { Metadata } from "next";
import { getPostsForPage } from "@/lib/blog";
import { PageHero } from "@/components/layout/page-hero";
import { ContentWithAds } from "@/components/layout/content-with-ads";
import { BlogPostList } from "@/components/blog/blog-post-list";

export const metadata: Metadata = {
  title: "PDF Redaction Blog — Court, GDPR, Adobe & iPhone Guides",
  description:
    "Expert guides on redact pdf online free, permanent redaction, Adobe alternatives, GDPR checklists, and safe mobile workflows.",
};

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
