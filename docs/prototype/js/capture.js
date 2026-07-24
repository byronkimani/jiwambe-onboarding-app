function ReadinessScreen({
  form,
  set,
  goto,
  onExit
}) {
  const r = form.readiness || {};
  const toggle = k => set("readiness", {
    ...r,
    [k]: !r[k]
  });
  const allYes = READINESS_ITEMS.every(it => r[it.k]);
  const anyChecked = READINESS_ITEMS.some(it => r[it.k]);
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Is the customer ready?",
    sub: "Two minutes now saves forty later. Run through these with the customer before opening an application — if anything is missing, agree on a return date instead.",
    onNext: () => goto("lookup"),
    nextDisabled: !allYes,
    nextLabel: "Customer is ready — start"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, READINESS_ITEMS.map(it => /*#__PURE__*/React.createElement(Checkbox, {
    key: it.k,
    checked: !!r[it.k],
    onChange: () => toggle(it.k),
    label: it.label
  })), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => set("readiness", allYes ? {} : Object.fromEntries(READINESS_ITEMS.map(it => [it.k, true]))),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      cursor: "pointer",
      padding: "12px 14px",
      borderRadius: 12,
      background: allYes ? T.ink : T.card,
      border: `1.5px dashed ${allYes ? T.ink : T.lineStrong}`,
      fontFamily: BODY,
      textAlign: "left",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 17,
      height: 17,
      borderRadius: 5,
      flexShrink: 0,
      border: `2px solid ${allYes ? T.mint : T.lineStrong}`,
      background: allYes ? T.mint : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      fontWeight: 800,
      color: T.ink
    }
  }, allYes ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: allYes ? "#fff" : T.inkSoft
    }
  }, allYes ? "All confirmed — tap to clear" : "Reviewed everything with the customer — select all"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      background: T.rail,
      borderRadius: 14,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: T.mint,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 10
    }
  }, "Minimum deposit by operating model"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10
    }
  }, [["Fleet (Bolt)", "FLEET"], ["Stage", "STAGE"], ["Delivery", "DELIVERY"], ["Personal Use", "PERSONAL"]].map(([label, k]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      background: "rgba(255,255,255,0.07)",
      borderRadius: 10,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "rgba(255,255,255,0.6)",
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      color: "#fff",
      fontWeight: 700,
      fontFamily: MONO,
      marginTop: 3
    }
  }, fmtKES(MIN_DEPOSIT[k]))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "rgba(255,255,255,0.55)",
      marginTop: 10,
      lineHeight: 1.5
    }
  }, "Read the figure from here, not from memory. The exact minimum is enforced once the operating model is set.")), anyChecked && !allYes && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 16,
      background: T.amberBg,
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 13,
      color: T.amber,
      fontWeight: 600,
      lineHeight: 1.5
    }
  }, "Something's missing — better to pause here than have an application stall halfway with the customer waiting."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onExit,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontFamily: BODY,
      fontSize: 13.5,
      color: T.inkSoft,
      fontWeight: 700,
      padding: 0,
      textDecoration: "underline"
    }
  }, "Customer isn't ready today — back to worklist")));
}
function LookupScreen({
  form,
  setForm,
  goto
}) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null); // null | 'found' | 'none'

  const search = () => {
    if (q.trim().length < 4) return;
    // demo: even-length query "finds" a portal application
    if (q.replace(/\D/g, "").length % 2 === 0) {
      setResult("found");
    } else {
      setResult("none");
    }
  };
  const useFound = () => {
    setForm(f => ({
      ...f,
      customerFound: "portal",
      name: "James Mwangi Kariuki",
      phone: "0722 118 456",
      idNo: "29841170",
      email: "jkariuki88@gmail.com",
      county: "Kiambu",
      subCounty: "Ruiru",
      area: "Membley"
    }));
    goto("identity");
  };
  const startFresh = () => {
    setForm(f => ({
      ...f,
      customerFound: "new"
    }));
    goto("identity");
  };
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Find or start an application",
    sub: "Search by phone or National ID. If they already started on the self-service portal, you'll re-verify every field in person — the portal record is only a head start."
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Phone number or National ID"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    placeholder: "07XX XXX XXX or ID number",
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement(Btn, {
    onClick: search,
    style: {
      width: 120
    }
  }, "Search"))), result === "found" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      background: T.blueBg,
      border: `1.5px solid ${T.blue}33`,
      borderRadius: 14,
      padding: 16,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: T.ink,
      fontSize: 15
    }
  }, "James Mwangi Kariuki"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 2
    }
  }, "Started application on self-service portal · 3 days ago")), /*#__PURE__*/React.createElement(Tag, {
    tone: "info"
  }, "Portal draft")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: 12.5,
      color: T.blue,
      fontWeight: 600,
      background: "#fff",
      padding: "10px 12px",
      borderRadius: 10,
      lineHeight: 1.5
    }
  }, "⚠️ Confirm every field against their ID and DL in person — treat portal data as unverified until you check it."), /*#__PURE__*/React.createElement(Btn, {
    onClick: useFound,
    small: true,
    style: {
      marginTop: 12
    }
  }, "Continue with this applicant →")), result === "none" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      background: T.slateBg,
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
      fontSize: 13.5,
      color: T.inkSoft
    }
  }, "No existing record found. Start a fresh application below."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      paddingTop: 20,
      borderTop: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: startFresh
  }, "+ Start a new application from scratch")));
}
function IdOcrPanel({
  form,
  set
}) {
  const [ocr, setOcr] = useState(null);
  useEffect(() => {
    if (form.docs.idFront && !ocr) {
      setOcr("running");
      const t = setTimeout(() => setOcr({
        name: form.name,
        idNo: form.idNo,
        mismatch: false
      }), 1600);
      return () => clearTimeout(t);
    }
    if (!form.docs.idFront && ocr) setOcr(null);
  }, [form.docs.idFront]);
  const simulateMismatch = () => {
    const digits = form.idNo.replace(/\D/g, "") || "29841170";
    const flipped = digits.slice(0, -1) + (Number(digits.slice(-1)) + 3) % 10;
    setOcr({
      name: form.name,
      idNo: flipped,
      mismatch: true
    });
  };
  const DiffRow = ({
    label,
    typed,
    read
  }) => {
    const match = String(typed).replace(/\s/g, "").toLowerCase() === String(read).replace(/\s/g, "").toLowerCase();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid ${T.line}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: T.inkFaint,
        fontWeight: 600
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontFamily: MONO,
        fontWeight: 700,
        color: match ? T.accentDeep : T.red
      }
    }, match ? "✓ " + read : "✗ form: " + typed + " · ID reads: " + read));
  };
  if (!ocr) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 12,
      background: T.cardDeep,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13,
      color: T.ink
    }
  }, "ID extraction vs form"), /*#__PURE__*/React.createElement(AiChip, null, "Simulated OCR")), ocr === "running" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      color: T.blue,
      fontWeight: 700,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      border: `2.5px solid ${T.blue}`,
      borderTopColor: "transparent",
      borderRadius: 99,
      animation: "spin .7s linear infinite"
    }
  }), "Reading the ID card…") : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(DiffRow, {
    label: "Full name",
    typed: form.name,
    read: ocr.name
  }), /*#__PURE__*/React.createElement(DiffRow, {
    label: "ID number",
    typed: form.idNo,
    read: ocr.idNo
  }), ocr.mismatch ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      background: T.redBg,
      borderRadius: 10,
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.red,
      fontWeight: 700
    }
  }, "The form and the ID card disagree — fix before continuing."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    small: true,
    onClick: () => {
      set("idNo", ocr.idNo);
      setOcr({
        ...ocr,
        idNo: ocr.idNo,
        mismatch: false
      });
    },
    style: {
      padding: "8px 13px",
      fontSize: 12
    }
  }, "Use ID card value"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => setOcr({
      name: form.name,
      idNo: form.idNo,
      mismatch: false
    }),
    style: {
      padding: "8px 13px",
      fontSize: 12
    }
  }, "Form is correct — retake photo"))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: T.accentDeep,
      fontWeight: 700
    }
  }, "✓ Form matches the document"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: simulateMismatch,
    style: {
      borderStyle: "dashed",
      fontSize: 11.5,
      padding: "7px 11px"
    }
  }, "▶ Demo: simulate mismatch"))));
}
function FaceMatchPanel({
  form
}) {
  const [face, setFace] = useState(null);
  useEffect(() => {
    if (form.photo && form.docs.idFront && !face) {
      setFace("running");
      const t = setTimeout(() => setFace({
        score: 96.4
      }), 1900);
      return () => clearTimeout(t);
    }
    if ((!form.photo || !form.docs.idFront) && face) setFace(null);
  }, [form.photo, form.docs.idFront]);
  if (!face) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 12,
      background: T.cardDeep,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
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
  }, "Face match — client photo vs ID"), /*#__PURE__*/React.createElement(AiChip, null, "Simulated")), face === "running" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      color: T.blue,
      fontWeight: 700,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      border: `2.5px solid ${T.blue}`,
      borderTopColor: "transparent",
      borderRadius: 99,
      animation: "spin .7s linear infinite"
    }
  }), "Comparing faces…") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: form.photo,
    alt: "Client",
    style: {
      width: 46,
      height: 46,
      objectFit: "cover",
      borderRadius: 9,
      border: `1px solid ${T.line}`
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: form.docs.idFront,
    alt: "ID",
    style: {
      width: 46,
      height: 46,
      objectFit: "cover",
      borderRadius: 9,
      border: `1px solid ${T.line}`
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: face.score >= 85 ? T.accentDeep : T.red,
      fontFamily: MONO
    }
  }, face.score, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.inkSoft,
      fontWeight: 600
    }
  }, face.score >= 85 ? "Likely the same person" : "Low match — escalate to ops")), face.score >= 85 && /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => setFace({
      score: 41.2
    }),
    style: {
      borderStyle: "dashed",
      fontSize: 11.5,
      padding: "7px 11px",
      marginLeft: "auto"
    }
  }, "▶ Demo: low match")));
}
function IdentityScreen({
  form,
  set,
  goto
}) {
  const cap = (k, url) => set("docs", {
    ...form.docs,
    [k]: url
  });
  const clr = k => set("docs", {
    ...form.docs,
    [k]: null
  });
  const g2 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 16px"
  };
  const valid = form.name.trim().length > 2 && form.phone.replace(/\D/g, "").length >= 10 && form.idNo.trim().length >= 7 && form.kraPin.trim().length >= 9 && form.gender && form.dob && form.county && form.subCounty && form.area && form.landmark && form.email && form.photo && form.docs.idFront && form.docs.idBack && form.docs.kraCert;
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Identity & contact",
    sub: "Re-confirm every field against the physical documents, even if it was pre-filled from a portal application.",
    onBack: () => goto("lookup"),
    onNext: () => goto("dl"),
    nextDisabled: !valid
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Personal details"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Full name (as on National ID)",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.name,
    onChange: e => set("name", e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: g2
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Gender",
    required: true
  }, /*#__PURE__*/React.createElement(ChoiceRow, {
    value: form.gender,
    onChange: v => set("gender", v),
    options: [{
      value: "M",
      label: "Male"
    }, {
      value: "F",
      label: "Female"
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Date of birth",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "date",
    value: form.dob,
    onChange: e => set("dob", e.target.value)
  })))), /*#__PURE__*/React.createElement(SectionCard, {
    title: "Contact"
  }, /*#__PURE__*/React.createElement("div", {
    style: g2
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Phone number",
    required: true,
    hint: "STK push target."
  }, /*#__PURE__*/React.createElement(TextInput, {
    inputMode: "tel",
    value: form.phone,
    onChange: e => set("phone", e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Alternative phone"
  }, /*#__PURE__*/React.createElement(TextInput, {
    inputMode: "tel",
    value: form.altPhone,
    onChange: e => set("altPhone", e.target.value)
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Email address",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "email",
    value: form.email,
    onChange: e => set("email", e.target.value)
  }))), /*#__PURE__*/React.createElement(SectionCard, {
    title: "Where they live"
  }, /*#__PURE__*/React.createElement("div", {
    style: g2
  }, /*#__PURE__*/React.createElement(Field, {
    label: "County",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.county,
    onChange: v => {
      set("county", v);
      set("subCounty", "");
    },
    placeholder: "Select county…",
    options: KENYA_COUNTY_NAMES.map(c => ({
      value: c,
      label: c
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Sub-county",
    required: true,
    hint: !form.county ? "Choose a county first." : undefined
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.subCounty,
    onChange: v => set("subCounty", v),
    placeholder: form.county ? "Select sub-county…" : "—",
    options: (KENYA_COUNTIES[form.county] || []).map(s => ({
      value: s,
      label: s
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Area",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.area,
    onChange: e => set("area", e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Nearest landmark",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.landmark,
    onChange: e => set("landmark", e.target.value)
  })))), /*#__PURE__*/React.createElement(SectionCard, {
    title: "National ID",
    hint: "Capture both sides. The number below must match the card exactly."
  }, /*#__PURE__*/React.createElement(Field, {
    label: "National ID number",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    inputMode: "numeric",
    value: form.idNo,
    onChange: e => set("idNo", e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "ID — front",
    required: true,
    image: form.docs.idFront,
    onCapture: u => cap("idFront", u),
    onRetake: () => clr("idFront")
  }), /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "ID — back",
    required: true,
    image: form.docs.idBack,
    onCapture: u => cap("idBack", u),
    onRetake: () => clr("idBack")
  })), /*#__PURE__*/React.createElement(IdOcrPanel, {
    form: form,
    set: set
  })), /*#__PURE__*/React.createElement(SectionCard, {
    title: "KRA PIN",
    hint: "Capture the certificate if the customer has it with them or on their phone."
  }, /*#__PURE__*/React.createElement(Field, {
    label: "KRA PIN",
    required: true,
    hint: "Format: A012345678Z"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.kraPin,
    onChange: e => set("kraPin", e.target.value.toUpperCase())
  })), /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "KRA PIN certificate",
    required: true,
    image: form.docs.kraCert,
    onCapture: u => cap("kraCert", u),
    onRetake: () => clr("kraCert")
  })), /*#__PURE__*/React.createElement(SectionCard, {
    title: "Client photo",
    hint: "One capture — this doubles as the passport photo."
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Client photo",
    required: true,
    image: form.photo,
    onCapture: u => set("photo", u),
    onRetake: () => set("photo", null)
  }), /*#__PURE__*/React.createElement(FaceMatchPanel, {
    form: form
  })));
}
function DlScreen({
  form,
  set,
  goto,
  onSaveDraft
}) {
  const cap = (k, url) => set("docs", {
    ...form.docs,
    [k]: url
  });
  const clr = k => set("docs", {
    ...form.docs,
    [k]: null
  });
  const s = form.dlSituation;
  const needsNumber = s === "smart" || s === "pdl" || s === "processing";
  const valid = s === "smart" && form.dlNumber && form.docs.dlFront && form.docs.dlBack || s === "pdl" && form.dlNumber && form.docs.dlFront || s === "processing" && form.dlNumber && form.docs.dlFront && form.docs.pelezaDl;
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Driving licence",
    sub: "Capture the licence here — this page holds every DL document.",
    onBack: () => goto("identity"),
    onNext: () => goto("cogc"),
    nextDisabled: !valid
  }, /*#__PURE__*/React.createElement(Field, {
    label: "What is the licence situation?",
    required: true
  }, /*#__PURE__*/React.createElement(ChoiceRow, {
    value: s,
    onChange: v => set("dlSituation", v),
    options: [{
      value: "smart",
      label: "Valid smart DL"
    }, {
      value: "pdl",
      label: "PDL (provisional)"
    }, {
      value: "processing",
      label: "Expired / under processing"
    }, {
      value: "none",
      label: "No licence"
    }]
  })), needsNumber && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: s === "pdl" ? "Provisional licence" : "Licence details"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Driving licence number",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.dlNumber,
    onChange: e => set("dlNumber", e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: s === "smart" ? "1fr 1fr" : "1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: s === "pdl" ? "PDL — front" : "Licence — front",
    required: true,
    image: form.docs.dlFront,
    onCapture: u => cap("dlFront", u),
    onRetake: () => clr("dlFront")
  }), s === "smart" && /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Licence — back",
    required: true,
    image: form.docs.dlBack,
    onCapture: u => cap("dlBack", u),
    onRetake: () => clr("dlBack")
  })), s === "pdl" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.inkFaint,
      marginTop: 10
    }
  }, "A PDL has no reverse side to capture.")), s === "processing" && /*#__PURE__*/React.createElement(SectionCard, {
    title: "Peleza — driving licence",
    hint: "The licence is expired or being renewed on NTSA and the physical card hasn't been collected. A Peleza DL report is required to proceed."
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Peleza report — driving licence",
    required: true,
    image: form.docs.pelezaDl,
    onCapture: u => cap("pelezaDl", u),
    onRetake: () => clr("pelezaDl")
  }))), s === "none" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Driving school sponsorship",
    hint: "The customer cannot be onboarded without a licence. Check whether they want sponsorship before you close the session."
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Does the customer need driving school sponsorship?",
    required: true
  }, /*#__PURE__*/React.createElement(ChoiceRow, {
    value: form.needsSponsorship,
    onChange: v => set("needsSponsorship", v),
    options: [{
      value: "yes",
      label: "Yes"
    }, {
      value: "no",
      label: "No"
    }]
  })), form.needsSponsorship === "yes" && /*#__PURE__*/React.createElement(Field, {
    label: "Preferred partner driving school"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.school,
    onChange: e => set("school", e.target.value)
  }))), /*#__PURE__*/React.createElement(ExitCard, {
    title: "No driving licence — save and hand over to customer support",
    body: form.needsSponsorship === "yes" ? "Everything captured so far is saved. Customer support picks up the sponsorship conversation and the customer returns to this application once they have a licence." : "Everything captured so far is saved as a draft. The customer returns to this same application once they have a licence — nothing gets re-typed.",
    actionLabel: "Save draft & refer to customer support",
    onAction: () => onSaveDraft(form.needsSponsorship === "yes" ? "No driving licence — wants driving school sponsorship; referred to customer support" : "No driving licence — referred to customer support")
  })));
}
function CogcScreen({
  form,
  set,
  goto,
  onSaveDraft
}) {
  const cap = (k, url) => set("docs", {
    ...form.docs,
    [k]: url
  });
  const clr = k => set("docs", {
    ...form.docs,
    [k]: null
  });
  const s = form.cogcSituation;
  const valid = s === "have" && form.docs.cogcDoc || s === "peleza" && form.docs.pelezaCogc || s === "fingerprints";
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Certificate of Good Conduct",
    sub: "Capture the certificate — or the Peleza evidence standing in for it.",
    onBack: () => goto("dl"),
    onNext: () => goto("references"),
    nextDisabled: !valid
  }, /*#__PURE__*/React.createElement(Field, {
    label: "What is the good conduct situation?",
    required: true
  }, /*#__PURE__*/React.createElement(ChoiceRow, {
    value: s,
    onChange: v => set("cogcSituation", v),
    options: [{
      value: "have",
      label: "Has the certificate"
    }, {
      value: "fingerprints",
      label: "Fingerprints taken — pending"
    }, {
      value: "peleza",
      label: "Peleza check completed"
    }, {
      value: "none",
      label: "Not started"
    }]
  })), s === "have" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Certificate"
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Certificate of Good Conduct",
    required: true,
    image: form.docs.cogcDoc,
    onCapture: u => cap("cogcDoc", u),
    onRetake: () => clr("cogcDoc")
  }))), s === "fingerprints" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.blueBg,
      borderRadius: 14,
      padding: 18,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 800,
      fontSize: 14,
      color: T.blue
    }
  }, "Peleza — what to tell the customer"), /*#__PURE__*/React.createElement(AiChip, null, "Placeholder copy")), /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: 12.5,
      color: T.inkSoft,
      lineHeight: 1.75
    }
  }, /*#__PURE__*/React.createElement("li", null, "Confirm they have their fingerprint acknowledgement slip and the date fingerprints were taken."), /*#__PURE__*/React.createElement("li", null, "Jiwambe submits their details to Peleza for an expedited background check — no extra trip for the customer."), /*#__PURE__*/React.createElement("li", null, "Peleza normally returns a report within a few working days."), /*#__PURE__*/React.createElement("li", null, "Once it's back, the file is cleared by ops. The bike cannot be released before that."))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.amberBg,
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 12.5,
      color: T.amber,
      fontWeight: 600,
      lineHeight: 1.5
    }
  }, "The application continues and carries a ", /*#__PURE__*/React.createElement("b", null, "COGC-pending"), " flag. Ops clears it when Peleza returns — release is gated until then.")), s === "peleza" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Peleza report",
    hint: "The completed Peleza background check stands in for the certificate."
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Peleza report — good conduct",
    required: true,
    image: form.docs.pelezaCogc,
    onCapture: u => cap("pelezaCogc", u),
    onRetake: () => clr("pelezaCogc")
  }))), s === "none" && /*#__PURE__*/React.createElement(ExitCard, {
    title: "No good conduct process started — save and send them to get fingerprints",
    body: "Everything captured so far is saved. The customer returns to this same application once fingerprints are done — nothing gets re-typed.",
    steps: ["Take the original National ID to a DCI office or any Huduma Centre.", "Pay the police clearance fee and give fingerprints.", "Keep the acknowledgement slip — it's needed when they come back.", "Return here; we'll either attach the certificate or run a Peleza check to speed it up."],
    actionLabel: "Save draft & advise DCI / Huduma Centre",
    onAction: () => onSaveDraft("No Certificate of Good Conduct — advised to take fingerprints at DCI / Huduma Centre")
  }));
}
function ModelScreen({
  form,
  set,
  goto,
  onSaveDraft,
  onTerminate
}) {
  const cap = (k, url) => set("docs", {
    ...form.docs,
    [k]: url
  });
  const clr = k => set("docs", {
    ...form.docs,
    [k]: null
  });
  const m = form.opModel;
  const fleetOk = m === "FLEET" && form.boltActive === "yes";
  const stageOk = m === "STAGE" && form.stageName && form.chairName && form.chairPhone && form.chairCalled && form.chairOutcome === "confirmed";
  const deliveryOk = m === "DELIVERY" && form.worksPlatform === "yes" && form.platformName && form.platformContact && form.verifyConsent && form.docs.consentDoc;
  const personalOk = m === "PERSONAL" && form.isEmployed && form.verifyConsent && (form.isEmployed === "no" || form.employerName && form.employerContact && form.docs.consentDoc);
  const valid = fleetOk || stageOk || deliveryOk || personalOk;
  const Q = ({
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      color: T.ink,
      marginBottom: 10,
      lineHeight: 1.45
    }
  }, children);
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Operating model",
    sub: "The customer's KYC is already saved. If the model blocks them today, everything above is kept and they resume from here.",
    onBack: () => goto("references"),
    onNext: () => goto("product"),
    nextDisabled: !valid
  }, /*#__PURE__*/React.createElement(Field, {
    label: "How will the customer use the bike?",
    required: true
  }, /*#__PURE__*/React.createElement(ChoiceRow, {
    value: m,
    onChange: v => {
      set("opModel", v);
      set("chairOutcome", "");
      set("chairCalled", false);
    },
    options: [{
      value: "FLEET",
      label: "Fleet (Bolt)"
    }, {
      value: "STAGE",
      label: "Stage"
    }, {
      value: "DELIVERY",
      label: "Delivery"
    }, {
      value: "PERSONAL",
      label: "Personal Use"
    }]
  })), m === "FLEET" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Bolt account"
  }, /*#__PURE__*/React.createElement(Q, null, "Does the customer have an active Bolt account with no suspensions or penalties?"), /*#__PURE__*/React.createElement(ChoiceRow, {
    value: form.boltActive,
    onChange: v => set("boltActive", v),
    options: [{
      value: "yes",
      label: "Yes — active and clean"
    }, {
      value: "no",
      label: "No"
    }]
  })), form.boltActive === "no" && /*#__PURE__*/React.createElement(ExitCard, {
    title: "Bolt account not clear — save and refer to customer service",
    body: "The rider can't be onboarded onto Fleet with a suspended, penalised, or inactive Bolt account. Everything captured is saved; customer service takes it from here, and the customer can resume — or switch to another operating model — when it's resolved.",
    actionLabel: "Save draft & refer to customer service",
    onAction: () => onSaveDraft("Bolt account not active / has suspensions or penalties — referred to customer service")
  })), m === "STAGE" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Stage details"
  }, /*#__PURE__*/React.createElement(Q, null, "Which stage do you operate from?"), /*#__PURE__*/React.createElement(Field, {
    label: "Stage name",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.stageName,
    onChange: e => set("stageName", e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0 16px"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Chairperson name",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.chairName,
    onChange: e => set("chairName", e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Chairperson phone",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    inputMode: "tel",
    value: form.chairPhone,
    onChange: e => set("chairPhone", e.target.value)
  }))), /*#__PURE__*/React.createElement(Checkbox, {
    checked: form.chairCalled,
    onChange: v => {
      set("chairCalled", v);
      if (!v) set("chairOutcome", "");
    },
    label: "I called the chairperson during this session."
  })), form.stageName && form.chairName && form.chairPhone && form.chairCalled && /*#__PURE__*/React.createElement(SectionCard, {
    title: "What happened on the call?",
    hint: "Confirm the customer operates from this stage and that the details given are right. Record the outcome."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, [{
    v: "confirmed",
    label: "Reachable — confirms the customer and the details",
    tone: T.accent,
    note: "Quickest path. Continue."
  }, {
    v: "unreachable",
    label: "Unreachable right now",
    tone: T.amber,
    note: "Saved as pending until the chairperson can be reached."
  }, {
    v: "denied",
    label: "Denies or contradicts the customer's details",
    tone: T.red,
    note: "The application is terminated."
  }].map(o => {
    const on = form.chairOutcome === o.v;
    return /*#__PURE__*/React.createElement("button", {
      key: o.v,
      className: "jw-tap",
      onClick: () => set("chairOutcome", o.v),
      style: {
        display: "flex",
        gap: 11,
        alignItems: "flex-start",
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
        padding: "13px 14px",
        borderRadius: 12,
        fontFamily: BODY,
        background: on ? o.tone + "1A" : T.card,
        border: `1.5px solid ${on ? o.tone : T.line}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 17,
        height: 17,
        borderRadius: 99,
        marginTop: 2,
        flexShrink: 0,
        border: `2px solid ${on ? o.tone : T.lineStrong}`,
        background: on ? o.tone : "transparent"
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 13.5,
        fontWeight: 700,
        color: T.ink
      }
    }, o.label), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: 12,
        color: T.inkSoft,
        marginTop: 2
      }
    }, o.note)));
  }))), form.chairOutcome === "unreachable" && /*#__PURE__*/React.createElement(ExitCard, {
    title: "Chairperson unreachable — save as pending",
    body: "Everything captured is saved. Try the chairperson again later; the application resumes from this step once they confirm.",
    actionLabel: "Save draft — pending chairperson",
    onAction: () => onSaveDraft(`Stage chairperson (${form.chairName}) unreachable — pending confirmation`)
  }), form.chairOutcome === "denied" && /*#__PURE__*/React.createElement(ExitCard, {
    tone: "danger",
    title: "Chairperson denies the customer's details — terminate",
    body: "The chairperson does not confirm that the customer operates from this stage, or contradicts what they told you. This application cannot proceed and is closed permanently.",
    actionLabel: "Terminate application",
    onAction: () => onTerminate(`Stage chairperson (${form.chairName}) denied or contradicted the customer's stage details`)
  })), m === "DELIVERY" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Delivery work"
  }, /*#__PURE__*/React.createElement(Q, null, "Do you work for a delivery company or platform?"), /*#__PURE__*/React.createElement(ChoiceRow, {
    value: form.worksPlatform,
    onChange: v => set("worksPlatform", v),
    options: [{
      value: "yes",
      label: "Yes"
    }, {
      value: "no",
      label: "No"
    }]
  })), form.worksPlatform === "yes" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Platform or employer"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Delivery platform or employer name",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.platformName,
    onChange: e => set("platformName", e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Contact",
    required: true,
    hint: "Phone and/or email"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.platformContact,
    onChange: e => set("platformContact", e.target.value)
  }))), /*#__PURE__*/React.createElement(SectionCard, {
    title: "Workplace & residence verification"
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: form.verifyConsent,
    onChange: v => {
      set("verifyConsent", v);
      if (!v) clr("consentDoc");
    },
    label: "Customer consents to workplace and residence verification."
  }), form.verifyConsent && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Signed & rubber-stamped consent document",
    required: true,
    image: form.docs.consentDoc,
    onCapture: u => cap("consentDoc", u),
    onRetake: () => clr("consentDoc")
  }))), /*#__PURE__*/React.createElement(SectionCard, {
    title: "Business registration",
    hint: "Optional — capture it if they have it, but never block the application on it."
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Business registration certificate or permit",
    image: form.docs.bizPermit,
    onCapture: u => cap("bizPermit", u),
    onRetake: () => clr("bizPermit")
  }))), (form.worksPlatform === "no" || form.worksPlatform === "yes" && form.platformName && form.platformContact && !form.verifyConsent) && /*#__PURE__*/React.createElement(ExitCard, {
    title: form.worksPlatform === "no" ? "No employer details — save and pause" : "Consent refused — save and pause",
    body: form.worksPlatform === "no" ? "Delivery riders need a platform or employer on file. Everything captured is saved; the customer returns with the details." : "Delivery riders cannot be verified without consent. Everything captured is saved; the customer returns with the signed and stamped consent document.",
    actionLabel: "Save draft & pause",
    onAction: () => onSaveDraft(form.worksPlatform === "no" ? "Delivery — no delivery platform or employer details provided" : "Delivery — workplace and residence verification consent refused")
  })), m === "PERSONAL" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Work or business"
  }, /*#__PURE__*/React.createElement(Q, null, "Are you employed, or do you run a business?"), /*#__PURE__*/React.createElement(ChoiceRow, {
    value: form.isEmployed,
    onChange: v => set("isEmployed", v),
    options: [{
      value: "yes",
      label: "Yes"
    }, {
      value: "no",
      label: "No"
    }]
  })), form.isEmployed === "yes" && /*#__PURE__*/React.createElement(SectionCard, {
    title: "Employer or business"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Employer or business name",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.employerName,
    onChange: e => set("employerName", e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Contact",
    required: true,
    hint: "Phone and/or email"
  }, /*#__PURE__*/React.createElement(TextInput, {
    value: form.employerContact,
    onChange: e => set("employerContact", e.target.value)
  }))), form.isEmployed && /*#__PURE__*/React.createElement(SectionCard, {
    title: form.isEmployed === "yes" ? "Workplace & residence verification" : "Residence verification",
    hint: form.isEmployed === "no" ? "No workplace to verify — residence verification consent is still required to proceed." : undefined
  }, /*#__PURE__*/React.createElement(Checkbox, {
    checked: form.verifyConsent,
    onChange: v => {
      set("verifyConsent", v);
      if (!v) clr("consentDoc");
    },
    label: form.isEmployed === "yes" ? "Customer consents to workplace and residence verification." : "Customer consents to residence verification."
  }), form.verifyConsent && form.isEmployed === "yes" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(PhotoSlot, {
    label: "Signed & rubber-stamped consent document",
    required: true,
    image: form.docs.consentDoc,
    onCapture: u => cap("consentDoc", u),
    onRetake: () => clr("consentDoc")
  }))), form.isEmployed && !form.verifyConsent && /*#__PURE__*/React.createElement(ExitCard, {
    title: "Consent refused — save and pause",
    body: "Personal Use riders cannot proceed without verification consent. Everything captured is saved; the customer returns if they change their mind, or you can disqualify the application from the worklist.",
    actionLabel: "Save draft & pause",
    onAction: () => onSaveDraft("Personal Use — verification consent refused")
  })));
}
function ProductScreen({
  form,
  set,
  goto
}) {
  const product = PRODUCTS.find(p => p.id === form.productId);
  const price = assetPrice(product, form.assetType);
  const modelMin = minDeposit(form.opModel);
  const deposit = form.deposit == null ? modelMin : form.deposit;
  const daily = product ? calcDaily(price, deposit, form.term) : null;
  const financingOk = form.productId && form.term && deposit >= modelMin;
  const valid = financingOk && form.stkVerified;
  const pickProduct = v => {
    set("productId", v);
    set("deposit", modelMin);
  };
  const payPhone = form.payPhone || form.phone;
  const [editingPhone, setEditingPhone] = useState(false);
  const s = form.stkState;
  const initiate = () => {
    set("stkCheckoutId", "ws_CO_" + Date.now());
    set("stkState", "initiated");
    setTimeout(() => set("stkState", "waiting"), 900);
  };
  const simConfirm = () => {
    set("stkRef", "UG" + Math.random().toString(36).slice(2, 10).toUpperCase());
    set("stkVerified", true);
    set("stkState", "confirmed");
  };
  const simTimeout = () => set("stkState", "failed");
  const checkFallback = () => {
    set("stkState", "fallbackChecking");
    setTimeout(() => {
      set("stkRef", form.fallbackCode.toUpperCase());
      set("stkVerified", true);
      set("stkState", "confirmed");
    }, 1400);
  };
  const Row = ({
    label,
    value,
    tone
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "7px 0",
      borderBottom: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: T.inkFaint,
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontFamily: MONO,
      fontWeight: 700,
      color: tone === "ok" ? T.accentDeep : tone === "warn" ? T.amber : T.ink
    }
  }, value));
  const modelLabel = {
    FLEET: "Fleet",
    STAGE: "Stage",
    DELIVERY: "Delivery",
    PERSONAL: "Personal Use"
  }[form.opModel] || "this model";
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Product, financing & deposit",
    sub: "Pick the asset, set the deposit, and take the payment — the application cannot proceed until the system confirms it.",
    onBack: () => goto("model"),
    onNext: () => goto("bike"),
    nextDisabled: !valid
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Asset"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Asset type",
    required: true
  }, /*#__PURE__*/React.createElement(ChoiceRow, {
    value: form.assetType,
    onChange: v => set("assetType", v),
    options: [{
      value: "new",
      label: "New"
    }, {
      value: "used",
      label: "Second-hand / repossessed"
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Product / model",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.productId,
    onChange: pickProduct,
    placeholder: "Choose from catalog",
    options: PRODUCTS.map(p => ({
      value: p.id,
      label: p.label + " · " + fmtKES(assetPrice(p, form.assetType))
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Financing term",
    required: true
  }, /*#__PURE__*/React.createElement(ChoiceRow, {
    value: form.term,
    onChange: v => set("term", v),
    options: [{
      value: "18",
      label: "18 months"
    }, {
      value: "24",
      label: "24 months"
    }]
  }))), product && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp"
  }, /*#__PURE__*/React.createElement(SectionCard, {
    title: "Deposit",
    hint: `Minimum for ${modelLabel}: ${fmtKES(modelMin)} · maximum ${fmtKES(DEPOSIT_MAX)} · steps of ${fmtKES(DEPOSIT_STEP)}.`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.cardDeep,
      border: `1px solid ${T.line}`,
      borderRadius: 14,
      padding: "18px 18px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      color: T.ink,
      fontFamily: MONO
    }
  }, fmtKES(deposit)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: T.inkFaint,
      fontWeight: 600
    }
  }, modelLabel, " minimum ", fmtKES(modelMin))), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: modelMin,
    max: DEPOSIT_MAX,
    step: DEPOSIT_STEP,
    value: deposit,
    disabled: s === "confirmed",
    onChange: e => set("deposit", Number(e.target.value)),
    style: {
      width: "100%",
      accentColor: T.accent,
      height: 30,
      cursor: s === "confirmed" ? "default" : "pointer"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 11.5,
      color: T.inkFaint,
      fontFamily: MONO,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", null, fmtKES(modelMin)), /*#__PURE__*/React.createElement("span", null, fmtKES(DEPOSIT_MAX)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: T.rail,
      borderRadius: 14,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: T.mint,
      textTransform: "uppercase",
      letterSpacing: 0.6
    }
  }, "Daily installment"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: "#fff",
      fontFamily: MONO,
      marginTop: 4
    }
  }, fmtKES(daily))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: T.cardDeep,
      border: `1px solid ${T.line}`,
      borderRadius: 14,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6
    }
  }, "Amount financed"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: T.ink,
      fontFamily: MONO,
      marginTop: 4
    }
  }, fmtKES(price - deposit)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: T.inkFaint,
      marginTop: 4
    }
  }, "of ", fmtKES(price), " ", form.assetType === "used" ? "pre-owned" : "new", " price")))), /*#__PURE__*/React.createElement(SectionCard, {
    title: "Deposit payment"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
      flexWrap: "wrap",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6
    }
  }, "Due now"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: T.ink,
      fontFamily: MONO,
      marginTop: 2
    }
  }, fmtKES(deposit))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6
    }
  }, "Paying from"), editingPhone ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      padding: "8px 10px",
      fontSize: 14,
      width: 150
    },
    inputMode: "tel",
    value: form.payPhone,
    placeholder: form.phone,
    autoFocus: true,
    onChange: e => set("payPhone", e.target.value)
  }), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    onClick: () => setEditingPhone(false),
    style: {
      padding: "8px 12px"
    }
  }, "Done")) : /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: T.ink
    }
  }, payPhone || "—"), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    disabled: s === "confirmed",
    onClick: () => {
      set("payPhone", payPhone);
      setEditingPhone(true);
    },
    style: {
      marginLeft: 10,
      background: "none",
      border: "none",
      color: s === "confirmed" ? T.inkFaint : T.accentDeep,
      fontSize: 12.5,
      fontWeight: 700,
      cursor: s === "confirmed" ? "default" : "pointer",
      fontFamily: BODY,
      textDecoration: "underline"
    }
  }, "Change")))), form.payPhone && form.payPhone.replace(/\D/g, "") !== form.phone.replace(/\D/g, "") && s !== "confirmed" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      fontSize: 12.5,
      color: T.amber,
      background: T.amberBg,
      borderRadius: 10,
      padding: "9px 12px",
      fontWeight: 600,
      lineHeight: 1.5
    }
  }, "⚠️ Paying from a different number than the registered SIM — this will be recorded on the payment audit trail."), s === "idle" && /*#__PURE__*/React.createElement(Btn, {
    onClick: initiate,
    disabled: !financingOk || !payPhone
  }, "Send STK push to ", payPhone || "…"), s !== "idle" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      background: T.cardDeep,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 4
    }
  }, "Initiation output · Daraja"), /*#__PURE__*/React.createElement(Row, {
    label: "CheckoutRequestID",
    value: form.stkCheckoutId
  }), /*#__PURE__*/React.createElement(Row, {
    label: "ResponseCode",
    value: "0 — Success",
    tone: "ok"
  }), /*#__PURE__*/React.createElement(Row, {
    label: "IPN confirmation",
    value: s === "confirmed" ? "✓ Received · " + form.stkRef : s === "failed" ? "✗ Not received (timeout)" : "Pending…",
    tone: s === "confirmed" ? "ok" : "warn"
  })), (s === "initiated" || s === "waiting") && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: T.amber,
      fontWeight: 700,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      border: `2.5px solid ${T.amber}`,
      borderTopColor: "transparent",
      borderRadius: 99,
      animation: "spin .7s linear infinite"
    }
  }), "Waiting for M-Pesa PIN on ", payPhone, "…"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: simConfirm,
    style: {
      borderStyle: "dashed",
      fontSize: 12
    }
  }, "▶ Demo: IPN confirms"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: simTimeout,
    style: {
      borderStyle: "dashed",
      fontSize: 12
    }
  }, "▶ Demo: times out"))), s === "failed" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      background: T.redBg,
      borderRadius: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: T.red,
      fontSize: 13.5
    }
  }, "No confirmation received"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "The push may have expired, been cancelled, or the customer paid via paybill directly."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    small: true,
    onClick: initiate
  }, "↺ Retry STK push"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: () => set("stkState", "fallback")
  }, "Enter M-Pesa code instead"))), (s === "fallback" || s === "fallbackChecking") && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      background: T.cardDeep,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: T.ink,
      fontSize: 13.5
    }
  }, "Validate M-Pesa confirmation code"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "From the customer's M-Pesa SMS (e.g. UGK3XG91TQ). The backend matches it against received C2B payments — the code alone confirms nothing until validated."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      maxWidth: 220,
      fontFamily: MONO,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: "uppercase"
    },
    maxLength: 10,
    placeholder: "UGXXXXXXXX",
    value: form.fallbackCode,
    onChange: e => set("fallbackCode", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
  }), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    disabled: form.fallbackCode.length < 10 || s === "fallbackChecking",
    onClick: checkFallback
  }, s === "fallbackChecking" ? "Validating…" : "Validate with backend"))), s === "confirmed" && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      background: T.accentSoft,
      borderRadius: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: T.accentDeep,
      fontSize: 13.5
    }
  }, "✓ Payment confirmed by the system"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 4,
      fontFamily: MONO
    }
  }, fmtKES(deposit), " · Ref ", form.stkRef, " · from ", payPhone)))));
}
function BikeScreen({
  form,
  set,
  goto,
  inventory
}) {
  const productModel = (PRODUCTS.find(p => p.id === form.productId) || {}).label ? PRODUCTS.find(p => p.id === form.productId).label.split(" (")[0] : null;
  const [holdSecs, setHoldSecs] = useState(null);
  useEffect(() => {
    if (!form.bikeReg) {
      setHoldSecs(null);
      return;
    }
    setHoldSecs(HOLD_SECONDS);
    const t = setInterval(() => setHoldSecs(s => s == null ? null : Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [form.bikeReg]);
  useEffect(() => {
    if (holdSecs === 0 && form.bikeReg) set("bikeReg", null);
  }, [holdSecs]);
  const assignable = b => b.dealership === OFFICER_DEALERSHIP && b.status === "available" && b.sticker && daysTo(b.stickerExpiry) > 90;
  const mine = inventory.filter(assignable);
  const selected = mine.find(b => b.reg === form.bikeReg);
  const statusLine = b => {
    const remaining = daysTo(b.stickerExpiry);
    const inStock = -daysTo(b.receivedAt);
    if (inStock > 60) return {
      text: `Sticker ${b.sticker} · ${remaining}d cover left · slow mover, in stock ${inStock}d`,
      color: T.amber
    };
    return {
      text: `Sticker ${b.sticker} · ${remaining}d of 1-yr cover left · in stock ${inStock}d`,
      color: T.accentDeep
    };
  };
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Bike assignment",
    sub: `Available stock at your dealership — ${OFFICER_DEALERSHIP}. Only bikes in stock with valid insurance cover are listed. Selecting one locks it to this application straight away, so no other officer can take it while you finish.`,
    onBack: () => goto("product"),
    onNext: () => goto("review"),
    nextDisabled: !selected
  }, mine.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.amberBg,
      borderRadius: 14,
      padding: 18,
      fontSize: 13.5,
      color: T.amber,
      fontWeight: 600,
      lineHeight: 1.55
    }
  }, "No bikes are available to assign at ", OFFICER_DEALERSHIP, " right now — everything is reserved, assigned, or waiting on an insurance sticker. Pause the application and try again once stock is released."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, mine.map(b => {
    const isSel = form.bikeReg === b.reg;
    const st = statusLine(b);
    const modelMatch = productModel && b.model === productModel;
    return /*#__PURE__*/React.createElement("div", {
      key: b.reg,
      className: "jw-tap",
      onClick: () => set("bikeReg", isSel ? null : b.reg),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        borderRadius: 14,
        background: isSel ? T.accentSoft : T.card,
        border: `1.5px solid ${isSel ? T.accent : T.line}`,
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 99,
        flexShrink: 0,
        border: `2px solid ${isSel ? T.accent : T.lineStrong}`,
        background: isSel ? T.accent : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 11,
        fontWeight: 800
      }
    }, isSel ? "✓" : ""), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        fontFamily: MONO,
        fontSize: 15,
        color: T.ink,
        letterSpacing: 0.5
      }
    }, b.reg), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: T.inkSoft
      }
    }, b.model, " · ", b.color), modelMatch && !isSel && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontWeight: 800,
        padding: "2px 7px",
        borderRadius: 999,
        background: T.blueBg,
        color: T.blue
      }
    }, "Matches product"), isSel && /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10.5,
        fontWeight: 800,
        padding: "3px 9px",
        borderRadius: 999,
        background: T.ink,
        color: T.mint,
        fontFamily: MONO,
        letterSpacing: 0.3
      }
    }, "🔒 HELD FOR YOU · ", holdSecs == null ? mmss(HOLD_SECONDS) : mmss(holdSecs))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        fontWeight: 600,
        color: st.color,
        marginTop: 3
      }
    }, st.text)));
  })), selected && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 16,
      background: T.ink,
      borderRadius: 14,
      padding: 16,
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 11,
      flexShrink: 0,
      background: "rgba(78,217,155,0.14)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18
    }
  }, "🔒"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: "#fff"
    }
  }, selected.reg, " is locked to this application"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "rgba(255,255,255,0.6)",
      marginTop: 3,
      lineHeight: 1.45
    }
  }, "No other officer can select it while you finish. The hold releases automatically if you pause, deselect, or the timer runs out.")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 700,
      color: T.mint,
      fontFamily: MONO,
      lineHeight: 1
    }
  }, holdSecs == null ? mmss(HOLD_SECONDS) : mmss(holdSecs)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "rgba(255,255,255,0.5)",
      fontWeight: 700,
      letterSpacing: 0.4,
      marginTop: 4
    }
  }, "HOLD EXPIRES"))));
}
function ReferencesScreen({
  form,
  set,
  goto
}) {
  const upd = (i, k, v) => set("references", form.references.map((r, idx) => idx === i ? {
    ...r,
    [k]: v
  } : r));
  const slotLabel = i => i === 0 ? "Next of kin" : `Reference ${i + 1}`;
  const opts = i => i === 0 ? NEXT_OF_KIN_RELATIONSHIPS : REF_RELATIONSHIPS;
  const refOk = r => r.name.trim().length > 2 && r.id.trim().length >= 7 && r.phone.replace(/\D/g, "").length >= 10 && r.relationship;
  const valid = form.references.every(r => refOk(r) && r.called) && form.refConsent;
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "References",
    sub: "Three references. The customer has already briefed them, so call each one now — the tick is your record that you spoke to them.",
    onBack: () => goto("cogc"),
    onNext: () => goto("model"),
    nextDisabled: !valid
  }, form.references.map((r, i) => {
    const done = r.called;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: done ? T.accentSoft : T.card,
        border: `1.5px solid ${done ? T.accent : T.line}`,
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        transition: "background .2s, border-color .2s"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11.5,
        fontWeight: 800,
        color: done ? T.accentDeep : T.inkFaint,
        textTransform: "uppercase",
        letterSpacing: 0.6
      }
    }, slotLabel(i)), i === 0 && /*#__PURE__*/React.createElement(Tag, {
      tone: "info"
    }, "Always next of kin")), /*#__PURE__*/React.createElement(Field, {
      label: "Full name",
      required: true
    }, /*#__PURE__*/React.createElement(TextInput, {
      value: r.name,
      onChange: e => upd(i, "name", e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "0 16px"
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "National ID number",
      required: true
    }, /*#__PURE__*/React.createElement(TextInput, {
      inputMode: "numeric",
      value: r.id,
      onChange: e => upd(i, "id", e.target.value)
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Phone number",
      required: true
    }, /*#__PURE__*/React.createElement(TextInput, {
      inputMode: "tel",
      value: r.phone,
      onChange: e => upd(i, "phone", e.target.value)
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Relationship",
      required: true
    }, /*#__PURE__*/React.createElement(Select, {
      value: r.relationship,
      onChange: v => upd(i, "relationship", v),
      options: opts(i)
    })), /*#__PURE__*/React.createElement("button", {
      className: "jw-tap",
      disabled: !refOk(r),
      onClick: () => upd(i, "called", !r.called),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        textAlign: "left",
        cursor: refOk(r) ? "pointer" : "default",
        padding: "12px 14px",
        borderRadius: 12,
        fontFamily: BODY,
        opacity: refOk(r) ? 1 : 0.5,
        background: done ? T.accent : T.cardDeep,
        border: `1.5px solid ${done ? T.accent : T.line}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        borderRadius: 5,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 800,
        border: `2px solid ${done ? "#fff" : T.lineStrong}`,
        background: done ? "#fff" : "transparent",
        color: T.accentDeep
      }
    }, done ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: done ? "#fff" : T.inkSoft
      }
    }, done ? "Called — details confirmed" : refOk(r) ? "I called this reference and confirmed their details" : "Fill in the details above, then call them")));
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: form.refConsent,
    onChange: v => set("refConsent", v),
    label: "Customer has given consent for these references to be contacted by Jiwambe."
  }));
}
function ReviewScreen({
  form,
  completeMap,
  submit,
  submitted,
  online,
  goto,
  onExit
}) {
  const stagesToCheck = STAGES.filter(s => s.k !== "review" && s.k !== "lookup");
  const allDone = stagesToCheck.every(s => completeMap[s.k]);
  const [aiRun, setAiRun] = useState(null); // null | 'running' | results[]
  const runAiChecks = () => {
    setAiRun("running");
    setTimeout(() => {
      const payDiff = form.payPhone && form.payPhone.replace(/\D/g, "") !== form.phone.replace(/\D/g, "");
      const custDigits = form.phone.replace(/\D/g, "");
      const guarantorClash = form.references.some(g => g.phone.replace(/\D/g, "") === custDigits && custDigits.length >= 10);
      setAiRun([{
        ok: true,
        label: "No duplicate application for this National ID"
      }, {
        ok: !guarantorClash,
        label: guarantorClash ? "A reference's phone matches the customer's own number" : "Reference phones are distinct from the customer and each other"
      }, {
        ok: !payDiff,
        label: payDiff ? "Deposit paid from a different number than the registered SIM — flagged on the audit trail" : "Deposit paid from the customer's registered SIM"
      }, {
        ok: true,
        label: "Required document set complete for the " + ({
          FLEET: "fleet",
          STAGE: "stage",
          DELIVERY: "delivery",
          PERSONAL: "personal use"
        }[form.opModel] || "") + " model"
      }, ...(form.cogcSituation === "fingerprints" ? [{
        ok: false,
        label: "COGC pending — fingerprints taken, Peleza check outstanding; ops must clear before bike release"
      }] : []), {
        ok: true,
        label: "Driving licence number format valid for NTSA records"
      }]);
    }, 1800);
  };
  if (submitted) {
    return /*#__PURE__*/React.createElement("div", {
      className: "fadeUp",
      style: {
        maxWidth: 640,
        margin: "0 auto",
        textAlign: "center",
        padding: "40px 0"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 68,
        height: 68,
        margin: "0 auto 20px",
        borderRadius: 20,
        background: online ? T.accentSoft : T.offlineBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30
      }
    }, online ? "✓" : "⏳"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontFamily: DISPLAY,
        fontSize: 25,
        color: T.ink,
        fontWeight: 400,
        margin: "0 0 8px"
      }
    }, online ? "Submitted to backoffice" : "Saved locally"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: T.inkSoft,
        fontSize: 14,
        lineHeight: 1.6,
        maxWidth: 420,
        margin: "0 auto"
      }
    }, online ? "Ops will review and push to the Loan Management System. Once created, this application returns to you for agreement generation and client signature." : "This application is queued on the tablet and will sync automatically the moment connectivity returns — nothing is lost."), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 26
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      onClick: onExit
    }, "Back to worklist")));
  }
  return /*#__PURE__*/React.createElement(StageShell, {
    title: "Review & submit",
    sub: "Completion gate — every required item below must be checked off before this can be submitted."
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, stagesToCheck.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.k,
    onClick: () => goto(s.k),
    className: "jw-tap",
    style: {
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "13px 16px",
      borderRadius: 12,
      background: completeMap[s.k] ? T.accentSoft : T.redBg
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: T.ink
    }
  }, s.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 800,
      color: completeMap[s.k] ? T.accentDeep : T.red
    }
  }, completeMap[s.k] ? "✓ Complete" : "Incomplete →")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18,
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 14,
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13.5,
      color: T.ink
    }
  }, "Pre-submission anomaly scan"), /*#__PURE__*/React.createElement(AiChip, null, "Simulated")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "The same checks ops runs first — catching a flag here means fixing it with the customer present."), !aiRun && /*#__PURE__*/React.createElement(Btn, {
    small: true,
    disabled: !allDone,
    onClick: runAiChecks,
    style: {
      marginTop: 12
    }
  }, "Run checks"), aiRun === "running" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: "flex",
      alignItems: "center",
      gap: 9,
      color: T.blue,
      fontWeight: 700,
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 12,
      height: 12,
      border: `2.5px solid ${T.blue}`,
      borderTopColor: "transparent",
      borderRadius: 99,
      animation: "spin .7s linear infinite"
    }
  }), "Scanning application against fraud and consistency rules…"), Array.isArray(aiRun) && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 12,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, aiRun.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      gap: 9,
      alignItems: "flex-start",
      fontSize: 12.5,
      lineHeight: 1.5,
      fontWeight: 600,
      color: c.ok ? T.inkSoft : T.amber
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      fontWeight: 800,
      color: c.ok ? T.accentDeep : T.amber
    }
  }, c.ok ? "✓" : "⚠"), c.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.inkFaint,
      marginTop: 4
    }
  }, aiRun.every(c => c.ok) ? "No anomalies — clean handoff to ops." : "Flags don't block submission — they travel with the application so ops sees them first."))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    onClick: submit,
    disabled: !allDone,
    style: {
      width: "100%"
    }
  }, allDone ? online ? "Submit to backoffice" : "Save — will sync when online" : "Complete all sections to submit")));
}
