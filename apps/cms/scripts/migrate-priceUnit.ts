import { getPayload } from "payload";
import configPromise from "../src/payload.config";

export async function migratePriceUnit() {
  const payload = await getPayload({ config: configPromise });

  // 1. Fetch all apartments
  const { docs: apartments } = await payload.find({
    collection: "apartments",
    limit: 1000,
  });

  let updated = 0;
  for (const apt of apartments) {
    try {
      // Re-saving the document will trigger the `beforeChange` hook
      // which will automatically set the `priceUnit` based on `listingType`.
      // We also make sure price is set correctly if it was null but rentPricing wasn't (if they used DB directly)
      // Though since payload drops removed fields in the object, we just rely on what's still there.
      await payload.update({
        collection: "apartments",
        id: apt.id,
        data: {}, // empty data triggers beforeChange hook
        locale: "vi",
      });
      updated++;
    } catch (error) {
      console.error(
        `Error migrating apartment ${apt.id}:`,
        (error as Error).message,
      );
    }
  }

  console.log(`Successfully migrated ${updated} apartments to use priceUnit.`);
}

migratePriceUnit()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
