import { getRequestConfig } from 'next-intl/server';
import { getDictionary } from '@/lib/payload-fetcher';

// Can be imported from a shared config
export const locales = ['vi', 'en'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale)) locale = 'vi';

  const messages = await getDictionary(locale);

  return {
    locale,
    messages
  };
});
