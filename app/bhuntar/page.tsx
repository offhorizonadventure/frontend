import type { Metadata } from "next";

import { CityLanding } from "@/components/city-landing";
import { BHUNTAR } from "@/lib/city-content";
import { cityMetadata } from "@/lib/city-metadata";

export const metadata: Metadata = cityMetadata(BHUNTAR);

export default function BhuntarPage() {
  return <CityLanding content={BHUNTAR} />;
}
