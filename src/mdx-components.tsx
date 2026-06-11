import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { DemoVideoEmbed } from "@/components/landing/demo-video-modal";

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
    table: ({ children }) => (
      <div className="not-prose my-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[32rem] border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-slate-200 bg-slate-50">{children}</thead>
    ),
    tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
    tr: ({ children }) => (
      <tr className="transition-colors even:bg-slate-50/60 hover:bg-accent/20">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 align-top leading-6 text-slate-600">{children}</td>
    ),
    DemoVideoEmbed,
    ...components,
  };
}
