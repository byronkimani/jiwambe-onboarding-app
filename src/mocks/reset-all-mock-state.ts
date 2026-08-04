import { resetApplicationsMockState } from "@/mocks/applications-mock-state";
import { resetDepositsMockState } from "@/mocks/deposits-mock-state";
import { resetDocumentsMockState } from "@/mocks/documents-mock-state";
import { resetOfficerAuthMockState } from "@/mocks/officer-auth-mock-state";

export function resetAllOnboardingMockState(): void {
  resetOfficerAuthMockState();
  resetApplicationsMockState();
  resetDepositsMockState();
  resetDocumentsMockState();
}
