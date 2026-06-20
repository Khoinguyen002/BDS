import { HtmlLang } from "@/components/HtmlLang";
import { Footer } from "@/components/layout/Footer";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';
import { cookies } from 'next/headers';
import { CurrencyProvider } from '@/hooks/useCurrency';
import { getExchangeRates } from '@/lib/exchange-rate';

// Locale layout — chỉ lo i18n + currency. <html>/<body>/theme nằm ở root layout
// (src/app/layout.tsx) nên đổi locale không gây flash theme.
export default async function LocaleLayout({
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

  const initialRates = await getExchangeRates();

  return (
    <NextIntlClientProvider messages={messages}>
      <CurrencyProvider initialCurrency={initialCurrency} initialRates={initialRates}>
        <HtmlLang locale={locale} />
        {children}
        <Footer />
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
