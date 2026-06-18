import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { CurrencySelect } from "@/components/CurrencySelect";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import { cookies } from 'next/headers';
import { CurrencyProvider } from '@/hooks/useCurrency';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bất Động Sản Cao Cấp",
  description: "Trải nghiệm không gian sống thượng lưu",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const cookieStore = await cookies();
  const initialCurrency = cookieStore.get("bds_currency")?.value || "VND";

  let initialRates: Record<string, number> = { VND: 25400, THB: 36.5, USD: 1 };
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      if (data?.rates) {
        initialRates = {
          VND: data.rates.VND || initialRates.VND,
          THB: data.rates.THB || initialRates.THB,
          USD: 1
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch exchange rate on server", error);
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-full flex flex-col bg-background text-foreground selection:bg-[var(--theme-primary)] selection:text-white"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <CurrencyProvider initialCurrency={initialCurrency} initialRates={initialRates}>
              {children}
              <Footer />
              <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
                <CurrencySelect />
                <LocaleSwitcher />
                <ThemeToggle />
              </div>
            </CurrencyProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
