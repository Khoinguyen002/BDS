import { CollectionConfig, APIError } from "payload";
import { getEffectiveTier, TIERS } from "@bds/shared";
import { triggerRevalidateTag } from "../utils/revalidate";
import { formatSlug } from "../utils/formatSlug";

export const Apartments: CollectionConfig = {
  slug: "apartments",
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      return { owner: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      return { owner: { equals: user?.id } };
    },
  },
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "propertyType",
      type: "select",
      label: { vi: "Loại hình", en: "Property Type" },
      options: [
        { label: { vi: "Phòng trọ", en: "Boarding Room" }, value: "boarding_room" },
        { label: { vi: "Căn hộ", en: "Apartment" }, value: "apartment" },
        { label: { vi: "Nhà đất", en: "Land & House" }, value: "land_house" },
      ],
      required: true,
      defaultValue: "apartment",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "listingType",
      type: "select",
      options: [
        { label: { vi: "Bán", en: "Sale" }, value: "sale" },
        { label: { vi: "Cho thuê", en: "Rent" }, value: "rent" },
      ],
      required: true,
      admin: {
        position: "sidebar",
        condition: (data) => data.propertyType !== "boarding_room",
        description: "Tự động là Cho thuê đối với Phòng trọ",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: { vi: "Thông tin chung", en: "Basic Info" },
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              localized: true,
            },
            { name: "address", type: "text", localized: true },
            {
              name: "gallery",
              type: "upload",
              relationTo: "media",
              hasMany: true,
            },
            { name: "tourUrl", type: "text", label: { vi: "Video/360 Tour URL", en: "Video/360 Tour URL" } },
            {
              name: "details",
              type: "group",
              label: { vi: "Chi tiết", en: "Details" },
              fields: [
                { name: "overview", type: "richText", label: { vi: "Tổng quan", en: "Overview" } },
                { name: "highlights", type: "richText", label: { vi: "Đặc điểm nổi bật", en: "Highlights" } },
                { name: "landscape", type: "richText", label: { vi: "Cảnh quan", en: "Landscape" } },
              ],
            },
          ],
        },
        {
          label: { vi: "Thông tin cơ bản", en: "Key Facts" },
          fields: [
            {
              name: "keyFacts",
              type: "group",
              label: { vi: "Đặc điểm chính", en: "Key Facts" },
              fields: [
                // === 1. TEXT / NUMBER / SELECT INPUTS ===
                { name: "area", type: "number", label: { vi: "Diện tích (m2)", en: "Area (sqm)" } },
                { 
                  name: "bedrooms", 
                  type: "number", 
                  label: { vi: "Số phòng ngủ", en: "Bedrooms" },
                  admin: { condition: (data) => data.propertyType !== "boarding_room" }
                },
                { 
                  name: "bathrooms", 
                  type: "number", 
                  label: { vi: "Số phòng tắm", en: "Bathrooms" },
                  admin: { condition: (data) => data.propertyType !== "boarding_room" }
                },
                {
                  name: "hasMezzanine",
                  type: "checkbox",
                  label: { vi: "Có gác lửng", en: "Has Mezzanine" },
                  admin: { condition: (data) => data.propertyType === "boarding_room" }
                },
                {
                  name: "direction",
                  type: "select",
                  label: { vi: "Hướng nhà", en: "Direction" },
                  options: [
                    { label: { vi: "Đông", en: "East" }, value: "e" },
                    { label: { vi: "Tây", en: "West" }, value: "w" },
                    { label: { vi: "Nam", en: "South" }, value: "s" },
                    { label: { vi: "Bắc", en: "North" }, value: "n" },
                    { label: { vi: "Đông Nam", en: "Southeast" }, value: "se" },
                    { label: { vi: "Đông Bắc", en: "Northeast" }, value: "ne" },
                    { label: { vi: "Tây Nam", en: "Southwest" }, value: "sw" },
                    { label: { vi: "Tây Bắc", en: "Northwest" }, value: "nw" },
                  ],
                  admin: { condition: (data) => data.propertyType !== "boarding_room" },
                },
                {
                  name: "balconyDirection",
                  type: "select",
                  label: { vi: "Hướng ban công", en: "Balcony Direction" },
                  options: [
                    { label: { vi: "Đông", en: "East" }, value: "e" },
                    { label: { vi: "Tây", en: "West" }, value: "w" },
                    { label: { vi: "Nam", en: "South" }, value: "s" },
                    { label: { vi: "Bắc", en: "North" }, value: "n" },
                    { label: { vi: "Đông Nam", en: "Southeast" }, value: "se" },
                    { label: { vi: "Đông Bắc", en: "Northeast" }, value: "ne" },
                    { label: { vi: "Tây Nam", en: "Southwest" }, value: "sw" },
                    { label: { vi: "Tây Bắc", en: "Northwest" }, value: "nw" },
                  ],
                  admin: { condition: (data) => data.propertyType === "apartment" },
                },
                
                // Land & House Dimensions
                {
                  name: "landArea",
                  type: "number",
                  label: { vi: "Diện tích đất (m2)", en: "Land Area (sqm)" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "usableArea",
                  type: "number",
                  label: { vi: "Diện tích sử dụng (m2)", en: "Usable Area (sqm)" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "frontageWidth",
                  type: "number",
                  label: { vi: "Chiều ngang (m)", en: "Frontage Width (m)" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "depth",
                  type: "number",
                  label: { vi: "Chiều sâu (m)", en: "Depth (m)" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "alleyWidth",
                  type: "number",
                  label: { vi: "Độ rộng hẻm (m)", en: "Alley Width (m)" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },

                // Floors & Structure
                {
                  name: "floorLevel",
                  type: "select",
                  label: { vi: "Tầng", en: "Floor Level" },
                  options: [
                    { label: { vi: "Thấp", en: "Low" }, value: "low" },
                    { label: { vi: "Trung", en: "Mid" }, value: "mid" },
                    { label: { vi: "Cao", en: "High" }, value: "high" },
                  ],
                  admin: { condition: (data) => data.propertyType === "apartment" },
                },
                {
                  name: "numFloors",
                  type: "number",
                  label: { vi: "Số tầng", en: "Number of Floors" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "numBasements",
                  type: "number",
                  label: { vi: "Số tầng hầm", en: "Number of Basements" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "structureType",
                  type: "select",
                  label: { vi: "Kết cấu nhà", en: "Structure Type" },
                  options: [
                    { label: { vi: "Nhà Cấp 4", en: "Level 4 House" }, value: "cap_4" },
                    { label: { vi: "Nhà Phố", en: "Townhouse" }, value: "nha_pho" },
                    { label: { vi: "Biệt thự", en: "Villa" }, value: "biet_thu" },
                  ],
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "handoverYear",
                  type: "number",
                  label: { vi: "Năm bàn giao", en: "Handover Year" },
                  admin: { condition: (data) => data.listingType === "sale" },
                },
                {
                  name: "buildingQuality",
                  type: "select",
                  label: { vi: "Chất lượng xây dựng", en: "Building Quality" },
                  options: [
                    { label: { vi: "Mới xây", en: "Brand New" }, value: "new" },
                    { label: { vi: "Đã sửa chữa", en: "Renovated" }, value: "renovated" },
                    { label: { vi: "Cũ", en: "Old" }, value: "old" },
                  ],
                  admin: { condition: (data) => data.listingType === "sale" },
                },
                
                // Status / Rooms Type
                {
                  name: "furnitureStatus",
                  type: "select",
                  label: { vi: "Tình trạng nội thất", en: "Furniture Status" },
                  options: [
                    { label: { vi: "Bàn giao thô", en: "Bare Shell" }, value: "bare" },
                    { label: { vi: "Nhà trống", en: "Empty" }, value: "empty" },
                    { label: { vi: "Nội thất cơ bản", en: "Basic Furniture" }, value: "basic" },
                    { label: { vi: "Đầy đủ nội thất", en: "Fully Furnished" }, value: "full" },
                  ],
                },
                {
                  name: "bathroomType",
                  type: "select",
                  label: { vi: "Loại phòng tắm", en: "Bathroom Type" },
                  options: [
                    { label: { vi: "Riêng", en: "Private" }, value: "private" },
                    { label: { vi: "Chung", en: "Shared" }, value: "shared" },
                  ],
                  admin: { condition: (data) => data.propertyType === "boarding_room" },
                },
                {
                  name: "curfewTime",
                  type: "text",
                  label: { vi: "Giờ giới nghiêm", en: "Curfew Time" },
                  admin: { condition: (data) => data.propertyType === "boarding_room" && data.hasNightCurfew },
                },

                // === 2. CHECKBOXES (Grouped together) ===
                {
                  type: "row",
                  fields: [
                    {
                      name: "petFriendly",
                      type: "checkbox",
                      label: { vi: "Cho phép thú cưng", en: "Pet Friendly" },
                      admin: { condition: (data) => data.propertyType === "apartment" || data.propertyType === "boarding_room" },
                    },
                    {
                      name: "freeHours",
                      type: "checkbox",
                      label: { vi: "Giờ giấc tự do", en: "Free Hours" },
                      admin: { condition: (data) => data.propertyType === "boarding_room" },
                    },
                    {
                      name: "sharedLandlord",
                      type: "checkbox",
                      label: { vi: "Chung chủ", en: "Shared Landlord" },
                      admin: { condition: (data) => data.propertyType === "boarding_room" },
                    },
                    {
                      name: "hasNightCurfew",
                      type: "checkbox",
                      label: { vi: "Có giờ giới nghiêm", en: "Has Night Curfew" },
                      admin: { condition: (data) => data.propertyType === "boarding_room" },
                    },
                    {
                      name: "cookingAllowed",
                      type: "checkbox",
                      label: { vi: "Cho phép nấu ăn", en: "Cooking Allowed" },
                      admin: { condition: (data) => data.propertyType === "boarding_room" },
                    },
                    {
                      name: "hasElevator",
                      type: "checkbox",
                      label: { vi: "Có thang máy", en: "Has Elevator" },
                      admin: { condition: (data) => data.propertyType === "apartment" },
                    },
                    {
                      name: "hasKeyCard",
                      type: "checkbox",
                      label: { vi: "Thẻ từ thang máy", en: "Elevator Key Card" },
                      admin: { condition: (data) => data.propertyType === "apartment" && data.hasElevator },
                    },
                    {
                      name: "hasSecurity24h",
                      type: "checkbox",
                      label: { vi: "Bảo vệ 24/7", en: "24/7 Security" },
                      admin: { condition: (data) => data.propertyType === "apartment" },
                    },
                    {
                      name: "hasBasementParking",
                      type: "checkbox",
                      label: { vi: "Bãi xe tầng hầm", en: "Basement Parking" },
                      admin: { condition: (data) => data.propertyType === "apartment" },
                    },
                    {
                      name: "hasRooftop",
                      type: "checkbox",
                      label: { vi: "Có sân thượng", en: "Has Rooftop" },
                      admin: { condition: (data) => data.propertyType === "land_house" },
                    },
                    {
                      name: "isMainRoad",
                      type: "checkbox",
                      label: { vi: "Mặt tiền đường chính", en: "Main Road" },
                      admin: { condition: (data) => data.propertyType === "land_house" },
                    },
                    {
                      name: "isBusinessFacade",
                      type: "checkbox",
                      label: { vi: "Mặt tiền kinh doanh", en: "Business Facade" },
                      admin: { condition: (data) => data.propertyType === "land_house" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { vi: "Giá & Pháp lý", en: "Pricing & Legal" },
          fields: [
            { name: "price", type: "number", label: { vi: "Giá cơ bản", en: "Base Price" } },
            {
              name: "priceUnit",
              type: "select",
              options: [
                { label: { vi: "Tổng giá", en: "Total" }, value: "total" },
                { label: { vi: "Mỗi tháng", en: "Per Month" }, value: "per_month" },
              ],
              admin: {
                readOnly: true,
                description: "Auto-synced from Listing Type (Sale = total, Rent = per_month)",
              },
            },
            {
              name: "priceBreakdown",
              type: "group",
              label: { vi: "Chi tiết giá bán", en: "Price Breakdown" },
              admin: { condition: (data) => data.propertyType === "apartment" && data.listingType === "sale" || data.propertyType === "land_house" },
              fields: [
                { name: "pricePerSqm", type: "number", label: { vi: "Giá trên m2", en: "Price Per Sqm" } },
                { name: "transferFee", type: "text", localized: true, label: { vi: "Phí chuyển nhượng", en: "Transfer Fee" } },
                {
                  name: "taxResponsibility",
                  type: "select",
                  label: { vi: "Trách nhiệm đóng thuế", en: "Tax Responsibility" },
                  options: [
                    { label: { vi: "Người mua chịu", en: "Buyer" }, value: "buyer" },
                    { label: { vi: "Người bán chịu", en: "Seller" }, value: "seller" },
                    { label: { vi: "Thỏa thuận", en: "Negotiated" }, value: "negotiated" },
                  ],
                },
                { name: "managementFee", type: "number", label: { vi: "Phí quản lý", en: "Management Fee" } },
                { name: "negotiable", type: "checkbox", defaultValue: true, label: { vi: "Có thể thương lượng", en: "Negotiable" } },
              ],
            },
            {
              name: "rentPricing",
              type: "group",
              label: { vi: "Chi tiết giá thuê", en: "Rent Pricing" },
              admin: { condition: (data) => data.propertyType === "boarding_room" || data.propertyType === "apartment" && data.listingType === "rent" },
              fields: [
                {
                  name: "deposit",
                  type: "select",
                  label: { vi: "Đặt cọc", en: "Deposit" },
                  options: [
                    { label: { vi: "1 tháng", en: "1 Month" }, value: "1_month" },
                    { label: { vi: "2 tháng", en: "2 Months" }, value: "2_months" },
                    { label: { vi: "3 tháng", en: "3 Months" }, value: "3_months" },
                    { label: { vi: "Khác", en: "Other" }, value: "other" },
                  ],
                },
                {
                  name: "utilitiesPrice",
                  type: "select",
                  label: { vi: "Giá điện nước", en: "Utilities Price" },
                  options: [
                    { label: { vi: "Giá nhà nước", en: "State Price" }, value: "state" },
                    { label: { vi: "Giá dịch vụ/kinh doanh", en: "Business Price" }, value: "business" },
                    { label: { vi: "Thỏa thuận", en: "Negotiated" }, value: "negotiated" },
                  ],
                },
                {
                  name: "minLeaseTerm",
                  type: "number",
                  label: { vi: "Thời hạn thuê tối thiểu (Tháng)", en: "Min Lease Term (Months)" },
                },
                {
                  name: "electricityPrice",
                  type: "text",
                  label: { vi: "Giá điện", en: "Electricity Price" },
                  admin: { condition: (data) => data.propertyType === "boarding_room" },
                },
                {
                  name: "waterPrice",
                  type: "text",
                  label: { vi: "Giá nước", en: "Water Price" },
                  admin: { condition: (data) => data.propertyType === "boarding_room" },
                },
                {
                  name: "trashFee",
                  type: "number",
                  label: { vi: "Phí rác", en: "Trash Fee" },
                  admin: { condition: (data) => data.propertyType === "boarding_room" },
                },
                {
                  name: "wifiFee",
                  type: "number",
                  label: { vi: "Phí Wi-Fi", en: "Wi-Fi Fee" },
                  admin: { condition: (data) => data.propertyType === "boarding_room" },
                },
                {
                  name: "parkingFee",
                  type: "number",
                  label: { vi: "Phí gửi xe", en: "Parking Fee" },
                  admin: { condition: (data) => data.propertyType === "boarding_room" },
                },
                { name: "availableDate", type: "date", label: { vi: "Ngày trống", en: "Available Date" } },
                {
                  name: "managementFeeIncluded",
                  type: "checkbox",
                  label: { vi: "Bao gồm phí quản lý", en: "Management Fee Included" },
                  defaultValue: false,
                  admin: { condition: (data) => data.propertyType === "apartment" },
                },
                { name: "negotiable", type: "checkbox", defaultValue: true, label: { vi: "Có thể thương lượng", en: "Negotiable" } },
              ],
            },
            {
              name: "legal",
              type: "group",
              label: { vi: "Pháp lý", en: "Legal" },
              admin: { condition: (data) => data.propertyType === "apartment" && data.listingType === "sale" || data.propertyType === "land_house" },
              fields: [
                {
                  name: "documentType",
                  type: "select",
                  label: { vi: "Loại giấy tờ", en: "Document Type" },
                  options: [
                    { label: { vi: "Sổ hồng", en: "Pink Book" }, value: "pink_book" },
                    { label: { vi: "Sổ đỏ", en: "Red Book" }, value: "red_book" },
                    { label: { vi: "Hợp đồng mua bán", en: "Sale Contract" }, value: "sale_contract" },
                    { label: { vi: "Khác", en: "Other" }, value: "other" },
                  ],
                },
                {
                  name: "ownershipTerm",
                  type: "select",
                  label: { vi: "Thời hạn sở hữu", en: "Ownership Term" },
                  options: [
                    { label: { vi: "Lâu dài", en: "Long Term" }, value: "long_term" },
                    { label: { vi: "50 năm", en: "50 Years" }, value: "50_years" },
                  ],
                },
                { name: "bankMortgaged", type: "checkbox", label: { vi: "Đang thế chấp ngân hàng", en: "Bank Mortgaged" } },
                { name: "bankSupportPercentage", type: "number", label: { vi: "Hỗ trợ vay ngân hàng (%)", en: "Bank Support Percentage" } },
                {
                  name: "isFullyPermitted",
                  type: "checkbox",
                  label: { vi: "Hoàn công đầy đủ", en: "Fully Permitted" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "hasZoningIssue",
                  type: "checkbox",
                  label: { vi: "Dính quy hoạch", en: "Has Zoning Issue" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
                {
                  name: "hasDispute",
                  type: "checkbox",
                  label: { vi: "Đang tranh chấp", en: "Has Dispute" },
                  admin: { condition: (data) => data.propertyType === "land_house" },
                },
              ],
            },
          ],
        },
        {
          label: { vi: "Vị trí & Tiện ích", en: "Location & Amenities" },
          fields: [
            {
              name: "location",
              type: "group",
              label: { vi: "Vị trí", en: "Location" },
              fields: [
                {
                  name: "region",
                  type: "relationship",
                  label: { vi: "Phường / Xã", en: "Ward" },
                  relationTo: "locations",
                  filterOptions: {
                    level: { equals: "ward" },
                  },
                  admin: {
                    description: "Chọn phường/xã cụ thể (VD: Thảo Điền, Phường 1...)",
                  },
                },
                { name: "lat", type: "number", label: { vi: "Vĩ độ (Lat)", en: "Latitude" } },
                { name: "lng", type: "number", label: { vi: "Kinh độ (Lng)", en: "Longitude" } },
              ],
            },
            {
              name: "amenities",
              type: "relationship",
              label: { vi: "Tiện ích", en: "Amenities" },
              relationTo: "amenities",
              hasMany: true,
            },
          ],
        },
        {
          label: { vi: "Đầu tư", en: "Investment" },
          admin: { condition: (data) => data.propertyType === "apartment" && data.listingType === "sale" || data.propertyType === "land_house" },
          fields: [
            {
              name: "investment",
              type: "group",
              label: { vi: "Đầu tư", en: "Investment" },
              fields: [{ name: "rentalYield", type: "number", label: { vi: "Tỷ suất cho thuê (%)", en: "Rental Yield" } }],
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      type: "text",
      label: { vi: "Đường dẫn (Slug)", en: "Slug" },
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [formatSlug("title")],
      },
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "owner",
      type: "relationship",
      label: { vi: "Chủ sở hữu", en: "Owner" },
      relationTo: "users",
      required: true,
      defaultValue: ({ req }) => req.user?.id,
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === "create" && req.user) {
          const user = req.user;
          const tier = getEffectiveTier(user);

          const count = await req.payload.count({
            collection: "apartments",
            where: { owner: { equals: user.id } },
            req,
          });

          if (count.totalDocs >= TIERS[tier].maxApt) {
            throw new APIError(
              `Maximum apartments limit reached for ${tier} tier.`,
              400,
              undefined,
              true,
            );
          }
        }
        return data;
      },
    ],
    beforeChange: [
      ({ data }) => {
        // Auto sync listingType based on propertyType
        if (data.propertyType === "boarding_room") {
          data.listingType = "rent";
        }

        // Auto sync priceUnit based on listingType
        if (data.listingType === "sale") {
          data.priceUnit = "total";
        } else if (data.listingType === "rent") {
          data.priceUnit = "per_month";
        }

        // Auto set default bedroom/bathroom for boarding room
        if (data.propertyType === "boarding_room") {
          if (data.bedrooms == null) data.bedrooms = 1;
          if (data.bathrooms == null) data.bathrooms = 1;
        }

        return data;
      }
    ],
    afterChange: [
      async ({ req }) => {
        // Tag "apartments" bao mọi trang fetch apartment (home, search, agent,
        // list, detail). Không cần liệt kê path hay query owner nữa.
        await triggerRevalidateTag({ tag: "apartments", req });
      },
    ],
    afterDelete: [
      async ({ req }) => {
        await triggerRevalidateTag({ tag: "apartments", req });
      },
    ],
  },
};
