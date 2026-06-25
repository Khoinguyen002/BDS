import { getPayload } from "payload";
import configPromise from "../src/payload.config";

async function run() {
  try {
    const payload = await getPayload({ config: configPromise });
    console.log("Sending test email...");

    await payload.sendEmail({
      to: "nguyenvkhoi2002@gmail.com", // You can change this to your real email
      subject: "Test SMTP Configuration từ BDS CMS",
      html: "<h1>Thành công!</h1><p>Hệ thống gửi mail qua SMTP dounus.id.vn đã hoạt động ngon lành.</p>",
    });

    console.log("✅ Email sent successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    process.exit(1);
  }
}

run();
