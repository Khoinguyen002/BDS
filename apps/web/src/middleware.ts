import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ["vi", "en"],

  // Used when no locale matches
  defaultLocale: "vi",
  localePrefix: "always",
});

// NOTE: Phải là `middleware.ts` (không phải `proxy.ts`) để chạy Edge runtime.
// Next.js 16 ép `proxy.ts` về Node.js runtime, mà @opennextjs/cloudflare
// chỉ hỗ trợ Edge middleware.
export default intlMiddleware;

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(vi|en)/:path*"],
};
