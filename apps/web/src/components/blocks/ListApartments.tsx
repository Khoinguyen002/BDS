import React from "react";
import type { LandingPage, User, Apartment } from "@bds/shared/payload-types";
import Image from "next/image";
import Link from "next/link";
import { getApartmentsByOwner } from "@/lib/payload-fetcher";
import { env } from "@/env";

export default async function ListApartments(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "listApartments" }
  > & { ownerId?: number | User },
) {
  const { apartmentsFilter, ownerId } = props;
  const owner = typeof ownerId === "object" ? ownerId?.id : ownerId;

  let apartments: Apartment[] = [];

  if (apartmentsFilter && apartmentsFilter.length > 0) {
    apartments = apartmentsFilter
      .map((ap) => (typeof ap === "object" ? ap : ({} as Apartment)))
      .filter((ap) => ap.id);
  } else if (owner) {
    apartments = await getApartmentsByOwner(owner, 6);
  }

  if (apartments.length === 0) return null;

  const formatVND = (price?: number | null) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-24 px-4 md:px-8 bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px]" style={{ backgroundColor: 'var(--theme-primary)' }} />
            <span className="uppercase tracking-widest text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Danh Mục Đầu Tư
            </span>
            <span className="w-8 h-[2px]" style={{ backgroundColor: 'var(--theme-primary)' }} />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white mb-6">
            Bất Động Sản Nổi Bật
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-2xl font-light">
            Khám phá danh mục các bất động sản cao cấp được tuyển chọn kỹ
            lưỡng dành riêng cho bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apartments.map((apartment) => {
            const fallbackImage =
              "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";
            let imageUrl = fallbackImage;
            if (
              apartment.gallery &&
              apartment.gallery.length > 0 &&
              apartment.gallery[0] &&
              typeof apartment.gallery[0] === "object" &&
              "url" in apartment.gallery[0] &&
              apartment.gallery[0].url
            ) {
              const url = apartment.gallery[0].url as string;
              imageUrl = url.startsWith("http")
                ? url
                : `${env.NEXT_PUBLIC_SERVER_URL}${url}`;
            }

            return (
              <Link
                href={`/apartments/${apartment.slug || apartment.id}`}
                key={apartment.id}
                className="group flex flex-col bg-white dark:bg-zinc-900 overflow-hidden shadow-md hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-white/5 transition-all duration-500 border border-zinc-200/50 dark:border-zinc-800 transform hover:-translate-y-2"
                style={{ borderRadius: 'var(--theme-radius)' }}
              >
                <div className="relative w-full aspect-4/3 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={apartment.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs uppercase tracking-wider font-bold shadow-lg text-zinc-900 dark:text-white">
                    Đang Bán
                  </div>
                </div>

                <div className="p-8 flex flex-col grow">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-(--theme-primary) transition-colors duration-300">
                    {apartment.title}
                  </h3>

                  <div className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2 line-clamp-1 mb-6 text-sm">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {apartment.address || "Liên hệ để biết địa chỉ"}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                      {formatVND(apartment.price)}
                    </div>
                    <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-colors duration-300 group-hover:bg-(--theme-primary) group-hover:border-transparent text-zinc-400 group-hover:text-white">
                      <svg className="w-5 h-5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
