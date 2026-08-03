import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal-page";
import { SUPPORT_EMAIL } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Privacy Policy | BRB Expeditions",
  description:
    "How BRB Expeditions collects, uses and protects your personal information when you rent a bike, car or scooter in Manali and Bhuntar.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

// Written to describe what this site actually does — email/password accounts,
// Razorpay for payments, Supabase for storage — rather than generic boilerplate.
const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      "BRB Expeditions is a self-drive vehicle rental business operating in Manali and Bhuntar, Himachal Pradesh. This policy covers bikerentalsbhuntar.com and any booking you make through it.",
    ],
  },
  {
    heading: "What we collect",
    paragraphs: ["We only ask for what a rental actually requires:"],
    bullets: [
      "Account details — your name, email address and phone number. Your email is how you sign in; your phone number is how we reach you about a booking.",
      "Booking details — the vehicle, dates, pickup location and any riding gear you add.",
      "Payment records — the amount, the Razorpay payment reference and whether it succeeded. We never see or store your card number, UPI PIN or bank credentials.",
      "Documents at pickup — we check your driving licence and a government photo ID in person, in original. We verify them; we do not upload them to this website.",
      "Basic technical data — standard server logs such as IP address and browser type, kept for security and troubleshooting.",
    ],
  },
  {
    heading: "How we use it",
    bullets: [
      "To create and manage your booking, and to contact you about it.",
      "To take the 10% advance payment and settle the balance after your ride.",
      "To return your refundable security deposit.",
      "To meet legal and insurance obligations that apply to vehicle rental in India.",
    ],
    paragraphs: [
      "We do not sell your personal information, and we do not send marketing messages unless you have asked us to.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: [
      "Only the services needed to run the booking, and only the data each one needs:",
    ],
    bullets: [
      "Razorpay — processes payments and refunds. Your card and UPI details go directly to Razorpay and never pass through our servers.",
      "Supabase — hosts our database and file storage.",
      "Our own team — staff at the Manali and Bhuntar branches who handle your booking.",
      "Authorities — where we are legally required to disclose information, for example after an accident or a traffic offence.",
    ],
  },
  {
    heading: "How we protect it",
    bullets: [
      "The site is served over HTTPS, so traffic between your device and us is encrypted.",
      "Your password is stored hashed. Nobody at BRB Expeditions can read it.",
      "Database access is restricted per account, so you can only read your own bookings, cart and profile.",
      "Payment confirmations are verified cryptographically before a booking is accepted.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Booking and payment records are kept for as long as needed for accounting, tax and insurance purposes. Account details are kept while your account is open. If you ask us to delete your account, we remove your profile but may retain booking records where the law requires it.",
    ],
  },
  {
    heading: "Your choices",
    bullets: [
      "You can view and update your name and phone number from your profile page at any time.",
      "You can ask us for a copy of the personal information we hold about you.",
      "You can ask us to correct anything inaccurate, or to delete your account.",
    ],
    paragraphs: [
      `To make any of these requests, email us at ${SUPPORT_EMAIL} from the address on your account.`,
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "We use a small number of essential cookies to keep you signed in and to remember your cart. These are required for the site to work and are not used for advertising or cross-site tracking.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "Our services are not intended for anyone under 18, and a valid driving licence is required to rent any vehicle. We do not knowingly collect information from children.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "If we change how we handle your information, we will update this page and the date shown above. Significant changes will be communicated to you directly where we can.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      highlight="Policy"
      intro="What we collect when you rent with us, why we need it, and what we do to keep it safe."
      updated="3 August 2026"
      sections={SECTIONS}
    />
  );
}
