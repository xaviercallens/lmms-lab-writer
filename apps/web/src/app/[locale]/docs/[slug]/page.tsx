import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { Header } from "@/components/header";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  SUPPORTED_LOCALES,
  withLocalePrefix,
} from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

const contentDir = path.join(process.cwd(), "content/docs");

function getDocBySlug(slug: string) {
  const filePath = path.join(contentDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  return { frontmatter: data, content };
}

function getAllDocSlugs() {
  if (!fs.existsSync(contentDir)) {
    return [];
  }
  const files = fs.readdirSync(contentDir);
  return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
}

export function generateStaticParams() {
  const slugs = getAllDocSlugs();
  const locales = SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) {
    return { title: "Not Found" };
  }
  return {
    title: `${doc.frontmatter.title} | LMMs-Lab Writer`,
    description: doc.frontmatter.description,
  };
}

const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" }],
    [rehypePrettyCode, { theme: "github-light" }],
  ],
};

export default async function LocaleDocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;

  if (!isLocale(rawLocale) || rawLocale === DEFAULT_LOCALE) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const messages = getMessages(locale);

  return (
    <div className="min-h-screen">
      <Header locale={locale} showLanguageSwitcher />

      <main className="py-12 px-6">
        <article className="max-w-5xl mx-auto">
          <Link
            href={withLocalePrefix("/docs", locale)}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {messages.docs.backToDocs}
          </Link>

          <div className="prose prose-neutral max-w-none">
            <MDXRemote source={doc.content} options={{ mdxOptions: mdxOptions as never }} />
          </div>
        </article>
      </main>

      <footer className="border-t border-border px-6">
        <div className="max-w-5xl mx-auto py-6 text-sm text-muted">
          <Link
            href="https://github.com/EvolvingLMMs-Lab/lmms-lab-writer"
            className="hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.footer.editOnGitHub}
          </Link>
        </div>
      </footer>
    </div>
  );
}
