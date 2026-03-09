import { useState, useEffect, useCallback, memo } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const EyeIcon = memo(({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
));

const ShieldIcon = memo(() => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
));

const LogoIcon = memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
));

const InputField = memo(({ id, label, type, placeholder, value, onChange, onFocus, onBlur, isFocused, hasError, errorMsg, children }) => (
  <div style={{ marginBottom: "18px" }}>
    <label htmlFor={id} style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#2A3A4A", marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        id={id} name={id} type={type} placeholder={placeholder} value={value}
        onChange={onChange} onFocus={onFocus} onBlur={onBlur}
        autoComplete={id === "email" ? "email" : id === "password" ? "current-password" : "off"}
        aria-required="true"
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? `${id}-error` : undefined}
        style={{ width: "100%", padding: children ? "13px 44px 13px 14px" : "13px 14px", fontSize: "15px", color: "#0A0A0A", background: isFocused ? "#EEF6FF" : "#F8FAFB", border: hasError ? "2px solid #C0392B" : isFocused ? "2px solid #1A6FA8" : "1.5px solid #C8D8E4", borderRadius: "11px", outline: "none", transition: "all 0.2s ease", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
      />
      {children}
    </div>
    {hasError && <p id={`${id}-error`} role="alert" aria-live="polite" style={{ fontSize: "12px", color: "#C0392B", marginTop: "5px", fontFamily: "system-ui, sans-serif" }}>⚠ {errorMsg}</p>}
  </div>
));

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [serverError, setServerError] = useState("");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login"); // "login" | "signup" | "forgot" | "reset"

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    // Check if this is a password reset link
    const params = new URLSearchParams(window.location.search);
    if (params.get("token")) { setPage("reset"); return () => clearTimeout(t); }
    const savedUser = localStorage.getItem("cc_user") || sessionStorage.getItem("cc_user");
    if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch {} }
    return () => clearTimeout(t);
  }, []);

  const saveUser = useCallback((token, userData, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("cc_token", token);
    storage.setItem("cc_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Minimum 8 characters required";
    return e;
  }, [email, password]);

  const handleSubmit = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e); setShake(true); setTimeout(() => setShake(false), 500);
      document.getElementById(Object.keys(e)[0])?.focus(); return;
    }
    setErrors({}); setServerError(""); setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error || "Login failed."); setShake(true); setTimeout(() => setShake(false), 500); }
      else { saveUser(data.token, data.user, remember); }
    } catch { setServerError("Cannot connect to server. Make sure the backend is running."); }
    setLoading(false);
  }, [email, password, remember, validate, saveUser]);

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setServerError("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/google-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) { setServerError(data.error || "Google login failed."); }
      else { saveUser(data.token, data.user, true); }
    } catch { setServerError("Cannot connect to server. Make sure the backend is running."); }
  }, [saveUser]);

  const handleGoogleError = useCallback(() => {
    setServerError("Google login was cancelled or failed. Please try again.");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("cc_token"); localStorage.removeItem("cc_user");
    sessionStorage.removeItem("cc_token"); sessionStorage.removeItem("cc_user");
    setUser(null); setEmail(""); setPassword(""); setPage("login");
  }, []);

  // ─── Page Routing ─────────────────────────────────
  if (page === "signup") return <Signup onGoToLogin={() => setPage("login")} />;
  if (page === "forgot") return <ForgotPassword onGoToLogin={() => setPage("login")} />;
  if (page === "reset") return <ResetPassword onGoToLogin={() => { window.history.replaceState({}, "", "/"); setPage("login"); }} />;
  if (user) return <Dashboard user={user} onLogout={handleLogout} />;

  // ─── Login Page ───────────────────────────────────
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: #8FA4B4; }
        .signin-btn:hover:not(:disabled) { background: #1A3A5C !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
        .signin-btn:focus-visible { outline: 3px solid #5BA4CF; outline-offset: 2px; }
        .skip-link { position: absolute; top: -100px; left: 8px; background: #0A0A0A; color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; z-index: 999; text-decoration: none; }
        .skip-link:focus { top: 8px; }
        @media (max-width: 480px) { .card { padding: 32px 20px !important; } .heading { font-size: 22px !important; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <a href="#main-form" className="skip-link">Skip to main content</a>

      <div role="main" style={{ minHeight: "100vh", background: "#F4F8FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: "24px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(160,200,235,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(160,200,235,0.15) 1px, transparent 1px)", backgroundSize: "48px 48px", zIndex: 0, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "fixed", top: "-120px", right: "-120px", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(180,220,255,0.3) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "fixed", bottom: "-80px", left: "-80px", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,230,255,0.2) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="card" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px", background: "#FFFFFF", border: "1px solid #D8E6F0", borderRadius: "20px", padding: "44px 40px", boxShadow: "0 4px 40px rgba(80,140,200,0.10), 0 1px 8px rgba(0,0,0,0.05)", animation: mounted ? "fadeUp 0.5s ease forwards" : "none", opacity: mounted ? 1 : 0 }}>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <div aria-hidden="true" style={{ width: "36px", height: "36px", background: "#0A0A0A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LogoIcon />
            </div>
            <span style={{ fontSize: "17px", fontWeight: "700", color: "#0A0A0A", letterSpacing: "-0.3px" }}>
              Contract<span style={{ color: "#1A6FA8" }}>Clear</span>
            </span>
          </div>

          <h1 className="heading" style={{ fontSize: "26px", fontWeight: "700", color: "#0A0A0A", letterSpacing: "-0.5px", marginBottom: "6px", lineHeight: 1.2 }}>Welcome back</h1>
          <p style={{ fontSize: "14px", color: "#5A6A7A", marginBottom: "28px", fontStyle: "italic" }}>Sign in to decode your contracts</p>

          {serverError && (
            <div role="alert" aria-live="assertive" style={{ fontSize: "13px", color: "#922B21", background: "#FDECEA", border: "1.5px solid #F5B7B1", borderRadius: "10px", padding: "10px 14px", marginBottom: "18px", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
              ⚠ {serverError}
            </div>
          )}

          <form id="main-form" noValidate onSubmit={e => { e.preventDefault(); handleSubmit(); }} aria-label="Sign in form">
            <InputField id="email" label="Email Address" type="email" placeholder="you@company.com" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: "" })); setServerError(""); }}
              onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
              isFocused={focusedField === "email"} hasError={!!errors.email} errorMsg={errors.email} />

            <InputField id="password" label="Password" type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={password}
              onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: "" })); setServerError(""); }}
              onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
              isFocused={focusedField === "password"} hasError={!!errors.password} errorMsg={errors.password}>
              <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5A7A8A", padding: "4px", display: "flex", alignItems: "center" }}>
                <EyeIcon open={showPass} />
              </button>
            </InputField>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#3A4A5A", fontFamily: "system-ui, sans-serif" }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#1A6FA8", cursor: "pointer" }} />
                Remember me
              </label>
              <button type="button" onClick={() => setPage("forgot")}
                style={{ fontSize: "13px", color: "#1A6FA8", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui, sans-serif", fontWeight: "600", padding: 0 }}>
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="signin-btn"
              aria-label={loading ? "Signing in, please wait" : "Sign in to your account"} aria-busy={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "#2A3A4A" : "#0A0A0A", color: "#FFFFFF", border: "none", borderRadius: "11px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", fontFamily: "system-ui, sans-serif", transition: "all 0.2s ease", animation: shake ? "shake 0.4s ease" : "none" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span aria-hidden="true" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#D8E6F0" }} />
            <span style={{ fontSize: "12px", color: "#7A9AAA", fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#D8E6F0" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError}
              width="340" theme="outline" size="large" text="continue_with" shape="rectangular" logo_alignment="left" />
          </div>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13.5px", color: "#5A6A7A", fontFamily: "system-ui, sans-serif" }}>
            Don't have an account?{" "}
            <button onClick={() => setPage("signup")}
              style={{ color: "#0A0A0A", fontWeight: "700", background: "none", border: "none", cursor: "pointer", fontSize: "13.5px", fontFamily: "system-ui, sans-serif", padding: 0, textDecoration: "underline" }}>
              Create one free
            </button>
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "20px", fontSize: "11px", color: "#7A9AAA", fontFamily: "system-ui, sans-serif" }}>
            <ShieldIcon />
            <span>256-bit SSL encryption · SOC 2 compliant · GDPR ready</span>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
