import type { CollectionConfig } from 'payload';
import { formatSlug } from '../utils/formatSlug';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: () => true, // Allow public reading of users to resolve agent slugs
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
      label: 'Brand Name',
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
      label: 'Verified Agent Badge',
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
      label: 'Agent Profile',
      fields: [
        { name: 'experienceYears', type: 'number', label: 'Years of Experience' },
        { name: 'successfulTransactions', type: 'number', label: 'Successful Transactions' },
        { name: 'phoneNumber', type: 'text', label: 'Phone Number' },
        { name: 'zaloUrl', type: 'text', label: 'Zalo URL (e.g., https://zalo.me/0123456789)' },
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
      name: 'subscription',
      type: 'group',
      admin: {
        condition: (data, siblingData, { user }) => {
          if (!user) return false; // Ẩn ở trang Onboarding
          return data.role !== 'admin';
        },
      },
      fields: [
        { name: 'tier', type: 'select', options: ['free', 'pro'], defaultValue: 'free' },
        { name: 'expiresAt', type: 'date' },
        { name: 'lastPaymentId', type: 'text' },
      ]
    },
    {
      name: 'theme',
      type: 'group',
      admin: {
        condition: (data, siblingData, { user }) => Boolean(user),
      },
      fields: [
        { 
          name: 'primaryColor', 
          type: 'text', 
          defaultValue: '#2563eb', 
          label: 'Brand Primary Color',
          admin: {
            components: {
              Field: '@/components/ColorPickerField#ColorPickerField',
            }
          }
        },
        { name: 'borderRadius', type: 'select', options: ['none', 'sm', 'md', 'lg', 'full'], defaultValue: 'lg' },
        { name: 'fontFamily', type: 'select', options: ['sans', 'serif'], defaultValue: 'sans' },
      ]
    },
    {
      name: 'usage',
      type: 'group',
      admin: {
        condition: (data, siblingData, { user }) => {
          if (!user) return false; // Ẩn ở trang Onboarding
          return data.role !== 'admin';
        },
      },
      fields: [
        { name: 'storageBytes', type: 'number', defaultValue: 0 },
      ]
    }
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
    ]
  }
}
