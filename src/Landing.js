import { useState, useEffect, memo } from "react";

const Logo = memo(({ size = 32, light = false }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill={light ? "#C9A84C" : "#0D3D2E"}/>
    <path d="M8 9h10l5 5v10a1 1 0 01-1 1H8a1 1 0 01-1-1V10a1 1 0 011-1z" fill="none" stroke={light?"#0D3D2E":"#C9A84C"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 9v5h5" fill="none" stroke={light?"#0D3D2E":"#C9A84C"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="11" y1="17" x2="21" y2="17" stroke={light?"#0D3D2E":"#C9A84C"} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="11" y1="20" x2="17" y2="20" stroke={light?"#0D3D2E":"#C9A84C"} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
));

const Check = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Landing({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const features = [
    { icon:"⚡", title:"Instant Invoices",   desc:"Create a professional invoice in under 60 seconds. Line items, taxes, notes — done.",           accent:"#C9A84C" },
    { icon:"👥", title:"Client Management",  desc:"Keep all your clients organised in one place. Full contact history, invoice count, everything.",  accent:"#1A6FA8" },
    { icon:"📊", title:"Live Dashboard",     desc:"See what you've earned, what's pending, and what's overdue — updated in real time.",               accent:"#27AE60" },
    { icon:"🖨️", title:"PDF Export",        desc:"Download any invoice as a beautiful, branded PDF. Send it via email or print it directly.",        accent:"#E74C3C" },
    { icon:"🔁", title:"Status Tracking",    desc:"Track every invoice from Draft → Sent → Paid. Never lose track of who owes you what.",            accent:"#8B5CF6" },
    { icon:"🔒", title:"Secure by Default",  desc:"JWT auth, bcrypt passwords, rate limiting, and helmet.js. Your data stays yours.",                 accent:"#0D3D2E" },
  ];

  const steps = [
    { num:"1", title:"Create your account",   desc:"Sign up free in 30 seconds — no credit card required. Google login supported." },
    { num:"2", title:"Add your first client", desc:"Enter their name, email, and company. Done in under a minute." },
    { num:"3", title:"Build your invoice",    desc:"Add line items, set a due date, apply tax. The total calculates automatically." },
    { num:"4", title:"Download & get paid",   desc:"Export as PDF, send to your client, and mark it paid when the money arrives." },
  ];

  const pricing = [
    { plan:"Free",     price:"$0",  period:"/mo", cta:"Get Started Free", highlighted:false, features:["3 invoices / month","Unlimited clients","PDF export","Dashboard analytics","Email support"] },
    { plan:"Pro",      price:"$12", period:"/mo", cta:"Coming Soon",      highlighted:true,  comingSoon:true, features:["Unlimited invoices","Unlimited clients","PDF export","Dashboard analytics","Priority support","Custom branding"] },
    { plan:"Business", price:"$25", period:"/mo", cta:"Coming Soon",      highlighted:false, comingSoon:true, features:["Everything in Pro","Team members","Advanced reporting","API access","Dedicated support","White-label PDF"] },
  ];

  const testimonials = [
    { quote:"I used to spend an hour each week on invoices. With Invoify it takes me five minutes. I genuinely don't know how I managed before.", name:"Sarah M.", role:"Freelance Designer, London",     initials:"SM" },
    { quote:"The dashboard is what sold me. I can see at a glance exactly who owes me money. It's changed how I run my business.",               name:"James O.", role:"Web Developer, New York",        initials:"JO" },
    { quote:"Super clean, super fast. Sent my first invoice five minutes after signing up. My clients always comment on how professional it looks.", name:"Amira K.", role:"Content Strategist, Dubai", initials:"AK" },
  ];

  const navLinks = [["Features","features"],["How It Works","how"],["Pricing","pricing"],["Testimonials","testimonials"]];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { background:#FAFCFB; }

        @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }

        .landing-fade { animation: slideUp 0.7s ease both; }

        .nav-link-btn { background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:color 0.2s; padding:0; }
        .nav-link-btn:hover { color:#C9A84C !important; }

        .feature-card { background:#fff; border:1px solid #E4EDE8; border-radius:20px; padding:28px; transition:all 0.25s; }
        .feature-card:hover { border-color:#C9A84C; box-shadow:0 8px 32px rgba(13,61,46,0.08); transform:translateY(-3px); }

        .pricing-card-btn { width:100%; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .pricing-card-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(13,61,46,0.25); }

        .cta-gold { background:#C9A84C; color:#0D3D2E; border:none; border-radius:12px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.25s; }
        .cta-gold:hover { background:#D4B85A; transform:translateY(-2px); box-shadow:0 12px 32px rgba(201,168,76,0.4); }

        .cta-ghost { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.85); border:1px solid rgba(255,255,255,0.2); border-radius:12px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.25s; }
        .cta-ghost:hover { background:rgba(255,255,255,0.15); transform:translateY(-2px); }

        .footer-link { font-size:13px; color:rgba(255,255,255,0.55); font-family:'DM Sans',sans-serif; cursor:pointer; transition:color 0.2s; }
        .footer-link:hover { color:#C9A84C; }

        @media(max-width:900px) {
          .hero-grid    { grid-template-columns:1fr !important; }
          .how-grid     { grid-template-columns:1fr !important; }
          .features-grid{ grid-template-columns:1fr 1fr !important; }
          .pricing-grid { grid-template-columns:1fr !important; }
          .testi-grid   { grid-template-columns:1fr !important; }
          .nav-links    { display:none !important; }
          .mobile-btn   { display:flex !important; }
          .hero-title   { font-size:40px !important; }
          .hero-card    { display:none !important; }
          .how-visual   { display:none !important; }
        }
        @media(max-width:600px) {
          .features-grid{ grid-template-columns:1fr !important; }
        }
        @media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:0.01ms !important; transition-duration:0.01ms !important; } }
      `}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", color:"#0D3D2E", overflowX:"hidden" }}>

        {/* ── Navbar ── */}
        <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, transition:"all 0.3s", background:scrolled?"rgba(250,252,251,0.96)":"transparent", backdropFilter:scrolled?"blur(12px)":"none", borderBottom:scrolled?"1px solid #E4EDE8":"none", padding:"0 6%" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:"68px" }}>
            <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{ display:"flex", alignItems:"center", gap:"10px", background:"none", border:"none", cursor:"pointer" }}>
              <Logo size={30}/>
              <span style={{ fontSize:"19px", fontFamily:"'DM Serif Display',serif", color:scrolled?"#0D3D2E":"#fff" }}>Invoify</span>
            </button>

            <div className="nav-links" style={{ display:"flex", gap:"28px" }}>
              {navLinks.map(([label,id]) => (
                <button key={id} onClick={()=>scrollTo(id)} className="nav-link-btn"
                  style={{ fontSize:"14px", fontWeight:"500", color:scrolled?"#4A6741":"rgba(255,255,255,0.8)" }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
              <button onClick={onGetStarted} className="cta-gold" style={{ padding:"9px 20px", fontSize:"13px" }}>
                Get Started Free
              </button>
              <button className="mobile-btn" onClick={()=>setMenuOpen(v=>!v)}
                style={{ display:"none", background:"none", border:"none", cursor:"pointer", color:scrolled?"#0D3D2E":"#fff", padding:"4px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
                </svg>
              </button>
            </div>
          </div>

          {menuOpen && (
            <div style={{ background:"#fff", borderTop:"1px solid #E4EDE8", padding:"16px 6%", display:"flex", flexDirection:"column", gap:"2px" }}>
              {navLinks.map(([label,id]) => (
                <button key={id} onClick={()=>scrollTo(id)} style={{ background:"none", border:"none", padding:"11px 0", fontSize:"15px", fontWeight:"500", color:"#0D3D2E", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left", borderBottom:"1px solid #F0F5F2" }}>
                  {label}
                </button>
              ))}
              <button onClick={onGetStarted} style={{ marginTop:"10px", padding:"13px", background:"#0D3D2E", color:"#fff", border:"none", borderRadius:"10px", fontSize:"14px", fontWeight:"700", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                Get Started Free
              </button>
            </div>
          )}
        </nav>

        {/* ── Hero ── */}
        <section style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0A2E21 0%,#0D3D2E 55%,#1A5C44 100%)", backgroundSize:"200% 200%", animation:"gradShift 12s ease infinite", display:"flex", alignItems:"center", padding:"110px 6% 70px", position:"relative", overflow:"hidden" }}>
          <div aria-hidden="true" style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 15% 50%,rgba(201,168,76,0.12) 0%,transparent 50%),radial-gradient(circle at 85% 20%,rgba(201,168,76,0.07) 0%,transparent 45%)", pointerEvents:"none" }}/>
          <div aria-hidden="true" style={{ position:"absolute", top:"-80px", right:"-80px", width:"360px", height:"360px", borderRadius:"50%", border:"1px solid rgba(201,168,76,0.12)", pointerEvents:"none" }}/>

          <div style={{ maxWidth:"1100px", margin:"0 auto", width:"100%" }}>
            <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"64px", alignItems:"center" }}>
              {/* Left */}
              <div>
                <div className="landing-fade" style={{ animationDelay:"0s", display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(201,168,76,0.15)", border:"1px solid rgba(201,168,76,0.3)", borderRadius:"20px", padding:"6px 14px", marginBottom:"28px" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#C9A84C", display:"inline-block" }}/>
                  <span style={{ fontSize:"12px", fontWeight:"600", color:"#C9A84C", letterSpacing:"0.05em" }}>FREE TO START · NO CREDIT CARD</span>
                </div>

                <h1 className="hero-title landing-fade" style={{ animationDelay:"0.1s", fontFamily:"'DM Serif Display',serif", fontSize:"56px", color:"#fff", lineHeight:1.1, marginBottom:"22px", letterSpacing:"-1px" }}>
                  Invoicing that<br/>
                  <span style={{ color:"#C9A84C", fontStyle:"italic" }}>actually works</span><br/>
                  for freelancers.
                </h1>

                <p className="landing-fade" style={{ animationDelay:"0.2s", fontSize:"17px", color:"rgba(255,255,255,0.7)", lineHeight:1.7, maxWidth:"440px", marginBottom:"34px" }}>
                  Create beautiful invoices, track every payment, and get paid faster — without the spreadsheet chaos.
                </p>

                <div className="landing-fade" style={{ animationDelay:"0.3s", display:"flex", gap:"12px", flexWrap:"wrap" }}>
                  <button onClick={onGetStarted} className="cta-gold" style={{ padding:"15px 28px", fontSize:"15px" }}>
                    Start for Free →
                  </button>
                  <button onClick={()=>scrollTo("how")} className="cta-ghost" style={{ padding:"15px 24px", fontSize:"15px" }}>
                    See how it works
                  </button>
                </div>

                <div className="landing-fade" style={{ animationDelay:"0.4s", display:"flex", alignItems:"center", gap:"14px", marginTop:"36px" }}>
                  <div style={{ display:"flex" }}>
                    {["#27AE60","#1A6FA8","#C9A84C","#8B5CF6"].map((bg,i) => (
                      <div key={i} style={{ width:"26px", height:"26px", borderRadius:"50%", background:bg, border:"2px solid rgba(255,255,255,0.15)", marginLeft:i>0?"-7px":"0" }}/>
                    ))}
                  </div>
                  <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.6)" }}>
                    Trusted by <strong style={{ color:"rgba(255,255,255,0.9)" }}>2,400+</strong> freelancers worldwide
                  </span>
                </div>
              </div>

              {/* Right — floating card */}
              <div className="hero-card landing-fade" style={{ animationDelay:"0.25s" }}>
                <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"24px", padding:"28px", backdropFilter:"blur(20px)", animation:"float 4s ease-in-out infinite" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <Logo size={26} light/>
                      <span style={{ fontSize:"15px", fontFamily:"'DM Serif Display',serif", color:"#fff" }}>Invoify</span>
                    </div>
                    <span style={{ background:"rgba(39,174,96,0.2)", color:"#27AE60", fontSize:"11px", fontWeight:"700", padding:"4px 10px", borderRadius:"20px" }}>● PAID</span>
                  </div>
                  <div style={{ height:"1px", background:"rgba(255,255,255,0.1)", marginBottom:"18px" }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"16px" }}>
                    <span style={{ fontSize:"14px", fontWeight:"600", color:"#fff" }}>Acme Studio</span>
                    <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)" }}>INV-042</span>
                  </div>
                  {[["Website Design","$2,400"],["SEO Setup","$600"],["Monthly Retainer","$800"]].map(([item,price],i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.65)" }}>{item}</span>
                      <span style={{ fontSize:"13px", fontWeight:"600", color:"rgba(255,255,255,0.9)" }}>{price}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:"14px", padding:"13px 15px", background:"rgba(201,168,76,0.15)", borderRadius:"11px", border:"1px solid rgba(201,168,76,0.25)" }}>
                    <span style={{ fontSize:"13px", fontWeight:"700", color:"#C9A84C" }}>Total Due</span>
                    <span style={{ fontSize:"20px", fontWeight:"700", color:"#fff", fontFamily:"'DM Serif Display',serif" }}>$3,800.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={{ padding:"96px 6%", background:"#F4F8F6" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"52px" }}>
              <div style={{ display:"inline-block", background:"#E8F5EE", border:"1px solid #C8DDD5", borderRadius:"20px", padding:"6px 16px", marginBottom:"14px" }}>
                <span style={{ fontSize:"12px", fontWeight:"600", color:"#4A8A6A", letterSpacing:"0.08em", textTransform:"uppercase" }}>Everything you need</span>
              </div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"38px", color:"#0D3D2E", marginBottom:"10px" }}>
                Built for how freelancers <em>actually</em> work
              </h2>
              <p style={{ fontSize:"15px", color:"#6A8A7A", maxWidth:"460px", margin:"0 auto", lineHeight:1.6 }}>
                No bloated features you'll never use. Just the tools that help you get paid.
              </p>
            </div>
            <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
              {features.map((f,i) => (
                <div key={i} className="feature-card" style={{ animationDelay:`${i*0.07}s` }}>
                  <div style={{ width:"46px", height:"46px", borderRadius:"13px", background:f.accent+"22", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"16px", fontSize:"21px" }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"17px", color:"#0D3D2E", marginBottom:"8px" }}>{f.title}</h3>
                  <p style={{ fontSize:"14px", color:"#6A8A7A", lineHeight:1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how" style={{ padding:"96px 6%", background:"#fff" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div className="how-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"80px", alignItems:"center" }}>
              <div>
                <div style={{ display:"inline-block", background:"#E8F5EE", border:"1px solid #C8DDD5", borderRadius:"20px", padding:"6px 16px", marginBottom:"14px" }}>
                  <span style={{ fontSize:"12px", fontWeight:"600", color:"#4A8A6A", letterSpacing:"0.08em", textTransform:"uppercase" }}>Simple process</span>
                </div>
                <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"38px", color:"#0D3D2E", marginBottom:"12px" }}>
                  From zero to <em style={{ color:"#C9A84C" }}>paid</em> in minutes
                </h2>
                <p style={{ fontSize:"15px", color:"#6A8A7A", lineHeight:1.65, marginBottom:"36px" }}>
                  No learning curve. No confusing setup. Just sign up, add a client, and start invoicing.
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
                  {steps.map((s,i) => (
                    <div key={i} style={{ display:"flex", gap:"18px", alignItems:"flex-start" }}>
                      <div style={{ flexShrink:0, width:"42px", height:"42px", borderRadius:"50%", background:"#0D3D2E", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(13,61,46,0.28)" }}>
                        <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:"17px", color:"#C9A84C" }}>{s.num}</span>
                      </div>
                      <div style={{ paddingTop:"3px" }}>
                        <h4 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"17px", color:"#0D3D2E", marginBottom:"5px" }}>{s.title}</h4>
                        <p style={{ fontSize:"14px", color:"#6A8A7A", lineHeight:1.6 }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="how-visual" style={{ background:"linear-gradient(135deg,#0D3D2E,#1A5C44)", borderRadius:"24px", padding:"28px", boxShadow:"0 20px 60px rgba(13,61,46,0.18)" }}>
                <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
                  {[["Total Earned","$12.4k","#C9A84C"],["Pending","$2.1k","#F39C12"],["Paid","$8.8k","#27AE60"]].map(([l,v,c],i) => (
                    <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.08)", borderRadius:"11px", padding:"12px" }}>
                      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>{l}</div>
                      <div style={{ fontSize:"15px", fontWeight:"700", color:c, fontFamily:"'DM Serif Display',serif" }}>{v}</div>
                    </div>
                  ))}
                </div>
                {[["INV-039","Sarah K.","$1,200","paid"],["INV-040","James B.","$800","sent"],["INV-041","Mia T.","$2,400","overdue"]].map(([n,c,a,s],i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", background:"rgba(255,255,255,0.06)", borderRadius:"10px", marginBottom:"6px" }}>
                    <span style={{ fontSize:"12px", fontWeight:"600", color:"rgba(255,255,255,0.9)", width:"60px" }}>{n}</span>
                    <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)" }}>{c}</span>
                    <span style={{ fontSize:"11px", fontWeight:"700", color:{paid:"#27AE60",sent:"#1A6FA8",overdue:"#E74C3C"}[s], background:{paid:"rgba(39,174,96,0.15)",sent:"rgba(26,111,168,0.15)",overdue:"rgba(231,76,60,0.15)"}[s], padding:"3px 8px", borderRadius:"20px" }}>{s}</span>
                    <span style={{ fontSize:"13px", fontWeight:"700", color:"rgba(255,255,255,0.9)", fontFamily:"'DM Serif Display',serif" }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" style={{ padding:"96px 6%", background:"#F4F8F6" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"52px" }}>
              <div style={{ display:"inline-block", background:"#E8F5EE", border:"1px solid #C8DDD5", borderRadius:"20px", padding:"6px 16px", marginBottom:"14px" }}>
                <span style={{ fontSize:"12px", fontWeight:"600", color:"#4A8A6A", letterSpacing:"0.08em", textTransform:"uppercase" }}>Transparent pricing</span>
              </div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"38px", color:"#0D3D2E", marginBottom:"10px" }}>Simple, honest pricing</h2>
              <p style={{ fontSize:"15px", color:"#6A8A7A" }}>Start free. Upgrade when you're ready. Cancel any time.</p>
            </div>
            <div className="pricing-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
              {pricing.map((p,i) => (
                <div key={i} style={{ background:p.highlighted?"#0D3D2E":"#fff", border:p.highlighted?"none":"1px solid #E4EDE8", borderRadius:"22px", padding:"30px", position:"relative", overflow:"hidden" }}>
                  {p.highlighted && <div aria-hidden="true" style={{ position:"absolute", top:"-40px", right:"-40px", width:"150px", height:"150px", borderRadius:"50%", background:"rgba(201,168,76,0.12)", pointerEvents:"none" }}/>}
                  {p.highlighted && (
                    <div style={{ display:"inline-block", background:"#C9A84C", color:"#0D3D2E", fontSize:"11px", fontWeight:"700", padding:"4px 12px", borderRadius:"20px", marginBottom:"14px", letterSpacing:"0.06em", textTransform:"uppercase" }}>Most Popular</div>
                  )}
                  <div style={{ fontSize:"12px", fontWeight:"700", color:p.highlighted?"rgba(255,255,255,0.55)":"#8AADA0", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px" }}>{p.plan}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:"4px", marginBottom:"4px" }}>
                    <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:"40px", color:p.highlighted?"#fff":"#0D3D2E", letterSpacing:"-1px" }}>{p.price}</span>
                    <span style={{ fontSize:"13px", color:p.highlighted?"rgba(255,255,255,0.45)":"#8AADA0" }}>{p.period}</span>
                  </div>
                  <div style={{ height:"1px", background:p.highlighted?"rgba(255,255,255,0.1)":"#E4EDE8", margin:"18px 0" }}/>
                  <div style={{ marginBottom:"24px" }}>
                    {p.features.map((f,j) => (
                      <div key={j} style={{ display:"flex", alignItems:"center", gap:"9px", marginBottom:"9px" }}>
                        <div style={{ width:"17px", height:"17px", borderRadius:"50%", background:p.highlighted?"rgba(201,168,76,0.2)":"#F0F7F4", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:p.highlighted?"#C9A84C":"#27AE60" }}>
                          <Check/>
                        </div>
                        <span style={{ fontSize:"13px", color:p.highlighted?"rgba(255,255,255,0.8)":"#4A6741" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={p.comingSoon ? undefined : onGetStarted}
                    className="pricing-card-btn"
                    style={{ padding:"13px", background:p.comingSoon?(p.highlighted?"rgba(201,168,76,0.3)":"#E8F0EC"):(p.highlighted?"#C9A84C":"#0D3D2E"), color:p.comingSoon?(p.highlighted?"rgba(201,168,76,0.6)":"#8AADA0"):(p.highlighted?"#0D3D2E":"#fff"), cursor:p.comingSoon?"default":"pointer", opacity:p.comingSoon?0.7:1 }}>
                    {p.comingSoon ? "🔒 Coming Soon" : p.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" style={{ padding:"96px 6%", background:"#fff" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"52px" }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"38px", color:"#0D3D2E", marginBottom:"10px" }}>
                Freelancers <em style={{ color:"#C9A84C" }}>love</em> Invoify
              </h2>
              <p style={{ fontSize:"15px", color:"#6A8A7A" }}>Don't take our word for it.</p>
            </div>
            <div className="testi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px" }}>
              {testimonials.map((t,i) => (
                <div key={i} style={{ background:"#fff", border:"1px solid #E4EDE8", borderRadius:"20px", padding:"26px" }}>
                  <div style={{ fontSize:"26px", color:"#C9A84C", fontFamily:"Georgia,serif", lineHeight:1, marginBottom:"10px" }}>"</div>
                  <p style={{ fontSize:"14px", color:"#4A6741", lineHeight:1.7, marginBottom:"18px", fontStyle:"italic" }}>{t.quote}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"#0D3D2E", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:"12px", fontWeight:"700", color:"#C9A84C" }}>{t.initials}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:"13px", fontWeight:"700", color:"#0D3D2E" }}>{t.name}</div>
                      <div style={{ fontSize:"11px", color:"#8AADA0" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding:"80px 6%", background:"linear-gradient(135deg,#0D3D2E,#1A5C44)" }}>
          <div style={{ maxWidth:"680px", margin:"0 auto", textAlign:"center" }}>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:"40px", color:"#fff", marginBottom:"14px", lineHeight:1.15 }}>
              Ready to get paid<br/><em style={{ color:"#C9A84C" }}>on time, every time?</em>
            </h2>
            <p style={{ fontSize:"16px", color:"rgba(255,255,255,0.65)", marginBottom:"32px", lineHeight:1.6 }}>
              Join thousands of freelancers who send professional invoices and stop chasing clients for money.
            </p>
            <button onClick={onGetStarted} className="cta-gold" style={{ padding:"16px 36px", fontSize:"16px" }}>
              Create your free account →
            </button>
            <p style={{ marginTop:"14px", fontSize:"12px", color:"rgba(255,255,255,0.38)" }}>
              No credit card · No commitment · Free forever plan
            </p>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ background:"#071E16", padding:"44px 6% 28px" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"36px", flexWrap:"wrap", gap:"24px" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"9px", marginBottom:"10px" }}>
                  <Logo size={26} light/>
                  <span style={{ fontSize:"17px", fontFamily:"'DM Serif Display',serif", color:"#fff" }}>Invoify</span>
                </div>
                <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.38)", maxWidth:"200px", lineHeight:1.6 }}>Professional invoicing for freelancers worldwide.</p>
              </div>
              {[["Product",["Features","Pricing","Dashboard","PDF Export"]],["Company",["About","Blog","Careers","Contact"]],["Legal",["Privacy","Terms","Security","Cookies"]]].map(([title,links]) => (
                <div key={title}>
                  <div style={{ fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.38)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>{title}</div>
                  {links.map(l => <div key={l} className="footer-link" style={{ marginBottom:"8px" }}>{l}</div>)}
                </div>
              ))}
            </div>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:"20px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.28)" }}>© 2025 Invoify. All rights reserved.</span>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.28)" }}>Built for freelancers, by freelancers.</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
