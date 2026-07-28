"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { OfficerLoginStep } from "@/components/auth/officer-login-step";
import { OfficerOtpStep } from "@/components/auth/officer-otp-step";

type AuthStep = "login" | "otp";

export function LoginScreen() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("sessionExpired") === "1";
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  if (step === "otp") {
    return (
      <OfficerOtpStep
        email={email}
        password={password}
        code={otp}
        onCodeChange={setOtp}
        onBack={() => setStep("login")}
        sessionExpired={sessionExpired}
      />
    );
  }

  return (
    <OfficerLoginStep
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onContinue={() => setStep("otp")}
    />
  );
}
