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

/** Field minimum deposit by operating model — BFF `catalog/pricing-rules` only; not for client import. */
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
