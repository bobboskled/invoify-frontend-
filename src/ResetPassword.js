import { useState, useCallback, memo, useEffect, useMemo } from "react";

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

const getStrength = (pwd) => {
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

export default function ResetPassword({ onGoToLogin }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValid, setTokenValid] = useState(null); // null=checking, true=valid, false=invalid

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    // Extract token from URL: ?token=xxxx
    const params = new URLSearchParams(window.location.search);
    const t2 = params.get("token");
    if (!t2) { setTokenValid(false); return () => clearTimeout(t); }
    setToken(t2);
    // Verify token with backend
    fetch(`${process.env.REACT_APP_API_URL}/api/verify-reset-token?token=${t2}`)
      .then(r => r.json())
      .then(d => setTokenValid(d.valid))
      .catch(() => setTokenValid(false));
    return () => clearTimeout(t);
  }, []);

  const strength = useMemo(() => getStrength(password), [password]);

  const validate = useCallback(() => {
    if (!password) return "Password is required.";
    if (password.length < 8) return "Minimum 8 characters required.";
    if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter.";
    if (!/[0-9]/.test(password)) return "Must contain a number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Must contain a special character.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  }, [password, confirm]);

  const handleSubmit = useCallback(async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed. Please try again."); }
      else { setSuccess(true); }
    } catch { setError("Cannot connect to server. Make sure the backend is running."); }
    setLoading(false);
  }, [token, password, validate]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        input::placeholder { color: #8FA4B4; }
        .submit-btn:hover:not(:disabled) { background: #1A3A5C !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <div role="main" style={{ minHeight: "100vh", background: "#F4F8FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: "24px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(160,200,235,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(160,200,235,0.15) 1px, transparent 1px)", backgroundSize: "48px 48px", zIndex: 0, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "fixed", top: "-120px", right: "-120px", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(180,220,255,0.3) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px", background: "#FFFFFF", border: "1px solid #D8E6F0", borderRadius: "20px", padding: "44px 40px", boxShadow: "0 4px 40px rgba(80,140,200,0.10)", animation: mounted ? "fadeUp 0.5s ease forwards" : "none", opacity: mounted ? 1 : 0 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <div style={{ width: "36px", height: "36px", background: "#0A0A0A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LogoIcon />
            </div>
            <span style={{ fontSize: "17px", fontWeight: "700", color: "#0A0A0A" }}>Contract<span style={{ color: "#1A6FA8" }}>Clear</span></span>
          </div>

          {/* Checking token */}
          {tokenValid === null && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <span style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid #E2EAF0", borderTopColor: "#1A6FA8", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <p style={{ marginTop: "16px", color: "#5A6A7A", fontFamily: "system-ui, sans-serif" }}>Verifying your link...</p>
            </div>
          )}

          {/* Invalid token */}
          {tokenValid === false && (
            <div style={{ textAlign: "center", animation: "popIn 0.3s ease" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⛔</div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#0A0A0A", marginBottom: "10px" }}>Link expired or invalid</h2>
              <p style={{ fontSize: "14px", color: "#5A6A7A", fontFamily: "system-ui, sans-serif", marginBottom: "24px", lineHeight: 1.5 }}>
                This reset link has expired or already been used. Reset links are valid for 1 hour.
              </p>
              <button onClick={onGoToLogin}
                style={{ width: "100%", padding: "13px", background: "#0A0A0A", color: "#fff", border: "none", borderRadius: "11px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                Back to Sign In
              </button>
            </div>
          )}

          {/* Success */}
          {tokenValid === true && success && (
            <div style={{ textAlign: "center", animation: "popIn 0.3s ease" }}>
              <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #1A7A4A, #0A4A2A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(26,122,74,0.3)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0A0A0A", marginBottom: "10px" }}>Password reset!</h2>
              <p style={{ fontSize: "14px", color: "#5A6A7A", fontFamily: "system-ui, sans-serif", marginBottom: "28px", lineHeight: 1.5 }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button onClick={onGoToLogin}
                style={{ width: "100%", padding: "13px", background: "#0A0A0A", color: "#fff", border: "none", borderRadius: "11px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
                onMouseOver={e => e.target.style.background = "#1A3A5C"}
                onMouseOut={e => e.target.style.background = "#0A0A0A"}>
                Sign In Now →
              </button>
            </div>
          )}

          {/* Reset form */}
          {tokenValid === true && !success && (
            <>
              <div style={{ width: "56px", height: "56px", background: "#EEF6FF", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A6FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </div>
              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0A0A0A", marginBottom: "8px" }}>Set new password</h1>
              <p style={{ fontSize: "14px", color: "#5A6A7A", marginBottom: "28px", fontFamily: "system-ui, sans-serif" }}>Choose a strong password for your account.</p>

              {error && (
                <div role="alert" style={{ fontSize: "13px", color: "#922B21", background: "#FDECEA", border: "1.5px solid #F5B7B1", borderRadius: "10px", padding: "10px 14px", marginBottom: "18px", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
                  ⚠ {error}
                </div>
              )}

              <form noValidate onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                {/* New Password */}
                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="new-password" style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#2A3A4A", marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input id="new-password" type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
                      value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                      autoComplete="new-password" aria-required="true"
                      style={{ width: "100%", padding: "13px 44px 13px 14px", fontSize: "15px", color: "#0A0A0A", background: "#F8FAFB", border: "1.5px solid #C8D8E4", borderRadius: "11px", outline: "none", transition: "all 0.2s", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
                      onFocus={e => e.target.style.border = "2px solid #1A6FA8"}
                      onBlur={e => e.target.style.border = "1.5px solid #C8D8E4"}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5A7A8A", padding: "4px", display: "flex", alignItems: "center" }}>
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                  {/* Strength meter */}
                  {password && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: "4px", borderRadius: "4px", background: i <= strength.score ? strength.color : "#E2EAF0", transition: "background 0.3s" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "11px", color: strength.color, fontWeight: "600", fontFamily: "system-ui, sans-serif" }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: "24px" }}>
                  <label htmlFor="confirm-password" style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#2A3A4A", marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input id="confirm-password" type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                      value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }}
                      autoComplete="new-password" aria-required="true"
                      style={{ width: "100%", padding: "13px 44px 13px 14px", fontSize: "15px", color: "#0A0A0A", background: "#F8FAFB", border: confirm && confirm !== password ? "2px solid #C0392B" : confirm && confirm === password ? "2px solid #27AE60" : "1.5px solid #C8D8E4", borderRadius: "11px", outline: "none", transition: "all 0.2s", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
                      onFocus={e => { if (!confirm) e.target.style.border = "2px solid #1A6FA8"; }}
                      onBlur={e => { if (!confirm) e.target.style.border = "1.5px solid #C8D8E4"; }}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide password" : "Show password"}
                      style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5A7A8A", padding: "4px", display: "flex", alignItems: "center" }}>
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm && confirm === password && (
                    <p style={{ fontSize: "12px", color: "#27AE60", marginTop: "4px", fontFamily: "system-ui, sans-serif" }}>✓ Passwords match</p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="submit-btn" aria-busy={loading}
                  style={{ width: "100%", padding: "14px", background: loading ? "#2A3A4A" : "#0A0A0A", color: "#fff", border: "none", borderRadius: "11px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span aria-hidden="true" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Updating password...
                    </span>
                  ) : "Reset Password →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
