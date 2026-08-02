import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In | BRB Expeditions",
  description:
    "Sign in or create an account with your email to book bikes and cars in Manali and Bhuntar.",
  // A login screen has nothing useful to index.
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-20">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
