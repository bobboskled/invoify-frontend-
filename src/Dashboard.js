import { useState, useCallback, memo, useEffect } from "react";
import Clients from "./Clients";
import Invoices from "./Invoices";
import Settings from "./Settings";

const getToken = () => localStorage.getItem("inv_token") || sessionStorage.getItem("inv_token");
const fmt = (n) => "$" + Number(n||0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,",");

// ── Icons ─────────────────────────────────────────────
const Icons = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  invoices:  <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></>,
  clients:   <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  logout:    <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
};

const Logo = memo(() => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="#C9A84C"/>
    <path d="M8 9h10l5 5v10a1 1 0 01-1 1H8a1 1 0 01-1-1V10a1 1 0 011-1z" fill="none" stroke="#0D3D2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 9v5h5" fill="none" stroke="#0D3D2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="11" y1="17" x2="21" y2="17" stroke="#0D3D2E" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="11" y1="20" x2="17" y2="20" stroke="#0D3D2E" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
));

const StatCard = memo(({ label, value, sub, iconPath, color, delay }) => (
  <div style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"16px", padding:"24px", position:"relative", overflow:"hidden", animation:`fadeUp 0.5s ease ${delay}s both`, transition:"transform 0.2s, box-shadow 0.2s", cursor:"default" }}
    onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(13,61,46,0.10)";}}
    onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none";}}>
    <div aria-hidden="true" style={{ position:"absolute", top:0, right:0, width:"80px", height:"80px", borderRadius:"0 16px 0 80px", background:color, opacity:0.08 }}/>
    <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:color + "22", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPath}/></svg>
    </div>
    <div style={{ fontSize:"28px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Serif Display',serif", marginBottom:"4px", letterSpacing:"-0.5px" }}>{value}</div>
    <div style={{ fontSize:"13px", color:"#6A8A7A", fontFamily:"'DM Sans',sans-serif", fontWeight:"500" }}>{label}</div>
    {sub && <div style={{ fontSize:"11px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", marginTop:"4px" }}>{sub}</div>}
  </div>
));

const NavItem = memo(({ icon, label, active, onClick, collapsed }) => (
  <button onClick={onClick} aria-current={active?"page":undefined}
    style={{ display:"flex", alignItems:"center", gap:"12px", width:"100%", padding:collapsed?"12px":"11px 14px", borderRadius:"10px", border:"none", cursor:"pointer", background:active?"rgba(201,168,76,0.15)":"transparent", color:active?"#C9A84C":"rgba(255,255,255,0.6)", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif", fontSize:"14px", fontWeight:active?"600":"400", justifyContent:collapsed?"center":"flex-start", position:"relative" }}
    onMouseOver={e=>{ if(!active){e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.color="rgba(255,255,255,0.9)";}}}
    onMouseOut={e=>{  if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}}> 
    {active && <span aria-hidden="true" style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:"3px", height:"20px", background:"#C9A84C", borderRadius:"0 3px 3px 0" }}/>}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
    {!collapsed && <span>{label}</span>}
  </button>
));

export default function Dashboard({ user: initialUser, onLogout }) {
  const [user, setUser]           = useState(initialUser);
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [stats, setStats]         = useState(null);
  const [statsLoad, setStatsLoad] = useState(true);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (activePage !== "dashboard") return;
    const fetchStats = async () => {
      setStatsLoad(true);
      try {
        const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/stats`, { headers:{ Authorization:`Bearer ${getToken()}` }});
        const data = await res.json();
        if (res.ok) setStats(data.stats);
      } catch {}
      setStatsLoad(false);
    };
    fetchStats();
  }, [activePage]);

  const navigate  = useCallback((page) => { setActivePage(page); setMobileOpen(false); }, []);
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const initials  = user?.full_name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "U";

  const statCards = [
    { label:"Total Earned",    value: statsLoad?"…":fmt(stats?.total_earned),    sub:"All time",          iconPath:"M12 20V10M18 20V4M6 20v-4", color:"#27AE60", delay:0.1 },
    { label:"Pending",         value: statsLoad?"…":fmt(stats?.total_pending),   sub:"Awaiting payment",  iconPath:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", color:"#F39C12", delay:0.15 },
    { label:"Overdue",         value: statsLoad?"…":fmt(stats?.total_overdue),   sub:"Past due date",     iconPath:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01", color:"#E74C3C", delay:0.2 },
    { label:"Paid This Month", value: statsLoad?"…":fmt(stats?.paid_this_month), sub:"This month",        iconPath:"M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3", color:"#1A6FA8", delay:0.25 },
  ];

  const navItems = [
    { id:"dashboard", icon:Icons.dashboard, label:"Dashboard" },
    { id:"invoices",  icon:Icons.invoices,  label:"Invoices"  },
    { id:"clients",   icon:Icons.clients,   label:"Clients"   },
    { id:"settings",  icon:Icons.settings,  label:"Settings"  },
  ];

  const Sidebar = (
    <nav aria-label="Main navigation" style={{ width:collapsed?"64px":"220px", background:"#0D3D2E", display:"flex", flexDirection:"column", height:"100%", transition:"width 0.25s ease", overflow:"hidden", flexShrink:0 }}>
      <div style={{ padding:collapsed?"20px 0":"20px", borderBottom:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", gap:"10px", justifyContent:collapsed?"center":"flex-start" }}>
        <Logo/>
        {!collapsed && <span style={{ fontSize:"18px", fontFamily:"'DM Serif Display',serif", color:"#fff", whiteSpace:"nowrap" }}>Invoify</span>}
      </div>
      <div style={{ flex:1, padding:"16px 10px", display:"flex", flexDirection:"column", gap:"4px" }}>
        {navItems.map(n => <NavItem key={n.id} icon={n.icon} label={n.label} active={activePage===n.id} onClick={()=>navigate(n.id)} collapsed={collapsed}/>)}
      </div>
      <div style={{ padding:"16px 10px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        {!collapsed && (
          <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", borderRadius:"10px", marginBottom:"8px", background:"rgba(255,255,255,0.05)" }}>
            <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"#C9A84C", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:"11px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>{initials}</span>
            </div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:"12px", fontWeight:"600", color:"#fff", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.full_name}</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif", textTransform:"uppercase", letterSpacing:"0.05em" }}>{user?.plan||"Free"}</div>
            </div>
          </div>
        )}
        <NavItem icon={Icons.logout} label="Sign Out" active={false} onClick={onLogout} collapsed={collapsed}/>
      </div>
    </nav>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .new-invoice-btn:hover{background:#1A5C44!important;transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,61,46,0.25)!important}
        @media(max-width:768px){.sidebar-desktop{display:none!important}.topbar-menu{display:flex!important}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
      `}</style>

      <div style={{ display:"flex", height:"100vh", fontFamily:"'DM Sans',sans-serif", background:"#F4F8F6", overflow:"hidden", opacity:mounted?1:0, transition:"opacity 0.3s" }}>

        {/* Desktop Sidebar */}
        <div className="sidebar-desktop" style={{ display:"flex", position:"relative" }}>
          {Sidebar}
          <button onClick={()=>setCollapsed(v=>!v)} aria-label={collapsed?"Expand sidebar":"Collapse sidebar"}
            style={{ position:"absolute", left:collapsed?"48px":"204px", top:"50%", transform:"translateY(-50%)", zIndex:10, width:"20px", height:"32px", background:"#0D3D2E", border:"1px solid rgba(255,255,255,0.15)", borderLeft:"none", borderRadius:"0 6px 6px 0", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.5)", transition:"left 0.25s ease" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed?<polyline points="9 18 15 12 9 6"/>:<polyline points="15 18 9 12 15 6"/>}
            </svg>
          </button>
        </div>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", animation:"fadeIn 0.2s ease" }}>
            <div onClick={()=>setMobileOpen(false)} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }}/>
            <div style={{ position:"relative", zIndex:1, width:"220px" }}>{Sidebar}</div>
          </div>
        )}

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Topbar */}
          <header style={{ background:"#fff", borderBottom:"1px solid #E8F0EC", padding:"0 28px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
              <button className="topbar-menu" onClick={()=>setMobileOpen(true)}
                style={{ display:"none", background:"none", border:"none", cursor:"pointer", color:"#4A6741", padding:"4px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{Icons.dashboard}</svg>
              </button>
              <div>
                <h1 style={{ fontSize:"16px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif", lineHeight:1 }}>
                  {activePage==="dashboard" ? `Good day, ${firstName} 👋` : navItems.find(n=>n.id===activePage)?.label}
                </h1>
                {activePage==="dashboard" && <p style={{ fontSize:"11px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", marginTop:"2px" }}>Here's your business at a glance</p>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <button className="new-invoice-btn" onClick={()=>navigate("invoices")}
                style={{ display:"flex", alignItems:"center", gap:"7px", padding:"9px 16px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"9px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", boxShadow:"0 2px 8px rgba(13,61,46,0.2)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{Icons.plus}</svg>
                New Invoice
              </button>
              <div onClick={()=>navigate("settings")} role="button" tabIndex={0}
                style={{ width:"34px", height:"34px", borderRadius:"50%", background:"#0D3D2E", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"2px solid #C9A84C" }}>
                <span style={{ fontSize:"12px", fontWeight:"700", color:"#C9A84C", fontFamily:"'DM Sans',sans-serif" }}>{initials}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex:1, overflowY:"auto", padding:"28px" }}>

            {/* ── DASHBOARD ── */}
            {activePage==="dashboard" && (
              <>
                {/* Stat cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"16px", marginBottom:"28px" }}>
                  {statCards.map((s,i) => <StatCard key={i} {...s}/>)}
                </div>

                {/* Quick stats row */}
                {stats && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px", animation:"fadeUp 0.4s ease 0.3s both" }}>
                    {[
                      ["Total Invoices", stats.total_invoices, "#0D3D2E"],
                      ["Clients",        stats.client_count,  "#1A6FA8"],
                      ["Paid",           stats.paid_count,    "#27AE60"],
                      ["Overdue",        stats.overdue_count, "#E74C3C"],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"12px", padding:"16px", textAlign:"center" }}>
                        <div style={{ fontSize:"24px", fontWeight:"700", color, fontFamily:"'DM Serif Display',serif" }}>{val}</div>
                        <div style={{ fontSize:"11px", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", marginTop:"2px" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent invoices + quick tip */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"16px", alignItems:"start" }}>
                  <div style={{ background:"#fff", border:"1px solid #E8F0EC", borderRadius:"16px", padding:"24px", animation:"fadeUp 0.4s ease 0.35s both" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
                      <h2 style={{ fontSize:"16px", fontWeight:"700", color:"#0D3D2E", fontFamily:"'DM Sans',sans-serif" }}>Recent Invoices</h2>
                      <button onClick={()=>navigate("invoices")} style={{ fontSize:"12px", color:"#0D3D2E", fontWeight:"600", background:"none", border:"1px solid #C8DDD5", borderRadius:"8px", padding:"6px 12px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View all →</button>
                    </div>
                    <div style={{ textAlign:"center", padding:"32px 0", color:"#8AADA0", fontFamily:"'DM Sans',sans-serif", fontSize:"13px" }}>
                      {statsLoad ? (
                        <span style={{ display:"inline-block", width:"24px", height:"24px", border:"2px solid #D8EAE2", borderTopColor:"#0D3D2E", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
                      ) : (stats?.total_invoices > 0 ? (
                        <button onClick={()=>navigate("invoices")} style={{ background:"none", border:"none", color:"#0D3D2E", fontWeight:"600", cursor:"pointer", fontSize:"14px", fontFamily:"'DM Sans',sans-serif" }}>
                          You have {stats.total_invoices} invoice{stats.total_invoices!==1?"s":""} → View them
                        </button>
                      ) : (
                        <div>
                          <div style={{ fontSize:"32px", marginBottom:"8px" }}>📄</div>
                          No invoices yet — <button onClick={()=>navigate("invoices")} style={{ background:"none", border:"none", color:"#C9A84C", fontWeight:"700", cursor:"pointer", fontSize:"13px", fontFamily:"'DM Sans',sans-serif" }}>create one</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick tip */}
                  <div style={{ background:"linear-gradient(135deg,#0D3D2E,#1A5C44)", borderRadius:"16px", padding:"24px", width:"220px", animation:"fadeUp 0.4s ease 0.4s both" }}>
                    <div style={{ fontSize:"11px", fontWeight:"700", color:"#C9A84C", letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:"10px" }}>⚡ Quick Actions</div>
                    {[["+ New Invoice","invoices"],["+ Add Client","clients"],["⚙ Settings","settings"]].map(([label,page])=>(
                      <button key={page} onClick={()=>navigate(page)}
                        style={{ display:"block", width:"100%", padding:"9px 12px", marginBottom:"6px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"8px", color:"rgba(255,255,255,0.85)", fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left", transition:"all 0.2s" }}
                        onMouseOver={e=>e.currentTarget.style.background="rgba(201,168,76,0.2)"}
                        onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activePage==="invoices" && <Invoices />}
            {activePage==="clients"  && <Clients />}
            {activePage==="settings" && <Settings user={user} onUserUpdate={(updated) => { setUser(p=>({...p,...updated})); localStorage.setItem("inv_user", JSON.stringify({...user,...updated})); }}/>}
          </main>
        </div>
      </div>
    </>
  );
}
