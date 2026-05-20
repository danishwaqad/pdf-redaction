import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mb-6 mt-2 text-3xl font-bold tracking-tight text-foreground">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 scroll-mt-24 text-2xl font-semibold text-foreground border-b border-slate-100 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-xl font-semibold text-foreground">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-7 text-slate-600">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-2 text-slate-600">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-2 text-slate-600">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    a: ({ href, children }) => (
      <Link href={href ?? "#"} className="font-medium text-brand hover:underline">
        {children}
      </Link>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-brand bg-accent/50 py-3 pl-4 italic text-slate-700">
        {children}
      </blockquote>
    ),
    ...components,
  };
}
