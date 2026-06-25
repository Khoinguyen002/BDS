import PlatformPricingBlock from "@/components/home/PlatformPricingBlock";

export const metadata = {
  title: "Bảng Giá Dịch Vụ | RealX",
  description: "Chọn gói dịch vụ phù hợp với nhu cầu của bạn.",
};

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background">
      <PlatformPricingBlock locale={locale} />
    </div>
  );
}
