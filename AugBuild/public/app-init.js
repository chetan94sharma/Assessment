// ---- hide the in-app dashboard controls (admins use /admin instead) ----
document.querySelectorAll('.dashonly').forEach(e => e.style.display = 'none');

// ---- anti-copy deterrents (client-side; discourage casual copying) ----
(function () {
  const allowInput = t => /^(INPUT|SELECT|TEXTAREA)$/.test(t && t.tagName);
  const block = e => { e.preventDefault(); e.stopPropagation(); return false; };
  document.addEventListener('contextmenu', block);
  document.addEventListener('copy',  e => { if (!allowInput(e.target)) block(e); });
  document.addEventListener('cut',   e => { if (!allowInput(e.target)) block(e); });
  document.addEventListener('dragstart', block);
  document.addEventListener('selectstart', e => { if (!allowInput(e.target)) block(e); });
  document.addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase();
    if (e.ctrlKey || e.metaKey) {                 // Ctrl/Cmd + C/X/A/S/P/U
      if (['c','x','a','s','p','u'].includes(k) && !allowInput(e.target)) return block(e);
    }
    if (k === 'f12') return block(e);              // devtools shortcut (best-effort)
    if (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(k)) return block(e);
  });
  try { window.addEventListener('keyup', e => { if ((e.key||'') === 'PrintScreen' && navigator.clipboard) navigator.clipboard.writeText(''); }); } catch (_) {}
})();

// ---- assessment adapter: 25-min auto-submit + server-side scoring ----
AppEngine.init({
  mode: 'server',
  timeLimitSec: 25 * 60,                          // 25-minute limit, then auto-submit
  async submit(rec, raw, cert) {
    try {
      const res = await fetch('/api/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: rec.name, desig: rec.desig, answers: raw, certificate: cert })
      });
      if (!res.ok) { const t = await res.text().catch(() => ''); return { ok: false, msg: 'Server error ' + res.status + '. ' + t }; }
      return { ok: true, msg: 'Your assessment has been submitted. You may close this tab.' };
    } catch (e) { return { ok: false, msg: 'Network error: ' + e.message }; }
  },
});
const sb = document.querySelector('#save'); if (sb) sb.textContent = 'Submit results';