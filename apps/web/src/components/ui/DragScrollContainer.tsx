"use client";

import React, { useRef, useState, useCallback, useEffect, useImperativeHandle, forwardRef } from "react";

type DragScrollContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Extra inline styles on the scroll container */
  style?: React.CSSProperties;
  /** Friction for momentum deceleration (0-1, lower = more glide). Default 0.92 */
  friction?: number;
};

/**
 * Horizontal drag-to-scroll container with momentum/velocity.
 * Works on both mouse (pointer) and touch. Prevents native drag on children.
 * Reusable for thumbnail strips, card sliders, etc.
 * Supports ref forwarding for external scroll control.
 */
export const DragScrollContainer = forwardRef<HTMLDivElement, DragScrollContainerProps>(
  function DragScrollContainer({ children, className = "", style, friction = 0.92 }, fwdRef) {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Expose inner ref to parent
    useImperativeHandle(fwdRef, () => ref.current as HTMLDivElement);

    // Drag state refs (not reactive — perf)
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const dragDelta = useRef(0);
    const lastX = useRef(0);
    const lastTime = useRef(0);
    const velocity = useRef(0);
    const rafId = useRef<number>(0);

    // Smooth-settle to nearest snap child instead of jarring re-snap
    const settleToSnap = useCallback(() => {
      const el = ref.current;
      if (!el) return;
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) {
        el.style.scrollSnapType = "";
        return;
      }
      // Find closest child to current scroll position
      const scrollCenter = el.scrollLeft + el.clientWidth / 2;
      let closest = children[0];
      let minDist = Infinity;
      for (const child of children) {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(childCenter - scrollCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = child;
        }
      }
      const targetScroll = closest.offsetLeft - (el.clientWidth - closest.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
      // Re-enable snap after smooth scroll settles
      setTimeout(() => {
        if (el) el.style.scrollSnapType = "";
      }, 300);
    }, []);

    // Momentum animation
    const animateMomentum = useCallback(() => {
      const el = ref.current;
      if (!el) return;
      if (Math.abs(velocity.current) < 0.5) {
        velocity.current = 0;
        settleToSnap();
        return;
      }
      el.scrollLeft -= velocity.current;
      velocity.current *= friction;
      rafId.current = requestAnimationFrame(animateMomentum);
    }, [friction, settleToSnap]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      cancelAnimationFrame(rafId.current);
      velocity.current = 0;

      startX.current = e.clientX;
      scrollLeft.current = el.scrollLeft;
      dragDelta.current = 0;
      lastX.current = e.clientX;
      lastTime.current = Date.now();

      setIsDragging(true);
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = "none";
    }, []);

    const onPointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDragging) return;
        const el = ref.current;
        if (!el) return;

        const now = Date.now();
        const dt = now - lastTime.current || 1;
        const dx = e.clientX - lastX.current;

        velocity.current = (dx / dt) * 16;
        lastX.current = e.clientX;
        lastTime.current = now;

        const totalDx = e.clientX - startX.current;
        dragDelta.current = Math.abs(totalDx);
        el.scrollLeft = scrollLeft.current - totalDx;
      },
      [isDragging],
    );

    const onPointerUp = useCallback(() => {
      if (!isDragging) return;
      setIsDragging(false);

      if (Math.abs(velocity.current) > 0.5) {
        rafId.current = requestAnimationFrame(animateMomentum);
      } else {
        const el = ref.current;
        if (el) el.style.scrollSnapType = "";
      }
    }, [isDragging, animateMomentum]);

    const onClickCapture = useCallback((e: React.MouseEvent) => {
      if (dragDelta.current > 5) {
        e.preventDefault();
        e.stopPropagation();
        dragDelta.current = 0;
      }
    }, []);

    useEffect(() => {
      return () => cancelAnimationFrame(rafId.current);
    }, []);

    return (
      <div
        ref={ref}
        className={className}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "pan-y",
          ...style,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        {children}
      </div>
    );
  },
);
