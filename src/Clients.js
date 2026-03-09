import { useState, useEffect, useCallback, memo, useMemo } from "react";

// ── helpers ───────────────────────────────────────────
const getToken = () => localStorage.getItem("inv_token") || sessionStorage.getItem("inv_token");

const initials = (name = "") => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const COLORS = ["#0D3D2E","#1A5C44","#C9A84C","#1A6FA8","#8B5CF6","#E74C3C","#F39C12","#27AE60"];
const getColor = (name = "") => COLORS[name.charCodeAt(0) % COLORS.length];

// ── Icons ─────────────────────────────────────────────
const Ico = memo(({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {typeof d === "string" ? <path d={d}/> : d}
  </svg>
));

const SearchIcon = <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>;
const PlusIcon   = <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>;
const EditIcon   = <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>;
const TrashIcon  = <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>;
const XIcon      = <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>;
const UserIcon   = <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>;

// ── Input ─────────────────────────────────────────────
const Field = memo(({ id, label, type = "text", placeholder, value, onChange, error, required, autoComplete }) => (
  <div style={{ marginBottom: "16px" }}>
    <label htmlFor={id} style={{ display:"block", fontSize:"11px", fontWeight:"600", color:"#4A6741", marginBottom:"6px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>
      {label}{required && <span style={{ color:"#E74C3C", marginLeft:"2px" }}>*</span>}
    </label>
    <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
      autoComplete={autoComplete || "off"} aria-required={required} aria-invalid={!!error}
      style={{ width:"100%", padding:"11px 14px", fontSize:"14px", color:"#0D3D2E", background:"#F8FBF9", border: error ? "2px solid #E74C3C" : "1.5px solid #C8DDD5", borderRadius:"10px", outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border 0.2s" }}
      onFocus={e => { if (!error) e.target.style.border = "2px solid #0D3D2E"; }}
      onBlur={e  => { if (!error) e.target.style.border = "1.5px solid #C8DDD5"; }}
    />
    {error && <p role="alert" style={{ fontSize:"12px", color:"#E74C3C", marginTop:"4px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {error}</p>}
  </div>
));

// ── Client Modal ──────────────────────────────────────
const ClientModal = memo(({ client, onClose, onSave }) => {
  const editing = !!client?.id;
  const [form, setForm]     = useState({ name:"", email:"", phone:"", company:"", address:"", ...(client||{}) });
  const [errors, setErrors] = useState({});
  const [loading, setLoad]  = useState(false);
  const [serverErr, setSErr]= useState("");

  const update = useCallback((field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]:"" }));
    setSErr("");
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!form.name.trim())  e.name  = "Client name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    return e;
  }, [form]);

  const handleSave = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoad(true); setSErr("");
    try {
      const url    = editing ? `${process.env.REACT_APP_API_URL}/api/clients/${client.id}` : `${process.env.REACT_APP_API_URL}/api/clients`;
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` }, body: JSON.stringify(form) });
      const data   = await res.json();
      if (!res.ok) { setSErr(data.error || "Failed to save client."); }
      else { onSave(data.client); onClose(); }
    } catch { setSErr("Cannot connect to server."); }
    setLoad(false);
  }, [form, validate, editing, client, onSave, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={editing ? "Edit client" : "Add client"}
      style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(13,61,46,0.45)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
      <div style={{ position:"relative", zIndex:1, background:"#fff", borderRadius:"20px", padding:"32px", width:"100%", maxWidth:"480px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(13,61,46,0.2)", animation:"popIn 0.25s ease" }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
          <div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"22px", color:"#0D3D2E", marginBottom:"2px" }}>{editing ? "Edit Client" : "Add New Client"}</h2>
            <p style={{ fontSize:"12px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>
              {editing ? "Update client details" : "Add a client to start invoicing them"}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background:"#F4F8F6", border:"none", borderRadius:"8px", padding:"8px", cursor:"pointer", color:"#4A6741", display:"flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{XIcon}</svg>
          </button>
        </div>

        {serverErr && <div role="alert" style={{ fontSize:"13px", color:"#922B21", background:"#FDECEA", border:"1.5px solid #F5B7B1", borderRadius:"10px", padding:"10px 14px", marginBottom:"16px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {serverErr}</div>}

        <Field id="name"    label="Full Name"    placeholder="John Smith"          value={form.name}    onChange={update("name")}    error={errors.name}  required autoComplete="name"/>
        <Field id="email"   label="Email"        placeholder="john@example.com"    value={form.email}   onChange={update("email")}   error={errors.email} autoComplete="email" type="email"/>
        <Field id="phone"   label="Phone"        placeholder="+1 555 000 0000"     value={form.phone}   onChange={update("phone")}   autoComplete="tel"   type="tel"/>
        <Field id="company" label="Company"      placeholder="Acme Inc. (optional)"value={form.company} onChange={update("company")}/>
        <Field id="address" label="Address"      placeholder="123 Main St (optional)" value={form.address} onChange={update("address")}/>

        <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px", background:"none", border:"1.5px solid #C8DDD5", borderRadius:"10px", fontSize:"14px", fontWeight:"600", color:"#6A8A7A", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
            onMouseOver={e=>{e.target.style.borderColor="#0D3D2E";e.target.style.color="#0D3D2E";}} onMouseOut={e=>{e.target.style.borderColor="#C8DDD5";e.target.style.color="#6A8A7A";}}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"12px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"600", cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(13,61,46,0.2)" }}
            onMouseOver={e=>{ if (!loading) e.target.style.background="#1A5C44"; }} onMouseOut={e=>{ if (!loading) e.target.style.background="#0D3D2E"; }}>
            {loading ? "Saving..." : editing ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Delete Confirm ────────────────────────────────────
const DeleteModal = memo(({ client, onClose, onConfirm, loading }) => (
  <div role="dialog" aria-modal="true" aria-label="Delete client"
    style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
    <div style={{ position:"absolute", inset:0, background:"rgba(13,61,46,0.45)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
    <div style={{ position:"relative", zIndex:1, background:"#fff", borderRadius:"20px", padding:"32px", width:"100%", maxWidth:"400px", textAlign:"center", boxShadow:"0 20px 60px rgba(13,61,46,0.2)", animation:"popIn 0.25s ease" }}>
      <div style={{ width:"52px", height:"52px", background:"#FFF0F0", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TrashIcon}</svg>
      </div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"20px", color:"#0D3D2E", marginBottom:"8px" }}>Delete Client?</h2>
      <p style={{ fontSize:"14px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif", marginBottom:"24px", lineHeight:1.5 }}>
        Are you sure you want to delete <strong style={{ color:"#0D3D2E" }}>{client?.name}</strong>? This cannot be undone.
      </p>
      <div style={{ display:"flex", gap:"10px" }}>
        <button onClick={onClose} style={{ flex:1, padding:"12px", background:"none", border:"1.5px solid #C8DDD5", borderRadius:"10px", fontSize:"14px", fontWeight:"600", color:"#6A8A7A", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ flex:1, padding:"12px", background:"#E74C3C", color:"#fff", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"600", cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
));

// ── Client Card ───────────────────────────────────────
const ClientCard = memo(({ client, onEdit, onDelete, delay }) => {
  const bg = getColor(client.name);
  return (
    <div style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"16px", padding:"20px", transition:"all 0.2s", animation:`fadeUp 0.4s ease ${delay}s both`, cursor:"default" }}
      onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(13,61,46,0.09)";e.currentTarget.style.borderColor="#C8DDD5";}}
      onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#E8F0EC";}}>

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"44px", height:"44px", borderRadius:"14px", background:bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:"14px", fontWeight:"700", color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>{initials(client.name)}</span>
          </div>
          <div>
            <div style={{ fontSize:"14px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif", lineHeight:1.2 }}>{client.name}</div>
            {client.company && <div style={{ fontSize:"12px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", marginTop:"2px" }}>{client.company}</div>}
          </div>
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          <button onClick={() => onEdit(client)} aria-label={`Edit ${client.name}`}
            style={{ background:"#F4F8F6", border:"none", borderRadius:"8px", padding:"7px", cursor:"pointer", color:"#4A6741", display:"flex", transition:"all 0.2s" }}
            onMouseOver={e=>{e.currentTarget.style.background="#0D3D2E";e.currentTarget.style.color="#fff";}}
            onMouseOut={e=>{e.currentTarget.style.background="#F4F8F6";e.currentTarget.style.color="#4A6741";}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{EditIcon}</svg>
          </button>
          <button onClick={() => onDelete(client)} aria-label={`Delete ${client.name}`}
            style={{ background:"#FFF0F0", border:"none", borderRadius:"8px", padding:"7px", cursor:"pointer", color:"#E74C3C", display:"flex", transition:"all 0.2s" }}
            onMouseOver={e=>{e.currentTarget.style.background="#E74C3C";e.currentTarget.style.color="#fff";}}
            onMouseOut={e=>{e.currentTarget.style.background="#FFF0F0";e.currentTarget.style.color="#E74C3C";}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TrashIcon}</svg>
          </button>
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
        {client.email && (
          <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
            {client.phone}
          </div>
        )}
      </div>

      <div style={{ marginTop:"14px", paddingTop:"12px", borderTop:"1px solid #F0F5F2", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:"11px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>
          Added {new Date(client.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
        </span>
        <span style={{ fontSize:"11px", fontWeight:"600", color:"#4A8A6A", fontFamily:"'DM Sans',sans-serif", background:"#F0F7F4", padding:"3px 8px", borderRadius:"20px" }}>
          {client.invoice_count || 0} invoice{client.invoice_count !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
});

// ── Main Clients Page ─────────────────────────────────
export default function Clients() {
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(null);   // null | "add" | {client}
  const [deleteTarget, setDel]    = useState(null);
  const [delLoading, setDelLoad]  = useState(false);

  // ── Fetch clients ─────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/clients`, { headers: { Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to load clients.");
      else setClients(data.clients || []);
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ── Save (add or edit) ────────────────────────────
  const handleSave = useCallback((saved) => {
    setClients(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  }, []);

  // ── Delete ────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDelLoad(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/clients/${deleteTarget.id}`, { method:"DELETE", headers: { Authorization:`Bearer ${getToken()}` } });
      if (res.ok) { setClients(prev => prev.filter(c => c.id !== deleteTarget.id)); setDel(null); }
      else { const d = await res.json(); setError(d.error || "Failed to delete."); }
    } catch { setError("Cannot connect to server."); }
    setDelLoad(false);
  }, [deleteTarget]);

  // ── Filter ────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", animation:"fadeUp 0.4s ease both" }}>
        <div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"24px", color:"#0D3D2E", marginBottom:"4px" }}>Clients</h2>
          <p style={{ fontSize:"13px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button onClick={() => setModal("add")}
          style={{ display:"flex", alignItems:"center", gap:"7px", padding:"11px 18px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(13,61,46,0.2)" }}
          onMouseOver={e=>{e.currentTarget.style.background="#1A5C44";e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseOut={e=>{e.currentTarget.style.background="#0D3D2E";e.currentTarget.style.transform="translateY(0)";}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PlusIcon}</svg>
          Add Client
        </button>
      </div>

      {/* Search bar */}
      {clients.length > 0 && (
        <div style={{ position:"relative", marginBottom:"20px", animation:"fadeUp 0.4s ease 0.05s both" }}>
          <div style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"#8AADA0", pointerEvents:"none", display:"flex" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{SearchIcon}</svg>
          </div>
          <input type="search" placeholder="Search by name, email or company..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search clients"
            style={{ width:"100%", padding:"11px 14px 11px 40px", fontSize:"14px", color:"#0D3D2E", background:"#fff", border:"1.5px solid #E8F0EC", borderRadius:"10px", outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border 0.2s" }}
            onFocus={e=>e.target.style.border="2px solid #0D3D2E"} onBlur={e=>e.target.style.border="1.5px solid #E8F0EC"}/>
        </div>
      )}

      {/* Error */}
      {error && <div role="alert" style={{ fontSize:"13px", color:"#922B21", background:"#FDECEA", border:"1.5px solid #F5B7B1", borderRadius:"10px", padding:"11px 14px", marginBottom:"16px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {error}</div>}

      {/* Loading */}
      {loading && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"64px" }}>
          <span style={{ display:"inline-block", width:"32px", height:"32px", border:"3px solid #D8EAE2", borderTopColor:"#0D3D2E", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
        </div>
      )}

      {/* Empty state */}
      {!loading && clients.length === 0 && (
        <div style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"16px", padding:"64px 32px", textAlign:"center", animation:"fadeUp 0.4s ease both" }}>
          <div style={{ width:"64px", height:"64px", background:"#F0F7F4", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A8A6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{UserIcon}</svg>
          </div>
          <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"20px", color:"#0D3D2E", marginBottom:"8px" }}>No clients yet</h3>
          <p style={{ fontSize:"14px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", marginBottom:"24px" }}>Add your first client to start creating invoices for them</p>
          <button onClick={() => setModal("add")}
            style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"11px 20px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 2px 8px rgba(13,61,46,0.2)" }}
            onMouseOver={e=>e.currentTarget.style.background="#1A5C44"} onMouseOut={e=>e.currentTarget.style.background="#0D3D2E"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PlusIcon}</svg>
            Add First Client
          </button>
        </div>
      )}

      {/* No search results */}
      {!loading && clients.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", fontSize:"14px" }}>
          No clients match "<strong>{search}</strong>"
        </div>
      )}

      {/* Client grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"16px" }}>
          {filtered.map((c, i) => (
            <ClientCard key={c.id} client={c} onEdit={c => setModal(c)} onDelete={c => setDel(c)} delay={i * 0.05}/>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal !== null && (
        <ClientModal
          client={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          client={deleteTarget}
          onClose={() => setDel(null)}
          onConfirm={handleDelete}
          loading={delLoading}
        />
      )}
    </>
  );
}
