import { getPlans, getPartnerNames } from "@/lib/data";
import PlansClient from "@/components/plans/PlansClient";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const [plans, partnerNames] = await Promise.all([getPlans(), getPartnerNames()]);
  return <PlansClient plans={plans} partnerNames={partnerNames} />;
}
