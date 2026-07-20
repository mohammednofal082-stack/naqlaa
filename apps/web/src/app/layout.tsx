import type { Metadata } from "next";
import { Cairo, Readex_Pro } from "next/font/google";
import { AppProvider } from "@/contexts/app-context";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SocialProvider } from "@/contexts/social-context";
import { LocaleProvider } from "@/i18n";
import { dirForLocale } from "@/i18n/shared";
import { getServerLocale } from "@/i18n/server";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-readex",
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const ar = locale === "ar";
  const title = ar ? "نقلة — من الجامعة إلى سوق العمل" : "Naqla — From University to Employment";
  const description = ar
    ? "منصة فلسطينية متكاملة للتوظيف والتدريب — منشورات مهنية، مطابقة للفرص، دردشة، وتوصيات مخصّصة."
    : "An integrated Palestinian employment and training platform — professional posts, opportunity matching, chat, and tailored recommendations.";
  const ogDescription = ar
    ? "منصة فلسطينية تربط الطلبة والخريجين بالشركات والجامعات — منشورات مهنية، مطابقة دقيقة للفرص، وتواصل مباشر مع أصحاب القرار."
    : "A Palestinian platform connecting students and graduates with companies and universities — professional posts, precise opportunity matching, and direct contact with decision-makers.";
  return {
    metadataBase: new URL("https://naqlah.ps"),
    title,
    description,
    openGraph: {
      title,
      description: ogDescription,
      type: "website",
      locale: ar ? "ar_PS" : "en_US",
      siteName: ar ? "نقلة" : "Naqla",
      images: [{ url: "/media/naqla-hero.jpg", width: 1200, height: 630, alt: ar ? "نقلة" : "Naqla" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: ["/media/naqla-hero.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} dir={dirForLocale(locale)} data-scroll-behavior="smooth" className={`${cairo.variable} ${readex.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased bg-background text-text">
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>
            <AppProvider>
              <SocialProvider>{children}</SocialProvider>
            </AppProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
