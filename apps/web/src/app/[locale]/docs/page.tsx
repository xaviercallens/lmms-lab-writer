import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsContent } from "@/components/docs-sections";
import { Header } from "@/components/header";
import { DEFAULT_LOCALE, isLocale, type Locale, SUPPORTED_LOCALES } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((locale) => ({ locale }));
}

export default async function LocaleDocsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale) || rawLocale === DEFAULT_LOCALE) {
    notFound();
  }

  const locale: Locale = rawLocale;
  const messages = getMessages(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} showLanguageSwitcher />

      <DocsContent locale={locale} />

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
