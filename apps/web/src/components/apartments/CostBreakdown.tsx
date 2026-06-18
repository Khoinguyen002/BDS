import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { useTranslations } from "next-intl";
import { LightningIcon, DropIcon, TrashIcon, WifiHighIcon, CarProfileIcon } from "@phosphor-icons/react/dist/ssr";

export const CostBreakdown = ({ apartment }: { apartment: Apartment }) => {
  const t = useTranslations("apartments");
  const rp = apartment.rentPricing;
  if (!rp || apartment.propertyType !== "boarding_room") return null;

  const costs = [
    { label: t("electricity_price"), value: rp.electricityPrice, icon: <LightningIcon className="w-5 h-5 text-amber-500" /> },
    { label: t("water_price"), value: rp.waterPrice, icon: <DropIcon className="w-5 h-5 text-blue-500" /> },
    { label: t("trash_fee"), value: rp.trashFee ? `${rp.trashFee.toLocaleString()} VND/tháng` : null, icon: <TrashIcon className="w-5 h-5 text-zinc-500" /> },
    { label: t("wifi_fee"), value: rp.wifiFee ? `${rp.wifiFee.toLocaleString()} VND/tháng` : null, icon: <WifiHighIcon className="w-5 h-5 text-primary" /> },
    { label: t("parking_fee"), value: rp.parkingFee ? `${rp.parkingFee.toLocaleString()} VND/tháng` : null, icon: <CarProfileIcon className="w-5 h-5 text-foreground-muted" /> },
  ].filter(c => c.value);

  if (costs.length === 0) return null;

  // Ước tính tổng/tháng = tiền thuê (apt.price, với priceUnit=per_month) + phí cố định dạng SỐ.
  // Điện/nước là text (đ/kWh, đ/m³) tính theo lượng dùng nên KHÔNG cộng vào.
  const monthlyRent = apartment.price || 0;
  const fixedTotal =
    monthlyRent + (rp.wifiFee || 0) + (rp.trashFee || 0) + (rp.parkingFee || 0);
  const showTotal = !!apartment.price;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{t("cost_breakdown") || "Chi phí dịch vụ"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {costs.map((c, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-background-subtle border border-border/50 rounded-none">
            <div className="bg-background p-2 rounded-full shadow-sm">{c.icon}</div>
            <div className="flex flex-col">
              <span className="text-sm text-foreground-muted">{c.label}</span>
              <span className="font-semibold text-foreground">{c.value}</span>
            </div>
          </div>
        ))}
      </div>
      {showTotal && (
        <div className="mt-4 flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-none">
          <span className="font-semibold text-foreground">
            {t("estimated_total") || "Ước tính tổng/tháng"}
          </span>
          <span className="text-lg font-bold text-primary tabular-nums">
            {fixedTotal.toLocaleString()} VND
          </span>
        </div>
      )}
      {showTotal && (
        <p className="text-xs text-foreground-muted mt-2 italic">
          * {t("estimated_total_note") || "Đã gồm tiền thuê + phí cố định, chưa gồm điện nước theo lượng dùng thực tế."}
        </p>
      )}
      {rp.utilitiesPrice && (
        <p className="text-sm text-foreground-muted mt-4 italic">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          * {t("utilities_note") || "Chi phí điện nước áp dụng theo"}: {t(`utils_${rp.utilitiesPrice}` as any) || rp.utilitiesPrice}
        </p>
      )}
    </section>
  );
};
