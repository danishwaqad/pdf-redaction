import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostsForPage, getTotalBlogPages } from "@/lib/blog";
import { PageHero } from "@/components/layout/page-hero";
import { ContentWithAds } from "@/components/layout/content-with-ads";
import { BlogPostList } from "@/components/blog/blog-post-list";

export function generateStaticParams() {
  const total = getTotalBlogPages();
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export function generateMetadata({
  params,
}: {
  params: { page: string };
}): Metadata {
  const page = Number(params.page);
  if (!Number.isFinite(page) || page < 2) return {};
  return {
    title: `PDF Redaction Blog — Page ${page}`,
    description: `PDF redaction guides — page ${page}. Court, GDPR, Adobe alternatives, and secure workflows.`,
  };
}

export default function BlogPaginatedPage({ params }: { params: { page: string } }) {
  const page = Number(params.page);
  if (!Number.isFinite(page) || page < 2 || page > getTotalBlogPages()) {
    notFound();
  }

  const posts = getPostsForPage(page);

  return (
    <>
      <PageHero
        badge="Resources"
        title="PDF Redaction Blog"
        subtitle={`Page ${page} — in-depth guides for legal, privacy, and security teams.`}
      />
      <ContentWithAds>
        <BlogPostList posts={posts} currentPage={page} />
      </ContentWithAds>
    </>
  );
}
