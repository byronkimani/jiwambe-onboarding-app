"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
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

export function OnboardingChromeProvider({
  officer,
  children,
}: {
  officer: OfficerProfile;
  children: React.ReactNode;
}) {
  const [online, setOnline] = useState(true);
  const [queue] = useState<string[]>([]);
  const [notifications, setNotifications] =
    useState<OnboardingNotification[]>(SEED_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
