/* Seed data, constants, Kenya counties */
const STAGES = [{
  k: "readiness",
  n: 1,
  label: "Readiness check"
}, {
  k: "lookup",
  n: 2,
  label: "Customer lookup"
}, {
  k: "identity",
  n: 3,
  label: "Identity & contact"
}, {
  k: "dl",
  n: 4,
  label: "Driving licence"
}, {
  k: "cogc",
  n: 5,
  label: "Good conduct"
}, {
  k: "references",
  n: 6,
  label: "References"
}, {
  k: "model",
  n: 7,
  label: "Operating model"
}, {
  k: "product",
  n: 8,
  label: "Product, financing & deposit"
}, {
  k: "bike",
  n: 9,
  label: "Bike assignment"
}, {
  k: "review",
  n: 10,
  label: "Review & submit"
}];
const READINESS_ITEMS = [{
  k: "hasId",
  label: "Customer has their original National ID with them right now."
}, {
  k: "knowsKra",
  label: "Customer knows their KRA PIN and can produce the KRA PIN certificate."
}, {
  k: "dlKnown",
  label: "The driving licence situation is known: valid DL, PDL, expired / under processing, or none."
}, {
  k: "cogcKnown",
  label: "The Certificate of Good Conduct situation is known: has certificate, fingerprints taken and pending, or not started."
}, {
  k: "hasFunds",
  label: "Deposit funds are available on M-Pesa today and meet the minimum for the operating model — read it from the table below, never quote from memory."
}, {
  k: "refsBriefed",
  label: "The customer has already spoken to their three references, so a call from Jiwambe will not be a surprise, and all three are reachable by phone during this session."
}];
const PRODUCTS = [{
  id: "spiro-tv",
  label: "Spiro TVS",
  priceNew: 265000,
  priceUsed: 178000
}, {
  id: "tankvolt-x",
  label: "TankVolt X1",
  priceNew: 248000,
  priceUsed: 165000
}, {
  id: "kofa-r",
  label: "Kofa R2",
  priceNew: 282000,
  priceUsed: 190000
}];
const assetPrice = (product, type) => product ? type === "used" ? product.priceUsed : product.priceNew : 0;

// Per-model minimum deposit (field doc 2026-07). Officer may override lower with a reason.
const MIN_DEPOSIT = {
  FLEET: 5000,
  STAGE: 10000,
  DELIVERY: 10000,
  PERSONAL: 30000
};
const DEPOSIT_MAX = 50000;
const DEPOSIT_STEP = 500;
const minDeposit = opModel => MIN_DEPOSIT[opModel] || 5000;

// Higher deposit → smaller financed balance → lower daily installment.
const calcDaily = (price, deposit, term) => {
  const financed = Math.max(price - deposit, 0);
  const factor = term === "18" ? 1.34 : 1.44; // finance charge over the term
  const payDays = Number(term) * 26; // ~26 paying days / month
  return Math.ceil(financed * factor / payDays / 10) * 10;
};
const emptyRef = () => ({
  name: "",
  id: "",
  phone: "",
  relationship: "",
  called: false
});
const NEXT_OF_KIN_RELATIONSHIPS = [{
  value: "spouse",
  label: "Spouse"
}, {
  value: "parent",
  label: "Parent"
}, {
  value: "sibling",
  label: "Sibling"
}, {
  value: "child",
  label: "Adult child"
}, {
  value: "relative",
  label: "Other close relative"
}];
const REF_RELATIONSHIPS = [{
  value: "friend",
  label: "Friend"
}, {
  value: "relative",
  label: "Relative"
}, {
  value: "colleague",
  label: "Colleague / fellow rider"
}, {
  value: "employer",
  label: "Employer / supervisor"
}, {
  value: "business",
  label: "Business associate"
}, {
  value: "client",
  label: "Regular client"
}, {
  value: "chama",
  label: "Chama / group member"
}, {
  value: "chairperson",
  label: "Stage chairperson"
}];
const emptyForm = () => ({
  readiness: {},
  customerFound: null,
  // null | 'portal' | 'new'
  // identity & contact
  name: "",
  phone: "",
  altPhone: "",
  idNo: "",
  kraPin: "",
  gender: "M",
  dob: "",
  county: "",
  subCounty: "",
  area: "",
  landmark: "",
  email: "",
  photo: null,
  // driving licence
  dlSituation: "",
  // smart | pdl | processing | none
  dlNumber: "",
  needsSponsorship: "",
  school: "",
  // certificate of good conduct
  cogcSituation: "",
  // have | fingerprints | peleza | none
  // references (×3; slot 1 is next of kin)
  references: [emptyRef(), emptyRef(), emptyRef()],
  refConsent: false,
  // operating model
  opModel: "",
  // FLEET | STAGE | DELIVERY | PERSONAL
  boltActive: "",
  stageName: "",
  chairName: "",
  chairPhone: "",
  chairCalled: false,
  chairOutcome: "",
  // confirmed | unreachable | denied
  worksPlatform: "",
  platformName: "",
  platformContact: "",
  isEmployed: "",
  employerName: "",
  employerContact: "",
  verifyConsent: false,
  // product, financing & deposit
  assetType: "new",
  productId: "",
  term: "18",
  deposit: null,
  payPhone: "",
  stkState: "idle",
  stkCheckoutId: "",
  stkRef: "",
  stkVerified: false,
  fallbackCode: "",
  // bike
  bikeReg: null,
  // captured documents (images, keyed by slot)
  docs: {}
});

// ————— Kenya administrative data: 47 counties → sub-counties —————
const KENYA_COUNTIES = {
  "Baringo": ["Baringo Central", "Baringo North", "Baringo South", "Eldama Ravine", "Mogotio", "Tiaty"],
  "Bomet": ["Bomet Central", "Bomet East", "Chepalungu", "Konoin", "Sotik"],
  "Bungoma": ["Bumula", "Kabuchai", "Kanduyi", "Kimilili", "Mt Elgon", "Sirisia", "Tongaren", "Webuye East", "Webuye West"],
  "Busia": ["Budalangi", "Butula", "Funyula", "Matayos", "Nambale", "Teso North", "Teso South"],
  "Elgeyo-Marakwet": ["Keiyo North", "Keiyo South", "Marakwet East", "Marakwet West"],
  "Embu": ["Manyatta", "Mbeere North", "Mbeere South", "Runyenjes"],
  "Garissa": ["Balambala", "Dadaab", "Fafi", "Garissa Township", "Hulugho", "Ijara", "Lagdera"],
  "Homa Bay": ["Homa Bay Town", "Kabondo Kasipul", "Karachuonyo", "Kasipul", "Mbita", "Ndhiwa", "Rangwe", "Suba"],
  "Isiolo": ["Isiolo North", "Isiolo South"],
  "Kajiado": ["Kajiado Central", "Kajiado East", "Kajiado North", "Kajiado South", "Kajiado West"],
  "Kakamega": ["Butere", "Ikolomani", "Khwisero", "Likuyani", "Lugari", "Lurambi", "Malava", "Matungu", "Mumias East", "Mumias West", "Navakholo", "Shinyalu"],
  "Kericho": ["Ainamoi", "Belgut", "Bureti", "Kipkelion East", "Kipkelion West", "Sigowet-Soin"],
  "Kiambu": ["Gatundu North", "Gatundu South", "Githunguri", "Juja", "Kabete", "Kiambaa", "Kiambu Town", "Kikuyu", "Lari", "Limuru", "Ruiru", "Thika Town"],
  "Kilifi": ["Ganze", "Kaloleni", "Kilifi North", "Kilifi South", "Magarini", "Malindi", "Rabai"],
  "Kirinyaga": ["Gichugu", "Kirinyaga Central", "Mwea", "Ndia"],
  "Kisii": ["Bobasi", "Bomachoge Borabu", "Bomachoge Chache", "Bonchari", "Kitutu Chache North", "Kitutu Chache South", "Nyaribari Chache", "Nyaribari Masaba", "South Mugirango"],
  "Kisumu": ["Kisumu Central", "Kisumu East", "Kisumu West", "Muhoroni", "Nyakach", "Nyando", "Seme"],
  "Kitui": ["Kitui Central", "Kitui East", "Kitui Rural", "Kitui South", "Kitui West", "Mwingi Central", "Mwingi North", "Mwingi West"],
  "Kwale": ["Kinango", "Lunga Lunga", "Matuga", "Msambweni"],
  "Laikipia": ["Laikipia East", "Laikipia North", "Laikipia West"],
  "Lamu": ["Lamu East", "Lamu West"],
  "Machakos": ["Kangundo", "Kathiani", "Machakos Town", "Masinga", "Matungulu", "Mavoko", "Mwala", "Yatta"],
  "Makueni": ["Kaiti", "Kibwezi East", "Kibwezi West", "Kilome", "Makueni", "Mbooni"],
  "Mandera": ["Banissa", "Lafey", "Mandera East", "Mandera North", "Mandera South", "Mandera West"],
  "Marsabit": ["Laisamis", "Moyale", "North Horr", "Saku"],
  "Meru": ["Buuri", "Central Imenti", "Igembe Central", "Igembe North", "Igembe South", "North Imenti", "South Imenti", "Tigania East", "Tigania West"],
  "Migori": ["Awendo", "Kuria East", "Kuria West", "Nyatike", "Rongo", "Suna East", "Suna West", "Uriri"],
  "Mombasa": ["Changamwe", "Jomvu", "Kisauni", "Likoni", "Mvita", "Nyali"],
  "Murang'a": ["Gatanga", "Kandara", "Kangema", "Kigumo", "Kiharu", "Maragwa", "Mathioya"],
  "Nairobi": ["Dagoretti North", "Dagoretti South", "Embakasi Central", "Embakasi East", "Embakasi North", "Embakasi South", "Embakasi West", "Kamukunji", "Kasarani", "Kibra", "Lang'ata", "Makadara", "Mathare", "Roysambu", "Ruaraka", "Starehe", "Westlands"],
  "Nakuru": ["Bahati", "Gilgil", "Kuresoi North", "Kuresoi South", "Molo", "Naivasha", "Nakuru Town East", "Nakuru Town West", "Njoro", "Rongai", "Subukia"],
  "Nandi": ["Aldai", "Chesumei", "Emgwen", "Mosop", "Nandi Hills", "Tinderet"],
  "Narok": ["Emurua Dikirr", "Kilgoris", "Narok East", "Narok North", "Narok South", "Narok West"],
  "Nyamira": ["Borabu", "Kitutu Masaba", "North Mugirango", "West Mugirango"],
  "Nyandarua": ["Kinangop", "Kipipiri", "Ndaragwa", "Ol Kalou", "Ol Jorok"],
  "Nyeri": ["Kieni", "Mathira", "Mukurweini", "Nyeri Town", "Othaya", "Tetu"],
  "Samburu": ["Samburu East", "Samburu North", "Samburu West"],
  "Siaya": ["Alego Usonga", "Bondo", "Gem", "Rarieda", "Ugenya", "Ugunja"],
  "Taita-Taveta": ["Mwatate", "Taveta", "Voi", "Wundanyi"],
  "Tana River": ["Bura", "Galole", "Garsen"],
  "Tharaka-Nithi": ["Chuka/Igambang'ombe", "Maara", "Tharaka"],
  "Trans Nzoia": ["Cherangany", "Endebess", "Kiminini", "Kwanza", "Saboti"],
  "Turkana": ["Loima", "Turkana Central", "Turkana East", "Turkana North", "Turkana South", "Turkana West"],
  "Uasin Gishu": ["Ainabkoi", "Kapseret", "Kesses", "Moiben", "Soy", "Turbo"],
  "Vihiga": ["Emuhaya", "Hamisi", "Luanda", "Sabatia", "Vihiga"],
  "Wajir": ["Eldas", "Tarbaj", "Wajir East", "Wajir North", "Wajir South", "Wajir West"],
  "West Pokot": ["Kacheliba", "Kapenguria", "Pokot South", "Sigor"]
};
const KENYA_COUNTY_NAMES = Object.keys(KENYA_COUNTIES).sort();
const HOLD_SECONDS = 2 * 60 * 60; // soft lock while the officer finishes the application
const mmss = s => {
  const h = Math.floor(s / 3600),
    m = Math.floor(s % 3600 / 60),
    sec = s % 60;
  return h > 0 ? h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") : m + ":" + String(sec).padStart(2, "0");
};
const LIFECYCLE = ["DRAFT", "CAPTURED", "OPS_REVIEW", "LMS_CREATED", "AGREEMENT_SIGNED", "READY_FOR_RELEASE", "RELEASED", "ACTIVE_LOAN"];
const STATE_META = {
  PAUSED: {
    label: "Paused — bike released to stock",
    tone: "wait",
    action: "resume"
  },
  DISQUALIFIED: {
    label: "Disqualified",
    tone: "done",
    action: "summary"
  },
  OPS_REVIEW: {
    label: "Awaiting ops review",
    tone: "wait",
    action: null
  },
  LMS_CREATED: {
    label: "Returned to you — generate agreement",
    tone: "act",
    action: "agreement"
  },
  AGREEMENT_SIGNED: {
    label: "Signed — preparing release",
    tone: "wait",
    action: null
  },
  READY_FOR_RELEASE: {
    label: "Ready for bike release",
    tone: "act",
    action: "release"
  },
  ACTIVE_LOAN: {
    label: "Active loan — fully onboarded",
    tone: "done",
    action: "summary"
  }
};
const seedApps = [{
  id: "A-1042",
  nid: "2984 1170",
  opModel: "FLEET",
  principal: 265000,
  flag: null,
  submittedAt: "2026-07-08 07:40",
  officer: "Jane Ochieng",
  officerRole: "Field Officer · FO-12",
  station: "Ruiru Hub",
  name: "James Mwangi Kariuki",
  phone: "0722 118 456",
  state: "LMS_CREATED",
  lmsId: "LMS-88231",
  product: "Spiro TVS (new)",
  term: "24 months",
  deposit: 12000,
  daily: 510,
  bike: {
    reg: "KMEB 220A",
    model: "Spiro TVS",
    color: "Pine green",
    sticker: "INS-2214090",
    stickerExpiry: "2027-05-25"
  },
  opsNote: "Approved. Insurance certificate verified.",
  since: "Returned 1h ago"
}, {
  id: "A-1038",
  nid: "3312 0985",
  opModel: "DELIVERY",
  principal: 248000,
  flag: null,
  submittedAt: "2026-07-07 11:15",
  officer: "Jane Ochieng",
  officerRole: "Field Officer · FO-12",
  station: "Ruiru Hub",
  name: "Susan Wambui Njeri",
  phone: "0733 220 981",
  state: "READY_FOR_RELEASE",
  lmsId: "LMS-88190",
  product: "TankVolt X1 (new)",
  term: "18 months",
  deposit: 15000,
  daily: 590,
  bike: {
    reg: "KMEC 664F",
    model: "TankVolt X1",
    color: "Matte black",
    sticker: "INS-2209981",
    stickerExpiry: "2027-02-20"
  },
  opsNote: "Bike assigned and insured. OEM activation complete.",
  since: "Ready since yesterday"
}, {
  id: "A-1044",
  nid: "3102 8841",
  opModel: "STAGE",
  principal: 282000,
  flag: "COGC pending",
  submittedAt: "2026-07-08 09:20",
  officer: "Jane Ochieng",
  officerRole: "Field Officer · FO-12",
  station: "Ruiru Hub",
  name: "Peter Otieno Ouma",
  phone: "0710 884 552",
  state: "OPS_REVIEW",
  lmsId: null,
  product: "Kofa R2 (new)",
  term: "24 months",
  deposit: 14000,
  daily: 540,
  bike: {
    reg: "KMDH 518E",
    model: "Kofa R2",
    color: "Grey",
    sticker: "INS-2213050",
    stickerExpiry: "2027-04-02"
  },
  opsNote: null,
  since: "Submitted 3h ago"
}, {
  id: "A-1029",
  nid: "2871 4402",
  opModel: "PERSONAL",
  principal: 265000,
  flag: null,
  submittedAt: "2026-06-09 14:05",
  officer: "Jane Ochieng",
  officerRole: "Field Officer · FO-12",
  station: "Ruiru Hub",
  name: "Mercy Chebet",
  phone: "0791 660 214",
  state: "ACTIVE_LOAN",
  lmsId: "LMS-88102",
  product: "Spiro TVS (new)",
  term: "24 months",
  deposit: 12000,
  daily: 510,
  bike: {
    reg: "KMEA 341H",
    model: "Spiro TVS",
    color: "Pine green",
    sticker: "INS-2188420",
    stickerExpiry: "2026-11-08"
  },
  opsNote: null,
  since: "Released 12 Jun",
  releasedOn: "12 Jun 2026"
}];

// ————— bike inventory (fed by the inventory module — read-only here) —————

const daysTo = dateStr => Math.round((new Date(dateStr) - new Date()) / 86400000);

// 1-year cover is purchased at stock receipt and priced into the loan,
// so days of cover consumed ≈ days the bike has sat in stock.
const OFFICER_DEALERSHIP = "Ruiru Hub";
const OFFICER_NAME = "Jane Ochieng";
const OFFICER_ROLE = "Field Officer · FO-12";
const seedInventory = [{
  reg: "KMFG 412K",
  model: "TankVolt X1",
  color: "Matte black",
  status: "available",
  sticker: "INS-2214087",
  receivedAt: "2026-06-19",
  stickerExpiry: "2027-06-19",
  dealership: "Ruiru Hub"
}, {
  reg: "KMEA 887B",
  model: "Spiro TVS",
  color: "Pine green",
  status: "available",
  sticker: "INS-2214112",
  receivedAt: "2026-06-02",
  stickerExpiry: "2027-06-02",
  dealership: "Ruiru Hub"
}, {
  reg: "KMFC 105D",
  model: "Spiro TVS",
  color: "White",
  status: "available",
  sticker: "INS-2198441",
  receivedAt: "2025-09-10",
  stickerExpiry: "2026-09-10",
  dealership: "Ruiru Hub"
}, {
  reg: "KMDX 733J",
  model: "Kofa R2",
  color: "Grey",
  status: "available",
  sticker: null,
  receivedAt: "2026-07-01",
  stickerExpiry: null,
  dealership: "Ruiru Hub"
}, {
  reg: "KMEB 220A",
  model: "Spiro TVS",
  color: "Pine green",
  status: "reserved",
  sticker: "INS-2214090",
  receivedAt: "2026-05-25",
  stickerExpiry: "2027-05-25",
  dealership: "Ruiru Hub"
}, {
  reg: "KMFA 951C",
  model: "TankVolt X1",
  color: "Red",
  status: "available",
  sticker: "INS-2201133",
  receivedAt: "2025-12-02",
  stickerExpiry: "2026-12-02",
  dealership: "Thika CBD"
}];
