// ————— top bar: connectivity + sync ledger (signature element) —————

function TopBar({
  online,
  setOnline,
  queue,
  officer,
  customerName,
  onBack,
  unread,
  onBell,
  onProfile
}) {
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    if (online && queue.length > 0) {
      setSyncing(true);
      const t = setTimeout(() => setSyncing(false), 1400);
      return () => clearTimeout(t);
    }
  }, [online]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 62,
      flexShrink: 0,
      borderBottom: `1px solid ${T.line}`,
      background: T.card,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 22px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onBack,
    style: {
      background: T.slateBg,
      border: "none",
      borderRadius: 10,
      width: 36,
      height: 36,
      cursor: "pointer",
      fontSize: 16,
      color: T.ink,
      fontFamily: BODY,
      fontWeight: 700
    }
  }, "←") : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 9,
      background: T.accentDeep,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 800,
      fontSize: 14,
      fontFamily: DISPLAY
    }
  }, "J"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: T.ink,
      lineHeight: 1.2
    }
  }, customerName || "New application"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: T.inkFaint
    }
  }, "Officer: ", officer))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, onBell && /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onBell,
    style: {
      position: "relative",
      width: 38,
      height: 38,
      borderRadius: 12,
      background: T.slateBg,
      border: "none",
      cursor: "pointer",
      fontSize: 16
    }
  }, "🔔", unread > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -5,
      right: -5,
      background: T.accent,
      color: "#fff",
      fontSize: 10,
      fontWeight: 800,
      minWidth: 17,
      height: 17,
      borderRadius: 99,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 4px",
      fontFamily: BODY
    }
  }, unread)), queue.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "6px 12px",
      borderRadius: 999,
      background: syncing ? T.blueBg : T.offlineBg,
      color: syncing ? T.blue : T.offline,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: MONO
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 99,
      background: "currentColor",
      animation: online && !syncing ? "none" : "pulseDot 1.2s infinite"
    }
  }), syncing ? "Syncing…" : `${queue.length} record${queue.length > 1 ? "s" : ""} queued`), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => setOnline(!online),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "7px 14px",
      borderRadius: 999,
      cursor: "pointer",
      fontFamily: BODY,
      border: `1.5px solid ${online ? T.line : T.offline}`,
      background: online ? T.slateBg : T.offlineBg,
      color: online ? T.inkSoft : T.offline,
      fontSize: 12.5,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      background: online ? T.mint : T.offline
    }
  }), online ? "Online" : "Offline (demo)"), onProfile && /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onProfile,
    title: "Profile",
    style: {
      width: 38,
      height: 38,
      borderRadius: 99,
      background: T.accentDeep,
      color: "#fff",
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 800,
      fontFamily: BODY
    }
  }, officer.split(" ").map(w => w[0]).join("").slice(0, 2))));
}

// ————— notifications panel —————

function NotifPanel({
  notifs,
  onOpen,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 80
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "fadeUp",
    style: {
      position: "absolute",
      top: 68,
      right: 20,
      width: 360,
      maxWidth: "calc(100vw - 32px)",
      maxHeight: "70vh",
      overflowY: "auto",
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      boxShadow: "0 18px 48px -12px rgba(22,24,29,0.28)",
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      padding: "10px 12px 6px"
    }
  }, "Notifications"), notifs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 12px 18px",
      fontSize: 13,
      color: T.inkFaint
    }
  }, "Nothing yet — you'll see it here when an application comes back to you."), notifs.map(n => /*#__PURE__*/React.createElement("button", {
    key: n.id,
    className: "jw-tap",
    onClick: () => onOpen(n),
    style: {
      display: "flex",
      gap: 11,
      width: "100%",
      textAlign: "left",
      padding: "11px 12px",
      borderRadius: 12,
      background: n.unread ? T.accentSoft : "transparent",
      border: "none",
      cursor: "pointer",
      fontFamily: BODY,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 99,
      marginTop: 6,
      flexShrink: 0,
      background: n.unread ? T.accent : "transparent"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 13.5,
      fontWeight: 700,
      color: T.ink
    }
  }, n.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12.5,
      color: T.inkSoft,
      marginTop: 2,
      lineHeight: 1.45
    }
  }, n.body), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 11,
      color: T.inkFaint,
      marginTop: 4
    }
  }, n.time))))));
}

function StepRail({
  stages,
  active,
  setActive,
  completeMap,
  unlocked,
  opModel
}) {
  const [collapsed, setCollapsed] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: collapsed ? 64 : 236,
      flexShrink: 0,
      background: T.rail,
      padding: collapsed ? "20px 10px" : "20px 12px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      transition: "width .22s cubic-bezier(.2,.7,.2,1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, stages.map(s => {
    const done = completeMap[s.k];
    const isActive = active === s.k;
    const locked = !unlocked;
    return /*#__PURE__*/React.createElement("button", {
      key: s.k,
      className: "jw-tap",
      disabled: locked,
      onClick: () => setActive(s.k),
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: 12,
        padding: collapsed ? "12px 0" : "12px 13px",
        marginBottom: 3,
        background: isActive ? T.railCard : "transparent",
        border: "none",
        borderRadius: 12,
        cursor: locked ? "default" : "pointer",
        textAlign: "left"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 99,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 800,
        fontFamily: MONO,
        background: done ? T.mint : isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
        color: done ? T.accentDeep : "#fff"
      }
    }, done ? "✓" : s.n), !collapsed && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: isActive ? 700 : 500,
        color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
        whiteSpace: "nowrap"
      }
    }, s.label));
  })), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => setCollapsed(!collapsed),
    title: collapsed ? "Expand" : "Collapse",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: collapsed ? "center" : "flex-start",
      gap: 10,
      background: "rgba(255,255,255,0.07)",
      border: "none",
      borderRadius: 12,
      padding: "11px 13px",
      cursor: "pointer",
      color: "rgba(255,255,255,0.75)",
      fontFamily: BODY,
      fontSize: 12.5,
      fontWeight: 700,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, collapsed ? "»" : "«"), !collapsed && "Collapse"));
}

// ————— screens —————

function ReasonModal({
  title,
  prompt,
  confirmLabel,
  tone,
  onConfirm,
  onCancel
}) {
  const [reason, setReason] = useState("");
  const ok = reason.trim().length >= 6;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onCancel,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(12,13,16,0.5)",
      zIndex: 95,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "fadeUp",
    style: {
      width: "100%",
      maxWidth: 440,
      background: T.card,
      borderRadius: 18,
      padding: 22
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 20,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 6px"
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: T.inkSoft,
      margin: "0 0 16px",
      lineHeight: 1.5
    }
  }, prompt), /*#__PURE__*/React.createElement("textarea", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      minHeight: 84,
      resize: "vertical"
    },
    placeholder: "Reason (required, min 6 chars)…",
    value: reason,
    onChange: e => setReason(e.target.value),
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onCancel,
    style: {
      flex: 1
    }
  }, "Cancel"), /*#__PURE__*/React.createElement(Btn, {
    danger: tone === "danger",
    disabled: !ok,
    onClick: () => onConfirm(reason.trim()),
    style: {
      flex: 1,
      ...(tone === "danger" ? {} : {})
    }
  }, confirmLabel))));
}
function StageShell({
  title,
  sub,
  children,
  onNext,
  onBack,
  nextLabel,
  nextDisabled,
  onPause,
  onDisqualify
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 760,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 27,
      color: T.ink,
      margin: "0 0 4px",
      fontWeight: 400
    }
  }, title), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkSoft,
      fontSize: 14,
      margin: "0 0 26px",
      lineHeight: 1.5
    }
  }, sub), children, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 30,
      alignItems: "center"
    }
  }, onBack && /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onBack
  }, "← Back"), onNext && /*#__PURE__*/React.createElement(Btn, {
    onClick: onNext,
    disabled: nextDisabled,
    style: {
      flex: 1,
      maxWidth: 240
    }
  }, nextLabel || "Continue"), (onPause || onDisqualify) && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), onPause && /*#__PURE__*/React.createElement("button", {
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
      padding: "11px 8px"
    }
  }, "Disqualify")));
}
function SectionCard({
  title,
  hint,
  children,
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: tone === "soft" ? T.cardDeep : T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: 18,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 800,
      color: T.inkFaint,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: hint ? 5 : 14
    }
  }, title), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      marginBottom: 14,
      lineHeight: 1.5
    }
  }, hint), children);
}
function ExitCard({
  tone,
  title,
  body,
  actionLabel,
  onAction,
  steps
}) {
  const c = tone === "danger" ? {
    bg: T.redBg,
    fg: T.red
  } : {
    bg: T.amberBg,
    fg: T.amber
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      marginTop: 16,
      background: c.bg,
      borderRadius: 14,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 14.5,
      color: c.fg
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 6,
      lineHeight: 1.55
    }
  }, body), steps && /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: "12px 0 0",
      paddingLeft: 18,
      fontSize: 12.5,
      color: T.inkSoft,
      lineHeight: 1.7
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, s))), /*#__PURE__*/React.createElement(Btn, {
    onClick: onAction,
    style: {
      marginTop: 14,
      background: c.fg
    }
  }, actionLabel));
}
