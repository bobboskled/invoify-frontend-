import { useState, useCallback, memo, useEffect } from "react";

const LogoIcon = memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
));

export default function ForgotPassword({ onGoToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }

    setError(""); setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong. Please try again."); }
      else { setSuccess(true); }
    } catch { setError("Cannot connect to server. Make sure the backend is running."); }
    setLoading(false);
  }, [email]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        input::placeholder { color: #8FA4B4; }
        .submit-btn:hover:not(:disabled) { background: #1A3A5C !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
        .back-btn:hover { color: #0A0A0A !important; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>

      <div role="main" style={{ minHeight: "100vh", background: "#F4F8FC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif", padding: "24px", position: "relative", overflow: "hidden" }}>

        <div aria-hidden="true" style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(160,200,235,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(160,200,235,0.15) 1px, transparent 1px)", backgroundSize: "48px 48px", zIndex: 0, pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "fixed", top: "-120px", right: "-120px", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(180,220,255,0.3) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "420px", background: "#FFFFFF", border: "1px solid #D8E6F0", borderRadius: "20px", padding: "44px 40px", boxShadow: "0 4px 40px rgba(80,140,200,0.10), 0 1px 8px rgba(0,0,0,0.05)", animation: mounted ? "fadeUp 0.5s ease forwards" : "none", opacity: mounted ? 1 : 0 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <div aria-hidden="true" style={{ width: "36px", height: "36px", background: "#0A0A0A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LogoIcon />
            </div>
            <span style={{ fontSize: "17px", fontWeight: "700", color: "#0A0A0A", letterSpacing: "-0.3px" }}>
              Contract<span style={{ color: "#1A6FA8" }}>Clear</span>
            </span>
          </div>

          {success ? (
            /* ── Success State ── */
            <div style={{ textAlign: "center", animation: "popIn 0.3s ease" }}>
              <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #1A6FA8, #0A3A5A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(26,111,168,0.3)" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0A0A0A", marginBottom: "10px" }}>Check your email!</h2>
              <p style={{ fontSize: "14px", color: "#5A6A7A", fontFamily: "system-ui, sans-serif", lineHeight: 1.6, marginBottom: "8px" }}>
                We sent a password reset link to:
              </p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#1A6FA8", fontFamily: "system-ui, sans-serif", marginBottom: "28px" }}>{email}</p>
              <p style={{ fontSize: "13px", color: "#7A9AAA", fontFamily: "system-ui, sans-serif", marginBottom: "28px" }}>
                The link expires in <strong>1 hour</strong>. Check your spam folder if you don't see it.
              </p>
              <button onClick={onGoToLogin}
                style={{ width: "100%", padding: "13px", background: "#0A0A0A", color: "#fff", border: "none", borderRadius: "11px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "system-ui, sans-serif", transition: "background 0.2s" }}
                onMouseOver={e => e.target.style.background = "#1A3A5C"}
                onMouseOut={e => e.target.style.background = "#0A0A0A"}>
                Back to Sign In
              </button>
            </div>
          ) : (
            /* ── Form State ── */
            <>
              {/* Lock icon */}
              <div style={{ width: "56px", height: "56px", background: "#EEF6FF", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A6FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#0A0A0A", letterSpacing: "-0.5px", marginBottom: "8px", lineHeight: 1.2 }}>Forgot your password?</h1>
              <p style={{ fontSize: "14px", color: "#5A6A7A", marginBottom: "28px", fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
                No worries! Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div role="alert" aria-live="assertive" style={{ fontSize: "13px", color: "#922B21", background: "#FDECEA", border: "1.5px solid #F5B7B1", borderRadius: "10px", padding: "10px 14px", marginBottom: "18px", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
                  ⚠ {error}
                </div>
              )}

              <form noValidate onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                <div style={{ marginBottom: "20px" }}>
                  <label htmlFor="reset-email" style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#2A3A4A", marginBottom: "7px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
                    Email Address
                  </label>
                  <input
                    id="reset-email" type="email" placeholder="you@company.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email" aria-required="true"
                    style={{ width: "100%", padding: "13px 14px", fontSize: "15px", color: "#0A0A0A", background: "#F8FAFB", border: "1.5px solid #C8D8E4", borderRadius: "11px", outline: "none", transition: "all 0.2s ease", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.border = "2px solid #1A6FA8"}
                    onBlur={e => e.target.style.border = "1.5px solid #C8D8E4"}
                  />
                </div>

                <button type="submit" disabled={loading} className="submit-btn"
                  aria-busy={loading}
                  style={{ width: "100%", padding: "14px", background: loading ? "#2A3A4A" : "#0A0A0A", color: "#FFFFFF", border: "none", borderRadius: "11px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s ease", marginBottom: "16px" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span aria-hidden="true" style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Sending reset link...
                    </span>
                  ) : "Send Reset Link →"}
                </button>
              </form>

              <button onClick={onGoToLogin} className="back-btn"
                style={{ width: "100%", padding: "12px", background: "none", border: "1.5px solid #C8D8E4", borderRadius: "11px", fontSize: "14px", fontWeight: "600", color: "#5A6A7A", cursor: "pointer", fontFamily: "system-ui, sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                ← Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
