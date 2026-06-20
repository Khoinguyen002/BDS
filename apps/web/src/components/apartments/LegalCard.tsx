import React from "react";
import { ShieldCheck as ShieldCheckIcon, Bank as BankIcon, FileText as FileTextIcon, CheckCircle as CheckCircleIcon, WarningCircle as WarningCircleIcon, Warning as WarningIcon } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";

import { Apartment } from "@bds/shared/payload-types";

type LegalCardProps = {
  legal?: Apartment["legal"];
};

export const LegalCard = ({ legal }: LegalCardProps) => {
  const t = useTranslations("apartments");
  if (!legal) return null;

  return (
    <div className="bg-secondary/5 rounded-none border border-secondary/20 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-secondary/10 pb-4">
        <ShieldCheckIcon weight="duotone" className="w-8 h-8 text-secondary" />
        <div>
          <h3 className="font-bold text-foreground text-lg">{t("legal_document")}</h3>
          <p className="text-sm text-foreground-muted">Minh bạch, rõ ràng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <FileTextIcon weight="fill" className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <span className="block text-sm text-foreground-muted mb-1">{t("legal_document")}</span>
            <span className="font-medium">{legal.documentType ? t(`doc_${legal.documentType}`) : "-"}</span>
            {legal.ownershipTerm && (
              <span className="block text-sm text-success mt-1">({t(`term_${legal.ownershipTerm}`)})</span>
            )}
            {legal.isFullyPermitted !== undefined && legal.isFullyPermitted !== null && (
              <span className={`block text-sm mt-3 flex items-center gap-1 ${legal.isFullyPermitted ? 'text-emerald-600' : 'text-amber-600'}`}>
                {legal.isFullyPermitted ? <CheckCircleIcon weight="fill" /> : <WarningCircleIcon weight="fill" />}
                {legal.isFullyPermitted ? (t("fully_permitted") || "Đã hoàn công") : (t("not_fully_permitted") || "Chưa hoàn công")}
              </span>
            )}
            
            {legal.hasZoningIssue && (
              <span className="block text-sm mt-1.5 flex items-center gap-1 text-amber-600">
                <WarningCircleIcon weight="fill" />
                {t("has_zoning_issue") || "Vướng quy hoạch"}
              </span>
            )}
            
            {legal.hasDispute && (
              <span className="block text-sm mt-1.5 flex items-center gap-1 text-rose-600">
                <WarningIcon weight="fill" />
                {t("has_dispute") || "Đang tranh chấp"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <BankIcon weight="fill" className="w-5 h-5 text-secondary mt-0.5" />
          <div>
            <span className="block text-sm text-foreground-muted mb-1">{t("bank_mortgaged")}</span>
            <span className="font-medium">
              {legal.bankMortgaged ? t("yes_mortgaged") : t("no_mortgaged")}
            </span>
            {legal.bankSupportPercentage && (
              <span className="block text-sm text-secondary mt-1">
                {t("bank_support")}: {legal.bankSupportPercentage}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
