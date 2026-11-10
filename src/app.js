(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const strip=s=>String(s).replace(/<[^>]+>/g,"");
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const sample=(a,n)=>shuffle(a).slice(0,n);
const app=$("#app");
const EXAM_DATE=new Date(2026,10,16,9,0,0);
const DNAME=Object.fromEntries(DOMAINS.map(d=>[d.id,d.name]));

/* ---------- storage (per-viewer convenience) ---------- */
const KEY="cissp-cram-v1";
let S={q:{},cards:{},exams:[],drill:{}};
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(S,JSON.parse(raw));}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};

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
const QS=QUESTIONS.map((q,i)=>({id:"q"+i,d:q[0],q:q[1],ans:q[2][0],opts:q[2],ex:q[3]}));

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
  DOMAINS.forEach(d=>{h+=`<button class="chip ${sel===d.id?"on":""}" data-dom="${d.id}">${d.id} · ${d.code}<span class="w">${d.w}%</span></button>`;});
  if(opts.extra)h+=opts.extra;
  return `<div class="chips">${h}</div>`;
}
function countdown(){
  const now=new Date();const days=Math.ceil((new Date(2026,10,16)-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5);
  $("#countdown").textContent=days>1?`${days} days to exam · Mon Nov 16`:days===1?"Exam tomorrow":days===0?"Exam day":"";
}

/* ---------- quiz engine ---------- */
// items: {id,d,q,opts:[...],ans,ex,tag}
function runQuiz(host,items,cfg){
  let i=0,right=0;const log=[];let picked=null;let timerId=null;const exam=cfg.exam;
  const end=exam?Date.now()+cfg.minutes*60000:0;
  const order=items.map(it=>({...it,shuffled:shuffle(it.opts)}));
  function tick(){const el=$("#timer",host);if(!el)return;const left=Math.max(0,end-Date.now());const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=`${m}:${String(s).padStart(2,"0")}`;el.classList.toggle("warn",left<5*60000);if(left<=0){clearInterval(timerId);finish(true);}}
  function draw(){
    const it=order[i];picked=null;
    host.innerHTML=`<div class="qcard">
      <div class="progress"><i style="width:${100*i/order.length}%"></i></div>
      <div class="qmeta"><span>Question ${i+1} of ${order.length}${it.d?` · Domain ${it.d}: ${esc(DNAME[it.d])}`:""}${it.tag?` · ${esc(it.tag)}`:""}</span>${exam?`<span class="timer" id="timer"></span>`:`<span class="tnum">${right} correct</span>`}</div>
      <p class="qtext">${esc(it.q)}</p>
      <div class="opts">${it.shuffled.map((o,k)=>`<button class="opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>
      <div id="fb"></div>
      <div class="row" style="margin-top:14px">${exam?`<button class="btn" id="submit" disabled>Submit answer</button><span class="muted" style="font-size:13px">Forward-only, like the real CAT.</span>`:""}<span style="flex:1"></span><button class="btn ghost" id="quit">End ${exam?"test":"quiz"}</button></div>
    </div>`;
    if(exam)tick();
    $$(".opt",host).forEach(b=>b.onclick=()=>{
      const k=+b.dataset.k;
      if(exam){picked=k;$$(".opt",host).forEach(x=>x.classList.toggle("picked",+x.dataset.k===k));$("#submit",host).disabled=false;return;}
      answer(k);
    });
    if(exam)$("#submit",host).onclick=()=>{if(picked!=null)answer(picked);};
    $("#quit",host).onclick=()=>finish(false);
  }
  function answer(k){
    const it=order[i];const ok=it.shuffled[k]===it.ans;if(ok)right++;
    log.push({it,ok,given:it.shuffled[k]});
    if(it.id&&it.id[0]==="q"){const s=stat(it.id);s[ok?0:1]++;S.q[it.id]=s;save();}
    if(cfg.onAnswer)cfg.onAnswer(it,ok);
    if(exam){i++;i<order.length?draw():finish(false);return;}
    $$(".opt",host).forEach(b=>{b.disabled=true;const t=it.shuffled[+b.dataset.k];if(t===it.ans)b.classList.add("right");else if(+b.dataset.k===k)b.classList.add("wrong");});
    $("#fb",host).innerHTML=`<div class="explain"><b class="${ok?"ok":"no"}">${ok?"Correct.":"Not quite."}</b> ${esc(it.ex||"")}</div>
      <div class="row" style="margin-top:12px"><button class="btn" id="next">${i+1<order.length?"Next question →":"See results"}</button></div>`;
    const nb=$("#next",host);nb.focus();nb.onclick=()=>{i++;i<order.length?draw():finish(false);};
  }
  function finish(timeout){
    clearInterval(timerId);
    const n=log.length;const pct=n?Math.round(100*right/n):0;
    const byDom={};log.forEach(l=>{const d=l.it.d||0;byDom[d]=byDom[d]||[0,0];byDom[d][l.ok?0:1]++;});
    if(exam&&n){S.exams.unshift({t:Date.now(),n,right,pct,total:order.length});S.exams=S.exams.slice(0,12);save();}
    const misses=log.filter(l=>!l.ok);
    host.innerHTML=`<div class="stack">
      <div class="card"><div class="row" style="align-items:flex-end;gap:18px">
        <div><h4>${timeout?"Time's up":"Result"}</h4><div class="score">${pct}%</div></div>
        <div><div class="tnum">${right} of ${n} correct${n<order.length?` · ${order.length-n} unanswered`:""}</div>
        ${exam?`<span class="verdict ${pct>=75?"pass":"fail"}">${pct>=75?"Exam-ready range":"Keep drilling"}</span>`:""}</div>
      </div>
      ${Object.keys(byDom).some(k=>+k)?`<div class="mast" style="margin-top:16px">${Object.keys(byDom).filter(k=>+k).sort().map(d=>{const[r,w]=byDom[d];const p=Math.round(100*r/(r+w));return `<span class="dnum">${d}</span><div class="bar ${barClass(p)}"><i style="width:${p}%"></i></div><span class="tnum">${r}/${r+w}</span>`;}).join("")}</div>`:""}
      ${exam?`<p class="muted" style="font-size:13px;margin:12px 0 0">Practice benchmark: aim for 75%+ on these to feel safe. The real exam is scaled (700/1000) and adaptive, so this isn't a direct conversion.</p>`:""}
      <div class="row" style="margin-top:16px"><button class="btn" id="again">Go again</button>${misses.length?`<button class="btn ghost" id="redo">Retry the ${misses.length} I missed</button>`:""}</div></div>
      ${misses.length?`<div class="card"><h3>Review what you missed</h3><ol class="review">${misses.map(l=>`<li><b>${esc(l.it.q)}</b><br><span style="color:var(--bad)">Your answer: ${esc(l.given)}</span><br><span style="color:var(--good)">Correct: ${esc(l.it.ans)}</span><br><span class="muted">${esc(l.it.ex||"")}</span></li>`).join("")}</ol></div>`:""}
    </div>`;
    $("#again",host).onclick=()=>cfg.again();
    const rd=$("#redo",host);if(rd)rd.onclick=()=>runQuiz(host,misses.map(l=>l.it),{...cfg,exam:false});
    window.scrollTo({top:0});
  }
  draw();
  if(exam)timerId=setInterval(tick,1000);
  return ()=>clearInterval(timerId);
}
let stopActive=null;

/* ---------- views ---------- */
const V={};

V.plan=()=>{
  const today=new Date();const ymd=d=>d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate();
  const days=[
   [new Date(2026,10,10),"Tue Nov 10",["Domain 1 cheat sheet (biggest at 16%) + Domain 1 quiz","Acronyms drill: Domains 1 & 2 (Acronym → meaning)","Laws & Bodies: read the 'who enforces what' and breach-clock tables"]],
   [new Date(2026,10,11),"Wed Nov 11",["Domains 2 & 3 cheat sheets + quizzes","Crypto block in Domain 3 twice — keys, signatures, modes","Drill: Standards → topic (NIST SP numbers)"]],
   [new Date(2026,10,12),"Thu Nov 12",["Domains 4 & 5 cheat sheets + quizzes","Ports list and OSI layers until automatic","Drill: Meaning → acronym, all domains"]],
   [new Date(2026,10,13),"Fri Nov 13",["Domains 6 & 7 cheat sheets + quizzes","Practice Test: 50 questions, timed","Retry misses; flashcards on weakest domain"]],
   [new Date(2026,10,14),"Sat Nov 14",["Domain 8 cheat sheet + quiz","Practice Test: 100 questions, timed, in one sitting","Drill: Bodies and Laws until 90%+"]],
   [new Date(2026,10,15),"Sun Nov 15",["Light day: Mindset rules, confusable pairs, misses only","Flashcards: only cards marked 'Again'","Stop by early evening. Sleep."]],
   [new Date(2026,10,16),"Mon Nov 16",["Exam. Read the mindset list once at breakfast","Bring government ID; arrive 30 min early","Pace ~1 min/question; forward-only, so commit and move on"]],
  ];
  const ex=S.exams.slice(0,5);
  app.innerHTML=`<div class="stack">
   <div><h2>Six days to Monday</h2><p class="lede">Built from your study guide and its quick-review set, checked against the current ISC2 outline. Acronyms and regulators get their own tabs and drills. Your progress saves in this browser.</p></div>
   <dl class="facts">${EXAMFACTS.map(f=>`<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join("")}</dl>
   <div class="grid2">
    <div class="card"><h3>Cram plan</h3><div class="plan">${days.map(d=>`<div class="day ${ymd(d[0])===ymd(today)?"today":""} ${d[1].startsWith("Mon")?"exam":""}"><div class="when"><b>${d[1].split(" ")[0]}</b>${d[1].split(" ").slice(1).join(" ")}</div><ul>${d[2].map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div></div>
    <div class="stack">
     <div class="card"><h3>Domain mastery</h3><p class="muted" style="font-size:13px;margin:0 0 12px">From your quiz and practice-test answers.</p>
      <div class="mast">${DOMAINS.map(d=>{const m=domainMastery(d.id);return `<span class="dnum">${d.id}</span><div><div style="font-size:13px;margin-bottom:3px">${esc(d.name)} <span class="muted">${d.w}%</span></div><div class="bar ${barClass(m.pct)}"><i style="width:${m.pct||0}%"></i></div></div><span class="tnum">${m.pct==null?"—":m.pct+"%"}<br>${m.seen}/${m.total} seen</span>`;}).join("")}</div>
      ${ex.length?`<h4 style="margin-top:16px">Recent practice tests</h4>${ex.map(e=>`<div class="tnum">${new Date(e.t).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})} · ${e.right}/${e.n} · ${e.pct}%</div>`).join("")}`:""}
     </div>
     <div class="mind"><h3>Think like a manager</h3><ol class="rules">${MINDSET.map(m=>`<li>${m}</li>`).join("")}</ol></div>
    </div>
   </div>
  </div>`;
};

V.cheat=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Cheat Sheet</h2><p class="lede">The highest-yield facts per domain. Each domain also has your study set's formulas and memory aids, collapsed.</p>${domChips(0)}</div>
   ${DOMAINS.map(d=>{const r=REV[d.id-1];return `<section class="dsec card" id="d${d.id}">
     <div class="dhead"><span class="dnum">${d.id}</span><h3 style="margin:0">${esc(d.name)}</h3><span class="wt">${d.w}% of exam</span></div>
     <div class="grid2">${CHEAT[d.id].map(b=>`<div class="blk"><h3>${esc(b[0])}</h3><ul>${b[1].map(x=>`<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>
     ${r&&r.formulas.length?`<details class="more"><summary>Formulas from your study set (${r.formulas.length})</summary><ul>${r.formulas.map(f=>`<li class="mono" style="font-size:13px">${esc(f)}</li>`).join("")}</ul></details>`:""}
     ${r&&r.aids.length?`<details class="more"><summary>Memory aids from your study set (${r.aids.length})</summary><ul>${r.aids.map(f=>`<li>${esc(f)}</li>`).join("")}</ul></details>`:""}
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
  $("#acrdrill").onclick=()=>{drillState.mode="acr";drillState.d=acrState.d;location.hash="#drill";};
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
  $("#regdrill").onclick=()=>{drillState.mode="body";location.hash="#drill";};
};

/* ---------- drills (generated) ---------- */
let drillState={mode:"acr",d:0,n:15};
const MODES=[
 ["acr","Acronym → meaning"],["rev","Meaning → acronym"],["body","Body → what it does"],["law","Description → law"],["std","Standard → topic"],["mix","Mixed regulatory"]
];
function mc(correct,pool,key){ // pick 3 distinct distractors
  const others=shuffle(pool.filter(p=>p[key]!==correct[key])).map(p=>p[key]);const out=[];for(const o of others){if(!out.includes(o)&&o!==correct[key])out.push(o);if(out.length===3)break;}return out;
}
function buildDrill(mode,d,n){
  const items=[];
  const acrPool=ACR.filter(x=>d===0||(d===-1?x.d===0:x.d===d));
  const near=(x)=>{const same=ACR.filter(y=>y.d===x.d&&y.a!==x.a);return same.length>=6?same:ACR;};
  if(mode==="acr")sample(acrPool,n).forEach(x=>items.push({d:x.d,q:`What does ${x.a} stand for?`,ans:x.f,opts:[x.f,...mc(x,near(x),"f")],ex:x.n?`${x.a} = ${x.f}. ${x.n}`:`${x.a} = ${x.f}.`,tag:"Acronym"}));
  if(mode==="rev")sample(acrPool,n).forEach(x=>items.push({d:x.d,q:`Which acronym means "${x.f}"?`,ans:x.a,opts:[x.a,...mc(x,near(x),"a")],ex:x.n?`${x.a}: ${x.n}`:"",tag:"Acronym"}));
  const bodyQ=b=>({d:1,q:`Which body: ${b.w}`,ans:b.n,opts:[b.n,...mc(b,BODIES,"n")],ex:`${b.n} = ${b.f} (${b.r}). ${b.x}`,tag:"Body"});
  const lawQ=b=>({d:1,q:`Which law or regulation: ${b.w}`,ans:b.n,opts:[b.n,...mc(b,LAWS,"n")],ex:`${b.n} = ${b.f} (${b.r}). ${b.x}`,tag:"Law"});
  const stdQ=b=>({d:1,q:`What is ${b.n}?`,ans:b.w,opts:[b.w,...mc(b,STANDARDS,"w")],ex:"",tag:"Standard"});
  const enfQ=e=>({d:1,q:`Who enforces or oversees ${e[0]}?`,ans:e[1],opts:[e[1],...shuffle(ENFORCE.filter(x=>x[1]!==e[1]).map(x=>x[1])).slice(0,3)],ex:"",tag:"Enforcement"});
  if(mode==="body")sample(BODIES,n).forEach(b=>items.push(bodyQ(b)));
  if(mode==="law")sample(LAWS,n).forEach(b=>items.push(lawQ(b)));
  if(mode==="std")sample(STANDARDS,n).forEach(b=>items.push(stdQ(b)));
  if(mode==="mix"){const all=[...BODIES.map(bodyQ),...LAWS.map(lawQ),...STANDARDS.map(stdQ),...ENFORCE.map(enfQ)];sample(all,n).forEach(x=>items.push(x));}
  return items;
}
V.drill=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Drills</h2><p class="lede">Fast multiple-choice rounds generated from the acronym and regulator tables. Distractors come from the same domain, so they get harder than they look.</p>
   <div class="chips" id="modes">${MODES.map(m=>`<button class="chip ${drillState.mode===m[0]?"on":""}" data-m="${m[0]}">${m[1]}</button>`).join("")}</div>
   <div id="ddom" style="margin-top:10px"></div>
   <div class="row" style="margin-top:12px"><span class="muted" style="font-size:14px">Questions per round</span>${[10,15,25,40].map(k=>`<button class="chip ${drillState.n===k?"on":""}" data-n="${k}">${k}</button>`).join("")}<span style="flex:1"></span><button class="btn" id="dstart">Start round</button></div></div>
   <div id="dhost"></div></div>`;
  const drawDom=()=>{const show=drillState.mode==="acr"||drillState.mode==="rev";$("#ddom").innerHTML=show?domChips(drillState.d,{extra:`<button class="chip ${drillState.d===-1?"on":""}" data-dom="-1">AI &amp; cross-domain</button>`}):"";
    $$("#ddom .chip").forEach(c=>c.onclick=()=>{drillState.d=+c.dataset.dom;drawDom();});};
  drawDom();
  $$("#modes .chip").forEach(c=>c.onclick=()=>{drillState.mode=c.dataset.m;$$("#modes .chip").forEach(x=>x.classList.toggle("on",x===c));drawDom();});
  $$("[data-n]",app).forEach(c=>c.onclick=()=>{drillState.n=+c.dataset.n;$$("[data-n]",app).forEach(x=>x.classList.toggle("on",x===c));});
  const start=()=>{const items=buildDrill(drillState.mode,drillState.d,drillState.n);const h=$("#dhost");if(!items.length){h.innerHTML=`<div class="empty">No items for that filter.</div>`;return;}runQuiz(h,items,{again:start});h.scrollIntoView({behavior:"smooth",block:"start"});};
  $("#dstart").onclick=start;
};

/* ---------- domain quiz ---------- */
let quizD=1;
V.quiz=()=>{
  const missN=QS.filter(q=>stat(q.id)[1]>stat(q.id)[0]).length;
  app.innerHTML=`<div class="stack">
   <div><h2>Domain Quiz</h2><p class="lede">Scenario questions written in the exam's style, with an explanation after each answer. ${QS.length} questions in the bank.</p>
   ${domChips(quizD,{extra:`<button class="chip ${quizD===-1?"on":""}" data-dom="-1">My misses (${missN})</button>`})}
   <div class="row" style="margin-top:12px"><button class="btn" id="qstart">Start 10 questions</button><span class="muted" style="font-size:13px" id="qinfo"></span></div></div>
   <div id="qhost"></div></div>`;
  const info=()=>{const pool=quizPool();$("#qinfo").textContent=`${pool.length} available`;};
  info();
  $$(".chip[data-dom]",app).forEach(c=>c.onclick=()=>{quizD=+c.dataset.dom;$$(".chip[data-dom]",app).forEach(x=>x.classList.toggle("on",x===c));info();});
  const start=()=>{const pool=quizPool();const h=$("#qhost");if(!pool.length){h.innerHTML=`<div class="empty">Nothing here yet. Miss a few questions first.</div>`;return;}runQuiz(h,sample(pool,10),{again:start});h.scrollIntoView({behavior:"smooth",block:"start"});};
  $("#qstart").onclick=start;
};
function quizPool(){if(quizD===-1)return QS.filter(q=>stat(q.id)[1]>stat(q.id)[0]);if(quizD===0)return QS;return QS.filter(q=>q.d===quizD);}

/* ---------- practice test ---------- */
const LENGTHS=[[25,30,"Sprint"],[50,60,"Half"],[100,120,"Full pool"]];
V.exam=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Practice Test</h2><p class="lede">Timed, mixed-domain and weighted to the official domain percentages. Forward-only with no feedback until the end, like the CAT. The real exam gives about 72 seconds per question at 150 items, so these use the same pace.</p>
   <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${LENGTHS.map(l=>`<div class="card"><h4>${l[2]}</h4><div class="score" style="font-size:34px">${l[0]}</div><p class="muted" style="margin:4px 0 12px">questions · ${l[1]} minutes</p><button class="btn" data-len="${l[0]}" data-min="${l[1]}">Start</button></div>`).join("")}</div></div>
   <div id="ehost"></div></div>`;
  $$("[data-len]",app).forEach(b=>b.onclick=()=>{
    const n=+b.dataset.len,min=+b.dataset.min;
    const start=()=>{const items=weighted(n);const h=$("#ehost");app.querySelector(".stack").firstElementChild.hidden=true;stopActive=runQuiz(h,items,{exam:true,minutes:min,again:()=>{V.exam();}});window.scrollTo({top:0});};
    start();
  });
};
function weighted(n){
  const out=[];const byD={};QS.forEach(q=>(byD[q.d]=byD[q.d]||[]).push(q));
  DOMAINS.forEach(d=>{const k=Math.min(byD[d.id].length,Math.round(n*d.w/100));out.push(...sample(byD[d.id],k));});
  const rest=shuffle(QS.filter(q=>!out.includes(q)));while(out.length<n&&rest.length)out.push(rest.pop());
  return shuffle(out.slice(0,n));
}

/* ---------- flashcards ---------- */
let fcState={src:"study",d:0,hideKnown:true,deck:[],i:0,flip:false};
function buildDeck(){
  let cards=[];const d=fcState.d;
  if(fcState.src==="study")REV.forEach(r=>{if(d&&r.id!==d)return;r.review.forEach(c=>cards.push({k:"s:"+r.id+":"+c.t,f:c.t,b:c.d,src:`Study set · Domain ${r.id}`}));});
  if(fcState.src==="acr")ACR.forEach(x=>{if(d&&x.d!==d)return;cards.push({k:"a:"+x.a,f:x.a,b:x.f+(x.n?` — ${x.n}`:""),src:`Acronym · Domain ${x.d||"all"}`});});
  if(fcState.src==="regs"){BODIES.forEach(b=>cards.push({k:"b:"+b.n,f:b.n,b:`${b.f} (${b.r}). ${b.w}`,src:"Body"}));LAWS.forEach(b=>cards.push({k:"l:"+b.n,f:b.n,b:`${b.f} (${b.r}). ${b.w} ${b.x}`,src:"Law"}));STANDARDS.forEach(b=>cards.push({k:"t:"+b.n,f:b.n,b:b.w,src:"Standard"}));}
  if(fcState.hideKnown)cards=cards.filter(c=>!S.cards[c.k]);
  fcState.deck=shuffle(cards);fcState.i=0;fcState.flip=false;
}
V.cards=()=>{
  buildDeck();
  const known=Object.keys(S.cards).length;
  app.innerHTML=`<div class="stack">
   <div><h2>Flashcards</h2><p class="lede">Tap the card to flip it. Mark <b>Got it</b> to retire a card, or <b>Again</b> to keep it in rotation. Keys: space flips, → next, 1 again, 2 got it.</p>
   <div class="chips" id="fsrc">${[["study",`Study set (${REV.reduce((a,r)=>a+r.review.length,0)})`],["acr",`Acronyms (${ACR.length})`],["regs",`Laws & bodies (${BODIES.length+LAWS.length+STANDARDS.length})`]].map(s=>`<button class="chip ${fcState.src===s[0]?"on":""}" data-s="${s[0]}">${esc(s[1])}</button>`).join("")}</div>
   <div id="fdom" style="margin-top:10px">${fcState.src==="regs"?"":domChips(fcState.d)}</div>
   <div class="row" style="margin-top:10px;font-size:14px"><label class="row" style="gap:6px"><input type="checkbox" id="hidek" ${fcState.hideKnown?"checked":""}> Hide cards I've marked "Got it"</label><span class="tnum">${known} retired</span>${known?`<button class="chip" id="resetk">Reset</button>`:""}</div></div>
   <div id="fhost"></div></div>`;
  $$("#fsrc .chip").forEach(c=>c.onclick=()=>{fcState.src=c.dataset.s;fcState.d=0;V.cards();});
  $$("#fdom .chip").forEach(c=>c.onclick=()=>{fcState.d=+c.dataset.dom;V.cards();});
  $("#hidek").onchange=e=>{fcState.hideKnown=e.target.checked;V.cards();};
  const rk=$("#resetk");if(rk)rk.onclick=()=>{S.cards={};save();V.cards();};
  drawCard();
};
function drawCard(){
  const h=$("#fhost");if(!h)return;const deck=fcState.deck;
  if(!deck.length){h.innerHTML=`<div class="empty">No cards left in this set. Nice work — reset or pick another set.</div>`;return;}
  if(fcState.i>=deck.length){h.innerHTML=`<div class="empty">End of deck (${deck.length} cards). <button class="btn" id="fre">Shuffle and go again</button></div>`;$("#fre").onclick=()=>{buildDeck();drawCard();};return;}
  const c=deck[fcState.i];
  h.innerHTML=`<div class="flash"><div class="tnum" style="margin-bottom:8px">${fcState.i+1} / ${deck.length}</div>
   <div class="fc ${fcState.flip?"flip":""}" id="fc" tabindex="0" role="button" aria-label="Flip card">
    <div class="side front"><div class="src">${esc(c.src)}</div><div class="term">${esc(c.f)}</div><div class="muted" style="font-size:13px">Tap to reveal</div></div>
    <div class="side back"><div class="src">${esc(c.f)}</div><div class="def">${esc(c.b)}</div></div>
   </div>
   <div class="row" style="margin-top:14px"><button class="btn ghost" id="fagain">Again</button><button class="btn" id="fgot">Got it</button><span style="flex:1"></span><button class="btn ghost" id="fskip">Skip →</button></div></div>`;
  const flip=()=>{fcState.flip=!fcState.flip;$("#fc").classList.toggle("flip",fcState.flip);};
  $("#fc").onclick=flip;
  const next=()=>{fcState.i++;fcState.flip=false;drawCard();};
  $("#fagain").onclick=()=>{fcState.deck.push(c);next();};
  $("#fgot").onclick=()=>{S.cards[c.k]=1;save();next();};
  $("#fskip").onclick=next;
}
document.addEventListener("keydown",e=>{
  if(currentView!=="cards"||/input|textarea/i.test(e.target.tagName))return;
  if(e.key===" "){e.preventDefault();const f=$("#fc");if(f)f.click();}
  else if(e.key==="ArrowRight"){const b=$("#fskip");if(b)b.click();}
  else if(e.key==="1"){const b=$("#fagain");if(b)b.click();}
  else if(e.key==="2"){const b=$("#fgot");if(b)b.click();}
});

/* ---------- global search ---------- */
let INDEX=null;
function buildIndex(){
  INDEX=[];
  ACR.forEach(x=>INDEX.push({tag:`Acronym · D${x.d||"–"}`,h:`<b class="mono" style="color:var(--accent)">${esc(x.a)}</b> — ${esc(x.f)}${x.n?`<div class="muted">${esc(x.n)}</div>`:""}`,t:x.a+" "+x.f+" "+x.n,w:x.a}));
  BODIES.forEach(b=>INDEX.push({tag:"Regulatory body",h:`<b>${esc(b.n)}</b> — ${esc(b.f)} (${esc(b.r)})<div>${esc(b.w)}</div>`,t:Object.values(b).join(" "),w:b.n}));
  LAWS.forEach(b=>INDEX.push({tag:"Law / regulation",h:`<b>${esc(b.n)}</b> — ${esc(b.f)} (${esc(b.r)})<div>${esc(b.w)}</div><div class="muted">${esc(b.x)}</div>`,t:Object.values(b).join(" "),w:b.n}));
  STANDARDS.forEach(b=>INDEX.push({tag:"Standard",h:`<b>${esc(b.n)}</b> — ${esc(b.w)}`,t:b.n+" "+b.w,w:b.n}));
  DOMAINS.forEach(d=>CHEAT[d.id].forEach(bl=>bl[1].forEach(x=>INDEX.push({tag:`Cheat sheet · D${d.id} · ${bl[0]}`,h:x,t:strip(x),w:""}))));
  REV.forEach(r=>{r.review.forEach(c=>INDEX.push({tag:`Study set · D${r.id}`,h:`<b>${esc(c.t)}</b> — ${esc(c.d)}`,t:c.t+" "+c.d,w:c.t}));r.topics.forEach(c=>INDEX.push({tag:`Concept · D${r.id}`,h:`<b>${esc(c.t)}</b> — ${esc(c.d)}`,t:c.t+" "+c.d,w:c.t}));});
}
function search(q){
  if(!INDEX)buildIndex();
  const ql=q.toLowerCase();
  const hits=INDEX.filter(x=>x.t.toLowerCase().includes(ql)).map(x=>({x,s:(x.w&&x.w.toLowerCase()===ql?0:x.w&&x.w.toLowerCase().startsWith(ql)?1:2)})).sort((a,b)=>a.s-b.s).slice(0,80);
  app.innerHTML=`<div class="stack"><div><h2>Results for “${esc(q)}”</h2><p class="lede">${hits.length===80?"Top 80 matches":hits.length+" matches"} across acronyms, regulators, the cheat sheet and your study set. Clear the search box to go back.</p></div>
   <div class="results">${hits.map(h=>`<div class="res"><div class="tag">${esc(h.x.tag)}</div>${hlHTML(h.x.h,q)}</div>`).join("")||`<div class="empty">Nothing found. Try a shorter term.</div>`}</div></div>`;
}
let st;
$("#gsearch").addEventListener("input",e=>{clearTimeout(st);const q=e.target.value.trim();st=setTimeout(()=>{if(q.length>=2){if(stopActive){stopActive();stopActive=null;}search(q);$$("#tabs a").forEach(a=>a.classList.remove("on"));}else route();},160);});

/* ---------- routing ---------- */
let currentView="plan";
function route(){
  const v=(location.hash||"#plan").slice(1);currentView=V[v]?v:"plan";
  if(stopActive){stopActive();stopActive=null;}
  const gs=$("#gsearch");if(gs.value){gs.value="";}
  $$("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.v===currentView));
  const t=$(`#tabs a[data-v="${currentView}"]`);if(t)t.scrollIntoView({block:"nearest",inline:"nearest"});
  V[currentView]();window.scrollTo({top:0});
}
window.addEventListener("hashchange",route);
countdown();route();
})();
