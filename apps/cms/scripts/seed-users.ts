import { getPayload } from "payload";
import configPromise from "../src/payload.config";

async function run() {
  const payload = await getPayload({ config: configPromise });
  await payload.create({
    collection: "users",
    data: {
      email: "demo@bds.com",
      password: "password123",
      role: "admin",
      brandName: "BDS Demo",
      agentSlug: "bds-demo",
    },
  });
  console.log("Seeded demo user");
  process.exit(0);
}
run();
