"use client";

import React from "react";
import type { Apartment } from "@bds/shared/payload-types";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations, useLocale } from "next-intl";
import { PropertyCard } from "./PropertyCard";

export function ListApartmentsClient({
  apartments: initialApartments,
  agentSlug,
  hideHeader,
  initialFilterType,
  initialFilterListing,
}: {
  apartments: Apartment[];
  agentSlug?: string;
  hideHeader?: boolean;
  initialFilterType?: string;
  initialFilterListing?: string;
}) {
  const t = useTranslations("apartments");
  const locale = useLocale();
  
  if (initialApartments.length === 0) return null;

  return (
    <section className={`bg-background ${!hideHeader ? "py-24 border-t border-border" : ""}`}>
      <div className="container">
        {!hideHeader && (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
                {t('featured_collection')}
              </h2>
              <p className="text-base text-foreground-secondary font-light">
                {t('featured_description')}
              </p>
            </div>
            <Link 
              href={agentSlug ? `/${locale}/${agentSlug}/apartments` : `/${locale}/apartments`} 
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-foreground-muted hover:text-[var(--theme-primary)] transition-colors"
            >
              {t('view_all')}
              <ArrowUpRightIcon weight="bold" className="w-4 h-4" />
            </Link>
          </div>
        )}

        {initialApartments.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {initialApartments.map((apartment, i) => (
              <motion.li
                key={apartment.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                { }
                <PropertyCard apartment={apartment} agentSlug={agentSlug} />
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="py-24 text-center border border-dashed border-border text-foreground-muted">
            {t('no_properties')}
          </div>
        )}
      </div>
    </section>
  );
}
