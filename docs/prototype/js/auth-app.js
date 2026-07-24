function App() {
  const [auth, setAuth] = useState("login");
  const [email, setEmail] = useState("");
  if (auth === "login") {
    return React.createElement(React.Fragment, null,
      React.createElement(FlowNav, { current: "auth" }),
      React.createElement(GlobalStyle, null),
      React.createElement(LoginScreen, {
        onNext: e => {
          setEmail(e);
          setAuth("otp");
        }
      })
    );
  }
  return React.createElement(React.Fragment, null,
    React.createElement(FlowNav, { current: "auth" }),
    React.createElement(GlobalStyle, null),
    React.createElement(OtpScreen, {
      email: email,
      onBack: () => setAuth("login"),
      onVerify: () => { location.href = "desk.html"; }
    })
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
