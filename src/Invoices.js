import PrintInvoice from "./PrintInvoice";
import { useState, useEffect, useCallback, memo, useMemo } from "react";

const getToken = () => localStorage.getItem("inv_token") || sessionStorage.getItem("inv_token");

const fmt = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const STATUS = {
  draft:   { label:"Draft",   bg:"#F4F8F6", color:"#8AADA0", dot:"#8AADA0" },
  sent:    { label:"Sent",    bg:"#EEF6FF", color:"#1A6FA8", dot:"#1A6FA8" },
  paid:    { label:"Paid",    bg:"#F0FFF4", color:"#27AE60", dot:"#27AE60" },
  overdue: { label:"Overdue", bg:"#FFF0F0", color:"#E74C3C", dot:"#E74C3C" },
};

const Badge = memo(({ status }) => {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:s.bg, color:s.color, fontSize:"11px", fontWeight:"700", padding:"4px 10px", borderRadius:"20px", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
      <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:s.dot }}/>
      {s.label}
    </span>
  );
});

// ── Icons ─────────────────────────────────────────────
const PlusIcon   = <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>;
const TrashIcon  = <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>;
const XIcon      = <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>;
const EyeIcon    = <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>;
const EditIcon   = <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>;
const SendIcon   = <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>;
const CheckIcon  = <><polyline points="20 6 9 17 4 12"/></>;

const Svg = ({ size = 16, d }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {typeof d==="string"?<path d={d}/>:d}
  </svg>
);

// ── New/Edit Invoice Modal ─────────────────────────────
const InvoiceModal = memo(({ invoice, clients, onClose, onSave }) => {
  const editing = !!invoice?.id;
  const today   = new Date().toISOString().split("T")[0];
  const due     = new Date(Date.now()+14*86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    client_id:  invoice?.client_id  || "",
    issue_date: invoice?.issue_date?.split("T")[0] || today,
    due_date:   invoice?.due_date?.split("T")[0]   || due,
    notes:      invoice?.notes      || "",
    tax_rate:   invoice?.tax_rate   || 0,
    status:     invoice?.status     || "draft",
  });
  const [items, setItems] = useState(
    invoice?.items?.length ? invoice.items : [{ description:"", quantity:1, unit_price:0 }]
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoad]  = useState(false);
  const [serverErr, setSErr]= useState("");

  const updateForm = useCallback((field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]:"" }));
  }, []);

  const updateItem = useCallback((idx, field) => (e) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: e.target.value };
      return next;
    });
  }, []);

  const addItem    = useCallback(() => setItems(p => [...p, { description:"", quantity:1, unit_price:0 }]), []);
  const removeItem = useCallback((idx) => setItems(p => p.filter((_,i) => i!==idx)), []);

  const subtotal = useMemo(() =>
    items.reduce((s, it) => s + (parseFloat(it.quantity)||0) * (parseFloat(it.unit_price)||0), 0)
  , [items]);
  const taxAmt   = useMemo(() => subtotal * (parseFloat(form.tax_rate)||0) / 100, [subtotal, form.tax_rate]);
  const total    = useMemo(() => subtotal + taxAmt, [subtotal, taxAmt]);

  const validate = useCallback(() => {
    const e = {};
    if (!form.client_id)  e.client_id  = "Please select a client";
    if (!form.issue_date) e.issue_date = "Issue date is required";
    if (!form.due_date)   e.due_date   = "Due date is required";
    if (!items.some(it => it.description.trim())) e.items = "Add at least one item";
    return e;
  }, [form, items]);

  const handleSave = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoad(true); setSErr("");
    try {
      const url    = editing ? `${process.env.REACT_APP_API_URL}/api/invoices/${invoice.id}` : `${process.env.REACT_APP_API_URL}/api/invoices`;
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ ...form, items, subtotal, tax_amount:taxAmt, total }),
      });
      const data = await res.json();
      if (!res.ok) setSErr(data.error || "Failed to save invoice.");
      else { onSave(data.invoice); onClose(); }
    } catch { setSErr("Cannot connect to server."); }
    setLoad(false);
  }, [form, items, subtotal, taxAmt, total, validate, editing, invoice, onSave, onClose]);

  const inputStyle = { width:"100%", padding:"10px 12px", fontSize:"13px", color:"#0D3D2E", background:"#F8FBF9", border:"1.5px solid #C8DDD5", borderRadius:"9px", outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", transition:"border 0.2s" };
  const labelStyle = { display:"block", fontSize:"10px", fontWeight:"600", color:"#4A6741", marginBottom:"5px", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" };

  return (
    <div role="dialog" aria-modal="true" style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(13,61,46,0.45)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
      <div style={{ position:"relative", zIndex:1, background:"#fff", borderRadius:"20px", padding:"32px", width:"100%", maxWidth:"640px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(13,61,46,0.2)", animation:"popIn 0.25s ease" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
          <div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"22px", color:"#0D3D2E", marginBottom:"2px" }}>{editing?"Edit Invoice":"New Invoice"}</h2>
            <p style={{ fontSize:"12px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>{editing?"Update invoice details":"Fill in the details below"}</p>
          </div>
          <button onClick={onClose} style={{ background:"#F4F8F6", border:"none", borderRadius:"8px", padding:"8px", cursor:"pointer", color:"#4A6741", display:"flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{XIcon}</svg>
          </button>
        </div>

        {serverErr && <div role="alert" style={{ fontSize:"13px", color:"#922B21", background:"#FDECEA", border:"1.5px solid #F5B7B1", borderRadius:"10px", padding:"10px 14px", marginBottom:"16px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {serverErr}</div>}

        {/* Client + Status */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
          <div>
            <label style={labelStyle}>Client *</label>
            <select value={form.client_id} onChange={updateForm("client_id")}
              style={{ ...inputStyle, border: errors.client_id ? "2px solid #E74C3C" : "1.5px solid #C8DDD5" }}>
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company?` — ${c.company}`:""}</option>)}
            </select>
            {errors.client_id && <p style={{ fontSize:"11px", color:"#E74C3C", marginTop:"3px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {errors.client_id}</p>}
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={updateForm("status")} style={inputStyle}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }}>
          <div>
            <label style={labelStyle}>Issue Date *</label>
            <input type="date" value={form.issue_date} onChange={updateForm("issue_date")}
              style={{ ...inputStyle, border: errors.issue_date?"2px solid #E74C3C":"1.5px solid #C8DDD5" }}/>
          </div>
          <div>
            <label style={labelStyle}>Due Date *</label>
            <input type="date" value={form.due_date} onChange={updateForm("due_date")}
              style={{ ...inputStyle, border: errors.due_date?"2px solid #E74C3C":"1.5px solid #C8DDD5" }}/>
          </div>
        </div>

        {/* Line items */}
        <div style={{ marginBottom:"20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" }}>
            <label style={{ ...labelStyle, marginBottom:0 }}>Line Items *</label>
            <button onClick={addItem} style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"12px", fontWeight:"600", color:"#0D3D2E", background:"#F0F7F4", border:"none", borderRadius:"7px", padding:"5px 10px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{PlusIcon}</svg>
              Add Line
            </button>
          </div>
          {errors.items && <p style={{ fontSize:"11px", color:"#E74C3C", marginBottom:"8px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {errors.items}</p>}

          {/* Items header */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 100px 80px 28px", gap:"6px", marginBottom:"6px" }}>
            {["Description","Qty","Unit Price","Total",""].map((h,i) => (
              <div key={i} style={{ fontSize:"10px", fontWeight:"600", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</div>
            ))}
          </div>

          {items.map((item, idx) => {
            const lineTotal = (parseFloat(item.quantity)||0) * (parseFloat(item.unit_price)||0);
            return (
              <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 80px 100px 80px 28px", gap:"6px", marginBottom:"6px", alignItems:"center" }}>
                <input placeholder="Service description..." value={item.description} onChange={updateItem(idx,"description")}
                  style={inputStyle}/>
                <input type="number" placeholder="1" min="0" value={item.quantity} onChange={updateItem(idx,"quantity")}
                  style={{ ...inputStyle, textAlign:"center" }}/>
                <input type="number" placeholder="0.00" min="0" step="0.01" value={item.unit_price} onChange={updateItem(idx,"unit_price")}
                  style={{ ...inputStyle, textAlign:"right" }}/>
                <div style={{ fontSize:"13px", fontWeight:"600", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif", textAlign:"right", padding:"0 4px" }}>
                  {fmt(lineTotal)}
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} aria-label="Remove line"
                    style={{ background:"#FFF0F0", border:"none", borderRadius:"7px", padding:"6px", cursor:"pointer", color:"#E74C3C", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{XIcon}</svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div style={{ background:"#F8FBF9", borderRadius:"12px", padding:"16px", marginBottom:"16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
            <span style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>Subtotal</span>
            <span style={{ fontSize:"13px", fontWeight:"600", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{fmt(subtotal)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>Tax</span>
              <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                <input type="number" min="0" max="100" step="0.1" value={form.tax_rate} onChange={updateForm("tax_rate")}
                  style={{ width:"60px", padding:"4px 20px 4px 8px", fontSize:"12px", color:"#0D3D2E", background:"#fff", border:"1.5px solid #C8DDD5", borderRadius:"7px", outline:"none", fontFamily:"'DM Sans',sans-serif" }}/>
                <span style={{ position:"absolute", right:"7px", fontSize:"11px", color:"#8AADA0", pointerEvents:"none" }}>%</span>
              </div>
            </div>
            <span style={{ fontSize:"13px", fontWeight:"600", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{fmt(taxAmt)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"10px", borderTop:"1.5px solid #E8F0EC" }}>
            <span style={{ fontSize:"15px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>Total</span>
            <span style={{ fontSize:"18px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Serif Display',serif" }}>{fmt(total)}</span>
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom:"20px" }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea value={form.notes} onChange={updateForm("notes")} placeholder="Payment terms, thank you message, etc."
            rows={2} style={{ ...inputStyle, resize:"vertical", lineHeight:1.5 }}/>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:"10px" }}>
          <button onClick={onClose} style={{ flex:1, padding:"12px", background:"none", border:"1.5px solid #C8DDD5", borderRadius:"10px", fontSize:"14px", fontWeight:"600", color:"#6A8A7A", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}
            onMouseOver={e=>{e.target.style.borderColor="#0D3D2E";e.target.style.color="#0D3D2E";}} onMouseOut={e=>{e.target.style.borderColor="#C8DDD5";e.target.style.color="#6A8A7A";}}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"12px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"600", cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(13,61,46,0.2)" }}
            onMouseOver={e=>{if(!loading)e.target.style.background="#1A5C44";}} onMouseOut={e=>{if(!loading)e.target.style.background="#0D3D2E";}}>
            {loading ? "Saving..." : editing ? "Save Changes" : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Invoice Detail Modal ───────────────────────────────
const DetailModal = memo(({ invoice, onClose, onStatusChange, onPrint }) => {
  const [updating, setUpdating] = useState(false);

  const changeStatus = useCallback(async (status) => {
    setUpdating(true);
    try {
      const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/invoices/${invoice.id}/status`, {
        method:"PUT", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) onStatusChange(data.invoice);
    } catch {}
    setUpdating(false);
  }, [invoice, onStatusChange]);

  return (
    <div role="dialog" aria-modal="true" style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(13,61,46,0.45)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
      <div style={{ position:"relative", zIndex:1, background:"#fff", borderRadius:"20px", padding:"32px", width:"100%", maxWidth:"560px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(13,61,46,0.2)", animation:"popIn 0.25s ease" }}>

        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"24px" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"22px", color:"#0D3D2E" }}>{invoice.invoice_number}</h2>
              <Badge status={invoice.status}/>
            </div>
            <p style={{ fontSize:"13px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>
              {invoice.client_name}{invoice.client_company ? ` · ${invoice.client_company}` : ""}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"#F4F8F6", border:"none", borderRadius:"8px", padding:"8px", cursor:"pointer", color:"#4A6741", display:"flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{XIcon}</svg>
          </button>
        </div>

        {/* Dates */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }}>
          {[["Issue Date", invoice.issue_date], ["Due Date", invoice.due_date]].map(([l, v]) => (
            <div key={l} style={{ background:"#F8FBF9", borderRadius:"10px", padding:"12px" }}>
              <div style={{ fontSize:"10px", fontWeight:"600", color:"#8AADA0", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif", marginBottom:"4px" }}>{l}</div>
              <div style={{ fontSize:"14px", fontWeight:"600", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>
                {v ? new Date(v).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
              </div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div style={{ marginBottom:"16px" }}>
          <div style={{ fontSize:"10px", fontWeight:"600", color:"#8AADA0", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif", marginBottom:"10px" }}>Line Items</div>
          {(invoice.items||[]).map((item, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #F0F5F2" }}>
              <div>
                <div style={{ fontSize:"13px", fontWeight:"600", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{item.description}</div>
                <div style={{ fontSize:"11px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>{item.quantity} × {fmt(item.unit_price)}</div>
              </div>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{fmt(item.total)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ background:"#F8FBF9", borderRadius:"12px", padding:"16px", marginBottom:"20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
            <span style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>Subtotal</span>
            <span style={{ fontSize:"13px", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{fmt(invoice.subtotal)}</span>
          </div>
          {invoice.tax_rate > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
              <span style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>Tax ({invoice.tax_rate}%)</span>
              <span style={{ fontSize:"13px", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{fmt(invoice.tax_amount)}</span>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"10px", borderTop:"1.5px solid #E8F0EC" }}>
            <span style={{ fontSize:"15px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>Total</span>
            <span style={{ fontSize:"20px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Serif Display',serif" }}>{fmt(invoice.total)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div style={{ background:"#F8FBF9", borderRadius:"10px", padding:"12px", marginBottom:"20px" }}>
            <div style={{ fontSize:"10px", fontWeight:"600", color:"#8AADA0", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'DM Sans',sans-serif", marginBottom:"6px" }}>Notes</div>
            <p style={{ fontSize:"13px", color:"#4A6741", fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>{invoice.notes}</p>
          </div>
        )}

        {/* Status actions */}
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          {invoice.status !== "paid" && (
            <button onClick={() => changeStatus("paid")} disabled={updating}
              style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:"#27AE60", color:"#fff", border:"none", borderRadius:"9px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{CheckIcon}</svg>
              Mark as Paid
            </button>
          )}
          {invoice.status === "draft" && (
            <button onClick={() => changeStatus("sent")} disabled={updating}
              style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:"#1A6FA8", color:"#fff", border:"none", borderRadius:"9px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{SendIcon}</svg>
              Mark as Sent
            </button>
          )}
          <button onClick={()=>onPrint(invoice)}
            style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:"#F4F8F6", border:"1.5px solid #C8DDD5", color:"#0D3D2E", borderRadius:"9px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            🖨️ PDF
          </button>
          <button onClick={onClose} style={{ padding:"10px 16px", background:"none", border:"1.5px solid #C8DDD5", borderRadius:"9px", fontSize:"13px", fontWeight:"600", color:"#6A8A7A", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginLeft:"auto" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

// ── Delete Modal ──────────────────────────────────────
const DeleteModal = memo(({ invoice, onClose, onConfirm, loading }) => (
  <div role="dialog" aria-modal="true" style={{ position:"fixed", inset:0, zIndex:110, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}>
    <div style={{ position:"absolute", inset:0, background:"rgba(13,61,46,0.45)", backdropFilter:"blur(4px)" }} onClick={onClose}/>
    <div style={{ position:"relative", zIndex:1, background:"#fff", borderRadius:"20px", padding:"32px", width:"100%", maxWidth:"380px", textAlign:"center", boxShadow:"0 20px 60px rgba(13,61,46,0.2)", animation:"popIn 0.25s ease" }}>
      <div style={{ width:"52px", height:"52px", background:"#FFF0F0", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{TrashIcon}</svg>
      </div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"20px", color:"#0D3D2E", marginBottom:"8px" }}>Delete Invoice?</h2>
      <p style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif", marginBottom:"24px", lineHeight:1.5 }}>
        Delete <strong style={{ color:"#0D3D2E" }}>{invoice?.invoice_number}</strong>? This cannot be undone.
      </p>
      <div style={{ display:"flex", gap:"10px" }}>
        <button onClick={onClose} style={{ flex:1, padding:"12px", background:"none", border:"1.5px solid #C8DDD5", borderRadius:"10px", fontSize:"14px", fontWeight:"600", color:"#6A8A7A", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={{ flex:1, padding:"12px", background:"#E74C3C", color:"#fff", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"600", cursor:loading?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          {loading?"Deleting...":"Delete"}
        </button>
      </div>
    </div>
  </div>
));

// ── Main Invoices Page ────────────────────────────────
export default function Invoices() {
  const [invoices, setInvoices]   = useState([]);
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("all");
  const [modal, setModal]         = useState(null);   // null | "new" | invoice obj
  const [detail, setDetail]       = useState(null);
  const [delTarget, setDelTarget] = useState(null);
  const [delLoad, setDelLoad]     = useState(false);
  const [printTarget, setPrint]   = useState(null);
  const [business, setBusiness]   = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [invRes, cliRes, bizRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/api/invoices`,{ headers:{ Authorization:`Bearer ${getToken()}` }}),
        fetch(`${process.env.REACT_APP_API_URL}/api/clients`, { headers:{ Authorization:`Bearer ${getToken()}` }}),
        fetch(`${process.env.REACT_APP_API_URL}/api/settings`, { headers:{ Authorization:`Bearer ${getToken()}` }}),
      ]);
      const [invData, cliData, bizData] = await Promise.all([invRes.json(), cliRes.json(), bizRes.json()]);
      if (!invRes.ok) setError(invData.error || "Failed to load invoices.");
      else { setInvoices(invData.invoices||[]); setClients(cliData.clients||[]); if (bizRes.ok) setBusiness(bizData.business); }
    } catch { setError("Cannot connect to server."); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = useCallback((saved) => {
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    });
  }, []);

  const handleStatusChange = useCallback((updated) => {
    setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
    setDetail(updated);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!delTarget) return;
    setDelLoad(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/invoices/${delTarget.id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${getToken()}` }});
      if (res.ok) { setInvoices(prev => prev.filter(i => i.id !== delTarget.id)); setDelTarget(null); }
    } catch {}
    setDelLoad(false);
  }, [delTarget]);

  const filtered = useMemo(() => filter === "all" ? invoices : invoices.filter(i => i.status === filter), [invoices, filter]);

  const counts = useMemo(() => ({
    all: invoices.length,
    draft: invoices.filter(i=>i.status==="draft").length,
    sent: invoices.filter(i=>i.status==="sent").length,
    paid: invoices.filter(i=>i.status==="paid").length,
    overdue: invoices.filter(i=>i.status==="overdue").length,
  }), [invoices]);

  const totalPending = useMemo(() => invoices.filter(i=>i.status==="sent"||i.status==="overdue").reduce((s,i)=>s+parseFloat(i.total||0),0), [invoices]);

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", animation:"fadeUp 0.4s ease both" }}>
        <div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"24px", color:"#0D3D2E", marginBottom:"4px" }}>Invoices</h2>
          <p style={{ fontSize:"13px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>
            {invoices.length} total · <span style={{ color:"#F39C12", fontWeight:"600" }}>{fmt(totalPending)} pending</span>
          </p>
        </div>
        <button onClick={() => setModal("new")}
          style={{ display:"flex", alignItems:"center", gap:"7px", padding:"11px 18px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(13,61,46,0.2)" }}
          onMouseOver={e=>{e.currentTarget.style.background="#1A5C44";e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseOut={e=>{e.currentTarget.style.background="#0D3D2E";e.currentTarget.style.transform="translateY(0)";}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{PlusIcon}</svg>
          New Invoice
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"20px", flexWrap:"wrap", animation:"fadeUp 0.4s ease 0.05s both" }}>
        {[["all","All"],["draft","Draft"],["sent","Sent"],["paid","Paid"],["overdue","Overdue"]].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding:"7px 14px", borderRadius:"20px", border: filter===val?"none":"1.5px solid #E8F0EC", background: filter===val?"#0D3D2E":"#fff", color: filter===val?"#fff":"#6A8A7A", fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s" }}>
            {label} {counts[val] > 0 && <span style={{ opacity:0.7 }}>({counts[val]})</span>}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div role="alert" style={{ fontSize:"13px", color:"#922B21", background:"#FDECEA", border:"1.5px solid #F5B7B1", borderRadius:"10px", padding:"11px 14px", marginBottom:"16px", fontFamily:"'DM Sans',sans-serif" }}>⚠ {error}</div>}

      {/* Loading */}
      {loading && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"64px" }}>
          <span style={{ display:"inline-block", width:"32px", height:"32px", border:"3px solid #D8EAE2", borderTopColor:"#0D3D2E", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
        </div>
      )}

      {/* Empty state */}
      {!loading && invoices.length === 0 && (
        <div style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"16px", padding:"64px 32px", textAlign:"center", animation:"fadeUp 0.4s ease both" }}>
          <div style={{ width:"64px", height:"64px", background:"#F0F7F4", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A8A6A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
          </div>
          <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"20px", color:"#0D3D2E", marginBottom:"8px" }}>No invoices yet</h3>
          <p style={{ fontSize:"14px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", marginBottom:"24px" }}>
            {clients.length === 0 ? "Add a client first, then create your first invoice" : "Create your first invoice and start getting paid"}
          </p>
          <button onClick={() => setModal("new")}
            style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"11px 20px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 2px 8px rgba(13,61,46,0.2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{PlusIcon}</svg>
            Create Invoice
          </button>
        </div>
      )}

      {/* Invoice table */}
      {!loading && invoices.length > 0 && (
        <div style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"16px", overflow:"hidden", animation:"fadeUp 0.4s ease both" }}>
          {/* Table header */}
          <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px 90px 100px 90px", gap:"0", padding:"12px 20px", borderBottom:"2px solid #F0F5F2", background:"#FAFCFB" }}>
            {["Number","Client","Date","Due","Status","Amount"].map((h,i) => (
              <div key={i} style={{ fontSize:"10px", fontWeight:"700", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em", textTransform:"uppercase", textAlign: i===5?"right":"left" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", fontSize:"14px" }}>
              No {filter} invoices found.
            </div>
          ) : filtered.map((inv, i) => (
            <div key={inv.id} style={{ display:"grid", gridTemplateColumns:"120px 1fr 110px 90px 100px 90px", gap:"0", padding:"14px 20px", borderBottom: i < filtered.length-1 ? "1px solid #F0F5F2" : "none", transition:"background 0.15s", cursor:"pointer" }}
              onMouseOver={e=>e.currentTarget.style.background="#FAFCFB"}
              onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{inv.invoice_number}</div>
              <div>
                <div style={{ fontSize:"13px", fontWeight:"600", color:"#2A4A3A", fontFamily:"'DM Sans',sans-serif" }}>{inv.client_name}</div>
                {inv.client_company && <div style={{ fontSize:"11px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>{inv.client_company}</div>}
              </div>
              <div style={{ fontSize:"12px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>
                {inv.issue_date ? new Date(inv.issue_date).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—"}
              </div>
              <div style={{ fontSize:"12px", color: inv.status==="overdue"?"#E74C3C":"#6A8A7A", fontFamily:"'DM Sans',sans-serif", fontWeight: inv.status==="overdue"?"700":"400" }}>
                {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—"}
              </div>
              <div><Badge status={inv.status}/></div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:"8px" }}>
                <span style={{ fontSize:"14px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Serif Display',serif" }}>{fmt(inv.total)}</span>
                <div style={{ display:"flex", gap:"4px" }}>
                  <button onClick={(e)=>{e.stopPropagation();setDetail(inv);}} aria-label="View"
                    style={{ background:"#F4F8F6", border:"none", borderRadius:"6px", padding:"5px", cursor:"pointer", color:"#4A6741", display:"flex", transition:"all 0.15s" }}
                    onMouseOver={e=>{e.currentTarget.style.background="#0D3D2E";e.currentTarget.style.color="#fff";}}
                    onMouseOut={e=>{e.currentTarget.style.background="#F4F8F6";e.currentTarget.style.color="#4A6741";}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{EyeIcon}</svg>
                  </button>
                  <button onClick={(e)=>{e.stopPropagation();setModal(inv);}} aria-label="Edit"
                    style={{ background:"#F4F8F6", border:"none", borderRadius:"6px", padding:"5px", cursor:"pointer", color:"#4A6741", display:"flex", transition:"all 0.15s" }}
                    onMouseOver={e=>{e.currentTarget.style.background="#0D3D2E";e.currentTarget.style.color="#fff";}}
                    onMouseOut={e=>{e.currentTarget.style.background="#F4F8F6";e.currentTarget.style.color="#4A6741";}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{EditIcon}</svg>
                  </button>
                  <button onClick={(e)=>{e.stopPropagation();setDelTarget(inv);}} aria-label="Delete"
                    style={{ background:"#FFF0F0", border:"none", borderRadius:"6px", padding:"5px", cursor:"pointer", color:"#E74C3C", display:"flex", transition:"all 0.15s" }}
                    onMouseOver={e=>{e.currentTarget.style.background="#E74C3C";e.currentTarget.style.color="#fff";}}
                    onMouseOut={e=>{e.currentTarget.style.background="#FFF0F0";e.currentTarget.style.color="#E74C3C";}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{TrashIcon}</svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && <InvoiceModal invoice={modal==="new"?null:modal} clients={clients} onClose={()=>setModal(null)} onSave={handleSave}/>}
      {detail  && <DetailModal invoice={detail} onClose={()=>setDetail(null)} onStatusChange={handleStatusChange} onPrint={(inv)=>setPrint(inv)}/>}
      {printTarget && <PrintInvoice invoice={printTarget} business={business} onClose={()=>setPrint(null)}/>}
      {delTarget && <DeleteModal invoice={delTarget} onClose={()=>setDelTarget(null)} onConfirm={handleDelete} loading={delLoad}/>}
    </>
  );
}
