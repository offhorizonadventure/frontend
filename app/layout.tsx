import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import { FloatingContact } from "@/components/floating-contact";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCartCount } from "@/lib/cart";
import { createClient } from "@/utils/supabase/server";
import "./globals.css";

// Poppins: bold, geometric sans — reads as confident, modern branding for
// headings/logo. Inter: highly legible workhorse for body copy at any size.
const heading = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl = "https://www.bikerentalsbhuntar.com";
const siteName = "BRB Expeditions";
const title = "BRB Expeditions – Ride with Trusted Local Experts – Get 10% Off";
const description =
  "Rent powerful, well-maintained self-drive cars and bikes for daily, weekly, or monthly use. Perfect for mountain roads, long stays, and Himalayan adventures.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: "/images/og-hero.jpg",
        width: 1366,
        height: 768,
        alt: "Motorcyclist riding an adventure bike on a rocky mountain road during winter in Himachal Pradesh.",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/og-hero.jpg"],
  },
  verification: {
    google: "tHFj7pHkwfb-DW9jbr38FPdaM2jkN01qZeKywOQVaFs",
    other: {
      "facebook-domain-verification": "gf2or41i4eykccbdpz046bi21ckw8y",
    },
  },
  icons: {
    apple: "/images/logo.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Drives the header's account link and cart badge. Only a boolean and a
  // count cross into the client component — no user details reach the bundle.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const cartCount = user ? await getCartCount() : 0;

  return (
    <html
      lang="en-US"
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      {/* Bottom padding clears the fixed contact bar so it never covers the
          last of the footer. */}
      <body className="flex min-h-full flex-col pb-24 sm:pb-28">
        <SiteHeader isSignedIn={Boolean(user)} cartCount={cartCount} />
        {children}
        <SiteFooter />
        <FloatingContact />
      </body>
    </html>
  );
}
