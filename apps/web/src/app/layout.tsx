import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RouteProgress } from "@/components/RouteProgress";

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

// Root layout — KHÔNG phụ thuộc locale, nên đổi ngôn ngữ (soft-nav) không
// re-render <html>/<ThemeProvider> → theme không bị flash.
// lang mặc định "vi", được inline script set lại theo URL trước khi paint,
// và <HtmlLang> sync khi điều hướng client.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground selection:bg-(--theme-primary) selection:text-white"
        suppressHydrationWarning
      >
        {/* Chặn FOUC theme + set lang đồng bộ TRƯỚC khi body paint. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=t==='dark'||((!t||t==='system')&&m);var e=document.documentElement;if(d){e.classList.add('dark');e.style.colorScheme='dark';}else{e.classList.remove('dark');e.style.colorScheme='light';}var l=location.pathname.split('/')[1];if(l==='vi'||l==='en')e.lang=l;}catch(_){}})();`,
          }}
        />
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
