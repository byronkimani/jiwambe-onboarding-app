export type OnboardingNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const SEED_NOTIFICATIONS: OnboardingNotification[] = [
  {
    id: "n1",
    title: "Ops approved A-1042",
    body: "Loan agreement is ready for customer signature.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Sync complete",
    body: "3 queued capture photos uploaded.",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: "n3",
    title: "Reference call logged",
    body: "Ops noted a successful reference for A-1038.",
    time: "Yesterday",
    unread: false,
  },
];
