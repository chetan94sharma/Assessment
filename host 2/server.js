/* ============================================================
   Application Support — Skills Assessment server
   Pure Node.js (no npm install needed). Node 18+.

   Run:   ADMIN_KEY=your-secret node server.js
   Test:  http://<this-host>:3000/
   Admin: http://<this-host>:3000/admin?key=your-secret
   ============================================================ */
const http = require('http');
const https= require('https');
const fs   = require('fs');
const path = require('path');
const Q    = require('./questions.cjs');           // SKILLS, CATS, EXPECT, BANDS, BANK

const PORT      = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me-admin';
const PUBLIC    = path.join(__dirname, 'public');
const DATA_DIR  = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'results.json');

// --- email-on-submit (Resend) ---
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL || '';
const MAIL_FROM      = process.env.MAIL_FROM || 'Skills Assessment <onboarding@resend.dev>';
const EMAIL_ON = !!(RESEND_API_KEY && ADMIN_EMAIL);

if (ADMIN_KEY === 'change-me-admin')
  console.warn('\n[WARN] Using the default ADMIN_KEY. Set ADMIN_KEY=... before sharing the link.\n');
if (!EMAIL_ON)
  console.warn('[WARN] Email delivery is OFF. Set RESEND_API_KEY and ADMIN_EMAIL to email results on submit.\n');
else
  console.log('[OK] Email delivery ON -> results will be emailed to ' + ADMIN_EMAIL + '\n');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, {recursive:true});
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

const readAll  = () => { try { return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); } catch(e){ return []; } };
const writeAll = (a) => fs.writeFileSync(DATA_FILE, JSON.stringify(a,null,2));
const catIndex = (pct) => pct>=Q.BANDS.expert?3 : pct>=Q.BANDS.satisfactory?2 : pct>=Q.BANDS.beginner?1 : 0;
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---- authoritative scoring from raw answers [{qi, oi}] ---- */
/* ---- email the result (+certificate) to the admin via Resend, no deps ---- */
function sendResultEmail(rec, certB64){
  return new Promise((resolve) => {
    if(!EMAIL_ON) return resolve(false);
    const rows = Q.SKILLS.map(s => {
      const p = rec.per[s.id];
      return '<tr><td style="padding:4px 10px 4px 0">'+esc(s.name)+'</td>'+
             '<td style="padding:4px 10px"><b>'+esc(p.score)+'</b></td>'+
             '<td style="padding:4px 10px">'+p.pct+'%</td>'+
             '<td style="padding:4px 0">'+esc(Q.CATS[p.cat])+'</td></tr>';
    }).join('');
    const html =
      '<div style="font-family:Arial,sans-serif;color:#111">'+
      '<h2 style="margin:0 0 4px">'+esc(rec.name)+' <span style="color:#666;font-weight:400">— '+esc(rec.desig)+'</span></h2>'+
      '<p style="color:#666;margin:0 0 12px">'+esc(rec.date)+'</p>'+
      '<p style="font-size:18px;margin:0 0 14px"><b>Overall: '+rec.total+'% — '+esc(Q.CATS[rec.cat])+'</b></p>'+
      '<table style="border-collapse:collapse;font-size:14px">'+rows+'</table>'+
      (certB64 ? '<p style="color:#666;margin-top:14px">Certificate attached.</p>' : '')+
      '</div>';
    const payload = {
      from: MAIL_FROM, to: [ADMIN_EMAIL],
      subject: 'Assessment: '+rec.name+' ('+rec.desig+') — '+rec.total+'% '+Q.CATS[rec.cat],
      html: html
    };
    if(certB64) payload.attachments = [{ filename: (rec.certFile || (rec.name.replace(/[^A-Za-z0-9]+/g,'_')+'.png')), content: certB64 }];
    const body = Buffer.from(JSON.stringify(payload));
    let done=false; const finish = v => { if(!done){ done=true; resolve(v); } };
    const req = https.request('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+RESEND_API_KEY,'Content-Length':body.length}
    }, r => { let d=''; r.on('data',c=>d+=c); r.on('end',()=>{
        if(r.statusCode>=200 && r.statusCode<300) finish(true);
        else { console.error('[email] failed', r.statusCode, d.slice(0,200)); finish(false); }
      }); });
    req.on('error', e => { console.error('[email] error', e.message); finish(false); });
    req.setTimeout(9000, () => { req.destroy(); console.error('[email] timeout'); finish(false); });
    req.write(body); req.end();
  });
}

function scoreSubmission(answers){
  const per = {}; Q.SKILLS.forEach(s => per[s.id] = {earned:0, servedSum:0, peak:0, correct:0, answered:0});
  answers.forEach(a => {
    const q = Q.BANK[a.qi]; if(!q || !per[q.s]) return;
    const opt = q.o[a.oi];
    const correct = !!(opt && opt[1] === 1);
    const acc = per[q.s];
    acc.answered += 1; acc.servedSum += q.l;
    if (correct){ acc.correct += 1; acc.earned += q.l; if(q.l > acc.peak) acc.peak = q.l; }
  });
  let te=0, tm=0; const out={};
  Q.SKILLS.forEach(s => {
    const a = per[s.id]; const pct = a.servedSum ? Math.round(a.earned/a.servedSum*100) : 0;
    out[s.id] = { score: a.correct + ' out of ' + a.answered, correct:a.correct, answered:a.answered,
                  pct, cat:catIndex(pct), peak:a.peak };
    te += a.earned; tm += a.servedSum;
  });
  const total = tm ? Math.round(te/tm*100) : 0;
  return {per:out, total, cat:catIndex(total)};
}

/* ---- HTTP ---- */
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');

  // POST /api/submit
  if (req.method === 'POST' && u.pathname === '/api/submit'){
    let body=''; req.on('data', c => { body += c; if(body.length > 6e6) req.destroy(); });
    req.on('end', async () => {
      try{
        const d = JSON.parse(body);
        if(!d.name || !Q.EXPECT[d.desig] || !Array.isArray(d.answers)) { res.writeHead(400); return res.end('Invalid submission'); }
        const sc = scoreSubmission(d.answers);
        const rec = { id:'r_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
                      name:String(d.name).slice(0,80), desig:d.desig, date:new Date().toISOString(),
                      total:sc.total, cat:sc.cat, per:sc.per };
        // certificate base64 (used for both disk save and email attachment)
        let certB64 = null;
        if (typeof d.certificate === 'string' && d.certificate.indexOf('data:image/png;base64,') === 0){
          certB64 = d.certificate.split(',')[1];
          try{
            const cdir = path.join(DATA_DIR, 'certificates');
            if(!fs.existsSync(cdir)) fs.mkdirSync(cdir, {recursive:true});
            const base = (String(rec.name).trim().replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60)) || 'candidate';
            let file = base + '.png', n = 2;
            while(fs.existsSync(path.join(cdir, file))){ file = base + '_' + (n++) + '.png'; }
            fs.writeFileSync(path.join(cdir, file), Buffer.from(certB64, 'base64'));
            rec.certFile = file;
          }catch(e){ /* disk save is best-effort (free hosts have no persistent disk) */ }
        }
        const all = readAll(); all.push(rec); writeAll(all);
        let emailed = false;
        try{ emailed = await sendResultEmail(rec, certB64); }catch(e){ /* non-fatal */ }
        res.writeHead(200, {'Content-Type':'application/json'});
        return res.end(JSON.stringify({ok:true, id:rec.id, certFile:rec.certFile, emailed}));
      }catch(e){ res.writeHead(400); return res.end('Bad request'); }
    });
    return;
  }

  // GET /cert?file=..&key=..  -> serve a saved certificate image (admin only)
  if (u.pathname === '/cert'){
    if (u.searchParams.get('key') !== ADMIN_KEY){ res.writeHead(401); return res.end('Access denied'); }
    const file = path.basename(u.searchParams.get('file') || '');
    if(!/^[A-Za-z0-9_-]+\.png$/.test(file)){ res.writeHead(400); return res.end('Bad file'); }
    const fp = path.join(DATA_DIR, 'certificates', file);
    if(!fp.startsWith(path.join(DATA_DIR,'certificates')) || !fs.existsSync(fp)){ res.writeHead(404); return res.end('No certificate'); }
    res.writeHead(200, {'Content-Type':'image/png'}); return fs.createReadStream(fp).pipe(res);
  }

  // GET /admin  and  /admin.csv  (key-gated)
  if (u.pathname === '/admin' || u.pathname === '/admin.csv'){
    if (u.searchParams.get('key') !== ADMIN_KEY){
      res.writeHead(401, {'Content-Type':'text/html'});
      return res.end('<body style="font-family:sans-serif;background:#0e1116;color:#e7ecf1;padding:40px">Access denied. Append <code>?key=YOUR_ADMIN_KEY</code> to the URL.</body>');
    }
    const all = readAll();
    if (u.pathname === '/admin.csv'){
      const head=['Name','Designation','Date','Overall%','OverallLevel'];
      Q.SKILLS.forEach(s=>{head.push(s.name+' %');head.push(s.name+' level');});
      const lines=[head.join(',')];
      all.forEach(r=>{ const row=['"'+String(r.name).replace(/"/g,'""')+'"',r.desig,(r.date||'').slice(0,10),r.total,Q.CATS[r.cat]];
        Q.SKILLS.forEach(s=>{row.push(r.per[s.id].pct);row.push(Q.CATS[r.per[s.id].cat]);}); lines.push(row.join(','));});
      res.writeHead(200, {'Content-Type':'text/csv','Content-Disposition':'attachment; filename="results.csv"'});
      return res.end(lines.join('\n'));
    }
    res.writeHead(200, {'Content-Type':'text/html'}); return res.end(renderAdmin(all, u.searchParams.get('key')));
  }

  // static files
  let f = u.pathname === '/' ? '/index.html' : u.pathname;
  const fp = path.join(PUBLIC, path.normalize(f).replace(/^(\.\.[\/\\])+/, ''));
  if (!fp.startsWith(PUBLIC) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()){ res.writeHead(404); return res.end('Not found'); }
  const ext = path.extname(fp).toLowerCase();
  const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[ext] || 'text/plain';
  res.writeHead(200, {'Content-Type':mime}); fs.createReadStream(fp).pipe(res);
});

server.listen(PORT, () => {
  console.log('Assessment running:  http://localhost:'+PORT+'/');
  console.log('Admin dashboard:     http://localhost:'+PORT+'/admin?key='+ADMIN_KEY);
  console.log('Share the test link on your LAN as  http://<this-machine-ip>:'+PORT+'/');
});

/* ---- admin dashboard HTML ---- */
function renderAdmin(all, key){
  const VAR = {0:'#ef5a5a',1:'#e9b949',2:'#4ea8de',3:'#54c08a'};
  const order = ['Associate Engineer','Engineer','Senior Engineer','Tech Lead','Team Lead'];
  let groups = '';
  order.forEach(desig => {
    let rows = all.filter(r => r.desig === desig); if(!rows.length) return;
    const exp = Q.EXPECT[desig];
    rows.sort((a,b) => b.total - a.total);
    let candId=null, best=-1;
    rows.forEach(r => { const meets = Q.SKILLS.every(s => r.per[s.id].cat >= exp[s.id]); if(meets && r.total>best){best=r.total;candId=r.id;} });
    let tr = '';
    rows.forEach(r => {
      let cells = '';
      Q.SKILLS.forEach(s => { const c=r.per[s.id].cat, below=c<exp[s.id];
        cells += '<td><i class="cell" style="background:'+VAR[c]+';'+(below?'box-shadow:0 0 0 2px #ef5a5a':'')+'" title="'+esc(Q.CATS[c])+(below?' — below bar':'')+'"></i> <span class="f">'+r.per[s.id].pct+'</span></td>'; });
      const meets = Q.SKILLS.every(s => r.per[s.id].cat >= exp[s.id]);
      const status = meets ? (r.id===candId?'Promotion candidate':'Meets bar') : 'Needs support';
      const cert = r.certFile
        ? '<a class="f" href="/cert?file='+encodeURIComponent(r.certFile)+'&key='+encodeURIComponent(key)+'" target="_blank">view</a>'
        : '<span class="f">—</span>';
      tr += '<tr><td>'+(r.id===candId?'★ ':'')+esc(r.name)+'</td>'+cells+'<td><b>'+r.total+'%</b></td><td class="f">'+status+'</td><td class="f">'+(r.date||'').slice(0,10)+'</td><td>'+cert+'</td></tr>';
    });
    let th = '<th>Name</th>'; Q.SKILLS.forEach(s => th += '<th>'+esc(s.name.split(' ')[0])+'</th>');
    th += '<th>Overall</th><th>Status</th><th>Date</th><th>Cert</th>';
    groups += '<div class="grp">'+esc(desig)+' <span class="f">('+rows.length+')</span></div><div class="scroll"><table><thead><tr>'+th+'</tr></thead><tbody>'+tr+'</tbody></table></div>';
  });
  if(!groups) groups = '<p class="f" style="padding:30px 0">No submissions yet.</p>';
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin — Skills Assessment</title>
<style>
 body{margin:0;background:#0e1116;color:#e7ecf1;font-family:"IBM Plex Sans",system-ui,sans-serif;padding:30px 22px 80px}
 .wrap{max-width:1000px;margin:0 auto}
 h1{font-size:30px;margin:0 0 6px} .f{color:#8a97a6;font-size:12px}
 .grp{font-size:20px;margin:26px 0 6px;font-weight:600}
 table{width:100%;border-collapse:collapse;font-size:13px}
 th,td{text-align:left;padding:9px;border-bottom:1px solid #2a323d;white-space:nowrap}
 th{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#8a97a6}
 .cell{display:inline-block;width:13px;height:13px;border-radius:4px;vertical-align:middle}
 .scroll{overflow-x:auto} a.btn{display:inline-block;color:#1a1405;background:#e9b949;padding:9px 16px;border-radius:9px;text-decoration:none;font-weight:600;font-size:13px}
 .legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:#8a97a6;margin-top:18px}
 .legend i{display:inline-block;width:13px;height:13px;border-radius:4px;margin-right:6px;vertical-align:middle}
</style>
<div class="wrap">
 <h1>Skills Assessment — Admin</h1>
 <p class="f">${all.length} submission(s). Red-ringed cells are below the bar for that designation. ★ = strongest candidate in the group.</p>
 <p style="margin:14px 0"><a class="btn" href="/admin.csv?key=${encodeURIComponent(key)}">Download CSV</a> &nbsp; <a class="f" href="/admin?key=${encodeURIComponent(key)}">↻ Refresh</a></p>
 ${groups}
 <div class="legend">
   <span><i style="background:#ef5a5a"></i>Need Improvement</span><span><i style="background:#e9b949"></i>Beginner</span>
   <span><i style="background:#4ea8de"></i>Satisfactory</span><span><i style="background:#54c08a"></i>Expert</span>
 </div>
</div>`;
}
