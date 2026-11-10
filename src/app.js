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
const MODEL_ITEMS=MODELS.filter(m=>m.ord).map(m=>({id:"m:"+m.id,d:m.d,type:"order",q:`Put in order: ${m.name}`,items:m.steps.map(x=>x[0]),ex:`Mnemonic: ${m.mn}`}));
const QS=[...QUESTIONS.map((q,i)=>({id:"q"+i,d:q[0],type:"single",q:q[1],ans:q[2][0],opts:q[2],ex:q[3]})),
  ...ADVANCED.map((a,i)=>a.type==="multi"?{id:"a"+i,d:a.d,type:"multi",q:a.q,opts:[...a.correct,...a.wrong],correct:a.correct,ex:a.ex}:{id:"a"+i,d:a.d,type:a.type,q:a.q,pairs:a.pairs,ex:a.ex}),
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
function countdown(){
  const now=new Date();const days=Math.ceil((new Date(2026,10,16)-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5);
  $("#countdown").textContent=days>1?`T-${days} days · exam Mon 16 Nov`:days===1?"T-1 · exam tomorrow":days===0?"T-0 · exam day":"";
}

/* ---------- quiz engine ---------- */
// item types: single {opts,ans} · multi {opts,correct:[...]} · order {items} · match {pairs}
function ansText(it){
  if(it.type==="multi")return it.correct.join(" · ");
  if(it.type==="order")return it.items.map((x,i)=>`${i+1}. ${x}`).join("  ");
  if(it.type==="match")return it.pairs.map(p=>`${p[0]} → ${p[1]}`).join(" · ");
  return it.ans;
}
function typeLabel(it){return it.type==="multi"?"Multi-select":it.type==="order"?"Put in order":it.type==="match"?"Matching":"";}
function runQuiz(host,items,cfg){
  let i=0,right=0;const log=[];let timerId=null;const exam=cfg.exam;
  const end=exam?Date.now()+cfg.minutes*60000:0;
  const order=items.map(it=>{const t=it.type||"single";const o={...it,type:t};
    if(t==="single"||t==="multi")o.shuffled=shuffle(it.opts);
    if(t==="order"){let s=shuffle(it.items);let g=0;while(s.join("|")===it.items.join("|")&&g++<10)s=shuffle(it.items);o.cur=s;}
    if(t==="match")o.rights=shuffle(it.pairs.map(p=>p[1]));
    return o;});
  function tick(){const el=$("#timer",host);if(!el)return;const left=Math.max(0,end-Date.now());const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);el.textContent=`${m}:${String(s).padStart(2,"0")}`;el.classList.toggle("warn",left<5*60000);if(left<=0){clearInterval(timerId);finish(true);}}
  function body(it){
    if(it.type==="single"||it.type==="multi")return `<div class="opts" role="${it.type==="multi"?"group":"radiogroup"}">${it.shuffled.map((o,k)=>`<button class="opt ${it.type==="multi"?"multi":""}" data-k="${k}" aria-pressed="false"><span class="k">${it.type==="multi"?'<span class="box"></span>':"ABCDEF"[k]}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
    if(it.type==="order")return `<ol class="ordlist" id="ordlist">${it.cur.map((x,k)=>`<li data-k="${k}"><span class="ordtxt">${esc(x)}</span><span class="ordbtns"><button class="mv" data-dir="-1" data-k="${k}" aria-label="Move up" ${k===0?"disabled":""}>↑</button><button class="mv" data-dir="1" data-k="${k}" aria-label="Move down" ${k===it.cur.length-1?"disabled":""}>↓</button></span></li>`).join("")}</ol>`;
    if(it.type==="match")return `<div class="matchgrid">${it.pairs.map((p,k)=>`<label class="mrow" for="m${k}"><span class="ml">${esc(p[0])}</span><select id="m${k}" data-k="${k}"><option value="">Choose…</option>${it.rights.map(r=>`<option>${esc(r)}</option>`).join("")}</select></label>`).join("")}</div>`;
  }
  function draw(){
    const it=order[i];
    const needSubmit=exam||it.type!=="single";
    host.innerHTML=`<div class="qcard">
      <div class="progress"><i style="width:${100*i/order.length}%"></i></div>
      <div class="qmeta"><span>Question ${i+1} of ${order.length}${it.d?` · Domain ${it.d}: ${esc(DNAME[it.d])}`:""}${it.tag?` · ${esc(it.tag)}`:""}${typeLabel(it)?` · <b class="qtype">${typeLabel(it)}</b>`:""}</span>${exam?`<span class="timer" id="timer"></span>`:`<span class="tnum">${right} correct</span>`}</div>
      <p class="qtext">${esc(it.q)}</p>
      ${body(it)}
      <div id="fb"></div>
      <div class="row" id="ctl" style="margin-top:14px">${needSubmit?`<button class="btn" id="submit" ${it.type==="order"?"":"disabled"}>Submit answer</button>`:""}${exam?`<span class="muted" style="font-size:13px">Forward-only, like the real CAT.</span>`:""}<span style="flex:1"></span><button class="btn ghost" id="quit">End ${exam?"test":"quiz"}</button></div>
    </div>`;
    if(exam)tick();
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
  }
  function givenText(it,given){
    if(it.type==="single")return given;
    if(it.type==="multi")return given.join(" · ")||"(none)";
    if(it.type==="order")return given.map((x,k)=>`${k+1}. ${x}`).join("  ");
    if(it.type==="match")return it.pairs.map((p,k)=>`${p[0]} → ${given[k]||"?"}`).join(" · ");
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
    if(it.type==="match"){$$("select",host).forEach((s,k)=>{s.disabled=true;s.closest(".mrow").classList.add(s.value===it.pairs[k][1]?"right":"wrong");});}
    const sub=$("#submit",host);if(sub)sub.remove();
    const showKey=it.type==="order"||it.type==="match"||(it.type==="multi"&&!ok);
    $("#fb",host).innerHTML=`<div class="explain"><b class="${ok?"ok":"no"}">${ok?"Correct.":"Not quite."}</b> ${showKey&&!ok?`<div style="margin:6px 0"><b>Answer:</b> ${esc(ansText(it))}</div>`:""}${esc(it.ex||"")}</div>
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
      ${misses.length?`<div class="card"><h3>Review what you missed</h3><ol class="review">${misses.map(l=>`<li><b>${esc(l.it.q)}</b><br><span style="color:var(--bad)">Your answer: ${esc(l.given)}</span><br><span style="color:var(--good)">Correct: ${esc(ansText(l.it))}</span><br><span class="muted">${esc(l.it.ex||"")}</span></li>`).join("")}</ol></div>`:""}
    </div>`;
    $("#again",host).onclick=()=>cfg.again();
    const rd=$("#redo",host);if(rd)rd.onclick=()=>runQuiz(host,misses.map(l=>l.it),{...cfg,exam:false});
    if(cfg.scrollTop!==false)window.scrollTo({top:0});
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
   <div><h2>Mission brief</h2><p class="lede">Built from your study guide and its quick-review set, checked against the current ISC2 outline. Acronyms and regulators get their own tabs and drills. Your progress saves in this browser.</p></div>
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
 ["acr","Acronym → meaning"],["rev","Meaning → acronym"],["body","Body → what it does"],["law","Description → law"],["std","Standard → topic"],["stdrev","Topic → standard"],["mix","Mixed regulatory"]
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
  const acrPool=ACR.filter(x=>d===0||(d===-1?x.d===0:x.d===d));
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
  return items.filter(x=>x.opts.length===4);
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
let quizD=1,quizT="all";
const QTYPES=[["all","All types"],["single","Multiple choice"],["multi","Multi-select"],["dnd","Order & match"]];
V.quiz=()=>{
  const missN=QS.filter(q=>stat(q.id)[1]>stat(q.id)[0]).length;
  const cnt=t=>QS.filter(q=>t==="all"||(t==="dnd"?(q.type==="order"||q.type==="match"):q.type===t)).length;
  app.innerHTML=`<div class="stack">
   <div><h2>Domain Quiz</h2><p class="lede">${QS.length} items: scenario multiple choice, multi-select ("Choose TWO", "Select ALL that apply"), and drag-and-drop style ordering and matching. Explanation after each answer.</p>
   ${domChips(quizD,{extra:`<button class="chip ${quizD===-1?"on":""}" data-dom="-1">My misses (${missN})</button>`})}
   <div class="chips" id="qtypes" style="margin-top:10px">${QTYPES.map(t=>`<button class="chip ${quizT===t[0]?"on":""}" data-t="${t[0]}">${t[1]} <span class="w">${cnt(t[0])}</span></button>`).join("")}</div>
   <div class="row" style="margin-top:12px"><button class="btn" id="qstart">Start 10 questions</button><span class="muted" style="font-size:13px" id="qinfo"></span></div></div>
   <div id="qhost"></div></div>`;
  const info=()=>{const pool=quizPool();$("#qinfo").textContent=`${pool.length} available`;};
  info();
  $$(".chip[data-dom]",app).forEach(c=>c.onclick=()=>{quizD=+c.dataset.dom;$$(".chip[data-dom]",app).forEach(x=>x.classList.toggle("on",x===c));info();});
  $$("#qtypes .chip").forEach(c=>c.onclick=()=>{quizT=c.dataset.t;$$("#qtypes .chip").forEach(x=>x.classList.toggle("on",x===c));info();});
  const start=()=>{const pool=quizPool();const h=$("#qhost");if(!pool.length){h.innerHTML=`<div class="empty">Nothing matches that filter yet.</div>`;return;}runQuiz(h,sample(pool,10),{again:start});h.scrollIntoView({behavior:"smooth",block:"start"});};
  $("#qstart").onclick=start;
};
function quizPool(){
  let p=quizD===-1?QS.filter(q=>stat(q.id)[1]>stat(q.id)[0]):quizD===0?QS:QS.filter(q=>q.d===quizD);
  if(quizT!=="all")p=p.filter(q=>quizT==="dnd"?(q.type==="order"||q.type==="match"):q.type===quizT);
  return p;
}

/* ---------- practice test ---------- */
const LENGTHS=[[25,30,"Sprint"],[50,60,"Half"],[100,120,"Minimum length"],[150,180,"Maximum length"]];
V.exam=()=>{
  app.innerHTML=`<div class="stack">
   <div><h2>Practice Test</h2><p class="lede">Timed, mixed-domain and weighted to the official domain percentages. Forward-only with no feedback until the end, like the CAT. About 1 in 5 items are multi-select, ordering or matching. The real exam gives about 72 seconds per question at 150 items, so these use the same pace.</p>
   <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">${LENGTHS.map(l=>`<div class="card"><h4>${l[2]}</h4><div class="score" style="font-size:34px">${l[0]}</div><p class="muted" style="margin:4px 0 12px">questions · ${l[1]} minutes</p><button class="btn" data-len="${l[0]}" data-min="${l[1]}">Start</button></div>`).join("")}</div></div>
   <div id="ehost"></div></div>`;
  $$("[data-len]",app).forEach(b=>b.onclick=()=>{
    const n=+b.dataset.len,min=+b.dataset.min;
    const start=()=>{const items=weighted(n);const h=$("#ehost");app.querySelector(".stack").firstElementChild.hidden=true;stopActive=runQuiz(h,items,{exam:true,minutes:min,again:()=>{V.exam();}});window.scrollTo({top:0});};
    start();
  });
};
function weighted(n){ // ~80% multiple choice, ~20% multi-select / order / match per domain
  const out=[];const byD={};QS.forEach(q=>{const g=q.type==="single"?"s":"a";((byD[q.d]=byD[q.d]||{s:[],a:[]})[g]).push(q);});
  DOMAINS.forEach(d=>{const k=Math.round(n*d.w/100);const ka=Math.min(byD[d.id].a.length,Math.max(1,Math.round(k*0.2)));out.push(...sample(byD[d.id].a,ka),...sample(byD[d.id].s,Math.min(byD[d.id].s.length,k-ka)));});
  const rest=shuffle(QS.filter(q=>!out.includes(q)));while(out.length<n&&rest.length)out.push(rest.pop());
  return shuffle(out.slice(0,n));
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

/* ---------- flashcards ---------- */
let fcState={src:"study",d:0,hideKnown:true,deck:[],i:0,flip:false};
function buildDeck(){
  let cards=[];const d=fcState.d;
  if(fcState.src==="study")REV.forEach(r=>{if(d&&r.id!==d)return;r.review.forEach(c=>cards.push({k:"s:"+r.id+":"+c.t,f:c.t,b:c.d,src:`Study set · Domain ${r.id}`}));});
  if(fcState.src==="acr")ACR.forEach(x=>{if(d&&x.d!==d)return;cards.push({k:"a:"+x.a,f:x.a,b:x.f+(x.n?` — ${x.n}`:""),src:`Acronym · Domain ${x.d||"all"}`});});
  if(fcState.src==="regs"){BODIES.forEach(b=>cards.push({k:"b:"+b.n,f:b.n,b:`${b.f} (${b.r}). ${b.w}`,src:"Body"}));LAWS.forEach(b=>cards.push({k:"l:"+b.n,f:b.n,b:`${b.f} (${b.r}). ${b.w} ${b.x}`,src:"Law"}));STANDARDS.forEach(b=>cards.push({k:"t:"+b.n,f:b.n,b:b.w,src:"Standard"}));}
  if(fcState.src==="models")MODELS.forEach(m=>{if(d&&m.d!==d)return;cards.push({k:"m:"+m.id,f:m.name,b:`${m.mn}\n\n${m.steps.map((x,i)=>(m.ord?(i+1)+". ":"• ")+x[0]).join("\n")}`,src:`Model · Domain ${m.d}`});});
  if(fcState.hideKnown)cards=cards.filter(c=>!S.cards[c.k]);
  fcState.deck=shuffle(cards);fcState.i=0;fcState.flip=false;
}
V.cards=()=>{
  buildDeck();
  const known=Object.keys(S.cards).length;
  app.innerHTML=`<div class="stack">
   <div><h2>Flashcards</h2><p class="lede">Tap the card to flip it. Mark <b>Got it</b> to retire a card, or <b>Again</b> to keep it in rotation. Keys: space flips, → next, 1 again, 2 got it.</p>
   <div class="chips" id="fsrc">${[["study",`Study set (${REV.reduce((a,r)=>a+r.review.length,0)})`],["acr",`Acronyms (${ACR.length})`],["regs",`Laws & bodies (${BODIES.length+LAWS.length+STANDARDS.length})`],["models",`Models & mnemonics (${MODELS.length})`]].map(s=>`<button class="chip ${fcState.src===s[0]?"on":""}" data-s="${s[0]}">${esc(s[1])}</button>`).join("")}</div>
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
  MODELS.forEach(m=>INDEX.push({tag:`Model · D${m.d}`,h:`<b>${esc(m.name)}</b> — <i>${esc(m.mn)}</i><div>${m.steps.map(x=>esc(x[0])).join(" → ")}</div>`,t:m.name+" "+m.mn+" "+m.steps.map(x=>x.join(" ")).join(" "),w:m.name}));
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
