import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { FooterLink, HeroSection } from "@/components/home-sections";
import { DEFAULT_LOCALE } from "@/lib/i18n";

const FeaturesSection = dynamic(() =>
  import("@/components/home-sections").then((mod) => mod.FeaturesSection),
);
const DemoSection = dynamic(() =>
  import("@/components/home-sections").then((mod) => mod.DemoSection),
);
const VideoSection = dynamic(() =>
  import("@/components/home-sections").then((mod) => mod.VideoSection),
);
const ComparisonSection = dynamic(() =>
  import("@/components/home-sections").then((mod) => mod.ComparisonSection),
);

export default function HomePage() {
  const locale = DEFAULT_LOCALE;

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} showLanguageSwitcher />

      <main className="flex-1">
        <HeroSection locale={locale} />
        <FeaturesSection locale={locale} />
        <VideoSection locale={locale} />
        <DemoSection locale={locale} />
        <ComparisonSection locale={locale} />
      </main>

      <footer className="border-t border-border px-6">
        <div className="max-w-5xl mx-auto py-6 text-sm text-muted text-center">
          Built by <FooterLink /> · © {new Date().getFullYear()} LMMs-Lab. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
