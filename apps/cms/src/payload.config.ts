import { buildConfig } from "payload";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { vi } from "@payloadcms/translations/languages/vi";
import { en } from "@payloadcms/translations/languages/en";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { cloudinaryStorage } from "./lib/cloudinary-storage";
import { Users } from "./collections/Users";
import { LandingPages } from "./collections/LandingPages";
import { Media } from "./collections/Media";
import { Apartments } from "./collections/Apartments";
import { Leads } from "./collections/Leads";
import { Templates } from "./collections/Templates";
import { Translations } from "./collections/Translations";
import { Amenities } from "./collections/Amenities";
import { Tags } from "./collections/Tags";
import { Locations } from "./collections/Locations";
import { Plans } from "./collections/Plans";
import { Subscriptions } from "./collections/Subscriptions";
import { AppSettings } from "./globals/AppSettings";
import { ComponentPermissions } from "./globals/ComponentPermissions";
import { Homepage } from "./globals/Homepage";
import { registerHandler } from "./endpoints/register";
import { faviconHandler } from "./endpoints/favicon";
import { env } from "./env";

export default buildConfig({
  i18n: {
    supportedLanguages: { vi, en },
    translations: {
      vi: {
        custom: {
          apartmentPicker: {
            quickSelect: "⚡ Chọn nhanh",
            clearAll: "✕ Xóa tất cả",
            modalTitle: "Chọn nhanh căn hộ",
            searchPlaceholder: "Tìm theo tên...",
            allTypes: "Tất cả loại",
            sale: "Bán",
            rent: "Cho thuê",
            allTags: "Tất cả tag",
            apartments: "căn hộ",
            selected: "đã chọn",
            selectAll: "Chọn tất cả",
            allSelected: "✓ Đã chọn hết",
            deselectFiltered: "Bỏ chọn lọc",
            clearSelection: "Xóa hết",
            loading: "Đang tải...",
            noResults: "Không tìm thấy căn hộ nào",
            cancel: "Hủy",
            confirm: "Xác nhận",
            unit: "căn",
          },
          locationPicker: {
            label: "Phường / Xã",
            placeholder: "Chọn phường/xã...",
            title: "Chọn Phường / Xã",
            close: "Đóng",
            searchPlaceholder: "Tìm kiếm phường/xã...",
            noResults: "Không tìm thấy",
            district: "Quận/Huyện",
            ward: "Phường/Xã",
            selectDistrictFirst: "Chọn quận trước",
            noWards: "Không có phường/xã",
          },
        },
      },
      en: {
        custom: {
          apartmentPicker: {
            quickSelect: "⚡ Quick Select",
            clearAll: "✕ Clear All",
            modalTitle: "Quick Select Apartments",
            searchPlaceholder: "Search by name...",
            allTypes: "All types",
            sale: "Sale",
            rent: "Rent",
            allTags: "All tags",
            apartments: "apartments",
            selected: "selected",
            selectAll: "Select All",
            allSelected: "✓ All Selected",
            deselectFiltered: "Deselect Filtered",
            clearSelection: "Clear All",
            loading: "Loading...",
            noResults: "No apartments found",
            cancel: "Cancel",
            confirm: "Confirm",
            unit: "items",
          },
          locationPicker: {
            label: "Ward",
            placeholder: "Select ward...",
            title: "Select Ward",
            close: "Close",
            searchPlaceholder: "Search ward...",
            noResults: "No results found",
            district: "District",
            ward: "Ward",
            selectDistrictFirst: "Select a district first",
            noWards: "No wards available",
          },
        },
      },
    },
  },
  localization: {
    locales: ["vi", "en"],
    defaultLocale: "vi",
    fallback: true,
  },
  admin: {
    components: {
      graphics: {
        Logo: "@/components/AdminLogo#AdminLogo",
        Icon: "@/components/AdminLogo#AdminIcon",
      },
    },
    meta: {
      icons: [
        {
          rel: "icon",
          type: "image/svg+xml",
          url: "/api/favicon",
        },
      ],
    },
  },
  serverURL: env.PAYLOAD_PUBLIC_SERVER_URL,
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URI,
    },
    push: true,
  }),
  editor: lexicalEditor({}),
  cors: [env.NEXT_PUBLIC_APP_URL],
  csrf: [env.NEXT_PUBLIC_APP_URL],
  cookiePrefix: "payload",
  typescript: {
    outputFile: path.resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../../../packages/shared/payload-types.ts",
    ),
  },
  secret: env.PAYLOAD_SECRET,
  collections: [Users, LandingPages, Media, Apartments, Leads, Templates, Translations, Amenities, Tags, Locations, Plans, Subscriptions],
  globals: [
    AppSettings,
    ComponentPermissions,
    Homepage
  ],
  plugins: [
    // Ưu tiên Cloudinary nếu có cấu hình; fallback S3; nếu không có cả hai → local storage.
    ...(env.CLOUDINARY_CLOUD_NAME
      ? [
          cloudinaryStorage({
            cloudName: env.CLOUDINARY_CLOUD_NAME,
            apiKey: env.CLOUDINARY_API_KEY || "",
            apiSecret: env.CLOUDINARY_API_SECRET || "",
            folder: "bds",
            collections: { media: true },
          }),
        ]
      : env.S3_BUCKET
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: env.S3_BUCKET,
            config: {
              credentials: {
                accessKeyId: env.S3_ACCESS_KEY_ID || "",
                secretAccessKey: env.S3_SECRET_ACCESS_KEY || "",
              },
              region: env.S3_REGION,
              endpoint: env.S3_ENDPOINT || "",
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
  endpoints: [
    {
      path: "/users/register",
      method: "post",
      handler: registerHandler,
    },
    {
      path: "/favicon",
      method: "get",
      handler: faviconHandler,
    },
  ],
});
