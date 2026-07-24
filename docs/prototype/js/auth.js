function LoginScreen({
  onNext
}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const valid = /.+@.+\..+/.test(email) && pw.length >= 8;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: T.rail,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      width: "100%",
      maxWidth: 400,
      background: T.paper,
      borderRadius: 22,
      padding: "30px 28px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 11,
      background: T.accentDeep,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 800,
      fontSize: 17,
      fontFamily: DISPLAY
    }
  }, "J"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15,
      color: T.ink
    }
  }, "Jiwambe Onboarding"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: T.inkFaint
    }
  }, "Officer sign-in"))), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    required: true
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "email",
    placeholder: "you@example.com",
    value: email,
    onChange: e => setEmail(e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Password",
    required: true,
    hint: "Minimum 8 characters."
  }, /*#__PURE__*/React.createElement(TextInput, {
    type: "password",
    placeholder: "••••••••",
    value: pw,
    onChange: e => setPw(e.target.value)
  })), /*#__PURE__*/React.createElement(Btn, {
    disabled: !valid,
    onClick: () => onNext(email),
    style: {
      width: "100%"
    }
  }, "Continue"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: T.inkFaint,
      textAlign: "center",
      marginTop: 14,
      lineHeight: 1.5
    }
  }, "Accounts are created by Jiwambe backoffice for employees and contractors alike — no self sign-up.")));
}
function OtpScreen({
  email,
  onVerify,
  onBack
}) {
  const [code, setCode] = useState("");
  const ok = code === "123456";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: T.rail,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      width: "100%",
      maxWidth: 400,
      background: T.paper,
      borderRadius: 22,
      padding: "30px 28px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: "none",
      border: "none",
      color: T.accentDeep,
      fontWeight: 700,
      fontSize: 13.5,
      padding: 0,
      marginBottom: 14,
      cursor: "pointer",
      fontFamily: BODY
    }
  }, "← Back"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 22,
      color: T.ink,
      fontWeight: 400,
      margin: "0 0 6px"
    }
  }, "One more step"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: T.inkSoft,
      margin: "0 0 20px",
      lineHeight: 1.5
    }
  }, "We sent a 6-digit code by SMS to the registered phone for this account — ", /*#__PURE__*/React.createElement("b", null, "07•• ••• 118"), "."), /*#__PURE__*/React.createElement(Field, {
    label: "Verification code",
    hint: "Demo: 123456"
  }, /*#__PURE__*/React.createElement("input", {
    className: "jw-focus",
    style: {
      ...inputStyle,
      letterSpacing: 9,
      fontSize: 22,
      textAlign: "center",
      fontWeight: 700,
      fontFamily: MONO
    },
    inputMode: "numeric",
    maxLength: 6,
    placeholder: "······",
    value: code,
    onChange: e => setCode(e.target.value.replace(/\D/g, ""))
  })), /*#__PURE__*/React.createElement(Btn, {
    disabled: !ok,
    onClick: onVerify,
    style: {
      width: "100%"
    }
  }, "Verify & sign in")));
}
function ProfileView({
  officer,
  email,
  onBack,
  onLogout
}) {
  const Row = ({
    k,
    v
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: `1px solid ${T.line}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: T.inkFaint,
      fontWeight: 600
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: T.ink,
      fontWeight: 700
    }
  }, v));
  return /*#__PURE__*/React.createElement("div", {
    className: "fadeUp",
    style: {
      maxWidth: 560,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 62,
      height: 62,
      borderRadius: 99,
      background: T.accentDeep,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      fontWeight: 800,
      fontFamily: BODY
    }
  }, officer.split(" ").map(w => w[0]).join("").slice(0, 2)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: DISPLAY,
      fontSize: 24,
      color: T.ink,
      fontWeight: 400,
      margin: 0
    }
  }, officer), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: T.inkSoft,
      marginTop: 2
    }
  }, "Onboarding officer · Contractor"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: T.card,
      border: `1px solid ${T.line}`,
      borderRadius: 16,
      padding: "6px 18px",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Row, {
    k: "Email",
    v: email
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Registered phone (OTP + payouts)",
    v: "0712 004 118"
  }), /*#__PURE__*/React.createElement(Row, {
    k: "National ID",
    v: "•••• 4471"
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Dealership",
    v: OFFICER_DEALERSHIP
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Access",
    v: "Field capture · agreements · release"
  }), /*#__PURE__*/React.createElement(Row, {
    k: "This device",
    v: "Samsung Tab A9 · registered 02 Jun 2026"
  }), /*#__PURE__*/React.createElement(Row, {
    k: "Last sign-in",
    v: "Today, 07:58 · Nairobi"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    ghost: true,
    onClick: onBack
  }, "← Worklist"), /*#__PURE__*/React.createElement(Btn, {
    danger: true,
    onClick: onLogout,
    style: {
      background: T.redBg,
      color: T.red
    }
  }, "Sign out")));
}
