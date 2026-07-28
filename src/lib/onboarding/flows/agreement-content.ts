export const AGREEMENT_SECTIONS: [string, string][] = [
  [
    "1 · Parties",
    "This Loan Agreement is entered into between Jiwambe Limited (the \"Lender\") and the customer named in the schedule (the \"Borrower\"), identified by the National ID number on record.",
  ],
  [
    "2 · The facility",
    "The Lender agrees to finance the asset described in the schedule. Ownership of the asset remains with the Lender until the final installment is received in full.",
  ],
  [
    "3 · Repayment",
    "The Borrower shall repay the facility in daily installments of the amount shown in the schedule, payable via M-Pesa to the Lender's designated paybill, for the full financing term.",
  ],
  [
    "4 · Deposit",
    "The deposit shown in the schedule has been received and verified prior to signing. Deposits are non-refundable except as provided under clause 9.",
  ],
  [
    "5 · Guarantors",
    "The guarantors named in the schedule jointly and severally guarantee the Borrower's obligations and have confirmed their consent by telephone prior to signing.",
  ],
  [
    "6 · Insurance",
    "The asset is insured by the Lender for the duration of the facility. The Borrower shall report any incident affecting the asset within 24 hours.",
  ],
  [
    "7 · Default",
    "Failure to pay any installment within the grace period constitutes default. On default, the Lender may repossess the asset in accordance with applicable law.",
  ],
  [
    "8 · Asset care",
    "The Borrower shall maintain the asset in good working order, use only authorised battery-swap and service points, and shall not transfer, sell, or encumber the asset.",
  ],
  [
    "9 · Termination",
    "Either party may terminate in accordance with the schedule of this agreement. Early settlement discounts apply as published by the Lender from time to time.",
  ],
  [
    "10 · Governing law",
    "This agreement is governed by the laws of Kenya. Disputes shall first be referred to mediation before any court proceedings.",
  ],
];

export const EXPLAINER_QA = [
  {
    q: "What happens if I miss a day?",
    a: "Clause 7 (Default): missing an installment past the grace period is default, and the Lender may repossess the bike as the law allows.",
  },
  {
    q: "Can I pay off early?",
    a: "Clause 9 (Termination): yes — early settlement is allowed, with discounts as published by the Lender at the time.",
  },
  {
    q: "Who owns the bike?",
    a: "Clause 2 (The facility): the Lender owns the bike until your final installment is received in full — then ownership transfers to you.",
  },
] as const;
