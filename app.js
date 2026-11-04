/* Trainingsapp Lorenzo & Nele – v3 */
(function(){
"use strict";
// ================= CONFIG =================
const API_URL="https://script.google.com/macros/s/AKfycbwtPBd75X4si1JDTjtXuhRANLHtLvVxINloLdSGSoeFHkKMTGpovHkSwOjtiwKZRp3q/exec";
const NAMES={lor:"Lorenzo",nel:"Nele"};
const DN=["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag","Zondag"];
const MN=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
const MNF=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const KIND={upper:{l:"Upper",c:"var(--kracht)"},lower:{l:"Lower",c:"var(--grass)"},run:{l:"Run",c:"var(--run)"},rust:{l:"Rust",c:"var(--rust)"},race:{l:"Race",c:"var(--race)"},event:{l:"Event",c:"var(--kino)"}};
const RT={interval:"Interval",long:"Long run",tempo:"Tempo run",z2:"Zone 2 run",walk:"Helling wandelen"};
const RT_SHORT={interval:"Interval",long:"Long",tempo:"Tempo",z2:"Zone 2",walk:"Helling"};
const ZONES=["","Z1","Z2","Z3","Z4","Z5"];
const GROUPS={upper:["Borst","Rug","Schouders","Biceps","Triceps","Core"],lower:["Quadriceps","Hamstrings","Bilspieren","Adductoren","Kuiten","Core"]};
const QUICK=["Goed gedaan! 💪","Trots op jou ❤️","Beest! 🔥","Sterk volgehouden 👏"];
const MAXPH=4;
const EX={};OEFENINGEN.forEach(e=>{EX[e.id]=e});

// ================= HELPERS =================
const $=id=>document.getElementById(id);
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function pd(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function fd(d){return d.getDate()+" "+MN[d.getMonth()]}
function dayName(d){return DN[(d.getDay()+6)%7]}
function monday(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function todayD(){const t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
function nfmt(n,dec=1){n=Number(n)||0;const k=Math.pow(10,dec);return (Math.round(n*k)/k).toString().replace(".",",")}
function num(v){if(v===""||v==null)return null;const n=Number(String(v).replace(",","."));return isNaN(n)?null:n}
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function ago(ts){const m=Math.round((Date.now()-ts)/60000);if(m<1)return"net nu";if(m<60)return m+" min geleden";const h=Math.round(m/60);if(h<24)return h+" u geleden";return fd(new Date(ts))}
function imgSrc(id,f=0){const e=EX[id];return e?`https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@${OEF_IMG_COMMIT}/exercises/${e.src}/${f}.jpg`:""}
function imgAlt(id,f=0){const e=EX[id];return e?`https://raw.githubusercontent.com/yuhonas/free-exercise-db/${OEF_IMG_COMMIT}/exercises/${e.src}/${f}.jpg`:""}
// Valt de CDN weg, dan de foto rechtstreeks van GitHub laden
document.addEventListener("error",e=>{const im=e.target;if(im.tagName!=="IMG"||!im.dataset.ex||im.dataset.fb)return;im.dataset.fb="1";im.src=imgAlt(im.dataset.ex,+(im.dataset.fr||0))},true);
// Bewegende oefening: start- en eindpositie wisselen elkaar af (zoals een gif)
function exAnim(id,cls=""){const m=EX[id]||{n:id};return `<span class="anim ${cls}" data-info="${id}" role="img" aria-label="${esc(m.n)}: uitvoering"><img src="${imgSrc(id,0)}" data-ex="${id}" data-fr="0" alt="" loading="lazy"><img class="f1" src="${imgSrc(id,1)}" data-ex="${id}" data-fr="1" alt="" loading="lazy"></span>`}
function openExInfo(id){const m=EX[id];if(!m)return;
  $("xTitle").textContent=m.n;$("xSub").textContent=m.g+" · "+(m.seg==="core"?"Core":KIND[m.seg].l);
  $("xAnim").innerHTML=exAnim(id,"big");
  $("xSteps").innerHTML=(m.i||[]).map(t=>`<li>${esc(t)}</li>`).join("");
  $("xVideo").href="https://www.youtube.com/results?search_query="+encodeURIComponent(m.n+" exercise proper form");
  openSheet("xSheet")}
const T0=todayD(),TODAY=iso(T0);

// ================= VASTE PLANNING: KNOKKE =================
const K_START=new Date(2026,8,28);
const K_MACRO=[[12,8,"Opbouw","Basistolerantie opbouwen in het zand."],[15,9,"Opbouw","Aerobe drempel verleggen."],[18,10,"Opbouw","Pezen en gewrichten harden voor duur-impact."],[12,8,"Deload","Zenuwstelsel flushen. Minder volume."],[20,11,"Opbouw","De muur verleggen. Test hydratatie en sportvoeding."],[22,12,"Piekbelasting","Mechanische grenzen opzoeken."],[14,8,"Tapering","Volume dropt, benen laten genezen."],[25,5,"Race","Uitbetaling van de discipline."]];
const BUILTIN_GOALS=[{id:"knokke",title:"BESOX Trail Knokke 25 km",date:"2026-11-22",note:"8 weken opbouw · 3× kracht, 3× lopen, 1× rust",builtin:true}];
function knokkeDay(ds){
  const n=Math.round((pd(ds)-K_START)/864e5);if(n<0||n>55)return[];
  const w=Math.floor(n/7),i=n%7,[lsd,tempo]=K_MACRO[w];const P=(kind,title,detail,km,rt)=>({id:"k"+ds+i,date:ds,kind,title,detail,km,rt,goalId:"knokke",builtin:true});
  const out=[
    ()=>P("upper","Upper 1","Borst, rug, schouders & core. Geen spierfalen.",null),
    ()=>P("run","Interval","VO2 max op asfalt. 15 min opwarmen · 6× 800 m Z4 · 90 sec wandelen · 15 min cooldown",4.8,"interval"),
    ()=>P("lower","Lower","Squats, extensions, calf raises. Max 3 sets, max 80% 1RM. Trillen de benen? Schrappen.",null),
    ()=>w===7?P("run","Shakeout","Rustige shakeout, losse benen.",5,"z2"):P("run","Tempo run",`2 km Z2 · ${tempo-4} km Z3 · 2 km Z2`,tempo,"tempo"),
    ()=>P("upper","Upper 2","Isolatie armen, zware focus buikspieren voor mul zand.",null),
    ()=>P("rust","Absolute rust","Geen actieve recuperatie. Water, elektrolyten, koolhydraten.",null),
    ()=>w===7?P("race","BESOX Trail Knokke","Racedag. Uitbetaling van de discipline.",25,"long"):P("run","LSD trail","Onverhard, 100% Z2. Hartslag te hoog in zand: wandelen.",lsd,"long")
  ][i]();
  const res=[out];
  if(ds==="2026-11-20")res.push({id:"kino",date:ds,kind:"event",title:"Etentje Kino Gent",detail:"Beloning voor al ons harde werk",builtin:true,goalId:"knokke"});
  return res;
}
function knokkePhase(ds){const n=Math.round((pd(ds)-K_START)/864e5);if(n<0||n>55)return null;const w=Math.floor(n/7);return`Knokke · week ${w+1} · ${K_MACRO[w][2]} — ${K_MACRO[w][3]}`}

// ================= STATE =================
let who=null,pin=null,lastSeen=0;
try{who=localStorage.getItem("knokke-who");pin=localStorage.getItem("knokke-pin");lastSeen=Number(localStorage.getItem("knokke-seen-"+who))||0}catch(e){}
let W=[],C=[],G=[],P=[],TP=[],PR=[],B=[],RC=[],NT={};  // workouts, comments, goals, plan, opgeslagen workouts
let byId={};
let selDate=TODAY, viewMonth=new Date(T0.getFullYear(),T0.getMonth(),1);
const photoCache={};

function allGoals(){return BUILTIN_GOALS.concat(G).sort((a,b)=>a.date.localeCompare(b.date))}
function planOn(ds){return knokkeDay(ds).concat(P.filter(p=>p.date===ds))}
function workoutsOn(ds,p){return W.filter(w=>w.date===ds&&(!p||w.person===p)).sort((a,b)=>a.updatedAt-b.updatedAt)}
function commentsOf(id){return C.filter(c=>c.logId===id).sort((a,b)=>a.createdAt-b.createdAt)}
function planDone(item,p){const k=item.kind==="race"?"run":item.kind;if(!["upper","lower","run"].includes(k))return null;return W.some(w=>w.date===item.date&&w.person===p&&w.kind===k)}
function goalOn(ds){return allGoals().filter(g=>g.date===ds)}

// ================= WORKOUT HELPERS =================
function runKm(d){if(!d)return 0;
  if(d.rt==="interval"){let k=(num(d.wu)||0)+(num(d.cd)||0);(d.blocks||[]).forEach(b=>{if(b.mode!=="time")k+=(num(b.reps)||0)*(num(b.dist)||0)/1000});return k}
  if(d.rt==="tempo")return (num(d.wu)||0)+(num(d.tdist)||0)+(num(d.cd)||0);
  const dist=num(d.dist);if(dist)return dist;
  if(num(d.speed)&&num(d.min))return num(d.speed)*num(d.min)/60; // loopband: snelheid × tijd
  return 0}
function isTM(d){return d&&(d.env==="tm")}
function woTitle(w){const d=w.data||{};const base=w.kind==="run"?((RT[d.rt]||"Run")+(isTM(d)&&d.rt!=="walk"?" · loopband":"")):KIND[w.kind].l;const tn=w.data&&w.data.tplName;return tn?`${base} · ${tn}`:base}
function woSummary(w){const d=w.data||{};
  if(w.kind==="run"){const k=d.km!=null?d.km:runKm(d);const bits=[];if(k)bits.push(nfmt(k)+" km");
    if(d.rt==="interval"&&d.blocks&&d.blocks.length)bits.push(d.blocks.map(b=>`${b.reps||"?"}×${b.mode==="time"?(b.time||"?")+" min":(b.dist||"?")+" m"}`).join(" + "));
    if(d.rt==="tempo"&&d.tmin)bits.push(d.tmin+" min tempo"+(d.zone?" "+d.zone:""));
    if(d.rt==="long"&&d.zone)bits.push(d.zone);
    if((d.rt==="walk"||isTM(d))&&d.incline)bits.push(nfmt(d.incline)+"% helling");
    if((d.rt==="walk"||isTM(d))&&d.speed)bits.push(nfmt(d.speed)+" km/u");
    if(d.rt==="walk"&&d.min)bits.push(d.min+" min");
    return bits.join(" · ")||"Geen details"}
  const ex=d.ex||[];const sets=ex.reduce((a,e)=>a+(e.sets||[]).length,0);
  if(!ex.length)return"Geen oefeningen";
  return `${ex.length} oefening${ex.length>1?"en":""} · ${sets} sets · `+ex.slice(0,3).map(e=>EX[e.id]?EX[e.id].n:e.id).join(", ")+(ex.length>3?"…":"")}
function setsTxt(sets){return (sets||[]).map(s=>`${s.r!=null&&s.r!==""?s.r:"?"}×${s.kg!=null&&s.kg!==""?nfmt(s.kg,2)+" kg":"lg"}`).join(" · ")}
function lastFor(exId,p,beforeDate,excludeId){
  let best=null;
  W.forEach(w=>{if(w.person!==p||w.id===excludeId||(w.kind!=="upper"&&w.kind!=="lower"))return;if(w.date>beforeDate)return;
    const e=(w.data&&w.data.ex||[]).find(x=>x.id===exId);if(!e||!e.sets||!e.sets.length)return;
    if(!best||w.date>best.w.date||(w.date===best.w.date&&w.updatedAt>best.w.updatedAt))best={w,e}});
  return best}

// ================= HERO / WHO =================
function renderHero(){
  const next=allGoals().find(g=>g.date>=TODAY);
  if(next){const d=pd(next.date),left=Math.round((d-T0)/864e5);
    $("evDays").textContent=left===0?"GO":left;
    $("evUnit").textContent=left===0?"vandaag!":(left===1?"dag":"dagen");
    $("evTitle").textContent=next.title;
    $("evDate").textContent=`${dayName(d)} ${fd(d)} ${d.getFullYear()}`;
  }else{$("evDays").textContent="–";$("evUnit").textContent="";$("evTitle").textContent="Nog geen event gepland";$("evDate").textContent="Tik hier om een doel toe te voegen"}
}
$("eventCard").addEventListener("click",()=>{const el=$("goals-h");if(el)el.scrollIntoView({behavior:"smooth",block:"start"})});
function renderWho(){document.querySelectorAll(".who button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.who===who)));
  const need=!who;document.querySelector(".who").classList.toggle("need",need);$("whoLabel").classList.toggle("need",need);
  $("whoLabel").textContent=need?"Tik eerst op je naam om te kunnen loggen":"Ingelogd als "+NAMES[who]+" op dit toestel"}
document.querySelectorAll(".who button").forEach(b=>b.addEventListener("click",()=>{who=b.dataset.who;try{localStorage.setItem("knokke-who",who);lastSeen=Number(localStorage.getItem("knokke-seen-"+who))||0}catch(e){}renderWho();progP=who;render();idleStatus();draftChecked=false;checkDraft()}));

// ================= CALENDAR =================
function renderCal(){
  const y=viewMonth.getFullYear(),m=viewMonth.getMonth();
  $("mLabel").textContent=MNF[m]+" "+y;
  const start=monday(new Date(y,m,1));const grid=$("calGrid");grid.innerHTML="";
  const selWeek=iso(monday(pd(selDate)));
  for(let k=0;k<42;k++){
    const d=addDays(start,k);if(k>=35&&d.getMonth()!==m)break;
    const ds=iso(d);const pl=planOn(ds);const gl=goalOn(ds);
    const b=document.createElement("button");
    b.className="cd"+(d.getMonth()!==m?" out":"")+(ds===TODAY?" today":"")+(ds===selDate?" sel":"")+(gl.length?" goal":"");
    const lw=workoutsOn(ds,"lor").length,nw=workoutsOn(ds,"nel").length;
    b.setAttribute("aria-label",`${dayName(d)} ${fd(d)}${pl.length?", gepland: "+pl.map(p=>p.title).join(", "):""}${lw?", Lorenzo trainde":""}${nw?", Nele trainde":""}`);
    b.innerHTML=`<span class="dn">${d.getDate()}</span>${gl.length?'<span class="flag">⚑</span>':""}<span class="pl">${pl.map(p=>`<i style="background:${KIND[p.kind].c}"></i>`).join("")}</span><span class="who2"><span class="${lw?"lor":""}"></span><span class="${nw?"nel":""}"></span></span>`;
    b.addEventListener("click",()=>{selDate=ds;if(d.getMonth()!==m)viewMonth=new Date(d.getFullYear(),d.getMonth(),1);render();setTimeout(()=>{const el=document.querySelector(`[data-day="${ds}"]`);if(el)el.scrollIntoView({behavior:"smooth",block:"start"})},30)});
    grid.appendChild(b);
  }
}
$("mPrev").addEventListener("click",()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()-1,1);renderCal()});
$("mNext").addEventListener("click",()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,1);renderCal()});
$("mToday").addEventListener("click",()=>{selDate=TODAY;viewMonth=new Date(T0.getFullYear(),T0.getMonth(),1);render()});

// ================= WEEK =================
function weekStats(mon,p){let planned=0,done=0,km=0,sessions=0;
  for(let i=0;i<7;i++){const ds=iso(addDays(mon,i));
    planOn(ds).forEach(it=>{const r=planDone(it,p);if(r===null)return;planned++;if(r)done++});
    workoutsOn(ds,p).forEach(w=>{sessions++;if(w.kind==="run")km+=(w.data&&w.data.km!=null)?Number(w.data.km):runKm(w.data)})}
  return{planned,done,km,sessions}}
function renderWeek(){
  const mon=monday(pd(selDate));
  const sum=$("summary");sum.innerHTML="";
  ["lor","nel"].forEach(p=>{const s=weekStats(mon,p);const pct=s.planned?Math.round(s.done/s.planned*100):0;
    const el=document.createElement("div");el.className="pcard "+p;
    el.innerHTML=`<h3>${NAMES[p]}</h3><div class="row"><div><span class="big">${s.sessions}</span><br>trainingen deze week</div><div><span class="big">${nfmt(s.km)}</span><br>km gelopen</div>${s.planned?`<div><span class="big">${s.done}/${s.planned}</span><br>van de planning</div>`:""}</div>${s.planned?`<div class="bar"><i style="width:${pct}%"></i></div>`:""}`;
    sum.appendChild(el)});
  $("week-h").textContent=`Week van ${fd(mon)}`;
  $("week-sub").textContent=`${fd(mon)} – ${fd(addDays(mon,6))} ${addDays(mon,6).getFullYear()}`;
  const ph=knokkePhase(iso(mon))||knokkePhase(iso(addDays(mon,6)));
  $("phase").hidden=!ph;if(ph)$("phase").textContent=ph;
  const days=$("days");days.innerHTML="";
  for(let i=0;i<7;i++){
    const d=addDays(mon,i),ds=iso(d);const pl=planOn(ds);const gl=goalOn(ds);const ws=workoutsOn(ds);
    const el=document.createElement("div");el.dataset.day=ds;
    el.className="day"+(ds===TODAY?" today":"")+(gl.length?" raceday":"");
    let h=`<div class="dname"><b>${d.getDate()} ${MN[d.getMonth()]}</b><span>${DN[i]}</span>${ds===TODAY?"<em>vandaag</em>":""}</div><div class="sessions">`;
    gl.forEach(g=>{h+=`<div class="event" style="background:var(--race)"><b>⚑ ${esc(g.title)}</b><span>${esc(g.note||"Doeldag")}</span></div>`});
    pl.forEach(it=>{
      if(it.kind==="event"){h+=`<div class="event"><b>${esc(it.title)}</b><span>${esc(it.detail)}</span></div>`;return}
      h+=`<div class="plan" style="border-left-color:${KIND[it.kind].c}">${it.builtin?"":`<button class="del" data-delplan="${esc(it.id)}" aria-label="Geplande sessie verwijderen" title="Verwijderen">×</button>`}
        <div class="src">${it.builtin?"Knokke-schema":"Gepland"} · ${KIND[it.kind].l}</div>
        <div class="t"><strong>${esc(it.title)}</strong>${it.km?`<span class="km">${it.rt==="interval"?"6×800 m":nfmt(it.km)+" km"}</span>`:""}</div>
        ${it.detail?`<div class="d">${esc(it.detail)}</div>`:""}`;
      if(it.kind!=="rust"){h+=`<div class="done">`;["lor","nel"].forEach(p=>{const ok=planDone(it,p);const mine=p===who;
        h+=`<button class="tick ${p} ${ok?"ok":""}" ${mine&&!ok?`data-fromplan="${esc(it.id)}"`:"disabled"}>${ok?"✓ ":""}${NAMES[p]}${!ok&&mine?" · loggen":""}</button>`});h+=`</div>`}
      h+=`</div>`});
    if(ws.length){h+=`<div class="wlist">`;ws.forEach(w=>{const nc=commentsOf(w.id).length,np=(w.photos||[]).length;
      h+=`<button class="wo ${w.person}" data-wo="${esc(w.id)}"><span class="av" style="background:var(--${w.person})">${NAMES[w.person][0]}</span><span class="wt"><b><span class="kindtag" style="background:${KIND[w.kind].c}">${KIND[w.kind].l.toUpperCase()}</span>${esc(woTitle(w))}</b><span>${esc(woSummary(w))}</span></span><span class="bd">${w.feel?"★"+w.feel:""}${np?" 📷"+np:""}${nc?" 💬"+nc:""}</span></button>`});h+=`</div>`}
    if(!pl.length&&!ws.length&&!gl.length)h+=`<p class="dayempty">Niets gepland.</p>`;
    if(who)h+=`<button class="addbtn" data-add="${ds}">+ Training loggen</button>`;
    h+=`</div>`;el.innerHTML=h;days.appendChild(el);
  }
  days.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>openEditor({date:b.dataset.add})));
  days.querySelectorAll("[data-fromplan]").forEach(b=>b.addEventListener("click",()=>{const it=findPlan(b.dataset.fromplan);if(it){const txt=(it.title||"")+" "+(it.detail||"");openEditor({date:it.date,kind:it.kind==="race"?"run":it.kind,rt:it.rt||guessRt(txt),env:/loopband|treadmill/i.test(txt)?"tm":undefined,planKm:it.km})}}));
  days.querySelectorAll("[data-wo]").forEach(b=>b.addEventListener("click",()=>{const w=byId[b.dataset.wo];if(!w)return;if(w.person===who)openEditor({id:w.id});else openView(w.id)}));
  days.querySelectorAll("[data-delplan]").forEach(b=>b.addEventListener("click",async()=>{if(!(await ask("Deze geplande sessie van de kalender halen?",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;await run("deletePlanItems",[[b.dataset.delplan]],"Verwijderd.")}));
}
function guessRt(t){t=(t||"").toLowerCase();
  if(/helling|incline|wandel/.test(t))return"walk";
  if(/interval|\d+\s*[×x]\s*\d+|fartlek|heuvelsprint|sprints?/.test(t))return"interval";
  if(/tempo|drempel|threshold/.test(t))return"tempo";
  if(/long|lsd|duurloop|lange|race|wedstrijd/.test(t))return"long";
  return"z2"}
function findPlan(id){const it=P.find(p=>p.id===id);if(it)return it;const m=id.match(/^k(\d{4}-\d{2}-\d{2})/);if(m)return knokkeDay(m[1]).find(p=>p.id===id);return null}
$("prev").addEventListener("click",()=>{selDate=iso(addDays(pd(selDate),-7));syncMonth();render()});
$("next").addEventListener("click",()=>{selDate=iso(addDays(pd(selDate),7));syncMonth();render()});
function syncMonth(){const d=pd(selDate);viewMonth=new Date(d.getFullYear(),d.getMonth(),1)}

// ================= GOALS =================
function renderGoals(){
  const box=$("goals");const gs=allGoals();const next=gs.find(g=>g.date>=TODAY);
  if(!gs.length){box.innerHTML=`<p class="dayempty">Nog geen doelen.</p>`;return}
  box.innerHTML=gs.map(g=>{const d=pd(g.date);const left=Math.round((d-T0)/864e5);const n=P.filter(p=>p.goalId===g.id).length+(g.builtin?48:0);
    return `<div class="goal ${left<0?"past":""} ${next&&next.id===g.id?"next":""}"><div class="gd"><b>${left<0?"✓":left}</b><span>${left<0?"voorbij":left===1?"dag":"dagen"}</span></div><div class="gt"><b>${esc(g.title)}</b><span>${dayName(d)} ${fd(d)} ${d.getFullYear()}${g.builtin?" · vast schema":""}${n?` · ${n} geplande sessies`:""}${g.note?" · "+esc(g.note):""}</span></div>${g.builtin?"":`<button class="textbtn" data-editgoal="${esc(g.id)}">Bewerken</button>`}</div>`}).join("");
  box.querySelectorAll("[data-editgoal]").forEach(b=>b.addEventListener("click",()=>openGoal(b.dataset.editgoal)));
}
let goalEdit=null;
function openGoal(id){goalEdit=id||null;const g=id?G.find(x=>x.id===id):null;
  $("gTitle").textContent=g?"Doel bewerken":"Nieuw doel";$("gName").value=g?g.title:"";$("gDate").value=g?g.date:"";$("gNote").value=g?g.note:"";
  $("gDel").style.visibility=g?"visible":"hidden";openSheet("gSheet");setTimeout(()=>$("gName").focus(),50)}
$("btnNewGoal").addEventListener("click",()=>openGoal(null));
$("gForm").addEventListener("submit",async e=>{e.preventDefault();const g={id:goalEdit,title:$("gName").value.trim(),date:$("gDate").value,note:$("gNote").value.trim(),createdBy:who||""};
  if(!g.title||!g.date)return;closeSheet("gSheet");const isNew=!g.id;await run("saveGoal",[g],"Doel opgeslagen.");
  if(isNew&&G.some(x=>x.title===g.title&&x.date===g.date))push(other(),`${NAMES[who]} plande een nieuw event`,`${g.title} · ${dshort(g.date)}`)});
$("gDel").addEventListener("click",async()=>{if(!goalEdit)return;const n=P.filter(p=>p.goalId===goalEdit).length;
  if(!(await ask(`Dit doel wissen?${n?` De ${n} geplande sessies ervan verdwijnen ook van de kalender.`:""}`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;closeSheet("gSheet");await run("deleteGoal",[goalEdit],"Doel gewist.")});

// ================= PLANNING =================
let planMode="one";
const PK=[["upper","Upper"],["lower","Lower"],["run","Run"],["rust","Rust"],["race","Race / wedstrijd"],["event","Event"]];
function openPlan(){
  const gs=allGoals().filter(g=>!g.builtin&&g.date>=TODAY);
  $("plGoal").innerHTML=`<option value="">— geen specifiek doel —</option>`+gs.map(g=>`<option value="${esc(g.id)}">${esc(g.title)} (${fd(pd(g.date))})</option>`).join("");
  if(gs.length)$("plGoal").value=gs[0].id;
  $("plKind").innerHTML=PK.map(([k,l])=>`<option value="${k}">${l}</option>`).join("");
  $("plDate").value=selDate>=TODAY?selDate:TODAY;$("plTitleIn").value="";$("plKm").value="";$("plDetail").value="";
  $("plFrom").value=iso(addDays(monday(T0),7));$("plTo").value=gs.length?gs[0].date:iso(addDays(monday(T0),7*8-1));
  const rows=$("plRows");rows.innerHTML=DN.map((d,i)=>`<div class="wkr" data-i="${i}"><b>${d.slice(0,2)}</b><select aria-label="${d} soort"><option value="">—</option>${PK.filter(p=>p[0]!=="event").map(([k,l])=>`<option value="${k}">${l}</option>`).join("")}</select><input class="wt-in" maxlength="60" placeholder="Titel / uitleg" aria-label="${d} titel"><input type="number" inputmode="decimal" step="0.1" min="0" placeholder="km" aria-label="${d} km"></div>`).join("");
  rows.querySelectorAll("select,input").forEach(x=>x.addEventListener("input",planCount));
  setPlanMode("one");openSheet("plSheet")}
function setPlanMode(m){planMode=m;document.querySelectorAll("[data-pm]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.pm===m)));$("plOne").hidden=m!=="one";$("plWeek").hidden=m!=="week";planCount()}
document.querySelectorAll("[data-pm]").forEach(b=>b.addEventListener("click",()=>setPlanMode(b.dataset.pm)));
$("plGoal").addEventListener("change",()=>{const g=G.find(x=>x.id===$("plGoal").value);if(g)$("plTo").value=g.date});
["plFrom","plTo"].forEach(id=>$(id).addEventListener("input",planCount));
function weekItems(){const from=$("plFrom").value,to=$("plTo").value;if(!from||!to||to<from)return[];
  const tpl=[...$("plRows").children].map(r=>{const [s,t,k]=r.querySelectorAll("select,input");return{kind:s.value,title:t.value.trim(),km:num(k.value)}});
  const items=[];for(let d=pd(from);iso(d)<=to;d=addDays(d,1)){const t=tpl[(d.getDay()+6)%7];if(!t.kind)continue;
    items.push({date:iso(d),kind:t.kind,title:t.title||PK.find(p=>p[0]===t.kind)[1],detail:"",km:t.km})}
  return items}
function planCount(){if(planMode!=="week")return;const n=weekItems().length;$("plCount").textContent=n?`Dit zet ${n} sessies op de kalender.`:"Kies minstens één dag en een geldige periode."}
$("btnNewPlan").addEventListener("click",()=>{if(!pin)return;openPlan()});
$("plSave").addEventListener("click",async()=>{const goalId=$("plGoal").value;let items;
  if(planMode==="one"){if(!$("plDate").value){ask("Kies eerst een datum.",{alert:true});return}const k=$("plKind").value;
    items=[{date:$("plDate").value,kind:k,title:$("plTitleIn").value.trim()||PK.find(p=>p[0]===k)[1],detail:$("plDetail").value.trim(),km:num($("plKm").value)}]}
  else{items=weekItems();if(!items.length){ask("Kies minstens één dag en een geldige periode.",{alert:true});return}if(items.length>500){ask("Maximaal 500 sessies per keer.",{alert:true});return}}
  items.forEach(i=>i.goalId=goalId);closeSheet("plSheet");await run("addPlanItems",[items],`${items.length} sessie${items.length>1?"s":""} gepland.`);
  selDate=items[0].date;syncMonth();render()});

// ================= PLAN IMPORTEREN =================
const IMP_KIND={upper:"upper",bovenlichaam:"upper",kracht:"upper","kracht upper":"upper",lower:"lower",benen:"lower","kracht lower":"lower",
  run:"run",loop:"run",lopen:"run",looptraining:"run",rust:"rust",rest:"rust",race:"race",wedstrijd:"race",event:"event",evenement:"event"};
const IMP_SAMPLE=["VOLTAGE PLAN",
"# Voorbeeld van het formaat. Lijnen met # worden genegeerd.",
"# doel;naam;datum;notitie",
"doel;Voorbeeld 10 km race;2026-10-01;Testplan – na het testen mag je dit doel wissen",
"datum;soort;titel;uitleg;km",
"2026-09-24;run;Interval;15 min opwarmen · 5× 1 km Z4 · 2 min wandelen · 10 min cooldown;8",
"2026-09-25;upper;Upper;Borst, rug, schouders. Licht houden.;",
"2026-09-26;rust;Rust;;",
"2026-09-27;run;Long run;Rustig in Z2;10",
"2026-09-28;lower;Lower licht;Activatie, geen zware sets;",
"2026-09-29;run;Tempo run loopband;2 km Z2 · 3 km Z3 · 1 km Z2;6",
"2026-09-30;rust;Rust;Benen omhoog, goed eten en drinken;",
"2026-10-01;race;Voorbeeld 10 km race;Racedag – go!;10"].join("\n");
let imp=null;
function csvSplit(line,delim){const out=[];let cur="",q=false;
  for(let i=0;i<line.length;i++){const c=line[i];
    if(q){if(c==='"'){if(line[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else if(c==='"')q=true;else if(c===delim){out.push(cur);cur=""}else cur+=c}
  out.push(cur);return out.map(x=>x.trim())}
// --- datums herkennen ---
const MONTHS={jan:1,januari:1,january:1,feb:2,februari:2,february:2,mrt:3,maart:3,mar:3,march:3,apr:4,april:4,mei:5,may:5,jun:6,juni:6,june:6,jul:7,juli:7,july:7,aug:8,augustus:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,oct:10,october:10,nov:11,november:11,dec:12,december:12};
function inferYear(m,d){const y=T0.getFullYear();const c=new Date(y,m-1,d);return (T0-c)/864e5>60?y+1:y}
function mkIso(y,m,d){y=+y;m=+m;d=+d;if(m<1||m>12||d<1||d>31)return null;const t=new Date(y,m-1,d);if(t.getMonth()!==m-1)return null;return iso(t)}
function findDate(t){let m;
  if((m=t.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/)))return{iso:mkIso(m[1],m[2],m[3]),m:m[0]};
  if((m=t.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/)))return{iso:mkIso(m[3],m[2],m[1]),m:m[0]};
  if((m=t.match(/\b(\d{1,2})\s+([a-z]{3,9})\.?(?:\s+(\d{4}))?\b/i))&&MONTHS[m[2].toLowerCase()]){const mo=MONTHS[m[2].toLowerCase()];return{iso:mkIso(m[3]||inferYear(mo,+m[1]),mo,m[1]),m:m[0]}}
  if((m=t.match(/(?:^|[\s(,:·|])(\d{1,2})[\/.-](\d{1,2})(?![\d\/.,-]|\s*(?:km|m|min|sec|%|kg)\b)/i)))return{iso:mkIso(inferYear(+m[2],+m[1]),m[2],m[1]),m:m[0].replace(/^[\s(,:·|]/,"")};
  return null}
// --- weekdagen ---
const WD_IDX={maandag:1,ma:1,monday:1,mon:1,dinsdag:2,di:2,tuesday:2,tue:2,woensdag:3,wo:3,wednesday:3,wed:3,donderdag:4,do:4,thursday:4,thu:4,vrijdag:5,vr:5,friday:5,fri:5,zaterdag:6,za:6,saturday:6,sat:6,zondag:0,zo:0,sunday:0,sun:0};
const WD_FULL="maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|monday|tuesday|wednesday|thursday|friday|saturday|sunday";
function weekdayAtStart(t){const m=String(t).trim().match(new RegExp("^("+WD_FULL+"|ma|di|wo|do|vr|za|zo|mon|tue|wed|thu|fri|sat|sun)\\b\\.?","i"));return m?WD_IDX[m[1].toLowerCase()]:null}
// Meerdere trainingen op één lijn opsplitsen, bv. "maandag 26-09 upper dinsdag 27/09 lower"
const SPLIT_RE=new RegExp("\\b(?:"+WD_FULL+")\\b|\\b(?:ma|di|wo|do|vr|za|zo|mon|tue|wed|thu|fri|sat|sun)\\.?(?=\\s*\\d)|(?:^|(?<=[\\s(,:·|]))\\d{4}-\\d{1,2}-\\d{1,2}|(?:^|(?<=[\\s(,:·|]))\\d{1,2}[\\/.-]\\d{1,2}(?:[\\/.-]\\d{4})?(?![\\d\\/.,-]|\\s*(?:km|m|min|sec|%|kg)\\b)","gi");
function splitEntries(line){if(/^\s*(doel|goal|event|evenement)\b/i.test(line))return[line];
  const starts=[];let m;SPLIT_RE.lastIndex=0;let prevEnd=-1,prevWasWd=false;
  while((m=SPLIT_RE.exec(line))){const isWd=/^[a-z]/i.test(m[0]);const gap=line.slice(prevEnd,m.index);
    if(isWd||!(prevWasWd&&/^\s*$/.test(gap)))starts.push(m.index);prevEnd=m.index+m[0].length;prevWasWd=isWd;if(m[0]==="")SPLIT_RE.lastIndex++}
  if(starts.length<2)return[line];
  const out=[];if(starts[0]>0&&line.slice(0,starts[0]).trim())out.push(line.slice(0,starts[0]));
  starts.forEach((st,k)=>{const seg=line.slice(st,k+1<starts.length?starts[k+1]:undefined).trim().replace(/[,;·|\-–]+$/,"").trim();if(seg)out.push(seg)});
  return out}
function impDate(v){const f=findDate(String(v||"").trim());return f?f.iso:null}
// --- soort training herkennen ---
function kindFromText(t){t=" "+String(t||"").toLowerCase()+" ";
  if(/\b(rust|rustdag|rest|off|herstel dag)\b/.test(t))return"rust";
  if(/\b(race|racedag|wedstrijd)\b/.test(t))return"race";
  if(/\b(upper|bovenlichaam|push|pull|borst|schouders|armen|biceps|triceps)\b/.test(t))return"upper";
  if(/\b(lower|benen|legs?|squats?|lunges?|kuiten|hamstrings)\b/.test(t))return"lower";
  if(/\b(run|runs|loop|lopen|interval|intervals|tempo|long|lsd|duurloop|zone ?2|z2|jog|joggen|fartlek|shakeout|helling|wandelen|loopband|km)\b/.test(t))return"run";
  if(/\b(kracht|gym|strength|fitness)\b/.test(t))return"upper";
  if(/\b(etentje|event|feest|evenement)\b/.test(t))return"event";
  return null}
function kindOf(v,fallback){const k=IMP_KIND[String(v||"").toLowerCase().trim()];return k||kindFromText(v)||kindFromText(fallback)}
function kmFromText(t){const re=/(\d+(?:[.,]\d+)?)\s*km\b/gi;let m,best=null;
  while((m=re.exec(t))){const before=t.slice(Math.max(0,m.index-3),m.index);if(/[×x]\s*$/i.test(before))continue;best=num(m[1])}
  return best}
const WEEKDAY=/^(maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|monday|tuesday|wednesday|thursday|friday|saturday|sunday|ma|di|wo|do|vr|za|zo|mon|tue|wed|thu|fri|sat|sun)\b\.?\s*/i;
const HEAD={date:/^(datum|date|dag|day)$/i,kind:/^(soort|type|categorie|sport)$/i,title:/^(titel|training|workout|sessie|title|naam)$/i,detail:/^(uitleg|omschrijving|details?|beschrijving|notitie|inhoud|description)$/i,km:/^(km|afstand|distance|kilometers?)$/i};
// --- rijen (van eender welk formaat) omzetten naar een plan ---
function parseRows(rows){
  const res={goal:null,items:[],errors:[],warnings:[]};let map=null,lastDate=null;
  rows.forEach((row,ri)=>{const i=(row.line||ri+1)-1;
    row=row.map(c=>String(c==null?"":c).replace(/\s+/g," ").trim());while(row.length&&!row[row.length-1])row.pop();
    const join=row.filter(Boolean).join(" · ");if(!join)return;
    if(/^(#|\/\/)/.test(join)||/^voltage plan$/i.test(join))return;
    const low=row.map(c=>c.toLowerCase());
    if(low.some(c=>HEAD.date.test(c))&&low.length>1&&low.some(c=>HEAD.kind.test(c)||HEAD.title.test(c)||HEAD.km.test(c))){
      map={};low.forEach((c,ci)=>{for(const k in HEAD)if(HEAD[k].test(c)&&map[k]==null)map[k]=ci});return}
    if(/^(doel|goal|event|evenement)\b/i.test(row[0])){
      let title,date,note="";
      if(row.length>=3&&impDate(row[2])){title=row[1];date=impDate(row[2]);note=row[3]||""}
      else{const f=findDate(join);date=f&&f.iso;title=join.replace(/^(doel|goal|event|evenement)\s*[:;·\-–]?\s*/i,"").replace(f?f.m:"","").replace(/\s*[·;\-–|]\s*$/,"").replace(/\s*[·;\-–|]\s*[·;\-–|]\s*/g," · ").trim()}
      if(!title||!date){res.errors.push(`Lijn ${i+1}: event heeft een naam en een datum nodig.`);return}
      res.goal={title:title.slice(0,80),date,note:note.slice(0,500)};return}
    let date,kind,title="",detail="",km=null;
    const structured=row.length>=2&&(map||impDate(row[0]));
    if(structured){
      const col=k=>map&&map[k]!=null?row[map[k]]:null;
      date=impDate(map?col("date"):row[0]);
      const kc=map?col("kind"):row[1];
      title=(map?col("title"):row[2])||"";detail=(map?col("detail"):row[3])||"";
      const kmc=map?col("km"):row[4];km=num(kmc)!=null?num(kmc):kmFromText(kmc||"")??kmFromText(title+" "+detail);
      kind=kindOf(kc,title+" "+detail);
      if(!map&&!IMP_KIND[(kc||"").toLowerCase()]&&!title){title=kc||""}
    }else{
      let f=findDate(join);const wd=weekdayAtStart(join);
      if(!f&&wd!=null&&kindFromText(join.replace(WEEKDAY,""))){ // enkel een weekdag: eerstvolgende die dag na de vorige training
        let d=addDays(lastDate?pd(lastDate):T0,lastDate?1:0);while(d.getDay()!==wd)d=addDays(d,1);
        f={iso:iso(d),m:""};res.warnings.push(`Lijn ${i+1}: geen datum bij “${join.slice(0,30)}” – ingepland op ${dayName(d).toLowerCase()} ${fd(d)}.`)}
      if(!f){if(/\d/.test(join)&&kindFromText(join))res.errors.push(`Lijn ${i+1}: geen datum gevonden in “${join.slice(0,60)}”.`);return}
      if(f.iso&&wd!=null&&pd(f.iso).getDay()!==wd&&f.m){const d=pd(f.iso);res.warnings.push(`Lijn ${i+1}: je schreef ${Object.keys(WD_IDX).find(k=>WD_IDX[k]===wd&&k.length>3)} ${f.m}, maar ${fd(d)} ${d.getFullYear()} is een ${dayName(d).toLowerCase()}. De datum ${fd(d)} wordt gebruikt – pas aan als dat niet klopt.`)}
      date=f.iso;let rest=join.replace(f.m,"").trim().replace(/^[·;:\-–|,\s]+/,"").replace(WEEKDAY,"").replace(/^[·;:\-–|,\s]+/,"");
      rest=rest.replace(WEEKDAY,"").trim();
      const parts=rest.split(/\s*(?:·|\||;|\s[-–]\s|\t)\s*/).map(x=>x.trim()).filter(Boolean);
      kind=kindFromText(rest);km=kmFromText(rest);
      let pi=0;if(parts.length>1&&IMP_KIND[parts[0].toLowerCase()])pi=1;
      title=parts[pi]||"";detail=parts.slice(pi+1).filter(x=>!/^\d+(?:[.,]\d+)?\s*km$/i.test(x)).join(" · ");
      if(!/[×x]\s*\d+(?:[.,]\d+)?\s*km$/i.test(title))title=title.replace(/\s*\d+(?:[.,]\d+)?\s*km$/i,"").trim();
      title=title.replace(/\s+(op|on|at|om)$/i,"");if(IMP_KIND[title.toLowerCase()])title="";
      if(title)title=title[0].toUpperCase()+title.slice(1);
    }
    if(!date){res.errors.push(`Lijn ${i+1}: onbekende datum in “${join.slice(0,60)}”.`);return}
    if(!kind){if(title||detail)res.errors.push(`Lijn ${i+1}: soort training niet herkend in “${join.slice(0,60)}”. Gebruik upper, lower, run, rust, race of event.`);return}
    if(structured){const wd=weekdayAtStart(map?row[map.date]||"":row[0]);if(wd!=null&&pd(date).getDay()!==wd){const d=pd(date);res.warnings.push(`Lijn ${i+1}: weekdag en datum komen niet overeen – ${fd(d)} ${d.getFullYear()} is een ${dayName(d).toLowerCase()}. De datum wordt gebruikt.`)}}
    lastDate=date;
    res.items.push({date,kind,title:(title||KIND[kind].l).slice(0,60),detail:detail.slice(0,300),km:km==null?null:km})});
  res.items.sort((a,b)=>a.date.localeCompare(b.date));
  if(!res.goal){const r=res.items.filter(x=>x.kind==="race").pop();if(r)res.goal={title:r.title,date:r.date,note:"Geïmporteerd plan"}}
  return res}
function textToRows(text){text=String(text).replace(/^\uFEFF/,"");const lines=text.split(/\r?\n/);
  const sample=lines.find(l=>l.includes(";"))?";":lines.find(l=>l.includes("\t"))?"\t":null;
  const rows=[];
  lines.forEach((l,li)=>{let r;
    if(sample)r=[csvSplit(l,sample)];
    else if(/^\s*\d{4}-\d{1,2}-\d{1,2}\s*,/.test(l)||/^\s*(doel|datum|date)\s*,/i.test(l))r=[csvSplit(l,",")];
    else r=splitEntries(l).map(x=>[x]);
    r.forEach(x=>{x.line=li+1;rows.push(x)})});
  return rows}
function parsePlan(text){return parseRows(textToRows(text))}
// --- bibliotheken voor Excel, Word en PDF (pas geladen als je ze nodig hebt) ---
const J="https://cdn.jsdelivr.net/npm/",U="https://unpkg.com/";
const LIB={xlsx:"xlsx@0.18.5/dist/xlsx.full.min.js",mammoth:"mammoth@1.6.0/mammoth.browser.min.js",pdf:"pdfjs-dist@3.11.174/build/pdf.min.js",pdfWorker:"pdfjs-dist@3.11.174/build/pdf.worker.min.js"};
const libCache={};let pdfBase=J;
function loadOne(url){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=url;s.onload=res;s.onerror=()=>{s.remove();rej(new Error("LIB"))};document.head.appendChild(s)})}
function loadScript(path){return libCache[path]||(libCache[path]=loadOne(J+path).then(()=>J).catch(()=>loadOne(U+path).then(()=>U)).catch(e=>{delete libCache[path];throw e}))}
async function rowsFromXlsx(buf){await loadScript(LIB.xlsx);const wb=XLSX.read(buf,{type:"array",cellDates:true});let rows=[];
  wb.SheetNames.forEach(n=>{rows=rows.concat(XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:false,dateNF:"yyyy-mm-dd",defval:""}))});return rows}
async function rowsFromDocx(buf){await loadScript(LIB.mammoth);const r=await mammoth.convertToHtml({arrayBuffer:buf});
  const doc=new DOMParser().parseFromString(r.value,"text/html");const rows=[];
  doc.body.querySelectorAll("tr, p, li, h1, h2, h3, h4").forEach(el=>{if(el.closest("tr")&&el.tagName!=="TR")return;
    if(el.tagName==="TR")rows.push([...el.children].map(td=>td.textContent));else rows.push(...el.textContent.split(/\n/).map(x=>[x]))});
  return rows}
async function rowsFromPdf(buf){const base=await loadScript(LIB.pdf);pdfjsLib.GlobalWorkerOptions.workerSrc=base+LIB.pdfWorker;
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;const rows=[];
  for(let p=1;p<=pdf.numPages;p++){const tc=await (await pdf.getPage(p)).getTextContent();
    const lines=[];tc.items.forEach(it=>{if(!it.str.trim())return;const y=it.transform[5],x=it.transform[4];
      let ln=lines.find(l=>Math.abs(l.y-y)<3);if(!ln){ln={y,items:[]};lines.push(ln)}ln.items.push({x,w:it.width,s:it.str})});
    lines.sort((a,b)=>b.y-a.y).forEach(l=>{l.items.sort((a,b)=>a.x-b.x);const cells=[];let prevEnd=null;
      l.items.forEach(it=>{if(prevEnd===null||it.x-prevEnd>12)cells.push(it.s);else cells[cells.length-1]+=(it.x-prevEnd>1?" ":"")+it.s;prevEnd=it.x+it.w});
      rows.push(cells)})}
  return rows}
function openImport(){imp=null;$("impText").value="";$("impFile").value="";$("impFileName").textContent="Tik hier om een bestand te kiezen";$("impPreview").innerHTML="";$("impGo").disabled=true;openSheet("impSheet")}
$("btnImport").addEventListener("click",()=>{if(!pin)return;openImport()});
$("impFile").addEventListener("change",async e=>{const f=e.target.files[0];if(!f)return;$("impFileName").textContent=f.name;
  const box=$("impPreview");box.innerHTML=`<p class="note-s">Bestand lezen…</p>`;$("impGo").disabled=true;
  try{const ext=(f.name.split(".").pop()||"").toLowerCase();let rows;
    if(["csv","txt","tsv","text"].includes(ext)||f.type.startsWith("text/"))rows=textToRows(await f.text());
    else if(["xlsx","xls","xlsm","ods"].includes(ext))rows=await rowsFromXlsx(await f.arrayBuffer());
    else if(ext==="docx")rows=await rowsFromDocx(await f.arrayBuffer());
    else if(ext==="pdf")rows=await rowsFromPdf(await f.arrayBuffer());
    else{imp=null;box.innerHTML=`<p class="status warn">Dit bestandstype kan de app niet lezen. Gebruik .csv, .txt, .xlsx, .docx of .pdf, of plak het plan hierboven.</p>`;return}
    imp=parseRows(rows);renderImport()}
  catch(err){imp=null;box.innerHTML=`<p class="status warn">${String(err&&err.message)==="LIB"?"Kon de lezer voor dit bestandstype niet laden. Controleer je internet en probeer opnieuw.":"Dit bestand kon niet gelezen worden. Is het een oud .doc-bestand of beveiligd? Sla het op als .docx, .xlsx of .pdf, of plak de tekst."}</p>`}});
$("impParse").addEventListener("click",()=>{const t=$("impText").value;if(!t.trim()){$("impText").focus();return}$("impFileName").textContent="Tik hier om een bestand te kiezen";$("impFile").value="";imp=parsePlan(t);renderImport()});
$("impText").addEventListener("paste",()=>setTimeout(()=>$("impParse").click(),60));
$("impSample").addEventListener("click",()=>{const blob=new Blob(["\uFEFF"+IMP_SAMPLE],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="voltage-plan-voorbeeld.csv";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)});
function renderImport(){const box=$("impPreview");if(!imp){box.innerHTML="";return}
  const it=imp.items;const cnt={};it.forEach(x=>cnt[x.kind]=(cnt[x.kind]||0)+1);
  const first=it[0],last=it[it.length-1];
  const exists=imp.goal&&G.find(g=>g.title.toLowerCase()===imp.goal.title.toLowerCase()&&g.date===imp.goal.date);
  box.innerHTML=(it.length?`<div class="imp-sum">
      ${imp.goal?`<div class="imp-goal"><span>EVENT</span><b>${esc(imp.goal.title)}</b><em>${dayName(pd(imp.goal.date))} ${fd(pd(imp.goal.date))} ${pd(imp.goal.date).getFullYear()}</em></div>`:`<p class="note-s">Geen doel gevonden. De sessies worden zonder doel op de kalender gezet.</p>`}
      <div class="kv"><div><b>${it.length}</b>sessies</div><div><b>${fd(pd(first.date))}</b>eerste dag</div><div><b>${fd(pd(last.date))}</b>laatste dag</div>${Object.entries(cnt).map(([k,n])=>`<div><b>${n}</b>${KIND[k].l.toLowerCase()}</div>`).join("")}</div>
      ${exists?`<p class="status warn" style="margin:8px 0">Dit doel bestaat al. Bij importeren wordt de oude planning ervan vervangen door deze.</p>`:""}
      <div class="imp-list">${it.slice(0,60).map(x=>`<div class="imp-row"><span class="kindtag" style="background:${KIND[x.kind].c}">${KIND[x.kind].l.toUpperCase()}</span><b>${dayName(pd(x.date)).slice(0,2)} ${fd(pd(x.date))}</b><span>${esc(x.title)}${x.km?` · ${nfmt(x.km)} km`:""}</span></div>`).join("")}${it.length>60?`<p class="note-s">… en nog ${it.length-60} sessies</p>`:""}</div></div>`
    :`<p class="status warn">Geen sessies gevonden in dit bestand.</p>`)+
    (imp.warnings&&imp.warnings.length?`<div class="imp-warn"><b>Controleer even:</b>${imp.warnings.slice(0,10).map(e=>`<div>${esc(e)}</div>`).join("")}</div>`:"")+
    (imp.errors.length?`<div class="imp-err"><b>${imp.errors.length} lijn${imp.errors.length>1?"en":""} overgeslagen:</b>${imp.errors.slice(0,8).map(e=>`<div>${esc(e)}</div>`).join("")}</div>`:"");
  $("impGo").disabled=!it.length;$("impGo").textContent=it.length?`Importeer ${it.length} sessies`:"Importeren"}
$("impGo").addEventListener("click",async()=>{if(!imp||!imp.items.length)return;
  const data=imp;closeSheet("impSheet");busy++;
  try{let goalId="";
    if(data.goal){const ex=G.find(g=>g.title.toLowerCase()===data.goal.title.toLowerCase()&&g.date===data.goal.date);
      if(ex){goalId=ex.id;const old=P.filter(p=>p.goalId===ex.id).map(p=>p.id);if(old.length){setStatus("Oude planning verwijderen…");apply(await call("deletePlanItems",old))}}
      else{setStatus("Doel aanmaken…");const r=await call("saveGoal",{title:data.goal.title,date:data.goal.date,note:data.goal.note,createdBy:who||""});goalId=r.savedId;apply(r);push(other(),`${NAMES[who]} plande een nieuw event`,`${data.goal.title} · ${dshort(data.goal.date)}`)}}
    const items=data.items.map(x=>Object.assign({},x,{goalId}));
    for(let i=0;i<items.length;i+=400){setStatus(`Sessies op de kalender zetten… (${Math.min(i+400,items.length)}/${items.length})`);apply(await call("addPlanItems",items.slice(i,i+400)))}
    busy--;selDate=items[0].date>=TODAY?items[0].date:TODAY;syncMonth();render();setStatus(`${items.length} sessies geïmporteerd${data.goal?` voor ${data.goal.title}`:""}.`)}
  catch(e){busy--;setStatus(errText(e),true);refresh()}});

// ================= WORKOUT EDITOR =================
let ed=null; // {id,date,kind,data,feel,note,staged:[]}
function openEditor(o){
  if(!who){ask("Tik eerst bovenaan op je naam, zodat de app weet wie er traint.",{alert:true,title:"Wie ben jij?"});return}
  const w=o.id?byId[o.id]:null;
  ed={id:w?w.id:null,date:w?w.date:o.date,kind:w?w.kind:(o.kind||null),data:w?JSON.parse(JSON.stringify(w.data||{})):{},feel:w?w.feel:null,note:w?w.note:"",staged:[],tplId:null,tplMode:"none",tplName:""};
  if(w&&w.data&&w.data.tplId&&TP.some(t=>t.id===w.data.tplId&&t.person===who)){ed.tplId=w.data.tplId;ed.tplMode="keep"}
  if(!w&&ed.kind==="run"){ed.data={rt:o.rt||"z2"};if(o.env)ed.data.env=o.env}
  if(!w&&ed.kind==="run"&&o.planKm){if(ed.data.rt==="long"||ed.data.rt==="z2")ed.data.dist=o.planKm}
  if(!w&&(ed.kind==="upper"||ed.kind==="lower"))ed.data={ex:[]};
  if(ed.kind==="run"&&!ed.data.rt)ed.data.rt="z2";
  if(ed.kind==="run"&&ed.data.rt==="interval"&&!ed.data.blocks)ed.data.blocks=[newBlock()];
  $("wTitle").textContent=w?"Training bewerken":"Training loggen";
  const d=pd(ed.date);$("wSub").textContent=`${NAMES[who]} · ${dayName(d)} ${fd(d)} ${d.getFullYear()}`;
  $("fNote").value=ed.note||"";syncFeel();
  $("btnDel").style.visibility=w?"visible":"hidden";
  $("editThreadBlock").style.display=w?"block":"none";if(w)renderThread($("editThread"),w.id);
  if(w&&unread().some(c=>c.logId===w.id)){markSeen();render()}
  renderEditor();openSheet("wSheet");
}
// ---------- concept: alles wat je invult wordt meteen op dit toestel bewaard ----------
const DKEY=()=>"voltage-draft-"+who;let draftTimer=null,draftChecked=false;
function saveDraft(){if(!ed||!who||!ed.kind)return;clearTimeout(draftTimer);draftTimer=setTimeout(()=>{try{
  const e=Object.assign({},ed,{staged:[],note:$("fNote").value});localStorage.setItem(DKEY(),JSON.stringify({ed:e,at:Date.now()}))}catch(_){}},250)}
function clearDraft(){clearTimeout(draftTimer);try{localStorage.removeItem(DKEY())}catch(_){}}
function getDraft(){try{const o=JSON.parse(localStorage.getItem(DKEY())||"null");return o&&o.ed&&o.ed.kind?o:null}catch(_){return null}}
function isDirty(){return !!(ed&&ed.kind&&(hasInput()||($("fNote").value||"").trim()||ed.feel))}
function openDraft(dr){ed=Object.assign(dr.ed,{staged:[]});const w=ed.id?byId[ed.id]:null;
  $("wTitle").textContent=w?"Training bewerken":"Training loggen";const d=pd(ed.date);$("wSub").textContent=`${NAMES[who]} · ${dayName(d)} ${fd(d)} ${d.getFullYear()}`;
  $("fNote").value=ed.note||"";syncFeel();$("btnDel").style.visibility=w?"visible":"hidden";
  $("editThreadBlock").style.display=w?"block":"none";if(w)renderThread($("editThread"),w.id);
  renderEditor();openSheet("wSheet")}
async function checkDraft(force){if(!who||(draftChecked&&!force))return;draftChecked=true;const dr=getDraft();if(!dr||$("wSheet").classList.contains("open"))return;
  const d=pd(dr.ed.date),t=new Date(dr.at);const lbl=dr.ed.kind==="run"?(RT[dr.ed.data&&dr.ed.data.rt]||"Run"):KIND[dr.ed.kind].l;
  if(await ask(`Je was een ${lbl}-training aan het loggen voor ${dayName(d).toLowerCase()} ${fd(d)}. Laatst bewaard om ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}. Niets is verloren.`,{title:"Verder loggen?",ok:"Ja, verder",cancel:"Nee, weggooien"}))openDraft(dr);else clearDraft()}
async function requestCloseEditor(){if(isDirty()&&!(await ask("Wat je invulde voor deze training is nog niet opgeslagen.",{title:"Training weggooien?",ok:"Ja, weggooien",cancel:"Verder loggen",danger:true})))return;
  clearDraft();closeSheet("wSheet")}
["input","change"].forEach(ev=>$("wSheet").addEventListener(ev,()=>saveDraft()));
$("wSheet").addEventListener("click",()=>setTimeout(saveDraft,0));
function newBlock(){return{reps:6,mode:"dist",dist:800,time:null,pace:"",zone:"Z4",hr:null,rest:1.5}}
document.querySelectorAll(".types button").forEach(b=>b.addEventListener("click",async()=>{
  const k=b.dataset.kind;if(ed.kind===k)return;
  const hasData=(ed.data.ex&&ed.data.ex.length)||(ed.data.rt&&runKm(ed.data));
  if(hasData&&!(await ask("Wat je al invulde voor deze training gaat verloren.",{title:"Van soort wisselen?"})))return;
  ed.kind=k;ed.data=k==="run"?{rt:"z2"}:{ex:[]};ed.tplId=null;ed.tplMode="none";ed.tplName="";renderEditor()}));
function renderEditor(){
  document.querySelectorAll(".types button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.kind===ed.kind)));
  const body=$("wBody");body.innerHTML="";$("wCommon").hidden=!ed.kind;$("btnSave").disabled=!ed.kind;
  if(!ed.kind){body.innerHTML=`<p class="note-s" style="text-align:center;margin:10px 0 18px">Kies hierboven wat je deze dag trainde.</p>`;return}
  renderTplBar(body);
  if(ed.kind==="run")renderRun(body);else renderStrength(body);
  renderEditPhotos();renderTplSave();saveDraft();
}
// ---------- opgeslagen workouts ----------
const REPS=[...Array(30).keys()].map(i=>i+1).concat([35,40,45,50,60,75,90,100,120]);
const CAT={bulking:"Bulking",cutting:"Cutting",maintenance:"Maintenance"};
let phase="all";try{phase=localStorage.getItem("voltage-phase")||"all"}catch(_){}
function setPhase(p){phase=p;try{localStorage.setItem("voltage-phase",p)}catch(_){}}
function myTpls(kind){return TP.filter(t=>t.person===who&&t.kind===kind).sort((a,b)=>a.name.localeCompare(b.name))}
function otherTpls(kind){return TP.filter(t=>t.person!==who&&t.kind===kind).sort((a,b)=>a.name.localeCompare(b.name))}
function hasInput(){const d=ed.data||{};return (d.ex&&d.ex.length)||(ed.kind==="run"&&runKm(d)>0)}
function renderTplBar(body){
  const mine=myTpls(ed.kind),other=otherTpls(ed.kind),oth=who==="lor"?"nel":"lor";
  const bar=document.createElement("div");bar.className="tplbar";
  if(!mine.length&&!other.length){bar.innerHTML=`<p class="note-s" style="margin:0">Nog geen opgeslagen ${KIND[ed.kind].l.toLowerCase()}-workouts. Vul je training in en vink onderaan <b>Bewaar als workout</b> aan, dan kan je ze de volgende keer in één tik laden.</p>`;body.appendChild(bar);return}
  const cur=ed.tplId||ed.tplFrom||"";
  const fit=t=>phase==="all"||t.category===phase||t.id===cur;
  const opt=t=>`<option value="${esc(t.id)}" ${t.id===cur?"selected":""}>${esc(t.name)}${phase==="all"&&t.category?` · ${CAT[t.category]}`:""}</option>`;
  const grp=(label,list)=>{const l=list.filter(fit);return l.length?`<optgroup label="${label}">${l.map(opt).join("")}</optgroup>`:""};
  const groups=grp("Mijn workouts",mine)+grp("Van "+NAMES[oth],other);
  bar.innerHTML=`<div class="phasechips" role="group" aria-label="Fase">${[["all","Alle"]].concat(Object.entries(CAT)).map(([k,l])=>`<button type="button" data-phase="${k}" aria-pressed="${phase===k}">${l}</button>`).join("")}</div>
  <label>Opgeslagen workout laden<select id="tplSel"><option value="">${groups?"— Kies een workout —":"Geen workouts in "+(CAT[phase]||"deze fase")}</option>${groups}</select></label>${ed.tplId?`<button class="rm" id="tplDel" type="button">Verwijder “${esc((TP.find(t=>t.id===ed.tplId)||{}).name||"")}”</button>`:""}`;
  body.appendChild(bar);
  bar.querySelectorAll("[data-phase]").forEach(b=>b.addEventListener("click",()=>{setPhase(b.dataset.phase);renderEditor()}));
  $("tplSel").addEventListener("change",async e=>{const id=e.target.value;if(!id){ed.tplId=null;ed.tplFrom=null;ed.tplMode="none";renderEditor();return}
    const t=TP.find(x=>x.id===id);if(!t)return;
    if(hasInput()&&!(await ask("Wat je nu hebt ingevuld wordt vervangen.",{title:`“${t.name}” laden?`,ok:"Ja, laden"}))){e.target.value=cur;return}
    let emptyKg=false;
    if(ed.kind!=="run"&&t.data&&t.data.ex&&t.data.ex.length)emptyKg=!(await ask("De reps komen van je laatst gelogde sessie. Wil je ook je laatste gewichten al ingevuld, of begin je met lege gewichtvelden?",{title:"Gewichten",ok:"Laatste gewichten",cancel:"Lege gewichten"}));
    loadTpl(t,{emptyKg});renderEditor()});
  const del=$("tplDel");if(del)del.addEventListener("click",async()=>{const t=TP.find(x=>x.id===ed.tplId);if(!t||!(await ask(`Opgeslagen workout “${t.name}” verwijderen? Je gelogde trainingen blijven bewaard.`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;
    const id=t.id;ed.tplId=null;ed.tplMode="none";await run("deleteTemplate",[id,who],"Workout verwijderd.");renderEditor()});
}
function loadTpl(t,o={}){
  const data=JSON.parse(JSON.stringify(t.data||{}));delete data.tplId;delete data.tplName;delete data.km;
  const mine=t.person===who;
  if(mine){ed.tplId=t.id;ed.tplFrom=null;ed.tplMode="update";ed.tplName=t.name}
  else{ed.tplId=null;ed.tplFrom=t.id;ed.tplMode="new";ed.tplName=t.name}
  // reps: altijd van je laatst gelogde sessie · gewicht: laatste of leeg (jouw keuze)
  if(data.ex)data.ex.forEach(e=>{if(!e.sets||!e.sets.length)e.sets=[{r:null,kg:null},{r:null,kg:null},{r:null,kg:null}];const last=lastFor(e.id,who,ed.date,ed.id);(e.sets||[]).forEach((s,i)=>{const ls=last&&(last.e.sets[i]||last.e.sets[last.e.sets.length-1]);
    if(ls&&ls.r!=null)s.r=ls.r;
    s.kg=o.emptyKg?null:(ls&&ls.kg!=null?ls.kg:(mine?s.kg:null))})});
  if(ed.kind!=="run"&&!data.ex)data.ex=[];
  if(ed.kind==="run"){if(!data.rt)data.rt="z2";if(data.rt==="interval"&&!data.blocks)data.blocks=[newBlock()]}
  ed.data=data;
}
function renderTplSave(){
  const box=$("wTpl");if(!box)return;box.innerHTML="";if(!ed.kind){box.hidden=true;return}box.hidden=false;
  const t=ed.tplId?TP.find(x=>x.id===ed.tplId):null;
  if(t){
    box.innerHTML=`<label class="chk"><input type="checkbox" id="tplUpd" ${ed.tplMode==="update"?"checked":""}><span>Werk <b>“${esc(t.name)}”</b> bij met deze sessie<small>Nieuwe gewichten, sets en afstanden worden je vertrekpunt voor de volgende keer.</small></span></label><button type="button" class="linkish" id="tplAsNew">Of bewaar als nieuwe workout</button>`;
    $("tplUpd").addEventListener("change",e=>{ed.tplMode=e.target.checked?"update":"keep"});
    $("tplAsNew").addEventListener("click",()=>{ed.tplId=null;ed.tplMode="new";ed.tplName="";renderEditor();setTimeout(()=>{const n=$("tplName");if(n)n.focus()},30)});
  }else{
    const on=ed.tplMode==="new";if(ed.tplCat==null)ed.tplCat=phase==="all"?"":phase;
    box.innerHTML=`<label class="chk"><input type="checkbox" id="tplNew" ${on?"checked":""}><span>Bewaar als workout<small>Zo kan je deze training later in één tik opnieuw laden.</small></span></label>${on?`<label>Naam van de workout<input id="tplName" maxlength="50" value="${esc(ed.tplName||"")}" placeholder="${ed.kind==="run"?"bv. Interval 6×800 m":ed.kind==="upper"?"bv. Push dag":"bv. Benen zwaar"}"></label>`:""}`;
    $("tplNew").addEventListener("change",e=>{ed.tplMode=e.target.checked?"new":"none";renderTplSave();if(e.target.checked)setTimeout(()=>$("tplName").focus(),30)});
    const n=$("tplName");if(n){n.addEventListener("input",()=>{ed.tplName=n.value});
      n.parentNode.insertAdjacentHTML("afterend",`<label>Categorie<select id="tplCat"><option value="">— Geen categorie —</option>${Object.entries(CAT).map(([k,l])=>`<option value="${k}" ${ed.tplCat===k?"selected":""}>${l}</option>`).join("")}</select></label>`);
      $("tplCat").addEventListener("change",e=>{ed.tplCat=e.target.value})}
  }
}
// ---------- volgorde wijzigen: oefening ingedrukt houden en verschuiven ----------
let dragEndAt=0;
function enableDrag(body){const d=ed.data;const sheet=$("wSheet").querySelector(".sheet");
  body.querySelectorAll(".exc").forEach(card=>{const top=card.querySelector(".top");
    top.addEventListener("contextmenu",e=>e.preventDefault());
    top.addEventListener("pointerdown",e=>{if(e.button>0||e.target.closest(".rm"))return;
      let dragging=false,startY=e.clientY,idx=+card.dataset.i;const pid=e.pointerId,sx=e.clientX,sy=e.clientY;
      const timer=setTimeout(()=>{dragging=true;card.classList.add("dragging");body.classList.add("sorting");try{top.setPointerCapture(pid)}catch(_){}if(navigator.vibrate)navigator.vibrate(12)},300);
      const move=ev=>{if(ev.pointerId!==pid)return;
        if(!dragging){if(Math.abs(ev.clientY-sy)>8||Math.abs(ev.clientX-sx)>8)end();return}
        ev.preventDefault();
        const r=sheet.getBoundingClientRect();let sc=0;if(ev.clientY<r.top+70)sc=-14;else if(ev.clientY>r.bottom-70)sc=14;
        if(sc){const b=sheet.scrollTop;sheet.scrollTop+=sc;startY-=(sheet.scrollTop-b)}
        const prev=card.previousElementSibling,next=card.nextElementSibling;
        if(prev&&prev.classList.contains("exc")){const pr=prev.getBoundingClientRect();if(ev.clientY<pr.top+pr.height/2){card.parentNode.insertBefore(card,prev);[d.ex[idx-1],d.ex[idx]]=[d.ex[idx],d.ex[idx-1]];idx--;startY-=pr.height+10}}
        if(next&&next.classList.contains("exc")){const nr=next.getBoundingClientRect();if(ev.clientY>nr.top+nr.height/2){card.parentNode.insertBefore(next,card);[d.ex[idx+1],d.ex[idx]]=[d.ex[idx],d.ex[idx+1]];idx++;startY+=nr.height+10}}
        card.style.transform=`translateY(${ev.clientY-startY}px)`};
      const up=ev=>{if(ev.pointerId===pid)end()};
      function end(){clearTimeout(timer);window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);
        if(dragging){dragging=false;dragEndAt=Date.now();card.classList.remove("dragging");body.classList.remove("sorting");card.style.transform="";renderEditor()}}
      window.addEventListener("pointermove",move,{passive:false});window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up)})})}
// ---------- strength ----------
function renderStrength(body){
  const d=ed.data;if(!d.ex)d.ex=[];
  const top=document.createElement("div");
  top.innerHTML=`<div class="sub-h"><span>Oefeningen</span><span class="note-s" style="margin:0">${d.ex.length} gekozen</span></div>`;
  body.appendChild(top);
  d.ex.forEach((e,ei)=>{
    const meta=EX[e.id]||{n:e.id,g:""};const last=lastFor(e.id,who,ed.date,ed.id);
    const card=document.createElement("div");card.className="exc";card.dataset.i=ei;
    card.innerHTML=`<div class="top">${exAnim(e.id,"sm")}<div class="nm"><b>${esc(meta.n)}</b><span>${esc(meta.g)}</span></div><button class="rm" data-rmex="${ei}" aria-label="${esc(meta.n)} verwijderen">Verwijder</button></div>
      <div class="last">${last?`<em>Vorige keer (${fd(pd(last.w.date))}):</em> ${esc(setsTxt(last.e.sets))}`:`<em>Eerste keer deze oefening.</em>`}</div>
      <div class="sets"><label class="setcount">Aantal sets<select data-setcount="${ei}" aria-label="Aantal sets ${esc(meta.n)}">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option ${n===e.sets.length?"selected":""}>${n}</option>`).join("")}</select></label>
      <div class="sr h"><span>Set</span><span>Reps</span><span>Kg</span><span></span></div>
      ${e.sets.map((s,si)=>`<div class="sr"><span class="n">${si+1}</span><select data-ex="${ei}" data-set="${si}" data-f="r" aria-label="Set ${si+1} reps"><option value="">—</option>${(REPS.includes(s.r)||s.r==null?REPS:REPS.concat([s.r]).sort((a,b)=>a-b)).map(n=>`<option ${n===s.r?"selected":""}>${n}</option>`).join("")}</select><input type="number" inputmode="decimal" min="0" step="0.5" value="${s.kg??""}" placeholder="kg" data-ex="${ei}" data-set="${si}" data-f="kg" aria-label="Set ${si+1} kg"><button class="sx" data-rmset="${ei}:${si}" aria-label="Set ${si+1} verwijderen">×</button></div>`).join("")}</div>`;
    body.appendChild(card)});
  if(d.ex.length>1)top.insertAdjacentHTML("beforeend",`<p class="note-s draghint">Houd een oefening ingedrukt en schuif ze naar boven of beneden om de volgorde te wijzigen.</p>`);
  enableDrag(body);
  const add=document.createElement("button");add.className="linkbtn";add.textContent="+ Oefening toevoegen";add.addEventListener("click",openPicker);body.appendChild(add);
  const dur=document.createElement("div");dur.innerHTML=`<label style="margin-top:12px">Duur (min)<input type="number" inputmode="numeric" min="0" id="sMin" value="${d.min??""}"></label>`;body.appendChild(dur);
  $("sMin").addEventListener("input",e=>{d.min=num(e.target.value)});
  body.querySelectorAll("input[data-ex],select[data-ex]").forEach(inp=>inp.addEventListener(inp.tagName==="SELECT"?"change":"input",()=>{d.ex[+inp.dataset.ex].sets[+inp.dataset.set][inp.dataset.f]=num(inp.value)}));
  body.querySelectorAll("[data-setcount]").forEach(sel=>sel.addEventListener("change",()=>{const s=d.ex[+sel.dataset.setcount].sets;const n=+sel.value;
    while(s.length<n){const l=s[s.length-1]||{r:null,kg:null};s.push({r:l.r,kg:l.kg})}s.length=n;renderEditor()}));
  body.querySelectorAll("[data-rmset]").forEach(b=>b.addEventListener("click",()=>{const [a,c]=b.dataset.rmset.split(":").map(Number);d.ex[a].sets.splice(c,1);renderEditor()}));
  body.querySelectorAll("[data-rmex]").forEach(b=>b.addEventListener("click",()=>{d.ex.splice(+b.dataset.rmex,1);renderEditor()}));
  body.querySelectorAll(".exc [data-info]").forEach(el=>el.addEventListener("click",()=>{if(Date.now()-dragEndAt<500)return;openExInfo(el.dataset.info)}));
}
// ---------- picker ----------
let pickGroup=null;
function openPicker(){pickGroup=GROUPS[ed.kind][0];$("pSearch").value="";renderPicker();openSheet("pSheet")}
function renderPicker(){
  const tabs=$("pTabs");tabs.innerHTML=GROUPS[ed.kind].map(g=>`<button data-g="${g}" aria-pressed="${g===pickGroup}">${g}</button>`).join("");
  tabs.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{pickGroup=b.dataset.g;$("pSearch").value="";renderPicker()}));
  const q=$("pSearch").value.trim().toLowerCase();const segs=[ed.kind,"core"];
  const list=OEFENINGEN.filter(e=>segs.includes(e.seg)&&(q?(e.n.toLowerCase().includes(q)||e.g.toLowerCase().includes(q)):e.g===pickGroup));
  const sel=new Set(ed.data.ex.map(e=>e.id));
  $("pGrid").innerHTML=list.length?list.map(e=>`<div class="pcw"><button class="pc ${sel.has(e.id)?"on":""}" data-pick="${e.id}" aria-pressed="${sel.has(e.id)}">${exAnim(e.id)}<span>${esc(e.n)}</span>${q?`<small>${esc(e.g)}</small>`:""}</button><button type="button" class="pinfo" data-pinfo="${e.id}" aria-label="Uitvoering ${esc(e.n)} bekijken">Uitleg</button></div>`).join(""):`<p class="dayempty">Geen oefeningen gevonden.</p>`;
  $("pGrid").querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.pick;const i=ed.data.ex.findIndex(e=>e.id===id);
    if(i>=0)ed.data.ex.splice(i,1);else{const last=lastFor(id,who,ed.date,ed.id);ed.data.ex.push({id,sets:last?last.e.sets.map(s=>({r:s.r,kg:s.kg})):[{r:null,kg:null},{r:null,kg:null},{r:null,kg:null}]})}
    renderPicker()}));
  $("pGrid").querySelectorAll("[data-pinfo]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openExInfo(b.dataset.pinfo)}));
  $("pDone").textContent=`Klaar (${ed.data.ex.length} gekozen)`;
}
$("pSearch").addEventListener("input",renderPicker);
function closePicker(){closeSheet("pSheet");renderEditor()}
$("pDone").addEventListener("click",closePicker);$("pClose").addEventListener("click",closePicker);
// ---------- run ----------
function zoneSel(val,attr){return `<select ${attr}>${ZONES.map(z=>`<option value="${z}" ${z===(val||"")?"selected":""}>${z||"—"}</option>`).join("")}</select>`}
function inp(label,key,val,extra=""){return `<label>${label}<input type="number" inputmode="decimal" min="0" step="any" data-k="${key}" value="${val??""}" ${extra}></label>`}
function renderRun(body){
  const d=ed.data;
  const tm=isTM(d);
  const env=document.createElement("div");env.className="envsw";env.setAttribute("role","group");env.setAttribute("aria-label","Waar liep je?");
  env.innerHTML=`<button type="button" data-env="out" aria-pressed="${!tm}">Buiten</button><button type="button" data-env="tm" aria-pressed="${tm}">Loopband</button>`;
  body.appendChild(env);
  env.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{d.env=b.dataset.env;renderEditor()}));
  const seg=document.createElement("div");seg.className="seg5";seg.setAttribute("role","group");seg.setAttribute("aria-label","Soort run");
  seg.innerHTML=Object.keys(RT).map(k=>`<button data-rt="${k}" aria-pressed="${d.rt===k}">${RT_SHORT[k]}</button>`).join("");
  body.appendChild(seg);
  seg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{if(d.rt===b.dataset.rt)return;const keep={rt:b.dataset.rt,env:b.dataset.rt==="walk"&&!d.env?"tm":d.env};if(keep.rt==="interval")keep.blocks=[newBlock()];ed.data=keep;renderEditor()}));
  const tmf=(sp,inc)=>`<div class="grid2 tmrow">${inp("Snelheid (km/u)",sp,d[sp])}${inp("Helling (%)",inc,d[inc])}</div>`;
  const box=document.createElement("div");
  if(d.rt==="interval"){
    if(!d.blocks)d.blocks=[newBlock()];
    box.innerHTML=`<div class="grid2">${inp("Opwarming (km)","wu",d.wu)}${inp("Cooldown (km)","cd",d.cd)}</div><div class="sub-h">Intervallen</div>`+
      d.blocks.map((b,bi)=>`<div class="block-i"><div class="bh"><span>Blok ${bi+1}</span>${d.blocks.length>1?`<button class="rm" data-rmb="${bi}">Verwijder</button>`:""}</div>
        <div class="grid2"><label>Herhalingen<input type="number" inputmode="numeric" min="1" data-b="${bi}" data-bf="reps" value="${b.reps??""}"></label>
        <label>Per interval<div class="minis" style="margin-top:4px"><button type="button" data-bm="${bi}:dist" aria-pressed="${b.mode!=="time"}">Afstand</button><button type="button" data-bm="${bi}:time" aria-pressed="${b.mode==="time"}">Tijd</button></div></label></div>
        <div class="grid3">${b.mode==="time"?`<label>Duur (min)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="time" value="${b.time??""}"></label>`:`<label>Afstand (m)<input type="number" inputmode="numeric" min="0" data-b="${bi}" data-bf="dist" value="${b.dist??""}"></label>`}
        ${tm?`<label>Snelheid (km/u)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="speed" value="${b.speed??""}"></label>`:`<label>Tempo (/km)<input type="text" inputmode="numeric" placeholder="4:30" data-b="${bi}" data-bf="pace" value="${esc(b.pace||"")}"></label>`}
        <label>Rust (min)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="rest" value="${b.rest??""}"></label></div>
        <div class="grid${tm?3:2}">${tm?`<label>Helling (%)<input type="number" inputmode="decimal" min="0" step="any" data-b="${bi}" data-bf="incline" value="${b.incline??""}"></label>`:""}<label>Hartslagzone${zoneSel(b.zone,`data-b="${bi}" data-bf="zone"`)}</label><label>Gem. hartslag<input type="number" inputmode="numeric" min="0" data-b="${bi}" data-bf="hr" value="${b.hr??""}"></label></div></div>`).join("")+
      `<button class="linkbtn" id="addBlock">+ Intervalblok toevoegen</button>`;
  }else if(d.rt==="long"){
    box.innerHTML=`<div class="grid2">${inp("Afstand (km)","dist",d.dist)}<label>Hartslagzone${zoneSel(d.zone,'data-k="zone"')}</label>${inp("Duur (min)","min",d.min)}${inp("Gem. hartslag","hr",d.hr)}</div>${tm?tmf("speed","incline"):""}`;
  }else if(d.rt==="tempo"){
    box.innerHTML=`${inp("Opwarming (km)","wu",d.wu)}<div class="sub-h">Tempoblok</div><div class="grid3">${inp("Minuten","tmin",d.tmin)}${inp("Afstand (km)","tdist",d.tdist)}<label>Zone${zoneSel(d.zone,'data-k="zone"')}</label></div>${tm?tmf("tspeed","tincline"):""}${inp("Cooldown (km)","cd",d.cd)}`;
  }else if(d.rt==="walk"){
    box.innerHTML=`<div class="grid3">${inp("Duur (min)","min",d.min)}${inp("Snelheid (km/u)","speed",d.speed)}${inp("Helling (%)","incline",d.incline)}</div><div class="grid3">${inp("Afstand (km)","dist",d.dist,'placeholder="auto"')}<label>Hartslagzone${zoneSel(d.zone,'data-k="zone"')}</label>${inp("Gem. hartslag","hr",d.hr)}</div><p class="note-s" style="margin-top:0">Laat afstand leeg: de app rekent ze uit met snelheid × duur.</p>`;
  }else{
    box.innerHTML=tm?`<div class="grid2">${inp("Afstand (km)","dist",d.dist)}${inp("Duur (min)","min",d.min)}</div>${tmf("speed","incline")}`:`${inp("Afstand (km)","dist",d.dist)}`;
  }
  body.appendChild(box);
  const tot=document.createElement("div");tot.className="total";tot.id="runTotal";body.appendChild(tot);updTotal();
  box.querySelectorAll("[data-k]").forEach(x=>x.addEventListener("input",()=>{d[x.dataset.k]=x.dataset.k==="zone"?x.value:num(x.value);updTotal()}));
  box.querySelectorAll("[data-bf]").forEach(x=>x.addEventListener("input",()=>{const b=d.blocks[+x.dataset.b];const f=x.dataset.bf;b[f]=(f==="pace"||f==="zone")?x.value:num(x.value);updTotal()}));
  box.querySelectorAll("[data-bm]").forEach(x=>x.addEventListener("click",()=>{const [bi,m]=x.dataset.bm.split(":");d.blocks[+bi].mode=m;renderEditor()}));
  box.querySelectorAll("[data-rmb]").forEach(x=>x.addEventListener("click",()=>{d.blocks.splice(+x.dataset.rmb,1);renderEditor()}));
  const ab=$("addBlock");if(ab)ab.addEventListener("click",()=>{d.blocks.push(newBlock());renderEditor()});
}
function updTotal(){const el=$("runTotal");if(!el)return;const k=runKm(ed.data);const tt=ed.data.rt==="interval"&&(ed.data.blocks||[]).some(b=>b.mode==="time");
  el.innerHTML=`<span>Totale afstand</span><b>${nfmt(k)} km</b>`+(tt?`<span style="flex-basis:100%;margin-top:4px">Intervallen op tijd tellen niet mee in de km.</span>`:"");el.style.flexWrap="wrap"}
// ---------- feel / photos ----------
function syncFeel(){document.querySelectorAll("#feel button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.f===(ed&&ed.feel))))}
document.querySelectorAll("#feel button").forEach(b=>b.addEventListener("click",()=>{ed.feel=ed.feel===+b.dataset.f?null:+b.dataset.f;syncFeel()}));
function renderEditPhotos(){const box=$("editPhotos");if(!box||!ed)return;box.innerHTML="";
  const w=ed.id?byId[ed.id]:null;const existing=w?w.photos||[]:[];
  existing.forEach(fid=>box.appendChild(photoTile(null,fid,async()=>{if(!(await ask("Deze foto verwijderen?",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;await run("removePhoto",[ed.id,who,fid],"Foto verwijderd.");renderEditPhotos()})));
  ed.staged.forEach((u,k)=>box.appendChild(photoTile(u,null,()=>{ed.staged.splice(k,1);renderEditPhotos()})));
  if(existing.length+ed.staged.length<MAXPH){const btn=document.createElement("button");btn.type="button";btn.className="addph";btn.innerHTML=`<span>+ Foto</span>`;
    btn.addEventListener("click",async()=>{const files=(await pickPhotos(true)).slice(0,MAXPH-existing.length-ed.staged.length);
      for(const f of files){try{ed.staged.push(await resize(f))}catch(err){setStatus("Die foto kon niet gelezen worden.",true)}}renderEditPhotos();saveDraft()});box.appendChild(btn)}}
// ---------- save / delete ----------
$("btnSave").addEventListener("click",async()=>{
  if(!ed||!ed.kind)return;
  const d=ed.data;
  if(ed.kind==="run"){d.km=Math.round(runKm(d)*100)/100}
  const rawEx=ed.kind!=="run"?JSON.parse(JSON.stringify(d.ex||[])):null;
  if(ed.kind!=="run"){d.ex=(d.ex||[]).map(e=>({id:e.id,sets:(e.sets||[]).filter(s=>s.r!=null||s.kg!=null)}))}
  if(ed.kind!=="run"&&!d.ex.length&&!(await ask("Je hebt nog geen oefeningen gekozen.",{title:"Toch opslaan?",ok:"Ja, opslaan"})))return;
  // opgeslagen workout (sjabloon)
  let tpl=null;
  if(ed.tplMode==="new"){const name=(ed.tplName||"").trim();if(!name){await ask("Geef je workout een naam, of vink 'Bewaar als workout' uit.",{alert:true,title:"Naam ontbreekt"});const n=$("tplName");if(n)n.focus();return}
    const same=myTpls(ed.kind).find(t=>t.name.toLowerCase()===name.toLowerCase());
    if(same&&!(await ask(`Je hebt al een workout “${same.name}”. Overschrijven met deze sessie?`,{title:"Overschrijven?",ok:"Ja, overschrijf"})))return;
    tpl={id:same?same.id:null,name:same?same.name:name,category:ed.tplCat||(same?same.category:"")||""}}
  else if(ed.tplMode==="update"&&ed.tplId){const t=TP.find(x=>x.id===ed.tplId);if(t)tpl={id:t.id,name:t.name,category:t.category||""}}
  else if(ed.tplMode==="keep"&&ed.tplId){const t=TP.find(x=>x.id===ed.tplId);if(t){d.tplId=t.id;d.tplName=t.name}}
  if(ed.tplMode==="none"){delete d.tplId;delete d.tplName}
  const tplData=JSON.parse(JSON.stringify(d));delete tplData.tplId;delete tplData.tplName;delete tplData.km;delete tplData.min;
  if(rawEx)tplData.ex=rawEx.map(e=>({id:e.id,sets:(e.sets&&e.sets.length?e.sets:[{r:null,kg:null},{r:null,kg:null},{r:null,kg:null}])}));
  const kind=ed.kind;
  try{localStorage.setItem(DKEY(),JSON.stringify({ed:Object.assign({},ed,{staged:[],note:$("fNote").value}),at:Date.now()}))}catch(_){}
  const staged=ed.staged.slice();const baseId=ed.id,date=ed.date,feel=ed.feel,note=$("fNote").value.trim();closeSheet("wSheet");
  busy++;setStatus("Opslaan…");
  try{let res;
    if(tpl){setStatus("Workout bijwerken…");res=await call("saveTemplate",{id:tpl.id,person:who,kind,name:tpl.name,data:tplData,category:tpl.category});d.tplId=res.savedId;d.tplName=tpl.name}
    const payload={id:baseId,person:who,date,kind,title:kind==="run"?RT[d.rt]:KIND[kind].l,data:d,feel,note};
    setStatus("Opslaan…");res=await call("saveWorkout",payload);const id=res.savedId;
    for(let k=0;k<staged.length;k++){setStatus(`Foto ${k+1} van ${staged.length} opladen…`);res=await call("uploadPhoto",id,who,staged[k])}
    busy--;clearDraft();apply(res);if(!baseId)pushWorkout(payload);setStatus(tpl?(tpl.id?`Opgeslagen · “${tpl.name}” is bijgewerkt.`:`Opgeslagen · workout “${tpl.name}” bewaard.`):"Opgeslagen.")}
  catch(e){busy--;setStatus(errText(e)+" Je training staat nog als concept klaar.",true);const dr=getDraft();if(dr)openDraft(dr);refresh()}
});
$("btnDel").addEventListener("click",async()=>{if(!ed||!ed.id)return;if(!(await ask("Deze training wissen? Foto's en reacties verdwijnen ook.",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;const id=ed.id;clearDraft();closeSheet("wSheet");await run("deleteWorkout",[id,who],"Gewist.")});

// ================= VIEW (andermans training) =================
let viewId=null;
function openView(id){const w=byId[id];if(!w)return;viewId=id;const d=pd(w.date);
  $("vTitle").textContent=`${NAMES[w.person]} · ${woTitle(w)}`;$("vSub").textContent=`${dayName(d)} ${fd(d)} ${d.getFullYear()}${w.feel?" · gevoel "+w.feel+"/5":""}`;
  const b=$("vBody");const x=w.data||{};
  if(w.kind==="run"){const kv=[];const k=x.km!=null?x.km:runKm(x);if(k)kv.push(["km",nfmt(k)]);
    if(x.rt==="long"){if(x.zone)kv.push(["zone",x.zone]);if(x.min)kv.push(["minuten",x.min]);if(x.hr)kv.push(["gem. hartslag",x.hr])}
    if(x.rt==="tempo"){if(x.wu)kv.push(["opwarming km",nfmt(x.wu)]);if(x.tmin)kv.push(["tempo min",x.tmin]);if(x.tdist)kv.push(["tempo km",nfmt(x.tdist)]);if(x.zone)kv.push(["zone",x.zone]);if(x.cd)kv.push(["cooldown km",nfmt(x.cd)])}
    if(x.rt==="interval"){if(x.wu)kv.push(["opwarming km",nfmt(x.wu)]);if(x.cd)kv.push(["cooldown km",nfmt(x.cd)])}
    if(x.rt==="walk"||x.rt==="z2"){if(x.min)kv.push(["minuten",x.min]);if(x.zone)kv.push(["zone",x.zone]);if(x.hr)kv.push(["gem. hartslag",x.hr])}
    if(x.speed)kv.push(["km/u",nfmt(x.speed)]);if(x.incline)kv.push(["% helling",nfmt(x.incline)]);
    if(x.tspeed)kv.push(["km/u tempo",nfmt(x.tspeed)]);if(x.tincline)kv.push(["% helling tempo",nfmt(x.tincline)]);
    kv.unshift(["waar",isTM(x)?"Loopband":"Buiten"]);
    b.innerHTML=`<div class="kv">${kv.map(([l,v])=>`<div><b>${esc(v)}</b>${l}</div>`).join("")}</div>`+(x.rt==="interval"?(x.blocks||[]).map((bl,i)=>`<div class="ivl"><b>Blok ${i+1}:</b> ${bl.reps||"?"} × ${bl.mode==="time"?(bl.time||"?")+" min":(bl.dist||"?")+" m"}${bl.pace?" · "+esc(bl.pace)+"/km":""}${bl.speed?" · "+nfmt(bl.speed)+" km/u":""}${bl.incline?" · "+nfmt(bl.incline)+"% helling":""}${bl.zone?" · "+bl.zone:""}${bl.hr?" · "+bl.hr+" bpm":""}${bl.rest!=null?" · rust "+nfmt(bl.rest)+" min":""}</div>`).join(""):"")}
  else{b.innerHTML=(x.ex||[]).map(e=>{const m=EX[e.id]||{n:e.id,g:""};return `<div class="vex">${exAnim(e.id,"md")}<div><b>${esc(m.n)}</b><div class="ss">${esc(m.g)}</div><div>${(e.sets||[]).length?esc(setsTxt(e.sets)):"Geen sets ingevuld"}</div></div></div>`}).join("")||`<p class="dayempty">Geen oefeningen ingevuld.</p>`+(x.min?`<p class="note-s">${x.min} minuten</p>`:"");
    b.querySelectorAll("[data-info]").forEach(el=>el.addEventListener("click",()=>openExInfo(el.dataset.info)))}
  $("vNote").innerHTML=w.note?`<div class="vnote">${esc(w.note)}</div>`:"";
  const ph=$("vPhotos");ph.innerHTML="";(w.photos||[]).forEach(f=>ph.appendChild(photoTile(null,f)));$("vPhotoBlock").style.display=(w.photos||[]).length?"block":"none";
  renderThread($("vThread"),id);if(unread().some(c=>c.logId===id)){markSeen();render()}
  openSheet("vSheet")}

// ================= COMMENTS =================
function unread(){if(!who)return[];return C.filter(c=>c.author!==who&&c.createdAt>lastSeen&&(c.logId.indexOf(who+"_")===0||C.some(x=>x.logId===c.logId&&x.author===who)))}
function markSeen(){lastSeen=Date.now();try{localStorage.setItem("knokke-seen-"+who,String(lastSeen))}catch(e){}}
function renderThread(box,id){box.innerHTML="";const t=document.createElement("div");t.className="thread";const list=commentsOf(id);
  if(!list.length)t.innerHTML=`<p class="hint" style="margin:0">Nog geen reacties.</p>`;
  list.forEach(c=>{const el=document.createElement("div");el.className="cm";el.innerHTML=`<span class="av" style="background:var(--${c.author})">${NAMES[c.author][0]}</span><div><div class="bub">${esc(c.text)}</div><div class="meta">${NAMES[c.author]} · ${ago(c.createdAt)}${c.author===who?` <button data-del="${esc(c.id)}">verwijderen</button>`:""}</div></div>`;t.appendChild(el)});
  box.appendChild(t);
  t.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",async()=>{b.disabled=true;await run("deleteComment",[b.dataset.del,who],"Reactie verwijderd.");renderThread(box,id)}));
  if(!who){box.insertAdjacentHTML("beforeend",`<p class="hint">Kies eerst wie je bent om te reageren.</p>`);return}
  const owner=id.split("_")[0];
  if(owner!==who){const q=document.createElement("div");q.className="quick";QUICK.forEach(txt=>{const b=document.createElement("button");b.type="button";b.textContent=txt;b.addEventListener("click",()=>send(txt,b));q.appendChild(b)});box.appendChild(q)}
  const f=document.createElement("form");f.className="cform";f.innerHTML=`<input type="text" maxlength="500" placeholder="${owner===who?"Antwoord of extra boodschap…":"Schrijf een reactie…"}" aria-label="Reactie"><button type="submit">Stuur</button>`;box.appendChild(f);
  f.addEventListener("submit",e=>{e.preventDefault();const v=f.querySelector("input").value.trim();if(v)send(v,f.querySelector("button"))});
  async function send(text,btn){btn.disabled=true;try{apply(await call("addComment",id,who,text));pushComment(id,text);markSeen();renderThread(box,id);render()}catch(e){btn.disabled=false;setStatus(errText(e),true)}}}

// ================= PHOTOS =================
// Foto's worden na de eerste keer op je gsm bewaard, zodat ze daarna meteen verschijnen
const PHOTO_CACHE="voltage-photos";const photoWait={};
function getPhotoCached(fid){if(photoCache[fid])return Promise.resolve(photoCache[fid]);if(photoWait[fid])return photoWait[fid];
  const key="/foto/"+fid;
  return photoWait[fid]=(async()=>{try{if(window.caches){const c=await caches.open(PHOTO_CACHE);const hit=await c.match(key);if(hit){const u=await hit.text();photoCache[fid]=u;return u}}}catch(_){}
    const u=await call("getPhoto",fid);photoCache[fid]=u;try{if(window.caches)(await caches.open(PHOTO_CACHE)).put(key,new Response(u)).catch(()=>{})}catch(_){}return u})().finally(()=>{delete photoWait[fid]})}
function loadPhoto(fid,img,wrap){getPhotoCached(fid).then(u=>{img.src=u;wrap.classList.remove("load")}).catch(()=>{wrap.classList.remove("load")})}
// Kiezen tussen camera en galerij (overal in de app)
let pickDone=null;
function pickPhotos(multi){return new Promise(res=>{pickDone=res;$("inGal").multiple=!!multi;openSheet("psSheet")})}
function pickedFiles(input){const f=[...input.files];input.value="";closeSheet("psSheet");if(pickDone){const r=pickDone;pickDone=null;r(f)}}
$("psCam").addEventListener("click",()=>{$("inCam").click()});
$("psGal").addEventListener("click",()=>{$("inGal").click()});
$("inCam").addEventListener("change",()=>pickedFiles($("inCam")));
$("inGal").addEventListener("change",()=>pickedFiles($("inGal")));
function photoTile(src,fid,onRemove){const w=document.createElement("div");w.className="ph"+(fid&&!src?" load":"");const img=document.createElement("img");img.alt="Workoutfoto";w.appendChild(img);
  if(src)img.src=src;else if(fid)loadPhoto(fid,img,w);img.addEventListener("click",()=>{if(img.src)lightbox(img.src)});
  if(onRemove){const x=document.createElement("button");x.className="x";x.type="button";x.setAttribute("aria-label","Foto verwijderen");x.textContent="×";x.addEventListener("click",e=>{e.stopPropagation();onRemove()});w.appendChild(x)}return w}
function lightbox(src){$("lbImg").src=src;$("lightbox").classList.add("open")}
$("lightbox").addEventListener("click",()=>$("lightbox").classList.remove("open"));
function resize(file){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const max=1400;let{width:w,height:h}=im;if(w>max||h>max){const k=max/Math.max(w,h);w=Math.round(w*k);h=Math.round(h*k)}
  const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);res(c.toDataURL("image/jpeg",0.8))};im.src=r.result};r.readAsDataURL(file)})}

// ================= FEED =================
function renderFeed(){const un=unread();const nb=$("newc");
  if(un.length){nb.textContent=un.length===1?"1 nieuwe reactie":un.length+" nieuwe reacties";nb.classList.add("show")}else nb.classList.remove("show");
  const items=W.map(w=>({t:w.updatedAt,w})).concat(C.map(c=>({t:c.createdAt,c}))).sort((a,b)=>b.t-a.t).slice(0,15);
  const feed=$("feed");
  if(!items.length){feed.innerHTML=`<li class="empty">Nog niets gelogd. Tik op je naam en daarna op "+ Training loggen".</li>`;return}
  feed.innerHTML=items.map(it=>{if(it.w){const w=it.w,d=pd(w.date);return `<li data-open="${esc(w.id)}" style="cursor:pointer"><span class="dot" style="background:var(--${w.person})"></span><div><b>${NAMES[w.person]}</b> ${esc(woTitle(w))} · ${esc(woSummary(w))}${(w.photos||[]).length?" · 📷":""}<div class="when">${dayName(d)} ${fd(d)}${w.note?" · “"+esc(w.note)+"”":""}</div></div></li>`}
    const c=it.c,t=byId[c.logId],owner=c.logId.split("_")[0];const whose=owner===c.author?"eigen":(owner===who?"jouw":NAMES[owner]+"'s");
    return `<li data-open="${esc(c.logId)}" class="${un.includes(c)?"unread":""}" style="cursor:pointer"><span class="dot" style="background:var(--${c.author})"></span><div><b>${NAMES[c.author]}</b> reageerde op ${whose} ${esc(t?woTitle(t):"training")}: “${esc(c.text)}”<div class="when">${ago(c.createdAt)}</div></div></li>`}).join("");
  feed.querySelectorAll("[data-open]").forEach(li=>li.addEventListener("click",()=>{const w=byId[li.dataset.open];if(!w)return;if(w.person===who)openEditor({id:w.id});else openView(w.id)}))}
$("newc").addEventListener("click",()=>{const un=unread();markSeen();render();if(un.length){const w=byId[un[un.length-1].logId];if(w){if(w.person===who)openEditor({id:w.id});else openView(w.id)}}});

// ================= MIJN WORKOUTS (per fase) =================
let wkPhase=null;
function renderWorkoutsLib(){const box=$("wlib");if(!box)return;
  if(!who){box.innerHTML=`<p class="dayempty">Tik bovenaan op je naam om je workouts te zien.</p>`;return}
  if(wkPhase==null)wkPhase=phase==="all"?"bulking":phase;
  const mine=TP.filter(t=>t.person===who);
  const counts=k=>mine.filter(t=>(t.category||"")===k).length;
  const tabs=Object.entries(CAT).concat([["","Zonder categorie"]]);
  const list=mine.filter(t=>(t.category||"")===wkPhase).sort((a,b)=>a.kind.localeCompare(b.kind)||a.name.localeCompare(b.name));
  box.innerHTML=`<div class="phasetabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" data-wkph="${k}" aria-selected="${wkPhase===k}">${l}<span>${counts(k)}</span></button>`).join("")}</div>`+
    (list.length?`<div class="wlist2">${list.map(t=>{const n=t.kind==="run"?(RT[t.data&&t.data.rt]||"Run"):`${(t.data&&t.data.ex||[]).length} oefeningen`;
      return `<div class="wl-row"><span class="kindtag" style="background:${KIND[t.kind].c}">${KIND[t.kind].l.toUpperCase()}</span><div class="wl-t"><b>${esc(t.name)}</b><span>${esc(n)}</span></div>
      <select data-mvtpl="${esc(t.id)}" aria-label="Categorie van ${esc(t.name)}">${Object.entries(CAT).concat([["","Geen"]]).map(([k,l])=>`<option value="${k}" ${(t.category||"")===k?"selected":""}>${l}</option>`).join("")}</select>
      <button class="sx" data-deltpl="${esc(t.id)}" aria-label="${esc(t.name)} verwijderen">×</button></div>`}).join("")}</div>`
    :`<p class="dayempty">${wkPhase?`Nog geen workouts in ${CAT[wkPhase]}.`:"Alle workouts hebben een categorie."} Bewaar een training als workout en kies de categorie, of verplaats hier een bestaande workout.</p>`);
  box.querySelectorAll("[data-wkph]").forEach(b=>b.addEventListener("click",()=>{wkPhase=b.dataset.wkph;renderWorkoutsLib()}));
  box.querySelectorAll("[data-mvtpl]").forEach(sel=>sel.addEventListener("change",async()=>{const t=TP.find(x=>x.id===sel.dataset.mvtpl);if(!t)return;
    await run("saveTemplate",[{id:t.id,person:who,kind:t.kind,name:t.name,data:t.data,category:sel.value}],`“${t.name}” staat nu in ${CAT[sel.value]||"Zonder categorie"}.`)}));
  box.querySelectorAll("[data-deltpl]").forEach(b=>b.addEventListener("click",async()=>{const t=TP.find(x=>x.id===b.dataset.deltpl);if(!t)return;
    if(!(await ask(`Opgeslagen workout “${t.name}” verwijderen? Je gelogde trainingen blijven bewaard.`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;
    await run("deleteTemplate",[t.id,who],"Workout verwijderd.")}));
}

// ================= TABBLADEN =================
let tab="train";try{tab=localStorage.getItem("voltage-tab")||"train"}catch(_){}
function showTab(t){if(!["train","prog","rec"].includes(t))t="train";tab=t;try{localStorage.setItem("voltage-tab",t)}catch(_){}
  document.querySelectorAll("[data-tab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===t)));
  const sp=typeof sec==="undefined"||sec==="sport";
  $("tabTrain").hidden=!sp||t!=="train";$("tabProg").hidden=!sp||t!=="prog";$("tabRec").hidden=!sp||t!=="rec";if(sp&&t==="prog")renderProgress();if(sp&&t==="rec")renderRecipes()}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{showTab(b.dataset.tab);window.scrollTo({top:$("tabTrain").offsetTop-80,behavior:"smooth"})}));

// ================= PROGRESS / DASHBOARD =================
let progP=null,period="91",stGroup="Overall",exPick="";
const GROUPS_ST=[["Overall",null],["Borst",["Borst"]],["Rug",["Rug"]],["Schouders",["Schouders"]],["Biceps",["Biceps"]],["Triceps",["Triceps"]],["Benen",["Quadriceps","Hamstrings","Bilspieren","Adductoren"]],["Kuiten",["Kuiten"]],["Core",["Core"]]];
function perFrom(){return period==="all"?"0000-00-00":iso(addDays(T0,-(+period)))}
function e1rm(kg,r){return kg*(1+(Math.max(1,r||1)-1)/30)}
// Per oefening: beste prestatie per trainingsdag
function exHistory(p,exId){const byDate={};
  W.forEach(w=>{if(w.person!==p||(w.kind!=="upper"&&w.kind!=="lower"))return;(w.data&&w.data.ex||[]).forEach(e=>{if(e.id!==exId)return;
    let top=0,best=0,reps=0;(e.sets||[]).forEach(s=>{const kg=num(s.kg)||0,r=num(s.r)||0;if(kg>0){best=Math.max(best,e1rm(kg,r));top=Math.max(top,kg)}reps=Math.max(reps,r)});
    if(!best&&!reps)return;const o=byDate[w.date]||(byDate[w.date]={d:w.date,e1:0,top:0,reps:0});o.e1=Math.max(o.e1,best);o.top=Math.max(o.top,top);o.reps=Math.max(o.reps,reps)})});
  return Object.values(byDate).sort((a,b)=>a.d.localeCompare(b.d)).map(o=>Object.assign(o,{m:o.e1||o.reps,bw:!o.e1}))}
function loggedExercises(p){const set=new Set();W.forEach(w=>{if(w.person===p&&(w.kind==="upper"||w.kind==="lower"))(w.data&&w.data.ex||[]).forEach(e=>{if((e.sets||[]).some(s=>num(s.r)||num(s.kg)))set.add(e.id)})});return [...set]}
// Krachtindex: 100 = start van de periode, per week
function groupIndex(p,groups){const from=perFrom();
  const ids=loggedExercises(p).filter(id=>EX[id]&&(!groups||groups.includes(EX[id].g)));
  const series=ids.map(id=>exHistory(p,id).filter(x=>x.d>=from&&x.m>0)).filter(s=>s.length);
  if(!series.length)return{pts:[],n:0};
  const first=series.reduce((a,s)=>s[0].d<a?s[0].d:a,"9999"),lastD=series.reduce((a,s)=>s[s.length-1].d>a?s[s.length-1].d:a,"0000");const pts=[];
  for(let wk=monday(pd(first));iso(wk)<=lastD;wk=addDays(wk,7)){const end=iso(addDays(wk,6));const r=[];
    let dmax=null;series.forEach(s=>{const base=s[0].m;let last=null;for(const x of s){if(x.d<=end)last=x;else break}if(last){r.push(last.m/base);if(!dmax||last.d>dmax)dmax=last.d}});
    if(r.length&&!pts.some(q=>q.d===dmax))pts.push({d:dmax,y:r.reduce((a,b)=>a+b,0)/r.length*100})}
  return{pts,n:series.length}}
// Eenvoudige lijngrafiek (SVG)
function lineChart(series,o={}){
  const all=series.flatMap(s=>s.pts);if(!all.length)return `<p class="dayempty chart-empty">${o.empty||"Nog geen gegevens in deze periode."}</p>`;
  const W_=Math.max(280,Math.round(o.w||640)),H_=o.h||Math.round(Math.min(260,Math.max(190,W_*0.5))),L=44,R=14,T=22,Bm=28;
  const xs=all.map(p=>pd(p.d).getTime()),ys=all.map(p=>p.y);
  let x0=Math.min(...xs),x1=Math.max(...xs);if(x0===x1){x0-=864e5*3;x1+=864e5*3}
  let y0=Math.min(...ys),y1=Math.max(...ys);if(o.base!=null){y0=Math.min(y0,o.base);y1=Math.max(y1,o.base)}const pad=(y1-y0)*.15||Math.max(1,Math.abs(y1)*.05);y0-=pad;y1+=pad;
  const X=t=>L+(t-x0)/(x1-x0)*(W_-L-R),Y=v=>T+(1-(v-y0)/(y1-y0))*(H_-T-Bm);
  const f=o.fmt||(v=>nfmt(v,1));let g="";
  for(let i=0;i<=3;i++){const v=y0+(y1-y0)*i/3,y=Y(v);g+=`<line x1="${L}" x2="${W_-R}" y1="${y}" y2="${y}" class="gl"/><text x="${L-6}" y="${y+4}" text-anchor="end" class="ax">${esc(f(v))}</text>`}
  if(o.base!=null)g+=`<line x1="${L}" x2="${W_-R}" y1="${Y(o.base)}" y2="${Y(o.base)}" class="bl"/>`;
  const dl=t=>{const d=new Date(t);return d.getDate()+" "+MN[d.getMonth()]};
  const ticks=(x1-x0)>4*864e5?[x0,(x0+x1)/2,x1]:[x0,x1];ticks.forEach((t,i)=>{g+=`<text x="${X(t)}" y="${H_-8}" text-anchor="${i===0?"start":i===ticks.length-1?"end":"middle"}" class="ax">${dl(t)}</text>`});
  series.forEach(s=>{if(!s.pts.length)return;const P_=s.pts.map(p=>[X(pd(p.d).getTime()),Y(p.y)]);
    g+=`<polyline points="${P_.map(q=>q.join(",")).join(" ")}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
    P_.forEach(q=>{g+=`<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="${s.color}"/>`});
    const lq=P_[P_.length-1];g+=`<text x="${Math.min(lq[0],W_-R-4)}" y="${lq[1]-10}" text-anchor="end" class="lv" fill="${s.color}">${esc(f(s.pts[s.pts.length-1].y))}${o.unit||""}</text>`});
  const legend=series.length>1?`<div class="legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join("")}</div>`:"";
  return `<svg viewBox="0 0 ${W_} ${H_}" width="${W_}" height="${H_}" role="img" aria-label="${esc(o.label||"grafiek")}">${g}</svg>${legend}`}
function renderProgress(){
  if($("tabProg").hidden)return;
  if(!progP)progP=who||"lor";const p=progP,mine=p===who;
  document.querySelectorAll("[data-pp]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.pp===p)));
  document.querySelectorAll("[data-per]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.per===period)));
  // profiel
  const pr=PR.find(x=>x.person===p)||{};const bw=B.filter(x=>x.person===p).sort((a,b)=>a.date.localeCompare(b.date));const lastW=bw[bw.length-1];
  const bmi=lastW&&pr.height?lastW.kg/Math.pow(pr.height/100,2):null;
  $("pfKv").innerHTML=`<div><b>${pr.age??"–"}</b>leeftijd</div><div><b>${pr.height?pr.height+" cm":"–"}</b>lengte</div><div><b>${lastW?nfmt(lastW.kg)+" kg":"–"}</b>gewicht</div><div><b>${bmi?nfmt(bmi):"–"}</b>BMI</div>`;
  $("btnProfile").hidden=!mine;$("bwForm").hidden=!mine;
  if(!$("bwDate").value)$("bwDate").value=TODAY;
  // lichaamsgewicht
  const from=perFrom();const bwp=bw.filter(x=>x.date>=from);
  const cw=id=>$(id).clientWidth||340;
  $("bwChart").innerHTML=lineChart([{name:NAMES[p],color:`var(--${p})`,pts:bwp.map(x=>({d:x.date,y:x.kg}))}],{w:cw("bwChart"),unit:" kg",label:"Lichaamsgewicht",empty:mine?"Nog geen gewicht ingevuld. Voeg hierboven je eerste meting toe.":`${NAMES[p]} heeft nog geen gewicht ingevuld.`});
  if(bwp.length>1){const dlt=bwp[bwp.length-1].kg-bwp[0].kg;$("bwDelta").textContent=`${dlt>0?"+":""}${nfmt(dlt)} kg`;$("bwDelta").className="delta"}else{$("bwDelta").textContent="";$("bwDelta").className="delta"}
  $("bwList").innerHTML=bw.slice(-5).reverse().map(x=>`<div class="bwrow"><span>${dayName(pd(x.date)).slice(0,2)} ${fd(pd(x.date))} ${pd(x.date).getFullYear()}</span><b>${nfmt(x.kg)} kg</b>${mine?`<button class="sx" data-delbw="${esc(x.id)}" aria-label="Meting verwijderen">×</button>`:""}</div>`).join("");
  $("bwList").querySelectorAll("[data-delbw]").forEach(b=>b.addEventListener("click",async()=>{if(!(await ask("Deze meting verwijderen?",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;await run("deleteBodyWeight",[b.dataset.delbw,who],"Meting verwijderd.")}));
  // kracht per spiergroep
  const tiles=GROUPS_ST.map(([name,gr])=>{const gi=groupIndex(p,gr);const last=gi.pts.length?gi.pts[gi.pts.length-1].y-100:null;return{name,gi,last}});
  $("stTiles").innerHTML=tiles.map(t=>`<button class="tile ${t.name===stGroup?"on":""}" data-grp="${t.name}"><span>${t.name}</span><b class="${t.last==null?"":t.last>0.05?"up":t.last<-0.05?"down":""}">${t.last==null?"–":(t.last>0?"+":"")+nfmt(t.last,0)+"%"}</b><small>${t.gi.n?t.gi.n+" oefening"+(t.gi.n>1?"en":""):"geen data"}</small></button>`).join("");
  $("stTiles").querySelectorAll("[data-grp]").forEach(b=>b.addEventListener("click",()=>{stGroup=b.dataset.grp;renderProgress()}));
  const cur=tiles.find(t=>t.name===stGroup)||tiles[0];
  $("stChart").innerHTML=`<div class="chart-title">${esc(cur.name)} · krachtindex (100 = start periode)</div>`+lineChart([{name:cur.name,color:"var(--volt)",pts:cur.gi.pts}],{w:cw("stChart"),base:100,fmt:v=>nfmt(v,0),label:"Krachtindex "+cur.name,empty:"Nog geen krachttrainingen met gewichten in deze periode."});
  // per oefening
  const ids=loggedExercises(p).filter(id=>EX[id]).sort((a,b)=>EX[a].n.localeCompare(EX[b].n));
  if(!ids.includes(exPick))exPick=ids[0]||"";
  $("exSel").innerHTML=ids.length?ids.map(id=>`<option value="${id}" ${id===exPick?"selected":""}>${esc(EX[id].n)} (${esc(EX[id].g)})</option>`).join(""):`<option value="">Nog geen oefeningen gelogd</option>`;
  if(exPick){const h=exHistory(p,exPick),hp=h.filter(x=>x.d>=from);const bwOnly=h.every(x=>x.bw);
    const pr_=h.reduce((a,x)=>x.top>a.top?x:a,{top:0});const best=h.reduce((a,x)=>x.m>a.m?x:a,{m:0});
    $("exKv").innerHTML=bwOnly?`<div><b>${best.m||"–"}</b>meeste reps</div><div><b>${h.length}</b>sessies</div>`:`<div><b>${nfmt(pr_.top,2)} kg</b>zwaarste set (PR)</div><div><b>${nfmt(best.e1,1)} kg</b>geschatte 1RM</div><div><b>${h.length}</b>sessies</div>`;
    $("exChart").innerHTML=bwOnly?lineChart([{name:"Reps",color:"var(--volt)",pts:hp.map(x=>({d:x.d,y:x.reps}))}],{w:cw("exChart"),fmt:v=>nfmt(v,0),label:"Reps"})
      :lineChart([{name:"Zwaarste set",color:"var(--volt)",pts:hp.map(x=>({d:x.d,y:x.top}))},{name:"Geschatte 1RM",color:"var(--kracht)",pts:hp.map(x=>({d:x.d,y:x.e1}))}],{w:cw("exChart"),unit:" kg",label:"Gewicht"})}
  else{$("exKv").innerHTML="";$("exChart").innerHTML=`<p class="dayempty chart-empty">Log een Upper- of Lower-training met gewichten om je progressie te zien.</p>`}
}
document.querySelectorAll("[data-pp]").forEach(b=>b.addEventListener("click",()=>{progP=b.dataset.pp;renderProgress()}));
let rsz=null;window.addEventListener("resize",()=>{clearTimeout(rsz);rsz=setTimeout(renderProgress,200)});
document.querySelectorAll("[data-per]").forEach(b=>b.addEventListener("click",()=>{period=b.dataset.per;renderProgress()}));
$("exSel").addEventListener("change",e=>{exPick=e.target.value;renderProgress()});
$("btnProfile").addEventListener("click",()=>{const pr=PR.find(x=>x.person===who)||{};$("pfAge").value=pr.age??"";$("pfHeight").value=pr.height??"";openSheet("pfSheet")});
$("pfForm").addEventListener("submit",async e=>{e.preventDefault();closeSheet("pfSheet");await run("saveProfile",[{person:who,age:num($("pfAge").value),height:num($("pfHeight").value)}],"Profiel opgeslagen.")});
$("bwForm").addEventListener("submit",async e=>{e.preventDefault();const kg=num($("bwKg").value);if(!kg||kg<20||kg>400){ask("Vul een geldig gewicht in, bv. 82,5.",{alert:true});return}
  await run("addBodyWeight",[{person:who,date:$("bwDate").value||TODAY,kg}],"Gewicht opgeslagen.");$("bwKg").value=""});

// ================= RECEPTEN =================
const MEAL={ontbijt:"Ontbijt",lunch:"Lunch",diner:"Diner",snack:"Snack"};
let recMeal="all",recPh="all",recView=null,recEdit=null;
const kcalOf=r=>Math.round((num(r.protein)||0)*4+(num(r.carbs)||0)*4+(num(r.fat)||0)*9);
function macroBar(r,big){const p=num(r.protein)||0,c=num(r.carbs)||0,f=num(r.fat)||0;const e=p*4+c*4+f*9;if(!e)return big?`<p class="note-s">Nog geen macro's ingevuld.</p>`:"";
  const pc=x=>Math.round(x/e*100);
  return `<div class="macros ${big?"big":""}"><div class="mbar"><i style="width:${pc(p*4)}%;background:var(--kracht)"></i><i style="width:${pc(c*4)}%;background:var(--run)"></i><i style="width:${pc(f*9)}%;background:var(--nel)"></i></div>
  <div class="mvals"><span><b style="color:var(--kracht)">${nfmt(p)} g</b>Protein</span><span><b style="color:var(--run)">${nfmt(c)} g</b>Carbs</span><span><b style="color:var(--nel)">${nfmt(f)} g</b>Fat</span><span><b>${Math.round(e)}</b>kcal</span></div></div>`}
function renderRecipes(){if($("tabRec").hidden)return;
  $("recMeal").innerHTML=[["all","Alle maaltijden"]].concat(Object.entries(MEAL)).map(([k,l])=>`<button type="button" data-rmeal="${k}" aria-pressed="${recMeal===k}">${l}</button>`).join("");
  $("recPhase").innerHTML=[["all","Alle fases"]].concat(Object.entries(CAT)).map(([k,l])=>`<button type="button" data-rph="${k}" aria-pressed="${recPh===k}">${l}</button>`).join("");
  $("recMeal").querySelectorAll("[data-rmeal]").forEach(b=>b.addEventListener("click",()=>{recMeal=b.dataset.rmeal;renderRecipes()}));
  $("recPhase").querySelectorAll("[data-rph]").forEach(b=>b.addEventListener("click",()=>{recPh=b.dataset.rph;renderRecipes()}));
  const q=$("recSearch").value.trim().toLowerCase();
  const list=RC.filter(r=>(recMeal==="all"||r.meal===recMeal)&&(recPh==="all"||r.phase===recPh)&&(!q||(r.name+" "+r.ingredients).toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));
  $("recList").innerHTML=list.length?list.map(r=>`<button class="rcard ${r.photo?"hasimg":""}" data-rec="${esc(r.id)}">${r.photo?`<div class="rimg load" data-photo="${esc(r.photo)}"></div>`:""}<div class="rtop"><b>${esc(r.name)}</b><span>${[r.meal?MEAL[r.meal]:"",r.phase?CAT[r.phase]:"",r.servings?r.servings+" porties":""].filter(Boolean).join(" · ")}</span></div>${macroBar(r)}</button>`).join("")
    :`<div class="card"><p class="dayempty">${RC.length?"Geen recepten gevonden met deze filters.":"Nog geen recepten. Tik op <b>+ Nieuw recept</b> of <b>Recept plakken</b> om te beginnen."}</p></div>`;
  $("recList").querySelectorAll("[data-rec]").forEach(b=>b.addEventListener("click",()=>openRecipe(b.dataset.rec)));
  hydratePhotos($("recList"))}
// Recept-foto's pas laden als ze in beeld komen
let photoIO=null;
function showBg(el){getPhotoCached(el.dataset.photo).then(u=>{el.style.backgroundImage=`url("${u}")`;el.classList.remove("load")}).catch(()=>el.classList.remove("load"))}
function hydratePhotos(root){const els=root.querySelectorAll("[data-photo]");if(!("IntersectionObserver" in window)){els.forEach(showBg);return}
  if(!photoIO)photoIO=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){photoIO.unobserve(en.target);showBg(en.target)}}),{rootMargin:"200px"});
  els.forEach(el=>photoIO.observe(el))}
$("recSearch").addEventListener("input",renderRecipes);
function openRecipe(id){const r=RC.find(x=>x.id===id);if(!r)return;recView=id;
  $("rvTitle").textContent=r.name;$("rvSub").textContent=[r.meal?MEAL[r.meal]:"",r.phase?CAT[r.phase]:"",r.servings?`${r.servings} porties · macro's per portie`:"macro's per portie",r.createdBy&&NAMES[r.createdBy]?"van "+NAMES[r.createdBy]:""].filter(Boolean).join(" · ");
  $("rvPhoto").innerHTML=r.photo?`<div class="rimg big load" data-photo="${esc(r.photo)}"></div>`:"";if(r.photo)showBg($("rvPhoto").firstChild);
  $("rvMacros").innerHTML=macroBar(r,true);
  const li=r.ingredients.split("\n").map(x=>x.trim()).filter(Boolean),st=r.steps.split("\n").map(x=>x.trim()).filter(Boolean);
  $("rvIngr").innerHTML=li.length?li.map(x=>`<li>${esc(x)}</li>`).join(""):`<li class="note-s">Geen ingrediënten ingevuld.</li>`;
  $("rvSteps").innerHTML=st.length?st.map(x=>`<li>${esc(x)}</li>`).join(""):`<li class="note-s">Geen bereiding ingevuld.</li>`;
  openSheet("rvSheet")}
let recPhoto={fid:"",staged:null,remove:false};
function renderRecPhoto(){const box=$("rePhoto");const has=recPhoto.staged||(recPhoto.fid&&!recPhoto.remove);
  box.innerHTML=has?`<div class="rimg big ${recPhoto.staged?"":"load"}" ${recPhoto.staged?`style="background-image:url('${recPhoto.staged}')"`:`data-photo="${esc(recPhoto.fid)}"`}></div><div class="rp-actions"><button type="button" class="textbtn" id="rpChange">Andere foto</button><button type="button" class="rm" id="rpRemove">Verwijder foto</button></div>`
    :`<button type="button" class="addph wide" id="rpAdd"><span>+ Foto van het gerecht</span></button>`;
  if(has&&!recPhoto.staged)showBg(box.querySelector("[data-photo]"));
  const pick=async()=>{const f=(await pickPhotos(false))[0];if(!f)return;try{recPhoto.staged=await resize(f);recPhoto.remove=false;renderRecPhoto()}catch(_){setStatus("Die foto kon niet gelezen worden.",true)}};
  (box.querySelector("#rpAdd")||box.querySelector("#rpChange")).addEventListener("click",pick);
  const rm=box.querySelector("#rpRemove");if(rm)rm.addEventListener("click",()=>{recPhoto.staged=null;recPhoto.remove=true;renderRecPhoto()})}
function openRecipeEditor(r,sub){recEdit=r&&r.id?r.id:null;r=r||{};recPhoto={fid:r.photo||"",staged:null,remove:false};renderRecPhoto();
  $("reTitle").textContent=recEdit?"Recept bewerken":"Nieuw recept";$("reSub").textContent=sub||"";
  $("reName").value=r.name||"";$("reMeal").value=r.meal||"";$("rePhase").value=r.phase||"";$("reServ").value=r.servings??"";
  $("reP").value=r.protein??"";$("reC").value=r.carbs??"";$("reF").value=r.fat??"";$("reIngr").value=r.ingredients||"";$("reSteps").value=r.steps||"";
  updKcal();openSheet("reSheet");setTimeout(()=>$("reName").focus(),50)}
function updKcal(){const k=kcalOf({protein:$("reP").value,carbs:$("reC").value,fat:$("reF").value});$("reKcal").textContent=k?`≈ ${k} kcal`:""}
["reP","reC","reF"].forEach(id=>$(id).addEventListener("input",updKcal));
$("btnRecNew").addEventListener("click",()=>{if(!pin)return;openRecipeEditor(null)});
$("btnRecPaste").addEventListener("click",()=>{if(!pin)return;$("rpText").value="";openSheet("rpSheet");setTimeout(()=>$("rpText").focus(),50)});
$("rvEdit").addEventListener("click",()=>{const r=RC.find(x=>x.id===recView);closeSheet("rvSheet");if(r)openRecipeEditor(r)});
$("rvDel").addEventListener("click",async()=>{const r=RC.find(x=>x.id===recView);if(!r)return;if(!(await ask(`Recept “${r.name}” verwijderen?`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;closeSheet("rvSheet");await run("deleteRecipe",[r.id],"Recept verwijderd.")});
$("reForm").addEventListener("submit",async e=>{e.preventDefault();const old=recEdit?RC.find(x=>x.id===recEdit):null;
  const r={id:recEdit,createdBy:old?old.createdBy:(who||""),name:$("reName").value.trim(),meal:$("reMeal").value,phase:$("rePhase").value,servings:num($("reServ").value),
    protein:num($("reP").value),carbs:num($("reC").value),fat:num($("reF").value),ingredients:$("reIngr").value.trim(),steps:$("reSteps").value.trim()};
  if(!r.name){$("reName").focus();return}closeSheet("reSheet");const ph=Object.assign({},recPhoto);
  busy++;setStatus("Recept opslaan…");
  try{let res=await call("saveRecipe",r);const id=res.savedId;
    if(ph.staged){setStatus("Foto opladen…");res=await call("uploadRecipePhoto",id,ph.staged)}
    else if(ph.remove&&ph.fid)res=await call("removeRecipePhoto",id);
    busy--;apply(res);if(!r.id&&who)push(other(),`${NAMES[who]} voegde een recept toe`,r.name);setStatus(`Recept “${r.name}” opgeslagen.`)}
  catch(e){busy--;setStatus(errText(e),true);refresh()}});
// --- recept uit geplakte tekst halen ---
function parseRecipe(text){
  const lines=String(text||"").replace(/\r/g,"").split("\n").map(l=>l.replace(/\s+/g," ").trim());
  const r={name:"",ingredients:[],steps:[],protein:null,carbs:null,fat:null,servings:null,meal:"",phase:""};const found=[];
  const ING=/^(ingredi[eë]nten|ingredients|benodigdheden|boodschappen|wat heb je nodig)\b\s*:?\s*/i,STEP=/^(bereiding(swijze)?|werkwijze|instructies|instructions|method|directions|stappen|zo maak je het|aan de slag)\b\s*:?\s*/i,MAC=/^(macro'?s|voedingswaarde[n]?|nutrition|voedingsinfo)\b/i;
  const n1="(\\d+(?:[.,]\\d+)?)";let total=false,sec=null;
  const grab=(l,words)=>{let m=l.match(new RegExp("(?:"+words+")\\s*[:=\\-]?\\s*"+n1+"\\s*g?\\b","i"))||l.match(new RegExp(n1+"\\s*g(?:ram)?\\s*(?:"+words+")\\b","i"));return m?num(m[1]):null};
  const PW="prote[iï]ne?s?|protein|eiwit(?:ten)?",CW="carbs?|carbohydrates?|koolhydraten|kh",FW="vet(?:ten)?|fat|fats";
  for(const raw of lines){let l=raw;if(!l)continue;
    const isBullet=/^([-•*·]|\d+[.)])\s+/.test(l);const clean=l.replace(/^([-•*·]|\d+[.)]|stap \d+:?)\s*/i,"").trim();
    // macro's (ook midden in een zin)
    const p=grab(l,PW),c=grab(l,CW),f=grab(l,FW);const isMacroLine=(p!=null)+(c!=null)+(f!=null)>=1&&l.length<140&&!(sec==="ing"&&isBullet&&!/:/.test(l));
    if(isMacroLine){if(p!=null&&r.protein==null)r.protein=p;if(c!=null&&r.carbs==null)r.carbs=c;if(f!=null&&r.fat==null)r.fat=f;if(/totaal|total|hele recept/i.test(l))total=true}
    const sv=l.match(/(\d+)\s*(porties?|personen|pers\.?|servings?)\b/i)||l.match(/(?:porties?|personen|servings?|serves|voor|makes)\s*[:\-]?\s*(\d+)\b/i);
    const isMeta=l.length<60&&!isBullet;
    if(sv&&(isMeta||isMacroLine)&&r.servings==null)r.servings=+sv[1];
    const ml=l.match(/\b(ontbijt|breakfast|lunch|diner|avondeten|dinner|snack|tussendoortje)\b/i);if(ml&&isMeta&&!r.meal)r.meal={ontbijt:"ontbijt",breakfast:"ontbijt",lunch:"lunch",diner:"diner",avondeten:"diner",dinner:"diner",snack:"snack",tussendoortje:"snack"}[ml[1].toLowerCase()];
    const ph=l.match(/\b(bulk(?:ing)?|cut(?:ting)?|maintenance|onderhoud)\b/i);if(ph&&isMeta&&!r.phase)r.phase=/bulk/i.test(ph[1])?"bulking":/cut/i.test(ph[1])?"cutting":"maintenance";
    if(ING.test(l)){sec="ing";const rest=l.replace(ING,"");if(rest)r.ingredients.push(...rest.split(/,\s*/));continue}
    if(STEP.test(l)){sec="step";const rest=l.replace(STEP,"");if(rest)r.steps.push(rest);continue}
    if(MAC.test(l)&&!isMacroLine){sec="mac";continue}
    if(!r.name){r.name=l.replace(/^(recept|recipe)\s*[:\-]\s*/i,"").replace(/^#+\s*/,"");continue}
    if(isMacroLine||sec==="mac"&&/\d/.test(l))continue;
    if((sv||ml||ph)&&isMeta&&l.split(" ").length<=8)continue;
    if(/^\d+\s*kcal\b|^kcal/i.test(l))continue;
    if(sec==="ing")r.ingredients.push(clean);
    else if(sec==="step")r.steps.push(clean);
    else if(isBullet||/^\d+(?:[.,]\d+)?\s*(g|gr|gram|kg|ml|l|el|tl|stuks?|st|blik|teen|tenen)\b/i.test(l))r.ingredients.push(clean);
    else r.steps.push(clean)}
  if(total&&r.servings>1){["protein","carbs","fat"].forEach(k=>{if(r[k]!=null)r[k]=Math.round(r[k]/r.servings*10)/10})}
  if(r.name)found.push("naam");if(r.ingredients.length)found.push(r.ingredients.length+" ingrediënten");if(r.steps.length)found.push(r.steps.length+" stappen");
  if(r.protein!=null||r.carbs!=null||r.fat!=null)found.push("macro's");if(r.servings)found.push(r.servings+" porties");
  return Object.assign(r,{ingredients:r.ingredients.join("\n"),steps:r.steps.join("\n"),found,total})}
$("rpGo").addEventListener("click",()=>{const t=$("rpText").value;if(!t.trim()){$("rpText").focus();return}const r=parseRecipe(t);closeSheet("rpSheet");
  openRecipeEditor(r,(r.found.length?"Herkend: "+r.found.join(", ")+". ":"Weinig herkend. ")+(r.total?"Macro's omgerekend per portie. ":"")+"Controleer en tik op Opslaan.")});

// ================= MELDINGEN (ntfy, verstuurd door de app zelf) =================
function push(to,title,message){const topic=NT[to];if(!topic)return Promise.resolve(false);
  // text/plain-verzoek: werkt vanuit de browser zonder account; ntfy leest de JSON zelf
  return fetch("https://ntfy.sh/",{method:"POST",body:JSON.stringify({topic,title,message,click:location.origin+location.pathname,tags:["zap"]})})
    .then(r=>r.ok).catch(()=>false)}
const other=()=>who==="lor"?"nel":"lor";
function dshort(ds){return fd(pd(ds))}
function pushWorkout(pl){const d=pl.data||{};let what=pl.kind==="run"?(RT[d.rt]||"Run")+(isTM(d)&&d.rt!=="walk"?" op de loopband":""):KIND[pl.kind].l;
  if(d.tplName)what+=" · "+d.tplName;let extra="";
  if(pl.kind==="run"&&d.km)extra=nfmt(d.km)+" km";if(pl.kind!=="run"&&d.ex&&d.ex.length)extra=d.ex.length+" oefening"+(d.ex.length>1?"en":"");
  return push(other(),`${NAMES[who]} heeft getraind`,`${what}${extra?" · "+extra:""} · ${dshort(pl.date)}`)}
function pushComment(logId,text){const owner=logId.split("_")[0];const t=text.length>120?text.slice(0,117)+"…":text;
  if(owner!==who)return push(owner,`${NAMES[who]} reageerde op je training`,t);
  if(C.some(c=>c.logId===logId&&c.author===other()))return push(other(),`${NAMES[who]} antwoordde op je reactie`,t);
  return Promise.resolve(false)}
$("btnPushTest").addEventListener("click",async()=>{if(!who){ask("Tik eerst bovenaan op je naam.",{alert:true});return}
  if(!NT.lor&&!NT.nel){ask("De server geeft nog geen meldingsnamen door. Publiceer de nieuwe Code.gs als nieuwe versie.",{alert:true,title:"Nog niet klaar"});return}
  setStatus("Testmeldingen versturen…");
  const [a,b]=await Promise.all([push("lor","VOLTAGE test",`Test van ${NAMES[who]}: meldingen voor Lorenzo werken.`),push("nel","VOLTAGE test",`Test van ${NAMES[who]}: meldingen voor Nele werken.`)]);
  const txt=`Lorenzo: ${a?"verstuurd ✓":"mislukt"} · Nele: ${b?"verstuurd ✓":"mislukt"}`;
  setStatus(txt,!(a&&b));ask(txt+(a&&b?". Krijgen jullie niets? Controleer dan het abonnement in de ntfy-app.":". Controleer je internetverbinding."),{alert:true,title:"Testmelding"})});

// ================= BOODSCHAPPEN =================
const SCATS=["Voeding","Drank","Huishouden","Verzorging","Huisdieren","Overig"];
const SCAT_C={Voeding:"var(--lsd)",Drank:"var(--kracht)",Huishouden:"var(--run)",Verzorging:"var(--nel)",Huisdieren:"var(--kino)",Overig:"var(--rust)"};
let S={products:[],lists:[],items:[],settings:{}};
let stab="list",shopWeek=iso(monday(T0)),shopStore="all",hideDone=false,shopMon=new Date(T0.getFullYear(),T0.getMonth(),1),shopDirty=false,pdEdit=null;
try{stab=localStorage.getItem("voltage-stab")||"list";hideDone=localStorage.getItem("voltage-hidedone")==="1";shopStore=localStorage.getItem("voltage-store")||"all"}catch(_){}
const eur=v=>(Math.round((Number(v)||0)*100)/100).toLocaleString("nl-BE",{style:"currency",currency:"EUR"});
const pnum=v=>{v=String(v==null?"":v).replace(/[€\s]/g,"");if(!v)return null;const n=num(v);return n==null||n<0?NaN:Math.round(n*100)/100};
const sname=s=>s||"Zonder winkel";
const ptxt=v=>v==null?"":String(v).replace(".",",");
function shopStores(){const set=new Set();S.products.forEach(p=>set.add(p.store||""));S.items.forEach(i=>set.add(i.store||""));return[...set].sort((a,b)=>!a?1:!b?-1:a.localeCompare(b))}
function listOf(w){return S.lists.find(l=>l.week===w)}
function prodOf(id){return id?S.products.find(p=>p.id===id):null}
function eff(i){if(i.price!=null)return i.price;const p=prodOf(i.productId);return p&&p.lastPrice!=null?p.lastPrice:null}
// ---- live wijzigingen: meteen zichtbaar, op de achtergrond doorgestuurd (ook bij slecht bereik) ----
const pend={};let shopOffline=false;
function savePend(){try{const o={};Object.keys(pend).forEach(k=>o[k]=pend[k].patch);localStorage.setItem("voltage-shop-pend",JSON.stringify(o))}catch(_){}}
function curItem(id){const i=S.items.find(x=>x.id===id);return i?(pend[id]?Object.assign({},i,pend[id].patch):i):null}
function itemsOf(lid){return S.items.filter(i=>i.listId===lid).map(i=>pend[i.id]?Object.assign({},i,pend[i.id].patch):i)}
function queueItem(id,patch){const p=pend[id]||(pend[id]={patch:{},seq:0,timer:null,inflight:0});Object.assign(p.patch,patch);p.seq++;savePend();
  clearTimeout(p.timer);p.timer=setTimeout(()=>flushItem(id),400);renderShop()}
async function flushItem(id){const p=pend[id];if(!p)return;if(!pin){p.timer=setTimeout(()=>flushItem(id),3000);return}
  const seq=p.seq,patch=Object.assign({},p.patch);p.inflight++;
  try{const res=await call("updateListItem",id,patch,who||"");p.inflight--;if(pend[id]===p&&p.seq===seq&&!p.inflight){delete pend[id];savePend()}apply(res);if(shopOffline&&!Object.keys(pend).length){shopOffline=false;setStatus("Weer verbonden: alles is bijgewerkt.")}}
  catch(e){p.inflight--;const m=String(e&&e.message||e);
    if(m.includes("NO_ITEM")){delete pend[id];savePend();refreshShop();return}
    shopOffline=true;setStatus("Geen verbinding: je wijzigingen staan klaar en worden verstuurd zodra je weer bereik hebt.",true);clearTimeout(p.timer);p.timer=setTimeout(()=>flushItem(id),4000)}}
try{const saved=JSON.parse(localStorage.getItem("voltage-shop-pend")||"{}");Object.keys(saved).forEach(id=>{pend[id]={patch:saved[id],seq:1,timer:setTimeout(()=>flushItem(id),2500),inflight:0}})}catch(_){}
if(Object.keys(pend).length)shopOffline=true;
async function shopRun(fn,args,msg){setStatus("Bezig…");try{const r=await call(fn,...args);apply(r);setStatus(msg);return r}catch(e){setStatus(errText(e),true);refreshShop();return null}}
let shopPolling=false;
async function refreshShop(){if(!pin||shopPolling)return;shopPolling=true;try{apply(await call("getShop"))}catch(_){}finally{shopPolling=false}}
// ---- weergave ----
function shopTyping(){const a=document.activeElement;return !!(a&&$("tabShop").contains(a)&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)&&a.type!=="checkbox")}
$("tabShop").addEventListener("focusout",()=>setTimeout(()=>{if(shopDirty&&!shopTyping()){shopDirty=false;renderShop()}},60));
function setStab(t){stab=t;try{localStorage.setItem("voltage-stab",t)}catch(_){}renderShop(true)}
function renderShop(force){if(!$("tabShop")||$("tabShop").hidden)return;
  if(!force&&shopTyping()){shopDirty=true;renderShopBar();return}
  document.querySelectorAll("[data-stab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.stab===stab)));
  $("storeList").innerHTML=shopStores().filter(Boolean).map(s=>`<option value="${esc(s)}">`).join("");
  $("shopListV").hidden=stab!=="list";$("shopProdV").hidden=stab!=="prod";$("shopMonthV").hidden=stab!=="month";
  if(stab==="list")renderShopList();else if(stab==="prod")renderProducts();else renderShopMonth();
  renderShopBar()}
function sortItems(a,b){return sname(a.store).localeCompare(sname(b.store))||SCATS.indexOf(a.category)-SCATS.indexOf(b.category)||a.name.localeCompare(b.name)}
function itemRow(i){const p=eff(i),est=i.price==null&&p!=null,lt=p!=null?p*i.qty:null;
  return `<div class="si ${i.checked?"done":""}">
  <button type="button" class="sichk" data-chk="${esc(i.id)}" aria-pressed="${i.checked}" aria-label="${esc(i.name)} ${i.checked?"uit de kar halen":"in de kar"}"></button>
  <div class="si-n"><b>${esc(i.name)}</b>${i.unit?`<span>${esc(i.unit)}</span>`:""}</div>
  <div class="si-q"><button type="button" data-dq="${esc(i.id)}" data-d="-1" aria-label="Minder ${esc(i.name)}" ${i.qty<=1?"disabled":""}>−</button><span>${i.qty}</span><button type="button" data-dq="${esc(i.id)}" data-d="1" aria-label="Meer ${esc(i.name)}">+</button></div>
  <div class="si-p"><label><span>€ / stuk</span><input type="text" inputmode="decimal" data-price="${esc(i.id)}" value="${ptxt(i.price)}" placeholder="${est?ptxt(p):"prijs"}" aria-label="Prijs per stuk ${esc(i.name)}"></label><span class="lt ${est?"est":""}">${lt!=null?(est?"≈ ":"")+eur(lt):""}</span><button type="button" class="sx" data-rmi="${esc(i.id)}" aria-label="${esc(i.name)} van de lijst halen">×</button></div>
</div>`}
function renderShopList(){const mon=pd(shopWeek),cur=shopWeek===iso(monday(T0)),lst=listOf(shopWeek);
  $("swLabel").textContent=`Week van ${fd(mon)}`;$("swSub").textContent=`${fd(mon)} – ${fd(addDays(mon,6))} ${addDays(mon,6).getFullYear()}${cur?" · deze week":""}`;
  const box=$("shopListBody");
  if(!lst){const fx=S.products.filter(p=>p.fixed);const ns=new Set(fx.map(p=>p.store)).size;
    box.innerHTML=`<section class="card gencard">${fx.length?`<p class="note-s">${fx.length} vaste product${fx.length>1?"en":""} in ${ns} winkel${ns!==1?"s":""} staan klaar.</p><button class="primary genbtn" data-act="gen">Genereer boodschappenlijst</button>`
      :`<p class="dayempty">Je hebt nog geen vaste producten. Voeg eerst je producten toe, dan maakt de app elke week in één tik je lijst.</p><button class="primary genbtn" data-stab-go="prod">Producten toevoegen</button>`}<button class="linkish" data-act="empty">Of start een lege lijst</button></section>`;return}
  const all=itemsOf(lst.id).sort(sortItems);const st=[...new Set(all.map(i=>i.store))];
  if(shopStore!=="all"&&!st.includes(shopStore))shopStore="all";
  const vis=all.filter(i=>(shopStore==="all"||i.store===shopStore)&&(!hideDone||!i.checked));
  const fxMissing=S.products.filter(p=>p.fixed&&!all.some(i=>i.productId===p.id)).length;
  let h=`<div class="phasechips shopchips">${[["all","Alle winkels",all]].concat(st.map(s=>[s,sname(s),all.filter(i=>i.store===s)])).map(([k,l,arr])=>`<button type="button" data-store="${esc(k)}" aria-pressed="${shopStore===k}">${esc(l)} <span>${arr.filter(i=>!i.checked).length}</span></button>`).join("")}</div>
  <label class="chk hidedone"><input type="checkbox" data-act="hide" ${hideDone?"checked":""}><span>Verberg wat al in de kar zit</span></label>`;
  if(!all.length)h+=`<section class="card"><p class="dayempty">De lijst is nog leeg. Voeg hieronder producten toe.</p></section>`;
  else if(!vis.length)h+=`<section class="card"><p class="dayempty">Alles zit in de kar. Goed gedaan.</p></section>`;
  st.forEach(s=>{const sv=vis.filter(i=>i.store===s);if(!sv.length)return;const sa=all.filter(i=>i.store===s);const done=sa.filter(i=>i.checked);
    const sub=done.reduce((a,i)=>a+(eff(i)||0)*i.qty,0);
    h+=`<section class="card shopstore"><div class="ss-head"><h3>${esc(sname(s))}</h3><span>${done.length}/${sa.length} in de kar${sub?" · "+eur(sub):""}</span></div>`;
    SCATS.forEach(c=>{const ci=sv.filter(i=>i.category===c);if(!ci.length)return;h+=`<div class="ss-cat"><i style="background:${SCAT_C[c]}"></i>${c}</div>`+ci.map(itemRow).join("")});
    h+=`</section>`});
  h+=`<div class="shopactions"><button class="primary" data-act="add">+ Product toevoegen</button>${fxMissing?`<button class="textbtn" data-act="fill">Vaste producten aanvullen (${fxMissing})</button>`:""}<button class="rm" data-act="dellist">Lijst wissen</button></div>`;
  box.innerHTML=h}
function shopTotals(lid){let inCart=0,est=0,done=0,n=0;itemsOf(lid).forEach(i=>{n++;const p=eff(i);if(p!=null)est+=p*i.qty;if(i.checked){done++;if(p!=null)inCart+=p*i.qty}});return{inCart,est,done,n}}
function renderShopBar(){const bar=$("shopBar");const lst=listOf(shopWeek);if(stab!=="list"||!lst){bar.hidden=true;return}
  const t=shopTotals(lst.id),B=S.settings.weekBudget,over=B&&t.inCart>B;bar.hidden=false;
  bar.innerHTML=`<div class="sb-row"><div><span>In de kar</span><b>${eur(t.inCart)}</b></div><div><span>Geschat totaal</span><b>${eur(t.est)}</b></div><button type="button" class="sb-budget" data-act="budget"><span>Weekbudget</span><b>${B?eur(B):"Instellen"}</b></button></div>
  ${B?`<div class="bar sb-bar ${over?"over":""}"><i style="width:${Math.min(100,t.inCart/B*100)}%"></i></div>`:""}<div class="sb-note">${t.done}/${t.n} in de kar${B?` · ${over?eur(t.inCart-B)+" over budget":"nog "+eur(B-t.inCart)+" over"}`:""}</div>`}
function renderProducts(){const q=($("prodSearch").value||"").trim().toLowerCase();
  const list=S.products.filter(p=>!q||(p.name+" "+p.store+" "+p.category).toLowerCase().includes(q));
  $("prodCount").textContent=`${S.products.length} item${S.products.length!==1?"s":""}`;
  if(!list.length){$("prodList").innerHTML=`<p class="dayempty">${S.products.length?"Geen producten gevonden.":"Nog geen producten toegevoegd. Gebruik het formulier om je database op te bouwen."}</p>`;return}
  const lst=listOf(shopWeek),on=new Set(lst?itemsOf(lst.id).map(i=>i.productId):[]);
  const st=[...new Set(list.map(p=>p.store))].sort((a,b)=>!a?1:!b?-1:a.localeCompare(b));
  $("prodList").innerHTML=st.map(s=>{const ps=list.filter(p=>p.store===s).sort((a,b)=>SCATS.indexOf(a.category)-SCATS.indexOf(b.category)||a.name.localeCompare(b.name));
    return `<div class="pr-store"><h3>${esc(sname(s))}</h3><span>${ps.length}</span></div>`+ps.map(p=>`<div class="pr">
      <button type="button" class="pr-main" data-editprod="${esc(p.id)}"><b>${esc(p.name)}</b><span><i style="background:${SCAT_C[p.category]}"></i>${p.category} · ${p.qty}${p.unit?" "+esc(p.unit):"×"}${p.lastPrice!=null?" · "+eur(p.lastPrice):""}</span></button>
      <button type="button" class="fixbtn" data-fix="${esc(p.id)}" aria-pressed="${p.fixed}" title="Vast product: komt elke week op de lijst">Vast</button>
      <button type="button" class="iconbtn addprod ${on.has(p.id)?"on":""}" data-addprod="${esc(p.id)}" aria-label="${esc(p.name)} op de lijst van de week van ${fd(pd(shopWeek))}" ${on.has(p.id)?"disabled":""}>${on.has(p.id)?"✓":"+"}</button></div>`).join("")}).join("")}
function boughtItems(){return S.items.filter(i=>i.checked).map(i=>{const l=S.lists.find(x=>x.id===i.listId);return Object.assign({},i,{d:i.boughtAt||(l?l.week:""),amt:i.price!=null?i.price*i.qty:null})})}
function hbars(rows,colorFn){const max=Math.max(...rows.map(r=>r[1]),0);return rows.length?rows.map(([l,v,c])=>`<div class="hb"><span class="hb-l">${esc(l)}</span><div class="hb-t"><i style="width:${max?v/max*100:0}%;background:${c||"var(--volt)"}"></i></div><b>${eur(v)}</b></div>`).join(""):`<p class="dayempty">Nog niets gekocht deze maand.</p>`}
function renderShopMonth(){const y=shopMon.getFullYear(),m=shopMon.getMonth(),key=`${y}-${String(m+1).padStart(2,"0")}`;
  const all=boughtItems(),b=all.filter(i=>i.d.startsWith(key)),tot=b.reduce((a,i)=>a+(i.amt||0),0),np=b.filter(i=>i.amt==null).length;
  const pm=new Date(y,m-1,1),pk=`${pm.getFullYear()}-${String(pm.getMonth()+1).padStart(2,"0")}`,ptot=all.filter(i=>i.d.startsWith(pk)).reduce((a,i)=>a+(i.amt||0),0);
  const MB=S.settings.monthBudget,over=MB&&tot>MB;
  const sum=(arr,f)=>{const o={};arr.forEach(i=>{const k=f(i);o[k]=(o[k]||0)+(i.amt||0)});return o};
  const wk=sum(b,i=>iso(monday(pd(i.d)))),stO=sum(b,i=>sname(i.store)),caO=sum(b,i=>i.category);
  const WB=S.settings.weekBudget;
  const weeks=Object.keys(wk).sort().map(k=>[`Week van ${fd(pd(k))}`,wk[k],WB&&wk[k]>WB?"var(--run)":"var(--volt)"]);
  const six=[];for(let k=5;k>=0;k--){const d=new Date(y,m-k,1),kk=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;six.push([MN[d.getMonth()],all.filter(i=>i.d.startsWith(kk)).reduce((a,i)=>a+(i.amt||0),0),k===0])}
  const smax=Math.max(...six.map(x=>x[1]),MB||0,1)*1.12;
  const dl=ptot?tot-ptot:null;
  $("smBody").innerHTML=`<div class="card-head"><h2>${MNF[m]} ${y}</h2><div class="nav"><button class="iconbtn" data-act="mprev" aria-label="Vorige maand">‹</button><button class="iconbtn" data-act="mnext" aria-label="Volgende maand">›</button></div></div>
  <div class="smtot"><div><span>Uitgegeven</span><b>${eur(tot)}</b>${dl!=null?`<em class="${dl>0?"up":"down"}">${dl>0?"+":"−"}${eur(Math.abs(dl))} t.o.v. ${MNF[pm.getMonth()]}</em>`:""}</div>
    <button type="button" class="sb-budget" data-act="budget"><span>Maandbudget</span><b>${MB?eur(MB):"Instellen"}</b></button></div>
  ${MB?`<div class="bar sb-bar ${over?"over":""}"><i style="width:${Math.min(100,tot/MB*100)}%"></i></div><p class="sb-note">${over?eur(tot-MB)+" over budget":"Nog "+eur(MB-tot)+" over deze maand"}</p>`:""}
  ${np?`<p class="note-s">${np} gekocht${np>1?"e producten":" product"} zonder prijs, ${np>1?"die tellen":"dat telt"} niet mee.</p>`:""}
  <div class="sub-h">Per week</div>${hbars(weeks)}
  <div class="sub-h">Per winkel</div>${hbars(Object.entries(stO).sort((a,b)=>b[1]-a[1]))}
  <div class="sub-h">Per categorie</div>${hbars(Object.entries(caO).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,v,SCAT_C[k]]))}
  <div class="sub-h">Laatste 6 maanden</div>
  <div class="cols">${six.map(([l,v,cur])=>`<div class="col ${cur?"cur":""}"><b>${v?eur(v).replace(/,00/,""):""}</b><div class="col-t"><i style="height:${v/smax*100}%;background:${MB&&v>MB?"var(--run)":"var(--volt)"}"></i>${MB?`<u style="bottom:${MB/smax*100}%"></u>`:""}</div><span>${l}</span></div>`).join("")}</div>
  ${MB?`<p class="note-s" style="margin-top:6px">De stippellijn is jullie maandbudget.</p>`:""}`}
// ---- acties ----
async function genList(empty){if(!pin)return;
  const items=empty?[]:S.products.filter(p=>p.fixed).map(p=>({productId:p.id,name:p.name,store:p.store,category:p.category,qty:p.qty,unit:p.unit}));
  const r=await shopRun("createList",[shopWeek,who||"",items],empty?"Lege lijst gestart.":`Boodschappenlijst klaar: ${items.length} producten.`);
  if(r&&r.isNew&&who&&items.length)push(other(),`${NAMES[who]} maakte de boodschappenlijst`,`${items.length} producten · week van ${fd(pd(shopWeek))}`);
  return r}
async function ensureList(){const l=listOf(shopWeek);if(l)return l.id;const r=await genList(true);return r?r.savedId:null}
async function addProdToList(p){const lid=await ensureList();if(!lid)return;
  await shopRun("addListItems",[lid,[{productId:p.id,name:p.name,store:p.store,category:p.category,qty:p.qty,unit:p.unit}]],`${p.name} staat op de lijst van de week van ${fd(pd(shopWeek))}.`)}
$("tabShop").addEventListener("click",async e=>{const b=e.target.closest("button,input[data-act]");if(!b||!$("tabShop").contains(b))return;const d=b.dataset;
  if(d.stab){setStab(d.stab);return}
  if(d.stabGo){setStab(d.stabGo);return}
  if(d.store!==undefined){shopStore=d.store;try{localStorage.setItem("voltage-store",shopStore)}catch(_){}renderShop(true);return}
  if(d.chk){const it=curItem(d.chk);if(!it)return;const patch={checked:!it.checked,boughtAt:TODAY};
    if(!it.checked&&it.price==null){const p=eff(it);if(p!=null)patch.price=p}
    if(!it.checked&&navigator.vibrate)navigator.vibrate(10);queueItem(it.id,patch);return}
  if(d.dq){const it=curItem(d.dq);if(!it)return;queueItem(it.id,{qty:Math.max(1,Math.min(999,(it.qty||1)+Number(d.d)))});return}
  if(d.rmi){const it=curItem(d.rmi);if(!it||!(await ask(`${it.name} van de lijst halen?`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;
    clearTimeout(pend[it.id]&&pend[it.id].timer);delete pend[it.id];savePend();S.items=S.items.filter(x=>x.id!==it.id);renderShop(true);await shopRun("deleteListItem",[it.id],`${it.name} van de lijst gehaald.`);return}
  if(d.editprod){openProd(d.editprod);return}
  if(d.fix){const p=prodOf(d.fix);if(!p)return;p.fixed=!p.fixed;renderShop(true);await shopRun("saveProduct",[p],p.fixed?`${p.name} is nu een vast product.`:`${p.name} is geen vast product meer.`);return}
  if(d.addprod){const p=prodOf(d.addprod);if(p)await addProdToList(p);return}
  const a=d.act;if(!a)return;
  if(a==="hide"){hideDone=b.checked;try{localStorage.setItem("voltage-hidedone",hideDone?"1":"0")}catch(_){}renderShop(true);return}
  if(a==="wprev"||a==="wnext"||a==="wnow"){shopWeek=a==="wnow"?iso(monday(T0)):iso(addDays(pd(shopWeek),a==="wprev"?-7:7));renderShop(true);return}
  if(a==="mprev"||a==="mnext"){shopMon=new Date(shopMon.getFullYear(),shopMon.getMonth()+(a==="mprev"?-1:1),1);renderShop(true);return}
  if(a==="gen"){await genList(false);return}
  if(a==="empty"){await genList(true);return}
  if(a==="fill"){await genList(false);return}
  if(a==="add"){openAdd();return}
  if(a==="budget"){$("bgWeek").value=ptxt(S.settings.weekBudget);$("bgMonth").value=ptxt(S.settings.monthBudget);openSheet("bgSheet");return}
  if(a==="dellist"){const l=listOf(shopWeek);if(!l)return;const n=itemsOf(l.id).filter(i=>i.checked).length;
    if(!(await ask(`De boodschappenlijst van de week van ${fd(pd(shopWeek))} wissen?${n?` ${n} afgevinkte product${n>1?"en tellen":" telt"} dan niet meer mee in het maandoverzicht.`:""}`,{title:"Lijst wissen?",ok:"Ja, wissen",danger:true})))return;
    await shopRun("deleteList",[l.id],"Lijst gewist.")}});
$("tabShop").addEventListener("change",e=>{const t=e.target;if(!t.dataset.price)return;const n=pnum(t.value);
  if(Number.isNaN(n)){t.value="";setStatus("Vul een prijs in zoals 2,49.",true);return}const it=curItem(t.dataset.price);if(!it||it.price===n)return;
  queueItem(t.dataset.price,{price:n})});
$("tabShop").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.dataset&&e.target.dataset.price){e.preventDefault();e.target.blur()}});
$("prodSearch").addEventListener("input",()=>renderProducts());
$("prodForm").addEventListener("submit",async e=>{e.preventDefault();const p={name:$("pfName").value.trim(),store:$("pfStore").value.trim(),category:$("pfCat").value,qty:num($("pfQty").value)||1,unit:$("pfUnit").value.trim(),fixed:$("pfFixed").checked};
  if(!p.name)return;const dup=S.products.find(x=>x.name.toLowerCase()===p.name.toLowerCase()&&(x.store||"").toLowerCase()===p.store.toLowerCase());
  if(dup&&!(await ask(`${dup.name} bij ${sname(dup.store)} staat al in je producten. Toch nog eens toevoegen?`,{title:"Bestaat al",ok:"Ja, toevoegen"})))return;
  const r=await shopRun("saveProduct",[p],`${p.name} toegevoegd.`);if(r){$("pfName").value="";$("pfQty").value="1";$("pfUnit").value="";$("pfName").focus()}});
function openProd(id){const p=prodOf(id);if(!p)return;pdEdit=id;$("pdName").value=p.name;$("pdStore").value=p.store;$("pdCat").value=p.category;$("pdQty").value=p.qty;$("pdUnit").value=p.unit;$("pdPrice").value=ptxt(p.lastPrice);$("pdFixed").checked=p.fixed;openSheet("pdSheet")}
$("pdForm").addEventListener("submit",async e=>{e.preventDefault();const price=pnum($("pdPrice").value);if(Number.isNaN(price)){ask("Vul een prijs in zoals 2,49, of laat het leeg.",{alert:true});return}
  const p={id:pdEdit,name:$("pdName").value.trim(),store:$("pdStore").value.trim(),category:$("pdCat").value,qty:num($("pdQty").value)||1,unit:$("pdUnit").value.trim(),fixed:$("pdFixed").checked,lastPrice:price};
  if(!p.name)return;closeSheet("pdSheet");await shopRun("saveProduct",[p],`${p.name} opgeslagen.`)});
$("pdDel").addEventListener("click",async()=>{const p=prodOf(pdEdit);if(!p||!(await ask(`${p.name} uit je producten verwijderen? Op bestaande lijsten blijft het staan.`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;closeSheet("pdSheet");await shopRun("deleteProduct",[p.id],`${p.name} verwijderd.`)});
$("bgForm").addEventListener("submit",async e=>{e.preventDefault();const w=pnum($("bgWeek").value),m=pnum($("bgMonth").value);if(Number.isNaN(w)||Number.isNaN(m)){ask("Vul een bedrag in zoals 120, of laat het leeg.",{alert:true});return}
  closeSheet("bgSheet");if(await shopRun("saveSetting",["weekBudget",w],"Bezig…"))await shopRun("saveSetting",["monthBudget",m],"Budget opgeslagen.")});
// ---- product op de lijst zetten ----
function openAdd(){$("saSearch").value="";$("saName").value="";$("saQty").value="1";$("saUnit").value="";$("saKeep").checked=true;$("saFixed").checked=false;
  $("saStore").value=shopStore!=="all"?shopStore:"";$("saSub").textContent=`Week van ${fd(pd(shopWeek))}`;renderAdd();openSheet("saSheet");setTimeout(()=>$("saSearch").focus(),60)}
function renderAdd(){const l=listOf(shopWeek),on=new Set(l?itemsOf(l.id).map(i=>i.productId):[]),q=$("saSearch").value.trim().toLowerCase();
  const ps=S.products.filter(p=>!on.has(p.id)&&(!q||(p.name+" "+p.store+" "+p.category).toLowerCase().includes(q))).sort((a,b)=>sname(a.store).localeCompare(sname(b.store))||a.name.localeCompare(b.name));
  $("saList").innerHTML=ps.length?ps.slice(0,60).map(p=>`<button type="button" class="sa-row" data-sa="${esc(p.id)}"><span><b>${esc(p.name)}</b><small>${esc(sname(p.store))} · ${p.category}</small></span><i>+</i></button>`).join("")
    :`<p class="dayempty">${q?`Geen product “${esc(q)}” gevonden. Vul het hieronder in.`:S.products.length?"Al je producten staan al op de lijst.":"Nog geen producten. Vul hieronder een nieuw product in."}</p>`}
$("saSearch").addEventListener("input",()=>{renderAdd();const q=$("saSearch").value.trim();if(q&&!S.products.some(p=>p.name.toLowerCase().includes(q.toLowerCase())))$("saName").value=q});
$("saList").addEventListener("click",async e=>{const b=e.target.closest("[data-sa]");if(!b)return;const p=prodOf(b.dataset.sa);if(!p)return;b.disabled=true;await addProdToList(p);renderAdd()});
$("saForm").addEventListener("submit",async e=>{e.preventDefault();const it={name:$("saName").value.trim(),store:$("saStore").value.trim(),category:$("saCat").value,qty:num($("saQty").value)||1,unit:$("saUnit").value.trim()};
  if(!it.name)return;
  if($("saKeep").checked){const r=await shopRun("saveProduct",[Object.assign({fixed:$("saFixed").checked},it)],"Bezig…");if(!r)return;it.productId=r.savedId}
  const lid=await ensureList();if(!lid)return;
  await shopRun("addListItems",[lid,[it]],`${it.name} staat op de lijst.`);$("saName").value="";$("saQty").value="1";$("saUnit").value="";renderAdd();$("saName").focus()});
setInterval(()=>{if(document.visibilityState==="visible"&&sec==="shop"&&stab==="list"&&!document.querySelector(".sheet-bg.open")&&!Object.keys(pend).length)refreshShop()},12000);

// ================= SECTIES (startpagina, sport, shop, daten) =================
const SECS={hub:{name:"",theme:"#0A0710"},sport:{name:"Sport",theme:"#0B0B0C"},shop:{name:"Shop",theme:"#0B2A5B"},date:{name:"Daten & Eten",theme:"#1A0508"}};
let sec="hub";try{const v=localStorage.getItem("voltage-sec");if(SECS[v])sec=v}catch(_){}
function showSec(s,fromPop){if(!SECS[s])s="hub";const prev=sec;sec=s;try{localStorage.setItem("voltage-sec",s)}catch(_){}
  document.body.dataset.sec=s;$("metaTheme").setAttribute("content",SECS[s].theme);
  $("hub").hidden=s!=="hub";$("secbar").hidden=s==="hub";$("secName").textContent=SECS[s].name;
  document.querySelector(".tabs").hidden=s!=="sport";$("eventCard").hidden=s!=="sport";
  $("tabShop").hidden=s!=="shop";$("tabDate").hidden=s!=="date";
  showTab(tab);
  if(s==="shop"){renderShop(true);refreshShop()}
  if(s==="date")renderDates();
  if(s==="hub")renderHub();
  if(!fromPop&&prev!==s){try{if(s==="hub")history.replaceState({sec:"hub"},"");else history.pushState({sec:s},"")}catch(_){}}
  window.scrollTo(0,0)}
window.addEventListener("popstate",e=>{if(document.querySelector(".sheet-bg.open")){const o=[...document.querySelectorAll(".sheet-bg.open")].pop();o.id==="wSheet"?requestCloseEditor():closeSheet(o.id);try{history.pushState({sec},"")}catch(_){}return}
  showSec((e.state&&e.state.sec)||"hub",true)});
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showSec(b.dataset.go)));
$("btnHome").addEventListener("click",()=>{if(history.state&&history.state.sec&&history.state.sec!=="hub")history.back();else showSec("hub")});
function renderHub(){if($("hub").hidden)return;
  const next=allGoals().find(g=>g.date>=TODAY);
  if(next){const n=Math.round((pd(next.date)-T0)/864e5);$("hubSportBig").textContent=n===0?"GO":n+(n===1?" dag":" dagen");$("hubSport").textContent="tot "+next.title}
  else{$("hubSportBig").textContent="Show up.";$("hubSport").textContent="Training, progress en recepten"}
  const l=S.lists.find(x=>x.week===iso(monday(T0)));
  if(l){const it=S.items.filter(i=>i.listId===l.id),open=it.filter(i=>!i.checked).length;$("hubShopBig").textContent=open?open+" te halen":"Alles in huis";$("hubShop").textContent=`Lijst van deze week · ${it.length-open}/${it.length} in de kar`}
  else{$("hubShopBig").textContent="Nieuwe week";$("hubShop").textContent=S.products.some(p=>p.fixed)?"Tik om je lijst te genereren":"Boodschappen en budget"}
  const up=DT.filter(d=>d.type==="moment"&&d.status==="planned"&&d.date>=TODAY).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const ideas=DT.filter(d=>d.type==="idea").length;
  if(up){const n=Math.round((pd(up.date)-T0)/864e5);$("hubDateBig").textContent=n===0?"Vandaag":n===1?"Morgen":"Over "+n+" dagen";$("hubDate").textContent=up.title}
  else{$("hubDateBig").textContent=ideas?ideas+" idee"+(ideas>1?"ën":""):"Plan iets";$("hubDate").textContent=ideas?"Klaar om te kiezen":"Ideeën, plannen en herinneringen"}}

// ================= DATEN & ETEN =================
const DCAT={datenight:"Date night",uitstap:"Uitstap",restaurant:"Uit eten",thuis:"Thuis",reis:"Weekend & reizen",overig:"Overig"};
const COSTL=["Gratis","€","€€","€€€"];
let DT=[],dtab="ideas",dcat="all",diEdit=null,dm=null,rnPick=null;
try{dtab=localStorage.getItem("voltage-dtab")||"ideas"}catch(_){}
const dById=id=>DT.find(d=>d.id===id);
function relDay(ds){const n=Math.round((pd(ds)-T0)/864e5);return n===0?"vandaag":n===1?"morgen":n===-1?"gisteren":n>1?`over ${n} dagen`:`${-n} dagen geleden`}
function hearts(n){return n?"♥".repeat(n)+`<span class="off">${"♥".repeat(5-n)}</span>`:""}
function renderDates(){if($("tabDate").hidden)return;
  document.querySelectorAll("[data-dtab]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.dtab===dtab)));
  const ideas=DT.filter(d=>d.type==="idea"),plan=DT.filter(d=>d.type==="moment"&&d.status==="planned").sort((a,b)=>a.date.localeCompare(b.date)),
    log=DT.filter(d=>d.type==="moment"&&d.status==="done").sort((a,b)=>b.date.localeCompare(a.date));
  document.querySelector('[data-dtab="plan"]').textContent=`Gepland${plan.length?" ("+plan.length+")":""}`;
  let h="";
  if(dtab==="ideas"){const cats=Object.keys(DCAT).filter(k=>ideas.some(i=>i.category===k));if(dcat!=="all"&&!cats.includes(dcat))dcat="all";
    const list=ideas.filter(i=>dcat==="all"||i.category===dcat).sort((a,b)=>b.updatedAt-a.updatedAt);
    h=`<div class="date-actions"><button class="primary" data-da="newidea">+ Nieuw idee</button>${ideas.length?`<button class="textbtn surprise" data-da="random">Verras ons</button>`:""}</div>`;
    if(cats.length>1)h+=`<div class="phasechips">${[["all","Alles"]].concat(cats.map(k=>[k,DCAT[k]])).map(([k,l])=>`<button type="button" data-dcat="${k}" aria-pressed="${dcat===k}">${l}</button>`).join("")}</div>`;
    h+=list.length?`<div class="dgrid">${list.map(i=>{const times=DT.filter(m=>m.ideaId===i.id&&m.status==="done").length;
      return `<article class="dcard"><button type="button" class="dc-main" data-editidea="${esc(i.id)}"><span class="dc-cat">${DCAT[i.category]}${i.cost!=null?" · "+COSTL[i.cost]:""}</span><b>${esc(i.title)}</b>${i.note?`<span class="dc-note">${esc(i.note)}</span>`:""}<span class="dc-by">${i.createdBy&&NAMES[i.createdBy]?"Idee van "+NAMES[i.createdBy]:""}${times?` · ${times}× gedaan`:""}</span></button>
      ${i.link?`<a class="dc-link" href="${/^https?:\/\//i.test(i.link)?esc(i.link):"https://www.google.com/maps/search/"+encodeURIComponent(i.link)}" target="_blank" rel="noopener">${/^https?:\/\//i.test(i.link)?"Link openen":"Op de kaart"}</a>`:""}
      <div class="dc-btns"><button class="textbtn" data-planidea="${esc(i.id)}">Plannen</button><button class="textbtn" data-doneidea="${esc(i.id)}">Gedaan</button></div></article>`}).join("")}</div>`
      :`<section class="card"><p class="dayempty">${ideas.length?"Geen ideeën in deze soort.":"Nog geen ideeën. Zet hier alles wat jullie ooit samen willen doen: een restaurant, een wandeling, een citytrip, een filmavond…"}</p></section>`}
  else if(dtab==="plan"){h=`<div class="date-actions"><button class="primary" data-da="newplan">+ Date plannen</button></div>`;
    h+=plan.length?plan.map(m=>{const d=pd(m.date),past=m.date<TODAY;return `<article class="dplan ${past?"past":""}"><div class="dp-date"><b>${d.getDate()}</b><span>${MN[d.getMonth()]}</span></div>
      <button type="button" class="dp-main" data-editmom="${esc(m.id)}"><span class="dc-cat">${DCAT[m.category]} · ${dayName(d).toLowerCase()} · ${relDay(m.date)}</span><b>${esc(m.title)}</b></button>
      <button class="primary dp-done" data-finish="${esc(m.id)}">${past?"Afronden":"Gedaan"}</button></article>`}).join("")
      :`<section class="card"><p class="dayempty">Nog niets gepland. Kies een idee en tik op <b>Plannen</b>, of plan meteen iets nieuws.</p></section>`}
  else{h=log.length?`<div class="dlog">${log.map(m=>{const d=pd(m.date);return `<button type="button" class="dmem" data-viewmom="${esc(m.id)}">${m.photos.length?`<div class="rimg load dm-cover" data-photo="${esc(m.photos[0])}"></div>`:`<div class="dm-cover nophoto"><span>♥</span></div>`}
      <div class="dm-txt"><span class="dc-cat">${dayName(d)} ${fd(d)} ${d.getFullYear()} · ${DCAT[m.category]}</span><b>${esc(m.title)}</b><span class="hearts ro">${hearts(m.rating)}</span>${m.memory?`<span class="dc-note">${esc(m.memory)}</span>`:""}${m.photos.length>1?`<span class="dm-n">${m.photos.length} foto's</span>`:""}</div></button>`}).join("")}</div>`
      :`<section class="card"><p class="dayempty">Hier komen jullie herinneringen. Rond een geplande date af met foto's en een paar woorden.</p></section>`}
  $("dateBody").innerHTML=h;hydratePhotos($("dateBody"))}
document.querySelectorAll("[data-dtab]").forEach(b=>b.addEventListener("click",()=>{dtab=b.dataset.dtab;try{localStorage.setItem("voltage-dtab",dtab)}catch(_){}renderDates()}));
$("dateBody").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;
  if(d.dcat){dcat=d.dcat;renderDates();return}
  if(d.da==="newidea")return openIdea(null);
  if(d.da==="newplan")return openMoment({status:"planned"});
  if(d.da==="random")return surprise();
  if(d.editidea)return openIdea(d.editidea);
  if(d.planidea)return openMoment({idea:dById(d.planidea),status:"planned"});
  if(d.doneidea)return openMoment({idea:dById(d.doneidea),status:"done"});
  if(d.editmom)return openMoment({id:d.editmom});
  if(d.finish)return openMoment({id:d.finish,status:"done"});
  if(d.viewmom)return viewMoment(d.viewmom)});
async function dateRun(fn,args,msg){busy++;setStatus("Bezig…");try{const r=await call(fn,...args);busy--;apply(r);setStatus(msg);return r}catch(e){busy--;setStatus(errText(e),true);refresh();return null}}
// --- idee ---
function openIdea(id){const i=id?dById(id):null;diEdit=id;$("diTitle").textContent=i?"Idee bewerken":"Nieuw idee";
  $("diName").value=i?i.title:"";$("diCat").value=i?i.category:(dcat!=="all"?dcat:"datenight");$("diCost").value=i&&i.cost!=null?String(i.cost):"";
  $("diLink").value=i?i.link:"";$("diNote").value=i?i.note:"";$("diDel").style.visibility=i?"visible":"hidden";openSheet("diSheet");setTimeout(()=>$("diName").focus(),60)}
$("diForm").addEventListener("submit",async e=>{e.preventDefault();const old=diEdit?dById(diEdit):null;
  const it={id:diEdit,type:"idea",title:$("diName").value.trim(),category:$("diCat").value,cost:$("diCost").value===""?null:+$("diCost").value,link:$("diLink").value.trim(),note:$("diNote").value.trim(),createdBy:old?old.createdBy:(who||"")};
  if(!it.title)return;closeSheet("diSheet");const r=await dateRun("saveDate",[it],old?"Idee opgeslagen.":"Idee toegevoegd.");
  if(r&&!old&&who)push(other(),`${NAMES[who]} heeft een date-idee`,it.title)});
$("diDel").addEventListener("click",async()=>{const i=dById(diEdit);if(!i||!(await ask(`Idee “${i.title}” verwijderen? Herinneringen die ervan komen blijven bewaard.`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;closeSheet("diSheet");await dateRun("deleteDate",[i.id],"Idee verwijderd.")});
// --- verras ons ---
function surprise(){const pool=DT.filter(d=>d.type==="idea"&&(dcat==="all"||d.category===dcat));if(!pool.length)return;
  let p=pool[Math.floor(Math.random()*pool.length)];if(pool.length>1&&rnPick&&p.id===rnPick.id)p=pool.find(x=>x.id!==rnPick.id);rnPick=p;
  $("rnTitle").textContent=p.title;$("rnSub").textContent=[DCAT[p.category],p.cost!=null?COSTL[p.cost]:"",p.note].filter(Boolean).join(" · ");
  $("rnAgain").hidden=pool.length<2;openSheet("rnSheet")}
$("rnAgain").addEventListener("click",surprise);
$("rnPlan").addEventListener("click",()=>{closeSheet("rnSheet");if(rnPick)openMoment({idea:rnPick,status:"planned"})});
// --- plannen / afronden ---
function nextSat(){let d=T0;while(d.getDay()!==6)d=addDays(d,1);return iso(d)}
function openMoment(o){const m=o.id?dById(o.id):null,idea=o.idea||(m&&m.ideaId?dById(m.ideaId):null);
  dm={id:m?m.id:null,ideaId:m?m.ideaId:(idea?idea.id:""),status:o.status||(m?m.status:"planned"),rating:m?m.rating:null,staged:[],createdBy:m?m.createdBy:(who||"")};
  $("dmName").value=m?m.title:(idea?idea.title:"");$("dmCat").value=m?m.category:(idea?idea.category:"datenight");
  $("dmDate").value=m?(o.status==="done"&&m.date>TODAY?TODAY:m.date):(dm.status==="done"?TODAY:nextSat());
  $("dmMem").value=m?m.memory:"";$("dmKeep").checked=true;
  $("dmTitle").textContent=m?(dm.status==="done"&&m.status==="planned"?"Date afronden":m.status==="done"?"Herinnering bewerken":"Date bewerken"):(dm.status==="done"?"We hebben het gedaan":"Date plannen");
  $("dmSub").textContent=idea&&!m?"Uit jullie ideeënlijst":"";$("dmDel").style.visibility=m?"visible":"hidden";
  syncDm();openSheet("dmSheet")}
function syncDm(){document.querySelectorAll("[data-dst]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.dst===dm.status)));
  $("dmDone").hidden=dm.status!=="done";
  document.querySelectorAll("#dmRate button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.r<=(dm.rating||0))));
  const old=dm.id?dById(dm.id):null;$("dmKeepWrap").hidden=!(dm.ideaId&&dById(dm.ideaId)&&!(old&&old.status==="done"));
  const box=$("dmPhotos");box.innerHTML="";const ex=old?old.photos:[];
  ex.forEach(f=>box.appendChild(photoTile(null,f,async()=>{if(!(await ask("Deze foto verwijderen?",{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;await dateRun("removeDatePhoto",[dm.id,f],"Foto verwijderd.");syncDm()})));
  dm.staged.forEach((u,k)=>box.appendChild(photoTile(u,null,()=>{dm.staged.splice(k,1);syncDm()})));
  if(ex.length+dm.staged.length<12){const b=document.createElement("button");b.type="button";b.className="addph";b.innerHTML="<span>+ Foto</span>";
    b.addEventListener("click",async()=>{const fs=(await pickPhotos(true)).slice(0,12-ex.length-dm.staged.length);for(const f of fs){try{dm.staged.push(await resize(f))}catch(_){setStatus("Die foto kon niet gelezen worden.",true)}}syncDm()});box.appendChild(b)}}
document.querySelectorAll("[data-dst]").forEach(b=>b.addEventListener("click",()=>{dm.status=b.dataset.dst;if(dm.status==="done"&&$("dmDate").value>TODAY)$("dmDate").value=TODAY;syncDm()}));
document.querySelectorAll("#dmRate button").forEach(b=>b.addEventListener("click",()=>{dm.rating=dm.rating===+b.dataset.r?null:+b.dataset.r;syncDm()}));
$("dmForm").addEventListener("submit",async e=>{e.preventDefault();const old=dm.id?dById(dm.id):null;
  const it={id:dm.id,type:"moment",ideaId:dm.ideaId,title:$("dmName").value.trim(),category:$("dmCat").value,date:$("dmDate").value,status:dm.status,
    rating:dm.status==="done"?dm.rating:null,memory:dm.status==="done"?$("dmMem").value.trim():"",createdBy:dm.createdBy,removeIdea:dm.status==="done"&&!$("dmKeepWrap").hidden&&!$("dmKeep").checked};
  if(!it.title||!it.date)return;const staged=dm.staged.slice();closeSheet("dmSheet");busy++;setStatus("Opslaan…");
  try{let r=await call("saveDate",it);const id=r.savedId;
    for(let k=0;k<staged.length;k++){setStatus(`Foto ${k+1} van ${staged.length} opladen…`);r=await call("uploadDatePhoto",id,staged[k])}
    busy--;apply(r);const nowDone=it.status==="done"&&!(old&&old.status==="done");
    if(nowDone){dtab="log";try{localStorage.setItem("voltage-dtab","log")}catch(_){}}else if(it.status==="planned"&&!old){dtab="plan"}
    renderDates();setStatus(nowDone?"Herinnering bewaard.":"Opgeslagen.");
    if(who&&!old&&it.status==="planned")push(other(),`${NAMES[who]} plande een date`,`${it.title} · ${dayName(pd(it.date)).toLowerCase()} ${fd(pd(it.date))}`);
    if(who&&nowDone)push(other(),"Nieuwe herinnering",`${it.title}${staged.length?` · ${staged.length} foto${staged.length>1?"'s":""}`:""}`)}
  catch(err){busy--;setStatus(errText(err),true);refresh()}});
$("dmDel").addEventListener("click",async()=>{const m=dById(dm.id);if(!m||!(await ask(`“${m.title}” verwijderen?${m.photos.length?" De foto's verdwijnen ook.":""}`,{title:"Verwijderen?",ok:"Ja, verwijder",danger:true})))return;closeSheet("dmSheet");await dateRun("deleteDate",[m.id],"Verwijderd.")});
// --- herinnering bekijken ---
let dvId=null;
function viewMoment(id){const m=dById(id);if(!m)return;dvId=id;const d=pd(m.date);
  $("dvTitle").textContent=m.title;$("dvSub").textContent=`${dayName(d)} ${fd(d)} ${d.getFullYear()} · ${DCAT[m.category]}`;
  $("dvRate").innerHTML=hearts(m.rating);$("dvMem").innerHTML=m.memory?`<div class="vnote">${esc(m.memory)}</div>`:"";
  const g=$("dvPhotos");g.innerHTML="";m.photos.forEach(f=>g.appendChild(photoTile(null,f)));openSheet("dvSheet")}
$("dvEdit").addEventListener("click",()=>{closeSheet("dvSheet");openMoment({id:dvId})});

// ================= EIGEN BEVESTIGINGSVENSTER =================
function ask(text,o={}){return new Promise(res=>{
  const bg=$("askBg");$("askTitle").textContent=o.title||(o.alert?"Let op":"Ben je zeker?");$("askText").textContent=text;
  const ok=$("askOk"),no=$("askNo");ok.textContent=o.ok||(o.alert?"OK":"Ja");no.textContent=o.cancel||"Nee";
  no.hidden=!!o.alert;ok.classList.toggle("danger",!!o.danger);
  const done=v=>{bg.classList.remove("open");ok.onclick=no.onclick=null;bg.onclick=null;document.removeEventListener("keydown",key,true);res(v)};
  const key=e=>{if(e.key==="Escape"){e.stopPropagation();done(false)}};
  ok.onclick=()=>done(true);no.onclick=()=>done(false);bg.onclick=e=>{if(e.target===bg)done(false)};
  document.addEventListener("keydown",key,true);bg.classList.add("open");setTimeout(()=>(o.alert?ok:no).focus(),30)})}

// ================= SHEETS =================
function openSheet(id){$(id).classList.add("open")}
function closeSheet(id){$(id).classList.remove("open");if(id==="vSheet")viewId=null}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>b.dataset.close==="wSheet"?requestCloseEditor():closeSheet(b.dataset.close)));
["wSheet","vSheet","gSheet","plSheet","impSheet","xSheet","pfSheet","rvSheet","reSheet","rpSheet","psSheet","saSheet","pdSheet","bgSheet","diSheet","dmSheet","dvSheet","rnSheet"].forEach(id=>$(id).addEventListener("click",e=>{if(e.target===$(id))id==="wSheet"?requestCloseEditor():closeSheet(id)}));
$("pSheet").addEventListener("click",e=>{if(e.target===$("pSheet"))closePicker()});
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;
  if($("lightbox").classList.contains("open")){$("lightbox").classList.remove("open");return}
  if($("pSheet").classList.contains("open")){closePicker();return}
  for(const id of ["psSheet","rnSheet","dvSheet","dmSheet","diSheet","bgSheet","pdSheet","saSheet","xSheet","rpSheet","reSheet","rvSheet","pfSheet","impSheet","gSheet","plSheet","wSheet","vSheet"])if($(id).classList.contains("open")){id==="wSheet"?requestCloseEditor():closeSheet(id);return}});

// ================= SERVER =================
let stTimer=null,busy=0;
function setStatus(msg,warn){if(typeof warn==="undefined")warn=false;const el=$("status");el.textContent=msg;const b=/…$/.test(msg);el.className="status"+(warn?" warn":b?" busy":"");document.querySelectorAll(".status-mirror").forEach(x=>{x.textContent=msg;x.className="status status-mirror"+(warn?" warn":b?" busy":"")});clearTimeout(stTimer);if(!warn&&!b)stTimer=setTimeout(idleStatus,4000)}
function idleStatus(){if(!pin)return;setStatus(who?"Gedeeld: de ander ziet je trainingen en reacties binnen een halve minuut.":"Tik bovenaan op je naam om te beginnen.")}
function errText(e){const m=String(e&&e.message||e);if(m.includes("NO_LIST")||m.includes("NO_ITEM"))return"Dit staat niet meer op de lijst. De lijst is vernieuwd.";if(m==="NETWORK")return"Geen verbinding met de server. Controleer je internet.";if(m==="BAD_RESPONSE"||m==="UNKNOWN_FN")return"De server heeft nog de oude versie: publiceer in Apps Script een nieuwe versie.";if(m.indexOf("MAX_PHOTOS")>=0)return"Maximaal 4 foto's per training.";if(m.indexOf("TOO_BIG")>=0)return"Te veel gegevens voor één training.";return"Er ging iets mis ("+m+"). Probeer opnieuw."}
async function call(fn,...args){let r;
  try{r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({fn,args:[pin,...args]}),redirect:"follow"})}catch(e){throw new Error("NETWORK")}
  if(!r.ok)throw new Error("HTTP_"+r.status);let j;try{j=await r.json()}catch(e){throw new Error("BAD_RESPONSE")}
  if(!j.ok)throw new Error(j.error||"ERROR");return j.data}
async function run(fn,args,okMsg){busy++;setStatus("Bezig…");try{const res=await call(fn,...args);busy--;apply(res);setStatus(okMsg)}catch(e){busy--;setStatus(errText(e),true);refresh()}}
function apply(d){if(!d)return;if(d.shop){S=d.shop;S.settings=S.settings||{}}if(d.dates)DT=d.dates;if(d.partial){renderShop();renderDates();renderHub();return}W=d.workouts||[];C=d.comments||[];G=d.goals||[];P=d.plan||[];TP=d.templates||[];PR=d.profiles||[];B=d.body||[];RC=d.recipes||[];if(d.ntfy)NT=d.ntfy;byId={};W.forEach(w=>byId[w.id]=w);render();
  if(viewId&&$("vSheet").classList.contains("open")){const box=$("vThread");if(!box.contains(document.activeElement))renderThread(box,viewId)}}
function isPinErr(e){return String(e&&e.message||e).indexOf("PIN_WRONG")>=0}
async function refresh(){if(!pin||busy)return;
  try{apply(await call("getData"));checkDraft();const s=$("status");if(s.classList.contains("warn")||/laden/.test(s.textContent))idleStatus()}
  catch(e){if(isPinErr(e))askPin(true);else setStatus(errText(e),true)}}
function askPin(wrong){$("gate").classList.add("open");$("pinErr").textContent=wrong?"Die pincode klopt niet.":"";$("pinIn").value="";setTimeout(()=>$("pinIn").focus(),50)}
$("pinForm").addEventListener("submit",async e=>{e.preventDefault();const v=$("pinIn").value.trim();if(!v)return;$("pinErr").textContent="Controleren…";
  const old=pin;pin=v;try{await call("checkPin");try{localStorage.setItem("knokke-pin",v)}catch(e){}$("gate").classList.remove("open");refresh()}
  catch(err){pin=old;$("pinErr").textContent=isPinErr(err)?"Die pincode klopt niet.":errText(err)}});

// ================= RENDER =================
function render(){renderHero();renderCal();renderWeek();renderGoals();renderWorkoutsLib();renderFeed();renderProgress();renderRecipes();renderShop();renderDates();renderHub()}
renderWho();showSec(sec,true);try{history.replaceState({sec:"hub"},"");if(sec!=="hub")history.pushState({sec},"")}catch(_){}render();
if(!pin)askPin(false);else refresh();
setInterval(()=>{if(document.visibilityState==="visible"&&!document.querySelector(".sheet-bg.open"))refresh()},30000);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refresh()});
// ================= UPDATES =================
if(/[?&]v=\d+/.test(location.search))history.replaceState(null,"",location.pathname);
// Nieuwe versie op GitHub? Dan haalt de app die vanzelf op en herlaadt één keer.
if("serviceWorker" in navigator){
  let reloaded=false;
  navigator.serviceWorker.addEventListener("controllerchange",()=>{if(reloaded)return;reloaded=true;
    if(document.querySelector(".sheet-bg.open")){setStatus("Nieuwe versie klaar – ze wordt geladen zodra je de app opnieuw opent.");return}location.reload()});
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js",{updateViaCache:"none"}).then(reg=>{
    const check=()=>reg.update().catch(()=>{});check();
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check()});
  }).catch(()=>{}));
}
// Noodknop: alles van deze app op dit toestel vernieuwen (pincode en naam blijven bewaard)
$("btnRefresh").addEventListener("click",async()=>{
  if(!(await ask("De app haalt de nieuwste versie op en herstart. Je pincode, naam en gegevens blijven bewaard.",{title:"App vernieuwen?",ok:"Ja, vernieuw"})))return;
  try{if("serviceWorker" in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}
    if(window.caches){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)))}}catch(e){}
  location.replace(location.pathname+"?v="+Date.now())});
})();
