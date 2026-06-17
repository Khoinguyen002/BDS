import type { LandingPage, User } from "@bds/shared/payload-types";

export default function ContactForm(
  props: Extract<
    NonNullable<LandingPage["blocks"]>[number],
    { blockType: "contactForm" }
  > & { ownerId?: number | User },
) {
  const { title, placeholder } = props;

  return (
    <section className="py-24 px-4 md:px-8 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Premium subtle background glow based on theme primary */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 opacity-20 dark:opacity-10 blur-3xl rounded-full pointer-events-none" style={{ backgroundColor: 'var(--theme-primary)' }} />

      <div className="relative max-w-5xl mx-auto">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-[calc(var(--theme-radius)+0.5rem)] p-8 md:p-16 shadow-2xl flex flex-col md:flex-row gap-16 items-center">
          
          {/* Text Content */}
          <div className="w-full md:w-5/12">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-zinc-900 dark:text-white tracking-tight">
              {title || "Liên Hệ Với Chúng Tôi"}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-10 font-light leading-relaxed">
              {placeholder ||
                "Hãy để lại thông tin, chuyên viên của chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất."}
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">Hỗ trợ khách hàng 24/7</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">Bảo mật thông tin tuyệt đối</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="w-full md:w-7/12">
            <form className="space-y-5 bg-zinc-50/50 dark:bg-zinc-950/50 p-6 md:p-8 rounded-(--theme-radius) border border-zinc-100 dark:border-zinc-800">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3.5 rounded-[calc(var(--theme-radius)-0.25rem)] border border-zinc-200 dark:border-zinc-700 outline-none transition-all bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-(--theme-primary) focus:border-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3.5 rounded-[calc(var(--theme-radius)-0.25rem)] border border-zinc-200 dark:border-zinc-700 outline-none transition-all bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-(--theme-primary) focus:border-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  placeholder="0912 345 678"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Email (Không bắt buộc)
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3.5 rounded-[calc(var(--theme-radius)-0.25rem)] border border-zinc-200 dark:border-zinc-700 outline-none transition-all bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-(--theme-primary) focus:border-transparent text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  placeholder="example@mail.com"
                />
              </div>
              <button
                type="button"
                className="w-full py-4 text-white font-bold rounded-[calc(var(--theme-radius)-0.25rem)] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mt-4"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                Gửi Yêu Cầu
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
