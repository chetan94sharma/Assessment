window.QUIZ = {
 "SKILLS": [
  {
   "id": "sql",
   "name": "SQL"
  },
  {
   "id": "ai",
   "name": "AI Tools"
  },
  {
   "id": "linux",
   "name": "Linux / Unix"
  },
  {
   "id": "aws",
   "name": "AWS / Cloud"
  },
  {
   "id": "py",
   "name": "Scripting (Python/JS)"
  },
  {
   "id": "api",
   "name": "API Integration"
  }
 ],
 "CATS": [
  "Need Improvement",
  "Beginner",
  "Satisfactory",
  "Expert"
 ],
 "EXPECT": {
  "Associate Engineer": {
   "sql": 1,
   "ai": 1,
   "linux": 1,
   "aws": 1,
   "py": 1,
   "api": 1
  },
  "Engineer": {
   "sql": 2,
   "ai": 2,
   "linux": 2,
   "aws": 1,
   "py": 1,
   "api": 2
  },
  "Senior Engineer": {
   "sql": 3,
   "ai": 2,
   "linux": 2,
   "aws": 2,
   "py": 3,
   "api": 3
  },
  "Tech Lead": {
   "sql": 3,
   "ai": 2,
   "linux": 3,
   "aws": 2,
   "py": 2,
   "api": 3
  },
  "Team Lead": {
   "sql": 2,
   "ai": 2,
   "linux": 2,
   "aws": 2,
   "py": 2,
   "api": 2
  }
 },
 "BANDS": {
  "expert": 80,
  "satisfactory": 60,
  "beginner": 35
 },
 "BANK": [
  {
   "s": "sql",
   "l": 1,
   "q": "A report joins the orders table to the customers table on customer_id using an INNER JOIN. Which rows will appear in the result?",
   "o": [
    [
     "Only orders that have a matching customer",
     1
    ],
    [
     "All orders, matched or not",
     0
    ],
    [
     "All customers, even without orders",
     0
    ],
    [
     "Every order paired with every customer",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 1,
   "q": "You need a report showing, for each customer, how many orders they have placed — one row per customer. The correct query is:",
   "o": [
    [
     "COUNT(*) with GROUP BY customer_id",
     1
    ],
    [
     "COUNT(*) with ORDER BY customer_id",
     0
    ],
    [
     "SUM(customer_id) with GROUP BY",
     0
    ],
    [
     "COUNT(customer_id) with no grouping",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 2,
   "q": "A query filters with WHERE DATE(created_at) = '2024-01-01' but runs slowly and ignores the index on created_at. The most efficient, index-friendly rewrite is:",
   "o": [
    [
     "created_at &gt;= '2024-01-01' AND &lt; next day",
     1
    ],
    [
     "CAST(created_at AS DATE) = the date",
     0
    ],
    [
     "created_at LIKE '2024-01-01%'",
     0
    ],
    [
     "created_at BETWEEN 1 AND 2",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 2,
   "q": "You must list every customer with their total order amount, and customers who placed no orders must still appear (with a zero/null total). The right approach is:",
   "o": [
    [
     "LEFT JOIN with SUM and GROUP BY",
     1
    ],
    [
     "INNER JOIN with SUM and GROUP BY",
     0
    ],
    [
     "LEFT JOIN with COUNT only",
     0
    ],
    [
     "CROSS JOIN with SUM",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 3,
   "q": "For a dashboard you must return the three most recent orders for each customer, not just the three most recent overall. The cleanest way to express this is:",
   "o": [
    [
     "A window function ranked per customer",
     1
    ],
    [
     "GROUP BY customer with LIMIT 3",
     0
    ],
    [
     "One ORDER BY with LIMIT 3",
     0
    ],
    [
     "DISTINCT on the customer column",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 3,
   "q": "A revenue report joins orders to shipments, but because one order can have several shipments the order amount is counted multiple times and totals are inflated. The correct fix is to:",
   "o": [
    [
     "Summing shipments in a subquery first",
     1
    ],
    [
     "Adding DISTINCT to the query",
     0
    ],
    [
     "Switching to an INNER JOIN",
     0
    ],
    [
     "Adding an ORDER BY clause",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 4,
   "q": "Right after a bulk load of 20 million rows, a query that was fast now does a full table scan instead of using its index. The most likely cause is:",
   "o": [
    [
     "The table's statistics are stale",
     1
    ],
    [
     "The index was dropped in the load",
     0
    ],
    [
     "Query plans expire after a day",
     0
    ],
    [
     "The loaded rows are corrupted",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 4,
   "q": "A paginated screen uses LIMIT 20 OFFSET 500000 to reach deep pages, and responses get slower the further users page. The scalable fix is to:",
   "o": [
    [
     "Page with WHERE key &gt; last_seen",
     1
    ],
    [
     "Increase the LIMIT value",
     0
    ],
    [
     "Remove the ORDER BY clause",
     0
    ],
    [
     "Add more server memory",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 5,
   "q": "A 2-billion-row event-log table is queried mostly by month, and archiving old data has become slow and expensive. The most effective design change is to:",
   "o": [
    [
     "Range-partition the table by month",
     1
    ],
    [
     "Index every column separately",
     0
    ],
    [
     "Store the dates as text",
     0
    ],
    [
     "Buy one larger server",
     0
    ]
   ]
  },
  {
   "s": "sql",
   "l": 5,
   "q": "A busy OLTP payments table has accumulated 14 indexes, and insert/update latency has been climbing under load. The most accurate explanation is:",
   "o": [
    [
     "Every write must update each index",
     1
    ],
    [
     "Indexes always slow reads too",
     0
    ],
    [
     "Indexes reduce lock contention",
     0
    ],
    [
     "SSDs make indexes free",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 1,
   "q": "An AI assistant gives you a confident-sounding answer about how your own product behaves. Before you act on it, the right thing to do is:",
   "o": [
    [
     "Verify it against the official docs",
     1
    ],
    [
     "Assume it is always correct",
     0
    ],
    [
     "Trust it if it sounds confident",
     0
    ],
    [
     "Re-ask until it agrees",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 1,
   "q": "You want an AI assistant to help you triage a production error quickly. Which input will get you the most useful answer?",
   "o": [
    [
     "The exact error text and logs",
     1
    ],
    [
     "A photo of your whole screen",
     0
    ],
    [
     "Just 'it's broken, fix it'",
     0
    ],
    [
     "Your entire codebase at once",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 2,
   "q": "You want to paste a line from a production log into a public AI chatbot to help interpret it. Before doing so, you should:",
   "o": [
    [
     "Mask account numbers, tokens and PII",
     1
    ],
    [
     "Paste it exactly as it is",
     0
    ],
    [
     "Add the word 'confidential' on top",
     0
    ],
    [
     "Only paste it after hours",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 2,
   "q": "You ask an AI model the exact same question twice in a row and get two noticeably different answers. This happens because:",
   "o": [
    [
     "Its output is probabilistic by design",
     1
    ],
    [
     "It memorized your first question",
     0
    ],
    [
     "Your account was rate-limited",
     0
    ],
    [
     "Its training data changed meanwhile",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 3,
   "q": "You ask an AI to summarize a 40-page runbook and its summary silently omits a critical rollback step from page 38. The best way to work around this is to:",
   "o": [
    [
     "Ask focused questions section by section",
     1
    ],
    [
     "Trust the summary as complete",
     0
    ],
    [
     "Report the model as broken",
     0
    ],
    [
     "Assume the step was minor",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 3,
   "q": "You use an AI assistant to draft a database patch from a support ticket. To keep the change safe before it touches production, the best workflow is to:",
   "o": [
    [
     "Review it, then dry-run on non-prod",
     1
    ],
    [
     "Apply it directly to save time",
     0
    ],
    [
     "Run it if it looks about right",
     0
    ],
    [
     "Test it on production first",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 4,
   "q": "Your team builds an internal assistant that answers questions from your own docs, yet it still occasionally invents a configuration flag that doesn't exist. The best mitigation is:",
   "o": [
    [
     "Grounding answers in cited sources",
     1
    ],
    [
     "Raising the model's temperature",
     0
    ],
    [
     "Removing retrieval entirely",
     0
    ],
    [
     "Adding more prompt examples",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 4,
   "q": "You are introducing an AI agent that can execute commands inside your support tooling in a regulated environment. It should be set up to operate with:",
   "o": [
    [
     "Least privilege and human approval",
     1
    ],
    [
     "Full access if a senior set it up",
     0
    ],
    [
     "Write access, since it's logged",
     0
    ],
    [
     "No audit log; it's deterministic",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 5,
   "q": "An AI assistant confidently cites a company policy section that doesn't actually exist, using it to justify issuing a refund. The most important safeguard against this is to:",
   "o": [
    [
     "Verify against the system of record",
     1
    ],
    [
     "Add 'do not hallucinate' to the prompt",
     0
    ],
    [
     "Fine-tune it on the policies",
     0
    ],
    [
     "Trust its confidence score",
     0
    ]
   ]
  },
  {
   "s": "ai",
   "l": 5,
   "q": "A reviewer finds that two engineers submitted AI-written root-cause analyses containing fabricated metrics. The right organizational lesson is that:",
   "o": [
    [
     "AI output must be fact-checked",
     1
    ],
    [
     "Ban all AI tools outright",
     0
    ],
    [
     "Accept it; it reads well",
     0
    ],
    [
     "Let only seniors use AI",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 1,
   "q": "Which command shows free space on each mounted filesystem?",
   "o": [
    [
     "df -h",
     1
    ],
    [
     "du -h",
     0
    ],
    [
     "free -h",
     0
    ],
    [
     "ls -l",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 1,
   "q": "Which command lists the running processes with their IDs?",
   "o": [
    [
     "ps -ef",
     1
    ],
    [
     "jobs",
     0
    ],
    [
     "pwd",
     0
    ],
    [
     "who",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 2,
   "q": "Which command finds all lines containing 'ERROR' in app.log?",
   "o": [
    [
     "grep ERROR app.log",
     1
    ],
    [
     "find ERROR app.log",
     0
    ],
    [
     "cat ERROR app.log",
     0
    ],
    [
     "sort ERROR app.log",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 2,
   "q": "To watch new lines appended to a log in real time, use:",
   "o": [
    [
     "tail -f app.log",
     1
    ],
    [
     "head app.log",
     0
    ],
    [
     "cat app.log",
     0
    ],
    [
     "less app.log",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 3,
   "q": "A service won't start because its port is in use. Which finds the process?",
   "o": [
    [
     "lsof -i :8080",
     1
    ],
    [
     "ps aux | grep 8080",
     0
    ],
    [
     "netstat -r",
     0
    ],
    [
     "top",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 3,
   "q": "A script runs fine manually but fails under cron. The usual cause is:",
   "o": [
    [
     "cron uses a minimal PATH/environment",
     1
    ],
    [
     "cron cannot run shell scripts",
     0
    ],
    [
     "cron only runs as root",
     0
    ],
    [
     "cron needs sudo to run",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 4,
   "q": "A script fails with 'Permission denied' when run. The fix is usually to:",
   "o": [
    [
     "chmod +x the script",
     1
    ],
    [
     "Move it into /tmp",
     0
    ],
    [
     "Rename the file",
     0
    ],
    [
     "Run it with cat",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 4,
   "q": "The disk is full. Which helps find the largest directories fastest?",
   "o": [
    [
     "du -sh * | sort -h",
     1
    ],
    [
     "ls -R /",
     0
    ],
    [
     "df -h /",
     0
    ],
    [
     "cat /var/log/*",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 5,
   "q": "To keep a process running after you log out of SSH, use:",
   "o": [
    [
     "nohup or a tmux/screen session",
     1
    ],
    [
     "Ctrl+C then reconnect",
     0
    ],
    [
     "Run it with ls",
     0
    ],
    [
     "Close the terminal window",
     0
    ]
   ]
  },
  {
   "s": "linux",
   "l": 5,
   "q": "Before a script runs rm -rf \"$DIR\", the safest guard is to:",
   "o": [
    [
     "Check that $DIR is set and non-empty",
     1
    ],
    [
     "Add a comment above the line",
     0
    ],
    [
     "Run the script as root",
     0
    ],
    [
     "Use rm without -r",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 1,
   "q": "Several EC2 instances need to read and write the same files at the same time, sharing one common filesystem. Which service fits?",
   "o": [
    [
     "EFS, a shared network filesystem",
     1
    ],
    [
     "EBS, a single-attach volume",
     0
    ],
    [
     "S3, an object store",
     0
    ],
    [
     "Instance store, which is temporary",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 1,
   "q": "An application running on an EC2 instance needs permission to read objects from an S3 bucket. The recommended, most secure way to grant that access is to:",
   "o": [
    [
     "Attach an IAM role",
     1
    ],
    [
     "Hard-code an access key",
     0
    ],
    [
     "Make the bucket public",
     0
    ],
    [
     "Store keys in user-data",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 2,
   "q": "An app in a private subnet must make outbound calls to a partner API on the internet, but must not be reachable from the internet itself. The correct setup uses:",
   "o": [
    [
     "A NAT gateway for outbound traffic",
     1
    ],
    [
     "An internet gateway on the subnet",
     0
    ],
    [
     "A public IP on the instance",
     0
    ],
    [
     "A VPC peering connection",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 2,
   "q": "On a subnet with a custom Network ACL, instances can open outbound connections, but the inbound replies to those connections are being dropped. This is because:",
   "o": [
    [
     "NACLs are stateless; allow return ports",
     1
    ],
    [
     "The security group is wrong",
     0
    ],
    [
     "The route table is missing",
     0
    ],
    [
     "The instance needs an EIP",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 3,
   "q": "Heavy reporting queries are overloading the primary RDS database that also serves live traffic. The most appropriate fix is to:",
   "o": [
    [
     "Use a read replica",
     1
    ],
    [
     "Enable Multi-AZ failover",
     0
    ],
    [
     "Increase backup retention",
     0
    ],
    [
     "Attach a bigger disk",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 3,
   "q": "A static support portal served from an S3 bucket in a single region loads slowly for users on the other side of the world. The best fix is to add:",
   "o": [
    [
     "CloudFront to cache near users",
     1
    ],
    [
     "A bigger S3 bucket",
     0
    ],
    [
     "Transfer Acceleration",
     0
    ],
    [
     "Copies in every region",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 4,
   "q": "A service intermittently gets throttling errors from DynamoDB even though its average request load is well within provisioned capacity. The most likely cause is:",
   "o": [
    [
     "A hot partition from skewed keys",
     1
    ],
    [
     "The wrong table region",
     0
    ],
    [
     "A global 1000-RPS cap",
     0
    ],
    [
     "Needing to move to RDS",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 4,
   "q": "A latency-sensitive Lambda behind API Gateway occasionally spikes to multi-second responses at low traffic and just after each deploy. The cause and fix is:",
   "o": [
    [
     "Cold starts; use provisioned concurrency",
     1
    ],
    [
     "The timeout is too low",
     0
    ],
    [
     "API Gateway throttles it",
     0
    ],
    [
     "It needs a bigger disk",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 5,
   "q": "A monitoring tool's cross-account sts:AssumeRole call started failing after a security review. Besides the caller's own permission to assume the role, you must also check:",
   "o": [
    [
     "The target role's trust policy",
     1
    ],
    [
     "The S3 bucket policy",
     0
    ],
    [
     "The KMS key rotation",
     0
    ],
    [
     "The VPC route table",
     0
    ]
   ]
  },
  {
   "s": "aws",
   "l": 5,
   "q": "Instances in a private subnet download large volumes from S3 through a NAT gateway, and the NAT data-processing charges have become very expensive. The fix that also improves security is to:",
   "o": [
    [
     "Add an S3 gateway VPC endpoint",
     1
    ],
    [
     "Add more NAT gateways",
     0
    ],
    [
     "Move them to public subnets",
     0
    ],
    [
     "Enable Transfer Acceleration",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 1,
   "q": "In Python, which parses a JSON string into an object?",
   "o": [
    [
     "json.loads(s)",
     1
    ],
    [
     "json.dumps(s)",
     0
    ],
    [
     "json.read(s)",
     0
    ],
    [
     "str(s)",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 1,
   "q": "In JavaScript, \"5\" + 3 evaluates to:",
   "o": [
    [
     "\"53\"",
     1
    ],
    [
     "8",
     0
    ],
    [
     "NaN",
     0
    ],
    [
     "a TypeError",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 2,
   "q": "In Python, print(0.1 + 0.2 == 0.3) outputs:",
   "o": [
    [
     "False",
     1
    ],
    [
     "True",
     0
    ],
    [
     "0.3",
     0
    ],
    [
     "an error",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 2,
   "q": "In JS, let y=x (x is an array); y.push(4). Now x is:",
   "o": [
    [
     "[1, 2, 3, 4]",
     1
    ],
    [
     "[1, 2, 3]",
     0
    ],
    [
     "[4]",
     0
    ],
    [
     "undefined",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 3,
   "q": "def f(v, acc=[]): acc.append(v); return acc. f(1) gives [1]. Later f(2) gives:",
   "o": [
    [
     "[1, 2]",
     1
    ],
    [
     "[2]",
     0
    ],
    [
     "[1]",
     0
    ],
    [
     "an error",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 3,
   "q": "A Node loop calls an async api.update without await. The problem is:",
   "o": [
    [
     "All fire at once, unawaited",
     1
    ],
    [
     "The loop won't run",
     0
    ],
    [
     "Node can't loop arrays",
     0
    ],
    [
     "i is undefined",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 4,
   "q": "for (var i=0;i&lt;3;i++) setTimeout(()=&gt;log(i)) prints:",
   "o": [
    [
     "3, 3, 3",
     1
    ],
    [
     "0, 1, 2",
     0
    ],
    [
     "0, 0, 0",
     0
    ],
    [
     "undefined ×3",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 4,
   "q": "A refund script crashes halfway through 100k rows. To re-run safely it needs:",
   "o": [
    [
     "Idempotency via processed-ID tracking",
     1
    ],
    [
     "A faster network connection",
     0
    ],
    [
     "More available memory",
     0
    ],
    [
     "A single try/catch block",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 5,
   "q": "g() yields 0,1,2. x=g(); next(x); list(x) gives:",
   "o": [
    [
     "0 then [1, 2]",
     1
    ],
    [
     "0 then [0,1,2]",
     0
    ],
    [
     "0 then [1,2,3]",
     0
    ],
    [
     "an error",
     0
    ]
   ]
  },
  {
   "s": "py",
   "l": 5,
   "q": "A 5M-row migration must resume cleanly after a crash. Best design:",
   "o": [
    [
     "Idempotent batches with checkpoints",
     1
    ],
    [
     "Load it all into memory",
     0
    ],
    [
     "One giant transaction",
     0
    ],
    [
     "Just run it twice",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 1,
   "q": "An API request arrives without valid credentials, so the server cannot identify who is calling. Which HTTP status code should it return?",
   "o": [
    [
     "401 Unauthorized",
     1
    ],
    [
     "403 Forbidden",
     0
    ],
    [
     "400 Bad Request",
     0
    ],
    [
     "404 Not Found",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 1,
   "q": "You need an HTTP method that fully replaces a resource and can be safely retried because repeating it has the same effect. Which method is it?",
   "o": [
    [
     "PUT",
     1
    ],
    [
     "POST",
     0
    ],
    [
     "PATCH",
     0
    ],
    [
     "GET",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 2,
   "q": "A caller sends a valid authentication token, but their account is not allowed to use this particular endpoint. The correct HTTP status to return is:",
   "o": [
    [
     "403 Forbidden",
     1
    ],
    [
     "401 Unauthorized",
     0
    ],
    [
     "405 Method Not Allowed",
     0
    ],
    [
     "422 Unprocessable",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 2,
   "q": "A POST that creates a payment times out with no response, so you cannot tell whether it succeeded on the server. You should:",
   "o": [
    [
     "Retry only with an idempotency key",
     1
    ],
    [
     "Retry at once; it failed",
     0
    ],
    [
     "Assume POST is idempotent",
     0
    ],
    [
     "Never retry any POST",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 3,
   "q": "Under heavy load, calls to a partner integration start returning 502 and 504 errors from the gateway. This usually means:",
   "o": [
    [
     "The upstream backend was slow/down",
     1
    ],
    [
     "The client sent bad JSON",
     0
    ],
    [
     "Authentication expired",
     0
    ],
    [
     "The rate limit was hit",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 3,
   "q": "Your webhook endpoint must acknowledge the sender quickly, but the work each event triggers is slow and heavy. The best pattern is to:",
   "o": [
    [
     "Return 2xx fast, process async",
     1
    ],
    [
     "Finish all work before replying",
     0
    ],
    [
     "Return 202 and drop it",
     0
    ],
    [
     "Reply 500 to duplicates",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 4,
   "q": "A batch job calling a rate-limited API keeps getting 429 (Too Many Requests) responses even with a fixed delay between calls. A better approach is to:",
   "o": [
    [
     "Honor Retry-After with backoff",
     1
    ],
    [
     "Send requests faster",
     0
    ],
    [
     "Run many parallel workers",
     0
    ],
    [
     "Ignore the 429s",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 4,
   "q": "Your system consumes webhooks delivered at least once, so duplicate and out-of-order events are possible. To stay correct, the processing must be:",
   "o": [
    [
     "Idempotent, order-aware processing",
     1
    ],
    [
     "Switching to at-most-once",
     0
    ],
    [
     "More sender retries",
     0
    ],
    [
     "A longer timeout",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 5,
   "q": "A payment provider confirms each event twice — once in the synchronous API response and again via an async webhook — and your ledger is double-counting them. The fix is to:",
   "o": [
    [
     "Dedupe by event ID",
     1
    ],
    [
     "Disable the webhook path",
     0
    ],
    [
     "Disable the sync path",
     0
    ],
    [
     "Delete duplicates nightly",
     0
    ]
   ]
  },
  {
   "s": "api",
   "l": 5,
   "q": "A downstream provider silently changed a field's data type without versioning, and your parser began mis-reading values. Beyond fixing the parser, the systemic safeguard is to:",
   "o": [
    [
     "Validate responses against a schema",
     1
    ],
    [
     "Wrap the parser in try/catch",
     0
    ],
    [
     "Trust it won't change again",
     0
    ],
    [
     "Round all values to be safe",
     0
    ]
   ]
  }
 ]
};
