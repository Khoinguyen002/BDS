"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Media } from "@bds/shared/payload-types";
import { StarIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

type FeaturedAgentsProps = {
  agents: User[];
  locale: string;
  title?: string;
};

export const FeaturedAgents = ({ agents, locale, title }: FeaturedAgentsProps) => {
  const t = useTranslations("home");
  if (!agents || agents.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h3 className="font-bold mb-4">{title || t("featured_agents_title")}</h3>
            <p className="text-foreground-muted text-lg">{t("featured_agents_desc")}</p>
          </div>
          <Link href={`/${locale}/agents`} className="flex items-center gap-2 text-primary font-medium hover:underline">
            {t("view_all")} <ArrowRightIcon weight="bold" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => {
            const hasLogo = agent.logo && typeof agent.logo === 'object' && agent.logo.url;

            return (
              <Link 
                key={agent.id} 
                href={`/${locale}/${agent.agentSlug}`}
                className="group flex flex-col items-center p-6 rounded-none bg-background-subtle border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 relative ring-4 ring-background shadow-sm bg-secondary/10 text-secondary flex items-center justify-center text-3xl font-bold uppercase">
                  {hasLogo ? (
                    <Image src={(agent.logo as Media).url as string} alt={agent.brandName || "Agent"} fill className="object-cover" sizes="96px" />
                  ) : (
                    agent.brandName?.substring(0, 2)
                  )}
                </div>
                <h3 className="font-bold group-hover:text-primary transition-colors">{agent.brandName}</h3>
                <span className="text-sm text-foreground-muted mb-4">{t("consultant")}</span>
                
                <div className="flex items-center gap-4 w-full justify-center pt-4 border-t border-border">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold">{agent.profile?.successfulTransactions || 0}</span>
                    <span className="text-xs text-foreground-muted">{t("transactions")}</span>
                  </div>
                  <div className="w-px h-6 bg-border" />
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <StarIcon weight="fill" className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold text-foreground">5.0</span>
                    </div>
                    <span className="text-xs text-foreground-muted">Rating</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
