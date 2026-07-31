import { CategorySection } from "@/components/category-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturedBikesSection } from "@/components/featured-bikes-section";
import { FindUsSection } from "@/components/find-us-section";
import { GearsSection } from "@/components/gears-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { ReviewsSection } from "@/components/reviews-section";
import { TrustFeatures } from "@/components/trust-features";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <TrustFeatures />
      <CategorySection />
      <FeaturedBikesSection />
      <HowItWorks />
      <GearsSection />
      <FindUsSection />
      <ReviewsSection />
      <FaqSection />
    </main>
  );
}
