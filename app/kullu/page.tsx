import type { Metadata } from "next";

import { CityLanding } from "@/components/city-landing";
import { KULLU } from "@/lib/city-content";
import { cityMetadata } from "@/lib/city-metadata";

export const metadata: Metadata = cityMetadata(KULLU);

export default function KulluPage() {
  return <CityLanding content={KULLU} />;
}
