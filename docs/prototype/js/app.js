function App() {
  const [auth, setAuth] = useState("login"); // login | otp | in
  const [authEmail, setAuthEmail] = useState("");
  const [view, setView] = useState("worklist"); // worklist | capture | profile
  const [viewMode, setViewMode] = useState("board");
  const [notifs, setNotifs] = useState([{
    id: "n1",
    appId: "A-1042",
    title: "A-1042 returned to you",
    body: "James Mwangi Kariuki — approved by ops and created in the LMS. Generate the agreement.",
    time: "1h ago",
    unread: true
  }, {
    id: "n2",
    appId: "A-1038",
    title: "A-1038 ready for release",
    body: "Susan Wambui Njeri — bike assigned and insured. Complete the OTP handover.",
    time: "Yesterday",
    unread: true
  }]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [apps, setApps] = useState(seedApps);
  const [inventory, setInventory] = useState(seedInventory);
  const [openId, setOpenId] = useState(null);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState([]);

  // capture wizard state
  const [stage, setStage] = useState("lookup");
  const [form, setForm] = useState(emptyForm());
  const [submitted, setSubmitted] = useState(false);
  const [modal, setModal] = useState(null); // null | 'pause' | 'disqualify'

  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const goto = k => setStage(k);
  const openApp = apps.find(a => a.id === openId);
  const action = openApp ? STATE_META[openApp.state]?.action : null;
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
  const startNew = () => {
    setForm(emptyForm());
    setStage("readiness");
    setSubmitted(false);
    setView("capture");
  };
  const captureEntry = (state, extra) => {
    const product = PRODUCTS.find(p => p.id === form.productId);
    const deposit = form.deposit == null ? minDeposit(form.opModel) : form.deposit;
    const daily = product ? calcDaily(assetPrice(product, form.assetType), deposit, form.term) : 0;
    const now = new Date();
    const pad = n => String(n).padStart(2, "0");
    return {
      id: "A-" + (1050 + apps.length),
      name: form.name || "Unnamed applicant",
      phone: form.phone,
      nid: form.idNo || "—",
      opModel: form.opModel,
      state,
      lmsId: null,
      product: product ? product.label + (form.assetType === "used" ? " (pre-owned)" : " (new)") : "—",
      principal: product ? assetPrice(product, form.assetType) : 0,
      term: form.term + " months",
      deposit,
      daily,
      flag: form.cogcSituation === "fingerprints" ? "COGC pending" : null,
      officer: OFFICER_NAME,
      officerRole: OFFICER_ROLE,
      station: OFFICER_DEALERSHIP,
      submittedAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      opsNote: null,
      bike: null,
      since: "Just now",
      ...extra
    };
  };
  const saveDraftAndExit = reason => pauseCapture(reason);
  const terminateAndExit = reason => disqualifyCapture(reason);
  const pauseCapture = reason => {
    // releasing the reserved bike happens implicitly: capture bike isn't reserved until submit,
    // but if a bike was picked in-flight we free nothing yet (reserved only on submit).
    setApps(prev => [captureEntry("PAUSED", {
      pauseReason: reason,
      bike: null
    }), ...prev]);
    setModal(null);
    setView("worklist");
  };
  const disqualifyCapture = reason => {
    setApps(prev => [captureEntry("DISQUALIFIED", {
      disqualifyReason: reason
    }), ...prev]);
    setModal(null);
    setView("worklist");
  };

  // Pause/disqualify for an already-submitted application in post-ops flows
  const pauseApp = (id, reason) => {
    const a = apps.find(x => x.id === id);
    if (a && a.bike) setInventory(prev => prev.map(b => b.reg === a.bike.reg ? {
      ...b,
      status: "available"
    } : b));
    setApps(prev => prev.map(x => x.id === id ? {
      ...x,
      state: "PAUSED",
      pauseReason: reason,
      bike: null,
      since: "Just now"
    } : x));
    setModal(null);
    setOpenId(null);
  };
  const disqualifyApp = (id, reason) => {
    const a = apps.find(x => x.id === id);
    if (a && a.bike) setInventory(prev => prev.map(b => b.reg === a.bike.reg ? {
      ...b,
      status: "available"
    } : b));
    setApps(prev => prev.map(x => x.id === id ? {
      ...x,
      state: "DISQUALIFIED",
      disqualifyReason: reason,
      since: "Just now"
    } : x));
    setModal(null);
    setOpenId(null);
  };
  const submitCapture = () => {
    const product = PRODUCTS.find(p => p.id === form.productId);
    const deposit = form.deposit == null ? minDeposit(form.opModel) : form.deposit;
    const daily = product ? calcDaily(assetPrice(product, form.assetType), deposit, form.term) : 0;
    const bike = inventory.find(b => b.reg === form.bikeReg);
    setInventory(prev => prev.map(b => b.reg === form.bikeReg ? {
      ...b,
      status: "reserved"
    } : b));
    const entry = {
      id: "A-" + (1050 + apps.length),
      name: form.name,
      phone: form.phone,
      state: "OPS_REVIEW",
      lmsId: null,
      product: product ? product.label + (form.assetType === "used" ? " (pre-owned)" : " (new)") : "—",
      term: form.term + " months",
      bike: bike ? {
        reg: bike.reg,
        model: bike.model,
        color: bike.color,
        sticker: bike.sticker,
        stickerExpiry: bike.stickerExpiry
      } : null,
      deposit,
      daily,
      opsNote: null,
      since: online ? "Submitted just now" : "Queued offline — will sync"
    };
    setApps(prev => [entry, ...prev]);
    if (!online) setQueue(q => [...q, {
      id: Date.now(),
      name: form.name
    }]);
    setSubmitted(true);
  };
  const pushNotif = (appId, title, body) => {
    setNotifs(prev => [{
      id: "n" + Date.now(),
      appId,
      title,
      body,
      time: "Just now",
      unread: true
    }, ...prev]);
  };
  const demoAdvance = (id, newState) => {
    const a = apps.find(x => x.id === id);
    if (a && newState === "LMS_CREATED") pushNotif(id, `${id} returned to you`, `${a.name} — approved by ops and created in the LMS. Generate the agreement.`);
    setApps(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (newState === "LMS_CREATED") return {
        ...a,
        state: newState,
        lmsId: "LMS-" + Math.floor(88000 + Math.random() * 999),
        opsNote: "Approved. Insurance certificate verified.",
        since: "Returned just now"
      };
      if (newState === "READY_FOR_RELEASE") return {
        ...a,
        state: newState,
        opsNote: "Agreement executed. Ready for handover.",
        since: "Ready just now"
      };
      return {
        ...a,
        state: newState,
        since: "Just now"
      };
    }));
  };
  const advance = (id, newState) => {
    demoAdvance(id, newState);
    setOpenId(null);
  };
  const captureScreens = {
    readiness: /*#__PURE__*/React.createElement(ReadinessScreen, {
      form: form,
      set: set,
      goto: goto,
      onExit: () => setView("worklist")
    }),
    lookup: /*#__PURE__*/React.createElement(LookupScreen, {
      form: form,
      setForm: setForm,
      goto: goto
    }),
    identity: /*#__PURE__*/React.createElement(IdentityScreen, {
      form: form,
      set: set,
      goto: goto
    }),
    dl: /*#__PURE__*/React.createElement(DlScreen, {
      form: form,
      set: set,
      goto: goto,
      onSaveDraft: saveDraftAndExit
    }),
    cogc: /*#__PURE__*/React.createElement(CogcScreen, {
      form: form,
      set: set,
      goto: goto,
      onSaveDraft: saveDraftAndExit
    }),
    references: /*#__PURE__*/React.createElement(ReferencesScreen, {
      form: form,
      set: set,
      goto: goto
    }),
    model: /*#__PURE__*/React.createElement(ModelScreen, {
      form: form,
      set: set,
      goto: goto,
      onSaveDraft: saveDraftAndExit,
      onTerminate: terminateAndExit
    }),
    product: /*#__PURE__*/React.createElement(ProductScreen, {
      form: form,
      set: set,
      goto: goto
    }),
    bike: /*#__PURE__*/React.createElement(BikeScreen, {
      form: form,
      set: set,
      goto: goto,
      inventory: inventory
    }),
    review: /*#__PURE__*/React.createElement(ReviewScreen, {
      form: form,
      completeMap: completeMap,
      submit: submitCapture,
      submitted: submitted,
      online: online,
      goto: goto,
      onExit: () => setView("worklist")
    })
  };
  const inCapture = view === "capture";
  const backHandler = inCapture ? () => setView("worklist") : view === "profile" || view === "history" || view === "drafts" ? () => setView("worklist") : openApp ? () => setOpenId(null) : null;
  const unread = notifs.filter(n => n.unread).length;
  const openNotif = n => {
    setNotifs(prev => prev.map(x => x.id === n.id ? {
      ...x,
      unread: false
    } : x));
    setNotifOpen(false);
    setView("worklist");
    const target = apps.find(a => a.id === n.appId);
    if (target && STATE_META[target.state]?.action) setOpenId(target.id);
  };
  const logout = () => {
    setAuth("login");
    setAuthEmail("");
    setView("worklist");
    setOpenId(null);
    setNotifOpen(false);
  };
  if (auth === "login") return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: BODY
    }
  }, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(LoginScreen, {
    onNext: e => {
      setAuthEmail(e);
      setAuth("otp");
    }
  }));
  if (auth === "otp") return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: BODY
    }
  }, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(OtpScreen, {
    email: authEmail,
    onBack: () => setAuth("login"),
    onVerify: () => setAuth("in")
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: T.paper,
      fontFamily: BODY,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(GlobalStyle, null), /*#__PURE__*/React.createElement(TopBar, {
    online: online,
    setOnline: setOnline,
    queue: queue,
    officer: "Jane Ochieng",
    customerName: inCapture ? form.name || "New application" : view === "profile" ? "Profile" : view === "history" ? "History" : view === "drafts" ? "Drafts" : openApp ? openApp.name : "",
    onBack: backHandler,
    unread: unread,
    onBell: () => setNotifOpen(!notifOpen),
    onProfile: () => {
      setView("profile");
      setOpenId(null);
    }
  }), notifOpen && /*#__PURE__*/React.createElement(NotifPanel, {
    notifs: notifs,
    onOpen: openNotif,
    onClose: () => setNotifOpen(false)
  }), modal === "pause" && /*#__PURE__*/React.createElement(ReasonModal, {
    title: "Pause application",
    prompt: inCapture ? "The application will be saved as paused and moved to your worklist. Any bike picked here is not yet reserved, so nothing is lost." : "The application will be paused. Any assigned bike is released back to stock and must be re-assigned on resume. The TAT clock stops.",
    confirmLabel: "Pause",
    onConfirm: r => inCapture ? pauseCapture(r) : pauseApp(openApp.id, r),
    onCancel: () => setModal(null)
  }), modal === "disqualify" && /*#__PURE__*/React.createElement(ReasonModal, {
    title: "Disqualify application",
    tone: "danger",
    prompt: "This is terminal. The application is closed and cannot be resumed. Any assigned bike is released back to stock. A reason is required.",
    confirmLabel: "Disqualify",
    onConfirm: r => inCapture ? disqualifyCapture(r) : disqualifyApp(openApp.id, r),
    onCancel: () => setModal(null)
  }), inCapture ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(StepRail, {
    stages: STAGES,
    active: stage,
    setActive: goto,
    completeMap: completeMap,
    unlocked: true,
    opModel: form.opModel
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "32px 36px"
    }
  }, stage !== "readiness" && stage !== "lookup" && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      marginBottom: 8,
      maxWidth: 760,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => setModal("pause"),
    style: {
      background: "none",
      border: `1.5px solid ${T.lineStrong}`,
      borderRadius: 10,
      padding: "8px 14px",
      fontSize: 12.5,
      fontWeight: 700,
      color: T.inkSoft,
      cursor: "pointer",
      fontFamily: BODY
    }
  }, "⏸ Pause application"), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => setModal("disqualify"),
    style: {
      background: "none",
      border: "none",
      color: T.red,
      fontSize: 12.5,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: BODY,
      padding: "8px 6px"
    }
  }, "Disqualify")), captureScreens[stage])) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "32px 36px"
    }
  }, view === "profile" && /*#__PURE__*/React.createElement(ProfileView, {
    officer: "Jane Ochieng",
    email: authEmail || "jane.ochieng@contractor.jiwambe.com",
    onBack: () => setView("worklist"),
    onLogout: logout
  }), view === "history" && !openApp && /*#__PURE__*/React.createElement(HistoryScreen, {
    apps: apps,
    onOpen: a => setOpenId(a.id),
    onBack: () => setView("worklist")
  }), view === "history" && openApp && /*#__PURE__*/React.createElement(SummaryFlow, {
    app: openApp,
    onBack: () => setOpenId(null)
  }), view === "drafts" && !openApp && /*#__PURE__*/React.createElement(DraftsScreen, {
    apps: apps,
    onOpen: a => setOpenId(a.id),
    onBack: () => setView("worklist")
  }), view === "drafts" && openApp && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 560,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 24,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 6px"
    }
  }, "Resume — ", openApp.name), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkSoft,
      fontSize: 14,
      lineHeight: 1.55,
      margin: "0 0 4px"
    }
  }, "Paused application. The TAT clock resumes when you continue."), openApp.pauseReason && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      background: T.cardDeep,
      border: `1px solid ${T.line}`,
      borderRadius: 10,
      padding: "10px 12px",
      margin: "8px 0 0"
    }
  }, /*#__PURE__*/React.createElement("b", null, "Pause reason:"), " ", openApp.pauseReason), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.amber,
      fontWeight: 600,
      marginTop: 12,
      lineHeight: 1.5
    }
  }, "⚠️ The bike was released to stock on pause — you'll re-assign one when you reach the bike stage."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: () => setOpenId(null)
  }, "← Drafts"), /*#__PURE__*/React.createElement(Btn, {
    onClick: () => {
      setForm(f => ({
        ...emptyForm(),
        name: openApp.name,
        phone: openApp.phone
      }));
      setStage("identity");
      setSubmitted(false);
      setApps(prev => prev.filter(x => x.id !== openApp.id));
      setOpenId(null);
      setView("capture");
    },
    style: {
      flex: 1,
      maxWidth: 260
    }
  }, "Resume application"))), view === "worklist" && !openApp && /*#__PURE__*/React.createElement(Worklist, {
    apps: apps,
    onOpen: a => STATE_META[a.state]?.action ? setOpenId(a.id) : null,
    onNew: startNew,
    onDemoAdvance: demoAdvance,
    viewMode: viewMode,
    setViewMode: setViewMode,
    onHistory: () => {
      setView("history");
      setOpenId(null);
    },
    onDrafts: () => {
      setView("drafts");
      setOpenId(null);
    }
  }), view === "worklist" && openApp && action === "agreement" && /*#__PURE__*/React.createElement(AgreementFlow, {
    app: openApp,
    onBack: () => setOpenId(null),
    onDone: () => advance(openApp.id, "READY_FOR_RELEASE"),
    onPause: () => setModal("pause"),
    onDisqualify: () => setModal("disqualify")
  }), view === "worklist" && openApp && action === "summary" && /*#__PURE__*/React.createElement(SummaryFlow, {
    app: openApp,
    onBack: () => setOpenId(null)
  }), view === "worklist" && openApp && action === "release" && /*#__PURE__*/React.createElement(ReleaseFlow, {
    app: openApp,
    onBack: () => setOpenId(null),
    onPause: () => setModal("pause"),
    onDisqualify: () => setModal("disqualify"),
    onDefect: desc => pauseApp(openApp.id, `Defect at handover on ${openApp.bike ? openApp.bike.reg : "the bike"} — ${desc}. Replacement bike required.`),
    onDone: () => {
      if (openApp.bike) setInventory(prev => prev.map(b => b.reg === openApp.bike.reg ? {
        ...b,
        status: "assigned"
      } : b));
      advance(openApp.id, "ACTIVE_LOAN");
    }
  })));
}

ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
