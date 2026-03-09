import { memo, useEffect } from "react";

const fmt = (n) => "$" + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function PrintInvoice({ invoice, business, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => { window.print(); }, 400);
    const handleAfterPrint = () => onClose();
    window.addEventListener("afterprint", handleAfterPrint);
    return () => { clearTimeout(timer); window.removeEventListener("afterprint", handleAfterPrint); };
  }, [onClose]);

  const STATUS_COLOR = { paid:"#27AE60", sent:"#1A6FA8", overdue:"#E74C3C", draft:"#8AADA0" };
  const statusColor  = STATUS_COLOR[invoice.status] || "#8AADA0";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

        /* Screen overlay */
        .print-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(13,61,46,0.6); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .print-container {
          background: #fff; border-radius: 20px; width: 100%; max-width: 720px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 24px 80px rgba(13,61,46,0.25);
        }
        .print-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px; border-bottom: 1px solid #E8F0EC; background: #FAFCFB;
          border-radius: 20px 20px 0 0;
        }
        .print-doc { padding: 48px; font-family: 'DM Sans', sans-serif; }

        /* Actual print styles */
        @media print {
          @page { margin: 0; size: A4; }
          body * { visibility: hidden; }
          .print-doc, .print-doc * { visibility: visible; }
          .print-overlay { position: static !important; background: none !important; backdrop-filter: none !important; padding: 0 !important; }
          .print-container { max-height: none !important; overflow: visible !important; border-radius: 0 !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; }
          .print-topbar { display: none !important; }
          .print-doc { position: fixed; top: 0; left: 0; width: 100%; padding: 32px 40px; }
        }
      `}</style>

      <div className="print-overlay">
        <div className="print-container">

          {/* Top bar (screen only) */}
          <div className="print-topbar">
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D3D2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span style={{ fontSize:"14px", fontWeight:"600", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>
                Print / Save as PDF
              </span>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => window.print()}
                style={{ padding:"8px 16px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                🖨️ Print / Save PDF
              </button>
              <button onClick={onClose}
                style={{ padding:"8px 12px", background:"#F4F8F6", border:"none", borderRadius:"8px", fontSize:"13px", cursor:"pointer", color:"#4A6741" }}>
                ✕ Close
              </button>
            </div>
          </div>

          {/* Invoice Document */}
          <div className="print-doc">

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"40px" }}>
              <div>
                {business?.logo_url ? (
                  <img src={business.logo_url} alt="Logo" style={{ height:"48px", marginBottom:"8px", objectFit:"contain" }}/>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                    <div style={{ width:"40px", height:"40px", background:"#0D3D2E", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ color:"#C9A84C", fontSize:"18px" }}>📄</span>
                    </div>
                    <span style={{ fontSize:"20px", fontFamily:"'DM Serif Display',serif", color:"#0D3D2E" }}>
                      {business?.business_name || "Invoify"}
                    </span>
                  </div>
                )}
                {business?.business_name && business?.logo_url && (
                  <div style={{ fontSize:"16px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{business.business_name}</div>
                )}
                {business?.address && <div style={{ fontSize:"12px", color:"#6A8A7A", marginTop:"4px" }}>{business.address}</div>}
                {business?.email   && <div style={{ fontSize:"12px", color:"#6A8A7A" }}>{business.email}</div>}
                {business?.phone   && <div style={{ fontSize:"12px", color:"#6A8A7A" }}>{business.phone}</div>}
              </div>

              <div style={{ textAlign:"right" }}>
                <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"36px", color:"#0D3D2E", letterSpacing:"-1px", marginBottom:"4px" }}>
                  INVOICE
                </h1>
                <div style={{ fontSize:"16px", fontWeight:"700", color:"#C9A84C" }}>{invoice.invoice_number}</div>
                <div style={{ marginTop:"8px", display:"inline-block", background: statusColor + "18", color: statusColor, fontSize:"11px", fontWeight:"700", padding:"4px 12px", borderRadius:"20px", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  {invoice.status}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height:"2px", background:"linear-gradient(90deg,#0D3D2E,#C9A84C,transparent)", marginBottom:"32px", borderRadius:"2px" }}/>

            {/* Bill To + Dates */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"32px", marginBottom:"36px" }}>
              <div>
                <div style={{ fontSize:"10px", fontWeight:"700", color:"#8AADA0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>Bill To</div>
                <div style={{ fontSize:"16px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif", marginBottom:"4px" }}>{invoice.client_name}</div>
                {invoice.client_company && <div style={{ fontSize:"13px", color:"#4A6741" }}>{invoice.client_company}</div>}
                {invoice.client_email   && <div style={{ fontSize:"13px", color:"#6A8A7A" }}>{invoice.client_email}</div>}
              </div>
              <div>
                <div style={{ fontSize:"10px", fontWeight:"700", color:"#8AADA0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>Details</div>
                {[
                  ["Invoice #", invoice.invoice_number],
                  ["Issue Date", invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "—"],
                  ["Due Date",   invoice.due_date   ? new Date(invoice.due_date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})   : "—"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                    <span style={{ fontSize:"12px", color:"#8AADA0" }}>{label}</span>
                    <span style={{ fontSize:"12px", fontWeight:"600", color:"#0D3D2E" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:"24px" }}>
              <thead>
                <tr style={{ background:"#0D3D2E" }}>
                  {["Description","Qty","Unit Price","Total"].map((h,i) => (
                    <th key={h} style={{ padding:"10px 14px", fontSize:"10px", fontWeight:"700", color:"#C9A84C", textTransform:"uppercase", letterSpacing:"0.08em", textAlign: i===0?"left":"right", fontFamily:"'DM Sans',sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(invoice.items||[]).map((item, i) => (
                  <tr key={i} style={{ background: i%2===0 ? "#FAFCFB" : "#fff" }}>
                    <td style={{ padding:"12px 14px", fontSize:"13px", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{item.description}</td>
                    <td style={{ padding:"12px 14px", fontSize:"13px", color:"#4A6741", textAlign:"right", fontFamily:"'DM Sans',sans-serif" }}>{item.quantity}</td>
                    <td style={{ padding:"12px 14px", fontSize:"13px", color:"#4A6741", textAlign:"right", fontFamily:"'DM Sans',sans-serif" }}>{fmt(item.unit_price)}</td>
                    <td style={{ padding:"12px 14px", fontSize:"13px", fontWeight:"700", color:"#0D3D2E", textAlign:"right", fontFamily:"'DM Sans',sans-serif" }}>{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"32px" }}>
              <div style={{ width:"260px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #E8F0EC" }}>
                  <span style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>Subtotal</span>
                  <span style={{ fontSize:"13px", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{fmt(invoice.subtotal)}</span>
                </div>
                {invoice.tax_rate > 0 && (
                  <div style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #E8F0EC" }}>
                    <span style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif" }}>Tax ({invoice.tax_rate}%)</span>
                    <span style={{ fontSize:"13px", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{fmt(invoice.tax_amount)}</span>
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 16px", background:"#0D3D2E", borderRadius:"10px", marginTop:"8px" }}>
                  <span style={{ fontSize:"14px", fontWeight:"700", color:"#C9A84C", fontFamily:"'DM Sans',sans-serif" }}>Total Due</span>
                  <span style={{ fontSize:"18px", fontWeight:"700", color:"#fff", fontFamily:"'DM Serif Display',serif" }}>{fmt(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div style={{ background:"#F4F8F6", borderRadius:"12px", padding:"16px", marginBottom:"32px" }}>
                <div style={{ fontSize:"10px", fontWeight:"700", color:"#8AADA0", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"6px" }}>Notes</div>
                <p style={{ fontSize:"13px", color:"#4A6741", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div style={{ borderTop:"1px solid #E8F0EC", paddingTop:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:"12px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif" }}>
                {business?.business_name || "Invoify"} · Thank you for your business!
              </span>
              <span style={{ fontSize:"11px", color:"#C8DDD5", fontFamily:"'DM Sans',sans-serif" }}>
                Generated by Invoify
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
