(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const strip=s=>String(s).replace(/<[^>]+>/g,"");
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const sample=(a,n)=>shuffle(a).slice(0,n);
const app=$("#app");
const DNAME=Object.fromEntries(DOMAINS.map(d=>[d.id,d.name]));

/* ---------- storage (per-viewer convenience) ---------- */
const KEY="cissp-cram-v1";
let S={q:{},cards:{},exams:[],drill:{}};
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(S,JSON.parse(raw));}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};

/* ---------- themes ---------- */
const THEMES=[
 {id:"system",name:"System",desc:"Follows your device"},
 {id:"light",name:"Light",scheme:"light",t:{bg:"#ffffff",surface:"#ffffff","surface-2":"#f4f5f7",line:"#e6e8ec","line-2":"#cfd3da",ink:"#111418","ink-2":"#4b525c","ink-3":"#6f7680",accent:"#2448e0","accent-ink":"#ffffff","accent-soft":"#eef1fd",good:"#16794a","good-soft":"#ecf7f1",bad:"#c2312a","bad-soft":"#fcefee",mark:"#fff1b8"}},
 {id:"dark",name:"Dark",scheme:"dark",t:{bg:"#111315",surface:"#111315","surface-2":"#1b1e22",line:"#26292e","line-2":"#3a3f46",ink:"#eceef1","ink-2":"#a8afb9","ink-3":"#848b96",accent:"#8aa2ff","accent-ink":"#0b0f1f","accent-soft":"#1a2140",good:"#5cc98f","good-soft":"#15261d",bad:"#ff7b72","bad-soft":"#2c1715",mark:"#4d4320"}},
 {id:"paper",name:"Paper",scheme:"light",body:'"Source Serif 4",Georgia,serif',t:{bg:"#f6f1e7",surface:"#f6f1e7","surface-2":"#ece4d4",line:"#ddd2bf","line-2":"#c4b69d",ink:"#28231d","ink-2":"#544b40","ink-3":"#7a6f61",accent:"#2f6b4f","accent-ink":"#ffffff","accent-soft":"#e2ebe2",good:"#2f6b4f","good-soft":"#e2ece3",bad:"#a33a2a","bad-soft":"#f4e2dc",mark:"#f3df9a"}},
 {id:"midnight",name:"Midnight",scheme:"dark",t:{bg:"#0e1726",surface:"#0e1726","surface-2":"#172338",line:"#22314d","line-2":"#34476b",ink:"#e6ecf7","ink-2":"#a9b6cf","ink-3":"#8492ad",accent:"#6fd3c1","accent-ink":"#06201b","accent-soft":"#123a3a",good:"#6fd3a0","good-soft":"#123222",bad:"#ff8f87","bad-soft":"#3a1c22",mark:"#4a4320"}},
 {id:"console",name:"Console",scheme:"dark",body:'"JetBrains Mono",ui-monospace,Menlo,monospace',t:{bg:"#0a0e14",surface:"#0a0e14","surface-2":"#151d28",line:"#253244","line-2":"#38495e",ink:"#e9eef5","ink-2":"#a6b3c4","ink-3":"#7d8ca3",accent:"#ffb020","accent-ink":"#130d02","accent-soft":"#2a2110",good:"#4ade80","good-soft":"#10291b",bad:"#ff6b6b","bad-soft":"#33171a",mark:"#5a4410"}},
 {id:"contrast",name:"High contrast",scheme:"light",t:{bg:"#ffffff",surface:"#ffffff","surface-2":"#ededed",line:"#000000","line-2":"#000000",ink:"#000000","ink-2":"#000000","ink-3":"#2b2b2b",accent:"#0033cc","accent-ink":"#ffffff","accent-soft":"#e3e9ff",good:"#005c1f","good-soft":"#dff3e5",bad:"#a80000","bad-soft":"#ffe1e1",mark:"#ffe600"}},
];
(function injectThemes(){
  const css=THEMES.filter(x=>x.t).map(x=>`:root[data-skin="${x.id}"]{${Object.entries(x.t).map(([k,v])=>`--${k}:${v};`).join("")}color-scheme:${x.scheme};${x.body?`--body:${x.body};`:""}}`).join("\n");
  const st=document.createElement("style");st.id="skins";st.textContent=css;document.head.appendChild(st);
})();
function applySkin(id){
  const root=document.documentElement;if(!id||id==="system")delete root.dataset.skin;else root.dataset.skin=id;
}
function swatchHTML(sel){
  const L=THEMES[1].t,D=THEMES[2].t;
  return `<div class="swatches" role="radiogroup" aria-label="Theme">${THEMES.map(x=>{const t=x.t;
    const bg=t?t.bg:`linear-gradient(135deg,${L.bg} 50%,${D.bg} 50%)`;const ink=t?t.ink:"#111418";const ac=t?t.accent:L.accent;const ln=t?t.line:L.line;
    return `<button class="sw ${sel===x.id?"on":""}" role="radio" aria-checked="${sel===x.id}" data-skin="${x.id}"><span class="swprev" style="background:${bg};border-color:${ln}"><span style="color:${ink};font-family:${x.body||"var(--display)"}">Aa</span><i style="background:${ac}"></i></span><span class="swname">${esc(x.name)}</span></button>`;}).join("")}</div>`;
}
function bindSwatches(host,onPick){$$(".sw",host).forEach(b=>b.onclick=()=>{const id=b.dataset.skin;S.skin=id;save();applySkin(id);$$(".sw",host).forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-checked",x===b);});if(onPick)onPick(id);});}
applySkin(S.skin);
function openThemePicker(btn){
  const ex=$("#themepop");if(ex){ex.remove();return;}
  const pop=document.createElement("div");pop.id="themepop";pop.className="themepop";pop.innerHTML=`<div class="tphead"><b>Theme</b><button class="chip" id="tpclose">Done</button></div>${swatchHTML(S.skin||"system")}`;
  document.body.appendChild(pop);bindSwatches(pop);$("#tpclose").onclick=()=>pop.remove();
  const onDoc=e=>{if(!pop.contains(e.target)&&e.target!==btn){pop.remove();document.removeEventListener("click",onDoc,true);}};
  setTimeout(()=>document.addEventListener("click",onDoc,true),0);
  const k=e=>{if(e.key==="Escape"){pop.remove();document.removeEventListener("keydown",k);}};document.addEventListener("keydown",k);
  const f=$(".sw.on",pop);if(f)f.focus();
}

/* ---------- data prep ---------- */
const seen=new Set();
const ACR=ACRONYMS_RAW.trim().split("\n").map(l=>{const p=l.split("|");return {a:p[0].trim(),f:(p[1]||"").trim(),d:+p[2]||0,n:(p[3]||"").trim()};}).filter(x=>{if(!x.a||seen.has(x.a))return false;seen.add(x.a);return true;});

const FIX={
 "NIST CSF Functions":"Govern, Identify, Protect, Detect, Respond, Recover — CSF 2.0 (Feb 2024) added Govern; CSF 1.1 had the other five.",
 "PQC Algorithms":"FIPS 203 ML-KEM (from CRYSTALS-Kyber, key encapsulation), FIPS 204 ML-DSA (from Dilithium, signatures), FIPS 205 SLH-DSA (from SPHINCS+). Final August 2024.",
 "Power Problems":"Fault = momentary loss, Blackout = prolonged loss. Sag = momentary low, Brownout = prolonged low. Spike = momentary high, Surge = prolonged high."
};
const REV=REVIEW.map((d,i)=>{
  const id=i+1;const cseen=new Set();
  const review=d.review.filter(r=>{const k=r.t.toLowerCase();if(cseen.has(k))return false;cseen.add(k);return true;}).map(r=>({t:r.t,d:FIX[r.t]||r.d}));
  const aids=d.aids.map(a=>{
    if(/Respond, Recover/.test(a)&&!/Govern/.test(a))return a+" (CSF 2.0 adds Govern)";
    if(/OWASP 2021 top 3/.test(a))return a+" (2025 list: Broken Access Control, Security Misconfiguration, Software Supply Chain Failures)";
    return a;});
  return {id,code:d.code,review,formulas:d.formulas,aids,topics:d.topics};
});
const MODEL_ITEMS=MODELS.filter(m=>m.ord).map(m=>({id:"m:"+m.id,d:m.d,type:"order",q:`Put in order: ${m.name}`,items:m.steps.map(x=>x[0]),ex:`Mnemonic: ${m.mn}`}));
const QS=[...QUESTIONS.map((q,i)=>({id:"q"+i,d:q[0],type:"single",q:q[1],ans:q[2][0],opts:q[2],ex:q[3]})),
  ...ADVANCED.map((a,i)=>a.type==="multi"?{id:"a"+i,d:a.d,type:"multi",q:a.q,opts:[...a.correct,...a.wrong],correct:a.correct,ex:a.ex}:{id:"a"+i,d:a.d,type:a.type,q:a.q,pairs:a.pairs,ex:a.ex}),
  ...MANAGER.map((m,i)=>({id:"g"+i,d:m[0],type:"single",best:true,q:m[1],ans:m[2][0],opts:m[2],ex:`${m[3]} Why not “${m[2][1]}”? ${m[4]}`})),
  ...HOTSPOT.map((h,i)=>({id:"h"+i,d:h.d,type:"hot",dia:h.dia,q:h.q,ans:h.ans,ex:h.ex})),
  ...MODEL_ITEMS];

/* ---------- confusable pairs ---------- */
const PAIRS=[
 ["FAR vs FRR","<b>FAR</b> Type II: impostor in (worse). <b>FRR</b> Type I: good user out."],
 ["RTO vs RPO","<b>RTO</b> time to restore. <b>RPO</b> data you can lose → backup frequency."],
 ["MTD vs RTO","<b>MTD</b> business limit. <b>RTO</b> + WRT must fit inside it."],
 ["SOC 1 vs SOC 2","<b>SOC 1</b> financial reporting. <b>SOC 2</b> security Trust Services Criteria."],
 ["Type I vs Type II (SOC)","<b>Type I</b> design, point in time. <b>Type II</b> operating over a period."],
 ["SAML vs OAuth vs OIDC","<b>SAML</b> XML SSO. <b>OAuth</b> authorization. <b>OIDC</b> authentication on OAuth."],
 ["RADIUS vs TACACS+","<b>RADIUS</b> UDP, password only, combined. <b>TACACS+</b> TCP 49, full payload, separate AAA."],
 ["AH vs ESP","<b>AH</b> integrity only (51). <b>ESP</b> encryption + integrity (50)."],
 ["IDS vs IPS","<b>IDS</b> detects/alerts. <b>IPS</b> inline, blocks."],
 ["SIEM vs SOAR","<b>SIEM</b> collects/correlates. <b>SOAR</b> automates response."],
 ["CRL vs OCSP","<b>CRL</b> periodic list. <b>OCSP</b> real-time query (stapling)."],
 ["SAST vs DAST","<b>SAST</b> source, white box. <b>DAST</b> running app, black box."],
 ["DAC vs MAC","<b>DAC</b> owner decides. <b>MAC</b> labels, system decides."],
 ["CVE vs CVSS vs CWE","<b>CVE</b> ID. <b>CVSS</b> score. <b>CWE</b> weakness type."],
 ["EAR vs ITAR","<b>EAR</b> Commerce/BIS, dual-use. <b>ITAR</b> State/DDTC, military."],
 ["TPM vs HSM","<b>TPM</b> chip in the device. <b>HSM</b> dedicated key appliance."],
 ["DRM vs IRM","<b>DRM</b> consumer media. <b>IRM</b> business documents."],
 ["EOL vs EOS","<b>EOL</b> no longer sold. <b>EOS</b> no more patches."],
 ["SPF / DKIM / DMARC","<b>SPF</b> who may send. <b>DKIM</b> signature. <b>DMARC</b> policy + reports."],
 ["DNSSEC vs DoH","<b>DNSSEC</b> integrity. <b>DoH/DoT</b> confidentiality."],
 ["Clear / Purge / Destroy","<b>Clear</b> overwrite. <b>Purge</b> degauss/crypto-erase. <b>Destroy</b> physical."],
 ["Incremental vs Differential","<b>Incr</b> since last any (restore all). <b>Diff</b> since last full (restore last one)."],
 ["Due care vs Due diligence","<b>Care</b> doing it. <b>Diligence</b> checking/knowing continuously."],
 ["Controller vs Processor","<b>Controller</b> decides why/how. <b>Processor</b> acts on instructions."],
 ["BLP vs Biba","<b>BLP</b> confidentiality: no read up/write down. <b>Biba</b> integrity: no read down/write up."],
 ["KPI vs KRI","<b>KPI</b> performance (past). <b>KRI</b> risk early warning (future)."],
 ["Enticement vs Entrapment","<b>Enticement</b> legal lure. <b>Entrapment</b> inducing a crime — illegal."],
 ["Certification vs Accreditation","<b>Certification</b> technical evaluation. <b>Accreditation</b> management approval (ATO)."],
];

/* ---------- breach / notification clocks ---------- */
const CLOCKS=[
 ["GDPR","Supervisory authority within 72 hours of awareness; data subjects without undue delay if high risk"],
 ["HIPAA / HITECH","Individuals within 60 days of discovery; 500+ in a state also media + HHS within 60 days; under 500 logged to HHS annually"],
 ["NIS2 (EU)","Early warning 24 h → incident notification 72 h → final report within 1 month"],
 ["DORA (EU finance)","Initial report within 4 h of classifying as major (max 24 h from awareness); intermediate and final reports follow"],
 ["CIRCIA (US critical infrastructure)","72 h for covered incidents, 24 h for ransom payments, to CISA (once final rule applies)"],
 ["SEC (US public companies)","Form 8-K within 4 business days after determining the incident is material"],
 ["US bank regulators","Banks notify their primary regulator within 36 hours of a notification incident"],
 ["PIPEDA (Canada)","OPC and affected individuals as soon as feasible when there is a real risk of significant harm; keep records of all breaches 24 months"],
 ["US states","All 50 states; timelines vary (often 30–60 days); encrypted data usually exempt"],
];
const ENFORCE=[
 ["HIPAA","HHS Office for Civil Rights"],["GLBA","FTC (non-banks) + federal bank regulators"],["SOX","SEC (with PCAOB over auditors)"],
 ["COPPA","FTC"],["FERPA","Dept. of Education"],["PCI DSS","Card brands via acquiring banks — contract, not law"],
 ["FISMA","OMB oversight; CISA operational directives; NIST writes the standards"],["GDPR","National DPAs/SAs, coordinated by the EDPB"],
 ["PIPEDA","Office of the Privacy Commissioner of Canada"],["CCPA/CPRA","California Privacy Protection Agency + CA Attorney General"],
 ["EAR","Commerce — Bureau of Industry and Security"],["ITAR","State — Directorate of Defense Trade Controls"],
 ["CFAA","DOJ / FBI (and US Secret Service)"],["FedRAMP","GSA FedRAMP PMO"],["CMMC","Department of Defense"],["ISC2 Code of Ethics","ISC2 Ethics Committee"],
];

/* ---------- helpers ---------- */
function stat(id){return S.q[id]||[0,0];}
function domainMastery(d){
  const qs=QS.filter(q=>q.d===d);let r=0,w=0,seenN=0;
  qs.forEach(q=>{const s=stat(q.id);r+=s[0];w+=s[1];if(s[0]+s[1])seenN++;});
  return {pct:(r+w)?Math.round(100*r/(r+w)):null,seen:seenN,total:qs.length};
}
function barClass(p){return p==null?"":p<60?"low":p<75?"mid":"hi";}
function hl(text,q){if(!q)return esc(text);const t=esc(text);try{return t.replace(new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>");}catch(e){return t;}}
function hlHTML(html,q){ // highlight inside text nodes only
  if(!q)return html;return html.split(/(<[^>]+>)/).map(p=>p.startsWith("<")?p:p.replace(new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>")).join("");
}
function domChips(sel,opts={}){
  let h=opts.all!==false?`<button class="chip ${sel===0?"on":""}" data-dom="0">All</button>`:"";
  DOMAINS.forEach(d=>{h+=`<button class="chip ${sel===d.id?"on":""}" data-dom="${d.id}">D${d.id} ${d.code}<span class="w">${d.w}%</span></button>`;});
  if(opts.extra)h+=opts.extra;
  return `<div class="chips">${h}</div>`;
}

/* ---------- quiz engine ---------- */
// item types: single {opts,ans} · multi {opts,correct:[...]} · order {items} · match {pairs}
function ansText(it){
  if(it.type==="multi")return it.correct.join(" · ");
  if(it.type==="order")return it.items.map((x,i)=>`${i+1}. ${x}`).join("  ");
  if(it.type==="match")return it.pairs.map(p=>`${p[0]} → ${p[1]}`).join(" · ");
  if(it.type==="hot")return zoneLabel(it,it.ans);
  return it.ans;
}
const zoneLabel=(it,z)=>{const zz=DIAGRAMS[it.dia].zones.find(x=>x.id===z);return zz?zz.label:"(none)";};
function diagramSVG(it){
  const D=DIAGRAMS[it.dia];
  return `<div class="hotwrap"><svg class="hot hot-${it.dia}" viewBox="${D.view}" role="group" aria-label="Diagram: click a zone">
    ${D.links.map(l=>`<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}" class="hlink"/>`).join("")}
    ${D.zones.map(z=>`<g class="hz" data-z="${z.id}" tabindex="0" role="button" aria-label="${esc(z.label)}"><rect x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="8"/><foreignObject x="${z.x+4}" y="${z.y+4}" width="${z.w-8}" height="${z.h-8}"><div xmlns="http://www.w3.org/1999/xhtml" class="hzl">${esc(z.label)}</div></foreignObject></g>`).join("")}
  </svg></div>`;
}
function typeLabel(it){return it.type==="multi"?"Multi-select":it.type==="order"?"Put in order":it.type==="match"?"Matching":it.type==="hot"?"Hotspot":"";}
function runQuiz(host,items,cfg){
  let i=0,right=0;const log=[];let timerId=null;const exam=cfg.exam;const timed=cfg.minutes>0;
  const end=timed?Date.now()+cfg.minutes*60000:0;
  const order=items.map(it=>{const t=it.type||"single";const o={...it,type:t};
    if(t==="single"||t==="multi")o.shuffled=shuffle(it.opts);
    if(t==="order"){let s=shuffle(it.items);let g=0;while(s.join("|")===it.items.join("|")&&g++<10)s=shuffle(it.items);o.cur=s;}
    if(t==="match")o.rights=shuffle(it.pairs.map(p=>p[1]));
    return o;});
  function tick(){const el=$("#timer",host);if(!el)return;const left=Math.max(0,end-Date.now());const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=`${m}:${String(s).padStart(2,"0")}`;el.classList.toggle("warn",left<5*60000);if(left<=0){clearInterval(timerId);finish(true);}}
  function body(it){
    if(it.type==="single"||it.type==="multi")return `<div class="opts" role="${it.type==="multi"?"group":"radiogroup"}">${it.shuffled.map((o,k)=>`<button class="opt ${it.type==="multi"?"multi":""}" data-k="${k}" aria-pressed="false"><span class="k">${it.type==="multi"?'<span class="box"></span>':"ABCDEF"[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
    if(it.type==="order")return `<ol class="ordlist" id="ordlist">${it.cur.map((x,k)=>`<li data-k="${k}"><span class="ordtxt">${esc(x)}</span><span class="ordbtns"><button class="mv" data-dir="-1" data-k="${k}" aria-label="Move up" ${k===0?"disabled":""}>↑</button><button class="mv" data-dir="1" data-k="${k}" aria-label="Move down" ${k===it.cur.length-1?"disabled":""}>↓</button></span></li>`).join("")}</ol>`;
    if(it.type==="hot")return diagramSVG(it);
    if(it.type==="match")return `<div class="matchgrid">${it.pairs.map((p,k)=>`<label class="mrow" for="m${k}"><span class="ml">${esc(p[0])}</span><select id="m${k}" data-k="${k}"><option value="">Choose…</option>${it.rights.map(r=>`<option>${esc(r)}</option>`).join("")}</select></label>`).join("")}</div>`;
  }
  function draw(){
    const it=order[i];
    const needSubmit=exam||it.type!=="single";
    host.innerHTML=`<div class="qcard">
      <div class="progress"><i style="width:${100*i/order.length}%"></i></div>
      <div class="qmeta"><span>Question ${i+1} of ${order.length}${it.d?` · Domain ${it.d}: ${esc(DNAME[it.d])}`:""}${it.tag?` · ${esc(it.tag)}`:""}${typeLabel(it)?` · <b class="qtype">${typeLabel(it)}</b>`:""}</span>${timed?`<span class="timer" id="timer"></span>`:""}${!exam?`<span class="tnum">${right} correct</span>`:""}</div>
      <p class="qtext">${esc(it.q)}</p>
      ${body(it)}
      <div id="fb"></div>
      <div class="row" id="ctl" style="margin-top:14px">${needSubmit?`<button class="btn" id="submit" ${it.type==="order"?"":"disabled"}>Submit answer</button>`:""}${exam?`<span class="muted" style="font-size:13px">Forward-only, like the real CAT.</span>`:""}<span style="flex:1"></span><button class="btn ghost" id="quit">End ${exam?"test":"quiz"}</button></div>
    </div>`;
    if(timed)tick();
    const sub=$("#submit",host);
    if(it.type==="single"){
      $$(".opt",host).forEach(b=>b.onclick=()=>{const k=+b.dataset.k;
        if(!exam){answer(it.shuffled[k]);return;}
        it.pick=k;$$(".opt",host).forEach(x=>{x.classList.toggle("picked",+x.dataset.k===k);x.setAttribute("aria-pressed",+x.dataset.k===k);});sub.disabled=false;});
      if(sub)sub.onclick=()=>{if(it.pick!=null)answer(it.shuffled[it.pick]);};
    }
    if(it.type==="multi"){
      it.sel=new Set();
      $$(".opt",host).forEach(b=>b.onclick=()=>{const k=+b.dataset.k;it.sel.has(k)?it.sel.delete(k):it.sel.add(k);b.classList.toggle("picked",it.sel.has(k));b.setAttribute("aria-pressed",it.sel.has(k));sub.disabled=!it.sel.size;});
      sub.onclick=()=>answer([...it.sel].map(k=>it.shuffled[k]));
    }
    if(it.type==="order"){
      draw2bind(it);
      sub.onclick=()=>answer(it.cur.slice());
    }
    if(it.type==="hot"){
      const choose=g=>{it.pick=g.dataset.z;$$(".hz",host).forEach(x=>x.classList.toggle("picked",x===g));sub.disabled=false;};
      $$(".hz",host).forEach(g=>{g.onclick=()=>choose(g);g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose(g);}};});
      sub.onclick=()=>{if(it.pick)answer(it.pick);};
    }
    if(it.type==="match"){
      const upd=()=>{sub.disabled=$$("select",host).some(s=>!s.value);};
      $$("select",host).forEach(s=>s.onchange=upd);
      sub.onclick=()=>answer($$("select",host).map(s=>s.value));
    }
    $("#quit",host).onclick=()=>finish(false);
  }
  function draw2bind(it){ // rebind order buttons after reorder
    $$(".mv",host).forEach(b=>b.onclick=()=>{const k=+b.dataset.k,j=k+ +b.dataset.dir;[it.cur[k],it.cur[j]]=[it.cur[j],it.cur[k]];const y=window.scrollY;$("#ordlist",host).outerHTML=body(it);draw2bind(it);window.scrollTo({top:y});const nb=$(`.mv[data-k="${j}"][data-dir="${b.dataset.dir}"]`,host)||$(`.mv[data-k="${j}"]`,host);if(nb)nb.focus();});
  }
  function grade(it,given){
    if(it.type==="single")return given===it.ans;
    if(it.type==="multi")return given.length===it.correct.length&&given.every(g=>it.correct.includes(g));
    if(it.type==="order")return given.join("|")===it.items.join("|");
    if(it.type==="match")return given.every((g,k)=>g===it.pairs[k][1]);
    if(it.type==="hot")return given===it.ans;
  }
  function givenText(it,given){
    if(it.type==="single")return given;
    if(it.type==="multi")return given.join(" · ")||"(none)";
    if(it.type==="order")return given.map((x,k)=>`${k+1}. ${x}`).join("  ");
    if(it.type==="match")return it.pairs.map((p,k)=>`${p[0]} → ${given[k]||"?"}`).join(" · ");
    if(it.type==="hot")return zoneLabel(it,given);
  }
  function answer(given){
    const it=order[i];const ok=grade(it,given);if(ok)right++;
    log.push({it,ok,given:givenText(it,given)});
    if(it.id){const s=stat(it.id);s[ok?0:1]++;S.q[it.id]=s;save();}
    if(exam){i++;i<order.length?draw():finish(false);return;}
    // feedback
    if(it.type==="single"||it.type==="multi"){
      const good=it.type==="single"?[it.ans]:it.correct;const chosen=it.type==="single"?[given]:given;
      $$(".opt",host).forEach(b=>{b.disabled=true;const t=it.shuffled[+b.dataset.k];if(good.includes(t))b.classList.add("right");else if(chosen.includes(t))b.classList.add("wrong");});
    }
    if(it.type==="order"){$$(".mv",host).forEach(b=>b.disabled=true);$$("#ordlist li",host).forEach((li,k)=>li.classList.add(it.cur[k]===it.items[k]?"right":"wrong"));}
    if(it.type==="hot"){$$(".hz",host).forEach(g=>{g.onclick=null;g.onkeydown=null;g.classList.add("done");if(g.dataset.z===it.ans)g.classList.add("right");else if(g.dataset.z===given)g.classList.add("wrong");});}
    if(it.type==="match"){$$("select",host).forEach((s,k)=>{s.disabled=true;s.closest(".mrow").classList.add(s.value===it.pairs[k][1]?"right":"wrong");});}
    const sub=$("#submit",host);if(sub)sub.remove();
    const showKey=it.type==="order"||it.type==="match"||it.type==="hot"||(it.type==="multi"&&!ok);
    $("#fb",host).innerHTML=`<div class="explain"><b class="${ok?"ok":"no"}">${ok?"Correct.":"Not quite."}</b> ${showKey&&!ok?`<div style="margin:6px 0"><b>Answer:</b> ${esc(ansText(it))}</div>`:""}${esc(it.ex||"")}</div>
      <div class="row" style="margin-top:12px"><button class="btn" id="next">${i+1<order.length?"Next question →":"See results"}</button></div>`;
    const nb=$("#next",host);nb.focus();nb.onclick=()=>{i++;i<order.length?draw():finish(false);};
  }
  function finish(timeout){
    clearInterval(timerId);
    const n=log.length;const pct=n?Math.round(100*right/n):0;
    const byDom={};log.forEach(l=>{const d=l.it.d||0;byDom[d]=byDom[d]||[0,0];byDom[d][l.ok?0:1]++;});
    if((exam||cfg.record)&&n){S.exams.unshift({t:Date.now(),n,right,pct,total:order.length});S.exams=S.exams.slice(0,12);save();}
    const misses=log.filter(l=>!l.ok);
    host.innerHTML=`<div class="stack">
      <div class="card"><div class="row" style="align-items:flex-end;gap:18px">
        <div><h4>${timeout?"Time's up":"Result"}</h4><div class="score">${pct}%</div></div>
        <div><div class="tnum">${right} of ${n} correct${n<order.length?` · ${order.length-n} unanswered`:""}</div>
        ${(exam||cfg.record)?`<span class="verdict ${pct>=75?"pass":"fail"}">${pct>=75?"Exam-ready range":"Keep drilling"}</span>`:""}</div>
      </div>
      ${Object.keys(byDom).some(k=>+k)?`<div class="mast" style="margin-top:16px">${Object.keys(byDom).filter(k=>+k).sort().map(d=>{const[r,w]=byDom[d];const p=Math.round(100*r/(r+w));return `<span class="dnum">${d}</span><div class="bar ${barClass(p)}"><i style="width:${p}%"></i></div><span class="tnum">${r}/${r+w}</span>`;}).join("")}</div>`:""}
      ${(exam||cfg.record)?`<p class="muted" style="font-size:13px;margin:12px 0 0">Practice benchmark: aim for 75%+ on these to feel safe. The real exam is scaled (700/1000) and adaptive, so this isn't a direct conversion.</p>`:""}
      <div class="row" style="margin-top:16px"><button class="btn" id="again">Go again</button>${misses.length?`<button class="btn ghost" id="redo">Retry the ${misses.length} I missed</button>`:""}${cfg.back?`<button class="btn ghost" id="toSetup">${esc(cfg.backLabel||"Back to setup")}</button>`:""}</div></div>
      ${misses.length?`<div class="card"><h3>Review what you missed</h3><ol class="review">${misses.map(l=>`<li><b>${esc(l.it.q)}</b><br><span style="color:var(--bad)">Your answer: ${esc(l.given)}</span><br><span style="color:var(--good)">Correct: ${esc(ansText(l.it))}</span><br><span class="muted">${esc(l.it.ex||"")}</span></li>`).join("")}</ol></div>`:""}
    </div>`;
    $("#again",host).onclick=()=>cfg.again();
    const ts=$("#toSetup",host);if(ts)ts.onclick=()=>{cfg.back();window.scrollTo({top:0});};
    const rd=$("#redo",host);if(rd)rd.onclick=()=>{stopActive=runQuiz(host,misses.map(l=>l.it),{...cfg,exam:false,minutes:0,record:false});};
    if(cfg.scrollTop!==false)window.scrollTo({top:0});
  }
  draw();
  if(timed)timerId=setInterval(tick,1000);
  return ()=>clearInterval(timerId);
}
let stopActive=null;

/* ---------- views ---------- */
const V={};
/* ---------- profile, plan generator, setup ---------- */
const TOPICS=[["acr","Acronyms","#acronyms"],["regs","Laws, regulations & bodies","#regs"],["models","Models & sequences (OSI, RMF, IR…)","#models"],["tests","Timed practice tests","#exam"]];
const prof=()=>S.profile||{};
function examDate(){const p=prof();if(!p.date)return null;const [y,m,d]=p.date.split("-").map(Number);return new Date(y,m-1,d);}
function today0(){const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate());}
function daysLeft(){const e=examDate();return e?Math.round((e-today0())/864e5):null;}
const fmt=(d,o)=>d.toLocaleDateString(undefined,o||{weekday:"short",month:"short",day:"numeric"});
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const L=(t,h)=>({t,h});
function buildPlan(){
  const n=daysLeft();if(n==null)return null;
  const p=prof();const focus=(p.focus||[]).slice().sort((a,b)=>a-b);const topics=new Set(p.topics||[]);
  const t0=today0();const examItems=[L("Read the “Think like a manager” rules once at breakfast","#plan"),L("Bring government ID and arrive 30 minutes early",""),L("About 1 minute per question. It's forward-only, so commit and move on","")];
  if(n<0)return {past:true};
  if(n===0)return {mode:"day",rows:[{label:fmt(t0),date:t0,items:examItems,exam:true,today:true}]};
  const order=[...focus,...DOMAINS.map(d=>d.id).filter(id=>!focus.includes(id)).sort((a,b)=>DOMAINS[b-1].w-DOMAINS[a-1].w)];
  const domTask=id=>L(`D${id} ${DNAME[id]}: cheat sheet, then a 10-question quiz${focus.includes(id)?" (focus)":""}`,"#cheat");
  const deepTask=id=>L(`Deep dive D${id}: BEST/FIRST questions, smart review, flashcards`,"#smart");
  const drillFor=k=>({acr:L("Acronym drill: 15 questions, both directions","#drill-acr"),regs:L("Laws & bodies drill: 15 questions","#drill-body"),models:L("Models: “Test me” on 3 sequences","#models"),calc:L("Calculation drill: 10 problems (ALE, RTO, keys, backups)","#drill-calc"),keys:L("“Which key?” crypto drill: 10 questions","#drill-keys")}[k]);
  const drills=[...["acr","regs","models"].filter(k=>topics.has(k)),"calc","keys"];
  const review=[L("Brain dump: write formulas, ports and models from memory","#dump"),L("Read the Exam Day checklist","#examday"),L("Light review: mindset rules and commonly confused pairs","#acronyms"),L("Smart review: 2 rounds","#smart"),L("Flashcards marked “Again”, then stop early and sleep","#cards")];
  const fullTest=L(`Practice Test: ${topics.has("tests")?150:100} questions, timed, one sitting`,"#exam");
  const halfTest=L("Practice Test: 50 questions, timed","#exam");
  const tasks=[...order.map(domTask),...focus.map(deepTask)];
  if(n<=21){
    const rows=Array.from({length:n},(_,i)=>({date:addDays(t0,i),items:[]}));
    rows[n-1].items.push(...review);
    if(n===1){rows[0].items.unshift(L(`Skim the cheat sheet${focus.length?` for D${focus.join(", D")}`:""}`,"#cheat"));}
    else{
      if(n>=3)rows[n-2].items.push(fullTest);
      const avail=[...Array(n>=3?n-2:n-1).keys()];
      if(n===2){rows[0].items.push(L("Skim every domain's cheat sheet, focus domains first","#cheat"),halfTest);}
      else{
        tasks.forEach((t,i)=>rows[avail[Math.floor(i*avail.length/tasks.length)]].items.push(t));
        if(n>=7)rows[Math.floor((n-2)/2)].items.push(halfTest);
        if(topics.has("tests")&&n>=10)for(let i=3;i<n-3;i+=4)if(!rows[i].items.includes(halfTest))rows[i].items.push(L("Practice Test: 25-question sprint","#exam"));
        avail.forEach((i,k)=>{if(drills.length)rows[i].items.push(drillFor(drills[k%drills.length]));});
      }
    }
    rows.forEach((r,i)=>{r.label=fmt(r.date);r.today=i===0;});
    rows.push({date:examDate(),label:fmt(examDate()),items:examItems,exam:true});
    return {mode:"day",rows};
  }
  // week mode
  const W=Math.ceil(n/7);const rows=Array.from({length:W},(_,w)=>({date:addDays(t0,w*7),items:[]}));
  const studyW=Math.max(1,W-1);
  tasks.forEach((t,i)=>rows[Math.floor(i*studyW/tasks.length)].items.push(t));
  rows.slice(0,studyW).forEach((r,k)=>{if(drills.length)r.items.push({...drillFor(drills[k%drills.length]),t:drillFor(drills[k%drills.length]).t.replace(/^/,"Every other day: ")});});
  if(W>=3)rows[Math.floor(studyW/2)].items.push(halfTest);
  rows[W-1].items.push(fullTest,L("Retry misses from the practice test, by domain","#quiz"),...review);
  rows.forEach((r,w)=>{r.label=`Week ${w+1}`;r.sub=`from ${fmt(r.date,{month:"short",day:"numeric"})}`;r.today=w===0;});
  rows.push({date:examDate(),label:fmt(examDate()),items:examItems,exam:true});
  return {mode:"week",rows};
}
function countdown(){
  const n=daysLeft();const p=prof();
  $("#countdown").textContent=n==null?"No exam date set":n>1?`${n} days to exam · ${fmt(examDate())}`:n===1?"Exam tomorrow":n===0?"Exam day":"Exam date has passed";
  $("#setupBtn").textContent=p.name?`${p.name} · Edit setup`:"Edit setup";
}

/* setup dialog */
function openSetup(first){
  const p=prof();let step=0;
  const draft={name:p.name||"",date:p.date||"",focus:new Set(p.focus||[]),topics:new Set(p.topics||(first?["acr","regs","models","tests"]:[]))};
  const ov=document.createElement("div");ov.className="ob";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-labelledby","obTitle");
  document.body.appendChild(ov);const prevFocus=document.activeElement;
  const minDate=(()=>{const t=today0();return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;})();
  function draw(){
    const steps=[
     ()=>`<p class="obstep">Step 1 of 3</p><h2 id="obTitle">${first?"Welcome to CISSPrep":"Your setup"}</h2>
       <p class="lede" style="margin-bottom:18px">Your CISSP study guide: cheat sheets, acronym and regulator drills, quizzes and timed practice tests. Three quick questions and it builds a study plan around your exam date.</p>
       <label class="field" for="obName"><span>What should we call you?</span><input id="obName" type="text" autocomplete="given-name" maxlength="40" placeholder="First name (optional)" value="${esc(draft.name)}"></label>
       <div class="field" style="margin-top:18px"><span>Pick a look</span>${swatchHTML(S.skin||"system")}</div>`,
     ()=>`<p class="obstep">Step 2 of 3</p><h2 id="obTitle">When is your exam?</h2>
       <p class="lede" style="margin-bottom:18px">The plan spreads all 8 domains across the days you have left, with a full practice test near the end and a light day before.</p>
       <label class="field" for="obDate"><span>Exam date</span><input id="obDate" type="date" min="${minDate}" value="${esc(draft.date)}"></label>
       <p class="muted" style="font-size:13px;margin-top:10px">Not booked yet? Leave it blank. You can add it later from “Edit setup”.</p>`,
     ()=>`<p class="obstep">Step 3 of 3</p><h2 id="obTitle">What do you want to focus on?</h2>
       <p class="lede" style="margin-bottom:14px">Pick the domains you feel weakest in. They come first in your plan and get a second pass.</p>
       <div class="checks">${DOMAINS.map(d=>`<label class="check"><input type="checkbox" data-f="${d.id}" ${draft.focus.has(d.id)?"checked":""}><span><b>D${d.id}</b> ${esc(d.name)} <span class="muted">${d.w}%</span></span></label>`).join("")}</div>
       <h4 style="margin-top:18px">Also build in</h4>
       <div class="checks">${TOPICS.map(t=>`<label class="check"><input type="checkbox" data-t="${t[0]}" ${draft.topics.has(t[0])?"checked":""}><span>${esc(t[1])}</span></label>`).join("")}</div>`
    ];
    ov.innerHTML=`<div class="obbox"><div class="obbody">${steps[step]()}</div>
      <div class="row obnav">${step>0?`<button class="btn ghost" id="obBack">Back</button>`:first?`<button class="btn ghost" id="obSkip">Skip for now</button>`:`<button class="btn ghost" id="obCancel">Cancel</button>`}<span style="flex:1"></span><span class="obdots">${[0,1,2].map(i=>`<i class="${i===step?"on":""}"></i>`).join("")}</span><button class="btn" id="obNext">${step<2?"Next":"Build my plan"}</button></div></div>`;
    bindSwatches(ov);
    const nm=$("#obName",ov);if(nm){nm.oninput=e=>draft.name=e.target.value.trim();nm.focus();nm.onkeydown=e=>{if(e.key==="Enter")$("#obNext",ov).click();};}
    const dt=$("#obDate",ov);if(dt){dt.onchange=dt.oninput=e=>draft.date=e.target.value;dt.focus();}
    $$("[data-f]",ov).forEach(c=>c.onchange=()=>{const id=+c.dataset.f;c.checked?draft.focus.add(id):draft.focus.delete(id);});
    $$("[data-t]",ov).forEach(c=>c.onchange=()=>{c.checked?draft.topics.add(c.dataset.t):draft.topics.delete(c.dataset.t);});
    if(step===2){const f=$("[data-f]",ov);if(f)f.focus();}
    const b=$("#obBack",ov);if(b)b.onclick=()=>{step--;draw();};
    const sk=$("#obSkip",ov);if(sk)sk.onclick=()=>finish(true);
    const c=$("#obCancel",ov);if(c)c.onclick=close;
    $("#obNext",ov).onclick=()=>{if(step<2){step++;draw();}else finish(false);};
  }
  function finish(skipped){
    S.profile={name:draft.name,date:draft.date,focus:[...draft.focus].sort((a,b)=>a-b),topics:[...draft.topics],done:true};
    if(S.profile.focus.length){S.prefs.quiz=Object.assign(S.prefs.quiz||{},{doms:S.profile.focus.slice(0,1)});}
    save();close();countdown();if(currentView==="plan")V.plan();else location.hash="#plan";
  }
  function close(){ov.remove();document.removeEventListener("keydown",esc_);if(prevFocus&&prevFocus.focus)prevFocus.focus();}
  function esc_(e){if(e.key==="Escape"&&!first)close();}
  document.addEventListener("keydown",esc_);
  draw();
}

V.plan=()=>{
  const p=prof();const n=daysLeft();const plan=buildPlan();const ex=S.exams.slice(0,5);
  const focus=new Set(p.focus||[]);
  const head=n==null?`${p.name?esc(p.name)+", let's":"Let's"} get you ready`:n<0?`${p.name?esc(p.name)+", your":"Your"} exam date has passed`:n===0?`${p.name?esc(p.name)+", it's":"It's"} exam day`:`${p.name?esc(p.name)+", ":""}${n} day${n===1?"":"s"} to go`;
  const onPages=/github\.io$/.test(location.hostname);const shareUrl=location.origin+location.pathname;
  const planHTML=!plan?`<div class="empty" style="text-align:left">Add your exam date to get a day-by-day plan. <button class="btn ghost" id="addDate" style="margin-left:8px">Add exam date</button></div>`
    :plan.past?`<div class="empty" style="text-align:left">Hope it went well! Set a new date if you're retaking it. <button class="btn ghost" id="addDate" style="margin-left:8px">Edit setup</button></div>`
    :`<div class="plan">${plan.rows.map(r=>`<div class="day ${r.today?"today":""} ${r.exam?"exam":""}"><div class="when"><b>${r.exam?"Exam":esc(r.label.split(",")[0])}</b>${r.exam?esc(r.label):r.sub?esc(r.sub):esc(r.label.split(",").slice(1).join(",")||"")}</div><ul>${r.items.map(x=>`<li>${x.h?`<a class="plink" href="${x.h}">${esc(x.t)}</a>`:esc(x.t)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  app.innerHTML=`<div class="stack">
   <div><h2>${head}</h2><p class="lede">Built from a comprehensive CISSP study guide and its quick-review set, checked against the current ISC2 outline. Your setup and progress stay in this browser only.</p></div>
   <dl class="facts">${EXAMFACTS.map(f=>`<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join("")}</dl>
   <div class="grid2">
    <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><h3 style="margin:0">${plan&&plan.mode==="week"?"Weekly plan":"Study plan"}</h3><button class="chip" id="editPlan">Edit setup</button></div>
     ${focus.size?`<p class="muted" style="font-size:13px;margin:0 0 12px">Focus: ${[...focus].map(id=>"D"+id+" "+DOMAINS[id-1].code).join(" · ")}</p>`:""}
     ${planHTML}</div>
    <div class="stack">
     <div class="card"><h3>Domain mastery</h3><p class="muted" style="font-size:13px;margin:0 0 12px">From your quiz and practice-test answers.</p>
      <div class="mast">${DOMAINS.map(d=>{const m=domainMastery(d.id);return `<span class="dnum">${d.id}</span><div><div style="font-size:13px;margin-bottom:3px">${esc(d.name)} <span class="muted">${d.w}%</span>${focus.has(d.id)?` <span class="focuspill">focus</span>`:""}</div><div class="bar ${barClass(m.pct)}"><i style="width:${m.pct||0}%"></i></div></div><span class="tnum">${m.pct==null?"—":m.pct+"%"}<br>${m.seen}/${m.total} seen</span>`;}).join("")}</div>
      ${ex.length?`<h4 style="margin-top:16px">Recent practice tests</h4>${ex.map(e=>`<div class="tnum">${new Date(e.t).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})} · ${e.right}/${e.n} · ${e.pct}%</div>`).join("")}`:""}
     </div>
     <div class="mind"><h3>Think like a manager</h3><ol class="rules">${MINDSET.map(m=>`<li>${m}</li>`).join("")}</ol></div>
     ${onPages?`<div class="card"><h3>Share with a coworker</h3><p class="muted" style="font-size:14px;margin:0 0 10px">Everyone who opens the link gets their own setup and progress.</p><div class="row"><input class="sharebox" id="shareUrl" readonly value="${esc(shareUrl)}" aria-label="Link to share"><button class="btn ghost" id="copyLink">Copy link</button></div></div>`:""}
     <div class="card"><h3>Move to another device</h3><p class="muted" style="font-size:14px;margin:0 0 10px">Your progress lives in this browser. Copy your progress code, then paste it into the site on your other device.</p>
      <div class="row"><button class="btn ghost" id="pcCopy">Copy my progress code</button></div>
      <div class="row" style="margin-top:10px"><input class="sharebox" id="pcIn" placeholder="Paste a progress code (starts with CCK1.)" aria-label="Paste a progress code"><button class="btn ghost" id="pcLoad">Load</button></div>
      <p class="muted" id="pcMsg" style="font-size:13px;margin:8px 0 0" role="status"></p></div>
     <div class="card"><h3>Reset</h3><p class="muted" style="font-size:14px;margin:0 0 10px">Clears your quiz history, practice tests and retired flashcards. Your setup stays.</p><div class="row" id="resetRow"><button class="btn ghost" id="resetBtn">Reset my progress</button></div></div>
    </div>
   </div>
  </div>`;
  $("#pcCopy").onclick=()=>{const code=progressCode();const msg=$("#pcMsg");
    const fallback=()=>{$("#pcIn").value=code;$("#pcIn").select();msg.textContent="Couldn't copy automatically. The code is selected in the box; copy it from there.";};
    try{navigator.clipboard.writeText(code).then(()=>msg.textContent="Copied. Paste it into this site on your other device.",fallback);}catch(e){fallback();}};
  $("#pcLoad").onclick=()=>{const msg=$("#pcMsg");try{loadProgressCode($("#pcIn").value);countdown();V.plan();$("#pcMsg").textContent="Progress loaded.";}catch(e){msg.textContent=e.message.startsWith("That")||e.message.startsWith("The code")?e.message:"That code couldn't be read. Copy the whole code and try again.";}};
  const ed=()=>openSetup(false);$("#editPlan").onclick=ed;const ad=$("#addDate");if(ad)ad.onclick=ed;
  const cp=$("#copyLink");if(cp)cp.onclick=()=>{const done=()=>{cp.textContent="Copied";setTimeout(()=>cp.textContent="Copy link",1600);};
    try{navigator.clipboard.writeText(shareUrl).then(done,()=>{$("#shareUrl").select();});}catch(e){$("#shareUrl").select();}};
  $("#resetBtn").onclick=()=>{$("#resetRow").innerHTML=`<span style="font-size:14px">Clear all progress?</span><button class="btn" id="resetYes">Yes, reset</button><button class="btn ghost" id="resetNo">Keep it</button>`;
    $("#resetYes").onclick=()=>{S.q={};S.cards={};S.exams=[];save();V.plan();};$("#resetNo").onclick=()=>V.plan();};
};


V.cheat=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Cheat Sheet</h2><p class="lede">The highest-yield facts per domain. Each domain also has the study set's formulas and memory aids, collapsed.</p>${domChips(0)}</div>
   ${DOMAINS.map(d=>{const r=REV[d.id-1];return `<section class="dsec card" id="d${d.id}">
     <div class="dhead"><span class="dnum">${d.id}</span><h3 style="margin:0">${esc(d.name)}</h3><span class="wt">${d.w}% of exam</span></div>
     <div class="grid2">${CHEAT[d.id].map(b=>`<div class="blk"><h3>${esc(b[0])}</h3><ul>${b[1].map(x=>`<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
     ${r&&r.formulas.length?`<details class="more"><summary>Formulas from the study set (${r.formulas.length})</summary><ul>${r.formulas.map(f=>`<li class="mono" style="font-size:13px">${esc(f)}</li>`).join("")}</ul></details>`:""}
     ${r&&r.aids.length?`<details class="more"><summary>Memory aids from the study set (${r.aids.length})</summary><ul>${r.aids.map(f=>`<li>${esc(f)}</li>`).join("")}</ul></details>`:""}
   </section>`;}).join("")}
  </div>`;
  $$(".chip[data-dom]",app).forEach(c=>c.onclick=()=>{const d=+c.dataset.dom;if(!d){window.scrollTo({top:0,behavior:"smooth"});return;}const el=$("#d"+d);if(el)el.scrollIntoView({behavior:"smooth"});});
};

let acrState={q:"",d:0};
V.acronyms=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Acronyms</h2><p class="lede">${ACR.length} acronyms tagged by domain. Filter, then drill the same set. Watch for the ones that mean two things (MAC, SOC, CSP, DPA, RFC) — the question's context decides.</p></div>
   <div class="card"><h3>Commonly confused</h3><div class="pairs">${PAIRS.map(p=>`<div class="pair"><div style="font-weight:600;margin-bottom:2px">${esc(p[0])}</div>${p[1]}</div>`).join("")}</div></div>
   <div>
    <div class="toolbar"><input type="search" id="acrq" placeholder="Filter acronyms…" value="${esc(acrState.q)}" aria-label="Filter acronyms"><button class="btn" id="acrdrill">Drill this set</button></div>
    ${domChips(acrState.d,{extra:`<button class="chip ${acrState.d===-1?"on":""}" data-dom="-1">AI &amp; cross-domain</button>`})}
    <div class="tnum" id="acrcount" style="margin:10px 0 6px"></div>
    <div class="tblwrap"><table><thead><tr><th>Acronym</th><th>Stands for</th><th>Dom.</th></tr></thead><tbody id="acrbody"></tbody></table></div>
   </div></div>`;
  const draw=()=>{
    const q=acrState.q.toLowerCase();
    const rows=filteredAcr().filter(x=>!q||(x.a+" "+x.f+" "+x.n).toLowerCase().includes(q));
    $("#acrcount").textContent=`${rows.length} shown`;
    $("#acrbody").innerHTML=rows.map(x=>`<tr><td class="acr">${hl(x.a,acrState.q)}</td><td>${hl(x.f,acrState.q)}${x.n?`<div class="note">${hl(x.n,acrState.q)}</div>`:""}</td><td class="tnum">${x.d||"—"}</td></tr>`).join("")||`<tr><td colspan="3" class="muted">No matches.</td></tr>`;
  };
  draw();
  $("#acrq").oninput=e=>{acrState.q=e.target.value;draw();};
  $$(".chip[data-dom]",app).forEach(c=>c.onclick=()=>{acrState.d=+c.dataset.dom;$$(".chip[data-dom]",app).forEach(x=>x.classList.toggle("on",x===c));draw();});
  $("#acrdrill").onclick=()=>{S.prefs.drill=Object.assign(S.prefs.drill||{},{mode:"acr",doms:acrState.d>0?[acrState.d]:[]});save();location.hash="#drill";};
};
function filteredAcr(){const d=acrState.d;return ACR.filter(x=>d===0||(d===-1?x.d===0:x.d===d));}

let regQ="";
V.regs=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Laws, Regulations &amp; Bodies</h2><p class="lede">Who makes the rules, who enforces them, and the numbers that get tested. The exam is international but leans US; EU and Canadian entries are here for completeness.</p>
   <div class="toolbar"><input type="search" id="regq" placeholder="Filter laws, bodies, standards…" value="${esc(regQ)}" aria-label="Filter laws and bodies"><button class="btn" id="regdrill">Drill bodies &amp; laws</button></div></div>
   <div class="grid2">
    <div class="card"><h3>Who enforces what</h3><div class="tblwrap" style="border:0"><table><tbody>${ENFORCE.map(e=>`<tr><td class="acr">${esc(e[0])}</td><td>${esc(e[1])}</td></tr>`).join("")}</tbody></table></div></div>
    <div class="card"><h3>Breach notification clocks</h3><div class="tblwrap" style="border:0"><table><tbody>${CLOCKS.map(e=>`<tr><td class="acr">${esc(e[0])}</td><td>${esc(e[1])}</td></tr>`).join("")}</tbody></table></div></div>
   </div>
   <div id="regtables"></div>
  </div>`;
  const draw=()=>{
    const q=regQ.toLowerCase();const m=o=>!q||Object.values(o).join(" ").toLowerCase().includes(q);
    const B=BODIES.filter(m),L=LAWS.filter(m),T=STANDARDS.filter(m);
    $("#regtables").innerHTML=`
     <h3 style="margin-top:4px">Regulatory &amp; standards bodies <span class="tnum">${B.length}</span></h3>
     <div class="tblwrap"><table><thead><tr><th>Body</th><th>Region</th><th>What it does</th><th>Exam hook</th></tr></thead><tbody>${B.map(b=>`<tr><td class="acr">${hl(b.n,regQ)}<div class="note" style="font-family:var(--body);white-space:normal;max-width:220px">${hl(b.f,regQ)}</div></td><td>${hl(b.r,regQ)}</td><td>${hl(b.w,regQ)}</td><td class="note">${hl(b.x,regQ)}</td></tr>`).join("")||`<tr><td colspan="4" class="muted">No matches.</td></tr>`}</tbody></table></div>
     <h3 style="margin-top:22px">Laws &amp; regulations <span class="tnum">${L.length}</span></h3>
     <div class="tblwrap"><table><thead><tr><th>Law</th><th>Region</th><th>Covers</th><th>Exam hook</th></tr></thead><tbody>${L.map(b=>`<tr><td class="acr">${hl(b.n,regQ)}<div class="note" style="font-family:var(--body);white-space:normal;max-width:220px">${hl(b.f,regQ)}</div></td><td>${hl(b.r,regQ)}</td><td>${hl(b.w,regQ)}</td><td class="note">${hl(b.x,regQ)}</td></tr>`).join("")||`<tr><td colspan="4" class="muted">No matches.</td></tr>`}</tbody></table></div>
     <h3 style="margin-top:22px">Standards &amp; frameworks <span class="tnum">${T.length}</span></h3>
     <div class="tblwrap"><table><thead><tr><th>Standard</th><th>What it is</th></tr></thead><tbody>${T.map(b=>`<tr><td class="acr">${hl(b.n,regQ)}</td><td>${hl(b.w,regQ)}</td></tr>`).join("")||`<tr><td colspan="2" class="muted">No matches.</td></tr>`}</tbody></table></div>`;
  };
  draw();
  $("#regq").oninput=e=>{regQ=e.target.value;draw();};
  $("#regdrill").onclick=()=>{S.prefs.drill=Object.assign(S.prefs.drill||{},{mode:"mix"});save();location.hash="#drill";};
};

/* ---------- generated calculation + "which key?" drills ---------- */
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const money=v=>(v<0?"−":"")+"$"+Math.round(Math.abs(v)).toLocaleString("en-US");
const num=v=>(Math.round(v*1000)/1000).toLocaleString("en-US");
function uniq4(ans,cands,fmtf){const out=[ans];for(const c of cands){const f=fmtf(c);if(!out.includes(f))out.push(f);if(out.length===4)break;}let k=2;while(out.length<4){const f=fmtf(Math.abs(parseFloat(String(ans).replace(/[^0-9.]/g,"")))*k++);if(!out.includes(f))out.push(f);}return out;}
const FREQ=[[2,"twice a year"],[1,"once a year"],[0.5,"once every 2 years"],[0.25,"once every 4 years"],[0.2,"once every 5 years"],[0.1,"once every 10 years"],[0.05,"once every 20 years"],[0.04,"once every 25 years"]];
const CALC=[
 ()=>{const AV=ri(4,80)*25000,EF=[10,20,25,40,50,75,100][ri(0,6)],f=FREQ[ri(0,7)];const SLE=AV*EF/100,ALE=SLE*f[0];
   return {d:1,q:`A ${money(AV)} asset would lose ${EF}% of its value in an incident expected ${f[1]}. What is the ALE?`,ans:money(ALE),opts:uniq4(money(ALE),[SLE,AV*f[0],ALE*10,SLE*2],money),ex:`SLE = AV × EF = ${money(AV)} × ${EF/100} = ${money(SLE)}. ARO = ${f[0]}. ALE = SLE × ARO = ${money(ALE)}.`};},
 ()=>{const AV=ri(4,80)*25000,EF=[10,20,25,40,50,75][ri(0,5)];const SLE=AV*EF/100;
   return {d:1,q:`An asset is worth ${money(AV)}. A single incident would destroy ${EF}% of it. What is the SLE?`,ans:money(SLE),opts:uniq4(money(SLE),[AV,AV-SLE,SLE/10,SLE*2],money),ex:`SLE = AV × EF = ${money(AV)} × ${EF/100} = ${money(SLE)}.`};},
 ()=>{const b=ri(4,40)*5000,a=Math.round(b*[0.1,0.2,0.25,0.4,0.5][ri(0,4)]),c=ri(2,30)*1000;const v=b-a-c;
   return {d:1,q:`ALE is ${money(b)} today. A safeguard would cut it to ${money(a)} and costs ${money(c)} a year. What is the safeguard's annual value?`,ans:money(v),opts:uniq4(money(v),[b-a,b-c,b-a+c,a-c],money),ex:`Value = ALE before − ALE after − annual cost = ${money(b)} − ${money(a)} − ${money(c)} = ${money(v)}. ${v>0?"Positive, so it's worth doing.":"Negative, so it costs more than it saves."}`};},
 ()=>{const n=[2,4,5,8,10,20,25,50][ri(0,7)];const ans=num(1/n);
   return {d:1,q:`A flood is expected once every ${n} years. What is the ARO?`,ans,opts:uniq4(ans,[n,1/(2*n),10/n,n/100],num),ex:`ARO = 1 ÷ ${n} = ${ans} occurrences per year.`};},
 ()=>{const M=[8,12,24,48,72][ri(0,4)],W=pick([1,2,4,6,8].filter(x=>x<M));const R=M-W;
   return {d:1,q:`A business process has an MTD of ${M} hours. Verifying and resuming work after a restore takes ${W} hours. What is the maximum RTO?`,ans:`${R} hours`,opts:uniq4(`${R} hours`,[M+W,M,W,M/2],v=>`${v} hours`),ex:`RTO + WRT ≤ MTD, so RTO ≤ ${M} − ${W} = ${R} hours.`};},
 ()=>{const F=[500,1000,2000,4000,5000][ri(0,4)],T=[2,4,5,10,20,25][ri(0,5)];const A=100*F/(F+T);const fm=v=>v.toFixed(2)+"%";
   return {d:7,q:`A system has an MTBF of ${F.toLocaleString()} hours and an MTTR of ${T} hours. What is its availability?`,ans:fm(A),opts:uniq4(fm(A),[100*T/(F+T),100-T,100*T/F*10],fm),ex:`Availability = MTBF ÷ (MTBF + MTTR) = ${F} ÷ ${F+T} = ${fm(A)}.`};},
 ()=>{const n=ri(4,60)*5;const sym=Math.random()<.5;const s=n*(n-1)/2,a=2*n;const ans=(sym?s:a).toLocaleString();
   return {d:3,q:`${n} people must each be able to communicate privately with every other person. How many keys are needed with ${sym?"symmetric":"asymmetric"} cryptography?`,ans,opts:uniq4(ans,[sym?a:s,n*n,n*(n-1),n],v=>v.toLocaleString()),ex:`Symmetric: n(n−1)/2 = ${s.toLocaleString()}. Asymmetric: 2n = ${a.toLocaleString()} (a key pair each).`};},
 ()=>{const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];const f=ri(2,6);const inc=Math.random()<.5;const need=inc?f:2;
   return {d:7,q:`A full backup runs Sunday night and ${inc?"incremental":"differential"} backups run each of the other nights. The server fails ${days[f-1]} morning, before that night's backup. How many backups are needed to restore?`,ans:String(need),opts:uniq4(String(need),[inc?2:f,f+1,1,f-1],v=>String(v)),ex:inc?`Full + every incremental since: Sunday full + ${f-1} incremental${f-1===1?"":"s"} (Mon–${days[f-2].slice(0,3)}) = ${f}.`:`Full + only the latest differential = 2. Each differential holds everything since the full.`};},
];
const PAIRS_N=[["Alice","Bob"],["Priya","Sam"],["Jordan","Mei"],["Omar","Lena"],["Ravi","Chloe"]];
function keyItem(){
  const [A,B]=pick(PAIRS_N);const K=[`${A}'s public key`,`${A}'s private key`,`${B}'s public key`,`${B}'s private key`];
  const S4=(ans)=>[ans,...K.filter(k=>k!==ans)];
  const sc=[
   ()=>({q:`${A} wants to send ${B} a message that only ${B} can read. Which key encrypts it?`,ans:K[2],opts:S4(K[2]),ex:`Confidentiality: encrypt with the recipient's public key; only ${B}'s private key can decrypt.`}),
   ()=>({q:`${A} encrypted a message so only ${B} could read it. Which key does ${B} use to decrypt it?`,ans:K[3],opts:S4(K[3]),ex:`The recipient's private key decrypts what was encrypted with their public key.`}),
   ()=>({q:`${A} digitally signs a contract before sending it to ${B}. Which key creates the signature?`,ans:K[1],opts:S4(K[1]),ex:`A signature is the message hash encrypted with the sender's private key, which only ${A} has. That's what gives non-repudiation.`}),
   ()=>({q:`${B} receives a signed message from ${A}. Which key verifies the signature?`,ans:K[0],opts:S4(K[0]),ex:`Anyone can verify with the sender's public key.`}),
   ()=>{const ans=`${A}'s private key and ${B}'s public key`;return {q:`${A} needs ${B} to know the message came from ${A} AND that only ${B} can read it. Which keys does ${A} use?`,ans,opts:[ans,`${A}'s public key and ${B}'s private key`,`${A}'s private key and ${B}'s private key`,`${B}'s public key only`],ex:`Sign with your own private key (origin, non-repudiation), then encrypt with the recipient's public key (confidentiality).`};},
   ()=>({q:`${A} encrypts a large file with a random AES session key, using hybrid encryption to send it to ${B}. Which key protects the session key?`,ans:K[2],opts:S4(K[2]),ex:`Hybrid crypto: fast symmetric encryption for the data; the recipient's public key wraps the session key.`}),
   ()=>{const C=["the CA's private key","the CA's public key",`${B}'s private key`,`${B}'s public key`];return {q:`A certificate authority issues ${B}'s certificate. Which key does the CA sign it with?`,ans:C[0],opts:C,ex:`The CA signs certificates with its private key; anyone holding the CA's public key (in the trust store) can verify them.`};},
   ()=>{const C=["the CA's public key","the CA's private key",`${B}'s private key`,`${B}'s public key`];return {q:`${A}'s browser checks ${B}'s website certificate. Which key verifies the CA's signature on it?`,ans:C[0],opts:C,ex:`Browsers trust a root store of CA public keys and use them to verify certificate signatures.`};},
   ()=>{const C=[`a secret key shared by ${A} and ${B}`,`${A}'s private key`,`${B}'s public key`,`the CA's public key`];return {q:`${A} and ${B} protect message integrity with an HMAC. Which key is used?`,ans:C[0],opts:C,ex:`HMAC uses a shared symmetric secret. Either party could have made it, so there's no non-repudiation.`};},
   ()=>({q:`${B}'s private key was stolen. Which of ${B}'s properties is MOST directly lost?`,ans:"Confidentiality of messages sent to Bob, and trust in Bob's signatures".replace(/Bob/g,B),opts:["Confidentiality of messages sent to Bob, and trust in Bob's signatures".replace(/Bob/g,B),`Only the ability of ${A} to sign messages`,`Nothing, as long as ${B}'s public key is safe`,`Only availability of ${B}'s certificate`],ex:`The thief can decrypt messages meant for ${B} and forge ${B}'s signatures. Revoke the certificate immediately.`}),
  ];
  return {d:3,...pick(sc)(),tag:"Which key?"};
}

/* ---------- drills (generated) ---------- */
let drillState={mode:null};
const MODES=[
 ["acr","Acronym → meaning"],["rev","Meaning → acronym"],["calc","Calculations"],["keys","Which key?"],["body","Body → what it does"],["law","Description → law"],["std","Standard → topic"],["stdrev","Topic → standard"],["mix","Mixed regulatory"]
];
const pick=a=>a[Math.floor(Math.random()*a.length)];
const mainPart=f=>f.replace(/\s*\((?:or|also)[^)]*\)\s*$/i,"").trim();
// word bank by initial letter, built from every real expansion
const BANK={};const REAL=new Set(ACR.map(x=>mainPart(x.f).toLowerCase()));
ACR.forEach(x=>mainPart(x.f).split(/\s+/).forEach(w=>{const m=w.match(/^([A-Z][a-z]{2,})[,.]?$/);if(m)(BANK[m[1][0]]=BANK[m[1][0]]||new Set()).add(m[1]);}));
Object.keys(BANK).forEach(k=>BANK[k]=[...BANK[k]]);
function fakeExpansions(x,n){ // same initials, different words
  const base=mainPart(x.f);const words=base.split(/\s+/);
  const sig=words.map((w,i)=>/^[A-Z][a-z]{2,}[,.]?$/.test(w)&&BANK[w[0]]&&BANK[w[0]].length>1?i:-1).filter(i=>i>=0);
  const out=new Set();let tries=0;
  while(out.size<n&&tries++<300&&sig.length){
    const w=words.slice();const k=1+Math.floor(Math.random()*Math.min(sig.length,tries>60?3:2));
    shuffle(sig).slice(0,k).forEach(i=>{const m=w[i].match(/^([A-Za-z]+)(\W*)$/);const cand=BANK[m[1][0]].filter(z=>z!==m[1]);if(cand.length)w[i]=pick(cand)+m[2];});
    const s=w.join(" ");if(s!==base&&!REAL.has(s.toLowerCase()))out.add(s);
  }
  return [...out];
}
const ACRSET=new Set(ACR.map(x=>x.a));
function lev(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length];}
function fakeAcronyms(a,n){ // look-alike acronyms: real near-misses first, then mutations
  const out=new Set();
  shuffle(ACR.map(x=>x.a).filter(z=>z!==a&&Math.abs(z.length-a.length)<=1&&lev(z,a)<=2)).slice(0,2).forEach(z=>out.add(z));
  const L="ACDEIKMPRSTV".split("");const idx=[...a].map((c,i)=>/[A-Z]/.test(c)?i:-1).filter(i=>i>=0);let tries=0;
  while(out.size<n&&tries++<200&&idx.length){
    let c=[...a];const r=Math.random();
    if(r<.35&&idx.length>1){const i=pick(idx.slice(0,-1));const j=idx[idx.indexOf(i)+1];[c[i],c[j]]=[c[j],c[i]];}
    else if(r<.8){c[pick(idx)]=pick(L);}
    else{c.splice(pick(idx)+1,0,pick(L));}
    const s=c.join("");if(s!==a&&!out.has(s))out.add(s);
  }
  return [...out].slice(0,n);
}
function redact(text,name){
  let t=text;const parts=[name,...name.split(/[\s/]+/).filter(p=>p.length>=3&&!/^(and|the|of|for|act|rule|law)$/i.test(p))];
  parts.sort((x,y)=>y.length-x.length).forEach(p=>{t=t.replace(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"),"▢▢▢");});
  return t;
}
function distract(item,pool,key,n=3){ // prefer same region / family
  const fam=x=>(x.r||x.n.split(/[\s/]/)[0]);
  const same=shuffle(pool.filter(p=>p!==item&&fam(p)===fam(item)));const rest=shuffle(pool.filter(p=>p!==item&&fam(p)!==fam(item)));
  const out=[];for(const p of [...same,...rest]){if(!out.includes(p[key])&&p[key]!==item[key])out.push(p[key]);if(out.length===n)break;}return out;
}
function buildDrill(mode,d,n){
  const items=[];
  const acrPool=ACR.filter(x=>!d||!d.length||d.includes(x.d));
  if(mode==="acr")sample(acrPool,n).forEach(x=>{const ans=mainPart(x.f);let f=fakeExpansions(x,3);
    if(f.length<3)f=f.concat(shuffle(ACR.filter(y=>y.a!==x.a&&y.a[0]===x.a[0])).map(y=>mainPart(y.f))).filter((v,i,a)=>a.indexOf(v)===i&&v!==ans).slice(0,3);
    items.push({d:x.d,q:`What does ${x.a} stand for?`,ans,opts:[ans,...f.slice(0,3)],ex:`${x.a} = ${x.f}.${x.n?" "+x.n:""}`,tag:"Acronym"});});
  if(mode==="rev")sample(acrPool,n).forEach(x=>items.push({d:x.d,q:`Which acronym means "${mainPart(x.f)}"?`,ans:x.a,opts:[x.a,...fakeAcronyms(x.a,3)],ex:x.n?`${x.a}: ${x.n}`:"",tag:"Acronym"}));
  const bodyQ=b=>({d:1,q:`Which body? ${redact(b.w,b.n)}`,ans:b.n,opts:[b.n,...distract(b,BODIES,"n")],ex:`${b.n} = ${b.f} (${b.r}). ${b.x}`,tag:"Body"});
  const lawQ=b=>({d:1,q:`Which law or regulation? ${redact(b.w,b.n)}`,ans:b.n,opts:[b.n,...distract(b,LAWS,"n")],ex:`${b.n} = ${b.f} (${b.r}). ${b.x}`,tag:"Law"});
  const stdQ=b=>({d:1,q:`What is ${b.n}?`,ans:b.w,opts:[b.w,...distract(b,STANDARDS,"w")],ex:"",tag:"Standard"});
  const stdRevQ=b=>({d:1,q:`Which standard? ${redact(b.w,b.n)}`,ans:b.n,opts:[b.n,...distract(b,STANDARDS,"n")],ex:`${b.n}: ${b.w}`,tag:"Standard"});
  const enfQ=e=>({d:1,q:`Who enforces or oversees ${e[0]}?`,ans:e[1],opts:[e[1],...shuffle(ENFORCE.filter(x=>x[1]!==e[1]).map(x=>x[1])).slice(0,3)],ex:"",tag:"Enforcement"});
  if(mode==="body")sample(BODIES,n).forEach(b=>items.push(bodyQ(b)));
  if(mode==="law")sample(LAWS,n).forEach(b=>items.push(lawQ(b)));
  if(mode==="std")sample(STANDARDS,n).forEach(b=>items.push(stdQ(b)));
  if(mode==="stdrev")sample(STANDARDS,n).forEach(b=>items.push(stdRevQ(b)));
  if(mode==="mix"){const all=[...BODIES.map(bodyQ),...LAWS.map(lawQ),...STANDARDS.map(stdRevQ),...ENFORCE.map(enfQ)];sample(all,n).forEach(x=>items.push(x));}
  if(mode==="calc")for(let i=0;i<n;i++)items.push({...CALC[i%CALC.length](),tag:"Calculation"});
  if(mode==="keys")for(let i=0;i<n;i++)items.push(keyItem());
  return (mode==="calc"?shuffle(items):items).filter(x=>x.opts.length===4);
}
/* ---------- setup panel + session components ---------- */
S.prefs=S.prefs||{};
const pref=(k,def)=>{S.prefs[k]=Object.assign({},def,S.prefs[k]||{});return S.prefs[k];};
function fRow(label,inner,opts={}){return `<div class="frow" ${opts.id?`id="${opts.id}"`:""} ${opts.hidden?"hidden":""}><div class="flabel">${label}${opts.hint?`<span>${opts.hint}</span>`:""}</div><div class="fctl">${inner}</div></div>`;}
function segHTML(name,opts,val){return `<div class="seg" role="radiogroup" data-seg="${name}">${opts.map(o=>`<button role="radio" aria-checked="${String(o[0])===String(val)}" class="${String(o[0])===String(val)?"on":""}" data-v="${o[0]}" ${o[3]?"disabled":""}>${esc(o[1])}${o[2]!=null?`<span class="w">${o[2]}</span>`:""}</button>`).join("")}</div>`;}
function bindSeg(root,name,cb){const bs=$$(`[data-seg="${name}"] button`,root);bs.forEach(b=>b.onclick=()=>{if(b.disabled)return;bs.forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-checked",x===b);});cb(b.dataset.v);});}
function domPickHTML(name,sel){return `<div class="dpick" data-dpick="${name}"><button class="chip ${!sel.length?"on":""}" data-all="1">All</button>${DOMAINS.map(d=>`<button class="chip ${sel.includes(d.id)?"on":""}" data-d="${d.id}" title="${esc(d.name)}">D${d.id} ${d.code}</button>`).join("")}</div>`;}
function bindDom(root,name,arr,cb){const w=$(`[data-dpick="${name}"]`,root);if(!w)return;
  const draw=()=>{$$("[data-d]",w).forEach(b=>b.classList.toggle("on",arr.includes(+b.dataset.d)));$("[data-all]",w).classList.toggle("on",!arr.length);};
  $("[data-all]",w).onclick=()=>{arr.length=0;draw();cb();};
  $$("[data-d]",w).forEach(b=>b.onclick=()=>{const id=+b.dataset.d,i=arr.indexOf(id);i>=0?arr.splice(i,1):arr.push(id);if(arr.length===DOMAINS.length)arr.length=0;arr.sort((a,b)=>a-b);draw();cb();});}
const domSummary=a=>!a.length?"all domains":a.map(x=>"D"+x).join(", ");
function panelHTML(title,desc,rows,startLabel){return `<section class="setup"><div class="setup-head"><h3>${title}</h3>${desc?`<p>${desc}</p>`:""}</div><div class="frows">${rows.join("")}</div><div class="setup-foot"><span class="summary" id="sum"></span><button class="btn" id="go">${startLabel}</button></div></section>`;}
function session(title,back,run){
  if(stopActive){stopActive();stopActive=null;}
  app.innerHTML=`<div class="session"><div class="sbar"><button class="sback" id="sback">← ${esc(back.label)}</button><span class="stitle">${esc(title)}</span></div><div id="shost"></div></div>`;
  $("#sback").onclick=()=>{if(stopActive){stopActive();stopActive=null;}back.go();window.scrollTo({top:0});};
  window.scrollTo({top:0});const st=run($("#shost"));if(typeof st==="function")stopActive=st;
}

/* ---------- drills view ---------- */
const DRILL_GROUPS=[
 ["Acronyms",[["acr","Acronym → meaning","Every option spells the same letters."],["rev","Meaning → acronym","Spot the real one among look-alikes."]]],
 ["Crypto & math",[["calc","Calculations","ALE, safeguard value, RTO, availability, key counts, backups."],["keys","Which key?","Encrypt, sign, verify, hybrid, certificates, HMAC."]]],
 ["Laws & standards",[["body","Regulatory bodies","Who does what, with the name hidden."],["law","Laws & regulations","Match the description to the law."],["stdrev","Topic → standard","Which NIST SP, ISO or FIPS covers it?"],["std","Standard → topic","What does this standard cover?"],["mix","Mixed regulatory","Bodies, laws, standards and enforcers."]]],
];
const DRILL_NAMES=Object.fromEntries(DRILL_GROUPS.flatMap(g=>g[1]).map(m=>[m[0],m[1]]));
V.drill=()=>{
  const p=pref("drill",{mode:"acr",doms:[],len:15});if(drillState.mode&&drillState.mode!==p.mode&&DRILL_NAMES[drillState.mode]){p.mode=drillState.mode;}drillState.mode=null;
  const acrMode=()=>p.mode==="acr"||p.mode==="rev";
  app.innerHTML=`<div class="stack"><div><h2>Drills</h2><p class="lede">Fast rounds generated fresh every time. Pick a drill, set the options, start.</p></div>
   ${panelHTML("Set up a drill","",[
     fRow("Drill",`<div class="dmodes">${DRILL_GROUPS.map(g=>`<div class="dgroup"><div class="dgname">${g[0]}</div><div class="dgcards">${g[1].map(m=>`<button class="dmode ${p.mode===m[0]?"on":""}" data-mode="${m[0]}" role="radio" aria-checked="${p.mode===m[0]}"><b>${esc(m[1])}</b><span>${esc(m[2])}</span></button>`).join("")}</div></div>`).join("")}</div>`),
     fRow("Domains",domPickHTML("dd",p.doms),{id:"ddRow",hidden:!acrMode(),hint:"Acronym drills only"}),
     fRow("Length",segHTML("dlen",[[10,"10"],[15,"15"],[25,"25"],[40,"40"]],p.len)),
   ],"Start drill")}</div>`;
  const upd=()=>{$("#ddRow").hidden=!acrMode();$("#sum").textContent=`${p.len} questions · ${DRILL_NAMES[p.mode]}${acrMode()?` · ${domSummary(p.doms)}`:""}`;save();};
  $$(".dmode",app).forEach(b=>b.onclick=()=>{p.mode=b.dataset.mode;$$(".dmode",app).forEach(x=>{x.classList.toggle("on",x===b);x.setAttribute("aria-checked",x===b);});upd();});
  bindDom(app,"dd",p.doms,upd);bindSeg(app,"dlen",v=>{p.len=+v;upd();});upd();
  const start=()=>{const items=buildDrill(p.mode,acrMode()?p.doms:[],p.len);
    session(`Drill · ${DRILL_NAMES[p.mode]}`,{label:"Drill setup",go:V.drill},h=>{if(!items.length){h.innerHTML=`<div class="empty">No items match. Try All domains.</div>`;return;}return runQuiz(h,items,{again:start,back:V.drill,backLabel:"Drill setup"});});};
  $("#go").onclick=start;
};

/* ---------- quiz view ---------- */
const QTYPES=[["all","All types"],["best","BEST / FIRST"],["single","Multiple choice"],["multi","Multi-select"],["dnd","Order, match & hotspot"]];
const typeOK=(q,t)=>t==="all"||(t==="dnd"?(q.type==="order"||q.type==="match"||q.type==="hot"):t==="best"?!!q.best:q.type===t);
let pendingSmart=false;
function quizPool(p){
  let pool=p.mode==="misses"?QS.filter(q=>stat(q.id)[1]>stat(q.id)[0]):QS;
  if(p.doms.length)pool=pool.filter(q=>p.doms.includes(q.d));
  if(p.type!=="all")pool=pool.filter(q=>typeOK(q,p.type));
  return pool;
}
V.quiz=()=>{
  const p=pref("quiz",{mode:"custom",doms:(prof().focus||[]).slice(0,1),type:"all",len:10});
  const missN=QS.filter(q=>stat(q.id)[1]>stat(q.id)[0]).length;
  const cnt=t=>QS.filter(q=>typeOK(q,t)&&(!p.doms.length||p.doms.includes(q.d))).length;
  app.innerHTML=`<div class="stack"><div><h2>Quiz</h2><p class="lede">${QS.length} questions: scenarios, BEST/FIRST manager-mindset items, multi-select, ordering, matching and hotspot. You get an explanation after every answer.</p></div>
   ${panelHTML("Set up a quiz","",[
     fRow("Mode",segHTML("qmode",[["custom","Custom"],["smart","Smart review"],["misses","My misses",missN,!missN]],p.mode),{hint:"Smart review picks from your misses, weak and focus domains"}),
     fRow("Domains",domPickHTML("qd",p.doms),{id:"qdRow"}),
     fRow("Question types",`<div id="qtypes">${segHTML("qtype",QTYPES.map(t=>[t[0],t[1],cnt(t[0])]),p.type)}</div>`,{id:"qtRow"}),
     fRow("Length",segHTML("qlen",[[10,"10"],[20,"20"],[30,"30"],[50,"50"]],p.len)),
   ],"Start quiz")}</div>`;
  const upd=()=>{if(p.mode==="misses"&&!missN)p.mode="custom";const smart=p.mode==="smart";$("#qdRow").hidden=smart;$("#qtRow").hidden=smart;
    $("#qtypes").innerHTML=segHTML("qtype",QTYPES.map(t=>[t[0],t[1],cnt(t[0])]),p.type);bindSeg(app,"qtype",v=>{p.type=v;upd();});
    const pool=quizPool(p);const n=Math.min(p.len,smart?QS.length:pool.length);
    $("#sum").textContent=smart?`${p.len} questions picked for you`:pool.length?`${n} questions · ${domSummary(p.doms)} · ${pool.length} available`:"Nothing matches. Widen the domains or types.";
    $("#go").disabled=!smart&&!pool.length;save();};
  bindSeg(app,"qmode",v=>{p.mode=v;upd();});bindDom(app,"qd",p.doms,upd);bindSeg(app,"qlen",v=>{p.len=+v;upd();});upd();
  const start=()=>{const smart=p.mode==="smart";const items=smart?smartPick(p.len):sample(quizPool(p),p.len);
    session(smart?"Smart review":p.mode==="misses"?"My misses":`Quiz · ${domSummary(p.doms)}`,{label:"Quiz setup",go:V.quiz},h=>runQuiz(h,items,{again:start,back:V.quiz,backLabel:"Quiz setup"}));};
  $("#go").onclick=start;
  if(pendingSmart){pendingSmart=false;p.mode="smart";start();}
};

/* ---------- practice test view ---------- */
const LENGTHS=[[25,30],[50,60],[100,120],[150,180]];
V.exam=()=>{
  const p=pref("exam",{len:50,feedback:"end",timer:"on"});
  const ex=S.exams.slice(0,6);
  app.innerHTML=`<div class="stack"><div><h2>Practice Test</h2><p class="lede">Mixed domains, weighted like the real exam, with about 1 in 5 items multi-select, ordering, matching or hotspot. Timed at the real exam's pace of about 72 seconds per question.</p></div>
   ${panelHTML("Set up a practice test","",[
     fRow("Length",segHTML("elen",LENGTHS.map(l=>[l[0],`${l[0]} questions`]),p.len),{hint:"Real exam: 100–150"}),
     fRow("Answers",segHTML("efb",[["end","At the end (exam mode)"],["each","After each question (study mode)"]],p.feedback)),
     fRow("Timer",segHTML("etimer",[["on","On"],["off","Off"]],p.timer)),
   ],"Start test")}
   ${ex.length?`<div class="card"><h3>Recent tests</h3><div class="hist">${ex.map(e=>`<div><span class="tnum">${new Date(e.t).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span><span class="bar ${barClass(e.pct)}"><i style="width:${e.pct}%"></i></span><b class="tnum" style="color:var(--ink)">${e.pct}%</b><span class="tnum">${e.right}/${e.n}</span></div>`).join("")}</div></div>`:""}</div>`;
  const mins=()=>LENGTHS.find(l=>l[0]===p.len)[1];
  const upd=()=>{$("#sum").textContent=`${p.len} questions${p.timer==="on"?` · ${mins()} minutes`:" · untimed"} · ${p.feedback==="end"?"forward-only, score at the end":"explanations as you go"}`;save();};
  bindSeg(app,"elen",v=>{p.len=+v;upd();});bindSeg(app,"efb",v=>{p.feedback=v;upd();});bindSeg(app,"etimer",v=>{p.timer=v;upd();});upd();
  const start=()=>{const items=weighted(p.len);
    session(`Practice test · ${p.len} questions`,{label:"Test setup",go:V.exam},h=>runQuiz(h,items,{exam:p.feedback==="end",minutes:p.timer==="on"?mins():0,record:true,again:start,back:V.exam,backLabel:"Test setup"}));};
  $("#go").onclick=start;
};
function weighted(n){ // ~80% multiple choice, ~20% other item types per domain
  const out=[];const byD={};QS.forEach(q=>{const g=q.type==="single"?"s":"a";((byD[q.d]=byD[q.d]||{s:[],a:[]})[g]).push(q);});
  DOMAINS.forEach(d=>{const k=Math.round(n*d.w/100);const ka=Math.min(byD[d.id].a.length,Math.max(1,Math.round(k*0.2)));out.push(...sample(byD[d.id].a,ka),...sample(byD[d.id].s,Math.min(byD[d.id].s.length,k-ka)));});
  const rest=shuffle(QS.filter(q=>!out.includes(q)));while(out.length<n&&rest.length)out.push(rest.pop());
  return shuffle(out.slice(0,n));
}

function smartPick(n){
  const focus=new Set(prof().focus||[]);const dm={};DOMAINS.forEach(d=>dm[d.id]=domainMastery(d.id).pct);
  const scored=QS.map(q=>{const [r,w]=stat(q.id);const pct=dm[q.d];
    let sc=(w-r)*3+(r+w===0?1.2:0)+(pct==null?0.8:(100-pct)/25)+(focus.has(q.d)?1.5:0)+(r>=2&&w===0?-4:0)+Math.random()*1.5;return {q,sc};});
  scored.sort((a,b)=>b.sc-a.sc);
  const cap=Math.max(3,Math.ceil(n/4));const out=[],per={};for(const {q} of scored){if((per[q.d]||0)>=cap)continue;out.push(q);per[q.d]=(per[q.d]||0)+1;if(out.length===n)break;}
  return out;
}
/* ---------- models & mnemonics ---------- */
let modD=0;
function mnHTML(mn){ // bold the first letter of each word in the mnemonic
  return esc(mn).replace(/(^|[\s(—–:\-·,"])([A-Za-z])/g,"$1<b class=\"ml1\">$2</b>");
}
V.models=()=>{
  const list=MODELS.filter(m=>!modD||m.d===modD);
  app.innerHTML=`<div class="stack">
   <div><h2>Models &amp; Mnemonics</h2><p class="lede">Every sequence and list the exam likes to test, with a way to remember it. Hit <b>Test me</b> to rebuild the order from scrambled pieces. These ordering items also appear in the quizzes and practice tests.</p>
   ${domChips(modD)}
   <div class="row" style="margin-top:12px"><button class="btn" id="mall">Drill 8 random sequences</button></div>
   <div id="mhost" style="margin-top:14px"></div></div>
   <div class="mgrid">${list.map(m=>`<article class="card model" id="mod-${m.id}">
     <div class="row" style="gap:8px;margin-bottom:6px"><span class="dnum">${m.d}</span><h3 style="margin:0;flex:1;min-width:0">${esc(m.name)}</h3></div>
     <p class="mn">${mnHTML(m.mn)}</p>${m.alt?`<p class="muted" style="font-size:13px;margin:-4px 0 10px">${esc(m.alt)}</p>`:""}
     ${m.id==="osi"?osiTable(m):`<${m.ord?"ol":"ul"} class="steps">${m.steps.map(st=>`<li><b>${esc(st[0])}</b>${st[1]?` <span class="muted">— ${esc(st[1])}</span>`:""}</li>`).join("")}</${m.ord?"ol":"ul"}>`}
     ${m.ord?`<div class="row" style="margin-top:10px"><button class="btn ghost" data-test="${m.id}">Test me</button></div><div class="thost"></div>`:""}
   </article>`).join("")}</div></div>`;
  $$(".chip[data-dom]",app).forEach(c=>c.onclick=()=>{modD=+c.dataset.dom;V.models();});
  $$("[data-test]",app).forEach(b=>b.onclick=()=>{const it=MODEL_ITEMS.find(x=>x.id==="m:"+b.dataset.test);const h=b.closest(".model").querySelector(".thost");const go=()=>runQuiz(h,[it],{again:go,scrollTop:false});go();});
  const all=()=>{const h=$("#mhost");const pool=MODEL_ITEMS.filter(x=>!modD||x.d===modD);runQuiz(h,sample(pool,Math.min(8,pool.length)),{again:all,scrollTop:false});h.scrollIntoView({behavior:"smooth",block:"start"});};
  $("#mall").onclick=all;
};
function osiTable(m){
  const rows=m.steps.map((s,i)=>({n:i+1,name:s[0],note:s[1]})).reverse();
  return `<div class="tblwrap" style="margin-top:4px"><table class="osi"><thead><tr><th>#</th><th>Layer</th><th>PDU · protocols · devices</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="tnum">${r.n}</td><td><b>${esc(r.name)}</b><div class="muted" style="font-size:12px">${"Please Do Not Throw Sausage Pizza Away".split(" ")[r.n-1]} · ${"All People Seem To Need Data Processing".split(" ")[7-r.n]}</div></td><td>${esc(r.note)}</td></tr>`).join("")}</tbody></table></div>`;
}

/* ---------- flashcards (spaced repetition, Leitner boxes) ---------- */
// S.cards[key] = {b: box 0-5, due: ms timestamp}. "Got it" moves up a box; "Again" drops to box 0.
const BOX_GAP=[0,4*36e5,864e5,3*864e5,7*864e5,14*864e5]; // due gap after reaching each box
const MASTERED=4;
Object.keys(S.cards).forEach(k=>{if(typeof S.cards[k]!=="object")S.cards[k]={b:2,due:Date.now()};});
let fcState={src:"study",doms:[],dueOnly:true,deck:[],i:0,flip:false};
function allCards(){
  let cards=[];const ds=fcState.doms||[];const no=x=>ds.length&&!ds.includes(x);
  if(fcState.src==="study")REV.forEach(r=>{if(no(r.id))return;r.review.forEach(c=>cards.push({k:"s:"+r.id+":"+c.t,f:c.t,b:c.d,src:`Study set · Domain ${r.id}`}));});
  if(fcState.src==="acr")ACR.forEach(x=>{if(no(x.d))return;cards.push({k:"a:"+x.a,f:x.a,b:x.f+(x.n?` — ${x.n}`:""),src:`Acronym · Domain ${x.d||"all"}`});});
  if(fcState.src==="regs"){BODIES.forEach(b=>cards.push({k:"b:"+b.n,f:b.n,b:`${b.f} (${b.r}). ${b.w}`,src:"Body"}));LAWS.forEach(b=>cards.push({k:"l:"+b.n,f:b.n,b:`${b.f} (${b.r}). ${b.w} ${b.x}`,src:"Law"}));STANDARDS.forEach(b=>cards.push({k:"t:"+b.n,f:b.n,b:b.w,src:"Standard"}));}
  if(fcState.src==="models")MODELS.forEach(m=>{if(no(m.d))return;cards.push({k:"m:"+m.id,f:m.name,b:`${m.mn}\n\n${m.steps.map((x,i)=>(m.ord?(i+1)+". ":"• ")+x[0]).join("\n")}`,src:`Model · Domain ${m.d}`});});
  return cards;
}
function cardStats(cards){const now=Date.now();let due=0,fresh=0,learning=0,mastered=0;
  cards.forEach(c=>{const r=S.cards[c.k];if(!r){fresh++;return;}if(r.b>=MASTERED)mastered++;else learning++;if(r.due<=now)due++;});return {due,fresh,learning,mastered};}
function buildDeck(){
  const now=Date.now();let cards=allCards();
  if(fcState.dueOnly){
    const dueC=cards.filter(c=>S.cards[c.k]&&S.cards[c.k].due<=now).sort((a,b)=>S.cards[a.k].b-S.cards[b.k].b);
    const fresh=shuffle(cards.filter(c=>!S.cards[c.k]));
    cards=[...dueC,...fresh];
  }else cards=shuffle(cards);
  fcState.deck=cards;fcState.i=0;fcState.flip=false;
}
const DECKS=()=>[["study","Study set",REV.reduce((a,r)=>a+r.review.length,0)],["acr","Acronyms",ACR.length],["regs","Laws & bodies",BODIES.length+LAWS.length+STANDARDS.length],["models","Models",MODELS.length]];
let fcHost=null;
V.cards=()=>{
  const p=pref("cards",{src:"study",doms:[],show:"due"});fcState.src=p.src;fcState.doms=p.doms;fcState.dueOnly=p.show==="due";
  app.innerHTML=`<div class="stack"><div><h2>Flashcards</h2><p class="lede">Spaced repetition: <b>Got it</b> pushes a card further out (4 hours, then 1, 3, 7 and 14 days); <b>Again</b> brings it straight back. Keys: space flips, 1 again, 2 got it, → skip.</p></div>
   ${panelHTML("Set up a review","",[
     fRow("Deck",segHTML("cdeck",DECKS().map(d=>[d[0],d[1],d[2]]),p.src)),
     fRow("Domains",domPickHTML("cd",p.doms),{id:"cdRow"}),
     fRow("Cards",segHTML("cshow",[["due","Due and new"],["all","All cards"]],p.show)),
     fRow("Progress",`<div class="srsbar" id="srs"></div>`),
   ],"Start review")}
   ${Object.keys(S.cards).length?`<div class="row" id="rkRow"><button class="chip" id="resetk">Reset card history</button></div>`:""}</div>`;
  const upd=()=>{fcState.src=p.src;fcState.doms=p.src==="regs"?[]:p.doms;fcState.dueOnly=p.show==="due";$("#cdRow").hidden=p.src==="regs";
    const all=allCards(),st=cardStats(all);$("#srs").innerHTML=`<span><b>${st.due}</b> due</span><span><b>${st.fresh}</b> new</span><span><b>${st.learning}</b> learning</span><span><b>${st.mastered}</b> mastered</span>`;
    buildDeck();$("#sum").textContent=fcState.deck.length?`${fcState.deck.length} cards ready`:"Nothing due in this deck right now";save();};
  bindSeg(app,"cdeck",v=>{p.src=v;upd();});bindDom(app,"cd",p.doms,upd);bindSeg(app,"cshow",v=>{p.show=v;upd();});upd();
  const rk=$("#resetk");if(rk)rk.onclick=()=>{$("#rkRow").innerHTML=`<span style="font-size:14px">Clear all card history?</span><button class="chip" id="rky">Yes, clear it</button><button class="chip" id="rkn">Keep it</button>`;$("#rky").onclick=()=>{S.cards={};save();V.cards();};$("#rkn").onclick=()=>V.cards();};
  $("#go").onclick=()=>{buildDeck();session(`Flashcards · ${DECKS().find(d=>d[0]===p.src)[1]}`,{label:"Flashcard setup",go:V.cards},h=>{fcHost=h;drawCard();});};
};
function nextDue(){const ks=allCards().map(c=>S.cards[c.k]).filter(Boolean).map(r=>r.due).filter(t=>t>Date.now());return ks.length?Math.min(...ks):null;}
function drawCard(){
  const h=fcHost;if(!h||!document.body.contains(h))return;const deck=fcState.deck;
  if(!deck.length||fcState.i>=deck.length){
    const nd=nextDue();
    h.innerHTML=`<div class="empty">${deck.length?`Done: ${deck.length} card${deck.length===1?"":"s"} reviewed.`:"Nothing due in this deck right now."} ${nd?`Next card is due ${new Date(nd).toLocaleString(undefined,{weekday:"short",hour:"numeric",minute:"2-digit"})}.`:""}<div class="row" style="justify-content:center;margin-top:12px"><button class="btn ghost" id="fall">Review all cards anyway</button><button class="btn" id="fback">Back to setup</button></div></div>`;
    $("#fall").onclick=()=>{fcState.dueOnly=false;buildDeck();drawCard();};$("#fback").onclick=()=>V.cards();return;}
  const c=deck[fcState.i];const r=S.cards[c.k];
  h.innerHTML=`<div class="flash"><div class="tnum" style="margin-bottom:8px">${fcState.i+1} / ${deck.length} · ${r?`box ${r.b}${r.b>=MASTERED?" (mastered)":""}`:"new"}</div>
   <div class="fc ${fcState.flip?"flip":""}" id="fc" tabindex="0" role="button" aria-label="Flip card">
    <div class="side front"><div class="src">${esc(c.src)}</div><div class="term">${esc(c.f)}</div><div class="muted" style="font-size:13px">Tap to reveal</div></div>
    <div class="side back"><div class="src">${esc(c.f)}</div><div class="def">${esc(c.b)}</div></div>
   </div>
   <div class="row" style="margin-top:14px"><button class="btn ghost" id="fagain">Again</button><button class="btn" id="fgot">Got it</button><span style="flex:1"></span><button class="btn ghost" id="fskip">Skip →</button></div></div>`;
  const flip=()=>{fcState.flip=!fcState.flip;$("#fc").classList.toggle("flip",fcState.flip);};
  $("#fc").onclick=flip;
  const next=()=>{fcState.i++;fcState.flip=false;drawCard();};
  $("#fagain").onclick=()=>{S.cards[c.k]={b:0,due:Date.now()};save();fcState.deck.push(c);next();};
  $("#fgot").onclick=()=>{const b=Math.min(5,(r?r.b:0)+1);S.cards[c.k]={b,due:Date.now()+BOX_GAP[b]};save();next();};
  $("#fskip").onclick=next;
}
document.addEventListener("keydown",e=>{
  if(currentView!=="cards"||/input|textarea|select/i.test(e.target.tagName))return;
  if(e.key===" "){e.preventDefault();const f=$("#fc");if(f)f.click();}
  else if(e.key==="ArrowRight"){const b=$("#fskip");if(b)b.click();}
  else if(e.key==="1"){const b=$("#fagain");if(b)b.click();}
  else if(e.key==="2"){const b=$("#fgot");if(b)b.click();}
});

/* ---------- brain dump ---------- */
const STOP=new Set(["the","and","for","with","from","only","each","any","its","all","into","then","your","layer"]);
const keyOf=l=>{const base=l.replace(/^\s*\d+\s*[—-]\s*/,"").split(/\s+—|\s*\(/)[0].toLowerCase().replace(/[^a-z0-9/ -]/g," ");const w=base.split(/[\s/]+/).filter(x=>x.length>=3&&!STOP.has(x));return [(w.length?w:[base.trim()]).join("|")];};
const KEYOVR={eal:[["functionally"],["structurally"],["checked"],["reviewed"],["semiformally designed"],["semiformally verified"],["formally verified"]],fire:[["combustible"],["liquid"],["electric"],["metal"],["cook"]],vol:[["register"],["ram"],["temp"],["disk"],["remote"],["archiv"]],cmmi:[["initial"],["managed"],["defined"],["quantitative"],["optimiz"]],blpbiba:[["read up"],["write down"],["read down"],["write up"]],killchain:[["recon"],["weapon"],["deliver"],["exploit"],["install"],["command"],["action"]]};
const PORTS=[["20/21","FTP"],["22","SSH"],["23","Telnet"],["25","SMTP"],["49","TACACS"],["53","DNS"],["67/68","DHCP"],["80","HTTP"],["88","Kerberos"],["110","POP3"],["123","NTP"],["143","IMAP"],["161","SNMP"],["389","LDAP"],["443","HTTPS"],["445","SMB"],["500","IKE"],["514","Syslog"],["636","LDAPS"],["1812","RADIUS"],["3389","RDP"]];
const DUMPS=[
 {id:"formulas",title:"Risk and recovery formulas",ord:false,items:[["SLE = AV × EF",["sle","av","ef"]],["ALE = SLE × ARO",["ale","aro"]],["Safeguard value = ALE before − ALE after − annual cost",["cost"]],["RTO + WRT ≤ MTD",["rto","wrt","mtd"]],["Availability = MTBF ÷ (MTBF + MTTR)",["mtbf","mttr"]],["Symmetric keys = n(n−1)/2",["n(n-1)/2"]],["Asymmetric keys = 2n",["2n"]]]},
 {id:"ports",title:"Key ports (port and service)",ord:false,items:PORTS.map(p=>[`${p[0]} ${p[1]}`,[p[0].split("/")[0],p[1].toLowerCase()]])},
 ...["osi","rmf","csf","bcp","irc","ir61","vol","drtest","eal","cmmi","killchain","ethics","policy","fire","sanit","classgov","pentest","sdlc","blpbiba"].map(id=>{const m=MODELS.find(x=>x.id===id);
   return {id,title:m.name,ord:m.ord,mn:m.mn,items:m.steps.map((s,i)=>[s[0]+(s[1]?` — ${s[1]}`:""),KEYOVR[id]?KEYOVR[id][i]:keyOf(s[0])])};}),
];
const normT=s=>s.toLowerCase().replace(/[−–—]/g,"-").replace(/×/g,"x");
function checkDump(d,text){
  const t=normT(text),tn=t.replace(/\s+/g,"");
  const find=k=>{const kk=normT(k);if(kk.includes("("))return tn.indexOf(kk.replace(/\s+/g,""));const ps=kk.split("|").map(a=>t.search(new RegExp("(^|[^a-z0-9])"+a.replace(/[.*+?^${}()[\]\\]/g,"\\$&")))).filter(x=>x>=0);return ps.length?ps[0]:-1;};
  const res=d.items.map(([label,keys])=>{const pos=keys.map(find);
    return {label,found:pos.every(p=>p>=0),at:Math.max(...pos)};});
  const got=res.filter(r=>r.found);let inOrder=true;for(let i=1;i<got.length;i++)if(got[i].at<got[i-1].at)inOrder=false;
  return {res,score:got.length,inOrder};
}
S.dump=S.dump||{};
let dumpTimer=null;
V.dump=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Brain Dump</h2><p class="lede">Many candidates write out formulas and sequences on the test centre's note board as soon as the exam starts. Practise doing it from memory: type each one, then <b>Check</b> to see what you got, and whether it's in order.</p>
   <div class="row"><button class="btn" id="dumpTimer">Start a 10-minute timed dump</button><span class="timer" id="dumpClock" hidden></span><span style="flex:1"></span><button class="chip" id="dumpClear">Clear all my answers</button></div></div>
   <div class="dgrid">${DUMPS.map(d=>`<section class="dumpc" id="dump-${d.id}"><h3>${esc(d.title)}</h3>
     <textarea id="dt-${d.id}" rows="${Math.min(8,Math.max(4,d.items.length))}" placeholder="${d.ord?"One per line, in order…":"One per line…"}" aria-label="${esc(d.title)}">${esc(S.dump[d.id]||"")}</textarea>
     <div class="row" style="margin-top:8px"><button class="btn ghost" data-check="${d.id}">Check</button><button class="chip" data-show="${d.id}">Show answer</button></div>
     <div class="dres" id="dr-${d.id}"></div></section>`).join("")}</div></div>`;
  DUMPS.forEach(d=>{const ta=$("#dt-"+d.id);ta.oninput=()=>{S.dump[d.id]=ta.value;save();};});
  $$("[data-check]",app).forEach(b=>b.onclick=()=>{const d=DUMPS.find(x=>x.id===b.dataset.check);const r=checkDump(d,$("#dt-"+d.id).value);
    $("#dr-"+d.id).innerHTML=`<div class="tnum" style="margin:10px 0 6px">${r.score} / ${d.items.length}${d.ord&&r.score>1?(r.inOrder?" · in order":" · <span style='color:var(--bad)'>order is off</span>"):""}</div><ul class="dlist">${r.res.map(x=>`<li class="${x.found?"ok":"miss"}">${x.found?"✓":"✗"} ${esc(x.label)}</li>`).join("")}</ul>${d.mn?`<p class="muted" style="font-size:13px;margin:6px 0 0">Mnemonic: ${esc(d.mn)}</p>`:""}`;});
  $$("[data-show]",app).forEach(b=>b.onclick=()=>{const d=DUMPS.find(x=>x.id===b.dataset.show);
    $("#dr-"+d.id).innerHTML=`<${d.ord?"ol":"ul"} class="dlist ans">${d.items.map(x=>`<li>${esc(x[0])}</li>`).join("")}</${d.ord?"ol":"ul"}>${d.mn?`<p class="muted" style="font-size:13px;margin:6px 0 0">Mnemonic: ${esc(d.mn)}</p>`:""}`;});
  $("#dumpClear").onclick=()=>{const c=$("#dumpClear");c.outerHTML=`<span style="font-size:14px">Clear everything you've typed?</span><button class="chip" id="dcy">Yes</button><button class="chip" id="dcn">No</button>`;$("#dcy").onclick=()=>{S.dump={};save();V.dump();};$("#dcn").onclick=()=>V.dump();};
  $("#dumpTimer").onclick=()=>{clearInterval(dumpTimer);const end=Date.now()+600000;const el=$("#dumpClock");el.hidden=false;
    const tick=()=>{const l=Math.max(0,end-Date.now());el.textContent=`${Math.floor(l/60000)}:${String(Math.floor(l%60000/1000)).padStart(2,"0")}`;el.classList.toggle("warn",l<60000);if(!l){clearInterval(dumpTimer);el.textContent="Time's up — check your answers";}};tick();dumpTimer=setInterval(tick,1000);};
};

/* ---------- exam day & resources ---------- */
const LINKS=[
 ["Official","ISC2 CISSP exam outline","https://www.isc2.org/certifications/cissp/cissp-exam-outline","Domains and weights; the source of truth for what's tested."],
 ["Official","ISC2 exam day guide","https://www.isc2.org/exams/exam-day","Check-in, ID, breaks and test centre rules. Read this the week of your exam."],
 ["Official","ISC2 CISSP certification page","https://www.isc2.org/certifications/cissp","Experience requirements, endorsement and maintenance."],
 ["Video","Destination Certification MindMaps (free)","https://destcert.com/cissp-mindmaps/","30 short videos that map each domain; great for a final pass."],
 ["Video","Destination Certification on YouTube","https://www.youtube.com/c/DestinationCertification/","The MindMaps plus exam-strategy videos."],
 ["Video","CISSP Exam Cram — Pete Zerger","https://www.youtube.com/results?search_query=CISSP+Exam+Cram+full+course+Inside+Cloud+and+Security","Full-course cram on the Inside Cloud and Security channel (opens a YouTube search)."],
 ["Video","“Why you WILL pass the CISSP” — Kelly Handerhan","https://www.youtube.com/results?search_query=Kelly+Handerhan+why+you+will+pass+the+CISSP","The classic manager-mindset talk (opens a YouTube search)."],
 ["Podcast","Kelly Handerhan on the Cybrary Podcast","https://www.cybrary.it/podcast/a-humanizing-approach-to-passing-the-cissp-exam-with-kelly-handerhan-the-cybrary-podcast-ep-69","Mindset and approach to the exam."],
 ["Community","r/cissp","https://www.reddit.com/r/cissp/","Recent pass/fail write-ups; useful for what the current exam feels like."],
 ["Reference","OWASP Top 10:2025","https://top10.owasp.org/2025/","Current web application risk list."],
 ["Reference","NIST Cybersecurity Framework 2.0","https://www.nist.gov/cyberframework","Govern, Identify, Protect, Detect, Respond, Recover."],
];
V.examday=()=>{
  const n=daysLeft();
  app.innerHTML=`<div class="stack">
   <div><h2>Exam Day</h2><p class="lede">What to expect at the test centre and after you pass. Rules change, so confirm the details on ISC2's exam day page and in your Pearson VUE confirmation email${n!=null&&n>=0&&n<=7?" this week":""}.</p></div>
   <div class="grid2">
    <div class="card"><h3>The week before</h3><ul class="bl">
     <li>Make sure the name on your Pearson VUE booking <b>exactly</b> matches your ID. Third-party guides say mismatches can't be fixed on the day.</li>
     <li>Check your ID requirements. Guides commonly report ISC2 asks for two IDs: a primary with photo and signature, and a secondary with signature. Confirm on ISC2's page.</li>
     <li>Know the route and parking; plan to arrive about 30 minutes early.</li>
     <li>Stop heavy studying the evening before. Sleep beats one more practice test.</li></ul></div>
    <div class="card"><h3>At the test centre</h3><ul class="bl">
     <li>Expect check-in with ID, photo, and usually a palm-vein scan. Phones, watches and bags go in a locker.</li>
     <li>You'll get an erasable note board and marker. This is where a brain dump goes.</li>
     <li>Reports say breaks are allowed but <b>the clock keeps running</b>, and you can't leave the building.</li></ul></div>
    <div class="card"><h3>During the exam</h3><ul class="bl">
     <li>CAT: 100–150 questions in 3 hours, including 25 unscored. It can stop at any point from question 100; stopping early doesn't mean you failed.</li>
     <li>No going back. Pick the best answer, commit, move on.</li>
     <li>Pace: about 1 minute per question leaves a buffer. Glance at the clock every 25 questions.</li>
     <li>Read the last sentence first: FIRST, BEST, MOST, LEAST decide the answer.</li>
     <li>Think like a manager: people first, then risk, policy and process.</li></ul></div>
    <div class="card"><h3>After the exam</h3><ul class="bl">
     <li>You get a printed unofficial result at check-out. Passing shows no score; failing shows domain-level feedback.</li>
     <li>If you need a retake, guides report waits of 30 days after the first attempt, 60 after the second and 90 after that, with up to 4 attempts in 12 months.</li></ul></div>
    <div class="card"><h3>After you pass</h3><ul class="bl">
     <li><b>Endorsement:</b> submit within 9 months of your exam date, endorsed by an ISC2-certified member in good standing.</li>
     <li><b>Experience:</b> 5 years of paid work in at least two of the eight domains; a degree or approved credential can waive one year.</li>
     <li><b>Not enough experience yet?</b> You become an Associate of ISC2 and have 6 years to earn it.</li>
     <li><b>Keeping it:</b> 120 CPE credits per 3-year cycle (about 40 a year recommended), plus an annual maintenance fee. Check the current fee with ISC2.</li></ul></div>
   </div>
   <div class="card"><h3>Resources</h3><p class="muted" style="font-size:14px;margin:0 0 12px">Free material people credit in recent pass write-ups. Links open in a new tab.</p>
    <div class="links">${LINKS.map(l=>`<a class="lnk" href="${l[2]}" target="_blank" rel="noopener"><span class="tag">${esc(l[0])}</span><b>${esc(l[1])}</b><span class="muted">${esc(l[3])}</span></a>`).join("")}</div></div>
  </div>`;
};

/* ---------- progress code (move between devices) ---------- */
function progressCode(){return "CCK1."+btoa(unescape(encodeURIComponent(JSON.stringify(S))));}
function loadProgressCode(code){
  const c=code.trim();if(!c.startsWith("CCK1."))throw new Error("That doesn't look like a progress code. It should start with CCK1.");
  const obj=JSON.parse(decodeURIComponent(escape(atob(c.slice(5)))));
  if(typeof obj!=="object"||!obj.q)throw new Error("The code is incomplete. Copy the whole code and try again.");
  S=Object.assign({q:{},cards:{},exams:[],drill:{},dump:{}},obj);save();applySkin(S.skin);
}

/* ---------- global search ---------- */
let INDEX=null;
function buildIndex(){
  INDEX=[];
  ACR.forEach(x=>INDEX.push({tag:`Acronym · D${x.d||"–"}`,h:`<b class="mono" style="color:var(--accent)">${esc(x.a)}</b> — ${esc(x.f)}${x.n?`<div class="muted">${esc(x.n)}</div>`:""}`,t:x.a+" "+x.f+" "+x.n,w:x.a}));
  BODIES.forEach(b=>INDEX.push({tag:"Regulatory body",h:`<b>${esc(b.n)}</b> — ${esc(b.f)} (${esc(b.r)})<div>${esc(b.w)}</div>`,t:Object.values(b).join(" "),w:b.n}));
  LAWS.forEach(b=>INDEX.push({tag:"Law / regulation",h:`<b>${esc(b.n)}</b> — ${esc(b.f)} (${esc(b.r)})<div>${esc(b.w)}</div><div class="muted">${esc(b.x)}</div>`,t:Object.values(b).join(" "),w:b.n}));
  MODELS.forEach(m=>INDEX.push({tag:`Model · D${m.d}`,h:`<b>${esc(m.name)}</b> — <i>${esc(m.mn)}</i><div>${m.steps.map(x=>esc(x[0])).join(" → ")}</div>`,t:m.name+" "+m.mn+" "+m.steps.map(x=>x.join(" ")).join(" "),w:m.name}));
  STANDARDS.forEach(b=>INDEX.push({tag:"Standard",h:`<b>${esc(b.n)}</b> — ${esc(b.w)}`,t:b.n+" "+b.w,w:b.n}));
  DOMAINS.forEach(d=>CHEAT[d.id].forEach(bl=>bl[1].forEach(x=>INDEX.push({tag:`Cheat sheet · D${d.id} · ${bl[0]}`,h:x,t:strip(x),w:""}))));
  REV.forEach(r=>{r.review.forEach(c=>INDEX.push({tag:`Study set · D${r.id}`,h:`<b>${esc(c.t)}</b> — ${esc(c.d)}`,t:c.t+" "+c.d,w:c.t}));r.topics.forEach(c=>INDEX.push({tag:`Concept · D${r.id}`,h:`<b>${esc(c.t)}</b> — ${esc(c.d)}`,t:c.t+" "+c.d,w:c.t}));});
}
function search(q){
  if(!INDEX)buildIndex();
  const ql=q.toLowerCase();
  const hits=INDEX.filter(x=>x.t.toLowerCase().includes(ql)).map(x=>({x,s:(x.w&&x.w.toLowerCase()===ql?0:x.w&&x.w.toLowerCase().startsWith(ql)?1:2)})).sort((a,b)=>a.s-b.s).slice(0,80);
  app.innerHTML=`<div class="stack"><div><h2>Results for “${esc(q)}”</h2><p class="lede">${hits.length===80?"Top 80 matches":hits.length+" matches"} across acronyms, regulators, the cheat sheet and the study set. Clear the search box to go back.</p></div>
   <div class="results">${hits.map(h=>`<div class="res"><div class="tag">${esc(h.x.tag)}</div>${hlHTML(h.x.h,q)}</div>`).join("")||`<div class="empty">Nothing found. Try a shorter term.</div>`}</div></div>`;
}
let st;
$("#gsearch").addEventListener("input",e=>{clearTimeout(st);const q=e.target.value.trim();st=setTimeout(()=>{if(q.length>=2){if(stopActive){stopActive();stopActive=null;}search(q);$$("#tabs a, #subtabs a").forEach(a=>a.classList.remove("on"));}else route();},160);});

/* ---------- navigation ---------- */
const SECTIONS={learn:[["cheat","Cheat Sheet"],["acronyms","Acronyms",1],["regs","Laws & Bodies",1],["models","Models & Mnemonics"]],practice:[["quiz","Quiz"],["drill","Drills"],["exam","Practice Test"],["cards","Flashcards"],["dump","Brain Dump"]]};
const secOf=v=>v==="plan"?"plan":v==="examday"?"examday":SECTIONS.learn.some(x=>x[0]===v)?"learn":"practice";
function drawNav(){
  const sec=secOf(currentView);if(sec==="learn"||sec==="practice"){S.prefs["last_"+sec]=currentView;save();}
  $$("#tabs a").forEach(a=>{a.classList.toggle("on",a.dataset.sec===sec);if(a.dataset.sec==="learn"||a.dataset.sec==="practice")a.setAttribute("href","#"+(S.prefs["last_"+a.dataset.sec]||SECTIONS[a.dataset.sec][0][0]));});
  const sub=$("#subtabs");const list=SECTIONS[sec];sub.hidden=!list;
  if(list){sub.innerHTML=list.map(x=>`<a href="#${x[0]}" class="${x[0]===currentView?"on":""}">${esc(x[1])}${x[2]?'<span class="pip"></span>':""}</a>`).join("");const on=$("a.on",sub);if(on)on.scrollIntoView({block:"nearest",inline:"nearest"});}
}
/* ---------- routing ---------- */
let currentView="plan";
function route(){
  let v=(location.hash||"#plan").slice(1);
  if(v==="smart"){pendingSmart=true;v="quiz";}
  const dm=v.match(/^drill-(\w+)$/);if(dm){drillState.mode=dm[1];v="drill";}
  currentView=V[v]?v:"plan";
  if(stopActive){stopActive();stopActive=null;}
  clearInterval(dumpTimer);
  const gs=$("#gsearch");if(gs.value){gs.value="";}
  drawNav();
  V[currentView]();window.scrollTo({top:0});
}
window.addEventListener("hashchange",route);
$("#setupBtn").onclick=()=>openSetup(false);
$("#themeBtn").onclick=e=>openThemePicker(e.currentTarget);
countdown();route();
if(!S.profile||!S.profile.done)openSetup(true);
})();
