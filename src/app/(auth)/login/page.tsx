import { Suspense } from "react";
import type { Metadata } from "next";

import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/next-path";

export const metadata: Metadata = {
  title: "Login | Bangla Bazar Admin",
};

async function LoginFormWithNext({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const { next } = await searchParams;

  return (
    <LoginForm next={safeNextPath(typeof next === "string" ? next : null)} />
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="Login" subtitle="Sign in to the admin panel">
      <Suspense fallback={<LoginForm next={null} />}>
        <LoginFormWithNext searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
