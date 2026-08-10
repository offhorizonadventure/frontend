import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | BRB Expeditions",
  description: "Reset the password for your BRB Expeditions account.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-20">
      <ForgotPasswordForm />
    </main>
  );
}
