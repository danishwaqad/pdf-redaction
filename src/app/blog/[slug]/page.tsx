import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { useMDXComponents } from "@/mdx-components";
import { BlogCta } from "@/components/blog/blog-cta";
import { FaqSchema } from "@/components/blog/faq-schema";
import { ContentWithAds } from "@/components/layout/content-with-ads";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const components = useMDXComponents({});

  return (
    <>
      <article className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <FaqSchema faqs={post.faqs ?? []} />
          <Link href="/blog" className="text-sm font-medium text-brand hover:underline">
            ← Back to blog
          </Link>
          <header className="mt-6 border-b pb-8">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {post.title}
            </h1>
            <div
              style={{
                background: "#FEF2F2",
                border: "2px solid #DC2626",
                padding: "20px",
                borderRadius: "12px",
                margin: "24px 0",
              }}
            >
              <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                🚀 Skip the Guide: Redact Your PDF Now
              </div>
              <div style={{ marginBottom: "12px" }}>
                Permanently black out text in 3 clicks. No signup, no watermark, 100%
                free.
              </div>
              <a
                href="https://redactpdf.org"
                style={{
                  background: "#DC2626",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-block",
                }}
              >
                Open RedactPDF Tool →
              </a>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {post.date} · {post.readTime}
            </p>
          </header>
        </div>
      </article>

      <ContentWithAds>
        <div className="prose prose-slate max-w-none prose-headings:scroll-mt-24">
          <MDXRemote
            source={post.content}
            components={components}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />

          <p className="mt-8 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This guide is for information only. For legal advice,
            consult your attorney.
          </p>
        </div>

        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-12 rounded-xl border bg-white p-6">
            <h2 className="text-xl font-semibold">Frequently asked questions</h2>
            <dl className="mt-4 space-y-4">
              {post.faqs.map((f) => (
                <div key={f.question}>
                  <dt className="font-medium text-foreground">{f.question}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <BlogCta />
      </ContentWithAds>
    </>
  );
}
