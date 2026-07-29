import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";

type Props = {
  searchParams: Promise<{ passwordSet?: string; sessionExpired?: string }>;
};

function LoginWithParams({
  passwordSet,
  sessionExpired,
}: {
  passwordSet?: boolean;
  sessionExpired?: boolean;
}) {
  return (
    <>
      {sessionExpired ? (
        <div className="sr-only" role="status">
          Session expired
        </div>
      ) : null}
      <LoginScreen passwordSet={passwordSet} />
    </>
  );
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const passwordSet = params.passwordSet === "1";
  const sessionExpired = params.sessionExpired === "1";

  return (
    <Suspense fallback={null}>
      <LoginWithParams
        passwordSet={passwordSet}
        sessionExpired={sessionExpired}
      />
    </Suspense>
  );
}
