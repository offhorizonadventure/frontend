import type { Metadata } from "next";

import { ResetPasswordScreen } from "@/components/reset-password-screen";

export const metadata: Metadata = {
  title: "Set a New Password | BRB Expeditions",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-20">
      <ResetPasswordScreen />
    </main>
  );
}
