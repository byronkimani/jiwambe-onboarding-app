/* Jiwambe Onboarding — field tablet prototype (shared tokens & atoms) */
const T = {
  ink: "#15181A",
  inkSoft: "#4A524D",
  inkFaint: "#8B928C",
  paper: "#F3F2EC",
  card: "#FFFFFF",
  cardDeep: "#FAFAF7",
  line: "#E3E1D6",
  lineStrong: "#CFCCBD",
  rail: "#123E31",
  railCard: "#17493A",
  railLine: "rgba(255,255,255,0.12)",
  accent: "#1D5C4A",
  accentDeep: "#123E31",
  accentSoft: "#E3EFE9",
  mint: "#4ED99B",
  amber: "#B07C0E",
  amberBg: "#FBF2DA",
  red: "#C03A30",
  redBg: "#FAE7E5",
  slate: "#767E79",
  slateBg: "#ECEFEC",
  blue: "#2F5FE3",
  blueBg: "#E9EEFC",
  offline: "#7C5CD9",
  offlineBg: "#EFEAFB",
  kraft: "#E8D8B2",
  kraftEdge: "#D2BC89",
  kraftInk: "#7A6438",
  sheet: "#FCFBF6"
};
const DISPLAY = "'DM Serif Display', Georgia, serif";
const BODY = "'DM Sans','Segoe UI',system-ui,sans-serif";
const MONO = "'IBM Plex Mono','SF Mono',Consolas,monospace";
const fmtKES = n => "KES " + Number(n || 0).toLocaleString("en-KE");
const GlobalStyle = () => /*#__PURE__*/React.createElement("style", null, `
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px);} to { opacity:1; transform:none;} }
    @keyframes fadeIn { from { opacity:0;} to { opacity:1;} }
    @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:.3} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
    .fadeUp { animation: fadeUp .38s cubic-bezier(.2,.7,.2,1) both; }
    .jw-tap { transition: transform .1s ease, box-shadow .1s ease, background .15s ease, border-color .15s ease; }
    .jw-tap:active { transform: scale(.98); }
    .jw-focus:focus { outline: none; border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accentSoft}; }
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb { background: ${T.lineStrong}; border-radius: 8px; }
  `);

// ————— reusable atoms —————

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 15,
  fontFamily: BODY,
  border: `1.5px solid ${T.line}`,
  borderRadius: 10,
  background: T.card,
  color: T.ink,
  outline: "none"
};
function Field({
  label,
  hint,
  required,
  children,
  span
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16,
      gridColumn: span ? "1 / -1" : undefined
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: T.inkSoft,
      marginBottom: 6,
      letterSpacing: 0.6,
      textTransform: "uppercase"
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: T.red
    }
  }, " *")), children, hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.inkFaint,
      marginTop: 5
    }
  }, hint));
}
function TextInput(props) {
  return /*#__PURE__*/React.createElement("input", {
    className: "jw-focus",
    style: inputStyle,
    ...props
  });
}
function Select({
  value,
  onChange,
  options,
  placeholder
}) {
  return /*#__PURE__*/React.createElement("select", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      appearance: "none",
      cursor: "pointer"
    },
    value: value,
    onChange: e => onChange(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder || "Select…"), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)));
}
function ChoiceRow({
  value,
  onChange,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    className: "jw-tap",
    onClick: () => onChange(o.value),
    style: {
      padding: "11px 16px",
      fontSize: 14,
      fontWeight: 700,
      borderRadius: 10,
      cursor: "pointer",
      fontFamily: BODY,
      border: `1.5px solid ${value === o.value ? T.accent : T.line}`,
      background: value === o.value ? T.accentSoft : T.card,
      color: value === o.value ? T.accentDeep : T.inkSoft
    }
  }, o.label)));
}
function Btn({
  children,
  onClick,
  disabled,
  ghost,
  small,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jw-tap",
    onClick: onClick,
    disabled: disabled,
    style: {
      padding: small ? "10px 16px" : "13px 20px",
      fontSize: small ? 13.5 : 15,
      fontWeight: 700,
      fontFamily: BODY,
      background: disabled ? T.slateBg : ghost ? "transparent" : T.accent,
      color: disabled ? T.inkFaint : ghost ? T.ink : "#fff",
      border: ghost ? `1.5px solid ${T.lineStrong}` : "none",
      borderRadius: 11,
      cursor: disabled ? "default" : "pointer",
      ...style
    }
  }, children);
}
function Checkbox({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "jw-tap",
    style: {
      display: "flex",
      gap: 11,
      alignItems: "flex-start",
      cursor: "pointer",
      padding: "12px 14px",
      borderRadius: 12,
      background: checked ? T.accentSoft : T.cardDeep,
      border: `1.5px solid ${checked ? T.accent : T.line}`
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: e => onChange(e.target.checked),
    style: {
      marginTop: 2,
      width: 17,
      height: 17,
      accentColor: T.accent,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: T.ink,
      lineHeight: 1.5,
      fontWeight: 500
    }
  }, label));
}
function Tag({
  children,
  tone
}) {
  const tones = {
    req: {
      bg: T.redBg,
      fg: T.red
    },
    ok: {
      bg: T.accentSoft,
      fg: T.accentDeep
    },
    info: {
      bg: T.slateBg,
      fg: T.inkSoft
    },
    warn: {
      bg: T.amberBg,
      fg: T.amber
    }
  };
  const s = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 800,
      padding: "3px 8px",
      borderRadius: 999,
      background: s.bg,
      color: s.fg,
      letterSpacing: 0.4
    }
  }, children);
}

// ————— AI helpers (simulated pipeline, real in-browser CV for quality) —————

function AiChip({
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 10,
      fontWeight: 800,
      padding: "3px 8px",
      borderRadius: 999,
      background: T.blueBg,
      color: T.blue,
      letterSpacing: 0.4
    }
  }, "✦ ", children);
}

// Real capture-quality analysis: Laplacian variance (blur) + near-white fraction (glare)
function analyzeImage(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const W = 160;
      const H = Math.max(1, Math.round(img.height / img.width * W));
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      const d = ctx.getImageData(0, 0, W, H).data;
      const g = new Float32Array(W * H);
      let bright = 0;
      for (let i = 0; i < W * H; i++) {
        const v = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
        g[i] = v;
        if (v > 245) bright++;
      }
      let sum = 0,
        sumSq = 0,
        n = 0;
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const i = y * W + x;
          const lap = g[i - W] + g[i + W] + g[i - 1] + g[i + 1] - 4 * g[i];
          sum += lap;
          sumSq += lap * lap;
          n++;
        }
      }
      const variance = sumSq / n - (sum / n) ** 2;
      const glarePct = bright / (W * H) * 100;
      resolve({
        sharp: variance > 60,
        glare: glarePct > 14,
        variance: Math.round(variance),
        glarePct: Math.round(glarePct)
      });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
function QualityBadge({
  q
}) {
  if (q === "checking") return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: T.blue
    }
  }, "✦ Checking quality…");
  if (!q) return null;
  if (q.sharp && !q.glare) return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: T.accentDeep
    }
  }, "✦ Sharp · no glare");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      color: T.amber
    }
  }, "⚠ ", !q.sharp ? "Possible blur" : "", !q.sharp && q.glare ? " + " : "", q.glare ? "glare detected" : "", " — inspect");
}
function PhotoSlot({
  label,
  required,
  image,
  onCapture,
  onRetake
}) {
  const inputRef = React.useRef(null);
  const [zoom, setZoom] = useState(false);
  const [quality, setQuality] = useState(null);
  const pick = () => inputRef.current && inputRef.current.click();
  const onFile = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onCapture(url);
    setQuality("checking");
    analyzeImage(url).then(setQuality);
    e.target.value = "";
  };
  const retake = () => {
    setQuality(null);
    onRetake();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: `1.5px solid ${image ? T.accent : T.line}`,
      borderRadius: 14,
      padding: 14,
      background: image ? T.accentSoft : T.cardDeep
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: "image/*",
    capture: "environment",
    onChange: onFile,
    style: {
      display: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: T.ink
    }
  }, label), /*#__PURE__*/React.createElement(Tag, {
    tone: required ? "req" : "info"
  }, required ? "Required" : "Optional")), image ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: label,
    onClick: () => setZoom(true),
    style: {
      width: "100%",
      height: 120,
      objectFit: "cover",
      borderRadius: 10,
      cursor: "zoom-in",
      border: `1px solid ${T.line}`,
      background: "#fff",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(QualityBadge, {
    q: quality
  }), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: retake,
    style: {
      background: "none",
      border: "none",
      color: T.inkSoft,
      fontSize: 12,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: BODY,
      textDecoration: "underline",
      whiteSpace: "nowrap"
    }
  }, "Retake"))) : /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: pick,
    style: {
      width: "100%",
      padding: "13px",
      borderRadius: 10,
      border: `1.5px dashed ${T.lineStrong}`,
      background: T.card,
      color: T.inkSoft,
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      fontFamily: BODY,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8
    }
  }, "📷 Capture with tablet camera"), zoom && /*#__PURE__*/React.createElement("div", {
    onClick: () => setZoom(false),
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(12,13,16,0.85)",
      zIndex: 90,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      cursor: "zoom-out"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: label,
    style: {
      maxWidth: "94%",
      maxHeight: "80%",
      borderRadius: 12,
      background: "#fff"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: e => {
      e.stopPropagation();
      setZoom(false);
      retake();
      pick();
    },
    style: {
      background: T.card,
      border: "none",
      borderRadius: 11,
      padding: "12px 20px",
      fontWeight: 700,
      fontFamily: BODY,
      fontSize: 14,
      cursor: "pointer",
      color: T.ink
    }
  }, "↺ Retake"), /*#__PURE__*/React.createElement("button", {
    className: "jw-tap",
    onClick: () => setZoom(false),
    style: {
      background: "rgba(255,255,255,0.16)",
      border: "none",
      borderRadius: 11,
      padding: "12px 20px",
      fontWeight: 700,
      fontFamily: BODY,
      fontSize: 14,
      cursor: "pointer",
      color: "#fff"
    }
  }, "Looks good")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: 12.5,
      color: "rgba(255,255,255,0.65)",
      textAlign: "center",
      maxWidth: 340
    }
  }, "Check for blur, glare, and cut-off edges — a rejected document here costs the customer a return visit.")));
}
function SignaturePad({
  onDone,
  onClear
}) {
  const canvasRef = React.useRef(null);
  const drawing = React.useRef(false);
  const [hasInk, setHasInk] = useState(false);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#15181A";
  }, []);
  const pos = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  const down = e => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    canvasRef.current.setPointerCapture(e.pointerId);
  };
  const move = e => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInk(true);
  };
  const up = () => {
    drawing.current = false;
  };
  const clear = () => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
    if (onClear) onClear();
  };
  const done = () => onDone(canvasRef.current.toDataURL("image/png"));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    onPointerDown: down,
    onPointerMove: move,
    onPointerUp: up,
    onPointerLeave: up,
    style: {
      width: "100%",
      height: 150,
      background: "#fff",
      border: `1.5px dashed ${T.lineStrong}`,
      borderRadius: 12,
      touchAction: "none",
      display: "block",
      cursor: "crosshair"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: T.inkFaint
    }
  }, "Sign above with finger or stylus"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    small: true,
    ghost: true,
    onClick: clear
  }, "Clear"), /*#__PURE__*/React.createElement(Btn, {
    small: true,
    disabled: !hasInk,
    onClick: done
  }, "Accept signature"))));
}


/* cross-flow prototype navigation */
function FlowNav({ current }) {
  const links = [
    { href: "index.html", id: "index", label: "Hub" },
    { href: "auth.html", id: "auth", label: "Auth" },
    { href: "capture.html", id: "capture", label: "Capture" },
    { href: "desk.html", id: "desk", label: "Desk" },
    { href: "prototype.html", id: "full", label: "Full" }
  ];
  return React.createElement("nav", {
    style: {
      position: "fixed",
      top: 10,
      left: 10,
      zIndex: 9999,
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      maxWidth: "calc(100vw - 24px)",
      fontFamily: BODY
    }
  }, links.map(l => {
    const active = l.id === current;
    return React.createElement("a", {
      key: l.id,
      href: l.href,
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        textDecoration: "none",
        padding: "6px 10px",
        borderRadius: 999,
        color: active ? T.accentDeep : "rgba(255,255,255,0.88)",
        background: active ? T.mint : "rgba(0,0,0,0.28)",
        border: "1px solid rgba(255,255,255,0.18)"
      }
    }, l.label);
  }));
}
