"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

type AnimatedSectionProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
};

export function AnimatedSection({
  children,
  delay = 0,
  direction = "up",
  className,
  ...props
}: AnimatedSectionProps) {
  const yOffset = direction === "up" ? 24 : direction === "down" ? -24 : 0;
  const xOffset = direction === "left" ? 24 : direction === "right" ? -24 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
