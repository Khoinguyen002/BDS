import React from "react";
import Link from "next/link";
import { CaretRightIcon, HouseIcon } from "@phosphor-icons/react/dist/ssr";

type BreadcrumbsProps = {
  items: {
    label: string;
    href?: string;
  }[];
};

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 flex-wrap">
        <li>
          <Link href="/" className="text-foreground-muted hover:text-primary transition-colors flex items-center">
            <HouseIcon weight="duotone" className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <CaretRightIcon weight="bold" className="w-3 h-3 text-border" />
            {item.href ? (
              <Link href={item.href} className="text-sm text-foreground-muted hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-foreground line-clamp-1">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
