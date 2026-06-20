"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thanh loading toàn cục (kiểu YouTube/GitHub) hiển thị khi điều hướng giữa
 * các page. App Router (Next 16) không có router events, nên ta:
 *  - Bắt click trên thẻ <a> nội bộ → bắt đầu thanh trước khi điều hướng.
 *  - Patch history.pushState/replaceState + popstate → bắt router.push/replace
 *    và nút back/forward.
 *  - Khi pathname/searchParams đổi (tree mới đã commit) → kết thúc thanh.
 *
 * Có delay nhỏ trước khi hiện để tránh nhấp nháy với điều hướng đã prefetch
 * (hoàn tất gần như tức thì).
 */
const SHOW_DELAY = 120; // ms — dưới mức này coi như điều hướng tức thì, không hiện
const TRICKLE_MS = 200;
const DONE_FADE_MS = 300;

export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeRef = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    showTimerRef.current = null;
    trickleRef.current = null;
    fadeTimerRef.current = null;
  };

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    clearTimers();
    // Trì hoãn việc hiện thanh: nếu điều hướng xong ngay (prefetched) thì không nhấp nháy.
    showTimerRef.current = setTimeout(() => {
      setVisible(true);
      setProgress(8);
      trickleRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          // Tiến chậm dần khi gần 90% để tạo cảm giác "đang tải".
          return p + Math.max(0.5, (90 - p) * 0.06);
        });
      }, TRICKLE_MS);
    }, SHOW_DELAY);
  }, []);

  const done = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    // Nếu thanh chưa kịp hiện (điều hướng tức thì) → bỏ qua, không nháy.
    setVisible((wasVisible) => {
      if (!wasVisible) {
        setProgress(0);
        return false;
      }
      setProgress(100);
      fadeTimerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, DONE_FADE_MS);
      return true;
    });
  }, []);

  // Kết thúc thanh khi tree mới đã commit (URL đổi).
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Bắt click điều hướng nội bộ (Link cũng render ra <a>).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Cùng URL (chỉ đổi hash) → không có điều hướng page.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;

      start();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // Bắt điều hướng bằng router.push/replace (Next gọi history API) + back/forward.
  useEffect(() => {
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;

    window.history.pushState = function (...args) {
      start();
      return origPush.apply(this, args);
    };
    window.history.replaceState = function (...args) {
      start();
      return origReplace.apply(this, args);
    };
    const onPop = () => start();
    window.addEventListener("popstate", onPop);

    return () => {
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onPop);
    };
  }, [start]);

  // Dọn timer khi unmount.
  useEffect(() => clearTimers, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-9999 h-0.5"
    >
      <div
        className="h-full bg-(--color-primary) shadow-[0_0_8px_var(--color-primary)]"
        style={{
          width: `${progress}%`,
          transition:
            progress === 100
              ? `width 150ms ease-out, opacity ${DONE_FADE_MS}ms ease-out ${DONE_FADE_MS - 100}ms`
              : "width 200ms ease-out",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
