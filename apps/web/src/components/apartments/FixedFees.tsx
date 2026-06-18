import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";
import { MoneyIcon, WalletIcon } from "@phosphor-icons/react/dist/ssr";

export const FixedFees = ({ apartment }: { apartment: Apartment }) => {
  const t = useTranslations("apartments");
  const rp = apartment.rentPricing;
  
  if (!rp) return null;
  // rentPricing chỉ có managementFeeIncluded (bool), không có số tiền — amount chỉ tồn tại ở priceBreakdown (sale).
  // managementFeeIncluded mặc định false vẫn là thông tin hợp lệ ("người thuê tự đóng"),
  // nên dùng != null thay vì truthy-check để không ẩn nhầm.
  const hasManagementInfo =
    apartment.propertyType === "apartment" && rp.managementFeeIncluded != null;
  if (!rp.deposit && !hasManagementInfo) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{t("fixed_fees") || "Chi phí cố định"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposit */}
        {rp.deposit && (
          <div className="flex items-center gap-4 bg-background-subtle border border-border p-4 rounded-none">
            <div className="p-3 bg-primary/10 rounded-full">
              <MoneyIcon className="w-6 h-6 text-primary" weight="duotone" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold mb-0.5">
                {t("deposit") || "Đặt cọc"}
              </p>
              <p className="text-base font-bold text-foreground">
                {t(`deposit_${rp.deposit}`) || rp.deposit}
              </p>
            </div>
          </div>
        )}

        {/* Management Fee */}
        {hasManagementInfo && (
          <div className="flex items-center gap-4 bg-background-subtle border border-border p-4 rounded-none">
            <div className="p-3 bg-amber-500/10 rounded-full">
              <WalletIcon className="w-6 h-6 text-amber-500" weight="duotone" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold mb-0.5">
                {t("management_fee") || "Phí quản lý"}
              </p>
              <p className="text-base font-bold text-foreground">
                {rp.managementFeeIncluded
                  ? (t("included_in_price") || "Đã bao gồm trong giá thuê")
                  : (t("not_included") || "Người thuê tự đóng")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
