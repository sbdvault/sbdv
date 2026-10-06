import { Suspense } from "react";
import CapitalAccessRequestPage from "@/components/capital-access/CapitalAccessRequestPage";

export default function RequestPage() {
  return (
    <Suspense fallback={<p className="font-body text-charcoal/60">Loading…</p>}>
      <CapitalAccessRequestPage />
    </Suspense>
  );
}
