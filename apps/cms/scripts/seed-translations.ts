import { getPayload } from "payload";
import configPromise from "../src/payload.config";
import { Translation } from "@bds/shared/payload-types";

export async function seedTranslations() {
  const payload = await getPayload({ config: configPromise });

  const translations = [
    {
      key: "hero.explore_now",
      namespace: "hero",
      vi: "Khám Phá Ngay",
      en: "Explore Now",
    },
    {
      key: "agent.consultant",
      namespace: "agent",
      vi: "Chuyên Viên Tư Vấn",
      en: "Consultant",
    },
    {
      key: "agent.updating_info",
      namespace: "agent",
      vi: "Đang cập nhật thông tin...",
      en: "Information is being updated...",
    },
    {
      key: "contact.title",
      namespace: "contact",
      vi: "Liên hệ tư vấn",
      en: "Contact for Consultation",
    },
    {
      key: "contact.placeholder",
      namespace: "contact",
      vi: "Nhập số điện thoại của bạn",
      en: "Enter your phone number",
    },
    { key: "contact.submit", namespace: "contact", vi: "Gửi", en: "Submit" },
    {
      key: "contact.description",
      namespace: "contact",
      vi: "Để lại thông tin, chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.",
      en: "Leave your information and we will contact you as soon as possible.",
    },
    {
      key: "contact.support_247",
      namespace: "contact",
      vi: "Hỗ trợ 24/7",
      en: "24/7 Support",
    },
    {
      key: "contact.security",
      namespace: "contact",
      vi: "Bảo mật tuyệt đối",
      en: "Top Security",
    },
    {
      key: "contact.full_name",
      namespace: "contact",
      vi: "Họ và tên",
      en: "Full Name",
    },
    {
      key: "contact.full_name_placeholder",
      namespace: "contact",
      vi: "Nhập họ và tên",
      en: "Enter your full name",
    },
    {
      key: "contact.phone_number",
      namespace: "contact",
      vi: "Số điện thoại",
      en: "Phone Number",
    },
    {
      key: "contact.phone_placeholder",
      namespace: "contact",
      vi: "Nhập số điện thoại",
      en: "Enter your phone number",
    },
    {
      key: "contact.email_optional",
      namespace: "contact",
      vi: "Email (Không bắt buộc)",
      en: "Email (Optional)",
    },
    {
      key: "contact.email_placeholder",
      namespace: "contact",
      vi: "Nhập email của bạn",
      en: "Enter your email",
    },
    {
      key: "contact.submit_button",
      namespace: "contact",
      vi: "Gửi Yêu Cầu Tư Vấn",
      en: "Send Request",
    },
    {
      key: "apartments.for_sale",
      namespace: "apartments",
      vi: "Đang Bán",
      en: "For Sale",
    },
    {
      key: "apartments.view_details",
      namespace: "apartments",
      vi: "Xem Chi Tiết",
      en: "View Details",
    },
    {
      key: "apartments.updating",
      namespace: "apartments",
      vi: "Đang cập nhật",
      en: "Updating",
    },
    {
      key: "apartments.price_contact",
      namespace: "apartments",
      vi: "Thoả Thuận",
      en: "Contact for Price",
    },
    {
      key: "apartments.status_available",
      namespace: "apartments",
      vi: "Đang Bán",
      en: "Available",
    },
    {
      key: "apartments.status_sold",
      namespace: "apartments",
      vi: "Đã Bán",
      en: "Sold",
    },
    {
      key: "apartments.status_renting",
      namespace: "apartments",
      vi: "Đang Cho Thuê",
      en: "For Rent",
    },
    {
      key: "apartments.area",
      namespace: "apartments",
      vi: "Diện tích",
      en: "Area",
    },
    {
      key: "apartments.bedrooms",
      namespace: "apartments",
      vi: "Phòng ngủ",
      en: "Bedrooms",
    },
    {
      key: "apartments.bathrooms",
      namespace: "apartments",
      vi: "Phòng tắm",
      en: "Bathrooms",
    },
    {
      key: "apartments.project",
      namespace: "apartments",
      vi: "Dự án",
      en: "Project",
    },
    {
      key: "apartments.featured_collection",
      namespace: "apartments",
      vi: "Bộ Sưu Tập Nổi Bật",
      en: "Featured Collection",
    },
    {
      key: "apartments.featured_description",
      namespace: "apartments",
      vi: "Khám phá những không gian sống đẳng cấp nhất, được tuyển chọn khắt khe dành riêng cho bạn.",
      en: "Discover the finest living spaces, strictly curated just for you.",
    },
    {
      key: "apartments.view_all",
      namespace: "apartments",
      vi: "Xem tất cả",
      en: "View all",
    },
    {
      key: "apartments.contact_for_address",
      namespace: "apartments",
      vi: "Liên hệ để biết địa chỉ",
      en: "Contact for address",
    },
    { key: "nav.home", namespace: "nav", vi: "Trang chủ", en: "Home" },
    { key: "nav.apartments", namespace: "nav", vi: "Căn hộ", en: "Apartments" },
    { key: "nav.contact", namespace: "nav", vi: "Liên hệ", en: "Contact" },
    {
      key: "footer.copyright",
      namespace: "footer",
      vi: "Bản quyền thuộc về",
      en: "Copyright by",
    },
    {
      key: "common.back",
      namespace: "common",
      vi: "Quay lại",
      en: "Back",
    },
    {
      key: "common.receive_info",
      namespace: "common",
      vi: "Nhận thông tin",
      en: "Receive Info",
    },
    {
      key: "apartments.agent_property",
      namespace: "apartments",
      vi: "Liệt kê bởi",
      en: "Listed by",
    },
    {
      key: "apartments.property_details",
      namespace: "apartments",
      vi: "Thông tin chi tiết",
      en: "Property Details",
    },
    {
      key: "apartments.investment_price",
      namespace: "apartments",
      vi: "Giá đầu tư",
      en: "Investment Price",
    },
    // ── New keys added for apartment detail restyle ──────────────────
    {
      key: "apartments.property_description_1",
      namespace: "apartments",
      vi: "Không gian sống cao cấp được thiết kế theo phong cách hiện đại tối giản. Từng chi tiết được chăm chút tỉ mỉ để tối đa hoá ánh sáng tự nhiên và luồng không khí trong suốt cả ngày.",
      en: "A premium living space designed in the spirit of modern minimalism. Every detail is crafted to maximise natural light and airflow throughout the day.",
    },
    {
      key: "apartments.property_description_2",
      namespace: "apartments",
      vi: "Tọa lạc ở vị trí đắc địa với tầm nhìn đặc quyền, bất động sản này mang lại giá trị an cư lâu dài và tiềm năng đầu tư vượt thời gian.",
      en: "Located in a prime position with commanding views, this property delivers lasting lifestyle value and a timeless investment proposition.",
    },
    {
      key: "apartments.legal_status",
      namespace: "apartments",
      vi: "Pháp lý",
      en: "Legal",
    },
    {
      key: "apartments.condition",
      namespace: "apartments",
      vi: "Tình trạng",
      en: "Condition",
    },
    {
      key: "apartments.long_term_ownership",
      namespace: "apartments",
      vi: "Sổ hồng sở hữu lâu dài",
      en: "Permanent ownership title",
    },
    {
      key: "apartments.basic_furnished",
      namespace: "apartments",
      vi: "Nội thất hoàn thiện cơ bản",
      en: "Basic furnished finish",
    },
    {
      key: "common.receive_info",
      namespace: "common",
      vi: "Nhận thông tin",
      en: "Request Information",
    },
    // ── New keys for View All Apartments Page ──────────────────
    {
      key: "apartments.managed_by",
      namespace: "apartments",
      vi: "Tất cả bất động sản đang được quản lý bởi {brandName}.",
      en: "All properties managed by {brandName}.",
    },
    {
      key: "apartments.status",
      namespace: "apartments",
      vi: "Trạng thái",
      en: "Status",
    },
    {
      key: "apartments.price_range",
      namespace: "apartments",
      vi: "Mức giá",
      en: "Price Range",
    },
    {
      key: "apartments.price_asc",
      namespace: "apartments",
      vi: "Thấp đến cao",
      en: "Low to High",
    },
    {
      key: "apartments.price_desc",
      namespace: "apartments",
      vi: "Cao đến thấp",
      en: "High to Low",
    },
    {
      key: "apartments.for_rent",
      namespace: "apartments",
      vi: "Cho thuê",
      en: "For Rent",
    },
    {
      key: "apartments.no_properties",
      namespace: "apartments",
      vi: "Hiện tại không có bất động sản nào.",
      en: "There are currently no properties available.",
    },
    // ── Detail Page New Keys ───────────────────────────────
    { key: "apartments.overview", namespace: "apartments", vi: "Tổng quan", en: "Overview" },
    { key: "apartments.highlights", namespace: "apartments", vi: "Điểm nhấn", en: "Highlights" },
    { key: "apartments.landscape", namespace: "apartments", vi: "Cảnh quan", en: "Landscape" },
    { key: "apartments.key_facts", namespace: "apartments", vi: "Thông tin chính", en: "Key Facts" },
    { key: "apartments.direction", namespace: "apartments", vi: "Hướng nhà", en: "Direction" },
    { key: "apartments.balcony_direction", namespace: "apartments", vi: "Hướng ban công", en: "Balcony Direction" },
    { key: "apartments.floor_level", namespace: "apartments", vi: "Tầng", en: "Floor Level" },
    { key: "apartments.floor_low", namespace: "apartments", vi: "Tầng thấp", en: "Low Floor" },
    { key: "apartments.floor_mid", namespace: "apartments", vi: "Tầng trung", en: "Mid Floor" },
    { key: "apartments.floor_high", namespace: "apartments", vi: "Tầng cao", en: "High Floor" },
    { key: "apartments.price_breakdown", namespace: "apartments", vi: "Chi tiết giá", en: "Price Breakdown" },
    { key: "apartments.total_price", namespace: "apartments", vi: "Tổng giá", en: "Total Price" },
    { key: "apartments.price_per_sqm", namespace: "apartments", vi: "Giá/m2", en: "Price per sqm" },
    { key: "apartments.transfer_fee", namespace: "apartments", vi: "Phí sang nhượng", en: "Transfer Fee" },
    { key: "apartments.tax_responsibility", namespace: "apartments", vi: "Thuế phí", en: "Tax Responsibility" },
    { key: "apartments.tax_buyer", namespace: "apartments", vi: "Người mua chịu", en: "Buyer pays" },
    { key: "apartments.tax_seller", namespace: "apartments", vi: "Người bán chịu", en: "Seller pays" },
    { key: "apartments.tax_negotiated", namespace: "apartments", vi: "Thương lượng", en: "Negotiated" },
    { key: "apartments.management_fee", namespace: "apartments", vi: "Phí quản lý", en: "Management Fee" },
    { key: "apartments.negotiable", namespace: "apartments", vi: "Có thương lượng", en: "Negotiable" },
    { key: "apartments.location", namespace: "apartments", vi: "Vị trí", en: "Location" },
    { key: "apartments.amenities", namespace: "apartments", vi: "Tiện ích", en: "Amenities" },
    { key: "apartments.internal_amenities", namespace: "apartments", vi: "Nội khu", en: "Internal" },
    { key: "apartments.external_amenities", namespace: "apartments", vi: "Ngoại khu", en: "External" },
    { key: "apartments.legal_document", namespace: "apartments", vi: "Giấy tờ pháp lý", en: "Legal Document" },
    { key: "apartments.ownership_term", namespace: "apartments", vi: "Thời hạn sở hữu", en: "Ownership Term" },
    { key: "apartments.term_long", namespace: "apartments", vi: "Lâu dài", en: "Long term" },
    { key: "apartments.term_50", namespace: "apartments", vi: "50 năm", en: "50 years" },
    { key: "apartments.bank_mortgaged", namespace: "apartments", vi: "Thế chấp ngân hàng", en: "Bank Mortgaged" },
    { key: "apartments.bank_support", namespace: "apartments", vi: "Ngân hàng hỗ trợ", en: "Bank Support" },
    { key: "apartments.investment_roi", namespace: "apartments", vi: "Giá trị đầu tư", en: "Investment & ROI" },
    { key: "apartments.rental_yield", namespace: "apartments", vi: "Tỷ suất cho thuê dự kiến", en: "Expected Rental Yield" },
    { key: "apartments.roi_disclaimer", namespace: "apartments", vi: "Số liệu chỉ mang tính chất tham khảo dựa trên thuật toán và xu hướng thị trường.", en: "Figures are for reference only based on algorithms and market trends." },
    { key: "apartments.similar_listings", namespace: "apartments", vi: "Căn hộ tương tự", en: "Similar Listings" },
    { key: "apartments.save", namespace: "apartments", vi: "Lưu", en: "Save" },
    { key: "apartments.saved", namespace: "apartments", vi: "Đã lưu", en: "Saved" },
    { key: "apartments.share", namespace: "apartments", vi: "Chia sẻ", en: "Share" },
    { key: "apartments.contact_agent", namespace: "apartments", vi: "Liên hệ Agent", en: "Contact Agent" },
    { key: "apartments.book_viewing", namespace: "apartments", vi: "Đặt lịch xem nhà", en: "Book a viewing" },
    { key: "agent.verified", namespace: "agent", vi: "Đã xác thực", en: "Verified" },
    { key: "agent.experience_years", namespace: "agent", vi: "Năm kinh nghiệm", en: "Years experience" },
    { key: "agent.transactions", namespace: "agent", vi: "Giao dịch thành công", en: "Transactions" },
    // ── Homepage Global Marketplace ──────────────────
    { key: "home.tab_sale", namespace: "common", vi: "MUA BÁN", en: "SALE" },
    { key: "home.tab_rent", namespace: "common", vi: "CHO THUÊ", en: "RENT" },
    { key: "home.search_placeholder_sale", namespace: "common", vi: "VD: Căn hộ 3PN tại Quận 2 dưới 5 tỷ", en: "Ex: 3BR Apartment in D2 under 5B" },
    { key: "home.search_placeholder_rent", namespace: "common", vi: "VD: Thuê căn hộ Quận 1 dưới 15 triệu", en: "Ex: Rent apartment in D1 under 15M" },
    { key: "home.search_btn", namespace: "common", vi: "Tìm Kiếm", en: "Search" },
    
    // Curated Collections (Rent)
    { key: "home.collection_rent_full", namespace: "common", vi: "Full nội thất xách vali vào ở", en: "Fully furnished ready to move in" },
    { key: "home.collection_rent_pet", namespace: "common", vi: "Không gian thân thiện Thú cưng", en: "Pet-friendly spaces" },
    { key: "home.collection_rent_free_hours", namespace: "common", vi: "Giờ giấc tự do, thoải mái", en: "Flexible hours" },
    
    // Curated Collections (Sale)
    { key: "home.collection_sale_cut_loss", namespace: "common", vi: "Chủ kẹt tiền - Cắt lỗ giảm sâu", en: "Urgent sale - Massive discount" },
    { key: "home.collection_sale_new", namespace: "common", vi: "Dự án mới bàn giao", en: "Newly handed over projects" },
    { key: "home.collection_sale_pink_book", namespace: "common", vi: "Sổ hồng trao tay, pháp lý chuẩn", en: "Pink book available, legal checked" },
    
    // Market Snapshot
    { key: "home.market_snapshot_title", namespace: "common", vi: "Nhịp Đập Thị Trường", en: "Market Snapshot" },
    { key: "home.market_snapshot_description", namespace: "common", vi: "Chúng tôi liên tục cập nhật dữ liệu thị trường để giúp bạn đưa ra quyết định mua bán, đầu tư chính xác nhất dựa trên con số thực tế.", en: "We continuously update market data to help you make the most accurate buying, selling, and investment decisions based on actual numbers." },
    { key: "home.market_avg_price", namespace: "common", vi: "Giá chung cư trung bình:", en: "Average apartment price:" },
    { key: "home.market_high_liquidity", namespace: "common", vi: "Thanh khoản cao", en: "High Liquidity" },
    { key: "home.market_avg_days", namespace: "common", vi: "Trung bình 14 ngày/giao dịch", en: "Average 14 days/transaction" },
    { key: "home.market_low_supply", namespace: "common", vi: "Nguồn cung khan hiếm", en: "Low Supply" },
    { key: "home.market_new_listings", namespace: "common", vi: "Chỉ 45 căn mở bán mới", en: "Only 45 new listings" },
    
    // Featured Agents
    { key: "home.featured_agents_title", namespace: "common", vi: "Chuyên Gia Đáng Tin Cậy", en: "Trusted Experts" },
    { key: "home.featured_agents_desc", namespace: "common", vi: "Làm việc trực tiếp với những môi giới uy tín hàng đầu thị trường.", en: "Work directly with the top verified brokers in the market." },
    { key: "home.view_all", namespace: "common", vi: "Xem tất cả", en: "View all" },
    { key: "home.consultant", namespace: "common", vi: "Chuyên Viên Tư Vấn", en: "Consultant" },
    { key: "home.transactions", namespace: "common", vi: "Giao dịch thành công", en: "Transactions" },
    
    // Call to Action Supply
    { key: "home.cta_supply_title", namespace: "common", vi: "Bạn là chủ nhà?", en: "Are you a homeowner?" },
    { key: "home.cta_supply_desc", namespace: "common", vi: "Tiếp cận hàng ngàn khách hàng tiềm năng. Đăng tin miễn phí hoặc ký gửi cho chuyên gia của chúng tôi.", en: "Reach thousands of potential buyers/renters. Post a free listing or consign with our experts." },
    { key: "home.cta_post_free", namespace: "common", vi: "Đăng Tin Miễn Phí", en: "Post Free Listing" },
    { key: "home.cta_consign", namespace: "common", vi: "Ký Gửi Ngay", en: "Consign Now" },
    
    // Lead generation form
    { key: "lead.form_title_sale", namespace: "contact", vi: "Nhận Báo Giá & Tài Liệu", en: "Get Quote & Documents" },
    { key: "lead.form_title_rent", namespace: "contact", vi: "Liên Hệ Tư Vấn Thuê", en: "Contact for Rent" },
  ] satisfies {
    key: string;
    namespace: Translation["namespace"];
    vi: string;
    en: string;
  }[];

  const results = [];

  for (const t of translations) {
    try {
      const existing = await payload.find({
        collection: "translations",
        where: { key: { equals: t.key } },
        depth: 0,
      });

      if (existing.docs.length > 0) {
        // Key already exists – skip to avoid overriding manually-set values
        results.push({ key: t.key, status: "skipped (already exists)" });
      } else {
        // Create vi first
        const newDoc = await payload.create({
          collection: "translations",
          data: {
            key: t.key,
            namespace: t.namespace,
            value: t.vi,
          },
          locale: "vi",
        });
        // Set en value
        await payload.update({
          collection: "translations",
          id: newDoc.id,
          data: { value: t.en },
          locale: "en",
        });
        results.push({ key: t.key, status: "created" });
      }
    } catch (e) {
      results.push({
        key: t.key,
        status: "error",
        error: (e as Error).message,
      });
    }
  }

  console.log("Seeding translations completed successfully");
  console.log(results);
}

seedTranslations().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
