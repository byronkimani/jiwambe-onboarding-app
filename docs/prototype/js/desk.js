function StateTag({
  state
}) {
  const m = STATE_META[state] || {
    label: state,
    tone: "wait"
  };
  const tones = {
    act: {
      bg: T.accentSoft,
      fg: T.accentDeep
    },
    wait: {
      bg: T.amberBg,
      fg: T.amber
    },
    done: {
      bg: T.ink,
      fg: T.mint
    }
  };
  const s = tones[m.tone];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      padding: "4px 10px",
      borderRadius: 999,
      background: s.bg,
      color: s.fg,
      whiteSpace: "nowrap"
    }
  }, m.label);
}
function LifelineStrip({
  state
}) {
  const idx = LIFECYCLE.indexOf(state);
  const shown = LIFECYCLE.slice(1); // skip DRAFT for officer view
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      margin: "14px 0 4px",
      flexWrap: "wrap"
    }
  }, shown.map((s, i) => {
    const realIdx = i + 1;
    const done = realIdx < idx,
      current = realIdx === idx;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: s
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 99,
        background: done ? T.accent : current ? T.amber : T.line,
        animation: current ? "pulseDot 1.6s infinite" : "none"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        fontFamily: MONO,
        fontWeight: 600,
        color: done ? T.accentDeep : current ? T.amber : T.inkFaint,
        letterSpacing: 0.3
      }
    }, s.replace(/_/g, " "))), i < shown.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 1.5,
        background: done ? T.accent : T.line,
        flexShrink: 0
      }
    }));
  }));
}
const BOARD_COLS = [{
  state: "OPS_REVIEW",
  label: "Ops review"
}, {
  state: "LMS_CREATED",
  label: "Agreement"
}, {
  state: "READY_FOR_RELEASE",
  label: "Release"
}];
const MODEL_PILL = {
  FLEET: {
    label: "Fleet · Bolt",
    bg: T.blueBg,
    fg: T.blue
  },
  STAGE: {
    label: "Offline · Stage",
    bg: T.slateBg,
    fg: T.inkSoft
  },
  DELIVERY: {
    label: "Delivery",
    bg: T.amberBg,
    fg: T.amber
  },
  PERSONAL: {
    label: "Personal Use",
    bg: T.offlineBg,
    fg: T.offline
  }
};
const STAMP = {
  OPS_REVIEW: {
    label: "Pending review",
    c: T.kraftInk
  },
  LMS_CREATED: {
    label: "Approved",
    c: T.accent
  },
  AGREEMENT_SIGNED: {
    label: "Signed",
    c: T.accent
  },
  READY_FOR_RELEASE: {
    label: "Ready to release",
    c: T.accent
  },
  ACTIVE_LOAN: {
    label: "Released",
    c: T.slate
  },
  PAUSED: {
    label: "Paused",
    c: T.amber
  },
  DISQUALIFIED: {
    label: "Disqualified",
    c: T.red
  }
};

// stylised ID card — stands in for the captured document thumbnail
function IdMini({
  w = 96
}) {
  const h = Math.round(w * 0.72);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: w,
      height: h,
      borderRadius: 8,
      background: "#E9F0EA",
      border: `1px solid ${T.line}`,
      flexShrink: 0,
      padding: 6,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      width: "58%",
      borderRadius: 2,
      background: T.accent,
      opacity: 0.28
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      borderRadius: 5,
      border: `1px solid ${T.accent}33`,
      background: "#DEE9E1",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 40 28",
    style: {
      width: "62%",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "20",
    cy: "10",
    r: "6.5",
    fill: T.accent,
    opacity: "0.38"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 28 Q20 15 35 28 Z",
    fill: T.accent,
    opacity: "0.38"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      height: 2.5,
      flex: 1,
      borderRadius: 2,
      background: T.accent,
      opacity: 0.18
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 2.5,
      flex: 2,
      borderRadius: 2,
      background: T.accent,
      opacity: 0.18
    }
  })));
}
function StampMark({
  state,
  small
}) {
  const s = STAMP[state] || {
    label: state,
    c: T.kraftInk
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      transform: "rotate(-7deg)",
      border: `2px solid ${s.c}`,
      color: s.c,
      borderRadius: 4,
      padding: small ? "3px 9px" : "5px 13px",
      fontSize: small ? 9.5 : 11,
      fontWeight: 800,
      letterSpacing: small ? 1 : 1.4,
      textTransform: "uppercase",
      fontFamily: BODY,
      opacity: 0.75,
      whiteSpace: "nowrap",
      flexShrink: 0
    }
  }, s.label);
}
function Dashed() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1.5px dashed ${T.lineStrong}`,
      margin: "13px 0"
    }
  });
}
function FRow({
  k,
  v,
  tick
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 12,
      padding: "3.5px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: T.inkSoft,
      fontWeight: 500
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontFamily: MONO,
      fontWeight: 600,
      color: T.ink,
      textAlign: "right"
    }
  }, v, tick && /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.accent,
      fontWeight: 800
    }
  }, " ✓")));
}
function AppFolder({
  a,
  onOpen,
  i,
  compact
}) {
  const meta = STATE_META[a.state] || {};
  const pill = MODEL_PILL[a.opModel] || MODEL_PILL.FLEET;
  const actionable = !!meta.action && a.state !== "ACTIVE_LOAN" && a.state !== "DISQUALIFIED" && a.state !== "PAUSED";
  const clickable = !!onOpen;
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      animationDelay: `${i * 55}ms`,
      marginBottom: compact ? 12 : 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingLeft: 10,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.kraft,
      borderTop: `1px solid ${T.kraftEdge}`,
      borderLeft: `1px solid ${T.kraftEdge}`,
      borderRight: `1px solid ${T.kraftEdge}`,
      borderRadius: "9px 9px 0 0",
      padding: compact ? "5px 12px 5px" : "7px 16px 6px",
      fontFamily: MONO,
      fontSize: compact ? 11 : 12.5,
      fontWeight: 700,
      color: T.kraftInk,
      letterSpacing: 1
    }
  }, a.id), actionable && /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.accentDeep,
      color: "#fff",
      borderRadius: "7px 7px 0 0",
      padding: compact ? "4px 9px" : "5px 12px",
      fontSize: compact ? 9 : 10,
      fontWeight: 800,
      letterSpacing: 0.8,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 99,
      background: T.mint,
      animation: "pulseDot 1.6s infinite"
    }
  }), "ACTION NEEDED")), /*#__PURE__*/React.createElement("div", {
    className: clickable ? "jw-tap" : "",
    onClick: clickable ? () => onOpen(a) : undefined,
    style: {
      cursor: clickable ? "pointer" : "default",
      background: T.kraft,
      border: `1px solid ${T.kraftEdge}`,
      borderRadius: "0 12px 12px 12px",
      padding: compact ? 7 : 10,
      boxShadow: "0 2px 10px rgba(80,64,26,0.10)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.sheet,
      borderRadius: 8,
      padding: compact ? "13px 14px" : "16px 18px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: DISPLAY,
      fontSize: compact ? 15 : 17.5,
      color: T.accentDeep
    }
  }, "Jiwambe"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: compact ? 8 : 9.5,
      fontWeight: 800,
      letterSpacing: 1.3,
      color: T.inkFaint
    }
  }, "LOAN APPLICATION")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 2,
      background: T.accentDeep,
      marginTop: 7,
      marginBottom: compact ? 11 : 14,
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: compact ? 11 : 14,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(IdMini, {
    w: compact ? 66 : 96
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: DISPLAY,
      fontSize: compact ? 15.5 : 19,
      color: T.ink,
      lineHeight: 1.22
    }
  }, a.name), !compact && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: 12,
      color: T.inkFaint,
      marginTop: 5
    }
  }, "ID ", a.nid), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: MONO,
      fontSize: compact ? 11 : 12,
      color: T.inkFaint,
      marginTop: compact ? 3 : 0
    }
  }, a.phone), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      marginTop: 8,
      background: pill.bg,
      color: pill.fg,
      fontSize: compact ? 10.5 : 11.5,
      fontWeight: 700,
      padding: "4px 11px",
      borderRadius: 999
    }
  }, pill.label))), /*#__PURE__*/React.createElement(Dashed, null), /*#__PURE__*/React.createElement(FRow, {
    k: "Product",
    v: a.product
  }), !compact && /*#__PURE__*/React.createElement(FRow, {
    k: "Principal",
    v: fmtKES(a.principal)
  }), /*#__PURE__*/React.createElement(FRow, {
    k: "Deposit",
    v: fmtKES(a.deposit),
    tick: true
  }), /*#__PURE__*/React.createElement(FRow, {
    k: "Daily",
    v: fmtKES(a.daily)
  }), !compact && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Dashed, null), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      fontWeight: 800,
      letterSpacing: 1.1,
      color: T.inkFaint
    }
  }, "FILED BY"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: T.ink,
      marginTop: 4
    }
  }, a.officer), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.inkFaint,
      marginTop: 1
    }
  }, a.officerRole), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      color: T.inkSoft,
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "12",
    height: "12",
    fill: "none",
    stroke: T.inkFaint,
    strokeWidth: "2.2"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "2.4"
  })), a.station)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      marginTop: compact ? 12 : 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      alignSelf: "flex-start",
      fontSize: compact ? 10.5 : 12,
      fontWeight: 700,
      padding: "5px 12px",
      borderRadius: 999,
      background: a.flag ? T.amberBg : T.accentSoft,
      color: a.flag ? T.amber : T.accentDeep
    }
  }, a.flag || "clean"), !compact && a.since && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: T.inkFaint,
      fontWeight: 600
    }
  }, a.since)), /*#__PURE__*/React.createElement(StampMark, {
    state: a.state,
    small: compact
  })), !compact && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Dashed, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontFamily: MONO,
      fontSize: 11.5,
      color: T.inkFaint
    }
  }, /*#__PURE__*/React.createElement("span", null, a.submittedAt), /*#__PURE__*/React.createElement("span", null, a.term))))));
}

// ————— worklist —————

function Worklist({
  apps,
  onOpen,
  onNew,
  onDemoAdvance,
  viewMode,
  setViewMode,
  onHistory,
  onDrafts
}) {
  const drafts = apps.filter(a => a.state === "PAUSED");
  const done = apps.filter(a => a.state === "ACTIVE_LOAN");
  const live = apps.filter(a => a.state !== "ACTIVE_LOAN" && a.state !== "DISQUALIFIED" && a.state !== "PAUSED");
  const open = a => STATE_META[a.state]?.action ? onOpen(a) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: viewMode === "board" ? 1280 : 720,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 14,
      marginBottom: 20,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 27,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 4px"
    }
  }, "Loan applications"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkSoft,
      fontSize: 14,
      margin: 0
    }
  }, "Every file you've opened — pick up whichever one is waiting on you.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 10,
      padding: 3
    }
  }, [["board", "Board"], ["list", "List"]].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    className: "jw-tap",
    onClick: () => setViewMode(k),
    style: {
      padding: "7px 14px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontFamily: BODY,
      fontSize: 12.5,
      fontWeight: 700,
      background: viewMode === k ? T.ink : "transparent",
      color: viewMode === k ? "#fff" : T.inkSoft
    }
  }, l))), /*#__PURE__*/React.createElement(Btn, {
    onClick: onNew
  }, "+ New application"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginBottom: 22,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onDrafts,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: T.card,
      border: `1px solid ${drafts.length ? T.amber : T.line}`,
      borderRadius: 12,
      padding: "10px 14px",
      cursor: "pointer",
      fontFamily: BODY
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: drafts.length ? T.amber : T.inkFaint,
      fontFamily: MONO,
      lineHeight: 1
    }
  }, drafts.length), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12.5,
      fontWeight: 700,
      color: T.ink
    }
  }, "paused drafts"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12,
      color: T.accentDeep,
      fontWeight: 700
    }
  }, "View drafts →"))), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: onHistory,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 12,
      padding: "10px 14px",
      cursor: "pointer",
      fontFamily: BODY
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: T.accentDeep,
      fontFamily: MONO,
      lineHeight: 1
    }
  }, done.length), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12.5,
      fontWeight: 700,
      color: T.ink
    }
  }, "completed this month"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12,
      color: T.accentDeep,
      fontWeight: 700
    }
  }, "View history →")))), viewMode === "board" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16,
      alignItems: "start"
    }
  }, BOARD_COLS.map(col => {
    const rows = apps.filter(a => a.state === col.state);
    return /*#__PURE__*/React.createElement("div", {
      key: col.state
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingLeft: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        fontWeight: 800,
        color: T.ink,
        letterSpacing: 0.3
      }
    }, col.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        fontFamily: MONO,
        color: T.inkFaint,
        background: T.card,
        border: `1px solid ${T.line}`,
        borderRadius: 99,
        padding: "1px 7px"
      }
    }, rows.length)), rows.map((a, i) => /*#__PURE__*/React.createElement(AppFolder, {
      key: a.id,
      a: a,
      i: i,
      compact: true,
      onOpen: open
    })), rows.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        background: T.cardDeep,
        border: `1.5px dashed ${T.lineStrong}`,
        borderRadius: 12,
        padding: "22px 14px",
        textAlign: "center",
        fontSize: 12.5,
        color: T.inkFaint
      }
    }, "Nothing here"), col.state === "OPS_REVIEW" && rows.map(a => /*#__PURE__*/React.createElement("button", {
      key: a.id + "-d",
      className: "jw-tap",
      onClick: () => onDemoAdvance(a.id, "LMS_CREATED"),
      style: {
        display: "block",
        width: "100%",
        marginBottom: 10,
        background: "none",
        border: `1px dashed ${T.lineStrong}`,
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 11,
        fontWeight: 700,
        color: T.slate,
        cursor: "pointer",
        fontFamily: BODY
      }
    }, "▶ Demo: ops approves ", a.id, " → LMS")));
  })) : /*#__PURE__*/React.createElement("div", null, live.map((a, i) => /*#__PURE__*/React.createElement(AppFolder, {
    key: a.id,
    a: a,
    i: i,
    onOpen: open
  })), live.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.cardDeep,
      border: `1.5px dashed ${T.lineStrong}`,
      borderRadius: 14,
      padding: 30,
      textAlign: "center",
      fontSize: 13.5,
      color: T.inkFaint
    }
  }, "No open files. Start a new application when you're with a customer."), live.filter(a => a.state === "OPS_REVIEW").map(a => /*#__PURE__*/React.createElement("button", {
    key: a.id + "-d",
    className: "jw-tap",
    onClick: () => onDemoAdvance(a.id, "LMS_CREATED"),
    style: {
      background: "none",
      border: `1px dashed ${T.lineStrong}`,
      borderRadius: 8,
      padding: "6px 11px",
      fontSize: 11.5,
      fontWeight: 700,
      color: T.slate,
      cursor: "pointer",
      fontFamily: BODY,
      marginBottom: 10
    }
  }, "▶ Demo: ops approves ", a.id, " → LMS"))));
}

// ————— drafts —————

function DraftsScreen({
  apps,
  onOpen,
  onBack
}) {
  const drafts = apps.filter(a => a.state === "PAUSED");
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 720,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 27,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 4px"
    }
  }, "Draft applications"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkSoft,
      fontSize: 14,
      margin: "0 0 22px"
    }
  }, "Paused files, saved mid-flow. Resume to continue — the TAT clock restarts and any released bike is re-assigned at the bike stage."), drafts.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.cardDeep,
      border: `1.5px dashed ${T.lineStrong}`,
      borderRadius: 14,
      padding: 30,
      textAlign: "center",
      fontSize: 13.5,
      color: T.inkFaint
    }
  }, "No paused drafts. Files you pause mid-capture land here."), drafts.map((a, i) => /*#__PURE__*/React.createElement("div", {
    key: a.id
  }, /*#__PURE__*/React.createElement(AppFolder, {
    a: a,
    i: i,
    onOpen: onOpen
  }), a.pauseReason && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: "-8px 0 18px 12px",
      fontSize: 12.5,
      color: T.inkSoft,
      background: T.amberBg,
      borderRadius: 10,
      padding: "9px 12px",
      lineHeight: 1.5
    }
  }, /*#__PURE__*/React.createElement("b", null, "Paused:"), " ", a.pauseReason))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onBack
  }, "← Worklist")));
}

// ————— history —————

function HistoryScreen({
  apps,
  onOpen,
  onBack
}) {
  const [q, setQ] = useState("");
  const done = apps.filter(a => a.state === "ACTIVE_LOAN" || a.state === "DISQUALIFIED");
  const term = q.trim().toLowerCase();
  const results = term ? done.filter(a => [a.name, a.id, a.lmsId, a.phone, a.bike && a.bike.reg].filter(Boolean).some(v => v.toLowerCase().includes(term))) : done;
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 720,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 27,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 4px"
    }
  }, "History"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: T.inkSoft,
      fontSize: 14,
      margin: "0 0 18px"
    }
  }, "Closed files. Search by name, ID, phone, LMS record, or bike registration."), /*#__PURE__*/React.createElement("input", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      marginBottom: 20
    },
    placeholder: "Search closed files…",
    value: q,
    onChange: e => setQ(e.target.value)
  }), results.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.cardDeep,
      border: `1.5px dashed ${T.lineStrong}`,
      borderRadius: 14,
      padding: 30,
      textAlign: "center",
      fontSize: 13.5,
      color: T.inkFaint
    }
  }, term ? `Nothing matches "${q}".` : "No closed files yet."), results.map((a, i) => /*#__PURE__*/React.createElement(AppFolder, {
    key: a.id,
    a: a,
    i: i,
    onOpen: onOpen
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onBack
  }, "← Worklist")));
}
