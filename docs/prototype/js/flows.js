const AGREEMENT_SECTIONS = [["1 · Parties", "This Loan Agreement is entered into between Jiwambe Limited (the \"Lender\") and the customer named in the schedule (the \"Borrower\"), identified by the National ID number on record."], ["2 · The facility", "The Lender agrees to finance the asset described in the schedule. Ownership of the asset remains with the Lender until the final installment is received in full."], ["3 · Repayment", "The Borrower shall repay the facility in daily installments of the amount shown in the schedule, payable via M-Pesa to the Lender's designated paybill, for the full financing term."], ["4 · Deposit", "The deposit shown in the schedule has been received and verified prior to signing. Deposits are non-refundable except as provided under clause 9."], ["5 · Guarantors", "The guarantors named in the schedule jointly and severally guarantee the Borrower's obligations and have confirmed their consent by telephone prior to signing."], ["6 · Insurance", "The asset is insured by the Lender for the duration of the facility. The Borrower shall report any incident affecting the asset within 24 hours."], ["7 · Default", "Failure to pay any installment within the grace period constitutes default. On default, the Lender may repossess the asset in accordance with applicable law."], ["8 · Asset care", "The Borrower shall maintain the asset in good working order, use only authorised battery-swap and service points, and shall not transfer, sell, or encumber the asset."], ["9 · Termination", "Either party may terminate in accordance with the schedule of this agreement. Early settlement discounts apply as published by the Lender from time to time."], ["10 · Governing law", "This agreement is governed by the laws of Kenya. Disputes shall first be referred to mediation before any court proceedings."]];
function AgreementViewer({
  app,
  onReadToEnd,
  readDone
}) {
  const boxRef = React.useRef(null);
  const [pct, setPct] = useState(0);
  const onScroll = () => {
    const el = boxRef.current;
    if (!el) return;
    const p = Math.min(100, Math.round((el.scrollTop + el.clientHeight) / el.scrollHeight * 100));
    setPct(p);
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) onReadToEnd();
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    onScroll: onScroll,
    style: {
      height: 220,
      overflowY: "auto",
      background: "#fff",
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: "18px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 17,
      color: T.ink,
      marginBottom: 4
    }
  }, "Asset Financing Agreement"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontFamily: MONO,
      color: T.inkFaint,
      marginBottom: 14
    }
  }, app.lmsId, " · ", app.name, " · ", app.product, " · ", app.term, " · ", fmtKES(app.daily), "/day", app.bike ? " · " + app.bike.reg : ""), AGREEMENT_SECTIONS.map(([h, body]) => /*#__PURE__*/React.createElement("div", {
    key: h,
    style: {
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: T.ink
    }
  }, h), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      lineHeight: 1.6,
      marginTop: 3
    }
  }, body))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: T.inkFaint,
      borderTop: `1px solid ${T.line}`,
      paddingTop: 12,
      marginTop: 4
    }
  }, "— End of agreement. Signature fields follow on the executed PDF. —")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 5,
      background: T.line,
      borderRadius: 99,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + "%",
      height: "100%",
      background: readDone ? T.accent : T.amber,
      borderRadius: 99,
      transition: "width .2s"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: readDone ? T.accentDeep : T.amber,
      whiteSpace: "nowrap"
    }
  }, readDone ? "✓ Reviewed to the end" : "Scroll to the end to enable signing")), /*#__PURE__*/React.createElement(AgreementExplainer, null));
}
const EXPLAINER_QA = [{
  q: "What happens if I miss a day?",
  a: "Clause 7 (Default): missing an installment past the grace period is default, and the Lender may repossess the bike as the law allows. One late day inside the grace period is not automatic repossession.",
  sw: "Kifungu cha 7: ukikosa malipo baada ya muda wa neema, mkopo unaingia hali ya kushindwa kulipa na pikipiki inaweza kurejeshwa kisheria."
}, {
  q: "Can I pay off early?",
  a: "Clause 9 (Termination): yes — early settlement is allowed, with discounts as published by the Lender at the time.",
  sw: "Kifungu cha 9: ndiyo — unaweza kumaliza mapema, na punguzo hutolewa kulingana na viwango vya wakati huo."
}, {
  q: "Who owns the bike?",
  a: "Clause 2 (The facility): the Lender owns the bike until your final installment is received in full — then ownership transfers to you.",
  sw: "Kifungu cha 2: Mkopeshaji ndiye mmiliki wa pikipiki hadi malipo yote yakamilike — kisha umiliki unahamia kwako."
}];
function AgreementExplainer() {
  const [openQ, setOpenQ] = useState(null);
  const [lang, setLang] = useState("en");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: T.blueBg,
      borderRadius: 14,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: T.ink
    }
  }, "Customer questions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: "#fff",
      borderRadius: 8,
      padding: 2
    }
  }, ["en", "sw"].map(l => /*#__PURE__*/React.createElement("button", {
    key: l,
    className: "jw-tap",
    onClick: () => setLang(l),
    style: {
      border: "none",
      borderRadius: 7,
      padding: "4px 10px",
      fontSize: 11,
      fontWeight: 800,
      cursor: "pointer",
      fontFamily: BODY,
      background: lang === l ? T.blue : "transparent",
      color: lang === l ? "#fff" : T.inkSoft
    }
  }, l.toUpperCase()))), /*#__PURE__*/React.createElement(AiChip, null, "Simulated · extractive"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap"
    }
  }, EXPLAINER_QA.map((qa, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "jw-tap",
    onClick: () => setOpenQ(openQ === i ? null : i),
    style: {
      border: `1.5px solid ${openQ === i ? T.blue : "transparent"}`,
      background: "#fff",
      borderRadius: 999,
      padding: "7px 13px",
      fontSize: 12,
      fontWeight: 700,
      color: T.ink,
      cursor: "pointer",
      fontFamily: BODY
    }
  }, qa.q))), openQ != null && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 10,
      background: "#fff",
      borderRadius: 10,
      padding: "11px 13px",
      fontSize: 12.5,
      color: T.inkSoft,
      lineHeight: 1.6
    }
  }, lang === "en" ? EXPLAINER_QA[openQ].a : EXPLAINER_QA[openQ].sw, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.inkFaint,
      marginTop: 7
    }
  }, "Answers only quote the agreement — they never interpret or advise beyond it.")));
}
function AgreementFlow({
  app,
  onDone,
  onBack,
  onPause,
  onDisqualify
}) {
  // step: summary → generating → generated → signed → sending → sent
  const [step, setStep] = useState("summary");
  const [readDone, setReadDone] = useState(false);
  const [signingRole, setSigningRole] = useState(null); // null | 'client' | 'officer'
  const [clientPng, setClientPng] = useState(null);
  const [officerPng, setOfficerPng] = useState(null);
  const [smsOpened, setSmsOpened] = useState(false);
  const generate = () => {
    setStep("generating");
    setTimeout(() => setStep("generated"), 1400);
  };
  const acceptClient = png => {
    setClientPng(png);
    setSigningRole("officer");
  };
  const acceptOfficer = png => {
    setOfficerPng(png);
    setSigningRole(null);
    setStep("signed");
  };
  const send = () => {
    setStep("sending");
    setTimeout(() => setStep("sent"), 1100);
  };
  const Panel = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14
    }
  }, children);
  const generatedOn = ["generated", "signed", "sending", "sent"].includes(step);
  const signedOn = ["signed", "sending", "sent"].includes(step);
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 680,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 25,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 2px"
    }
  }, "Loan agreement — ", app.name), /*#__PURE__*/React.createElement(LifelineStrip, {
    state: smsOpened ? "AGREEMENT_SIGNED" : app.state
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18
    }
  }), /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 10
    }
  }, "From the LMS · ", app.lmsId), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, [["Product", app.product], ["Term", app.term], ["Deposit (verified)", fmtKES(app.deposit)], ["Daily installment", fmtKES(app.daily)], ["Assigned bike", app.bike ? app.bike.reg + " · " + app.bike.color : "—"], ["Insurance sticker", app.bike ? app.bike.sticker : "—"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.inkFaint,
      fontWeight: 700
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: T.ink,
      fontWeight: 700,
      marginTop: 2
    }
  }, v)))), app.opsNote && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 12.5,
      color: T.accentDeep,
      background: T.accentSoft,
      borderRadius: 10,
      padding: "9px 12px",
      fontWeight: 600
    }
  }, "Ops: ", app.opsNote)), /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "1 · Generate agreement"), generatedOn && /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.accentDeep,
      fontWeight: 800,
      fontSize: 12.5
    }
  }, "✓ Done")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 5,
      lineHeight: 1.5
    }
  }, "Populated from the Loan Management System record — figures above are what will appear in the document."), step === "summary" && /*#__PURE__*/React.createElement(Btn, {
    small: true,
    onClick: generate,
    style: {
      marginTop: 12
    }
  }, "Generate agreement PDF"), step === "generating" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      gap: 9,
      color: T.amber,
      fontWeight: 700,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 13,
      height: 13,
      border: `2.5px solid ${T.amber}`,
      borderTopColor: "transparent",
      borderRadius: 99,
      animation: "spin .7s linear infinite"
    }
  }), "Generating from LMS data…")), generatedOn && /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "2 · Customer reviews the agreement"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => window.print(),
    style: {
      padding: "7px 13px",
      fontSize: 12.5
    }
  }, "🖨 Print")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginBottom: 12,
      lineHeight: 1.5
    }
  }, "Hand the tablet to the customer. Signing unlocks only after the full document has been scrolled — the review is logged with the signature."), /*#__PURE__*/React.createElement(AgreementViewer, {
    app: app,
    readDone: readDone,
    onReadToEnd: () => setReadDone(true)
  }))), generatedOn && /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "3 · Dual signature — client, then officer"), signedOn && /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.accentDeep,
      fontWeight: 800,
      fontSize: 12.5
    }
  }, "✓ Both signed")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 5,
      lineHeight: 1.5
    }
  }, "The customer signs first as borrower; the officer countersigns as company representative on the same ceremony."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 14
    }
  }, [["Client — borrower", clientPng, app.name], ["Officer — company rep", officerPng, "Jane Ochieng"]].map(([roleLabel, png, who]) => /*#__PURE__*/React.createElement("div", {
    key: roleLabel,
    style: {
      border: `1.5px solid ${png ? T.accent : T.line}`,
      borderRadius: 12,
      padding: 12,
      background: png ? T.accentSoft : T.cardDeep
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: png ? T.accentDeep : T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.5
    }
  }, roleLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 64,
      marginTop: 8,
      background: "#fff",
      borderRadius: 8,
      border: `1px solid ${T.line}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, png ? /*#__PURE__*/React.createElement("img", {
    src: png,
    alt: roleLabel,
    style: {
      maxWidth: "92%",
      maxHeight: 56,
      objectFit: "contain"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: T.inkFaint
    }
  }, "Awaiting signature")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: T.inkSoft,
      fontWeight: 600,
      marginTop: 6
    }
  }, who)))), !signedOn && !signingRole && !clientPng && /*#__PURE__*/React.createElement(Btn, {
    small: true,
    disabled: !readDone,
    onClick: () => setSigningRole("client"),
    style: {
      marginTop: 14
    }
  }, readDone ? "Client signs first" : "Review the agreement first"), signingRole && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: signingRole === "client" ? T.accentDeep : T.blue,
      marginBottom: 8
    }
  }, signingRole === "client" ? "→ Hand the tablet to " + app.name.split(" ")[0] : "→ Officer countersign — take the tablet back"), /*#__PURE__*/React.createElement(SignaturePad, {
    key: signingRole,
    onDone: signingRole === "client" ? acceptClient : acceptOfficer
  })), signedOn && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 12,
      lineHeight: 1.5
    }
  }, "Each signature is captured once and stamped into its designated fields of this PDF, stored with timestamp, role, session, and document hash — never reused on future documents.")), signedOn && /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "4 · Send copy to customer"), step === "sent" && /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.accentDeep,
      fontWeight: 800,
      fontSize: 12.5
    }
  }, "✓ Sent")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 5,
      lineHeight: 1.5
    }
  }, "A signed, expiring link goes to ", /*#__PURE__*/React.createElement("b", null, app.phone), " via SMS. The first open is logged as the delivery receipt."), step === "signed" && /*#__PURE__*/React.createElement(Btn, {
    small: true,
    onClick: send,
    style: {
      marginTop: 12
    }
  }, "Send SMS link"), step === "sending" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      gap: 9,
      color: T.amber,
      fontWeight: 700,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 13,
      height: 13,
      border: `2.5px solid ${T.amber}`,
      borderTopColor: "transparent",
      borderRadius: 99,
      animation: "spin .7s linear infinite"
    }
  }), "Sending…"), step === "sent" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.blueBg,
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 12.5,
      color: T.blue,
      fontFamily: MONO,
      fontWeight: 600,
      wordBreak: "break-all"
    }
  }, "SMS → ", app.phone, ": \"Your Jiwambe loan agreement: https://pay.jiwambe.com/a/x7Kq9… (expires in 30 days)\""), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: smsOpened ? T.accentDeep : T.inkFaint
    }
  }, smsOpened ? "✓ Delivery receipt — link opened by customer at 14:22" : "Awaiting first open…"), !smsOpened && /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => setSmsOpened(true),
    style: {
      borderStyle: "dashed",
      fontSize: 12
    }
  }, "▶ Demo: customer opens link"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 6,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onBack
  }, "← Worklist"), /*#__PURE__*/React.createElement(Btn, {
    disabled: step !== "sent",
    onClick: onDone,
    style: {
      flex: 1,
      maxWidth: 300
    }
  }, "Mark agreement complete"), onPause && /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onPause,
    style: {
      background: "none",
      border: `1.5px solid ${T.lineStrong}`,
      borderRadius: 11,
      padding: "11px 16px",
      fontSize: 13.5,
      fontWeight: 700,
      color: T.inkSoft,
      cursor: "pointer",
      fontFamily: BODY
    }
  }, "⏸ Pause"), onDisqualify && /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onDisqualify,
    style: {
      background: "none",
      border: "none",
      color: T.red,
      fontSize: 13.5,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: BODY,
      padding: "11px 6px"
    }
  }, "Disqualify")));
}

// ————— bike release flow —————

function StickerSmsBtn({
  app
}) {
  const [state, setState] = useState("idle"); // idle | sending | sent
  const send = () => {
    setState("sending");
    setTimeout(() => setState("sent"), 1000);
  };
  if (state === "sent") return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: T.accentDeep,
      alignSelf: "center"
    }
  }, "✓ Sent to ", app.phone);
  return /*#__PURE__*/React.createElement(Btn, {
    small: true,
    onClick: send,
    disabled: state === "sending"
  }, state === "sending" ? "Sending…" : "Send via SMS");
}
const PDI_ITEMS = [{
  k: "battery",
  label: "Battery present and charged"
}, {
  k: "tyres",
  label: "Tyres inflated and undamaged"
}, {
  k: "lights",
  label: "Lights and indicators working"
}, {
  k: "brakes",
  label: "Brakes functional"
}, {
  k: "frame",
  label: "Frame / body free of damage"
}, {
  k: "mirrors",
  label: "Side mirrors fitted"
}, {
  k: "reflector",
  label: "Reflector and helmet provided"
}];
function Tick({
  on,
  onClick,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      textAlign: "left",
      width: "100%",
      padding: "10px 12px",
      borderRadius: 10,
      cursor: "pointer",
      fontFamily: BODY,
      background: on ? T.accentSoft : T.cardDeep,
      border: `1.5px solid ${on ? T.accent : T.line}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: 4,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      fontWeight: 800,
      border: `2px solid ${on ? T.accent : T.lineStrong}`,
      background: on ? T.accent : "transparent",
      color: "#fff"
    }
  }, on ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: on ? T.accentDeep : T.inkSoft,
      lineHeight: 1.35
    }
  }, label));
}
function ReleaseFlow({
  app,
  onDone,
  onBack,
  onPause,
  onDisqualify,
  onDefect
}) {
  const [pdi, setPdi] = useState({});
  const [conf, setConf] = useState({});
  const [notes, setNotes] = useState("");
  const [defectOpen, setDefectOpen] = useState(false);
  const [defectDesc, setDefectDesc] = useState("");
  const [defectPhoto, setDefectPhoto] = useState(null);
  const [handoverPhoto, setHandoverPhoto] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [released, setReleased] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [fallbackReason, setFallbackReason] = useState("");
  const [overrideRequested, setOverrideRequested] = useState(false);
  const CONFIRM_ITEMS = [{
    k: "assetId",
    label: `Assigned bike ID confirmed — ${app.bike.reg}`
  }, {
    k: "assetMatch",
    label: "Asset details match the Operations record"
  }, {
    k: "clientMatch",
    label: "Client details match the onboarding record"
  }, {
    k: "releaseLog",
    label: "Client signed the asset release log"
  }];
  const pdiDone = PDI_ITEMS.filter(i => pdi[i.k]).length;
  const pdiOk = pdiDone === PDI_ITEMS.length;
  const confDone = CONFIRM_ITEMS.filter(i => conf[i.k]).length;
  const confOk = confDone === CONFIRM_ITEMS.length;
  const otpOk = otp === "482913";
  const ok = pdiOk && confOk && !!handoverPhoto && otpOk;
  const confirm = () => setReleased(true);
  if (released) {
    return /*#__PURE__*/React.createElement("div", {
      className: "fadeUp",
      style: {
        maxWidth: 620,
        margin: "0 auto",
        textAlign: "center",
        padding: "50px 0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 70,
        height: 70,
        margin: "0 auto 18px",
        borderRadius: 22,
        background: T.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30
      }
    }, "🏍️"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: DISPLAY,
        fontSize: 25,
        color: T.ink,
        fontWeight: 400,
        margin: "0 0 8px"
      }
    }, "Bike released — loan active"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.inkSoft,
        fontSize: 14,
        lineHeight: 1.6,
        maxWidth: 420,
        margin: "0 auto 8px"
      }
    }, app.bike.reg, " handed to ", app.name, ". Pre-release inspection passed, receipt confirmed by OTP from their registered SIM — the same number that pays installments — and the handover photo is on file."), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        fontFamily: MONO,
        color: T.accentDeep,
        fontWeight: 600
      }
    }, "State → ACTIVE_LOAN · ", app.lmsId), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      onClick: onDone
    }, "Back to worklist")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 680,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 25,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 2px"
    }
  }, "Bike release — ", app.name), /*#__PURE__*/React.createElement(LifelineStrip, {
    state: app.state
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.rail,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14,
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: T.mint,
      textTransform: "uppercase",
      letterSpacing: 0.8
    }
  }, "Assigned bike"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      fontFamily: MONO,
      marginTop: 6,
      letterSpacing: 1
    }
  }, app.bike.reg), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
      marginTop: 4
    }
  }, app.bike.model, " · ", app.bike.color, app.bike.sticker ? " · sticker " + app.bike.sticker : " · insured & OEM-activated (verified by ops)")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "Pre-release inspection"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      fontFamily: MONO,
      color: pdiOk ? T.accentDeep : T.inkFaint
    }
  }, pdiDone, " / ", PDI_ITEMS.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 5,
      marginBottom: 12,
      lineHeight: 1.55
    }
  }, "Physically check each item on ", app.bike.reg, " before it leaves. This is the condition record — if a rider reports a fault next week, this is what you'll be checked against."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, PDI_ITEMS.map(i => /*#__PURE__*/React.createElement(Tick, {
    key: i.k,
    on: !!pdi[i.k],
    label: i.label,
    onClick: () => setPdi({
      ...pdi,
      [i.k]: !pdi[i.k]
    })
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      marginTop: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => setDefectOpen(!defectOpen),
    style: {
      background: "none",
      border: "none",
      color: T.red,
      fontSize: 12.5,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: BODY,
      padding: 0,
      textDecoration: "underline"
    }
  }, "Something's wrong with this bike — report a defect"), !pdiOk && /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => setPdi(Object.fromEntries(PDI_ITEMS.map(i => [i.k, true]))),
    style: {
      borderStyle: "dashed",
      fontSize: 11.5,
      padding: "7px 11px"
    }
  }, "▶ Demo: pass all checks")), defectOpen && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 12,
      background: T.redBg,
      borderRadius: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13.5,
      color: T.red
    }
  }, "Defect at handover"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 4,
      marginBottom: 10,
      lineHeight: 1.5
    }
  }, "The bike cannot be released. Describe the fault and photograph it — ", app.bike.reg, " returns to stock for repair and the application pauses until a replacement is assigned."), /*#__PURE__*/React.createElement("textarea", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      minHeight: 60,
      resize: "vertical"
    },
    placeholder: "What's wrong with it? (min 6 chars)…",
    value: defectDesc,
    onChange: e => setDefectDesc(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Photo of the defect",
    image: defectPhoto,
    onCapture: setDefectPhoto,
    onRetake: () => setDefectPhoto(null)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => setDefectOpen(false)
  }, "Cancel"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    danger: true,
    disabled: defectDesc.trim().length < 6,
    onClick: () => onDefect(defectDesc.trim()),
    style: {
      background: T.red,
      color: "#fff"
    }
  }, "Save & request replacement bike")))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "Final asset & client confirmation"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      fontFamily: MONO,
      color: confOk ? T.accentDeep : T.inkFaint
    }
  }, confDone, " / ", CONFIRM_ITEMS.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 12
    }
  }, CONFIRM_ITEMS.map(i => /*#__PURE__*/React.createElement(Tick, {
    key: i.k,
    on: !!conf[i.k],
    label: i.label,
    onClick: () => setConf({
      ...conf,
      [i.k]: !conf[i.k]
    })
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "Handover photo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 5,
      marginBottom: 12,
      lineHeight: 1.55
    }
  }, "Take the photo with the ", /*#__PURE__*/React.createElement("b", null, "borrower standing next to the bike and the number plate clearly visible"), ". This is the visual record that this exact bike went to this exact person — frame it so ", app.bike.reg, " can be read."), /*#__PURE__*/React.createElement(PhotoSlot, {
    label: `Borrower with ${app.bike.reg} — plate visible`,
    required: true,
    image: handoverPhoto,
    onCapture: setHandoverPhoto,
    onRetake: () => setHandoverPhoto(null)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "Receipt confirmation by OTP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 5,
      lineHeight: 1.55
    }
  }, "A one-time code goes to the rider's registered SIM — ", /*#__PURE__*/React.createElement("b", null, app.phone), ". Entering it here is their proof of receipt, independent of the officer."), !otpSent ? /*#__PURE__*/React.createElement(Btn, {
    small: true,
    onClick: () => setOtpSent(true),
    style: {
      marginTop: 14
    }
  }, "Send OTP to rider") : /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.blueBg,
      borderRadius: 10,
      padding: "9px 12px",
      fontSize: 12.5,
      color: T.blue,
      fontFamily: MONO,
      fontWeight: 600,
      marginBottom: 12
    }
  }, "SMS → ", app.phone, ": \"Jiwambe bike receipt code: 482913. Only share with the officer once the bike is in your hands.\""), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      maxWidth: 200,
      letterSpacing: 8,
      textAlign: "center",
      fontFamily: MONO,
      fontSize: 20,
      fontWeight: 700
    },
    inputMode: "numeric",
    maxLength: 6,
    placeholder: "······",
    value: otp,
    onChange: e => setOtp(e.target.value.replace(/\D/g, ""))
  }), /*#__PURE__*/React.createElement(Btn, {
    disabled: !ok,
    onClick: confirm
  }, "Confirm release")), otp.length === 6 && !otpOk && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.red,
      fontWeight: 700,
      marginTop: 8
    }
  }, "Code doesn't match — ask the rider to read it again."), otpOk && !ok && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.amber,
      fontWeight: 700,
      marginTop: 8,
      lineHeight: 1.5
    }
  }, "Code accepted — still outstanding: ", [!pdiOk && "pre-release inspection", !confOk && "final confirmation", !handoverPhoto && "handover photo"].filter(Boolean).join(", "), "."))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 20,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5,
      color: T.ink
    }
  }, "Notes & observations"), /*#__PURE__*/React.createElement(Tag, {
    tone: "info"
  }, "Optional")), /*#__PURE__*/React.createElement("textarea", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      minHeight: 60,
      resize: "vertical"
    },
    placeholder: "Anything worth recording about this handover…",
    value: notes,
    onChange: e => setNotes(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: T.ink
    }
  }, "Insurance details for the rider"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 3,
      fontFamily: MONO
    }
  }, app.bike.sticker || "—", app.bike.stickerExpiry ? " · valid to " + app.bike.stickerExpiry : "")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => window.print()
  }, "🖨 Print"), /*#__PURE__*/React.createElement(StickerSmsBtn, {
    app: app
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: T.cardDeep,
      border: `1px dashed ${T.lineStrong}`,
      borderRadius: 14,
      padding: 16
    }
  }, !fallback ? /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => setFallback(true),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: BODY,
      fontSize: 13,
      color: T.inkSoft,
      fontWeight: 700,
      padding: 0
    }
  }, "Rider's phone dead or unreachable? → Request supervised override") : overrideRequested ? /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      fontSize: 13,
      color: T.amber,
      fontWeight: 700
    }
  }, "⏳ Override request sent to backoffice with your reason. Release stays blocked until a supervisor approves — you'll be notified here.") : /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: T.ink,
      marginBottom: 8
    }
  }, "Supervised override"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginBottom: 10,
      lineHeight: 1.5
    }
  }, "Logged and reviewed by backoffice. Use only when the rider genuinely cannot receive the OTP."), /*#__PURE__*/React.createElement("textarea", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      minHeight: 64,
      resize: "vertical"
    },
    placeholder: "Reason — e.g. phone battery dead, SIM replacement in progress…",
    value: fallbackReason,
    onChange: e => setFallbackReason(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => setFallback(false)
  }, "Cancel"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    disabled: fallbackReason.trim().length < 10,
    onClick: () => setOverrideRequested(true)
  }, "Request override")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onBack
  }, "← Worklist"), onPause && /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onPause,
    style: {
      background: "none",
      border: `1.5px solid ${T.lineStrong}`,
      borderRadius: 11,
      padding: "11px 16px",
      fontSize: 13.5,
      fontWeight: 700,
      color: T.inkSoft,
      cursor: "pointer",
      fontFamily: BODY
    }
  }, "⏸ Pause"), onDisqualify && /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onDisqualify,
    style: {
      background: "none",
      border: "none",
      color: T.red,
      fontSize: 13.5,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: BODY,
      padding: "11px 6px"
    }
  }, "Disqualify")));
}

// ————— application summary (read-only, completed loans) —————

function SummaryFlow({
  app,
  onBack
}) {
  const Section = ({
    title,
    rows
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 18,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 10
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, rows.filter(([, v]) => v).map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.inkFaint,
      fontWeight: 700
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      color: T.ink,
      fontWeight: 700,
      marginTop: 2
    }
  }, v)))));
  const journey = [["Captured in the field", "KYC, documents, deposit verified"], ["Ops review", "Approved and pushed to the LMS"], ["Agreement signed", "Client + officer dual signature · copy delivered by SMS"], ["Bike assigned", app.bike ? `${app.bike.reg} with sticker ${app.bike.sticker}` : "—"], ["Released", "Receipt confirmed by OTP from the registered SIM"]];
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 680,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 25,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 2px"
    }
  }, "Application summary — ", app.name), /*#__PURE__*/React.createElement(LifelineStrip, {
    state: app.state
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18
    }
  }), /*#__PURE__*/React.createElement(Section, {
    title: "Applicant · " + app.id,
    rows: [["Full name", app.name], ["Phone", app.phone], ["LMS record", app.lmsId]]
  }), /*#__PURE__*/React.createElement(Section, {
    title: "Product & financing",
    rows: [["Product", app.product], ["Term", app.term], ["Deposit paid", fmtKES(app.deposit)], ["Daily installment", fmtKES(app.daily)]]
  }), app.bike && /*#__PURE__*/React.createElement(Section, {
    title: "Asset & insurance",
    rows: [["Registration", app.bike.reg], ["Model", app.bike.model + " · " + app.bike.color], ["Insurance sticker", app.bike.sticker], ["Cover valid to", app.bike.stickerExpiry]]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 12
    }
  }, "Journey"), journey.map(([t, d], i) => {
    const last = i === journey.length - 1;
    return /*#__PURE__*/React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 13,
        alignItems: "stretch"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 14,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 12,
        height: 12,
        borderRadius: 99,
        marginTop: 3,
        flexShrink: 0,
        background: T.accent,
        border: `2.5px solid ${T.accent}`
      }
    }), !last && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 2,
        flex: 1,
        background: T.accentSoft,
        marginTop: 3
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: last ? 2 : 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13.5,
        color: T.ink
      }
    }, t), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: T.inkSoft,
        marginTop: 1
      }
    }, d)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onBack
  }, "← Worklist")));
}
