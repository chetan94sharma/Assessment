# Application Support — Skills Assessment (self-hosted)

Host the assessment once, share a single link, and collect everyone's results in an
admin dashboard. Includes a **25-minute timer that auto-submits** and **anti-copy**
protection on the test UI.

No database, no `npm install`. Node.js 18+ only.

```
host/
├─ server.js            # zero-dependency Node server (serves test + scores + admin)
├─ questions.cjs        # question bank + answer key (server-side scoring)
├─ README.md
└─ public/
   ├─ index.html        # the assessment candidates take (timer + anti-copy on)
   ├─ questions.js      # question bank for the browser to render
   ├─ engine.js         # adaptive engine, timer, auto-submit
   └─ app-init.js       # submits answers to the server; enables timer + anti-copy
└─ data/                # results.json is auto-created here on first submit
```

## 1. Run it

```bash
cd host
ADMIN_KEY=pick-a-strong-secret node server.js
```

You'll see:

```
Assessment running:  http://localhost:3000/
Admin dashboard:     http://localhost:3000/admin?key=pick-a-strong-secret
```

## 2. Requirement 1 — many people join via one link

Share the same URL with the whole team:

- Same machine: `http://localhost:3000/`
- Office LAN / VPN: `http://<this-machine-ip>:3000/` (e.g. `http://10.20.4.7:3000/`).
  Find the IP with `ip addr` (Linux/macOS) or `ipconfig` (Windows).

There's no per-user setup — any number of people open the link at once, enter their
name + designation, and take the test. Each submission is stored as its own record.

## 3. Requirement 2 — results come to you on submit

When a candidate submits (or the timer runs out), their answers are POSTed to the
server, scored server-side from the answer key, and appended to
`host/data/results.json`. Open the admin dashboard any time:

```
http://<host>:3000/admin?key=YOUR_ADMIN_KEY
```

You get every submission grouped by designation and ranked, with skill gaps red-ringed,
the top promotion candidate per group starred, and a Download CSV button.

## 4. Requirement 3 — 25-minute timer + anti-copy

- Timer: a countdown starts the moment a candidate clicks *Begin*, shown top-right.
  It turns red in the final minute. At 0:00 the assessment auto-submits whatever has
  been answered so far (unanswered/never-reached questions simply don't score). Change
  the limit in `public/app-init.js` — `timeLimitSec: 25 * 60`.
- Anti-copy: the test page disables text selection, right-click, copy/cut, drag,
  and the common copy/save/print/view-source/devtools shortcuts.

  > Be realistic about this. Browser-based anti-copy is a *deterrent*, not true
  > protection. A determined user can still screenshot, photograph the screen, or open
  > devtools. Treat the test as supervised/proctored; the timer + anti-copy raise the
  > effort bar, they don't make cheating impossible. (The scoring key is necessarily in
  > the page for the adaptive logic, so supervision is the real safeguard.)

## 5. Notes

- Change the key. Without `ADMIN_KEY=...` the server uses an insecure default and warns.
- Scoring is server-side from the raw answers, so a candidate can't edit their own score.
- Keep it internal. Plain HTTP for a trusted network. Beyond a LAN, put it behind your
  VPN and a reverse proxy (nginx/Caddy) terminating HTTPS; consider real SSO instead of
  the URL key.
- Data lives in `host/data/results.json` (plain JSON — back it up or wipe as needed).
- Change the port: `PORT=8080 ADMIN_KEY=... node server.js`.

## 6. Keeping it running

- Quick: `nohup ADMIN_KEY=... node server.js &`
- Better: a process manager so it restarts on reboot/crash — `pm2 start server.js --name skills`,
  a small `systemd` unit, or a one-line Docker image (`FROM node:20-alpine`, copy folder,
  `CMD ["node","server.js"]`).

## 7. Fully managed cloud alternative

Host `public/` on S3 + CloudFront, move `/api/submit` to Lambda + API Gateway, and
store submissions in DynamoDB (one item per submission, partition key = designation).
The `scoreSubmission` function in `server.js` ports directly to the Lambda handler.

## 8. What changed in this build

- **Finish = submit, and it's final.** When a candidate answers the last question, the whole
  assessment is submitted automatically. There is no "retake" — a finished attempt is final.
- **Certificate image.** At the end, each candidate sees a printable certificate (name,
  designation, date, overall level, and each skill as "X out of Y") and can download it as a PNG.
  The same image is saved on the server at `data/certificates/<id>.png` and is linked from the
  admin dashboard (the "Cert" column). Certificate viewing is key-gated: `/cert?id=<id>&key=<KEY>`.
- **results.json format.** Each record now carries a per-skill breakdown, e.g.
  `"sql": { "score": "4 out of 6", "correct": 4, "answered": 6, "pct": 57, "cat": 2, "peak": 4 }`,
  alongside `total` (overall weighted %) and `cat` (0=Need Improvement … 3=Expert).
- **Shuffled options.** Answer choices are shuffled fresh on every load, so no two candidates
  see the same option order (and the adaptive engine already serves different questions per person).

## 9. Testing multiple connections first

Before the real assessment, open **`/connection-test.html`** (e.g.
`https://your-link.trycloudflare.com/connection-test.html`) on several devices at once. It's a
4-question SQL check that submits to the same server, so you can confirm many people can connect
and that submissions land on the admin dashboard. These arrive as `[TEST] …` records under
**Engineer** — delete them (or reset `data/results.json`) before inviting real candidates.

## 10. Email results on submit (recommended on free hosting)

Because free hosts have no durable disk, the server can EMAIL you each result with the
certificate attached the moment a candidate finishes — nothing to lose on a restart.
It uses Resend (free: ~100 emails/day) over plain HTTPS, so no extra packages are needed.

Setup (about 3 minutes):
1. Sign up free at https://resend.com and verify the email you sign up with — that inbox is
   where results will arrive when using the default sender.
2. In Resend, open API Keys and create one. Copy it (it starts with `re_`).
3. In Render → your service → Environment, add:
   - `RESEND_API_KEY` = the key you copied
   - `ADMIN_EMAIL`    = your email (the same address you registered with Resend)
   - `MAIL_FROM`      = (leave unset to use the default sender)
4. Save. Render redeploys, and every submission now emails you the candidate's name,
   designation, overall score, per-skill breakdown, and the certificate PNG as an attachment.

Notes:
- The default sender `onboarding@resend.dev` can only deliver to YOUR Resend account email.
  To send to a different or shared address, verify a domain in Resend and set
  `MAIL_FROM` to something like `Assessment <noreply@yourdomain.com>`.
- Email is additive — the app still tries to save to disk too, so if you later add a
  Render disk (section 9 / render.yaml) you get both.
- The server log prints `[OK] Email delivery ON ...` at startup when configured, and
  `[email] failed ...` if a send is rejected (e.g. wrong key or unverified recipient).
