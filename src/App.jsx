import { useState, useEffect, useRef, useCallback } from "react";
import html2pdf from "html2pdf.js";
import {
  Users, FileText, Settings, LayoutDashboard, Plus, Search, Trash2,
  Edit2, Download, Eye, Copy, ChevronRight, X, Check, Moon, Sun,
  Upload, Save, Phone, MapPin, StickyNote, Hash, Calendar, Package,
  AlertCircle, Pen, ArrowLeft, MoreVertical, FileCheck, Clock, Sparkles
} from "lucide-react";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).substr(2,9) + Date.now().toString(36);
const stor = {
  get: async k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: async (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const DEFAULT_SETTINGS = {
  businessName:"Aaradhya Fashion", businessTagline:"Luxury Fashion & Apparel",
  businessAddress:"", businessPhone:"", businessEmail:"",
  logoBase64:null, customFields:[],
  termsAndConditions:"1. All orders are subject to availability.\n2. Payment is due upon delivery.\n3. Returns accepted within 7 days with original receipt.\n4. Custom/stitched orders are non-refundable.\n5. Alterations are chargeable separately.",
  darkMode:true
};

// ─── PDF BUILDER ──────────────────────────────────────────────────────────────
function buildPDF(form, settings) {
  const cf = (settings.customFields||[]).map(f=>{
    const v = form.customFieldValues?.[f.id];
    if(v===undefined||v===null||v==="") return "";
    return `<tr><td style="padding:8px 0;color:#6b6054;font-size:11px;border-bottom:1px solid #ede8df;width:40%">${f.label}</td><td style="padding:8px 0;font-size:12px;border-bottom:1px solid #ede8df;font-weight:500">${f.type==="checkbox"?(v?"Yes":"No"):String(v)}</td></tr>`;
  }).join("");
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${form.formNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#1a1714;background:#fff;padding:48px;max-width:820px;margin:0 auto}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:28px;border-bottom:3px solid #c8a84b;margin-bottom:32px}
.biz-name{font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#1a1714}.biz-tag{color:#8a7d6d;font-size:9px;letter-spacing:4px;text-transform:uppercase;margin:5px 0 10px;font-family:Arial,sans-serif}.biz-meta{color:#6b6054;font-size:11px;line-height:1.9;font-family:Arial,sans-serif}
.ref{text-align:right}.form-num{font-size:30px;font-weight:700;color:#c8a84b;letter-spacing:-1px}.form-lbl{color:#8a7d6d;font-size:9px;text-transform:uppercase;letter-spacing:3px;margin-top:4px;font-family:Arial,sans-serif}
.badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:9px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-top:8px;font-family:Arial,sans-serif;${form.status==="finalized"?"background:#dcfce7;color:#15803d":"background:#fef9c3;color:#854d0e"}}
.date{color:#6b6054;font-size:11px;margin-top:7px;font-family:Arial,sans-serif}
.sec{margin-bottom:28px}.sec-t{font-size:9px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#c8a84b;margin-bottom:14px;font-family:Arial,sans-serif}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}.field-lbl{color:#8a7d6d;font-size:9px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;font-family:Arial,sans-serif}.field-val{font-size:13px;font-weight:600}
table{width:100%;border-collapse:collapse}thead tr{background:#f8f4ec}th{padding:10px 12px;text-align:left;color:#8a7d6d;font-size:9px;text-transform:uppercase;letter-spacing:2px;font-weight:600;font-family:Arial,sans-serif}th.r,td.r{text-align:right}
td{padding:11px 12px;border-bottom:1px solid #ede8df;font-size:12px}.total-r td{background:#f8f4ec;font-weight:700;font-size:13px}.gold{color:#c8a84b}
.sig-box{border:1px solid #ede8df;display:inline-block;padding:10px 12px;border-radius:6px;background:#faf8f5}.sig-img{display:block;max-height:80px;max-width:280px}
.terms{color:#8a7d6d;font-size:10px;white-space:pre-line;line-height:1.8;font-family:Arial,sans-serif}
.footer{margin-top:40px;padding-top:14px;border-top:1px solid #ede8df;display:flex;justify-content:space-between;color:#a09080;font-size:9px;font-family:Arial,sans-serif}
@media print{body{padding:24px}}</style></head><body>
<div class="hdr">
  <div>${settings.logoBase64?`<img src="${settings.logoBase64}" style="height:52px;object-fit:contain;margin-bottom:12px;display:block" alt="">`:""}
    <div class="biz-name">${settings.businessName||"Aaradhya Fashion"}</div>
    ${settings.businessTagline?`<div class="biz-tag">${settings.businessTagline}</div>`:""}
    <div class="biz-meta">${[settings.businessAddress,settings.businessPhone,settings.businessEmail].filter(Boolean).join("<br>")}</div>
  </div>
  <div class="ref"><div class="form-num">${form.formNumber}</div><div class="form-lbl">Order Form</div><div><span class="badge">${form.status}</span></div><div class="date">${form.date||""}</div></div>
</div>
<div class="sec"><div class="sec-t">Client Details</div><div class="grid2">
  <div><div class="field-lbl">Client Name</div><div class="field-val">${form.clientName||"—"}</div></div>
  <div><div class="field-lbl">Contact Number</div><div class="field-val">${form.clientPhone||"—"}</div></div>
  <div style="grid-column:1/-1"><div class="field-lbl">Address</div><div class="field-val" style="font-weight:400">${form.clientAddress||"—"}</div></div>
</div></div>
<div class="sec"><div class="sec-t">Order Details</div>
<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Rate (₹)</th><th class="r">Amount (₹)</th></tr></thead>
<tbody><tr><td style="font-size:13px">${form.orderDetails||"—"}</td><td class="r">${form.quantity||"—"}</td><td class="r">₹${form.rate||"0"}</td><td class="r" style="font-weight:700">₹${form.totalAmount||"0"}</td></tr></tbody>
<tfoot><tr class="total-r"><td colspan="3" style="text-align:right;font-size:9px;text-transform:uppercase;letter-spacing:2px;color:#8a7d6d;font-family:Arial,sans-serif">Total Amount</td><td class="gold r">₹${form.totalAmount||"0"}</td></tr></tfoot></table></div>
${cf?`<div class="sec"><div class="sec-t">Additional Details</div><table><tbody>${cf}</tbody></table></div>`:""}
${form.signatureDataUrl?`<div class="sec"><div class="sec-t">Client Signature</div><div class="sig-box"><img src="${form.signatureDataUrl}" class="sig-img" alt=""></div><div style="color:#8a7d6d;font-size:10px;margin-top:8px;font-family:Arial,sans-serif">${form.clientName||""} &nbsp;·&nbsp; ${form.date||""}</div></div>`:""}
${settings.termsAndConditions?`<div class="sec" style="margin-top:32px;padding-top:24px;border-top:1px solid #ede8df"><div class="sec-t">Terms &amp; Conditions</div><div class="terms">${settings.termsAndConditions}</div></div>`:""}
<div class="footer"><span>${settings.businessName||""}${settings.businessPhone?" · "+settings.businessPhone:""}</span><span>Generated on ${new Date().toLocaleString("en-IN")}</span></div>
</body></html>`;
}

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
  html,body{height:100%;overscroll-behavior:none}
  input,textarea,select{font-family:'Inter',sans-serif;font-size:15px!important;-webkit-appearance:none;appearance:none}
  input:focus,textarea:focus,select:focus{outline:none}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(200,168,75,0.2);border-radius:2px}
  .pri{background:#c8a84b;color:#141210;font-weight:500;cursor:pointer;border:none;font-family:'Inter',sans-serif;transition:all .15s}
  .pri:hover{background:#b89a3f}
  .pri:active{transform:translateY(1px)}
  .sec-btn{cursor:pointer;border:none;font-family:'Inter',sans-serif;background:transparent;transition:all .15s}
  .sec-btn:active{background:rgba(0,0,0,0.02)}
  .ghost{cursor:pointer;border:none;background:transparent;font-family:'Inter',sans-serif;transition:all .14s}
  .ghost:active{background:rgba(0,0,0,0.02)}
  .dsk-link{cursor:pointer;border:none;background:transparent;font-family:'Inter',sans-serif;transition:all .15s;width:100%;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;text-align:left}
  .dsk-link.on{color:#c8a84b;background:rgba(200,168,75,0.08);font-weight:500}
  .dsk-link:not(.on){color:#6a6258}.dsk-link:not(.on):hover{background:rgba(255,255,255,0.03);color:#a8a098}
  .bnav{cursor:pointer;border:none;background:transparent;font-family:'Inter',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;flex:1;padding:8px 4px;transition:color .15s}
  .sig-c{touch-action:none;cursor:crosshair;display:block;width:100%}
  .lift{transition:transform .18s,box-shadow .18s}
  .lift:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.04)}
  @keyframes su{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes ti{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .su{animation:su .2s ease-out}
  .fi{animation:fi .15s ease}
  .ti{animation:ti .2s ease-out}
  .cf{font-family:'Cormorant Garamond',serif}
  .ui{font-family:'Inter',sans-serif}
  .label{font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
  @media(max-width:767px){.dsk{display:none!important}.bpad{padding-bottom:calc(90px + env(safe-area-inset-bottom, 0px))!important}}
  @media(min-width:768px){.mob{display:none!important}.push{margin-left:220px!important}}
  @media print{body>*{display:none!important}#afpdf{display:flex!important;position:fixed!important;inset:0!important;z-index:9999!important}#afpdf-bar{display:none!important}}
`;

// ─── THEME ────────────────────────────────────────────────────────────────────
const mkTheme = dark => ({
  bg:     dark ? "#0a0908" : "#f0ebe3",
  s1:     dark ? "#141210" : "#ffffff",
  s2:     dark ? "#1a1815" : "#faf6f0",
  s3:     dark ? "#201e1a" : "#f3ede4",
  b1:     dark ? "#262220" : "#e8e0d4",
  b2:     dark ? "#322e29" : "#d0c8ba",
  t1:     dark ? "#f0ebe0" : "#1a1714",
  t2:     dark ? "#a8a098" : "#5a5048",
  t3:     dark ? "#6a6258" : "#8a7d6d",
  gold:   "#c8a84b",
  goldL:  dark ? "rgba(200,168,75,.13)" : "rgba(200,168,75,.1)",
  goldB:  dark ? "rgba(200,168,75,.22)" : "rgba(200,168,75,.18)",
  green:  "#4ade80",
  greenL: dark ? "rgba(74,222,128,.12)" : "rgba(74,222,128,.09)",
  red:    "#f87171",
  in:     dark ? "#1a1815" : "#ffffff",
  inB:    dark ? "#302c27" : "#d0c8ba",
  nav:    dark ? "#0c0b09" : "#141210",
  side:   dark ? "#0c0b09" : "#141210",
});

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [ok, setOk]         = useState(false);
  const [clients, setC]     = useState([]);
  const [forms, setF]       = useState([]);
  const [settings, setS]    = useState(DEFAULT_SETTINGS);
  const [view, setView]     = useState("dashboard");
  const [activeForm, setAF] = useState(null);
  const [toast, setToast]   = useState(null);

  useEffect(()=>{
    (async()=>{
      const [c,f,s] = await Promise.all([stor.get("af2-clients"),stor.get("af2-forms"),stor.get("af2-settings")]);
      if(c) setC(c); if(f) setF(f); if(s) setS({...DEFAULT_SETTINGS,...s});
      setOk(true);
    })();
  },[]);

  useEffect(()=>{ if(ok) stor.set("af2-clients",clients); },[clients,ok]);
  useEffect(()=>{ if(ok) stor.set("af2-forms",forms);   },[forms,ok]);
  useEffect(()=>{ if(ok) stor.set("af2-settings",settings); },[settings,ok]);

  const toast$ = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),2800); };
  const D = settings.darkMode;
  const T = mkTheme(D);

  // CRUD
  const addClient    = d => { const c={id:genId(),...d,createdAt:new Date().toISOString()}; setC(p=>[c,...p]); return c; };
  const updClient    = (id,d) => setC(p=>p.map(c=>c.id===id?{...c,...d}:c));
  const delClient    = id => { setC(p=>p.filter(c=>c.id!==id)); setF(p=>p.filter(f=>f.clientId!==id)); };
  const getNum = async()=>{ const n=(await stor.get("af2-n")||0)+1; await stor.set("af2-n",n); return `AF-${String(n).padStart(4,"0")}`; };

  const newForm = async cid => {
    const cl = clients.find(c=>c.id===cid);
    const fm = { id:genId(), formNumber:await getNum(), clientId:cid,
      clientName:cl?.name||"", clientAddress:cl?.address||"", clientPhone:cl?.phone||"",
      rate:"", date:new Date().toISOString().split("T")[0], orderDetails:"",
      quantity:"", totalAmount:"", customFieldValues:{}, signatureDataUrl:null,
      status:"draft", notes:"", createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() };
    setF(p=>[fm,...p]); setAF({...fm}); setView("form");
  };

  const saveForm = d => { const u={...d,updatedAt:new Date().toISOString()}; setF(p=>p.map(f=>f.id===d.id?u:f)); setAF(u); return u; };
  const dupForm  = async fm => { const n={...fm,id:genId(),formNumber:await getNum(),status:"draft",signatureDataUrl:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}; setF(p=>[n,...p]); setAF({...n}); setView("form"); toast$("Form duplicated"); };
  const delForm  = id => setF(p=>p.filter(f=>f.id!==id));

  const expBackup = ()=>{ const d="data:application/json;charset=utf-8,"+encodeURIComponent(JSON.stringify({clients,forms,settings},null,2)); const a=document.createElement("a"); a.href=d; a.download=`aaradhya-${Date.now()}.json`; a.click(); toast$("Backup exported"); };
  const impBackup = file=>{ const r=new FileReader(); r.onload=e=>{ try{ const d=JSON.parse(e.target.result); if(d.clients)setC(d.clients); if(d.forms)setF(d.forms); if(d.settings)setS({...DEFAULT_SETTINGS,...d.settings}); toast$("Backup restored"); }catch{ toast$("Invalid file","err"); } }; r.readAsText(file); };

  const nav    = v => setView(v);
  const active = view==="form"?"forms":view;
  const NAV    = [{id:"dashboard",icon:LayoutDashboard,l:"Home"},{id:"clients",icon:Users,l:"Clients"},{id:"forms",icon:FileText,l:"Forms"},{id:"settings",icon:Settings,l:"Settings"}];

  if(!ok) return (
    <div style={{background:"#0a0908",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <style>{GCSS}</style>
      <Logo size={52} settings={settings}/>
      <p className="cf" style={{color:"#c8a84b",fontSize:22,letterSpacing:.5}}>Aaradhya Fashion</p>
      <p className="ui" style={{color:"#3a3530",fontSize:12}}>Loading…</p>
    </div>
  );

  return (
    <div className="ui" style={{background:T.bg,color:T.t1,height:"100vh",display:"flex",overflow:"hidden",fontFamily:"'Inter',sans-serif"}}>
      <style>{GCSS}</style>

      {/* ─ Desktop Sidebar ─ */}
      <aside className="dsk" style={{width:220,height:"100vh",background:T.side,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,zIndex:40,borderRight:`1px solid ${D?"#1c1916":"#28231e"}`}}>
        <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${D?"#1c1916":"#28231e"}`}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <Logo size={36} settings={settings}/>
            <div style={{minWidth:0}}>
              <p className="ui" style={{color:"#f0ebe0",fontSize:14,fontWeight:600,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{settings.businessName||"Aaradhya Fashion"}</p>
              <p className="label" style={{color:"#323028",fontSize:8,marginTop:3}}>{settings.businessTagline||"Fashion Studio"}</p>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:1}}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>nav(item.id)} className={`dsk-link${active===item.id?" on":""}`} style={{fontSize:13}}>
              <item.icon size={15} strokeWidth={active===item.id?2:1.7}/><span>{item.label||item.l}</span>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 18px",borderTop:`1px solid ${D?"#1c1916":"#28231e"}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span className="label" style={{color:"#2a2620",fontSize:8}}>v2.0 · Offline</span>
          <button onClick={()=>setS(s=>({...s,darkMode:!s.darkMode}))} className="ghost" style={{color:"#3a3630",display:"flex",padding:4,borderRadius:6}}>
            {D?<Sun size={14} strokeWidth={1.5}/>:<Moon size={14} strokeWidth={1.5}/>}
          </button>
        </div>
      </aside>

      {/* ─ Main ─ */}
      <div className="push" style={{flex:1,display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>

        {/* Mobile header */}
        <header className="mob" style={{background:T.s1,borderBottom:`1px solid ${T.b1}`,padding:"0 16px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,zIndex:30}}>
          {view==="form"
            ? <button onClick={()=>nav("forms")} className="ghost" style={{color:T.gold,display:"flex",alignItems:"center",gap:5,fontSize:14,fontWeight:500}}><ArrowLeft size={17}/> Back</button>
            : <div style={{display:"flex",alignItems:"center",gap:9}}>
                <Logo size={28} settings={settings}/>
                <span className="ui" style={{fontSize:16,fontWeight:600,color:T.t1}}>{settings.businessName||"Aaradhya Fashion"}</span>
              </div>
          }
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {view==="form"&&activeForm&&
              <button onClick={()=>{saveForm(activeForm);toast$("Saved!");}} className="ghost" style={{color:T.t3,padding:"5px 10px",borderRadius:4,fontSize:13,border:`1px solid ${T.b2}`,display:"flex",alignItems:"center",gap:5}}>
                <Save size={13}/> Save
              </button>
            }
            <button onClick={()=>setS(s=>({...s,darkMode:!s.darkMode}))} className="ghost" style={{color:T.t3,padding:6,display:"flex",borderRadius:4}}>
              {D?<Sun size={18} strokeWidth={1.5}/>:<Moon size={18} strokeWidth={1.5}/>}
            </button>
          </div>
        </header>

        {/* Desktop topbar */}
        <header className="dsk" style={{background:T.s1,borderBottom:`1px solid ${T.b1}`,padding:"0 28px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,zIndex:30}}>
          <div>
            <h1 className="ui" style={{fontSize:20,fontWeight:600,color:T.t1,lineHeight:1,letterSpacing:.2}}>
              {view==="dashboard"&&"Dashboard"}{view==="clients"&&"Clients"}{view==="forms"&&"Order Forms"}{view==="form"&&(activeForm?.formNumber||"Form")}{view==="settings"&&"Settings"}
            </h1>
            <p className="label" style={{color:T.t3,marginTop:4,fontSize:9}}>
              {view==="dashboard"&&`${clients.length} clients · ${forms.length} forms`}
              {view==="clients"&&`${clients.length} registered`}{view==="forms"&&`${forms.length} total`}
              {view==="form"&&activeForm?.clientName}{view==="settings"&&"Preferences & Configuration"}
            </p>
          </div>
          {view==="form"&&activeForm&&(
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>nav("forms")} className="ghost" style={{color:T.t3,fontSize:13,display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:4,border:`1px solid ${T.b2}`}}>
                <ArrowLeft size={13}/> Back
              </button>
              <button onClick={()=>{saveForm(activeForm);toast$("Saved!");}} className="ghost" style={{color:T.t2,fontSize:13,display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:4,border:`1px solid ${T.b2}`}}>
                <Save size={13}/> Save
              </button>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="bpad" style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          {view==="dashboard" && <Dash clients={clients} forms={forms} settings={settings} T={T} D={D} nav={nav}/>}
          {view==="clients"   && <ClientsV clients={clients} forms={forms} addClient={addClient} updClient={updClient} delClient={delClient} T={T} D={D} newForm={newForm} toast$={toast$}/>}
          {view==="forms"     && <FormsV forms={forms} delForm={delForm} dupForm={dupForm} setAF={setAF} setView={setView} T={T} D={D} toast$={toast$}/>}
          {view==="form"      && activeForm && <FormV form={activeForm} settings={settings} saveForm={saveForm} setAF={setAF} T={T} D={D} toast$={toast$}/>}
          {view==="settings"  && <SettingsV settings={settings} setS={setS} T={T} D={D} expBackup={expBackup} impBackup={impBackup} toast$={toast$}/>}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="mob" style={{position:"fixed",bottom:0,left:0,right:0,background:T.nav,borderTop:`1px solid ${D?"#1c1916":"#282420"}`,display:"flex",zIndex:40,height:62,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        {NAV.map(item=>(
          <button key={item.id} onClick={()=>nav(item.id)} className="bnav" style={{color:active===item.id?T.gold:"#40382e"}}>
            <div style={{position:"relative"}}>
              <item.icon size={22} strokeWidth={active===item.id?2:1.5}/>
              {active===item.id&&<div style={{position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:T.gold}}/>}
            </div>
            <span className="label" style={{fontSize:9,fontWeight:active===item.id?600:400,letterSpacing:"0.08em",color:"inherit"}}>{item.l}</span>
          </button>
        ))}
      </nav>

      {/* Toast */}
      {toast&&(
        <div className="ti" style={{position:"fixed",bottom:78,left:"50%",transform:"translateX(-50%)",zIndex:100,background:toast.type==="err"?D?"#2c0a0a":"#fff0f0":D?"#0e2010":"#f0fff4",border:`1px solid ${toast.type==="err"?"#5c1a1a":"#1a4a28"}`,color:toast.type==="err"?T.red:T.green,padding:"10px 20px",borderRadius:40,fontSize:13,fontWeight:500,display:"flex",alignItems:"center",gap:8,boxShadow:`0 4px 16px rgba(0,0,0,.15)`,whiteSpace:"nowrap"}}>
          {toast.type==="err"?<AlertCircle size={13}/>:<Check size={13}/>}{toast.msg}
        </div>
      )}
    </div>
  );
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({size,settings}) {
  if(settings.logoBase64) return <img src={settings.logoBase64} style={{width:size,height:size,borderRadius:Math.round(size*.25),objectFit:"cover",flexShrink:0}} alt=""/>;
  return <div style={{width:size,height:size,borderRadius:Math.round(size*.25),background:"linear-gradient(135deg,#c8a84b,#7a6020)",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0908",fontFamily:"Cormorant Garamond,serif",fontSize:Math.round(size*.48),fontWeight:600,flexShrink:0,letterSpacing:-1}}>{(settings.businessName||"A")[0]}</div>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dash({clients,forms,settings,T,D,nav}) {
  const drafts   = forms.filter(f=>f.status==="draft").length;
  const recent   = [...forms].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);
  const topCl    = [...clients].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,4);

  const STATS = [
    {l:"Clients",     v:clients.length, icon:Users,     c:"#c8a84b", bg:"rgba(200,168,75,.1)"},
    {l:"Total Forms", v:forms.length,   icon:FileText,  c:"#60a5fa", bg:"rgba(96,165,250,.1)"},
    {l:"In Progress", v:drafts,         icon:Clock,     c:"#fb923c", bg:"rgba(251,146,60,.1)"},
    {l:"Completed",   v:forms.length-drafts,icon:FileCheck,c:"#4ade80",bg:"rgba(74,222,128,.1)"},
  ];

  return (
    <div className="su" style={{padding:"20px 16px 0"}}>
      {/* Greeting */}
      <div style={{marginBottom:24,padding:"4px 0"}}>
        <h2 className="ui" style={{fontSize:28,fontWeight:600,color:T.t1,lineHeight:1.1,letterSpacing:-0.5}}>Good day</h2>
        <p style={{fontSize:12,color:T.t3,marginTop:6,letterSpacing:.2}}>{settings.businessName} &nbsp;·&nbsp; {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {STATS.map(s=>(
          <div key={s.l} className="lift" style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:4,padding:"18px 16px",cursor:"default"}}>
            <div style={{width:34,height:34,borderRadius:6,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
              <s.icon size={16} color={s.c} strokeWidth={1.8}/>
            </div>
            <div className="ui" style={{fontSize:32,fontWeight:600,color:T.t1,lineHeight:1,letterSpacing:-0.5}}>{s.v}</div>
            <div className="label" style={{color:T.t3,marginTop:6,fontSize:9}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Recent Forms */}
      <PanelCard title="Recent Forms" action={()=>nav("forms")} aLabel="View All" T={T}>
        {recent.length===0 ? <BlankSlate icon={FileText} text="No forms yet" T={T}/>
          : recent.map((f,i)=>(
            <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<recent.length-1?`1px solid ${T.b1}`:"none"}}>
              <div style={{width:36,height:36,borderRadius:6,background:T.s2,border:`1px solid ${T.b1}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <FileText size={14} color={T.gold} strokeWidth={1.6}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:500,color:T.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.clientName||"—"}</p>
                <p style={{fontSize:11,color:T.t3,marginTop:2}}>{f.formNumber} · {f.date}</p>
              </div>
              <Pill status={f.status} T={T}/>
            </div>
          ))
        }
      </PanelCard>

      {/* Recent Clients */}
      <PanelCard title="Recent Clients" action={()=>nav("clients")} aLabel="View All" T={T}>
        {topCl.length===0 ? <BlankSlate icon={Users} text="No clients yet" T={T}/>
          : topCl.map((c,i)=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:i<topCl.length-1?`1px solid ${T.b1}`:"none"}}>
              <Av name={c.name} size={36} T={T}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:500,color:T.t1}}>{c.name}</p>
                <p style={{fontSize:11,color:T.t3,marginTop:1}}>{c.phone||"No phone"}</p>
              </div>
              <p className="label" style={{color:T.t3,fontSize:9}}>{forms.filter(f=>f.clientId===c.id).length} forms</p>
            </div>
          ))
        }
      </PanelCard>
      <div style={{height:8}}/>
    </div>
  );
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
function ClientsV({clients,forms,addClient,updClient,delClient,T,D,newForm,toast$}) {
  const [q,setQ]       = useState("");
  const [modal,setM]   = useState(null);
  const [fm,setFm]     = useState({name:"",address:"",phone:"",notes:""});
  const [menu,setMenu] = useState(null);

  const list = clients.filter(c=>c.name?.toLowerCase().includes(q.toLowerCase())||c.phone?.includes(q)||c.address?.toLowerCase().includes(q.toLowerCase()));
  const openAdd  = ()=>{ setFm({name:"",address:"",phone:"",notes:""}); setM("add"); };
  const openEdit = c=>{ setFm({name:c.name,address:c.address||"",phone:c.phone||"",notes:c.notes||""}); setM(c); };
  const submit   = ()=>{
    if(!fm.name.trim()) return;
    if(typeof modal==="object"&&modal!==null&&modal!=="add"){ updClient(modal.id,fm); toast$("Client updated"); }
    else { addClient(fm); toast$("Client added"); }
    setM(null);
  };

  return (
    <div className="su">
      {/* Search bar */}
      <div style={{padding:"10px 14px",display:"flex",gap:10,background:T.bg,position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${T.b1}`}}>
        <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:8,background:T.s1,border:`1px solid ${T.b2}`,borderRadius:6,padding:"0 13px",height:46,transition:"border-color .15s"}}>
          <Search size={14} color={T.t3} strokeWidth={1.6}/>
          <input style={{flex:1,minWidth:0,background:"transparent",border:"none",color:T.t1,fontSize:14,padding:0}} placeholder="Search clients…" value={q} onChange={e=>setQ(e.target.value)}/>
          {q&&<button onClick={()=>setQ("")} className="ghost" style={{color:T.t3,padding:2,display:"flex"}}><X size={13}/></button>}
        </div>
        <button className="pri" onClick={openAdd} style={{height:46,padding:"0 18px",borderRadius:6,fontSize:13,display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <Plus size={15}/><span className="dsk">Add Client</span><span className="mob">Add</span>
        </button>
      </div>

      <div style={{padding:"10px 14px"}}>
        {list.length===0
          ? <BlankSlate icon={Users} text={q?"No results found":"Add your first client"} sub={!q?"Tap Add to register a new client":""} T={T}/>
          : <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {list.map(c=>{
                const cf = forms.filter(f=>f.clientId===c.id);
                return (
                  <div key={c.id} className="lift" style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:4,overflow:"hidden"}}>
                    <div style={{padding:"14px 16px"}}>
                      {/* Header row */}
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:c.phone||c.address||c.notes?12:16}}>
                        <Av name={c.name} size={46} T={T}/>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:15,fontWeight:600,color:T.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</p>
                          <p className="label" style={{color:T.t3,marginTop:3,fontSize:9}}>{cf.length} form{cf.length!==1?"s":""}</p>
                        </div>
                        <div style={{position:"relative",flexShrink:0}}>
                          <button onClick={()=>setMenu(menu===c.id?null:c.id)} className="ghost" style={{color:T.t3,padding:7,display:"flex",borderRadius:4,background:menu===c.id?T.s2:"transparent"}}>
                            <MoreVertical size={16}/>
                          </button>
                          {menu===c.id&&(
                            <><div onClick={()=>setMenu(null)} style={{position:"fixed",inset:0,zIndex:19}}/>
                            <div style={{position:"absolute",right:0,top:36,background:T.s1,border:`1px solid ${T.b1}`,borderRadius:6,padding:5,zIndex:20,minWidth:160,boxShadow:`0 4px 24px rgba(0,0,0,.2)`}}>
                              <MItem icon={Edit2}  label="Edit Client" onClick={()=>{openEdit(c);setMenu(null);}} T={T}/>
                              <div style={{height:1,background:T.b1,margin:"4px 8px"}}/>
                              <MItem icon={Trash2} label="Delete" onClick={()=>{setMenu(null);if(window.confirm(`Delete ${c.name}?`)){delClient(c.id);toast$("Deleted");}}} T={T} danger/>
                            </div></>
                          )}
                        </div>
                      </div>
                      {/* Meta */}
                      {(c.phone||c.address||c.notes)&&(
                        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14,padding:"10px 12px",background:T.s2,borderRadius:6}}>
                          {c.phone&&<MR icon={Phone}     t={c.phone}   T={T}/>}
                          {c.address&&<MR icon={MapPin}  t={c.address} T={T}/>}
                          {c.notes&&<MR icon={StickyNote}t={c.notes}   T={T}/>}
                        </div>
                      )}
                      {/* CTA */}
                      <button onClick={()=>newForm(c.id)} className="sec-btn" style={{width:"100%",padding:"11px",borderRadius:6,border:`1px solid ${T.gold}`,background:T.goldL,color:T.gold,fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"background .15s"}}>
                        <Plus size={14}/> Create New Form
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>

      {modal&&(
        <Sheet onClose={()=>setM(null)} title={modal==="add"?"New Client":"Edit Client"} T={T}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {[["name","Client Name","Full name *","text"],["phone","Phone","Mobile number","tel"],["address","Address","City, State","text"],["notes","Notes","Optional notes","text"]].map(([k,l,ph,tp])=>(
              <FRow key={k} label={l} T={T}><input type={tp} style={IS(T)} placeholder={ph} value={fm[k]} onChange={e=>setFm(p=>({...p,[k]:e.target.value}))}/></FRow>
            ))}
            <div style={{display:"flex",gap:10,paddingTop:4}}>
              <button onClick={()=>setM(null)} className="sec-btn" style={{flex:1,padding:"10px",borderRadius:6,border:`1px solid ${T.b2}`,color:T.t2,fontSize:14,fontFamily:"'Inter',sans-serif"}}>Cancel</button>
              <button className="pri" onClick={submit} style={{flex:2,padding:"10px",borderRadius:6,fontSize:14}}>{modal==="add"?"Add Client":"Save Changes"}</button>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ─── FORMS ────────────────────────────────────────────────────────────────────
function FormsV({forms,delForm,dupForm,setAF,setView,T,D,toast$}) {
  const [q,setQ]       = useState("");
  const [tab,setTab]   = useState("all");
  const [menu,setMenu] = useState(null);

  const list = forms
    .filter(f=>tab==="all"||f.status===tab)
    .filter(f=>f.clientName?.toLowerCase().includes(q.toLowerCase())||f.formNumber?.toLowerCase().includes(q.toLowerCase())||f.date?.includes(q))
    .sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));

  const open = f=>{ setAF({...f}); setView("form"); };

  return (
    <div className="su">
      <div style={{padding:"10px 14px",background:T.bg,position:"sticky",top:0,zIndex:10,borderBottom:`1px solid ${T.b1}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9,background:T.s1,border:`1px solid ${T.b2}`,borderRadius:6,padding:"0 13px",height:46,marginBottom:10}}>
          <Search size={14} color={T.t3} strokeWidth={1.6}/>
          <input style={{flex:1,background:"transparent",border:"none",color:T.t1,fontSize:14,padding:0}} placeholder="Search by name, number, date…" value={q} onChange={e=>setQ(e.target.value)}/>
          {q&&<button onClick={()=>setQ("")} className="ghost" style={{color:T.t3,padding:2,display:"flex"}}><X size={13}/></button>}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["all","draft","finalized"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className="label sec-btn" style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${tab===t?T.gold:T.b2}`,background:tab===t?T.gold:T.s1,color:tab===t?"#0a0908":T.t3,fontSize:9,transition:"all .18s",fontFamily:"'Inter',sans-serif"}}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"10px 14px"}}>
        {list.length===0
          ? <BlankSlate icon={FileText} text={q||tab!=="all"?"No forms found":"No forms yet"} sub={!q&&tab==="all"?"Create a form from the Clients section":""} T={T}/>
          : <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {list.map(f=>(
                <div key={f.id} className="lift" style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:4}}>
                  <div style={{padding:"15px 18px"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                          <span className="ui" style={{fontSize:16,fontWeight:600,color:T.t1,letterSpacing:.1}}>{f.clientName||"Unknown"}</span>
                          <Pill status={f.status} T={T}/>
                        </div>
                        <div style={{display:"flex",gap:14,fontSize:11,color:T.t3,flexWrap:"wrap"}}>
                          <span style={{display:"flex",alignItems:"center",gap:4}}><Hash size={10}/>{f.formNumber}</span>
                          <span style={{display:"flex",alignItems:"center",gap:4}}><Calendar size={10}/>{f.date}</span>
                          {f.totalAmount&&<span style={{display:"flex",alignItems:"center",gap:4,color:T.gold,fontWeight:500}}>₹{f.totalAmount}</span>}
                        </div>
                      </div>
                      <div style={{position:"relative",flexShrink:0}}>
                        <button onClick={()=>setMenu(menu===f.id?null:f.id)} className="ghost" style={{color:T.t3,padding:7,display:"flex",borderRadius:4,background:menu===f.id?T.s2:"transparent"}}>
                          <MoreVertical size={16}/>
                        </button>
                        {menu===f.id&&(
                          <><div onClick={()=>setMenu(null)} style={{position:"fixed",inset:0,zIndex:19}}/>
                          <div style={{position:"absolute",right:0,top:36,background:T.s1,border:`1px solid ${T.b1}`,borderRadius:6,padding:5,zIndex:20,minWidth:160,boxShadow:`0 4px 24px rgba(0,0,0,.2)`}}>
                            <MItem icon={Copy}   label="Duplicate"  onClick={()=>{dupForm(f);setMenu(null);}} T={T}/>
                            <div style={{height:1,background:T.b1,margin:"4px 8px"}}/>
                            <MItem icon={Trash2} label="Delete"     onClick={()=>{setMenu(null);if(window.confirm("Delete this form?")){delForm(f.id);toast$("Deleted");}}} T={T} danger/>
                          </div></>
                        )}
                      </div>
                    </div>
                    <button onClick={()=>open(f)} className="sec-btn" style={{width:"100%",padding:"10px",borderRadius:6,border:`1px solid ${T.b2}`,background:T.s2,color:T.t2,fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"'Inter',sans-serif"}}>
                      Open & Edit <ChevronRight size={13}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ─── FORM EDITOR ──────────────────────────────────────────────────────────────
function FormV({form,settings,saveForm,setAF,T,D,toast$}) {
  const [data,setData]     = useState({...form});
  const [preview,setPrev]  = useState(false);
  const [pdfOpen,setPDF]   = useState(false);
  const [saved,setSaved]   = useState(false);
  const timer = useRef(null);

  const upd  = (k,v)=>setData(p=>{ const u={...p,[k]:v}; auto(u); return u; });
  const updC = (id,v)=>setData(p=>{ const u={...p,customFieldValues:{...p.customFieldValues,[id]:v}}; auto(u); return u; });
  const auto = u=>{ clearTimeout(timer.current); timer.current=setTimeout(()=>{ saveForm(u); setSaved(true); setTimeout(()=>setSaved(false),2200); },1200); };
  useEffect(()=>{ setAF(data); },[data]);

  const doExport = ()=>{ saveForm(data); setPDF(true); };
  const dlHTML   = ()=>{
    const h=buildPDF(data,settings);
    try { const b=new Blob([h],{type:"text/html"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download=`${data.formNumber}.html`; a.style.display="none"; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(u);document.body.removeChild(a);},1e3); }
    catch(e) { const a=document.createElement("a"); a.href="data:text/html;charset=utf-8,"+encodeURIComponent(h); a.download=`${data.formNumber}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
    toast$("Downloaded — open in browser → Print → Save as PDF");
  };

  const IC = IS(T);

  return (
    <div className="su" style={{padding:"12px 14px"}}>
      {/* Form header card */}
      <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:4,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span className="ui" style={{fontSize:24,fontWeight:600,color:T.t1,letterSpacing:-0.5}}>{data.formNumber}</span>
            <Pill status={data.status} T={T}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:11,color:T.t3}}>{data.clientName||"—"}</span>
            {saved&&<span style={{fontSize:11,color:T.green,display:"flex",alignItems:"center",gap:3}}><Check size={10}/>Auto-saved</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{const u={...data,status:data.status==="finalized"?"draft":"finalized"};setData(u);saveForm(u);toast$(u.status==="finalized"?"Finalized":"Reopened");}} className="sec-btn" style={{padding:"8px 13px",borderRadius:6,border:`1px solid ${data.status==="finalized"?T.green:T.gold}`,color:data.status==="finalized"?T.green:T.gold,fontSize:12,fontWeight:500,fontFamily:"'Inter',sans-serif",background:"transparent"}}>
            {data.status==="finalized"?"Reopen":"Finalize"}
          </button>
          <button onClick={()=>setPrev(true)} className="sec-btn" style={{padding:"8px 12px",borderRadius:6,border:`1px solid ${T.b2}`,color:T.t2,fontSize:12,display:"flex",alignItems:"center",gap:5,fontFamily:"'Inter',sans-serif",background:"transparent"}}>
            <Eye size={13}/><span className="dsk">Preview</span>
          </button>
        </div>
      </div>

      {/* Sections */}
      <Sec title="Client Details" T={T}>
        <FRow label="Client Name" T={T}><input style={IC} value={data.clientName} onChange={e=>upd("clientName",e.target.value)} placeholder="Full name"/></FRow>
        <FRow label="Phone Number" T={T}><input type="tel" style={IC} value={data.clientPhone||""} onChange={e=>upd("clientPhone",e.target.value)} placeholder="+91 98765 43210"/></FRow>
        <FRow label="Address" T={T}><input style={IC} value={data.clientAddress} onChange={e=>upd("clientAddress",e.target.value)} placeholder="Full address"/></FRow>
      </Sec>

      <Sec title="Order Details" T={T}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <FRow label="Date" T={T}><input type="date" style={IC} value={data.date} onChange={e=>upd("date",e.target.value)}/></FRow>
          <FRow label="Quantity" T={T}><input type="number" style={IC} value={data.quantity} onChange={e=>upd("quantity",e.target.value)} placeholder="0"/></FRow>
          <FRow label="Rate (₹)" T={T}><input type="number" style={IC} value={data.rate} onChange={e=>upd("rate",e.target.value)} placeholder="0.00"/></FRow>
          <FRow label="Total (₹)" T={T}><input type="number" style={{...IC,borderColor:T.gold}} value={data.totalAmount} onChange={e=>upd("totalAmount",e.target.value)} placeholder="0.00"/></FRow>
        </div>
        <FRow label="Order Description" T={T}><textarea style={{...IC,height:88,resize:"vertical"}} value={data.orderDetails} onChange={e=>upd("orderDetails",e.target.value)} placeholder="Describe the order…"/></FRow>
      </Sec>

      {settings.customFields?.length>0&&(
        <Sec title="Additional Fields" T={T}>
          {settings.customFields.map(f=>(
            <FRow key={f.id} label={f.label} T={T}>
              <CFInput field={f} value={data.customFieldValues?.[f.id]??""} onChange={v=>updC(f.id,v)} IC={IC} T={T}/>
            </FRow>
          ))}
        </Sec>
      )}

      <Sec title="Internal Notes" sub="Private — not printed in PDF" T={T}>
        <textarea style={{...IC,height:76,resize:"vertical"}} value={data.notes} onChange={e=>upd("notes",e.target.value)} placeholder="Notes for your reference…"/>
      </Sec>

      <Sec title="Client Signature" T={T}>
        <SigPad value={data.signatureDataUrl} onChange={v=>upd("signatureDataUrl",v)} T={T}/>
      </Sec>

      {/* Buttons */}
      <div style={{display:"flex",gap:10,marginBottom:"calc(30px + env(safe-area-inset-bottom,0px))"}}>
        <button className="sec-btn" onClick={()=>{saveForm(data);toast$("Saved!");}} style={{flex:1,padding:"10px",borderRadius:6,border:`1px solid ${T.b2}`,color:T.t2,fontSize:14,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:7,fontFamily:"'Inter',sans-serif"}}>
          <Save size={14}/> Save
        </button>
        <button className="pri" onClick={doExport} style={{flex:2,padding:"10px",borderRadius:6,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          <Download size={14}/> Export PDF
        </button>
      </div>

      {/* Preview */}
      {preview&&(
        <div className="fi" style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:60,display:"flex",flexDirection:"column"}}>
          <div style={{background:T.s1,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.b1}`,flexShrink:0}}>
            <span className="cf" style={{fontSize:19,fontWeight:500,color:T.t1}}>PDF Preview</span>
            <div style={{display:"flex",gap:8}}>
              <button className="pri" onClick={()=>{setPrev(false);setTimeout(doExport,80);}} style={{padding:"8px 18px",borderRadius:6,fontSize:12,display:"flex",alignItems:"center",gap:5}}><Download size={13}/> Export</button>
              <button onClick={()=>setPrev(false)} className="ghost" style={{color:T.t3,padding:5,borderRadius:4,display:"flex"}}><X size={20}/></button>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px",WebkitOverflowScrolling:"touch"}}>
            <PDFPreviewDoc form={data} settings={settings}/>
          </div>
        </div>
      )}

      {/* PDF full viewer */}
      {pdfOpen&&<PDFViewer form={data} settings={settings} onClose={()=>setPDF(false)} onDL={dlHTML}/>}
    </div>
  );
}

// ─── PDF VIEWER ───────────────────────────────────────────────────────────────
function PDFViewer({form,settings,onClose,onDL}) {
  const printCSS = `@media print{body>*{display:none!important}#afpdf{display:flex!important;position:fixed!important;inset:0!important;z-index:9999!important}}`;
  
  const handleDownloadPdf = () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    const opt = {
      margin:       0,
      filename:     `${form.formNumber}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <>
      <style>{printCSS}</style>
      <div id="afpdf" className="fi" style={{position:"fixed",inset:0,zIndex:80,background:"#1a1814",display:"flex",flexDirection:"column"}}>
        <div id="afpdf-bar" style={{background:"#141210",padding:"11px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #252220",flexShrink:0}}>
          <button onClick={onClose} className="ghost" style={{color:"#a8a098",display:"flex",alignItems:"center",gap:6,fontSize:13,fontFamily:"'Inter',sans-serif",padding:"5px 8px",borderRadius:4}}>
            <ArrowLeft size={15}/> Close
          </button>
          <div style={{flex:1,color:"#f0ebe0",fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{form.formNumber} — {form.clientName||"Form"}</div>
          <button onClick={onDL} className="ghost" style={{padding:"8px 14px",borderRadius:6,border:"1px solid #303028",color:"#a8a098",fontSize:12,display:"flex",alignItems:"center",gap:6,fontFamily:"'Inter',sans-serif",background:"transparent",flexShrink:0}}>
            <Download size={13}/> HTML
          </button>
          <button onClick={handleDownloadPdf} className="pri" style={{padding:"8px 14px",borderRadius:6,fontSize:13,display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
            <Download size={15}/> Download PDF
          </button>
        </div>
        <div style={{flex:1,overflowY:"auto",background:"#2a2620",padding:"20px 16px",WebkitOverflowScrolling:"touch"}}>
          <div id="pdf-content">
            <PDFPreviewDoc form={form} settings={settings}/>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PDF PREVIEW DOCUMENT ─────────────────────────────────────────────────────
function PDFPreviewDoc({form,settings}) {
  const cf = settings.customFields||[];
  const PSec = ({title,children})=>(
    <div style={{marginBottom:22}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:4,textTransform:"uppercase",color:"#c8a84b",marginBottom:12,paddingBottom:6,borderBottom:"1px solid #f0e8d8",fontFamily:"Arial,sans-serif"}}>{title}</div>
      {children}
    </div>
  );
  const PF = ({l,v})=>(
    <div><div style={{color:"#8a7d6d",fontSize:9,textTransform:"uppercase",letterSpacing:1,marginBottom:3,fontFamily:"Arial,sans-serif"}}>{l}</div><div style={{fontWeight:600,fontSize:13,color:"#1a1714"}}>{v||"—"}</div></div>
  );
  return (
    <div style={{background:"#fff",color:"#1a1714",maxWidth:800,margin:"0 auto",borderRadius:4,boxShadow:"0 8px 30px rgba(0,0,0,.1)",padding:"40px 36px",fontFamily:"Georgia,serif",fontSize:13,lineHeight:1.65}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingBottom:24,borderBottom:"3px solid #c8a84b",marginBottom:28}}>
        <div>
          {settings.logoBase64&&<img src={settings.logoBase64} style={{height:48,objectFit:"contain",marginBottom:10,display:"block"}} alt=""/>}
          <div style={{fontSize:24,fontWeight:700,letterSpacing:-0.5}}>{settings.businessName||"Aaradhya Fashion"}</div>
          {settings.businessTagline&&<div style={{color:"#8a7d6d",fontSize:9,letterSpacing:4,textTransform:"uppercase",marginTop:4,fontFamily:"Arial,sans-serif"}}>{settings.businessTagline}</div>}
          <div style={{color:"#6b6054",fontSize:11,marginTop:8,lineHeight:1.9,fontFamily:"Arial,sans-serif"}}>
            {[settings.businessAddress,settings.businessPhone,settings.businessEmail].filter(Boolean).map((v,i)=><div key={i}>{v}</div>)}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:28,fontWeight:700,color:"#c8a84b",letterSpacing:-1}}>{form.formNumber}</div>
          <div style={{color:"#8a7d6d",fontSize:9,letterSpacing:3,textTransform:"uppercase",marginTop:4,fontFamily:"Arial,sans-serif"}}>Order Form</div>
          <div style={{marginTop:8,display:"inline-block",padding:"3px 12px",borderRadius:20,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:2,fontFamily:"Arial,sans-serif",background:form.status==="finalized"?"#dcfce7":"#fef9c3",color:form.status==="finalized"?"#15803d":"#854d0e"}}>{form.status}</div>
          <div style={{color:"#6b6054",fontSize:11,marginTop:7,fontFamily:"Arial,sans-serif"}}>{form.date}</div>
        </div>
      </div>
      <PSec title="Client Details">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <PF l="Client Name" v={form.clientName}/><PF l="Contact" v={form.clientPhone}/>
          <div style={{gridColumn:"1/-1"}}><PF l="Address" v={form.clientAddress}/></div>
        </div>
      </PSec>
      <PSec title="Order Details">
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:"#f8f4ec"}}>{["Description","Qty","Rate (₹)","Amount (₹)"].map((h,i)=><th key={h} style={{padding:"10px 12px",textAlign:i>0?"right":"left",color:"#8a7d6d",fontSize:9,textTransform:"uppercase",letterSpacing:2,fontWeight:700,fontFamily:"Arial,sans-serif"}}>{h}</th>)}</tr></thead>
          <tbody><tr>
            <td style={{padding:"11px 12px",borderBottom:"1px solid #ede8df",fontSize:13}}>{form.orderDetails||"—"}</td>
            <td style={{padding:"11px 12px",textAlign:"right",borderBottom:"1px solid #ede8df"}}>{form.quantity||"—"}</td>
            <td style={{padding:"11px 12px",textAlign:"right",borderBottom:"1px solid #ede8df"}}>₹{form.rate||"0"}</td>
            <td style={{padding:"11px 12px",textAlign:"right",fontWeight:700,borderBottom:"1px solid #ede8df"}}>₹{form.totalAmount||"0"}</td>
          </tr></tbody>
          <tfoot><tr style={{background:"#f8f4ec"}}>
            <td colSpan={3} style={{padding:"10px 12px",textAlign:"right",fontSize:9,textTransform:"uppercase",letterSpacing:2,fontWeight:700,fontFamily:"Arial,sans-serif",color:"#8a7d6d"}}>Total Amount</td>
            <td style={{padding:"10px 12px",textAlign:"right",fontWeight:700,fontSize:14,color:"#c8a84b"}}>₹{form.totalAmount||"0"}</td>
          </tr></tfoot>
        </table>
      </PSec>
      {cf.length>0&&<PSec title="Additional Details"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>{cf.map(f=>{const v=form.customFieldValues?.[f.id];if(!v&&v!==false)return null;return<PF key={f.id} l={f.label} v={f.type==="checkbox"?(v?"Yes":"No"):String(v)}/>;})}</div></PSec>}
      {form.signatureDataUrl&&(
        <PSec title="Client Signature">
          <div style={{border:"1px solid #e8e0d4",display:"inline-block",padding:"10px 12px",borderRadius:6,background:"#faf8f5"}}>
            <img src={form.signatureDataUrl} style={{display:"block",maxHeight:75,maxWidth:260}} alt="Signature"/>
          </div>
          <div style={{color:"#8a7d6d",fontSize:10,marginTop:7,fontFamily:"Arial,sans-serif"}}>{form.clientName} · {form.date}</div>
        </PSec>
      )}
      {settings.termsAndConditions&&(
        <div style={{marginTop:24,paddingTop:20,borderTop:"1px solid #ede8df"}}>
          <PSec title="Terms & Conditions">
            <div style={{color:"#8a7d6d",fontSize:10,whiteSpace:"pre-line",lineHeight:1.8,fontFamily:"Arial,sans-serif"}}>{settings.termsAndConditions}</div>
          </PSec>
        </div>
      )}
      <div style={{marginTop:24,paddingTop:14,borderTop:"1px solid #ede8df",display:"flex",justifyContent:"space-between",color:"#a09080",fontSize:9,fontFamily:"Arial,sans-serif"}}>
        <span>{settings.businessName}{settings.businessPhone?" · "+settings.businessPhone:""}</span>
        <span>Generated {new Date().toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsV({settings,setS,T,D,expBackup,impBackup,toast$}) {
  const [tab,setTab] = useState("business");
  const [nf,setNf]   = useState({label:"",type:"text",options:""});
  const ref          = useRef(null);
  const upd          = (k,v)=>setS(p=>({...p,[k]:v}));

  const addField = ()=>{
    if(!nf.label.trim()) return;
    const f={id:genId(),label:nf.label,type:nf.type,options:nf.type==="dropdown"?nf.options.split("\n").filter(Boolean):[]};
    upd("customFields",[...(settings.customFields||[]),f]);
    setNf({label:"",type:"text",options:""}); toast$("Field added");
  };

  const IC  = IS(T);
  const TABS= [{id:"business",l:"Business"},{id:"fields",l:"Fields"},{id:"terms",l:"Terms"},{id:"data",l:"Backup"}];

  return (
    <div className="su">
      {/* Tab bar */}
      <div style={{display:"flex",background:T.s1,borderBottom:`1px solid ${T.b1}`,position:"sticky",top:0,zIndex:10}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} className="ghost" style={{flex:1,padding:"14px 6px",fontSize:12,fontWeight:tab===t.id?600:400,color:tab===t.id?T.gold:T.t3,borderBottom:`2px solid ${tab===t.id?T.gold:"transparent"}`,borderRadius:0,letterSpacing:"0.02em",fontFamily:"'Inter',sans-serif"}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{padding:"16px"}}>
        {/* ── Business ── */}
        {tab==="business"&&(
          <div className="su">
            <SectionLabel text="Identity" T={T}/>
            <GroupBox T={T} style={{marginBottom:16}}>
              <GroupRow label="Logo" noBorder T={T}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  {settings.logoBase64?<img src={settings.logoBase64} style={{width:52,height:52,borderRadius:6,objectFit:"contain",border:`1px solid ${T.b1}`}} alt=""/>:<div style={{width:52,height:52,borderRadius:6,border:`1.5px dashed ${T.b2}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.t3}}><Upload size={18} strokeWidth={1.5}/></div>}
                  <div>
                    <input type="file" accept="image/*" style={{display:"none"}} id="lup" onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>upd("logoBase64",ev.target.result);r.readAsDataURL(f);}}/>
                    <label htmlFor="lup" className="pri" style={{padding:"8px 16px",borderRadius:6,fontSize:12,cursor:"pointer",display:"inline-block"}}>Upload</label>
                    {settings.logoBase64&&<button onClick={()=>upd("logoBase64",null)} className="ghost" style={{marginLeft:8,color:T.t3,fontSize:12,fontFamily:"'Inter',sans-serif"}}>Remove</button>}
                  </div>
                </div>
              </GroupRow>
            </GroupBox>
            <GroupBox T={T} style={{marginBottom:16}}>
              {[["businessName","Business Name","Aaradhya Fashion"],["businessTagline","Tagline","Luxury Fashion & Apparel"],["businessAddress","Address","Your full address"],["businessPhone","Phone","+91 98765 43210"],["businessEmail","Email","hello@business.com"]].map(([k,l,ph],i,arr)=>(
                <GroupRow key={k} label={l} noBorder={i===arr.length-1} T={T}>
                  <input style={{...IC,borderRadius:4,padding:"9px 12px",fontSize:14}} value={settings[k]||""} onChange={e=>upd(k,e.target.value)} placeholder={ph}/>
                </GroupRow>
              ))}
            </GroupBox>
            <SectionLabel text="Appearance" T={T}/>
            <GroupBox T={T}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px"}}>
                <div><p style={{fontSize:14,fontWeight:500,color:T.t1}}>Dark Mode</p><p style={{fontSize:12,color:T.t3,marginTop:2}}>Toggle app theme</p></div>
                <Toggle on={settings.darkMode} flip={()=>upd("darkMode",!settings.darkMode)} T={T}/>
              </div>
            </GroupBox>
          </div>
        )}

        {/* ── Custom Fields ── */}
        {tab==="fields"&&(
          <div className="su">
            <SectionLabel text="Add New Field" T={T}/>
            <GroupBox T={T} style={{padding:"16px",marginBottom:16}}>
              <FRow label="Field Label" T={T}><input style={IC} value={nf.label} onChange={e=>setNf(p=>({...p,label:e.target.value}))} placeholder="e.g. Fabric Type, Delivery Date"/></FRow>
              <FRow label="Field Type" T={T}>
                <select style={{...IC,cursor:"pointer"}} value={nf.type} onChange={e=>setNf(p=>({...p,type:e.target.value}))}>
                  {[["text","Text Input"],["number","Number"],["dropdown","Dropdown"],["checkbox","Checkbox"],["multiline","Multiline Text"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </FRow>
              {nf.type==="dropdown"&&<FRow label="Options (one per line)" T={T}><textarea style={{...IC,height:76,resize:"vertical"}} value={nf.options} onChange={e=>setNf(p=>({...p,options:e.target.value}))} placeholder={"Option A\nOption B\nOption C"}/></FRow>}
              <button className="pri" onClick={addField} style={{width:"100%",padding:"12px",borderRadius:6,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:4}}><Plus size={14}/> Add Field</button>
            </GroupBox>
            <SectionLabel text={`Active Fields (${(settings.customFields||[]).length})`} T={T}/>
            {(settings.customFields||[]).length===0
              ? <BlankSlate icon={Settings} text="No fields yet" sub="Fields you add appear in every new form" T={T}/>
              : <GroupBox T={T}>
                  {settings.customFields.map((f,i)=>(
                    <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<settings.customFields.length-1?`1px solid ${T.b1}`:"none"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:14,fontWeight:500,color:T.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.label}</p>
                        <p className="label" style={{color:T.t3,marginTop:2,fontSize:9}}>{f.type}{f.type==="dropdown"&&f.options?.length>0?` · ${f.options.slice(0,2).join(", ")}${f.options.length>2?"…":""}`:""}</p>
                      </div>
                      <button onClick={()=>{upd("customFields",settings.customFields.filter(c=>c.id!==f.id));toast$("Field removed");}} className="ghost" style={{color:T.t3,padding:7,borderRadius:4,display:"flex"}} onMouseEnter={e=>e.currentTarget.style.color=T.red} onMouseLeave={e=>e.currentTarget.style.color=T.t3}><Trash2 size={15} strokeWidth={1.5}/></button>
                    </div>
                  ))}
                </GroupBox>
            }
          </div>
        )}

        {/* ── Terms ── */}
        {tab==="terms"&&(
          <div className="su">
            <SectionLabel text="Terms & Conditions" T={T}/>
            <p style={{fontSize:12,color:T.t3,marginBottom:12,lineHeight:1.6}}>These terms appear at the bottom of every exported PDF document.</p>
            <textarea style={{...IC,height:320,resize:"vertical",lineHeight:1.7}} value={settings.termsAndConditions||""} onChange={e=>upd("termsAndConditions",e.target.value)} placeholder="Enter your terms and conditions…"/>
          </div>
        )}

        {/* ── Data ── */}
        {tab==="data"&&(
          <div className="su" style={{display:"flex",flexDirection:"column",gap:14}}>
            <SectionLabel text="Backup & Restore" T={T}/>
            <GroupBox T={T} style={{padding:"12px 14px",fontSize:13,color:T.t2,lineHeight:1.7}}>
              All clients, forms, and settings are stored only in this browser. Export a backup file regularly to avoid data loss.
            </GroupBox>
            <button className="pri" onClick={expBackup} style={{width:"100%",padding:"10px",borderRadius:6,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Download size={15}/> Export Backup (.json)</button>
            <div>
              <input type="file" accept=".json" style={{display:"none"}} ref={ref} onChange={e=>{if(e.target.files?.[0])impBackup(e.target.files[0]);e.target.value="";}}/>
              <button onClick={()=>ref.current?.click()} className="sec-btn" style={{width:"100%",padding:"10px",borderRadius:6,border:`1px solid ${T.b2}`,color:T.t2,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Inter',sans-serif"}}>
                <Upload size={15}/> Import Backup
              </button>
            </div>
            <SectionLabel text="Storage" T={T}/>
            <GroupBox T={T}>
              {[["Type","Browser Local Storage"],["Internet","Not Required"],["Sync","Offline Only"]].map(([k,v],i,a)=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<a.length-1?`1px solid ${T.b1}`:"none",fontSize:13}}>
                  <span style={{color:T.t3}}>{k}</span><span style={{color:T.t1,fontWeight:500}}>{v}</span>
                </div>
              ))}
            </GroupBox>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Av({name,size,T}) {
  return <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#c8a84b,#7a6020)",display:"flex",alignItems:"center",justifyContent:"center",color:"#0a0908",fontFamily:"Cormorant Garamond,serif",fontSize:Math.round(size*.44),fontWeight:600,flexShrink:0,letterSpacing:-0.5}}>{name?.[0]?.toUpperCase()||"?"}</div>;
}

function Pill({status,T}) {
  const ok = status==="finalized";
  return <span className="label" style={{padding:"3px 9px",borderRadius:20,background:ok?T.greenL:T.goldL,color:ok?T.green:T.gold,border:`1px solid ${ok?"rgba(74,222,128,.2)":"rgba(200,168,75,.2)"}`,fontSize:9}}>{status}</span>;
}

function PanelCard({title,action,aLabel,children,T}) {
  return (
    <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:4,padding:"14px 16px",marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <h3 className="ui" style={{fontSize:16,fontWeight:600,color:T.t1}}>{title}</h3>
        {action&&<button onClick={action} className="ghost label" style={{color:T.gold,fontSize:9,fontFamily:"'Inter',sans-serif"}}>{aLabel}</button>}
      </div>
      {children}
    </div>
  );
}

function Sec({title,sub,children,T}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:8}}>
        <span className="label" style={{color:T.gold,fontSize:9}}>{title}</span>
        {sub&&<span style={{fontSize:10,color:T.t3}}>{sub}</span>}
      </div>
      <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:4,padding:"12px 14px",display:"flex",flexDirection:"column",gap:12}}>
        {children}
      </div>
    </div>
  );
}

function FRow({label,children,T}) {
  return <div><p className="label" style={{color:T.t3,marginBottom:6,fontSize:9}}>{label}</p>{children}</div>;
}

function GroupBox({children,T,style}) {
  return <div style={{background:T.s1,border:`1px solid ${T.b1}`,borderRadius:4,overflow:"hidden",...style}}>{children}</div>;
}

function GroupRow({label,children,noBorder,T}) {
  return (
    <div style={{padding:"13px 16px",borderBottom:noBorder?"none":`1px solid ${T.b1}`}}>
      <p className="label" style={{color:T.t3,marginBottom:6,fontSize:9}}>{label}</p>
      {children}
    </div>
  );
}

function SectionLabel({text,T}) {
  return <p className="label" style={{color:T.t3,marginBottom:8,fontSize:9}}>{text}</p>;
}

function MR({icon:Icon,t,T}) {
  return <div style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:T.t3,minWidth:0}}><Icon size={11} strokeWidth={1.5} style={{flexShrink:0}}/><div style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t}</div></div>;
}

function MItem({icon:Icon,label,onClick,T,danger}) {
  return <button onClick={onClick} className="ghost" style={{width:"100%",padding:"10px 13px",borderRadius:6,color:danger?T.red:T.t2,fontSize:13,display:"flex",alignItems:"center",gap:8,fontFamily:"'Inter',sans-serif",background:"transparent"}}><Icon size={14}/>{label}</button>;
}

function BlankSlate({icon:Icon,text,sub,T}) {
  return (
    <div style={{textAlign:"center",padding:"48px 16px"}}>
      <div style={{width:56,height:56,borderRadius:4,background:T.s2,border:`1px solid ${T.b1}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
        <Icon size={24} color={T.t3} strokeWidth={1}/>
      </div>
      <p className="cf" style={{fontSize:20,color:T.t2,marginBottom:5,letterSpacing:.2}}>{text}</p>
      {sub&&<p style={{fontSize:12,color:T.t3,lineHeight:1.6}}>{sub}</p>}
    </div>
  );
}

function Toggle({on,flip,T}) {
  return <button onClick={flip} style={{width:48,height:26,borderRadius:13,border:"none",background:on?T.gold:"#302c27",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
    <div style={{width:20,height:20,background:"#fff",borderRadius:"50%",position:"absolute",top:3,left:on?25:3,transition:"left .18s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
  </button>;
}

function Sheet({onClose,title,children,T}) {
  return (
    <div className="fi" style={{position:"fixed",inset:0,zIndex:60,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"rgba(0,0,0,.75)"}}>
      <div onClick={onClose} style={{flex:1}}/>
      <div className="su" style={{background:T.s1,borderRadius:"22px 22px 0 0",maxHeight:"92vh",display:"flex",flexDirection:"column",paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
        <div style={{width:40,height:4,borderRadius:2,background:T.b2,margin:"14px auto 4px"}}/>
        <div style={{padding:"8px 20px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.b1}`,flexShrink:0}}>
          <h3 className="ui" style={{fontSize:20,fontWeight:600,color:T.t1,letterSpacing:.2}}>{title}</h3>
          <button onClick={onClose} className="ghost" style={{color:T.t3,padding:5,display:"flex",borderRadius:4}}><X size={18}/></button>
        </div>
        <div style={{padding:"16px 20px 20px",overflowY:"auto",WebkitOverflowScrolling:"touch"}}>{children}</div>
      </div>
    </div>
  );
}

function CFInput({field,value,onChange,IC,T}) {
  if(field.type==="text")      return <input type="text" style={IC} value={value} onChange={e=>onChange(e.target.value)} placeholder={field.label}/>;
  if(field.type==="number")    return <input type="number" style={IC} value={value} onChange={e=>onChange(e.target.value)} placeholder="0"/>;
  if(field.type==="multiline") return <textarea style={{...IC,height:80,resize:"vertical"}} value={value} onChange={e=>onChange(e.target.value)} placeholder={field.label}/>;
  if(field.type==="checkbox")  return (
    <label style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",minHeight:44,padding:"2px 0"}}>
      <input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)} style={{display:"none"}}/>
      <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${value?T.gold:"#5a5048"}`,background:value?T.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
        {value&&<Check size={13} color="#0a0908" strokeWidth={3}/>}
      </div>
      <span style={{fontSize:14,color:T.t2}}>{field.label}</span>
    </label>
  );
  if(field.type==="dropdown") return (
    <select style={{...IC,cursor:"pointer"}} value={value} onChange={e=>onChange(e.target.value)}>
      <option value="">Select…</option>
      {(field.options||[]).map((o,i)=><option key={i} value={o}>{o}</option>)}
    </select>
  );
  return null;
}

function SigPad({value,onChange,T}) {
  const ref      = useRef(null);
  const drawing  = useRef(false);
  const hasDrawn = useRef(false);
  const lastPt   = useRef(null);
  const [active, setActive] = useState(false);

  // useCallback with [] keeps the same function reference across ALL re-renders.
  // Without this, React calls the ref with null then canvas on every render,
  // which resets the canvas and wipes the drawing after each finger-lift.
  const attachCanvas = useCallback((canvas) => {
    ref.current = canvas;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fdfcfa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw existing signature only on first mount
    if(value){
      const img = new Image();
      img.onload = () => {
        if(ref.current) {
          const c2 = ref.current.getContext("2d");
          c2.drawImage(img, 0, 0, ref.current.width, ref.current.height);
        }
      };
      img.src = value;
    }
  }, []); // eslint-disable-line — intentionally empty: only run on mount

  const pt = (e,c) => {
    const r = c.getBoundingClientRect();
    const s = e.touches?.[0] || e;
    return { x:(s.clientX-r.left)*(c.width/r.width), y:(s.clientY-r.top)*(c.height/r.height) };
  };

  const start = e => {
    e.preventDefault();
    drawing.current = true;
    setActive(true);
    const cv = ref.current;
    const p  = pt(e, cv);
    lastPt.current = p;
    const ctx = cv.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = e => {
    e.preventDefault();
    if(!drawing.current) return;
    const cv   = ref.current;
    const ctx  = cv.getContext("2d");
    const p    = pt(e, cv);
    const last = lastPt.current;
    const mx   = (last.x + p.x) / 2;
    const my   = (last.y + p.y) / 2;
    const dist = Math.sqrt((p.x-last.x)**2 + (p.y-last.y)**2);
    const w    = Math.max(1.4, Math.min(3.2, 3.6 - dist * 0.06));
    ctx.lineWidth   = w;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.strokeStyle = "#1c1917";
    ctx.shadowColor = "rgba(28,25,23,0.15)";
    ctx.shadowBlur  = 1.2;
    ctx.quadraticCurveTo(last.x, last.y, mx, my);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mx, my);
    lastPt.current  = p;
    hasDrawn.current = true;
  };

  // Lift finger / release mouse — save current canvas, but KEEP canvas visible
  const end = e => {
    if(!drawing.current) return;
    drawing.current = false;
    setActive(false);
    if(hasDrawn.current){
      const cv = ref.current;
      const t  = document.createElement("canvas");
      t.width  = cv.width;
      t.height = cv.height;
      const tx = t.getContext("2d");
      tx.fillStyle = "#fdfcfa";
      tx.fillRect(0, 0, t.width, t.height);
      tx.drawImage(cv, 0, 0);
      onChange(t.toDataURL("image/png"));
    }
  };

  const clear = () => {
    hasDrawn.current = false;
    setActive(false);
    const cv = ref.current;
    if(cv){
      const ctx = cv.getContext("2d");
      ctx.fillStyle = "#fdfcfa";
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
    onChange(null);
  };

  const dark   = T.bg === "#0a0908";
  const shadow = dark
    ? "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
    : "0 2px 12px rgba(0,0,0,0.06)";

  // Always render the canvas — React reuses the same DOM node on re-render,
  // so canvas pixels are preserved even after onChange fires and parent re-renders.
  return (
    <div>
      <div style={{
        borderRadius:4,
        overflow: "hidden",
        position: "relative",
        background: "#fdfcfa",
        border:`1px solid ${active ? "#c8a84b" : value ? T.b1 : T.b1}`,
        boxShadow: active ? `0 0 0 3px rgba(200,168,75,0.15), ${shadow}` : shadow,
        transition: "border-color .2s, box-shadow .2s"
      }}>
        {/* Signed badge — shown when signature exists and not actively drawing */}
        {value && !active && (
          <div style={{
            position:"absolute", top:10, right:10, zIndex:2,
            display:"flex", alignItems:"center", gap:5,
            background:"rgba(253,252,250,0.92)", backdropFilter:"blur(4px)",
            border:"1px solid #e0d8ce", borderRadius:20,
            padding:"4px 10px 4px 7px"
          }}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 5px rgba(74,222,128,0.6)"}}/>
            <span style={{fontSize:10,fontWeight:600,color:"#8a7d6d",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Inter',sans-serif"}}>Signed</span>
          </div>
        )}

        {/* Empty-state prompt — only when no sig and not drawing */}
        {!value && !active && !hasDrawn.current && (
          <div style={{
            position:"absolute", inset:0, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            pointerEvents:"none", gap:10, zIndex:1, paddingBottom:20
          }}>
            <div style={{
              width:42, height:42, borderRadius:"50%",
              background:"rgba(200,168,75,0.1)",
              border:"1.5px solid rgba(200,168,75,0.24)",
              display:"flex", alignItems:"center", justifyContent:"center"
            }}>
              <Pen size={16} color="#c8a84b" strokeWidth={1.7}/>
            </div>
            <p style={{fontSize:12,color:"#b8b0a0",fontFamily:"'Inter',sans-serif",fontWeight:500,margin:0}}>
              Tap here to sign
            </p>
          </div>
        )}

        {/* The canvas — always mounted, never replaced */}
        <canvas
          ref={attachCanvas}
          width={560}
          height={150}
          className="sig-c"
          style={{height:148, width:"100%", display:"block"}}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />

        {/* Signature line at bottom */}
        <div style={{
          position:"absolute", bottom:14, left:18, right:18,
          display:"flex", alignItems:"center", gap:7, pointerEvents:"none"
        }}>
          <span style={{fontSize:14,color:"#d0c8be",fontFamily:"Georgia,serif",lineHeight:1}}>×</span>
          <div style={{flex:1,borderBottom:"1.5px solid #e8e0d8"}}/>
        </div>
      </div>

      {/* Clear button — shown below when signature exists */}
      {(value || hasDrawn.current) && (
        <button
          onClick={clear}
          className="ghost"
          style={{
            marginTop:8, color:T.t3, fontSize:12,
            display:"flex", alignItems:"center", gap:5,
            fontFamily:"'Inter',sans-serif"
          }}
          onMouseEnter={e=>e.currentTarget.style.color=T.red}
          onMouseLeave={e=>e.currentTarget.style.color=T.t3}
        >
          <X size={12}/> Clear signature
        </button>
      )}
    </div>
  );
}


function IS(T) {
  return {width:"100%",background:T.in,border:`1px solid ${T.inB}`,borderRadius:6,padding:"10px 12px",fontSize:14,color:T.t1,fontFamily:"'Inter',sans-serif",WebkitAppearance:"none",appearance:"none",transition:"border-color .15s",lineHeight:1.4};
}
