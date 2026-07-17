/* ============================================================
   Application Support — Skills Assessment : question bank + config
   Single source of truth. Levels 1..5 (2 questions each per skill).
   o = [ [optionText, isCorrect(1/0)], ... ]  (correct option marked 1)
   ============================================================ */
module.exports = {

SKILLS: [
  {id:'sql',   name:'SQL'},
  {id:'ai',    name:'AI Tools'},
  {id:'linux', name:'Linux / Unix'},
  {id:'aws',   name:'AWS / Cloud'},
  {id:'py',    name:'Scripting (Python/JS)'},
  {id:'api',   name:'API Integration'},
],

CATS: ['Need Improvement','Beginner','Satisfactory','Expert'],

/* minimum expected category index (0..3) per designation per skill */
EXPECT: {
  'Associate Engineer':{sql:1,ai:1,linux:1,aws:1,py:1,api:1},
  'Engineer':          {sql:2,ai:1,linux:2,aws:1,py:1,api:2},
  'Senior Engineer':   {sql:2,ai:2,linux:2,aws:2,py:2,api:2},
  'Tech Lead':         {sql:3,ai:2,linux:3,aws:2,py:2,api:3},
  'Team Lead':         {sql:2,ai:2,linux:2,aws:2,py:2,api:2},
},

/* category bands from per-skill % (difficulty-weighted, see engine) */
BANDS: {expert:80, satisfactory:60, beginner:35}, // else Need Improvement

BANK: [

/* ============== SQL ============== */
{s:'sql',l:1,q:`You frequently run <code>WHERE account_id = ? AND txn_time >= ?</code> (and sometimes filter on account_id alone). The most effective composite index is:`,o:[
  [`(account_id, txn_time) — equality column first, range column last`,1],
  [`(txn_time, account_id)`,0],
  [`(txn_time) on its own`,0],
  [`Two separate single-column indexes, one per column`,0]]},
{s:'sql',l:1,q:`A report must list ALL branches with their transaction counts, including branches that have zero transactions. Using an INNER JOIN to <code>txn</code> instead of a LEFT JOIN will:`,o:[
  [`Drop branches that have no matching transactions from the result`,1],
  [`Return the same rows, just faster`,0],
  [`Show NULL branch names for the missing rows`,0],
  [`Produce a cartesian product`,0]]},

{s:'sql',l:2,q:`<code>WHERE DATE(created_at) = '2024-01-01'</code> does a full scan despite an index on <code>created_at</code>. The most efficient, index-usable rewrite:`,o:[
  [`WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'`,1],
  [`WHERE CAST(created_at AS DATE) = '2024-01-01'`,0],
  [`WHERE created_at LIKE '2024-01-01%'`,0],
  [`Add LIMIT 1000 to the query`,0]]},
{s:'sql',l:2,q:`Given an index on <code>(status, created_at)</code>, which query can use it most effectively (leftmost prefix plus its ordering)?`,o:[
  [`WHERE status = 'OPEN' ORDER BY created_at`,1],
  [`WHERE created_at > now() - interval '1 day'`,0],
  [`ORDER BY created_at with no status filter`,0],
  [`WHERE UPPER(status) = 'OPEN'`,0]]},

{s:'sql',l:3,q:`Two large tables, both already physically sorted on the join key, are joined with no useful indexes. The most efficient join algorithm is usually:`,o:[
  [`A merge join — both inputs are already sorted on the key`,1],
  [`A nested-loop join`,0],
  [`A cartesian product, then filter`,0],
  [`A correlated subquery evaluated per row`,0]]},
{s:'sql',l:3,q:`<code>SELECT status, amount FROM txn WHERE account_id = ?</code> uses the index on account_id but still reads the table row-by-row. To make it index-only:`,o:[
  [`Use a covering index that also includes status and amount`,1],
  [`Give the query more working memory`,0],
  [`Rebuild the table without a primary key`,0],
  [`Add DISTINCT to the SELECT list`,0]]},

{s:'sql',l:4,q:`After a bulk load of 20M rows, a previously fast query suddenly switches to a sequential scan instead of using the index. Most likely cause:`,o:[
  [`Stale optimizer statistics — row estimates are wrong; refresh them (ANALYZE)`,1],
  [`The index was automatically dropped`,0],
  [`Query plans expire after 24 hours`,0],
  [`The newly loaded rows are corrupt`,0]]},
{s:'sql',l:4,q:`A listing paginated with <code>ORDER BY created_at LIMIT 20 OFFSET 500000</code> gets slower on every later page. The scalable fix:`,o:[
  [`Keyset/seek pagination: WHERE created_at < :last_seen ORDER BY created_at LIMIT 20`,1],
  [`Raise the LIMIT so fewer pages are needed`,0],
  [`Remove the ORDER BY`,0],
  [`Add more RAM to the database`,0]]},

{s:'sql',l:5,q:`A 2-billion-row, append-only ledger is slow to query by month and costly to archive old data. The most effective design:`,o:[
  [`Range-partition by month, so queries prune to one partition and old partitions detach cheaply`,1],
  [`Add a separate index on every column`,0],
  [`Keep one heap table and scale up the hardware`,0],
  [`Store the date as a string for faster comparison`,0]]},
{s:'sql',l:5,q:`An OLTP payments table has 14 indexes and write latency has climbed under load. The most accurate explanation:`,o:[
  [`Every index adds write/maintenance cost — each insert/update must maintain all of them; keep only indexes that serve real queries`,1],
  [`Indexes only ever speed things up; the slowdown is unrelated`,0],
  [`More indexes always reduce lock contention`,0],
  [`Indexes are effectively free on SSDs`,0]]},

/* ============== AI TOOLS ============== */
{s:'ai',l:1,q:`An AI coding assistant suggests an SDK method that doesn't exist in the product. The correct response:`,o:[
  [`Treat it as a likely hallucination and verify against the official docs before use`,1],
  [`Use it — the assistant has seen the SDK`,0],
  [`Raise a bug with the SDK team for the missing method`,0],
  [`Try a different assistant and trust whatever it returns`,0]]},
{s:'ai',l:1,q:`Which input most improves an assistant's help when triaging an error?`,o:[
  [`The exact error text, relevant log context, and what you've already tried`,1],
  [`A screenshot of your whole desktop`,0],
  [`"fix my error" with no other detail`,0],
  [`The entire codebase pasted at once`,0]]},

{s:'ai',l:2,q:`The safest way for a Fintech support engineer to use a public AI chatbot on a production log line:`,o:[
  [`Mask account numbers, PII, tokens and internal hostnames before pasting`,1],
  [`Paste it as-is — logs aren't customer data`,0],
  [`Paste it but write "confidential" at the top`,0],
  [`Only paste it outside business hours`,0]]},
{s:'ai',l:2,q:`Asked the identical question twice, an LLM gives two different answers because:`,o:[
  [`Generation is probabilistic — the same prompt can yield different outputs`,1],
  [`It learned from your first question`,0],
  [`Your account was rate-limited`,0],
  [`Its training data updated between the two calls`,0]]},

{s:'ai',l:3,q:`An assistant summarises a 40-page runbook you pasted and drops a critical rollback step from page 38. Most likely cause and fix:`,o:[
  [`Long-context omission — ask targeted questions per section instead of one giant summary`,1],
  [`The model is broken; report it`,0],
  [`It censored the step for safety`,0],
  [`Rollback steps are always excluded from summaries`,0]]},
{s:'ai',l:3,q:`Best workflow to use an assistant to draft a DB patch from a ticket while controlling risk:`,o:[
  [`Have it state its assumptions/reasoning, then you review, dry-run on non-prod, and keep a rollback ready`,1],
  [`Let it apply the patch directly via a connected tool to save time`,0],
  [`Accept it if it "looks right" and matches the ticket wording`,0],
  [`Run it on prod first, since non-prod data differs anyway`,0]]},

{s:'ai',l:4,q:`An internal assistant answers product questions from your own docs (retrieval-augmented) but still invents a config flag occasionally. Best mitigation:`,o:[
  [`Ground answers in retrieved sources, require citations, and make it say "not found" when unsupported`,1],
  [`Raise the temperature for more creativity`,0],
  [`Remove retrieval and rely on the base model`,0],
  [`Add a few more example questions to the prompt`,0]]},
{s:'ai',l:4,q:`Most accurate statement about an agentic assistant that can execute commands in your support tooling, in a regulated Fintech setting:`,o:[
  [`It should run least-privilege, require human approval for side-effecting actions, and keep an audit log`,1],
  [`It's safe as long as a senior engineer configured it`,0],
  [`Read access is dangerous but write access is fine if logged`,0],
  [`Auditing isn't needed because the model is deterministic`,0]]},

{s:'ai',l:5,q:`An assistant confidently cites a policy section that doesn't exist to justify issuing a refund. The deepest systemic safeguard against this class of failure:`,o:[
  [`Never let model output alone authorise side-effecting actions — verify against the system of record first`,1],
  [`Add "do not hallucinate" to the system prompt`,0],
  [`Fine-tune the model on the policy documents`,0],
  [`Ask the model for a confidence score and trust anything above 90%`,0]]},
{s:'ai',l:5,q:`Two engineers used AI to produce near-identical "unique" RCA write-ups containing invented metrics. The correct organisational lesson:`,o:[
  [`AI output must be fact-checked and grounded in real evidence — fabricated metrics in an RCA are a data-integrity issue regardless of tool`,1],
  [`Ban all AI tools`,0],
  [`It's fine because the RCA reads well`,0],
  [`Allow only senior staff to use AI tools`,0]]},

/* ============== LINUX / UNIX ============== */
{s:'linux',l:1,q:`Which command shows free/used space per mounted filesystem?`,o:[
  [`df -h`,1],
  [`du -h`,0],
  [`free -h`,0],
  [`ls -lh`,0]]},
{s:'linux',l:1,q:`Which lists currently running processes with their PIDs?`,o:[
  [`ps -ef`,1],
  [`jobs`,0],
  [`lsof`,0],
  [`ls /proc`,0]]},

{s:'linux',l:2,q:`A service won't start; you suspect another process already holds port 8080. Which finds it?`,o:[
  [`lsof -i :8080`,1],
  [`ps -ef | grep 8080`,0],
  [`netstat -r`,0],
  [`top | grep 8080`,0]]},
{s:'linux',l:2,q:`You need lines 50–60 of a 2 GB log, efficiently, without loading the whole file. Best:`,o:[
  [`sed -n '50,60p' file`,1],
  [`cat file | grep 50`,0],
  [`vi file and jump to line 50`,0],
  [`less file and scroll down`,0]]},

{s:'linux',l:3,q:`<code>tail -f app.log</code> stops showing new lines after the nightly logrotate, although the app keeps logging. Why?`,o:[
  [`tail is still following the old inode; the app now writes a new file — use tail -F`,1],
  [`The disk filled up`,0],
  [`logrotate deleted the application`,0],
  [`tail -f only works for 24 hours`,0]]},
{s:'linux',l:3,q:`A cron job "works when I run it manually" but fails under cron. Most common cause:`,o:[
  [`cron runs with a minimal environment/PATH and a different working dir than your login shell`,1],
  [`cron cannot run shell scripts`,0],
  [`The script needs sudo only under cron`,0],
  [`cron only runs jobs as root`,0]]},

{s:'linux',l:4,q:`<code>df</code> reports the disk 100% full, but <code>du -sh /*</code> sums to far less. Most likely explanation:`,o:[
  [`A deleted-but-still-open file held by a running process is consuming the space (won't appear in du)`,1],
  [`du is inaccurate on large disks`,0],
  [`The filesystem is corrupt`,0],
  [`Hidden files inflate df`,0]]},
{s:'linux',l:4,q:`You must reclaim space from a 30 GB log a running service holds open, WITHOUT restarting the service:`,o:[
  [`Truncate it in place: <code>: > app.log</code> (or truncate -s 0)`,1],
  [`rm app.log`,0],
  [`mv app.log app.log.old`,0],
  [`gzip app.log`,0]]},

{s:'linux',l:5,q:`Production latency spikes intermittently. Which best isolates whether it's CPU, I/O, or memory pressure?`,o:[
  [`Correlate vmstat/iostat/sar over the spike window for run-queue, iowait and swap activity`,1],
  [`Run top once and read the first line`,0],
  [`Reboot and see if it recurs`,0],
  [`Increase ulimit -n`,0]]},
{s:'linux',l:5,q:`A maintenance script runs <code>rm -rf $DIR/</code> where $DIR can be unset, risking <code>rm -rf /</code>. Most robust safeguard:`,o:[
  [`set -euo pipefail (treat unset vars as errors) and validate $DIR is non-empty before deleting`,1],
  [`Run the script only as a non-root user`,0],
  [`Add a comment warning future editors`,0],
  [`Use rm -i interactively inside the automation`,0]]},

/* ============== AWS / CLOUD ============== */
{s:'aws',l:1,q:`Several EC2 instances must mount the SAME read-write POSIX filesystem at the same time (shared scratch and config). The right service:`,o:[
  [`EFS — elastic NFS that many instances mount concurrently`,1],
  [`EBS — a single-attach block volume`,0],
  [`S3 — object storage, not a POSIX filesystem`,0],
  [`Instance store — ephemeral and per-instance`,0]]},
{s:'aws',l:1,q:`An EC2 application needs to read objects from an S3 bucket. The recommended way to grant access:`,o:[
  [`Attach an IAM role (instance profile) to the instance — no stored keys`,1],
  [`Hard-code an access key and secret in the app config`,0],
  [`Make the bucket public`,0],
  [`Place long-lived credentials in EC2 user-data`,0]]},

{s:'aws',l:2,q:`An app in a PRIVATE subnet must call an external partner HTTPS API but must stay unreachable from the internet. Correct setup:`,o:[
  [`A NAT Gateway in a public subnet, with the private subnet routed to it (outbound only)`,1],
  [`Attach an Internet Gateway directly to the private subnet`,0],
  [`Assign the instance a public IP`,0],
  [`Create a VPC peering connection to the partner`,0]]},
{s:'aws',l:2,q:`On a subnet using a custom Network ACL, outbound connections succeed but their inbound replies are dropped. Most likely:`,o:[
  [`NACLs are stateless — you must also allow the ephemeral return-port range inbound`,1],
  [`The security group is misconfigured`,0],
  [`The route table is missing a route`,0],
  [`The instance needs an Elastic IP`,0]]},

{s:'aws',l:3,q:`Heavy reporting queries are degrading the primary RDS instance that also serves live transactions. Most appropriate fix:`,o:[
  [`Offload reads to a read replica and point reporting at it`,1],
  [`Enable Multi-AZ (that is for failover, not read scaling)`,0],
  [`Increase the backup retention period`,0],
  [`Attach a larger EBS volume`,0]]},
{s:'aws',l:3,q:`A globally used static support portal served from S3 in one region is slow for distant users. Best fix:`,o:[
  [`Put CloudFront (a CDN) in front to cache at edge locations near users`,1],
  [`Enable S3 Transfer Acceleration for downloads`,0],
  [`Manually copy the bucket into every region`,0],
  [`Increase the bucket storage quota`,0]]},

{s:'aws',l:4,q:`A service intermittently throttles with ProvisionedThroughputExceeded on DynamoDB despite low average load. Most likely:`,o:[
  [`A hot partition — skewed key distribution concentrates traffic on one partition's capacity`,1],
  [`The table is in the wrong region`,0],
  [`DynamoDB has a global 1000-RPS cap`,0],
  [`You must migrate to RDS`,0]]},
{s:'aws',l:4,q:`A latency-sensitive Lambda behind API Gateway shows multi-second spikes at low traffic and right after deploys. Cause and fix:`,o:[
  [`Cold starts — use provisioned concurrency to keep instances warm`,1],
  [`The function timeout is set too low`,0],
  [`API Gateway is throttling the payload size`,0],
  [`The function needs a bigger EBS volume`,0]]},

{s:'aws',l:5,q:`Cross-account <code>sts:AssumeRole</code> for your monitoring tool fails after a security review. The two-sided requirement to check:`,o:[
  [`Both the target role's trust policy (who may assume it) and the caller's IAM permission to call sts:AssumeRole`,1],
  [`Only the caller's IAM policy`,0],
  [`The S3 bucket policy`,0],
  [`The KMS key rotation schedule`,0]]},
{s:'aws',l:5,q:`Private-subnet instances pull large objects from S3 through a NAT Gateway, and the NAT data-processing bill is huge. The fix that also improves security:`,o:[
  [`Add an S3 Gateway VPC Endpoint so S3 traffic stays on the AWS network and bypasses the NAT Gateway`,1],
  [`Provision additional NAT Gateways`,0],
  [`Move the instances to a public subnet`,0],
  [`Enable S3 Transfer Acceleration`,0]]},

/* ============== SCRIPTING (Python/JS) ============== */
{s:'py',l:1,q:`Which parses a JSON string into a Python object?`,o:[
  [`json.loads(s)`,1],
  [`json.dumps(s)`,0],
  [`json.read(s)`,0],
  [`str(s)`,0]]},
{s:'py',l:1,q:`In JavaScript, <code>"5" + 3</code> evaluates to:`,o:[
  [`"53"`,1],
  [`8`,0],
  [`NaN`,0],
  [`a TypeError`,0]]},

{s:'py',l:2,q:`What does <code>print(0.1 + 0.2 == 0.3)</code> output in Python?`,o:[
  [`False`,1],
  [`True`,0],
  [`0.3`,0],
  [`an error`,0]]},
{s:'py',l:2,q:`In JS: <code>let x=[1,2,3]; let y=x; y.push(4);</code> — what is <code>x</code> now?`,o:[
  [`[1,2,3,4] — arrays are references; y points to the same array`,1],
  [`[1,2,3]`,0],
  [`[4]`,0],
  [`undefined`,0]]},

{s:'py',l:3,q:`<code>def f(v, acc=[]): acc.append(v); return acc</code>. f(1) returns [1]. A later call f(2) returns:`,o:[
  [`[1, 2] — the default list is shared across calls (a classic bug)`,1],
  [`[2]`,0],
  [`[1]`,0],
  [`an error`,0]]},
{s:'py',l:3,q:`A Node patch loops <code>for(...) api.update(users[i])</code> where api.update returns a Promise, with no await. Likely problem:`,o:[
  [`All updates fire at once; completion and errors aren't awaited, and ordering/throttling are lost`,1],
  [`The loop won't run`,0],
  [`Node can't iterate arrays`,0],
  [`i is undefined inside the loop`,0]]},

{s:'py',l:4,q:`What does this print? <code>for (var i=0;i&lt;3;i++){ setTimeout(()=&gt;console.log(i),0); }</code>`,o:[
  [`3, 3, 3 — var is function-scoped, so the closures share one i`,1],
  [`0, 1, 2`,0],
  [`0, 0, 0`,0],
  [`undefined, undefined, undefined`,0]]},
{s:'py',l:4,q:`An interim refund script reads 100k rows and calls a refund API in a loop. It crashes halfway. The key property to make a re-run safe:`,o:[
  [`Idempotency — track processed IDs / use an idempotency key so re-runs don't double-refund`,1],
  [`A faster network connection`,0],
  [`More memory`,0],
  [`A try/catch around the whole script`,0]]},

{s:'py',l:5,q:`Output? <code>def g():</code> yields 0,1,2 in a loop. <code>x=g(); print(next(x)); print(list(x))</code>`,o:[
  [`0 then [1, 2] — the generator is stateful and already consumed the 0`,1],
  [`0 then [0, 1, 2]`,0],
  [`0 then [1, 2, 3]`,0],
  [`an error`,0]]},
{s:'py',l:5,q:`A cleanup job must transform 5M records from one DB to another exactly once, and resume cleanly after a crash. Most robust design:`,o:[
  [`Idempotent batches with a persisted checkpoint/cursor, so a restart resumes from the last committed batch`,1],
  [`Load all 5M into memory, transform, write at the end`,0],
  [`Wrap all 5M rows in one transaction`,0],
  [`Run it twice and hope it converges`,0]]},

/* ============== API INTEGRATION ============== */
{s:'api',l:1,q:`Which status means the request lacks valid authentication (the caller isn't identified)?`,o:[
  [`401 Unauthorized`,1],
  [`403 Forbidden`,0],
  [`400 Bad Request`,0],
  [`404 Not Found`,0]]},
{s:'api',l:1,q:`Which HTTP method is idempotent and used to fully replace a resource?`,o:[
  [`PUT`,1],
  [`POST`,0],
  [`PATCH`,0],
  [`GET`,0]]},

{s:'api',l:2,q:`A token is valid but the user lacks permission for the endpoint. The correct status:`,o:[
  [`403 Forbidden`,1],
  [`401 Unauthorized`,0],
  [`405 Method Not Allowed`,0],
  [`422 Unprocessable Entity`,0]]},
{s:'api',l:2,q:`A POST that creates a payment times out with no response. Is it safe to simply retry?`,o:[
  [`Not blindly — it may have succeeded server-side; retry only with an idempotency key to avoid a double charge`,1],
  [`Yes — a timeout means it failed`,0],
  [`Yes — POST is idempotent`,0],
  [`No — you can never retry a POST`,0]]},

{s:'api',l:3,q:`An integration intermittently returns 502/504 from a gateway under load. Most accurate reading:`,o:[
  [`The upstream/backend was unavailable or too slow — investigate backend health/timeouts, not the request body`,1],
  [`The client sent malformed JSON`,0],
  [`Authentication expired`,0],
  [`The rate limit was exceeded`,0]]},
{s:'api',l:3,q:`A webhook receiver must ack quickly but also does heavy work. Best pattern:`,o:[
  [`Persist the event, return 2xx immediately, then process asynchronously — and dedupe on event id`,1],
  [`Do all processing before returning 200 so the sender knows it finished`,0],
  [`Return 202 and don't persist`,0],
  [`Reject duplicates by returning 500`,0]]},

{s:'api',l:4,q:`A partner enforces 100 req/min. Your 10k-call batch keeps hitting 429 despite a fixed 600 ms delay. Best fix:`,o:[
  [`Honor Retry-After and use a rate limiter aligned to the real limit with backoff + jitter — fixed delays burst and drift`,1],
  [`Lower the delay to send faster`,0],
  [`Run several parallel workers, each with the same delay`,0],
  [`Ignore the 429s and retry immediately`,0]]},
{s:'api',l:4,q:`Two services disagree on a balance after syncing via at-least-once webhooks. The root design need:`,o:[
  [`Idempotent, version/timestamp-ordered processing so duplicate or out-of-order events can't corrupt state`,1],
  [`Switch to at-most-once delivery`,0],
  [`Add more retries on the sender`,0],
  [`Increase the webhook timeout`,0]]},

{s:'api',l:5,q:`Reconciliation shows occasional double-counting: the provider sends BOTH a synchronous API response AND an async webhook for the same event. Correct architectural fix:`,o:[
  [`Key both on the provider's unique event/transaction id and dedupe — make ingestion idempotent regardless of channel`,1],
  [`Disable the webhook and rely on the sync response`,0],
  [`Disable the sync path and rely on the webhook`,0],
  [`Add a nightly job to delete duplicates`,0]]},
{s:'api',l:5,q:`A downstream API silently changed an amount field from integer cents to a decimal string ("10.50") with no version bump, so your parser mis-records values. Beyond fixing the parser, the systemic safeguards:`,o:[
  [`Schema/contract validation on responses with alerting on type anomalies, plus pinning to a versioned API`,1],
  [`Wrap the parser in try/catch and continue`,0],
  [`Trust the provider not to change it again`,0],
  [`Round every amount to avoid type issues`,0]]},

]
};