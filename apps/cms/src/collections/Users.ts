import type { CollectionConfig } from 'payload';
import { formatSlug } from '../utils/formatSlug';
import { triggerRevalidateWithCascade } from '../utils/revalidate';
import { COLLECTION_TAGS } from '@bds/shared/cache-tags';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return {
        role: {
          equals: 'agent',
        },
      };
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { id: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
    create: () => true,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      label: { vi: "Tên thương hiệu (Brand Name)", en: "Brand Name" },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { vi: "Logo thương hiệu", en: "Brand Logo" },
      admin: {
        description: { vi: "Logo sẽ hiển thị thay cho chữ cái viết tắt", en: "Logo to display instead of initials" },
        components: {
          Cell: '@/components/ThumbnailCell#ThumbnailCell',
        }
      }
    },
    {
      name: 'agentSlug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [formatSlug('brandName')],
      },
      admin: {
        hidden: true,
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      label: { vi: "Huy hiệu xác thực", en: "Verified Agent Badge" },
      defaultValue: false,
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: { position: 'sidebar' },
    },
    {
      name: 'profile',
      type: 'group',
      label: { vi: "Hồ sơ cá nhân", en: "Agent Profile" },
      fields: [
        { name: 'experienceYears', type: 'number', label: { vi: "Số năm kinh nghiệm", en: "Years of Experience" } },
        { name: 'successfulTransactions', type: 'number', label: { vi: "Số giao dịch thành công", en: "Successful Transactions" } },
        { name: 'phoneNumber', type: 'text', label: { vi: "Số điện thoại", en: "Phone Number" } },
        { name: 'zaloUrl', type: 'text', label: { vi: "Link Zalo (VD: https://zalo.me/...)", en: "Zalo URL" } },
      ]
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Agent', value: 'agent' },
      ],
      defaultValue: 'agent',
      required: true,
      access: {
        // Chỉ admin mới có quyền truyền field role (bảo mật public signup)
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        // Ẩn field này ở trang Onboarding (lúc chưa có user đăng nhập)
        condition: (data, siblingData, { user }) => Boolean(user),
      }
    },
    {
      name: 'activeSubscription',
      type: 'relationship',
      relationTo: 'subscriptions',
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => {
          if (!user) return false;
          return data.role !== 'admin';
        },
      },
    },
    {
      name: 'theme',
      type: 'group',
      label: { vi: "Giao diện (Theme)", en: "Theme" },
      admin: {
        condition: (data, siblingData, { user }) => Boolean(user),
      },
      fields: [
        { 
          name: 'primaryColor', 
          type: 'text', 
          defaultValue: '#2563eb', 
          label: { vi: "Màu chủ đạo (Primary Color)", en: "Brand Primary Color" },
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
        { 
          name: 'secondaryColor', 
          type: 'text', 
          defaultValue: '#475569', 
          label: { vi: "Màu phụ (Secondary Color)", en: "Brand Secondary Color" },
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
        { 
          name: 'secondaryForegroundColor', 
          type: 'text', 
          defaultValue: '#ffffff', 
          label: { vi: "Màu chữ phụ (Secondary Foreground Color)", en: "Secondary Foreground Color" },
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
        { name: 'borderRadius', type: 'select', options: ['none', 'sm', 'md', 'lg', 'full'], defaultValue: 'lg', label: { vi: "Bo góc", en: "Border Radius" } },
        { name: 'fontFamily', type: 'select', options: ['sans', 'serif'], defaultValue: 'sans', label: { vi: "Phông chữ", en: "Font Family" } },
      ]
    },

  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          // Bảo mật public signup: nếu đéo có ai đăng nhập, thì hoặc là first user, hoặc là public signup
          if (!req.user) {
            const { totalDocs } = await req.payload.find({
              collection: 'users',
              limit: 0,
            });
            // Nếu database đang trắng trơn => Chắc chắn là first user onboarding => Ép thành Admin
            if (totalDocs === 0) {
              data.role = 'admin';
            } else {
              // Nếu đã có dữ liệu rồi mà API vẫn gửi tới => Public signup trộm => Ép thành Agent
              data.role = 'agent';
            }
          }
        }
        return data;
      }
    ],
    afterChange: [
      async ({ req }) => {
        triggerRevalidateWithCascade({ tag: COLLECTION_TAGS.users, req });
      }
    ],
    afterDelete: [
      async ({ req }) => {
        triggerRevalidateWithCascade({ tag: COLLECTION_TAGS.users, req });
      }
    ],
  }
}
