import type { Metadata } from "next";

import { CityLanding } from "@/components/city-landing";
import { MANALI } from "@/lib/city-content";
import { cityMetadata } from "@/lib/city-metadata";

export const metadata: Metadata = cityMetadata(MANALI);

export default function ManaliPage() {
  return <CityLanding content={MANALI} />;
}
