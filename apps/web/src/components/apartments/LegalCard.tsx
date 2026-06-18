import React from "react";
import { ShieldCheckIcon, BankIcon, FileTextIcon } from "@phosphor-icons/react/dist/ssr";

import { Apartment } from "@bds/shared/payload-types";

type LegalCardProps = {
  legal?: Apartment["legal"];
  t: (key: string) => string;
};

export const LegalCard = ({ legal, t }: LegalCardProps) => {
  if (!legal) return null;

  return (
    <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
        <ShieldCheckIcon weight="duotone" className="w-8 h-8 text-primary" />
        <div>
          <h3 className="font-bold text-foreground text-lg">{t("legal_document")}</h3>
          <p className="text-sm text-foreground-muted">Minh bạch, rõ ràng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <FileTextIcon weight="fill" className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <span className="block text-sm text-foreground-muted mb-1">{t("legal_document")}</span>
            <span className="font-medium">{legal.documentType ? t(`doc_${legal.documentType}`) : "-"}</span>
            {legal.ownershipTerm && (
              <span className="block text-sm text-success mt-1">({t(`term_${legal.ownershipTerm}`)})</span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BankIcon weight="fill" className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <span className="block text-sm text-foreground-muted mb-1">{t("bank_mortgaged")}</span>
            <span className="font-medium">
              {legal.bankMortgaged ? t("yes_mortgaged") : t("no_mortgaged")}
            </span>
            {legal.bankSupportPercentage && (
              <span className="block text-sm text-primary mt-1">
                {t("bank_support")}: {legal.bankSupportPercentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
