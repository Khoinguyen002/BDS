import React from "react";
import { Apartment } from "@bds/shared/payload-types";
import { getTranslations } from "next-intl/server";
import RichTextRenderer from "@/components/blocks/RichTextRenderer";
import { AmenitiesGrid } from "./AmenitiesGrid";
import { ArrowsOutIcon, BedIcon, BathtubIcon } from "@phosphor-icons/react/dist/ssr";

// Render generic: core key facts (giữ structured cho search/card) + các section
// động (title + richText) do agent tự thêm + tiện ích + bản đồ.
// Bỏ hẳn bộ máy profile/DETAIL_LAYOUT cũ.
export const DetailBody = async ({ apartment }: { apartment: Apartment }) => {
  const t = await getTranslations("apartments");
  const kf = apartment.keyFacts;

  type Fact = { icon: React.ReactNode; label: string; value: string };
  const coreFacts = ([
    kf?.area ? { icon: <ArrowsOutIcon weight="duotone" className="w-5 h-5 text-secondary" />, label: t("area"), value: `${kf.area} m²` } : null,
    kf?.bedrooms ? { icon: <BedIcon weight="duotone" className="w-5 h-5 text-secondary" />, label: t("bedrooms"), value: String(kf.bedrooms) } : null,
    kf?.bathrooms ? { icon: <BathtubIcon weight="duotone" className="w-5 h-5 text-secondary" />, label: t("bathrooms"), value: String(kf.bathrooms) } : null,
  ] as (Fact | null)[]).filter((f): f is Fact => f !== null);

  const sections = Array.isArray(apartment.sections) ? apartment.sections : [];
  const hasAmenities = !!apartment.location?.amenities && apartment.location.amenities.length > 0;

  return (
    <div className="flex flex-col divide-y divide-border/50">
      {coreFacts.length > 0 && (
        <section className="pb-8">
          <h3 className="font-bold mb-4">{t("key_facts")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {coreFacts.map((fact, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-background-subtle border border-border/50">
                <div className="w-10 h-10 bg-secondary/10 flex items-center justify-center shrink-0">
                  {fact.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-foreground-muted">{fact.label}</span>
                  <span className="text-sm font-medium text-foreground">{fact.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.map((s, idx) => (
        <section key={s.id || idx} className="py-8">
          {s.title && <h3 className="font-bold mb-4">{s.title}</h3>}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {s.body && <RichTextRenderer content={s.body as any} />}
        </section>
      ))}

      {hasAmenities && (
        <section className="py-8">
          <h3 className="font-bold mb-4">{t("amenities")}</h3>
          <AmenitiesGrid amenities={apartment.location!.amenities!} />
        </section>
      )}

      {apartment.location?.mapEmbedUrl && (
        <section className="py-8">
          <h3 className="font-bold mb-4">{t("location")}</h3>
          <div className="w-full h-80 overflow-hidden bg-background-subtle">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={apartment.location.mapEmbedUrl}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </section>
      )}
    </div>
  );
};
