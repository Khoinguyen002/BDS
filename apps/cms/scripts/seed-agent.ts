import { getPayload } from "payload";
import configPromise from "../src/payload.config";

async function run() {
  const payload = await getPayload({ config: configPromise });
  const agent = await payload.create({
    collection: "users",
    data: {
      email: "agent@bds.com",
      password: "password123",
      role: "agent",
      brandName: "BDS Agent",
      agentSlug: "bds-agent",
      verified: true,
      profile: {
        experienceYears: 5,
        successfulTransactions: 100,
        phoneNumber: "0123456789",
      }
    },
  });
  
  // Reassign all apartments to the agent
  const apts = await payload.find({ collection: "apartments", limit: 100 });
  for (const apt of apts.docs) {
    await payload.update({
      collection: "apartments",
      id: apt.id,
      data: { owner: agent.id },
    });
  }
  console.log("Seeded demo agent and reassigned apartments");
  process.exit(0);
}
run();
