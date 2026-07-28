export const PORTAL_CUSTOMERS = [
  {
    name: "Grace Wanjiku",
    phone: "0712 334 556",
    idNo: "2845 9912",
    county: "Nairobi",
  },
  {
    name: "Brian Otieno",
    phone: "0798 112 003",
    idNo: "3011 4402",
    county: "Kiambu",
  },
];

export const CATALOG_PRODUCTS = [
  { id: "spiro-tv", label: "Spiro TVS", priceNew: 265000, priceUsed: 178000 },
  { id: "tankvolt-x", label: "TankVolt X1", priceNew: 248000, priceUsed: 165000 },
  { id: "kofa-r", label: "Kofa R2", priceNew: 282000, priceUsed: 190000 },
];

/** Field minimum deposit by operating model — display only (prototype `data.js`). */
export const MIN_DEPOSIT_KES = {
  FLEET: 5000,
  STAGE: 10000,
  DELIVERY: 10000,
  PERSONAL: 30000,
} as const;

export const MIN_DEPOSIT_BY_OPERATING_MODEL: {
  label: string;
  key: keyof typeof MIN_DEPOSIT_KES;
}[] = [
  { label: "Fleet (Bolt)", key: "FLEET" },
  { label: "Stage", key: "STAGE" },
  { label: "Delivery", key: "DELIVERY" },
  { label: "Personal Use", key: "PERSONAL" },
];

export const INVENTORY_BIKES = [
  {
    reg: "KMFG 412K",
    model: "TankVolt X1",
    color: "Matte black",
    status: "available",
  },
  {
    reg: "KMEA 887B",
    model: "Spiro TVS",
    color: "Pine green",
    status: "available",
  },
  {
    reg: "KMDX 733J",
    model: "Kofa R2",
    color: "Grey",
    status: "available",
  },
];

/** Pre-seeded quote rows — display only, not computed on the client. */
export const QUOTE_TABLE: Record<
  string,
  { deposit: number; dailyKes: number; minDeposit: number }
> = {
  "spiro-tv:10000": { deposit: 10000, dailyKes: 540, minDeposit: 5000 },
  "spiro-tv:15000": { deposit: 15000, dailyKes: 510, minDeposit: 5000 },
  "tankvolt-x:10000": { deposit: 10000, dailyKes: 520, minDeposit: 10000 },
  "tankvolt-x:15000": { deposit: 15000, dailyKes: 490, minDeposit: 10000 },
  "kofa-r:14000": { deposit: 14000, dailyKes: 560, minDeposit: 10000 },
};

export function lookupQuote(
  productId: string,
  deposit: number,
): { dailyKes: number; minDeposit: number } | null {
  const key = `${productId}:${deposit}`;
  const row = QUOTE_TABLE[key];
  if (row) return { dailyKes: row.dailyKes, minDeposit: row.minDeposit };
  const fallbackKey = Object.keys(QUOTE_TABLE).find((k) =>
    k.startsWith(`${productId}:`),
  );
  if (!fallbackKey) return null;
  const fallback = QUOTE_TABLE[fallbackKey];
  return { dailyKes: fallback.dailyKes, minDeposit: fallback.minDeposit };
}
