"use client";

import { bffFetch } from "@/lib/global/client/bff-fetch";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppRoutes } from "@/lib/global/shared/routes";
import type { OfficerProfile } from "@/lib/onboarding/types";
import {
  SEED_NOTIFICATIONS,
  type OnboardingNotification,
} from "@/lib/onboarding/fixtures/notifications";

type OnboardingChromeContextValue = {
  online: boolean;
  setOnline: (value: boolean) => void;
  queue: string[];
  officer: OfficerProfile;
  unread: number;
  notifications: OnboardingNotification[];
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  syncing: boolean;
};

const OnboardingChromeContext =
  createContext<OnboardingChromeContextValue | null>(null);

function mapApiProfileToOfficer(profile: {
  id: string;
  name: string;
  role: string;
  dealership: string;
  phone: string;
  email: string;
  registeredPhone: string;
  nationalIdMask: string;
  deviceLabel: string;
  lastSignIn: string;
}): OfficerProfile {
  return {
    id: profile.id,
    name: profile.name,
    role: profile.role,
    dealership: profile.dealership,
    phone: profile.phone,
    email: profile.email,
    registeredPhone: profile.registeredPhone,
    nationalIdMask: profile.nationalIdMask,
    deviceLabel: profile.deviceLabel,
    lastSignIn: profile.lastSignIn,
  };
}

export function OnboardingChromeProvider({
  officer: initialOfficer,
  children,
}: {
  officer: OfficerProfile;
  children: React.ReactNode;
}) {
  const [online, setOnline] = useState(true);
  const [queue] = useState<string[]>([]);
  const [officer, setOfficer] = useState(initialOfficer);
  const [notifications, setNotifications] =
    useState<OnboardingNotification[]>(SEED_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await bffFetch(AppRoutes.apiOnboardingAgentsProfile, {
          credentials: "same-origin",
        });
        if (!response.ok || cancelled) return;
        const body = (await response.json()) as { profile?: OfficerProfile };
        if (body.profile) {
          setOfficer(mapApiProfileToOfficer(body.profile));
        }
      } catch {
        // Keep seed/session merge when profile API is unavailable.
      }
    }

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const syncing = online && queue.length > 0;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  }, []);

  const unread = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      online,
      setOnline,
      queue,
      officer,
      unread,
      notifications,
      notifOpen,
      setNotifOpen,
      profileOpen,
      setProfileOpen,
      markNotificationRead,
      syncing,
    }),
    [
      online,
      queue,
      officer,
      unread,
      notifications,
      notifOpen,
      profileOpen,
      markNotificationRead,
      syncing,
    ],
  );

  return (
    <OnboardingChromeContext.Provider value={value}>
      {children}
    </OnboardingChromeContext.Provider>
  );
}

export function useOnboardingChrome(): OnboardingChromeContextValue {
  const ctx = useContext(OnboardingChromeContext);
  if (!ctx) {
    throw new Error("useOnboardingChrome must be used within provider");
  }
  return ctx;
}

export function useOnboardingChromeOptional():
  | OnboardingChromeContextValue
  | null {
  return useContext(OnboardingChromeContext);
}
