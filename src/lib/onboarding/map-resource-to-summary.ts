import type {
  OnboardingApplicationResource,
  OnboardingApplicationSummary,
} from "@/lib/onboarding/application-resource";
import { formatKenyanPhoneDisplay } from "@/lib/global/auth/normalize-phone";

function maskPhone(phone: string | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return phone;
  const national =
    digits.startsWith("254") && digits.length === 12
      ? `0${digits.slice(3)}`
      : digits;
  if (national.length >= 10) {
    return `${national.slice(0, 4)}•• ••• ${national.slice(-3)}`;
  }
  return formatKenyanPhoneDisplay(phone);
}

function maskNationalId(nid: string | undefined): string | null {
  if (!nid) return null;
  const digits = nid.replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(-4)}`;
}

export function mapResourceToSummary(
  resource: OnboardingApplicationResource,
): OnboardingApplicationSummary {
  const customer = resource.customer;
  const financing = resource.financing;
  const bike = resource.bikeAssignment;

  return {
    id: resource.id,
    referenceCode: resource.referenceCode,
    lifecycleState: resource.lifecycleState,
    customerDisplayName: customer?.legalName ?? null,
    phoneMasked: maskPhone(customer?.phone),
    operatingModel: resource.operatingModel?.type ?? null,
    productLabel: financing?.productLabel ?? null,
    depositKes: financing?.depositKes ?? null,
    dailyAmountKes: financing?.dailyAmountKes ?? null,
    bikeRegistration: bike?.registration ?? null,
    flag: resource.operations.flag ?? null,
    updatedAt: resource.timestamps.updatedAt,
    officerDisplayName: resource.assignment.officerDisplayName,
    dealershipName: resource.assignment.dealershipName,
    termMonths: financing?.termMonths ?? null,
    lmsId: resource.operations.lmsId ?? null,
    financedAmountKes: financing?.financedAmountKes ?? null,
    nationalIdMasked: maskNationalId(customer?.nationalId),
  };
}
