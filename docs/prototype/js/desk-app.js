function appIdFromQuery() {
  return new URLSearchParams(location.search).get("app");
}

function DeskApp() {
  const [view, setView] = useState("worklist");
  const [viewMode, setViewMode] = useState("board");
  const [apps, setApps] = useState(seedApps);
  const [inventory, setInventory] = useState(seedInventory);
  const initialOpen = appIdFromQuery();
  const [openId, setOpenId] = useState(initialOpen && seedApps.some(a => a.id === initialOpen) ? initialOpen : null);
  const [online, setOnline] = useState(true);
  const [queue, setQueue] = useState([]);
  const [modal, setModal] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const openApp = apps.find(a => a.id === openId);
  const action = openApp ? STATE_META[openApp.state]?.action : null;

  const pauseApp = (id, reason) => {
    const a = apps.find(x => x.id === id);
    if (a && a.bike) {
      setInventory(prev => prev.map(b => b.reg === a.bike.reg ? { ...b, status: "available" } : b));
    }
    setApps(prev => prev.map(x => x.id === id ? { ...x, state: "PAUSED", pauseReason: reason, bike: null, since: "Just now" } : x));
    setModal(null);
    setOpenId(null);
  };
  const disqualifyApp = (id, reason) => {
    const a = apps.find(x => x.id === id);
    if (a && a.bike) {
      setInventory(prev => prev.map(b => b.reg === a.bike.reg ? { ...b, status: "available" } : b));
    }
    setApps(prev => prev.map(x => x.id === id ? { ...x, state: "DISQUALIFIED", disqualifyReason: reason, since: "Just now" } : x));
    setModal(null);
    setOpenId(null);
  };
  const demoAdvance = (id, newState) => {
    setApps(prev => prev.map(a => {
      if (a.id !== id) return a;
      if (newState === "LMS_CREATED") {
        return { ...a, state: newState, lmsId: "LMS-" + Math.floor(88000 + Math.random() * 999), opsNote: "Approved.", since: "Returned just now" };
      }
      if (newState === "READY_FOR_RELEASE") {
        return { ...a, state: newState, opsNote: "Agreement executed.", since: "Ready just now" };
      }
      return { ...a, state: newState, since: "Just now" };
    }));
  };
  const advance = (id, newState) => {
    demoAdvance(id, newState);
    setOpenId(null);
  };

  const startNew = () => { location.href = "capture.html"; };

  return React.createElement("div", {
    style: { minHeight: "100vh", background: T.paper, fontFamily: BODY, display: "flex", flexDirection: "column" }
  },
    React.createElement(FlowNav, { current: "desk" }),
    React.createElement(GlobalStyle, null),
    React.createElement(TopBar, {
      online,
      setOnline,
      queue,
      officer: OFFICER_NAME,
      customerName: openApp ? openApp.name : "",
      onBack: openApp ? () => setOpenId(null) : null,
      unread: 0,
      onBell: () => setNotifOpen(!notifOpen),
      onProfile: () => { location.href = "auth.html"; }
    }),
    notifOpen && React.createElement(NotifPanel, { notifs, onOpen: () => setNotifOpen(false), onClose: () => setNotifOpen(false) }),
    modal === "pause" && openApp && React.createElement(ReasonModal, {
      title: "Pause application",
      prompt: "The application will be paused. Any assigned bike is released back to stock.",
      confirmLabel: "Pause",
      onConfirm: r => pauseApp(openApp.id, r),
      onCancel: () => setModal(null)
    }),
    modal === "disqualify" && openApp && React.createElement(ReasonModal, {
      title: "Disqualify application",
      tone: "danger",
      prompt: "This is terminal. A reason is required.",
      confirmLabel: "Disqualify",
      onConfirm: r => disqualifyApp(openApp.id, r),
      onCancel: () => setModal(null)
    }),
    React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "32px 36px" } },
      view === "worklist" && !openApp && React.createElement(Worklist, {
        apps,
        onOpen: a => STATE_META[a.state]?.action ? setOpenId(a.id) : null,
        onNew: startNew,
        onDemoAdvance: demoAdvance,
        viewMode,
        setViewMode,
        onHistory: () => { setView("history"); setOpenId(null); },
        onDrafts: () => { setView("drafts"); setOpenId(null); }
      }),
      view === "history" && !openApp && React.createElement(HistoryScreen, {
        apps,
        onOpen: a => setOpenId(a.id),
        onBack: () => setView("worklist")
      }),
      view === "history" && openApp && React.createElement(SummaryFlow, { app: openApp, onBack: () => setOpenId(null) }),
      view === "drafts" && !openApp && React.createElement(DraftsScreen, {
        apps,
        onOpen: a => setOpenId(a.id),
        onBack: () => setView("worklist")
      }),
      view === "worklist" && openApp && action === "agreement" && React.createElement(AgreementFlow, {
        app: openApp,
        onBack: () => setOpenId(null),
        onDone: () => advance(openApp.id, "READY_FOR_RELEASE"),
        onPause: () => setModal("pause"),
        onDisqualify: () => setModal("disqualify")
      }),
      view === "worklist" && openApp && action === "summary" && React.createElement(SummaryFlow, { app: openApp, onBack: () => setOpenId(null) }),
      view === "worklist" && openApp && action === "release" && React.createElement(ReleaseFlow, {
        app: openApp,
        onBack: () => setOpenId(null),
        onPause: () => setModal("pause"),
        onDisqualify: () => setModal("disqualify"),
        onDefect: desc => pauseApp(openApp.id, `Defect at handover — ${desc}`),
        onDone: () => {
          if (openApp.bike) {
            setInventory(prev => prev.map(b => b.reg === openApp.bike.reg ? { ...b, status: "assigned" } : b));
          }
          advance(openApp.id, "ACTIVE_LOAN");
        }
      })
    )
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(DeskApp, null));
