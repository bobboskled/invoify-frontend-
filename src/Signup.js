import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

// ─── Icons ────────────────────────────────────────────
const LogoIcon = memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
));

const EyeIcon = memo(({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
));

const CheckIcon = memo(() => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
));

const ShieldIcon = memo(() => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
));

// ─── Password Strength Checker ────────────────────────
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "#E2EAF0" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#E74C3C" };
  if (score <= 2) return { score, label: "Fair", color: "#F39C12" };
  if (score <= 3) return { score, label: "Good", color: "#3498DB" };
  if (score <= 4) return { score, label: "Strong", color: "#27AE60" };
  return { score, label: "Very Strong", color: "#1A8A4A" };
};

const getPasswordRules = (pwd) => [
  { label: "At least 8 characters", met: pwd.length >= 8 },
  { label: "One uppercase letter", met: /[A-Z]/.test(pwd) },
  { label: "One number", met: /[0-9]/.test(pwd) },
  { label: "One special character (!@#$...)", met: /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

// ─── Reusable Input Field ─────────────────────────────
const InputField = memo(({ id, label, type, placeholder, value, onChange, onFocus, onBlur, isFocused, hasError, errorMsg, children, autoComplete }) => (
  <div style={{ marginBottom: "16px" }}>
    <label htmlFor={id} style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#2A3A4A", marginBottom: "6px", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        id={id} name={id} type={type} placeholder={placeholder} value={value}
        onChange={onChange} onFocus={onFocus} onBlur={onBlur}
        autoComplete={autoComplete || "off"}
        aria-required="true"
        aria-invalid={hasError ? "true" : "false"}
        aria-describedby={hasError ? `${id}-error` : undefined}
        style={{
          width: "100%",
          padding: children ? "12px 44px 12px 14px" : "12px 14px",
          fontSize: "14px", color: "#0A0A0A",
          background: isFocused ? "#EEF6FF" : "#F8FAFB",
          border: hasError ? "2px solid #C0392B" : isFocused ? "2px solid #1A6FA8" : "1.5px solid #C8D8E4",
          borderRadius: "10px", outline: "none",
          transition: "all 0.2s ease",
          fontFamily: "system-ui, sans-serif",
          boxSizing: "border-box",
        }}
      />
      {children}
    </div>
    {hasError && (
      <p id={`${id}-error`} role="alert" aria-live="polite" style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px", fontFamily: "system-ui, sans-serif" }}>
        ⚠ {errorMsg}
      </p>
    )}
  </div>
));

// ─── Success Screen ───────────────────────────────────
const SuccessScreen = memo(({ name, onGoToLogin }) => (
  <div style={{ textAlign: "center", padding: "20px 0" }}>
    <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #1A6FA8, #0A3A5A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(26,111,168,0.3)" }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0A0A0A", marginBottom: "8px" }}>Welcome to ContractClear!</h2>
    <p style={{ color: "#5A6A7A", fontSize: "14px", marginBottom: "28px", fontFamily: "system-ui, sans-serif" }}>
      Your account is ready, <strong>{name}</strong>. Start analyzing contracts instantly.
    </p>
    <button
      onClick={onGoToLogin}
      style={{ width: "100%", padding: "14px", background: "#0A0A0A", color: "#fff", border: "none", borderRadius: "11px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "system-ui, sans-serif", transition: "background 0.2s" }}
      onMouseOver={e => e.target.style.background = "#1A3A5C"}
      onMouseOut={e => e.target.style.background = "#0A0A0A"}
    >
      Go to Sign In →
    </button>
  </div>
));

// ─── Main Signup Component ────────────────────────────
export default function Signup({ onGoToLogin }) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm_password: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const passwordRules = useMemo(() => getPasswordRules(form.password), [form.password]);

  const updateField = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setServerError("");
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    else if (form.full_name.trim().length < 2) e.full_name = "Name must be at least 2 characters";
    else if (!/^[a-zA-Z\s'-]+$/.test(form.full_name)) e.full_name = "Name contains invalid characters";

    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters required";
    else if (!/[A-Z]/.test(form.password)) e.password = "Must contain an uppercase letter";
    else if (!/[0-9]/.test(form.password)) e.password = "Must contain a number";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) e.password = "Must contain a special character";

    if (!form.confirm_password) e.confirm_password = "Please confirm your password";
    else if (form.password !== form.confirm_password) e.confirm_password = "Passwords do not match";

    if (!agreedToTerms) e.terms = "You must agree to the terms to continue";

    return e;
  }, [form, agreedToTerms]);

  const handleSubmit = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const firstError = Object.keys(e)[0];
      document.getElementById(firstError)?.focus();
      return;
    }
    setErrors({});
    setServerError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Registration failed. Please try again.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setSuccess(true);
      }
    } catch {
      setServerError("Cannot connect to server. Make sure the backend is running.");
    }
    setLoading(false);
  }, [form, validate]);

  // ─── Google Signup ────────────────────────────────
  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setServerError("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Google signup failed. Please try again.");
      } else {
        localStorage.setItem("cc_token", data.token);
        localStorage.setItem("cc_user", JSON.stringify(data.user));
        setSuccess(true);
      }
    } catch {
      setServerError("Cannot connect to server. Make sure the backend is running.");
    }
  }, []);

  const handleGoogleError = useCallback(() => {
    setServerError("Google signup was cancelled or failed. Please try again.");
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        input::placeholder { color: #8FA4B4; }
        .submit-btn:hover:not(:disabled) { background: #1A3A5C !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
        .submit-btn:focus-visible { outline: 3px solid #5BA4CF; outline-offset: 2px; }
        .signin-link:hover { text-decoration: underline; }
        .skip-link { position: absolute; top: -100px; left: 8px; background: #0A0A0A; color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; z-index: 999; text-decoration: none; }
        .skip-link:focus { top: 8px; }
        @media (max-width: 480px) { .card { padding: 28px 18px !important; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <a href="#signup-form" className="skip-link">Skip to signup form</a>

      <div role="main" style={{ minHeight: "100vh", background: "#F4F8FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: "24px", position: "relative", overflow: "hidden" }}>

        {/* Background */}
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(160,200,235,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(160,200,235,0.15) 1px, transparent 1px)", backgroundSize: "48px 48px", zIndex: 0, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "fixed", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(180,220,255,0.3) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "fixed", bottom: "-60px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(200,230,255,0.2) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        {/* Card */}
        <div className="card" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "440px", background: "#FFFFFF", border: "1px solid #D8E6F0", borderRadius: "20px", padding: "40px 40px", boxShadow: "0 4px 40px rgba(80,140,200,0.10), 0 1px 8px rgba(0,0,0,0.05)", animation: mounted ? "fadeUp 0.5s ease forwards" : "none", opacity: mounted ? 1 : 0 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
            <div aria-hidden="true" style={{ width: "36px", height: "36px", background: "#0A0A0A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LogoIcon />
            </div>
            <span style={{ fontSize: "17px", fontWeight: "700", color: "#0A0A0A", letterSpacing: "-0.3px" }}>
              Contract<span style={{ color: "#1A6FA8" }}>Clear</span>
            </span>
          </div>

          {success ? (
            <SuccessScreen name={form.full_name || "there"} onGoToLogin={onGoToLogin} />
          ) : (
            <>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0A0A0A", letterSpacing: "-0.5px", marginBottom: "4px", lineHeight: 1.2 }}>Create your account</h1>
              <p style={{ fontSize: "14px", color: "#5A6A7A", marginBottom: "24px", fontStyle: "italic" }}>Free forever · No credit card required</p>

              {/* Server error */}
              {serverError && (
                <div role="alert" aria-live="assertive" style={{ fontSize: "13px", color: "#922B21", background: "#FDECEA", border: "1.5px solid #F5B7B1", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
                  ⚠ {serverError}
                </div>
              )}

              {/* Form */}
              <form id="signup-form" noValidate onSubmit={e => { e.preventDefault(); handleSubmit(); }} aria-label="Create account form">

                {/* Full Name */}
                <InputField
                  id="full_name" label="Full Name" type="text" placeholder="John Smith"
                  value={form.full_name} autoComplete="name"
                  onChange={updateField("full_name")}
                  onFocus={() => setFocusedField("full_name")} onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === "full_name"} hasError={!!errors.full_name} errorMsg={errors.full_name}
                />

                {/* Email */}
                <InputField
                  id="email" label="Email Address" type="email" placeholder="you@company.com"
                  value={form.email} autoComplete="email"
                  onChange={updateField("email")}
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === "email"} hasError={!!errors.email} errorMsg={errors.email}
                />

                {/* Password */}
                <InputField
                  id="password" label="Password" type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
                  value={form.password} autoComplete="new-password"
                  onChange={updateField("password")}
                  onFocus={() => { setFocusedField("password"); setShowPasswordRules(true); }}
                  onBlur={() => { setFocusedField(null); }}
                  isFocused={focusedField === "password"} hasError={!!errors.password} errorMsg={errors.password}
                >
                  <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Hide password" : "Show password"}
                    style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5A7A8A", padding: "4px", display: "flex", alignItems: "center" }}>
                    <EyeIcon open={showPass} />
                  </button>
                </InputField>

                {/* Password Strength Meter */}
                {form.password && (
                  <div style={{ marginTop: "-10px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: "4px", borderRadius: "4px", background: i <= passwordStrength.score ? passwordStrength.color : "#E2EAF0", transition: "background 0.3s ease" }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", color: passwordStrength.color, fontWeight: "600", fontFamily: "system-ui, sans-serif" }}>{passwordStrength.label}</span>
                    </div>

                    {/* Password rules checklist */}
                    {showPasswordRules && (
                      <div style={{ marginTop: "8px", background: "#F8FAFB", border: "1px solid #E2EAF0", borderRadius: "8px", padding: "10px 12px", animation: "popIn 0.2s ease" }}>
                        {passwordRules.map((rule, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: i < passwordRules.length - 1 ? "6px" : 0 }}>
                            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: rule.met ? "#27AE60" : "#E2EAF0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
                              {rule.met && <CheckIcon />}
                            </div>
                            <span style={{ fontSize: "12px", color: rule.met ? "#27AE60" : "#7A8FA0", fontFamily: "system-ui, sans-serif", transition: "color 0.2s" }}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Confirm Password */}
                <InputField
                  id="confirm_password" label="Confirm Password" type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                  value={form.confirm_password} autoComplete="new-password"
                  onChange={updateField("confirm_password")}
                  onFocus={() => setFocusedField("confirm_password")} onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === "confirm_password"} hasError={!!errors.confirm_password} errorMsg={errors.confirm_password}
                >
                  <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5A7A8A", padding: "4px", display: "flex", alignItems: "center" }}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </InputField>

                {/* Terms */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "13px", color: "#3A4A5A", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
                    <input
                      type="checkbox" id="terms" checked={agreedToTerms}
                      onChange={e => { setAgreedToTerms(e.target.checked); setErrors(v => ({ ...v, terms: "" })); }}
                      style={{ width: "16px", height: "16px", accentColor: "#1A6FA8", cursor: "pointer", marginTop: "2px", flexShrink: 0 }}
                    />
                    I agree to the{" "}
                    <button type="button" style={{ color: "#1A6FA8", fontWeight: "600", textDecoration: "none", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit", padding:0 }}>Terms of Service</button>
                    {" "}and{" "}
                    <button type="button" style={{ color: "#1A6FA8", fontWeight: "600", textDecoration: "none", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit", padding:0 }}>Privacy Policy</button>
                  </label>
                  {errors.terms && <p role="alert" style={{ fontSize: "12px", color: "#C0392B", marginTop: "4px", fontFamily: "system-ui, sans-serif" }}>⚠ {errors.terms}</p>}
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={loading} className="submit-btn"
                  aria-label={loading ? "Creating your account, please wait" : "Create your free account"} aria-busy={loading}
                  style={{ width: "100%", padding: "14px", background: loading ? "#2A3A4A" : "#0A0A0A", color: "#FFFFFF", border: "none", borderRadius: "11px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", fontFamily: "system-ui, sans-serif", transition: "all 0.2s ease", animation: shake ? "shake 0.4s ease" : "none" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span aria-hidden="true" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Creating account...
                    </span>
                  ) : "Create Free Account →"}
                </button>
              </form>

              {/* Divider */}
              <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "#D8E6F0" }} />
                <span style={{ fontSize: "12px", color: "#7A9AAA", fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em" }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: "#D8E6F0" }} />
              </div>

              {/* Google Signup */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess} onError={handleGoogleError}
                  width="360" theme="outline" size="large"
                  text="signup_with" shape="rectangular" logo_alignment="left"
                />
              </div>

              {/* Footer */}
              <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#5A6A7A", fontFamily: "system-ui, sans-serif" }}>
                Already have an account?{" "}
                <button onClick={onGoToLogin} className="signin-link" style={{ color: "#0A0A0A", fontWeight: "700", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontFamily: "system-ui, sans-serif", padding: 0 }}>
                  Sign in
                </button>
              </p>

              {/* Security Badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "16px", fontSize: "11px", color: "#7A9AAA", fontFamily: "system-ui, sans-serif" }}>
                <ShieldIcon />
                <span>256-bit SSL encryption · SOC 2 compliant · GDPR ready</span>
              </div>
            </>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
