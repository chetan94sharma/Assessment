/* ============================================================
   Adaptive engine + UI.  Depends on window.QUIZ (questions.js).
   Call AppEngine.init(adapter) where adapter = {
     mode: 'storage' | 'server',
     submit(record, rawAnswers) -> Promise<{ok, msg}>,   // required
     loadAll() -> Promise<[record]>,                       // dashboard only
     deleteAll() -> Promise,                               // dashboard only
   }
   ============================================================ */
window.AppEngine = (function(){
  const Q = window.QUIZ;
  const N_PER_SKILL = 6;        // questions SERVED per skill (total 36) — count unchanged
  const START_LEVEL = 2;        // adaptive entry level
  const CAT_CLASS = ['b-ni','b-beg','b-sat','b-exp'];
  const CAT_VAR   = ['--ni','--beg','--sat','--exp'];
  const TIER = {1:'Level 1 · Foundational',2:'Level 2 · Basic',3:'Level 3 · Intermediate',4:'Level 4 · Advanced',5:'Level 5 · Expert'};

  let A;                        // adapter
  let served = [];              // [{skill, level, qi, opts:[{text,correct,oi}], sel}]
  let p = 0;                    // pointer into served
  let used = {};                // skill -> Set(qi)
  let person = {name:'',desig:''};
  let lastRecord = null, lastRaw = null;
  let timerId = null, remaining = 0, submitted = false;   // 25-min timer + submit lock
  let lastCert = null;                                     // certificate PNG data URL

  const $ = s => document.querySelector(s);
  const shuffle = a => { for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
  const show = id => { ['home','quiz','result','dashboard'].forEach(x=>{const e=$('#'+x); if(e) e.classList.toggle('hidden',x!==id);}); window.scrollTo(0,0); };
  const catIndex = pct => pct>=Q.BANDS.expert?3 : pct>=Q.BANDS.satisfactory?2 : pct>=Q.BANDS.beginner?1 : 0;
  const badge = ci => '<span class="badge '+CAT_CLASS[ci]+'">'+Q.CATS[ci]+'</span>';

  /* ---- adaptive pick: nearest unused question to target level in a skill ---- */
  function pick(skill, level){
    if(!used[skill]) used[skill] = new Set();
    const u = used[skill];
    let bestDist = 99;
    Q.BANK.forEach((q,i)=>{ if(q.s!==skill||u.has(i))return; const d=Math.abs(q.l-level); if(d<bestDist)bestDist=d; });
    const ties=[]; Q.BANK.forEach((q,i)=>{ if(q.s!==skill||u.has(i))return; if(Math.abs(q.l-level)===bestDist)ties.push(i); });
    const qi = ties[(Math.random()*ties.length)|0];
    u.add(qi);
    const opts = shuffle(Q.BANK[qi].o.map((x,oi)=>({text:x[0],correct:x[1]===1,oi})));
    return {skill, level:Q.BANK[qi].l, qi, opts, sel:-1};
  }
  function ensure(idx){
    if(served[idx]) return;
    const si = Math.floor(idx/N_PER_SKILL), within = idx%N_PER_SKILL;
    const skill = Q.SKILLS[si].id;
    let level;
    if(within===0){ used[skill]=new Set(); level=START_LEVEL; }
    else { const prev=served[idx-1]; const ok=prev.opts[prev.sel] && prev.opts[prev.sel].correct; level = ok?Math.min(5,prev.level+1):Math.max(1,prev.level-1); }
    served[idx]=pick(skill,level);
  }
  const TOTAL = Q.SKILLS.length*N_PER_SKILL;

  /* ---------- quiz render ---------- */
  function renderQ(){
    ensure(p);
    const cur = served[p];
    const si = Math.floor(p/N_PER_SKILL), within = p%N_PER_SKILL;
    const sk = Q.SKILLS[si];
    $('#qskill').textContent = sk.name;
    $('#qtier').textContent  = TIER[cur.level];
    $('#qid').textContent    = sk.name+' · '+(within+1)+'/'+N_PER_SKILL;
    $('#qcount').textContent = 'Question '+(p+1)+' of '+TOTAL;
    $('#qprog').textContent  = Math.round(p/TOTAL*100)+'% complete';
    $('#qtext').innerHTML     = cur.q || Q.BANK[cur.qi].q;
    // steps (skill dots)
    const steps=$('#steps'); steps.innerHTML='';
    Q.SKILLS.forEach((s,ix)=>{ const d=document.createElement('div'); d.className='step'+(ix<si?' done':ix===si?' cur':''); d.title=s.name; steps.appendChild(d); });
    // options
    const box=$('#qopts'); box.innerHTML='';
    const L=['A','B','C','D'];
    cur.opts.forEach((opt,oi)=>{
      const el=document.createElement('div');
      el.className='opt'+(cur.sel===oi?' sel':'');
      el.innerHTML='<span class="mk">'+L[oi]+'</span><span>'+opt.text+'</span>';
      el.onclick=()=>{ cur.sel=oi; renderQ(); };
      box.appendChild(el);
    });
    $('#next').disabled = cur.sel<0;
    $('#next').textContent = p===TOTAL-1 ? 'See result →' : 'Next →';
  }

  /* ---------- scoring (difficulty-weighted, adaptive) ---------- */
  function scoreAll(){
    const per={}; let te=0, tm=0;
    Q.SKILLS.forEach(sk=>{ per[sk.id]={earned:0,servedSum:0,peak:0,correct:0,answered:0}; });
    served.forEach(s=>{
      if(s.sel<0) return;                       // skip unanswered (e.g. timed-out) questions
      const acc=per[s.skill]; const ok=s.opts[s.sel] && s.opts[s.sel].correct;
      acc.answered++; acc.servedSum += s.level;
      if(ok){ acc.correct++; acc.earned += s.level; if(s.level>acc.peak)acc.peak=s.level; }
    });
    Q.SKILLS.forEach(sk=>{ const a=per[sk.id]; const pct=a.servedSum?Math.round(a.earned/a.servedSum*100):0;
      a.pct=pct; a.cat=catIndex(pct); te+=a.earned; tm+=a.servedSum; });
    const total = tm?Math.round(te/tm*100):0;
    return {per, total, cat:catIndex(total)};
  }

  /* ---------- result render ---------- */
  function renderResult(){
    const r = scoreAll();
    lastRecord = { id:'r_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
                   name:person.name, desig:person.desig, date:new Date().toISOString(),
                   total:r.total, cat:r.cat, per:{} };
    Q.SKILLS.forEach(sk=>{ const a=r.per[sk.id]; lastRecord.per[sk.id]={
      score:a.correct+' out of '+a.answered, correct:a.correct, answered:a.answered,
      pct:a.pct, cat:a.cat, peak:a.peak }; });
    lastRaw = served.filter(s=>s.sel>=0).map(s=>({qi:s.qi, oi:s.opts[s.sel]?s.opts[s.sel].oi:-1}));

    $('#rname').textContent = person.name;
    $('#rdesig').textContent = person.desig+' · '+new Date().toLocaleDateString();
    if($('#rdesig2')) $('#rdesig2').textContent = person.desig;
    $('#rtotal').textContent = r.total+'%';
    $('#rbadge').innerHTML = 'Overall level: '+badge(r.cat);

    const exp = Q.EXPECT[person.desig];
    const below=[], exceed=[];
    const box=$('#rskills'); box.innerHTML='';
    Q.SKILLS.forEach(sk=>{
      const sc=r.per[sk.id], e=exp[sk.id], diff=sc.cat-e;
      if(diff<0) below.push(sk.name); if(diff>0) exceed.push(sk.name);
      let arrow,cls,txt;
      if(diff>0){arrow='▲';cls='up';txt='Exceeds the bar ('+Q.CATS[e]+')';}
      else if(diff===0){arrow='■';cls='flat';txt='Meets the bar ('+Q.CATS[e]+')';}
      else{arrow='▼';cls='down';txt='Below the bar — expected '+Q.CATS[e];}
      const el=document.createElement('div'); el.className='skill';
      el.innerHTML =
        '<div class="top"><h3>'+sk.name+'</h3>'+badge(sc.cat)+'</div>'+
        '<div class="bar"><i style="width:'+sc.pct+'%;background:var('+CAT_VAR[sc.cat]+')"></i></div>'+
        '<div class="top"><span class="mut mono" style="font-size:12px">'+sc.pct+'%'+
          '<span class="faint"> · reached L'+(sc.peak||1)+'</span></span>'+
          '<span class="gap"><span class="arrow '+cls+'">'+arrow+'</span><b>'+txt+'</b></span></div>';
      box.appendChild(el);
    });

    let v;
    if(below.length===0 && exceed.length>=3)
      v='<b>Strong promotion / stretch-task candidate.</b> Meets the bar on every skill and exceeds it on '+exceed.length+' ('+exceed.join(', ')+').';
    else if(below.length===0)
      v='<b>Meets expectations</b> for '+person.desig+' across all six skills.'+(exceed.length?' Standout strength: '+exceed.join(', ')+'.':'');
    else
      v='<b>Development needed.</b> Below the bar in: '+below.join(', ')+'. Prioritise coaching here before added responsibility.';
    $('#rverdict').innerHTML=v;
    if($('#saveMsg')) $('#saveMsg').textContent='';
    drawCertificate(lastRecord);
  }

  /* ---------- certificate (canvas -> PNG) ---------- */
  const CATCOL = ['#d94a4a','#c99a1e','#2f7fb5','#3a9d6b'];
  function drawCertificate(rec){
    const cv=$('#cert'); if(!cv || !cv.getContext) return;
    const ctx=cv.getContext('2d'); const W=cv.width, H=cv.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#faf7ef'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#b5852a'; ctx.lineWidth=6; ctx.strokeRect(24,24,W-48,H-48);
    ctx.strokeStyle='#d8c79b'; ctx.lineWidth=1.5; ctx.strokeRect(40,40,W-80,H-80);
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillStyle='#9a8f77'; ctx.font='600 15px Arial';
    ctx.fillText('A P P L I C A T I O N   S U P P O R T   ·   F I N T E C H', W/2, 92);
    ctx.fillStyle='#1b2430'; ctx.font='700 50px Georgia'; ctx.fillText('Skills Assessment', W/2, 150);
    ctx.fillStyle='#6b7280'; ctx.font='italic 21px Georgia'; ctx.fillText('Certificate of Completion', W/2, 184);
    ctx.strokeStyle='#e3d9c0'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(W/2-170,204); ctx.lineTo(W/2+170,204); ctx.stroke();
    ctx.fillStyle='#6b7280'; ctx.font='17px Arial'; ctx.fillText('This certifies that', W/2, 244);
    // name (shrink if very long)
    let nf=44; ctx.font='700 '+nf+'px Georgia';
    while(ctx.measureText(rec.name).width > W-220 && nf>22){ nf-=2; ctx.font='700 '+nf+'px Georgia'; }
    ctx.fillStyle='#111827'; ctx.fillText(rec.name, W/2, 298);
    const d=new Date(rec.date);
    const ds=d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
    ctx.fillStyle='#6b7280'; ctx.font='17px Arial';
    ctx.fillText('completed the assessment as '+rec.desig+' on '+ds, W/2, 332);
    ctx.fillStyle='#1b2430'; ctx.font='600 18px Arial'; ctx.fillText('Overall score', W/2, 384);
    ctx.fillStyle=CATCOL[rec.cat]; ctx.font='700 38px Arial';
    ctx.fillText(rec.total+'%   ·   '+Q.CATS[rec.cat], W/2, 424);
    // per-skill grid, 2 columns x 3 rows
    const startY=478, rowH=66, cx=[92, W/2+24];
    Q.SKILLS.forEach((sk,i)=>{
      const col=i%2, row=(i/2)|0, x=cx[col], y=startY+row*rowH, s=rec.per[sk.id];
      ctx.fillStyle=CATCOL[s.cat]; ctx.beginPath(); ctx.arc(x+6,y-5,6,0,Math.PI*2); ctx.fill();
      ctx.textAlign='left';
      ctx.fillStyle='#1b2430'; ctx.font='600 17px Arial'; ctx.fillText(sk.name, x+22, y);
      ctx.fillStyle='#4b5563'; ctx.font='15px "Courier New", monospace';
      ctx.fillText(s.score+'   ('+s.pct+'%)   '+Q.CATS[s.cat], x+22, y+21);
    });
    ctx.textAlign='center'; ctx.fillStyle='#9aa0a6'; ctx.font='12px "Courier New", monospace';
    ctx.fillText('Ref '+rec.id+'   ·   Issued '+d.toISOString().slice(0,19).replace('T',' ')+' UTC', W/2, H-50);
    lastCert = cv.toDataURL('image/png');
  }

  /* ---------- dashboard (only if markup present) ---------- */
  let dashSort={skill:'total',dir:-1};
  async function renderDash(){
    const body=$('#dashBody'); if(!body)return;
    body.innerHTML='<div class="empty">Loading…</div>';
    let all=[]; try{ all=await A.loadAll(); }catch(e){ all=[]; }
    if(!all.length){ body.innerHTML='<div class="empty">No submitted results yet.</div>'; return; }
    const order=['Associate Engineer','Engineer','Senior Engineer','Tech Lead','Team Lead'];
    body.innerHTML='';
    order.forEach(desig=>{
      let rows=all.filter(r=>r.desig===desig); if(!rows.length)return;
      const exp=Q.EXPECT[desig];
      rows.sort((a,b)=>{ const va=dashSort.skill==='total'?a.total:a.per[dashSort.skill].pct;
                         const vb=dashSort.skill==='total'?b.total:b.per[dashSort.skill].pct; return (va-vb)*dashSort.dir; });
      let candId=null,best=-1;
      rows.forEach(r=>{ const meets=Q.SKILLS.every(sk=>r.per[sk.id].cat>=exp[sk.id]); if(meets&&r.total>best){best=r.total;candId=r.id;} });
      const h=document.createElement('div'); h.className='grp';
      h.innerHTML=desig+' <span class="faint mono" style="font-size:13px">('+rows.length+')</span>'; body.appendChild(h);
      let html='<table><thead><tr><th data-k="name">Name</th>';
      Q.SKILLS.forEach(sk=>html+='<th data-k="'+sk.id+'">'+sk.name.split(' ')[0]+'</th>');
      html+='<th data-k="total">Overall</th><th>Status</th></tr></thead><tbody>';
      rows.forEach(r=>{
        html+='<tr><td>'+(r.id===candId?'<span class="star">★</span> ':'')+r.name+'</td>';
        Q.SKILLS.forEach(sk=>{ const c=r.per[sk.id].cat, below=c<exp[sk.id];
          html+='<td><i class="cell" style="background:var('+CAT_VAR[c]+');'+(below?'box-shadow:0 0 0 2px var(--ni)':'')+'" title="'+Q.CATS[c]+(below?' — below bar':'')+'"></i> <span class="mono faint">'+r.per[sk.id].pct+'</span></td>'; });
        const meets=Q.SKILLS.every(sk=>r.per[sk.id].cat>=exp[sk.id]);
        const status= meets ? (r.id===candId?'Promotion candidate':'Meets bar') : 'Needs support';
        html+='<td class="mono"><b>'+r.total+'%</b></td><td class="mono faint">'+status+'</td></tr>';
      });
      html+='</tbody></table>';
      const div=document.createElement('div'); div.innerHTML=html; body.appendChild(div);
    });
    body.querySelectorAll('th[data-k]').forEach(th=>{ th.onclick=()=>{ const k=th.dataset.k;
      if(dashSort.skill===k)dashSort.dir*=-1; else{dashSort.skill=k;dashSort.dir=-1;} renderDash(); }; });
  }

  /* ---------- timer + submission ---------- */
  function fmtTime(s){ const m=Math.floor(s/60), r=s%60; return m+':'+(r<10?'0':'')+r; }
  function paintTimer(){ const el=$('#timer'); if(!el)return;
    el.textContent='\u23F1 '+fmtTime(Math.max(0,remaining)); el.classList.toggle('warn', remaining<=60); }
  function startTimer(){
    const lim = A && A.timeLimitSec; const el=$('#timer');
    if(!lim){ if(el) el.classList.add('hidden'); return; }
    remaining = lim; if(el) el.classList.remove('hidden'); paintTimer();
    clearInterval(timerId);
    timerId = setInterval(()=>{ remaining--; paintTimer(); if(remaining<=0){ clearInterval(timerId); onTimeUp(); } }, 1000);
  }
  function stopTimer(){ clearInterval(timerId); timerId=null; const el=$('#timer'); if(el) el.classList.add('hidden'); }
  async function doSubmit(auto){
    if(submitted) return; submitted=true;
    const btn=$('#save'); if(btn) btn.disabled=true;
    try{
      const res=await A.submit(lastRecord,lastRaw,lastCert);
      if($('#saveMsg')) $('#saveMsg').textContent = (auto?'\u23F1 Time is up. ':'') + (res&&res.ok ? (res.msg||'\u2713 Submitted.') : (res&&res.msg||'Submission failed.'));
    }catch(e){ submitted=false; if(btn) btn.disabled=false; if($('#saveMsg')) $('#saveMsg').textContent='Could not submit: '+e.message; return; }
    stopTimer();
  }
  function onTimeUp(){
    if(submitted) return;
    const rEl=$('#result');
    if(rEl && rEl.classList.contains('hidden')){ renderResult(); show('result'); }
    doSubmit(true);
  }

  /* ---------- wiring ---------- */
  function init(adapter){
    A = adapter;
    $('#start').onclick=()=>{
      const nm=$('#name').value.trim(), dg=$('#desig').value;
      if(!nm){alert('Please enter a name.');return;}
      if(!dg){alert('Please select a designation.');return;}
      person={name:nm,desig:dg}; served=[]; p=0; used={}; submitted=false;
      show('quiz'); renderQ(); startTimer();
    };
    $('#next').onclick=()=>{ const cur=served[p]; if(!cur||cur.sel<0)return;
      if(p<TOTAL-1){ p++; renderQ(); }
      else { renderResult(); show('result'); doSubmit(false); } };   // finish = auto-submit

    // certificate download
    const dl=$('#dlCert'); if(dl) dl.onclick=()=>{ if(!lastCert)return;
      const a=document.createElement('a'); a.href=lastCert;
      a.download='certificate-'+(person.name||'result').replace(/[^A-Za-z0-9]+/g,'_')+'.png'; a.click(); };
    // (no retake — a finished assessment is final)

    // dashboard buttons (artifact only)
    ['#toDash','#toDash2'].forEach(id=>{ const b=$(id); if(b) b.onclick=()=>{ show('dashboard'); renderDash(); }; });
    const back=$('#backHome'); if(back) back.onclick=()=>show('home');
    const exp=$('#exportCsv'); if(exp) exp.onclick=exportCsv;
    const clr=$('#clearAll'); if(clr) clr.onclick=async()=>{ if(!confirm('Delete ALL saved records?'))return; await A.deleteAll(); renderDash(); };

    show('home');
  }

  async function exportCsv(){
    let all=[]; try{ all=await A.loadAll(); }catch(e){}
    if(!all.length){ alert('No records to export.'); return; }
    const head=['Name','Designation','Date','Overall%','OverallLevel'];
    Q.SKILLS.forEach(sk=>{ head.push(sk.name+' %'); head.push(sk.name+' level'); });
    const lines=[head.join(',')];
    all.forEach(r=>{ const row=['"'+r.name.replace(/"/g,'""')+'"',r.desig,(r.date||'').slice(0,10),r.total,Q.CATS[r.cat]];
      Q.SKILLS.forEach(sk=>{ row.push(r.per[sk.id].pct); row.push(Q.CATS[r.per[sk.id].cat]); }); lines.push(row.join(',')); });
    const blob=new Blob([lines.join('\n')],{type:'text/csv'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='support-skills-results.csv'; a.click();
  }

  return { init };
})();