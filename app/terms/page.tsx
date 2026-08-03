import type { Metadata } from "next";

import { LegalPage, type LegalSection } from "@/components/legal-page";
import { SUPPORT_PHONE } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Terms & Conditions | BRB Expeditions",
  description:
    "Rental terms for BRB Expeditions: booking and payment, documents required, security deposit, cancellations, fuel, damage and rider responsibilities.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const SECTIONS: LegalSection[] = [
  {
    heading: "About these terms",
    paragraphs: [
      "These terms apply to every vehicle rented from BRB Expeditions, whether booked on this website or in person at our Manali or Bhuntar branches. By making a booking you agree to them.",
    ],
  },
  {
    heading: "Who can rent",
    bullets: [
      "You must be at least 18 years old.",
      "You must hold a valid driving licence for the class of vehicle you are renting. A two-wheeler licence is mandatory for bikes and scooters.",
      "You must present one original government photo ID — Aadhaar, Passport or Voter ID.",
      "International visitors may need an International Driving Permit alongside their home licence.",
      "Photocopies and digital images are not accepted in place of originals.",
    ],
  },
  {
    heading: "Booking and payment",
    bullets: [
      "You pay 10% of the booking total online to confirm the vehicle. This is what secures your dates.",
      "The remaining balance is settled after your ride is over and the vehicle has been returned.",
      "The booking total covers the daily hire, any riding gear you add, and a refundable security deposit.",
      "Prices vary with season, vehicle and rental duration. The price shown at the time of booking is the one that applies.",
      "Online payments are processed by Razorpay. We never see your card or UPI credentials.",
    ],
  },
  {
    heading: "Security deposit",
    paragraphs: [
      "A refundable security deposit is part of the booking total and its amount depends on the vehicle and the route you are taking. It is returned after the vehicle is handed back and inspected.",
      "We may deduct from the deposit for damage, missing parts, traffic fines incurred during your rental, a late return, or fuel returned below the level at pickup. Any deduction will be explained to you.",
    ],
  },
  {
    heading: "Cancellations and changes",
    paragraphs: [
      `Cancellations and date changes are handled by our team rather than through the website. Call or WhatsApp us on ${SUPPORT_PHONE} with your booking details and we will take care of it.`,
      "Any charge that applies depends on how close to your pickup date you cancel, and will be explained before anything is deducted. Refunds are returned to the original payment method.",
    ],
  },
  {
    heading: "Using the vehicle",
    bullets: [
      "Only the person named on the booking may drive or ride the vehicle.",
      "Helmets must be worn by the rider and pillion at all times.",
      "Riding under the influence of alcohol or drugs is strictly prohibited and voids all cover.",
      "Do not carry more passengers than the vehicle is registered for.",
      "Do not use the vehicle for racing, stunts, towing, or any commercial purpose such as delivery or paid rides.",
      "Sub-letting or handing the vehicle to anyone else is not permitted.",
      "Tell us before taking the vehicle outside Himachal Pradesh so we can arrange the correct permits.",
    ],
  },
  {
    heading: "Fuel",
    paragraphs: [
      "Fuel is not included in the rental price. The vehicle is handed over with a recorded fuel level and should be returned at the same level. A shortfall is charged at cost.",
    ],
  },
  {
    heading: "Breakdowns, damage and accidents",
    bullets: [
      "Our vehicles are serviced before every rental. If something fails mechanically through no fault of yours, contact us immediately and we will assist or arrange a replacement where possible.",
      "Damage caused by an accident, misuse or negligence is your responsibility, up to the repair cost.",
      "Report any accident to us and to the police straight away. Insurance claims cannot be processed without a police report.",
      "In the event of theft, an FIR is mandatory.",
    ],
  },
  {
    heading: "Returns and late fees",
    paragraphs: [
      "Return the vehicle to the agreed branch at the agreed time. Late returns are charged pro rata at the daily rate, and repeated delays without notice may be treated as unauthorised use.",
    ],
  },
  {
    heading: "Traffic fines",
    paragraphs: [
      "Any challan, fine or penalty incurred while the vehicle is in your possession is your responsibility, including any that reach us after the rental has ended.",
    ],
  },
  {
    heading: "Our liability",
    paragraphs: [
      "We maintain our fleet carefully and provide vehicles that are road-legal and insured. We are not liable for personal injury, loss of belongings, or delays and costs arising from weather, road closures, permit refusals or circumstances outside our control. Mountain riding carries inherent risk and you take it on knowingly.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. The version in force is the one published here on the date of your booking.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms &"
      highlight="Conditions"
      intro="The rules of renting with us — payment, documents, deposits and what happens if something goes wrong."
      updated="3 August 2026"
      sections={SECTIONS}
    />
  );
}
