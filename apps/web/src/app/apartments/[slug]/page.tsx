import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { User, Media } from "@bds/shared/payload-types";
import { ThemeInjector } from "@/components/ThemeInjector";
import { getApartmentBySlugOrId } from "@/lib/payload-fetcher";
import { env } from "@/env";

// Helper to format currency
const formatVND = (price?: number | null) => {
  if (!price) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Helper to format image URL
const getImageUrl = (media?: string | Media | null) => {
  if (!media) return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80";
  const m = typeof media === "object" ? media : null;
  if (!m || !m.url) return "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80";
  
  return m.url.startsWith("http")
    ? m.url
    : `${env.PAYLOAD_PUBLIC_SERVER_URL}${m.url}`;
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ApartmentDetail({ params }: Props) {
  const { slug } = await params;

  // Fetch apartment
  const apartment = await getApartmentBySlugOrId(slug);

  if (!apartment) {
    notFound();
  }

  const owner = typeof apartment.owner === "object" ? (apartment.owner as User) : null;
  const gallery = apartment.gallery || [];
  
  const heroImage = gallery.length > 0 ? gallery[0] : null;
  const otherImages = gallery.slice(1, 5); // Take next 4 images for grid

  return (
    <>
      <ThemeInjector theme={owner?.theme} />
      <main className="min-h-screen bg-gray-50 pb-24 transition-colors duration-300 dark:bg-gray-900">
      {/* Top Navigation */}
      <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href={`/${owner?.agentSlug || ""}`} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-semibold flex items-center gap-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Quay lại
        </Link>
        <div className="font-bold text-xl tracking-tight">Căn Hộ Cao Cấp</div>
      </nav>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-4 h-[60vh] min-h-[400px]">
          {/* Main Hero Image */}
          <div className={`relative w-full ${otherImages.length > 0 ? 'md:w-2/3' : ''} h-full rounded-2xl overflow-hidden shadow-sm group`}>
            <Image
              src={getImageUrl(heroImage as Media)}
              alt={apartment.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />
          </div>

          {/* Grid of Other Images */}
          {otherImages.length > 0 && (
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 w-1/3 h-full">
              {otherImages.map((img, idx) => (
                <div key={idx} className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm group">
                  <Image
                    src={getImageUrl(img as Media)}
                    alt={`${apartment?.title} - ${idx + 2}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="16vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold mb-4 shadow-sm border border-blue-200">
              Đang Bán
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
              {apartment.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {apartment.address || "Liên hệ để biết địa chỉ"}
            </p>
          </div>

          <hr className="border-gray-200 dark:border-gray-800" />

          <div>
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Thông tin chi tiết</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Căn hộ cao cấp sở hữu thiết kế hiện đại, không gian mở ngập tràn ánh sáng tự nhiên. 
              Vị trí đắc địa, giao thông thuận tiện cùng chuỗi tiện ích nội khu đẳng cấp như hồ bơi vô cực, 
              phòng gym chuẩn 5 sao, khu vui chơi trẻ em và công viên xanh mát.
            </p>
          </div>
        </div>

        {/* Sidebar / Agent Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-700 sticky top-24">
            <h2 className="text-3xl font-extrabold text-(--theme-primary) mb-6 tracking-tight">
              {formatVND(apartment.price)}
            </h2>

            {owner && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md" style={{ backgroundColor: 'var(--theme-primary)' }}>
                    {owner.brandName?.charAt(0) || "A"}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">{owner.brandName}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Chuyên viên tư vấn</div>
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {owner.email}
                </div>
              </div>
            )}

            <button className="w-full text-white rounded-(--theme-radius) py-4 font-bold text-lg hover:brightness-110 transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2" style={{ backgroundColor: 'var(--theme-primary)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Liên hệ chuyên viên
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              Chúng tôi sẽ phản hồi trong vòng 24h
            </p>
          </div>
        </div>

      </section>
    </main>
    </>
  );
}
