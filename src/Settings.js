import { useState, useEffect, useCallback, memo } from "react";

const getToken = () => localStorage.getItem("inv_token") || sessionStorage.getItem("inv_token");

const Field = memo(({ id, label, type="text", placeholder, value, onChange, error, hint }) => (
  <div style={{ marginBottom:"16px" }}>
    <label htmlFor={id} style={{ display:"block", fontSize:"11px", fontWeight:"600", color:"#4A6741", marginBottom:"6px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
    <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width:"100%", padding:"11px 14px", fontSize:"14px", color:"#0D3D2E", background:"#F8FBF9", border: error?"2px solid #E74C3C":"1.5px solid #C8DDD5", borderRadius:"10px", outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border 0.2s" }}
      onFocus={e=>{ if(!error) e.target.style.border="2px solid #0D3D2E"; }}
      onBlur={e=> { if(!error) e.target.style.border="1.5px solid #C8DDD5"; }}/>
    {hint  && <p style={{ fontSize:"11px", color:"#8AADA0", marginTop:"4px", fontFamily:"'DM Sans',sans-serif" }}>{hint}</p>}
    {error && <p role="alert" style={{ fontSize:"11px", color:"#E74C3C", marginTop:"4px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {error}</p>}
  </div>
));

const Section = memo(({ title, subtitle, children }) => (
  <div style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"16px", padding:"28px", marginBottom:"16px" }}>
    <div style={{ marginBottom:"20px", paddingBottom:"16px", borderBottom:"1px solid #F0F5F2" }}>
      <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"18px", color:"#0D3D2E", marginBottom:"4px" }}>{title}</h3>
      {subtitle && <p style={{ fontSize:"13px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>{subtitle}</p>}
    </div>
    {children}
  </div>
));

export default function Settings({ user, onUserUpdate }) {
  const [profile, setProfile]   = useState({ full_name: user?.full_name || "", email: user?.email || "" });
  const [business, setBusiness] = useState({ business_name:"", address:"", phone:"", email:"", website:"", tax_id:"", currency:"USD", invoice_notes:"" });
  const [passwords, setPasswords] = useState({ current:"", newPass:"", confirm:"" });
  const [showPass, setShowPass]   = useState({ current:false, newPass:false, confirm:false });

  const [loading, setLoading]   = useState({ profile:false, business:false, password:false });
  const [success, setSuccess]   = useState({ profile:false, business:false, password:false });
  const [errors, setErrors]     = useState({});
  const [fetchLoad, setFetchLoad] = useState(true);

  // Fetch existing settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`, { headers:{ Authorization:`Bearer ${getToken()}` }});
        const data = await res.json();
        if (res.ok && data.business) setBusiness(prev => ({ ...prev, ...data.business }));
      } catch {}
      setFetchLoad(false);
    };
    fetchSettings();
  }, []);

  const showSuccess = useCallback((key) => {
    setSuccess(p => ({ ...p, [key]:true }));
    setTimeout(() => setSuccess(p => ({ ...p, [key]:false })), 3000);
  }, []);

  // Save profile
  const saveProfile = useCallback(async () => {
    const e = {};
    if (!profile.full_name.trim()) e.full_name = "Name is required";
    if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = "Valid email required";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(p=>({...p,profile:true}));
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/profile`, { method:"PUT", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` }, body:JSON.stringify(profile) });
      const data = await res.json();
      if (res.ok) { onUserUpdate?.(data.user); showSuccess("profile"); }
      else setErrors({ profile: data.error });
    } catch { setErrors({ profile:"Cannot connect to server." }); }
    setLoading(p=>({...p,profile:false}));
  }, [profile, onUserUpdate, showSuccess]);

  // Save business
  const saveBusiness = useCallback(async () => {
    setErrors({}); setLoading(p=>({...p,business:true}));
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/business`, { method:"PUT", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` }, body:JSON.stringify(business) });
      const data = await res.json();
      if (res.ok) showSuccess("business");
      else setErrors({ business: data.error });
    } catch { setErrors({ business:"Cannot connect to server." }); }
    setLoading(p=>({...p,business:false}));
  }, [business, showSuccess]);

  // Change password
  const changePassword = useCallback(async () => {
    const e = {};
    if (!passwords.current)               e.current = "Current password required";
    if (!passwords.newPass)               e.newPass = "New password required";
    else if (passwords.newPass.length < 8) e.newPass = "Minimum 8 characters";
    else if (!/[A-Z]/.test(passwords.newPass)) e.newPass = "Must include uppercase letter";
    else if (!/[0-9]/.test(passwords.newPass)) e.newPass = "Must include a number";
    if (passwords.newPass !== passwords.confirm) e.confirm = "Passwords do not match";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(p=>({...p,password:true}));
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/password`, { method:"PUT", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` }, body:JSON.stringify({ current_password:passwords.current, new_password:passwords.newPass }) });
      const data = await res.json();
      if (res.ok) { setPasswords({ current:"", newPass:"", confirm:"" }); showSuccess("password"); }
      else setErrors({ current: data.error });
    } catch { setErrors({ current:"Cannot connect to server." }); }
    setLoading(p=>({...p,password:false}));
  }, [passwords, showSuccess]);

  const EyeBtn = ({ field }) => (
    <button type="button" onClick={() => setShowPass(p=>({...p,[field]:!p[field]}))}
      style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#6A8A7A", display:"flex", padding:"4px" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {showPass[field]
          ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
          : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>}
      </svg>
    </button>
  );

  const SaveBtn = ({ onClick, loading: l, success: s, label="Save Changes" }) => (
    <button onClick={onClick} disabled={l}
      style={{ padding:"11px 22px", background: s?"#27AE60":"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:"600", cursor:l?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.3s", boxShadow:"0 2px 8px rgba(13,61,46,0.2)", display:"flex", alignItems:"center", gap:"7px" }}
      onMouseOver={e=>{ if(!l&&!s) e.currentTarget.style.background="#1A5C44"; }}
      onMouseOut={e=>{  if(!l&&!s) e.currentTarget.style.background="#0D3D2E"; }}>
      {s ? <>✓ Saved!</> : l ? "Saving..." : label}
    </button>
  );

  if (fetchLoad) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"64px" }}>
      <span style={{ display:"inline-block", width:"28px", height:"28px", border:"3px solid #D8EAE2", borderTopColor:"#0D3D2E", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ animation:"fadeUp 0.4s ease both" }}>
        <div style={{ marginBottom:"24px" }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"24px", color:"#0D3D2E", marginBottom:"4px" }}>Settings</h2>
          <p style={{ fontSize:"13px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>Manage your account and business details</p>
        </div>

        {/* Profile */}
        <Section title="Your Profile" subtitle="Update your personal account information">
          {errors.profile && <div role="alert" style={{ fontSize:"13px", color:"#922B21", background:"#FDECEA", border:"1.5px solid #F5B7B1", borderRadius:"10px", padding:"10px 14px", marginBottom:"16px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {errors.profile}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <Field id="full_name" label="Full Name" placeholder="John Smith" value={profile.full_name}
              onChange={e=>{ setProfile(p=>({...p,full_name:e.target.value})); setErrors(p=>({...p,full_name:""})); }}
              error={errors.full_name}/>
            <Field id="email" label="Email Address" type="email" placeholder="you@example.com" value={profile.email}
              onChange={e=>{ setProfile(p=>({...p,email:e.target.value})); setErrors(p=>({...p,email:""})); }}
              error={errors.email}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <SaveBtn onClick={saveProfile} loading={loading.profile} success={success.profile}/>
          </div>
        </Section>

        {/* Business Info */}
        <Section title="Business Information" subtitle="This info appears on your invoices">
          {errors.business && <div role="alert" style={{ fontSize:"13px", color:"#922B21", background:"#FDECEA", border:"1.5px solid #F5B7B1", borderRadius:"10px", padding:"10px 14px", marginBottom:"16px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {errors.business}</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <Field id="business_name" label="Business Name" placeholder="Acme Studio" value={business.business_name}
              onChange={e=>setBusiness(p=>({...p,business_name:e.target.value}))}/>
            <Field id="biz_email" label="Business Email" type="email" placeholder="hello@acme.com" value={business.email}
              onChange={e=>setBusiness(p=>({...p,email:e.target.value}))}/>
            <Field id="biz_phone" label="Phone" placeholder="+1 555 000 0000" value={business.phone}
              onChange={e=>setBusiness(p=>({...p,phone:e.target.value}))}/>
            <Field id="biz_website" label="Website" placeholder="https://acme.com" value={business.website}
              onChange={e=>setBusiness(p=>({...p,website:e.target.value}))}/>
            <Field id="tax_id" label="Tax ID / VAT Number" placeholder="Optional" value={business.tax_id}
              onChange={e=>setBusiness(p=>({...p,tax_id:e.target.value}))}/>
            <div style={{ marginBottom:"16px" }}>
              <label htmlFor="currency" style={{ display:"block", fontSize:"11px", fontWeight:"600", color:"#4A6741", marginBottom:"6px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Currency</label>
              <select id="currency" value={business.currency} onChange={e=>setBusiness(p=>({...p,currency:e.target.value}))}
                style={{ width:"100%", padding:"11px 14px", fontSize:"14px", color:"#0D3D2E", background:"#F8FBF9", border:"1.5px solid #C8DDD5", borderRadius:"10px", outline:"none", fontFamily:"'DM Sans',sans-serif" }}>
                {[["USD","$ USD"],["EUR","€ EUR"],["GBP","£ GBP"],["AUD","A$ AUD"],["CAD","C$ CAD"],["EGP","E£ EGP"]].map(([v,l])=>(
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <Field id="biz_address" label="Address" placeholder="123 Main St, City, Country" value={business.address}
            onChange={e=>setBusiness(p=>({...p,address:e.target.value}))}/>
          <div style={{ marginBottom:"16px" }}>
            <label htmlFor="invoice_notes" style={{ display:"block", fontSize:"11px", fontWeight:"600", color:"#4A6741", marginBottom:"6px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>
              Default Invoice Notes
            </label>
            <textarea id="invoice_notes" value={business.invoice_notes} onChange={e=>setBusiness(p=>({...p,invoice_notes:e.target.value}))}
              placeholder="e.g. Payment due within 14 days. Thank you for your business!"
              rows={2} style={{ width:"100%", padding:"11px 14px", fontSize:"14px", color:"#0D3D2E", background:"#F8FBF9", border:"1.5px solid #C8DDD5", borderRadius:"10px", outline:"none", fontFamily:"'DM Sans',sans-serif", resize:"vertical", lineHeight:1.5, boxSizing:"border-box" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <SaveBtn onClick={saveBusiness} loading={loading.business} success={success.business}/>
          </div>
        </Section>

        {/* Change Password */}
        <Section title="Change Password" subtitle="Leave blank if you signed up with Google">
          {["current","newPass","confirm"].map((field) => {
            const labels = { current:"Current Password", newPass:"New Password", confirm:"Confirm New Password" };
            const placeholders = { current:"Your current password", newPass:"Min. 8 characters", confirm:"Repeat new password" };
            return (
              <div key={field} style={{ marginBottom:"16px" }}>
                <label htmlFor={field} style={{ display:"block", fontSize:"11px", fontWeight:"600", color:"#4A6741", marginBottom:"6px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{labels[field]}</label>
                <div style={{ position:"relative" }}>
                  <input id={field} type={showPass[field]?"text":"password"} placeholder={placeholders[field]} value={passwords[field]}
                    onChange={e=>{ setPasswords(p=>({...p,[field]:e.target.value})); setErrors(p=>({...p,[field]:""})); }}
                    style={{ width:"100%", padding:"11px 44px 11px 14px", fontSize:"14px", color:"#0D3D2E", background:"#F8FBF9", border: errors[field]?"2px solid #E74C3C":"1.5px solid #C8DDD5", borderRadius:"10px", outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}
                    onFocus={e=>{ if(!errors[field]) e.target.style.border="2px solid #0D3D2E"; }}
                    onBlur={e=>{  if(!errors[field]) e.target.style.border="1.5px solid #C8DDD5"; }}/>
                  <EyeBtn field={field}/>
                </div>
                {errors[field] && <p role="alert" style={{ fontSize:"11px", color:"#E74C3C", marginTop:"4px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {errors[field]}</p>}
              </div>
            );
          })}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <SaveBtn onClick={changePassword} loading={loading.password} success={success.password} label="Update Password"/>
          </div>
        </Section>

        {/* Danger Zone */}
        <div style={{ background:"#FFF8F8", border:"1.5px solid #FADBD8", borderRadius:"16px", padding:"24px" }}>
          <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"16px", color:"#C0392B", marginBottom:"6px" }}>Danger Zone</h3>
          <p style={{ fontSize:"13px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", marginBottom:"16px" }}>These actions are permanent and cannot be undone.</p>
          <button style={{ padding:"10px 18px", background:"none", border:"1.5px solid #E74C3C", borderRadius:"9px", fontSize:"13px", fontWeight:"600", color:"#E74C3C", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
            onMouseOver={e=>{e.currentTarget.style.background="#E74C3C";e.currentTarget.style.color="#fff";}}
            onMouseOut={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="#E74C3C";}}>
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}
