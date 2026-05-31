import Link from "next/link";
import { DocsContent } from "@/components/docs-sections";
import { Header } from "@/components/header";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

export default function DocsPage() {
  const locale = DEFAULT_LOCALE;
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
