function stageFromQuery() {
  const p = new URLSearchParams(location.search).get("stage");
  return STAGES.some(s => s.k === p) ? p : "readiness";
}

function CaptureApp() {
  const [stage, setStage] = useState(stageFromQuery);
  const [form, setForm] = useState(emptyForm());
  const [submitted, setSubmitted] = useState(false);
  const [modal, setModal] = useState(null);
  const [online] = useState(true);
  const [inventory] = useState(seedInventory);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const goto = k => setStage(k);
  const noopDraft = () => setModal(null);
  const completeMap = useMemo(() => ({
    readiness: READINESS_ITEMS.every(it => (form.readiness || {})[it.k]),
    identity: !!(form.name && form.phone && form.idNo && form.kraPin && form.gender && form.dob && form.county && form.subCounty && form.area && form.landmark && form.email && form.photo && form.docs.idFront && form.docs.idBack && form.docs.kraCert),
    dl: (() => {
      const s = form.dlSituation;
      if (s === "smart") return !!(form.dlNumber && form.docs.dlFront && form.docs.dlBack);
      if (s === "pdl") return !!(form.dlNumber && form.docs.dlFront);
      if (s === "processing") return !!(form.dlNumber && form.docs.dlFront && form.docs.pelezaDl);
      return false;
    })(),
    cogc: (() => {
      const s = form.cogcSituation;
      if (s === "have") return !!form.docs.cogcDoc;
      if (s === "peleza") return !!form.docs.pelezaCogc;
      if (s === "fingerprints") return true;
      return false;
    })(),
    references: form.references.every(r => r.name && r.id && r.phone && r.relationship && r.called) && form.refConsent,
    model: (() => {
      const m = form.opModel;
      if (m === "FLEET") return form.boltActive === "yes";
      if (m === "STAGE") return !!(form.stageName && form.chairName && form.chairPhone && form.chairCalled && form.chairOutcome === "confirmed");
      if (m === "DELIVERY") return !!(form.worksPlatform === "yes" && form.platformName && form.platformContact && form.verifyConsent && form.docs.consentDoc);
      if (m === "PERSONAL") return !!(form.isEmployed && form.verifyConsent && (form.isEmployed === "no" || form.employerName && form.employerContact && form.docs.consentDoc));
      return false;
    })(),
    product: (() => {
      if (!form.productId || !form.term || !form.stkVerified) return false;
      const deposit = form.deposit == null ? minDeposit(form.opModel) : form.deposit;
      return deposit >= minDeposit(form.opModel);
    })(),
    bike: !!form.bikeReg
  }), [form]);

  const captureScreens = {
    readiness: React.createElement(ReadinessScreen, { form, set, goto, onExit: () => { location.href = "desk.html"; } }),
    lookup: React.createElement(LookupScreen, { form, setForm, goto }),
    identity: React.createElement(IdentityScreen, { form, set, goto }),
    dl: React.createElement(DlScreen, { form, set, goto, onSaveDraft: noopDraft }),
    cogc: React.createElement(CogcScreen, { form, set, goto, onSaveDraft: noopDraft }),
    references: React.createElement(ReferencesScreen, { form, set, goto }),
    model: React.createElement(ModelScreen, { form, set, goto, onSaveDraft: noopDraft, onTerminate: noopDraft }),
    product: React.createElement(ProductScreen, { form, set, goto }),
    bike: React.createElement(BikeScreen, { form, set, goto, inventory }),
    review: React.createElement(ReviewScreen, {
      form,
      completeMap,
      submit: () => setSubmitted(true),
      submitted,
      online,
      goto,
      onExit: () => { location.href = "desk.html"; }
    })
  };

  return React.createElement("div", {
    style: { minHeight: "100vh", background: T.paper, fontFamily: BODY, display: "flex", flexDirection: "column" }
  },
    React.createElement(FlowNav, { current: "capture" }),
    React.createElement(GlobalStyle, null),
    React.createElement(TopBar, {
      online: online,
      setOnline: () => {},
      queue: [],
      officer: OFFICER_NAME,
      customerName: form.name || "New application",
      onBack: () => { location.href = "desk.html"; },
      unread: 0,
      onBell: () => {},
      onProfile: () => {}
    }),
    modal === "pause" && React.createElement(ReasonModal, {
      title: "Pause application",
      prompt: "The application will be saved as paused and moved to your worklist. Any bike picked here is not yet reserved, so nothing is lost.",
      confirmLabel: "Pause",
      onConfirm: () => setModal(null),
      onCancel: () => setModal(null)
    }),
    modal === "disqualify" && React.createElement(ReasonModal, {
      title: "Disqualify application",
      tone: "danger",
      prompt: "This is terminal. The application is closed and cannot be resumed.",
      confirmLabel: "Disqualify",
      onConfirm: () => setModal(null),
      onCancel: () => setModal(null)
    }),
    React.createElement("div", { style: { display: "flex", flex: 1, minHeight: 0 } },
      React.createElement(StepRail, {
        stages: STAGES,
        active: stage,
        setActive: goto,
        completeMap,
        unlocked: true,
        opModel: form.opModel
      }),
      React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "32px 36px" } },
        stage !== "readiness" && stage !== "lookup" && React.createElement("div", {
          style: { display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8, maxWidth: 760, marginLeft: "auto", marginRight: "auto" }
        },
          React.createElement("button", {
            className: "jw-tap",
            onClick: () => setModal("pause"),
            style: { background: "none", border: `1.5px solid ${T.lineStrong}`, borderRadius: 10, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, color: T.inkSoft, cursor: "pointer", fontFamily: BODY }
          }, "⏸ Pause application"),
          React.createElement("button", {
            className: "jw-tap",
            onClick: () => setModal("disqualify"),
            style: { background: "none", border: "none", color: T.red, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: BODY, padding: "8px 6px" }
          }, "Disqualify")
        ),
        captureScreens[stage]
      )
    )
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(CaptureApp, null));
