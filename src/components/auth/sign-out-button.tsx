"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AppRoutes } from "@/lib/global/shared/routes";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: AppRoutes.home })}
    >
      Sign out
    </Button>
  );
}
