import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
