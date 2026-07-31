import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";

type Props = {
  searchParams: Promise<{ passwordSet?: string; passwordChanged?: string; sessionExpired?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const passwordSet = params.passwordSet === "1";
  const passwordChanged = params.passwordChanged === "1";
  const sessionExpired = params.sessionExpired === "1";

  return (
    <Suspense fallback={null}>
      <LoginScreen
        passwordSet={passwordSet}
        passwordChanged={passwordChanged}
        sessionExpired={sessionExpired}
      />
    </Suspense>
  );
}
