/* =============================================================
   Claude Study Hub — mock exam item bank
   60 scenario-based questions, weighted to the published blueprint.
   Original items written to the exam blueprint and documented product
   behaviour. Not recalled or leaked exam content.

   DIFFICULTY: this bank was rewritten from scratch at a substantially
   higher difficulty than the original. Items require multi-hop reasoning,
   distractors are near-misses that are partly correct, and a third of the
   items are select-two.

   NOTE: this file is data. Option letters are balanced so no single letter
   dominates the answer key; do not re-sort options by hand.

   Option LENGTH is balanced too: within every question the four options
   are written to a similar length, and the correct option is deliberately
   never the longest and never the shortest. Length must not leak the key —
   if you edit an option, re-check the whole set before committing.
   ============================================================= */

var DOMAINS = {
  "AAO": {
    "name": "Agentic Architecture & Orchestration",
    "weight": 27
  },
  "CCW": {
    "name": "Claude Code Configuration & Workflows",
    "weight": 20
  },
  "PESO": {
    "name": "Prompt Engineering & Structured Output",
    "weight": 20
  },
  "TDM": {
    "name": "Tool Design & MCP Integration",
    "weight": 18
  },
  "CMR": {
    "name": "Context Management & Reliability",
    "weight": 15
  }
};

var SCENARIOS = {
  S1: {
    title: "Meridian Retail Bank — customer support agent",
    text: "Meridian runs a Claude-powered support agent across chat and email for 3.4 million retail customers. It handles balance enquiries, disputed transactions, card blocks and refunds. The agent has tools for identity verification, account lookup, transaction history, card control and refunds, and an <code>escalate_to_human</code> tool. Agents may auto-approve refunds up to $50; anything above requires a tier-2 approver. Regulators require that every customer contact reaches a documented outcome. The orchestration layer is a Node service wrapping the Messages API."
  },
  S2: {
    title: "Northwind Commerce — multi-agent order operations",
    text: "Northwind is a marketplace with 40,000 sellers. A coordinator agent decomposes customer requests (\"where is my order\", \"this arrived damaged\", \"cancel and reorder in blue\") and dispatches specialised subagents: an <em>order</em> agent, a <em>logistics</em> agent, a <em>returns</em> agent and a <em>seller-policy</em> agent. Each subagent has its own tool set and returns a summary to the coordinator, which composes the customer-facing reply. Peak load is 12,000 concurrent sessions."
  },
  S3: {
    title: "Helix Cloud — incident support agent",
    text: "Helix runs an incident-response agent that joins every PagerDuty incident. It queries metrics, reads recent deploys, greps logs, checks dependency health and drafts a status update. It can roll back a deploy only for services tagged <code>auto_rollback: true</code>; everything else requires a human. SLAs are 15 minutes to first meaningful update for SEV-1. Incidents frequently run for hours, so sessions are long."
  },
  S4: {
    title: "Vantage IT Services — managed service desk",
    text: "Vantage operates an IT service desk for 90 corporate clients. Its agent resolves password resets, access requests, VPN faults and software installs across each client tenant. Tools include a knowledge-base search, a directory lookup, an account-status check, an unlock/reset pair, an asset lookup and a ticketing integration exposed over MCP. Tool catalogues differ per client tenant, and several tools have overlapping names and purposes."
  },
  S5: {
    title: "Atlas Insurance — document extraction pipeline",
    text: "Atlas extracts structured data from claim forms, invoices, medical reports and policy schedules arriving as email attachments and scans from 600 broker partners. Layouts vary widely. Output feeds a claims-adjudication system that pays money, so extraction errors are expensive. A human review queue exists but is the bottleneck; the goal is to shrink it without increasing error rates."
  },
  S6: {
    title: "Corvus Engineering — Claude Code rollout",
    text: "Corvus is rolling out Claude Code to 400 engineers across a monorepo containing payments, identity and a public API. Security requires that certain files are never read and certain commands never run. Platform engineering wants formatting, linting and tests enforced consistently. There is a GitHub Actions pipeline that should run an automated review on every pull request. Different teams have different conventions."
  }
};

var QUESTIONS = [
{
  n: 1, domain: "AAO", topic: "Topic 1", sc: "S1", type: "multi",
  stem: "Meridian's orchestrator wraps each session in <code>try/catch/finally</code>; the <code>finally</code> block writes a terminal status. It handles <code>tool_use</code>, <code>end_turn</code> and <code>max_tokens</code>, and has a 10-turn budget. Over one week, 2.8% of sessions ended with no recorded outcome. The breakdown: 41% of those hit turn 10, 33% received a stop reason the switch did not recognise, 26% vanished with no orchestrator log entry at all during a rolling deploy. Which TWO changes together close every one of these paths?",
  opts: {
    A: "Add a <code>default</code> branch that escalates on any unrecognised stop reason, and an explicit escalation when the loop exits on its turn budget.",
    B: "Persist session state durably and run an out-of-band sweeper that escalates any session left non-terminal past its SLA.",
    C: "Raise the turn budget from 10 to 40 and add a metric that alerts whenever any session comes within three turns of the ceiling it has been given.",
    D: "Move the terminal-status write from <code>finally</code> into a <code>process.on('SIGTERM')</code> handler so that it also runs on shutdown."
  },
  correct: ["A","B"],
  rule: "Two of the three paths are in-process and logical: unknown stop reasons and budget exhaustion both need explicit branches. The third is infrastructural — a killed pod runs no in-process code at all, including signal handlers that never get scheduled — and only durable state plus an external reaper covers it.",
  why: {
    A: "Correct. It converts 74% of the failures from silent exits into recorded decisions, which is what the two logical paths require.",
    B: "Correct. The 26% with no log entry never executed orchestrator code again; only state that outlives the process and a sweeper that reads it can close them.",
    C: "Wrong. It moves the cliff and quadruples cost for sessions already failing, and an alert about approaching the ceiling is not an outcome for the session that crosses it.",
    D: "Wrong, and it is the seductive near-miss. A <code>SIGTERM</code> handler improves graceful shutdown but does not run on <code>SIGKILL</code>, node eviction or hardware loss."
  }
},
{
  n: 2, domain: "AAO", topic: "Topic 1", sc: "S1", type: "single",
  stem: "A Meridian session ends with the assistant text &quot;I have processed your refund of $32; you will see it in 3-5 days.&quot; The API returned <code>end_turn</code>. The orchestrator's completion check is: <code>stop_reason === 'end_turn' &amp;&amp; toolCalls.some(t =&gt; t.name === 'issue_refund')</code>. It marked the session RESOLVED. No refund exists in the payments system. The trace shows <code>issue_refund</code> was called once and returned <code>{&quot;ok&quot;: false, &quot;code&quot;: &quot;LIMIT_EXCEEDED&quot;}</code> with HTTP 200. What is the architectural defect?",
  opts: {
    A: "The completion check tests that the tool was invoked rather than that it succeeded, so a well-formed failure response satisfies it exactly as a success would.",
    B: "The refund tool returned HTTP 200 for a business failure, and the orchestrator should treat any non-2xx status as the signal that a terminal action did not occur.",
    C: "The session should have set <code>tool_choice</code> to force <code>issue_refund</code>, which would have guaranteed the refund was actually applied before the turn ended.",
    D: "The agent fabricated the confirmation, so the system prompt needs a rule forbidding it from stating that an action succeeded without seeing a success response."
  },
  correct: ["A"],
  rule: "Resolution is a property of the world, not of the transcript and not of the call log. A completion gate must read the outcome of the terminal action from the system of record — or at minimum from the tool's own success field — not merely observe that the call happened.",
  why: {
    A: "Correct. The predicate is satisfied by any invocation, successful or not, which is why a clean business-level failure was recorded as a resolution.",
    B: "Wrong, and it is the plausible near-miss. Business failures returned as HTTP 200 with an error body are entirely normal; making the gate depend on transport status just relocates the same mistake.",
    C: "Wrong. Forcing the tool guarantees the call is made, never that it succeeds. It would have produced the identical failure with the identical outcome.",
    D: "Wrong. A prompt rule cannot make the orchestrator's gate correct, and the gate is what wrote RESOLVED to the ticketing system."
  }
},
{
  n: 3, domain: "AAO", topic: "Topic 1", sc: "S3", type: "single",
  stem: "Helix's incident agent must post a first meaningful update within 15 minutes for a SEV-1. On one incident it produced nothing for 22 minutes. The trace shows the loop made 14 tool calls, each returning normally, with no error and no stop-reason anomaly. The turn budget is 40 and was not reached. The engineer proposes lowering the turn budget to 12 so the agent cannot spend this long. Evaluate.",
  opts: {
    A: "Correct: a lower turn budget is the direct mechanism for bounding how long a single incident session is able to run before it must report.",
    B: "Incorrect: the agent should run its diagnostics in parallel within one turn, which brings 14 sequential calls inside the fifteen-minute window.",
    C: "Correct, provided the lowered budget is paired with an instruction telling the agent to prioritise producing an update over completing its investigation.",
    D: "Incorrect: the budget is the wrong unit. The requirement is wall-clock, so a deadline checked inside the loop must escalate with whatever findings exist."
  },
  correct: ["D"],
  rule: "Match the bound to the requirement. A turn budget bounds iterations, not time: one turn can take four minutes and twelve can take an hour. An SLA expressed in minutes needs a wall-clock deadline evaluated inside the loop, whose expiry escalates with partial findings rather than merely stopping.",
  why: {
    A: "Wrong. Twelve turns has no fixed duration. It can still exceed fifteen minutes, and it can also cut off an investigation that had eight minutes left.",
    B: "Wrong, and it is the tempting near-miss. Parallel calls are a genuine improvement, but they reduce the expected duration without bounding it, so the SLA is still unguarded.",
    C: "Wrong. It compounds the wrong unit with an advisory instruction, and the agent has no reliable sense of elapsed wall-clock time to act on.",
    D: "Correct. It is the right unit and, crucially, the deadline must escalate with the partial findings rather than simply ending the loop."
  }
},
{
  n: 4, domain: "AAO", topic: "Topic 4", sc: "S1", type: "single",
  stem: "A Meridian customer writes: &quot;This is the third time I've asked. I want to speak to a human, now.&quot; The agent has already verified identity, retrieved the transaction, confirmed it is a duplicate charge of $38, and computed that a refund is within its authority. One more tool call would resolve the case entirely. What should the orchestrator do?",
  opts: {
    A: "Escalate immediately, attaching the verified facts and the prepared refund so the human can complete it in seconds.",
    B: "Complete the refund first, since it is one call and resolves the complaint, then confirm the outcome and close the contact.",
    C: "Ask the customer whether they would prefer the agent to finish, given that the resolution is a single step away from being complete.",
    D: "Escalate only if the customer repeats the request again after being told the issue can be resolved right now."
  },
  correct: ["A"],
  rule: "An explicit request for a human is an authority boundary, not an efficiency question. It is honoured immediately. The value the agent adds is the handoff package — verified facts, work already done, the prepared action — so the human resolves in seconds rather than restarting.",
  why: {
    A: "Correct. Immediate escalation honours the boundary, and the attached context is what makes the escalation fast rather than a restart from zero.",
    B: "Wrong. It substitutes the agent's judgement about efficiency for the customer's explicit request, and it is the third time they have asked.",
    C: "Wrong, and the most tempting distractor. Asking is a softer version of overriding: the customer has already answered this question three times.",
    D: "Wrong. It sets a fourth repetition as the threshold, which is the same override with a counter attached."
  }
},
{
  n: 5, domain: "AAO", topic: "Topic 2", sc: "S3", type: "multi",
  stem: "Helix escalates a SEV-1 to a human SRE after 12 minutes. The handoff currently contains the incident ID and a natural-language summary of what the agent found. SREs report that they re-run the same diagnostics because they cannot tell which of the agent's statements were measured and which were inferred, and that they twice repeated a rollback the agent had already attempted and which had failed. Which TWO additions fix this?",
  opts: {
    A: "The full conversation transcript including the agent's reasoning, so the SRE can reconstruct the whole investigation from the beginning.",
    B: "Each asserted fact paired with the tool that produced it and the timestamp, so measured observations are distinguishable from inference.",
    C: "The agent's confidence score for each of its conclusions, so the SRE knows which of the findings to verify first when they pick up the incident.",
    D: "The sequence of actions already attempted with their outcomes, including failures, and the authorization state the agent was operating under."
  },
  correct: ["B","D"],
  rule: "A handoff package preserves accumulated context, findings with provenance, and authorization state. Provenance is what separates measurement from inference; the action log with outcomes is what prevents repetition; authorization state tells the human what the agent could and could not have done.",
  why: {
    A: "Wrong, and it is the plausible near-miss. A full transcript technically contains everything, but it makes the SRE do the extraction under incident pressure, which is exactly the cost escalation is meant to remove.",
    B: "Correct. It addresses the first complaint precisely: an SRE can trust a metric query result and treat an inference as a hypothesis.",
    C: "Wrong. Self-reported confidence is uncalibrated and unauditable, and it does not tell the SRE what was actually attempted.",
    D: "Correct. A failed rollback is the highest-value item in the package, and it is the one a summary is most likely to omit."
  }
},
{
  n: 6, domain: "AAO", topic: "Topic 1", sc: "S2", type: "single",
  stem: "Northwind's coordinator dispatches four subagents in parallel. Three return successfully in under two seconds. The seller-policy subagent's underlying service times out; the subagent returns an empty result rather than an error. The coordinator composes a reply from the three successful results. A customer is told a return is approved when the seller's policy in fact forbids it. Which change most directly prevents this class of outcome?",
  opts: {
    A: "The coordinator should retry the seller-policy subagent up to three times before it composes any customer-facing reply at all from the results it holds.",
    B: "The coordinator's system prompt should note that an empty subagent result may indicate failure rather than an absence of applicable policy.",
    C: "The seller-policy check should run before the other three subagents, so a failure is discovered before any other work has been performed.",
    D: "The subagent must return a structured error with a failure category and retryability, and the coordinator must treat a missing result as blocking."
  },
  correct: ["D"],
  rule: "An empty result is indistinguishable from a legitimate absence, which is why silent failures become confident wrong answers. Two things are needed: the failure must be expressible as data, and the merge step must treat an absent required input as blocking rather than optional.",
  why: {
    A: "Wrong on its own. Retrying is reasonable but the third failure still yields an empty result the coordinator will happily merge.",
    B: "Wrong. A prompt note asks the model to be suspicious of a value; the merge logic is code and should not be delegating this to inference.",
    C: "Wrong, and superficially attractive. Reordering surfaces the failure earlier but the coordinator still has no error to act on and no rule about missing inputs.",
    D: "Correct. It makes the failure visible as data and makes the coordinator's merge refuse to proceed without a required input."
  }
},
{
  n: 7, domain: "AAO", topic: "Topic 3", sc: "S3", type: "single",
  stem: "Helix's PostToolUse quality gate blocks the agent when a type check fails. The hook exits 2 and writes <code>Type check failed. Fix the errors before continuing.</code> to stderr. Engineers observe the agent then edits the same file three or four times, each time producing a different plausible change, before either succeeding by luck or exhausting its turns. What single change most improves this loop?",
  opts: {
    A: "Change the hook to exit 1 rather than 2, so that the agent is informed of the failure but is never blocked and can proceed to fix it in its own order.",
    B: "Move the type check from <code>PostToolUse</code> to a <code>Stop</code> hook so it runs once per turn rather than after every single edit.",
    C: "Write the compiler's actual diagnostics — file, line, error code and message — to stderr rather than the generic instruction the hook currently emits.",
    D: "Add an instruction to <code>CLAUDE.md</code> telling the agent to run the type checker itself and read its output before attempting any fix."
  },
  correct: ["C"],
  rule: "Blocking feedback is only as useful as the information it carries. Exit code 2 sends stderr back to the model as the reason it was blocked; a generic sentence tells it something is wrong without telling it what, so it is reduced to guessing. The diagnostics turn a guess into a targeted fix.",
  why: {
    A: "Wrong. Exit 1 does not block, so broken code proceeds. It also removes the feedback channel that makes the gate teachable.",
    B: "Wrong, and a genuine trade-off elsewhere. Batching to <code>Stop</code> reduces hook invocations but makes attribution harder, and the message is still uninformative.",
    C: "Correct. The mechanism already routes stderr to the model, so putting the real errors there converts blind retries into a directed correction.",
    D: "Wrong. It duplicates the check the hook already performs and relies on the model choosing to comply."
  }
},
{
  n: 8, domain: "AAO", topic: "Topic 1", sc: "S2", type: "single",
  stem: "Northwind's coordinator receives &quot;my order arrived damaged, cancel it and reorder in blue, and tell the seller.&quot; It dispatches the returns agent and the order agent. Both succeed. The seller is never told. The postmortem proposes letting the returns agent message the seller directly, since it already holds the return context. What is the correct assessment?",
  opts: {
    A: "Correct: the returns agent has the context needed, so allowing it to notify the seller removes an unnecessary hop through the coordinator entirely.",
    B: "Incorrect: the defect is in the coordinator's decomposition, which produced two subtasks for a request that contained three distinct outcomes.",
    C: "Incorrect: the seller-policy agent should own seller communication, and the coordinator should have dispatched it as a third parallel subtask.",
    D: "Correct, provided the returns agent reports back to the coordinator afterwards so that the coordinator's record of the session stays complete."
  },
  correct: ["B"],
  rule: "The failure is upstream of any agent's capabilities: intent parsing produced two subtasks from a three-intent request, so no agent was ever asked to notify the seller. The fix is decomposition plus a validation that the subtask set covers every requested outcome before dispatch.",
  why: {
    A: "Wrong. It grants a new capability to paper over a planning defect, and peer-to-peer messaging removes the single owner of the merged outcome.",
    B: "Correct. Three intents, two subtasks: nothing was dispatched to do the missing work, and no amount of agent capability changes that.",
    C: "Wrong, and the closest near-miss. Which agent should own the notification is a real design question, but it is moot while the coordinator never creates the subtask.",
    D: "Wrong. Reporting back preserves the record but still fixes the symptom by expanding an agent's remit rather than repairing decomposition."
  }
},
{
  n: 9, domain: "AAO", topic: "Topic 1", sc: "S2", type: "single",
  stem: "A Northwind subagent is dispatched to reroute a delivery. Its delegation prompt says: &quot;Reroute order SO-88213 to the customer's new address.&quot; The subagent called <code>get_order</code>, read the address on file, and rerouted to it — the old address. The team's proposed fix is to give subagents read access to the coordinator's conversation history. What is the correct assessment?",
  opts: {
    A: "Correct: the address was stated in the conversation, so history access is the most direct route to the information the subagent was missing.",
    B: "Incorrect: the subagent should have asked the coordinator for the address once it noticed the delegation prompt did not contain one.",
    C: "Correct, provided the history passed to the subagent is first compacted so that it does not consume the subagent's context window.",
    D: "Incorrect: the delegation prompt must carry the address as a value, because history access re-imports the noise isolation exists to remove."
  },
  correct: ["D"],
  rule: "A delegation prompt is a closure over the values the task needs. History access solves the immediate symptom while destroying the property that makes subagents worth having, and it puts the coordinator's entire conversation into every subagent turn's token cost.",
  why: {
    A: "Wrong. It is the intuitive fix and the reason this item exists: it works once and degrades the architecture permanently.",
    B: "Wrong, and a close second. Round-tripping doubles latency and requires the subagent to notice an absence rather than a wrong value — here it saw a plausible address and used it.",
    C: "Wrong. Compaction makes the leak cheaper without making it right, and it is exactly the address detail that a summary would drop.",
    D: "Correct. Pack the value, not a pointer to where the value was mentioned."
  }
},
{
  n: 10, domain: "AAO", topic: "Topic 1", sc: "S1", type: "single",
  stem: "Meridian's loop is: <code>while (turns++ &lt; MAX) { r = call(); if (r.stop_reason === 'tool_use') {...; continue;} if (r.stop_reason === 'end_turn') return resolve(r); }</code>. A session received <code>refusal</code>. Trace the execution.",
  opts: {
    A: "The loop returns <code>undefined</code> to the caller after exhausting its turn budget, having silently re-sent the same request on every iteration.",
    B: "The loop throws on the second iteration because the refusal response contains no content blocks for the orchestrator to append to the messages array.",
    C: "The loop spins to the turn limit re-sending an unchanged request, then falls out and returns <code>undefined</code> with no outcome recorded.",
    D: "The loop exits immediately and returns <code>undefined</code>, because neither branch matched and no code follows the conditionals."
  },
  correct: ["C"],
  rule: "Neither branch matches a <code>refusal</code>, so no <code>return</code> executes and no <code>continue</code> is needed — control simply reaches the end of the loop body and iterates. The conversation is unchanged, so the same refusal recurs until the budget is spent and the function falls through, returning <code>undefined</code>.",
  why: {
    A: "Wrong on the ordering of claims: it describes the outcome but implies the loop was doing something deliberate. The point is that the re-sends are identical because nothing was appended.",
    B: "Wrong. Nothing throws; the code appends nothing and evaluates two conditions that are both false.",
    C: "Correct. Budget-many identical calls, then a fall-through returning <code>undefined</code>, which is the silent-drop path in its purest form.",
    D: "Wrong, and the most commonly chosen answer. Falling past the two <code>if</code> statements ends the iteration, not the loop — the <code>while</code> condition is then re-evaluated."
  }
},
{
  n: 11, domain: "AAO", topic: "Topic 1", sc: "S3", type: "multi",
  stem: "Helix wants to prove to an auditor that every incident session reached a documented outcome. The current evidence is application logs plus the agent's closing message in each ticket. The auditor rejects it because logs are sampled at 10% under load and the closing message is model-generated prose. Which TWO changes produce auditable evidence?",
  opts: {
    A: "Raise log sampling to 100% for incident sessions so that every one of those sessions has its full trace retained for the auditor to inspect afterwards.",
    B: "A persisted session record per incident carrying a status field, a machine-readable termination reason code, and the tool-call sequence with outcomes.",
    C: "A reconciliation job that asserts every incident opened has a session record in a terminal state, and alerts on any that do not.",
    D: "A requirement that the agent's closing message state the outcome in a fixed sentence template that the auditor can parse."
  },
  correct: ["B","C"],
  rule: "Auditability needs a record designed as evidence, not logs designed for debugging: a durable per-session row with a status and a machine-readable reason. It also needs a completeness check, because a record that is simply never written is invisible to any query over the records that exist.",
  why: {
    A: "Wrong, and the obvious-looking fix. Full logs are still debug output: unstructured, retention-bounded, and absent for sessions whose process died before writing.",
    B: "Correct. Status plus reason code plus action outcomes is queryable evidence rather than sampled diagnostics or generated prose.",
    C: "Correct. It closes the gap the first change cannot see — the session that produced no record at all.",
    D: "Wrong. A templated sentence is still model-generated text, and it is produced only by sessions that reached the point of speaking."
  }
},
{
  n: 12, domain: "AAO", topic: "Topic 1", sc: "S2", type: "single",
  stem: "Northwind's coordinator merges four subagent results. Three succeeded; the seller-policy agent exhausted a bounded retry budget and returned a structured <code>UPSTREAM_TIMEOUT</code> error marked retryable. The customer is waiting in chat. Policy says a return cannot be approved without a policy check. What should the coordinator do?",
  opts: {
    A: "Hold the response and continue retrying the seller-policy agent until it succeeds, since the reply is incomplete without the policy result.",
    B: "Substitute the coordinator's own best interpretation of the applicable seller policy so the customer receives a complete answer immediately.",
    C: "Discard all four results and restart the entire request from scratch, since a partial result set cannot produce a correct customer reply.",
    D: "Respond with the three completed results and state explicitly that the policy check could not be performed, then follow up when it succeeds."
  },
  correct: ["D"],
  rule: "A bounded retry that fails is a determinate outcome, not a reason to hang. The correct behaviour is to deliver what is genuinely known, name the gap explicitly rather than papering over it, and leave the blocked decision blocked — the customer is not told the return is approved.",
  why: {
    A: "Wrong, and superficially principled. Unbounded retrying converts a degraded response into no response, with a customer waiting.",
    B: "Wrong. The coordinator inventing a policy determination is exactly the failure the policy check exists to prevent.",
    C: "Wrong. It discards three valid results and repeats work whose inputs have not changed, while the upstream service is still down.",
    D: "Correct. It respects the policy gate, gives the customer real information, and makes the gap visible rather than implicit."
  }
},
{
  n: 13, domain: "AAO", topic: "Topic 1", sc: "S1", type: "single",
  stem: "Meridian's agent asks a customer for a document and the customer goes quiet. The session sits in no state at all: it is not RESOLVED, not ESCALATED, and the turn loop has ended normally with <code>end_turn</code>. Roughly 6% of contacts end this way. Compliance requires every contact to reach a documented outcome. What is the correct design?",
  opts: {
    A: "Count these as ESCALATED, on the grounds that a human will eventually need to look at any contact that stalls waiting on a customer.",
    B: "Count these as RESOLVED, since the agent completed its part of the exchange and the outstanding action belongs to the customer.",
    C: "Introduce an explicit AWAITING_CUSTOMER state with its own timer, which ages into RESOLVED under an auto-close policy or into ESCALATED.",
    D: "Prevent the agent from asking for documents that it cannot obtain itself, which removes the situation that produces these stalled contacts entirely."
  },
  correct: ["C"],
  rule: "Waiting on a third party is a legitimate state and needs to be modelled as one, with a timer and a documented transition. Forcing it into an existing terminal state either inflates the escalation queue or records an outcome that did not happen.",
  why: {
    A: "Wrong. It floods the human queue with contacts that mostly resolve themselves, and it records escalation where none was needed.",
    B: "Wrong. It records a resolution that has not occurred, which is the same class of defect as trusting <code>end_turn</code>.",
    C: "Correct. The state is explicit, the transition is documented, and the auto-close policy is auditable — which is what compliance actually requires.",
    D: "Wrong, and the interesting distractor. Reducing document requests is a product decision that does not address the state machine, and the stall recurs for any third-party wait."
  }
},
{
  n: 14, domain: "AAO", topic: "Topic 1", sc: "S3", type: "single",
  stem: "Helix's agent has been stuck for nine turns: it queries the same three metrics, gets the same values, and reasons about them again. Nothing errors. An engineer proposes asking the model each turn whether it is making progress and escalating when it says no. What is the correct assessment?",
  opts: {
    A: "Correct: the model has the fullest view of its own investigation, so its judgement about progress is the best available signal to act on.",
    B: "Incorrect: detect the loop deterministically by comparing tool-call signatures and observed state across turns, then escalate with the diagnostics gathered.",
    C: "Incorrect: raise the turn budget so that the agent has more room to find a new angle before any loop-detection mechanism is applied to this session at all.",
    D: "Correct, provided the self-assessment is only trusted after the agent has already used at least half of the session's available turn budget."
  },
  correct: ["B"],
  rule: "Self-assessment is uncalibrated and is being asked for precisely by the reasoning process that is stuck. Repetition is directly observable: identical tool calls with identical arguments producing identical results across turns is a deterministic signal that requires no introspection.",
  why: {
    A: "Wrong. An agent looping is an agent that believes each turn is productive; asking it is asking the failing component to diagnose itself.",
    B: "Correct. It is observable, testable and loggable, and escalating with the accumulated diagnostics preserves the work already done.",
    C: "Wrong. More turns means more identical queries, at cost, with the same ending.",
    D: "Wrong, and the subtle version of A. Delaying an unreliable signal makes it later, not more reliable."
  }
},
{
  n: 15, domain: "AAO", topic: "Topic 1", sc: "S1", type: "single",
  stem: "Meridian's refund tool enforces the $50 limit in its backend and returns <code>PERMISSION_DENIED</code> above it. A postmortem finds an agent issued four refunds of $49.99 to the same customer within one session, totalling $199.96, to settle a single $200 dispute. Every individual call was within authority and the backend approved each one. What is the defect?",
  opts: {
    A: "The tool description does not state that refunds are limited to one per dispute, which is what allowed the agent to split the amount across four calls.",
    B: "The system prompt should forbid splitting a refund into multiple smaller refunds in order to stay beneath the automatic approval threshold.",
    C: "The agent should have escalated as soon as the disputed amount exceeded fifty dollars, and the orchestrator failed to make that check itself.",
    D: "The authority check is per call rather than per dispute, so the limit constrains transaction size while the policy it encodes is about total exposure."
  },
  correct: ["D"],
  rule: "The control was correctly implemented at the wrong granularity. A per-call limit bounds a single transaction; the policy it was meant to encode bounds total exposure per dispute or per customer. Enforcement must be scoped to the unit the policy is about.",
  why: {
    A: "Wrong. A description is advisory and would be a weaker restatement of a rule the backend should hold.",
    B: "Wrong, and it is what most people reach for. It asks the model not to do something the system permits, which is surface four guarding a surface one hole.",
    C: "Wrong, and a genuine near-miss. An orchestrator-level escalation rule is a reasonable addition, but the backend limit is still wrongly scoped and would still permit the split.",
    D: "Correct. Aggregate the authority check over the dispute, and splitting stops working because the fifth cent over the limit is denied."
  }
},
{
  n: 16, domain: "AAO", topic: "Topic 1", sc: "S2", type: "multi",
  stem: "Northwind runs 12,000 concurrent sessions. An engineer proposes that subagents call one another directly when a dependency is discovered mid-task, arguing it removes coordinator round trips. Latency measurements support the claim: median resolution drops 400ms. Which TWO consequences make this the wrong trade?",
  opts: {
    A: "No component owns the merged outcome, so a customer-facing reply can be composed from a result set nothing has validated as complete.",
    B: "Token cost rises because each direct call re-sends the caller's system prompt and its full tool definition block on every request.",
    C: "Direct calls between subagents would exceed the platform's API rate limit once the system is running at twelve thousand concurrent sessions.",
    D: "Coordination paths grow combinatorially with the number of agents, and a failure inside a peer chain surfaces with no traceable owner."
  },
  correct: ["A","D"],
  rule: "The measured latency win is real, which is what makes the item hard. The costs are structural: hub-and-spoke exists so that one component owns completeness and so that the failure graph stays a tree. Both properties are what the 400ms buys.",
  why: {
    A: "Correct. Completeness validation has an owner in hub-and-spoke and none in a peer mesh, which is the defect behind the unsent seller notification.",
    B: "Wrong, and superficially plausible. Token cost per call is essentially unchanged; the calls happen either way, just with a different caller.",
    C: "Wrong. Rate limits are a capacity question independent of topology; the same work is being done either way.",
    D: "Correct. Traceability and bounded coordination are the architectural reasons for the hub, and both degrade immediately under peer calls."
  }
},
{
  n: 17, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus's <code>CLAUDE.md</code> says never read <code>./infra/secrets/**</code>. Security audits a session and finds the agent read <code>./infra/secrets/prod.env</code> while tracing a config value. An engineer adds a <code>PostToolUse</code> hook on <code>Read</code> that exits 2 and alerts security whenever a secrets path is read. Evaluate.",
  opts: {
    A: "Adequate: the hook is deterministic, blocks the turn, and produces an audit alert the <code>CLAUDE.md</code> line could not.",
    B: "Inadequate: hooks cannot match on file paths, so the rule has to be expressed as a permissions entry rather than as a hook at all.",
    C: "Inadequate: <code>PostToolUse</code> fires after the file contents are already in context, so the secret has leaked before the hook runs.",
    D: "Adequate, provided the hook also truncates the tool result so that the secret's contents do not remain in the conversation history."
  },
  correct: ["C"],
  rule: "For a confidentiality requirement, timing is the whole question. <code>PostToolUse</code> runs after the tool has executed and its result has been produced; the correct surface is a <code>permissions.deny</code> rule, deployed as managed settings, which prevents the read from happening at all.",
  why: {
    A: "Wrong, and it is the answer that sounds most rigorous. Determinism and alerting are both real gains, but the secret is in the context by the time either happens.",
    B: "Wrong. Hooks can match tools and inspect their inputs; the objection is timing, not capability.",
    C: "Correct. Prevention must precede execution; detection after the fact is a different control for a different purpose.",
    D: "Wrong, and the sophisticated-looking near-miss. Removing the content from the transcript afterwards does not un-read it, and the model has already seen it."
  }
},
{
  n: 18, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus deploys a managed policy denying <code>Bash(rm:*)</code>. A team's <code>.claude/settings.json</code> allows <code>Bash(rm:*)</code> for a cleanup script. An engineer's <code>.claude/settings.local.json</code> also allows it. The engineer runs a command matching <code>rm -rf ./tmp-build</code>. What happens, and why?",
  opts: {
    A: "It is allowed: local settings are the most specific layer, and the more specific rule wins over broader ones.",
    B: "It is denied: managed policy sits above every user-editable layer, and within any merged rule set a deny outranks an allow.",
    C: "The user is prompted to choose, because the layers are in direct conflict and Claude Code defers a conflicting decision to the operator.",
    D: "The behaviour depends on the order in which the settings files are loaded, which is why conflicting rules should be avoided in practice."
  },
  correct: ["B"],
  rule: "Two independent rules both point the same way. Managed policy is above all user-editable layers, and deny beats allow within any merged set. Either one alone decides it; together they are why security requirements are deployed as managed settings rather than committed to a repo.",
  why: {
    A: "Wrong, and it is the intuition most people bring from CSS or from configuration systems generally. Specificity is not the precedence rule here.",
    B: "Correct on both counts, and the reason the managed layer exists as a separate thing.",
    C: "Wrong. There is no conflict to resolve: the precedence rules determine the outcome deterministically.",
    D: "Wrong. Load order is an implementation detail; the merge semantics are defined."
  }
},
{
  n: 19, domain: "CCW", topic: "Topic 3", sc: "S6", type: "multi",
  stem: "Corvus wants every edited file formatted and type-checked. A <code>PostToolUse</code> hook on <code>Edit|Write</code> runs Prettier then <code>tsc --noEmit</code> across the whole project and exits 2 on failure. Engineers report 40-second pauses after every edit, and that a single edit mid-refactor is blocked by type errors in files the agent has not reached yet. Which TWO changes fix this without weakening the gate?",
  opts: {
    A: "Scope the per-edit hook to the edited file, so formatting and type feedback stay immediate and attributable to the change just made.",
    B: "Change the hook's exit code from 2 to 1 so that the agent is informed of type errors but is never blocked part-way through a large refactor.",
    C: "Move the full project type check to a <code>Stop</code> hook, so the whole-project invariant is still enforced before the turn is allowed to end.",
    D: "Increase the hook timeout so that the forty-second whole-project check has room to complete without being killed on larger edits."
  },
  correct: ["A","C"],
  rule: "Two different invariants at two different cadences. Per-edit feedback should be narrow, fast and attributable; the whole-project invariant belongs at the turn boundary, where a partially-complete refactor is expected to be coherent. Splitting them preserves both guarantees.",
  why: {
    A: "Correct. It removes the pause and the mid-refactor false blocks, because the errors reported are the ones the edit actually caused.",
    B: "Wrong. It is the tempting fix and it silently converts a gate into a suggestion, which is the failure mode the hook existed to prevent.",
    C: "Correct. The project-wide check still has to pass, just at the point where the agent claims to be finished rather than mid-flight.",
    D: "Wrong. It accepts the forty-second pause as the cost of doing business and does nothing about the mid-refactor blocks."
  }
},
{
  n: 20, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus's root <code>CLAUDE.md</code> is 900 lines: architecture notes, four teams' language conventions, the release runbook, and three security rules. Every engineer pays for all of it on every turn, and the security rules are routinely ignored. Which restructuring is correct?",
  opts: {
    A: "Split the file into four files referenced from the root <code>CLAUDE.md</code> using <code>@path</code> imports so it is easier for teams to maintain.",
    B: "Security rules into permissions and hooks; language conventions into <code>.claude/rules/</code> with <code>paths:</code>; runbook into a Skill; architecture stays.",
    C: "Move everything except the architecture notes into nested <code>CLAUDE.md</code> files placed in the directories each section applies to.",
    D: "Keep the single file but reorder it so that the three security rules appear first, where standing instructions are most reliably attended to by the model."
  },
  correct: ["B"],
  rule: "Two questions decide each section independently. Must it hold regardless of the model — security, so permissions and hooks. When is it relevant — per file type, so path-scoped rules; per task, so a Skill; always, so <code>CLAUDE.md</code>. One file cannot answer four different questions.",
  why: {
    A: "Wrong, and the most common answer. Imports improve maintainability while changing neither the always-on token cost nor the enforcement strength of the security rules.",
    B: "Correct. Each section moves to the surface whose enforcement and load timing match it, which fixes both the cost and the ignored rules.",
    C: "Wrong. Nested files help directory-scoped guidance but leave security advisory, and a release runbook is not a property of a directory.",
    D: "Wrong. Reordering slightly strengthens an advisory instruction and does nothing at all about the 900 always-on lines."
  }
},
{
  n: 21, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus wants a repeatable pre-release check any engineer can run: verify the changelog, confirm migrations are reversible, check the version bump, and produce a go/no-go summary. It should be available on demand, take an optional release tag, and not consume context in sessions that never use it. Which mechanism fits?",
  opts: {
    A: "A section in the root <code>CLAUDE.md</code> describing the checks, so that the procedure is available in every session without any invocation.",
    B: "A slash command in <code>.claude/commands/</code>, which is invoked by name with an argument and costs nothing in sessions that do not call it.",
    C: "A <code>SessionStart</code> hook that injects the release procedure as additional context at the beginning of every engineer's session.",
    D: "A rules file in <code>.claude/rules/</code> with a <code>paths:</code> pattern matching the release directory so it loads when release files are touched."
  },
  correct: ["B"],
  rule: "Operator-triggered, argument-taking, on-demand: that is exactly a slash command. It is invoked explicitly by name, accepts arguments, and is absent from the context of every session that does not use it.",
  why: {
    A: "Wrong. It is always in context — the cost the requirement rules out — and it cannot take a tag.",
    B: "Correct on all three requirements: explicit invocation, an argument, and zero always-on cost.",
    C: "Wrong. Injecting on every session start is the same always-on cost with extra machinery, and still no argument.",
    D: "Wrong, and the closest near-miss. Path scoping triggers on files touched, not on an engineer deciding to run a check, and it cannot take a release tag."
  }
},
{
  n: 22, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus's CI review job is <code>claude &quot;Review the diff&quot; --output-format json &gt; review.json</code>. The job runs to the 30-minute runner timeout and <code>review.json</code> is empty. The API key is set correctly and the same prompt works locally. What is wrong?",
  opts: {
    A: "The output format flag requires the print flag to take effect, so the CLI wrote its structured output to a stream the redirect did not capture.",
    B: "The runner lacks the git permissions needed to read the diff, so the review blocks on a repository operation that cannot complete.",
    C: "The prompt is too vague, so the model explores the repository indefinitely until the runner's thirty-minute timeout eventually kills the job.",
    D: "Without <code>-p</code> the CLI starts an interactive session that never receives input and never exits, so nothing is ever written to the file."
  },
  correct: ["D"],
  rule: "The non-interactive flag is what makes the CLI read a prompt, produce a result and exit. Without it the process attaches to an interactive session that will never receive input in CI, so it hangs until the runner kills it — which is why the output file is empty rather than partial.",
  why: {
    A: "Wrong, and a well-constructed distractor: the output flag is real and does need print mode, but the symptom would be misdirected output, not a thirty-minute hang.",
    B: "Wrong. A permission problem produces an error or a prompt, and the job would not sit silently for the full timeout.",
    C: "Wrong. Exploration produces output and token spend; an empty file after a full timeout points at a process that never started work.",
    D: "Correct. The hang plus the empty file is the signature of a missing print flag."
  }
},
{
  n: 23, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus's CI review reuses one Claude Code session across pull requests to save start-up time. Reviewers report findings that reference files absent from the PR under review. An engineer proposes clearing the conversation between reviews. What is the correct assessment?",
  opts: {
    A: "Correct: clearing the history removes the prior PR's content, and retaining the session avoids paying tool discovery and start-up cost on every single review.",
    B: "Incorrect: the real cause is context compaction dropping the current diff, so automatic compaction should be disabled on review sessions.",
    C: "Correct, provided the review prompt also states explicitly that only files present in the current diff may be referenced in any finding.",
    D: "Incorrect: each review must run in its own fresh session, because isolation is the property required and a clearing step is a procedure, not a boundary."
  },
  correct: ["D"],
  rule: "Every CI run should be a fresh session precisely so that review N+1 cannot inherit review N. Reuse trades away the isolation the job depends on, and a clearing step that must be remembered and correctly implemented is not equivalent to a boundary that holds by construction.",
  why: {
    A: "Wrong. It is a reasonable-sounding optimisation and it is how the bug got shipped; start-up cost is trivial next to a wrong verdict.",
    B: "Wrong. Compaction drops old content; it does not import another pull request's files.",
    C: "Wrong. An instruction constraining what may be referenced does not remove the contaminating context that produced the reference.",
    D: "Correct. Structural isolation cannot be forgotten, mis-ordered, or partially applied."
  }
},
{
  n: 24, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "A Corvus engineer asks Claude Code to find where a retry policy is configured. The session runs <code>Glob(\"**/*.ts\")</code>, receives 14,000 paths, then reads nine files it judges likely, then reports it cannot find the configuration. The string <code>maxRetries</code> appears in three files. What was the process error?",
  opts: {
    A: "Glob was the wrong first step for a repository of this size, and the session should have started from the package manifest and entry point instead.",
    B: "The session should have used Bash with a recursive grep, since shell tooling handles fourteen thousand files better than the built-in search does.",
    C: "The session used Glob for discovery and Read for search, when the search step should have been a Grep for the identifying string.",
    D: "Nine files was too small a sample, and the session should have kept reading candidates until it located the configuration site."
  },
  correct: ["C"],
  rule: "The funnel is Glob for structure, Grep for anchors, Read narrowly at the anchors. This session had no Grep step at all: it substituted judgement about which files were likely for a search that would have answered the question in one call.",
  why: {
    A: "Wrong, and partly reasonable. Starting from the manifest is a fine orientation habit, but the missing step is the search, not the entry point.",
    B: "Wrong. Routing search through the shell bypasses the purpose-built tool and its output handling, and repository size is not the issue.",
    C: "Correct. Grep on the identifying string returns the three sites directly, turning discovery into two small reads.",
    D: "Wrong. Reading more candidates is more of the wrong strategy, and it is what exhausts the context window."
  }
},
{
  n: 25, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus is deciding how to give Claude Code the internal design-system conventions. They apply only to files under <code>packages/ui/</code>, run to about 300 lines, change roughly quarterly, and must be identical for all 400 engineers. Which mechanism is correct?",
  opts: {
    A: "A <code>.claude/rules/</code> file with a <code>paths:</code> pattern matching the UI package, committed so every engineer gets the same version.",
    B: "A nested <code>CLAUDE.md</code> inside <code>packages/ui/</code>, which loads whenever work happens anywhere within that part of the repository.",
    C: "An <code>@packages/ui/conventions.md</code> import from the root <code>CLAUDE.md</code>, keeping one referenced source of truth for the team.",
    D: "A Skill in <code>.claude/skills/</code> whose description tells Claude to load it whenever it is working on user-interface components."
  },
  correct: ["A"],
  rule: "File-conditional guidance that must be identical for everyone: path-scoped rules, committed to the repo. The <code>paths:</code> frontmatter is what makes 300 lines cost nothing for the majority of engineers who are not in that package on a given turn.",
  why: {
    A: "Correct on every requirement: conditional load, committed and uniform, and no always-on cost.",
    B: "Wrong, and the closest alternative. A nested file is directory-scoped and workable, but it loads on directory context rather than on the files actually being edited, and it is a blunter instrument.",
    C: "Wrong. An import from the root file is unconditional: all 300 lines enter every session regardless of what is being worked on.",
    D: "Wrong. A Skill is task-invoked, so the conventions apply only when the model decides the task matches, rather than whenever a UI file is touched."
  }
},
{
  n: 26, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus adds a review subagent in <code>.claude/agents/reviewer.md</code> with a system prompt instructing it to review only and never edit, and no <code>tools:</code> key. During a review it modified two files to fix issues it had found. Which change enforces read-only behaviour?",
  opts: {
    A: "Strengthen the system prompt to state categorically that the reviewer must never modify a file for any reason.",
    B: "Add a <code>tools:</code> allowlist to the subagent's frontmatter granting only <code>Read</code>, <code>Grep</code> and <code>Glob</code>.",
    C: "Add a <code>PostToolUse</code> hook that reverts any file the review subagent writes to.",
    D: "Set the subagent to a smaller model, which is measurably less likely to take an action it was told not to."
  },
  correct: ["B"],
  rule: "Omitting <code>tools:</code> means the subagent inherits the full tool set. Role boundaries are enforced by the allowlist; a system prompt describes the role but grants nothing and forbids nothing.",
  why: {
    A: "Wrong. It is surface four guarding a surface one hole, and the edits happened in situations where fixing looked helpful.",
    B: "Correct. Without the write tools the failure mode is structurally impossible rather than merely discouraged.",
    C: "Wrong, and superficially rigorous. Reverting after the fact means the edit happened, any side effects ran, and the reviewer's context now contains its own changes.",
    D: "Wrong. Model choice is a probability adjustment, not a boundary."
  }
},
{
  n: 27, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Corvus needs an agent to migrate a database schema across 12 services. The migration is not reversible once applied to production data, the approach has not been decided, and the platform lead must review it. An engineer argues plan mode is unnecessary because the agent will open a PR that gets reviewed anyway. Evaluate.",
  opts: {
    A: "The engineer is wrong: irreversibility and architectural uncertainty are both plan-mode criteria, and PR review comes after the approach is committed to.",
    B: "The engineer is right: a pull request is itself an approval gate, so the review requirement is satisfied without adding a separate planning phase.",
    C: "The engineer is wrong: plan mode is required because the change spans twelve separate services, and any change above a size threshold needs a planning phase.",
    D: "The engineer is right, provided the pull request is marked as a draft so the platform lead sees the approach before any of it is merged."
  },
  correct: ["A"],
  rule: "Plan mode is chosen on reversibility, architectural uncertainty and the need for review before implementation. A PR arrives after the approach has been chosen and the work done; the decision plan mode exists to gate has already been made by then.",
  why: {
    A: "Correct. Two of the three criteria are explicitly present, and the ordering argument is what makes PR review insufficient.",
    B: "Wrong, and it is a genuinely reasonable-sounding argument. A PR reviews an implementation; the requirement here is to approve an approach.",
    C: "Wrong reasoning even though it reaches the right mode. Breadth alone is not a plan-mode criterion; a twelve-service reversible change may not need one.",
    D: "Wrong. A draft PR still contains the committed approach and the work done to implement it."
  }
},
{
  n: 28, domain: "CCW", topic: "Topic 2", sc: "S6", type: "single",
  stem: "Two Corvus teams need an internal MCP metrics server. Team A adds it to their <code>.claude/settings.local.json</code>; team B commits it to <code>.mcp.json</code> with the token written literally, arguing the repository is private. Security objects to both. Which pair of corrections is right?",
  opts: {
    A: "Both teams should move to user scope, since a metrics server is developer tooling rather than something the project itself depends upon.",
    B: "Team A is correct and team B should adopt the same local approach, keeping the server out of version control entirely on both sides.",
    C: "Team B should keep the literal token but rotate it quarterly, and team A should document their local configuration in the team wiki.",
    D: "Team A should commit to <code>.mcp.json</code> for shared tooling; team B should replace the literal token with an environment variable expansion."
  },
  correct: ["D"],
  rule: "Scope and secrets are independent decisions. Shared team tooling belongs in project scope so it is reproducible for everyone; the secret never belongs in the committed file, which is exactly what environment variable expansion is for.",
  why: {
    A: "Wrong. User scope makes it personal to each machine, which is the reproducibility problem team A already has.",
    B: "Wrong. It generalises the wrong half: keeping shared tooling out of version control means every engineer configures it by hand.",
    C: "Wrong. Rotation does not stop a token being in version history, readable by everyone who clones, and shared across all users.",
    D: "Correct. It fixes the sharing problem and the credential problem separately, which is how the two concerns should be treated."
  }
},
{
  n: 29, domain: "PESO", topic: "Topic 5", sc: "S5", type: "single",
  stem: "Atlas's schema declares <code>policy_number</code> as a required string. On documents where no policy number is present, the model returns values matching the correct format that appear nowhere in the source. The prompt already says &quot;do not guess — accuracy is critical&quot;. An engineer proposes adding a validation step rejecting any policy number that does not appear in the document's raw text. Evaluate.",
  opts: {
    A: "Sound: it catches every fabricated value deterministically, since a number absent from the source text cannot have been read from the document.",
    B: "Sound, provided the validation also normalises formatting differences so that a correctly-read number is not rejected over punctuation.",
    C: "Insufficient: the schema still forces a value, so rejection produces a retry loop with no legal way for the model to report absence.",
    D: "Insufficient: the real fix is a stronger instruction, since the model is disregarding an explicit statement not to guess at values."
  },
  correct: ["C"],
  rule: "A required non-nullable field makes absence inexpressible, so the model must produce something. Validation detects the symptom but leaves the model with no legal alternative: it will retry and fabricate again. Nullable value with the key still required is what makes absence sayable.",
  why: {
    A: "Wrong, and the most attractive distractor because the check genuinely works. It identifies the bad value without giving the model any way to produce a good one.",
    B: "Wrong. Normalisation is a real refinement of a mechanism that is addressing the wrong layer.",
    C: "Correct. Until the schema can express absence, every mechanism downstream is fighting a constraint the schema itself created.",
    D: "Wrong. The instruction and the schema are in direct conflict and the schema wins; no wording resolves that."
  }
},
{
  n: 30, domain: "PESO", topic: "Topic 5", sc: "S5", type: "multi",
  stem: "Atlas must represent three different situations for <code>secondary_insurer</code>: the document has one, the document type never has one, and the field is present but illegible. Downstream consumers currently branch on whether the key exists. Which TWO schema decisions are correct?",
  opts: {
    A: "Omit the key entirely when the document type has no such concept, so that its absence carries the type-level meaning implicitly for every consumer downstream.",
    B: "Return the string not_applicable when the field does not apply, which keeps the field a plain string for every consumer.",
    C: "Keep the key required and allow the value to be null, so consumers always find the field and test only for a null value.",
    D: "Add a companion status field with values such as present, not_applicable and illegible, so the three situations stay distinguishable."
  },
  correct: ["C","D"],
  rule: "Null answers whether a value exists; it cannot answer why it does not. Three situations need two dimensions: a nullable value plus an explicit status. Keeping the key required is what makes the null rate measurable and stops consumers distinguishing absent from missing.",
  why: {
    A: "Wrong, and it is what the codebase does now. Implicit meaning in an absent key is unmeasurable and forces every consumer to guess.",
    B: "Wrong. Sentinel strings in a value field collide with real values, break typing, and cannot be counted separately from genuine data.",
    C: "Correct. Required-but-nullable is the preferred form, and it removes the key-existence branching consumers are doing today.",
    D: "Correct. It is the second dimension, and it is what distinguishes a document type that has no secondary insurer from a page that could not be read."
  }
},
{
  n: 31, domain: "PESO", topic: "Topic 6", sc: "S5", type: "single",
  stem: "Atlas gets 97% on invoice totals from broker A and 58% from broker B, whose invoices place the total in a bottom-right box below a summary table. Adding a sentence to the shared prompt describing broker B's layout moved B to 66% and dropped A to 91%. What does this measurement tell you?",
  opts: {
    A: "The prompt needs several more iterations, since one added sentence has already moved broker B by eight percentage points in the right direction.",
    B: "One prompt cannot serve both layouts: classify the layout first and route to a layout-specific prompt with its own few-shot examples.",
    C: "Broker B's invoices are inherently ambiguous, so they should be routed to the human review queue rather than extracted automatically.",
    D: "The model needs a larger context window so it can consider the entire invoice rather than only the region the prompt directs it towards."
  },
  correct: ["B"],
  rule: "The trade-off is the diagnostic. When an instruction that helps one layout measurably harms another, the two layouts are competing for the same prompt, and no amount of further tuning removes the competition. Classify, then route to layout-specific prompts and examples.",
  why: {
    A: "Wrong, and the answer the measurement is designed to tempt. Continuing to iterate buys B's accuracy out of A's, indefinitely.",
    B: "Correct. Each prompt sees only relevant instructions and examples, so neither layout's accuracy is paid for by the other's.",
    C: "Wrong. The layout is perfectly unambiguous once known; it is only ambiguous to a prompt written for a different one.",
    D: "Wrong. Both layouts already fit; the failure is where the model is told to look, not how much it can see."
  }
},
{
  n: 32, domain: "PESO", topic: "Topic 6", sc: "S5", type: "single",
  stem: "Atlas reports 94.2% extraction accuracy. Adjudication finds a claim paid at 1,200 instead of 12,000. Analysis: <code>claimed_amount</code> runs at 99.1% on native PDFs and 71% on faxes; faxes are 6% of volume. The aggregate has been stable for eight months. Which statement identifies the reporting defect most precisely?",
  opts: {
    A: "The sample used to compute the aggregate is far too small to surface a failure that is confined to six percent of the incoming document volume.",
    B: "Accuracy is the wrong metric and should be replaced by precision and recall computed across the whole extraction schema for every single document processed.",
    C: "Aggregate accuracy averages over segments with different behaviour, so a field failing on one input channel is invisible and cannot be thresholded.",
    D: "94.2% is too low for a system that pays claims, and the target should be raised before any segmentation of that metric is even considered."
  },
  correct: ["C"],
  rule: "A single aggregate is the wrong instrument for a routing decision. Review thresholds are set per field and per document characteristic, so accuracy must be reported at that granularity — otherwise a 71% segment is mathematically invisible inside a stable 94.2%.",
  why: {
    A: "Wrong, and superficially statistical. The figure is stable and correctly computed; the problem is what it averages over, not how many samples it averages.",
    B: "Wrong. Precision and recall reported as one number across everything have exactly the same averaging defect.",
    C: "Correct. It names both consequences: the segment is invisible, and there is no per-field number on which to set a threshold.",
    D: "Wrong. It judges the number rather than its granularity, and 99.1% on the dominant channel is not the problem."
  }
},
{
  n: 33, domain: "PESO", topic: "Topic 6", sc: "S5", type: "single",
  stem: "Atlas has a field that reviewers correct more than any other: <code>invoice_date</code>. The value <code>03/04/2026</code> is returned as 3 April for some brokers and 4 March for others, with no record of which reading was used. Some brokers supply no regional signal at all. Which design is correct?",
  opts: {
    A: "Normalise every date to the convention used by the majority of the brokers, which makes downstream output consistent even where the source document is unclear.",
    B: "Put the disambiguation rule in the system prompt so it applies to every date field the extraction schema contains, not only to the invoice date.",
    C: "State the target format and the regional disambiguation rule in the field description, and return null with an ambiguous status where no signal exists.",
    D: "Add a post-processing step that rewrites any date whose day component exceeds twelve into unambiguous ISO form before adjudication receives it."
  },
  correct: ["C"],
  rule: "Normalisation rules belong in the field's description, where they travel with the field and survive schema reuse. Genuine ambiguity is not a formatting problem: when the source supports two readings, the only correct output is null plus an explicit status, which then becomes a routing signal.",
  why: {
    A: "Wrong. It manufactures consistency by silently converting roughly half the ambiguous dates into wrong dates.",
    B: "Wrong, and the plausible near-miss. The system prompt applies broadly but competes for attention and does not travel with the schema when it is reused.",
    C: "Correct on both halves — the resolvable case gets a rule attached to the field, and the unresolvable case gets an honest representation.",
    D: "Wrong. It only resolves the cases that were never ambiguous, since a day above twelve already determines the reading."
  }
},
{
  n: 34, domain: "PESO", topic: "Topic 7", sc: "S5", type: "multi",
  stem: "Atlas reviewers correct roughly 900 extractions a month. Today each correction records the document ID, the field and the corrected value. The team wants these corrections to improve the pipeline rather than just fix documents. Which TWO additions to the correction record deliver that?",
  opts: {
    A: "A typed error class per correction, drawn from a taxonomy where each class maps to one intervention: schema, description, few-shot or validation code.",
    B: "A weekly dashboard showing the total number of corrections, trended over time and broken down by the reviewer who made each one and the field it affected.",
    C: "A free-text note from the reviewer explaining in their own words what was wrong with the extraction that they have just corrected.",
    D: "The prompt, schema and example-set versions in force when the extraction ran, plus a flag marking the document for a regression evaluation set."
  },
  correct: ["A","D"],
  rule: "A feedback loop needs corrections to be aggregable into a fix and attributable to a configuration. A typed class tells you which lever to pull; version identifiers tell you which configuration produced the error and let you tell a regression from a pre-existing failure. Corrected documents are also the highest-value evaluation data available.",
  why: {
    A: "Correct. A taxonomy where each class implies an intervention is what converts 900 individual fixes into a small number of decisions.",
    B: "Wrong. It measures the volume of the problem without saying anything about its cause, and reviewer attribution answers a different question entirely.",
    C: "Wrong, and it feels useful. Free text is unaggregable: 900 differently-worded notes cannot be counted, sorted or acted on systematically.",
    D: "Correct. Without versions you cannot attribute an error to a configuration, and the regression set is what stops the next fix reintroducing this one."
  }
},
{
  n: 35, domain: "PESO", topic: "Topic 5", sc: "S5", type: "single",
  stem: "Atlas's <code>document_type</code> enum has five members. Reviewers report two separate problems: unusual documents get assigned the nearest listed type, and illegible scans also get assigned a type. An engineer adds a single <code>other</code> member. Six weeks later the <code>other</code> rate is 9% and nobody can say what to do about it. What was wrong with the fix?",
  opts: {
    A: "One escape member collapses two signals that imply different remedies: an unlisted real type versus a document that could not be read.",
    B: "The member should have been named more descriptively, so that the reviewers reading the output could tell what kind of document it referred to.",
    C: "A confidence score should have been added alongside the type so that low-confidence classifications could be routed for review separately.",
    D: "The enum should have been removed entirely, allowing the model to name whatever document type it actually observed on the page."
  },
  correct: ["A"],
  rule: "Escape members must separate signals that drive different fixes. A rising rate of real-but-unlisted types says extend the enum; a rising rate of unreadable documents says fix intake or scan quality. One member makes a 9% rate that nobody can act on — which is precisely the reported outcome.",
  why: {
    A: "Correct. Two members, two rates, two different remediations — and each rate becomes individually actionable.",
    B: "Wrong. Naming does not separate the two populations; a better name for one bucket still holds both.",
    C: "Wrong, and a reasonable addition in its own right. A confidence score does not distinguish an unlisted type from an unreadable page; both simply score low.",
    D: "Wrong. A free-form string loses the enumerable classification downstream routing depends on and invites unbounded label drift."
  }
},
{
  n: 36, domain: "PESO", topic: "Topic 5", sc: "S5", type: "single",
  stem: "Atlas needs two guarantees on <code>claimed_amount</code>: it must never be negative, and the sum of the line items must equal the stated total. An engineer proposes expressing both in the JSON schema, using a minimum and a computed cross-field constraint. What is the correct assessment?",
  opts: {
    A: "Only the sign constraint is expressible as a schema keyword; the arithmetic relationship between fields belongs in a post-parse validation layer.",
    B: "Both are expressible: a numeric minimum handles the sign, and a cross-field arithmetic constraint handles the totals check within the schema itself.",
    C: "Neither is expressible, and both belong in the field descriptions as instructions the model is asked to follow while performing extraction.",
    D: "Both belong in post-parse validation, because a schema that rejects a response forces a retry that costs more than validating the parsed result."
  },
  correct: ["A"],
  rule: "Schema keywords constrain individual values and shapes. A numeric bound on one field is squarely inside that; an arithmetic relationship between several fields is not, and belongs in deterministic code after parsing. The layering is schema for shape, code for invariants.",
  why: {
    A: "Correct, and it is the precise split: one constraint is a schema keyword, the other is a code-layer invariant.",
    B: "Wrong. Cross-field arithmetic is not a schema capability, and asserting it is is the commonest error on this topic.",
    C: "Wrong. It gives away a guarantee that is genuinely available structurally, and moves it to the weakest surface.",
    D: "Wrong, and the subtle near-miss. The reasoning about retry cost is not unreasonable, but it discards a free structural guarantee on the sign."
  }
},
{
  n: 37, domain: "PESO", topic: "Topic 6", sc: "S5", type: "single",
  stem: "Atlas's structured extraction of a 90-page policy schedule returns <code>stop_reason: max_tokens</code> with the JSON truncated mid-object. An engineer raises <code>max_tokens</code> from 4,096 to 16,384; it works for a month, then a 200-page schedule truncates, and reviewers note the later sections of long responses are noticeably less accurate. What is the correct fix?",
  opts: {
    A: "Raise the limit to the model's maximum and monitor for responses that come within ten percent of the ceiling so the next failure is anticipated.",
    B: "Ask the model to extract only the fields adjudication actually consumes, which keeps every response inside the current token budget comfortably.",
    C: "Split extraction into per-section calls with bounded scope, run them concurrently, and merge the resulting structures deterministically in code.",
    D: "Continue the truncated response in a follow-up turn and concatenate the fragments before the combined JSON is parsed by the pipeline."
  },
  correct: ["C"],
  rule: "Truncation is a scoping problem. Raising the ceiling buys headroom until the next larger input and degrades quality across a long generation — which the reviewers have already observed. Splitting keeps every response short, buys parallelism, and makes the merge a deterministic code operation.",
  why: {
    A: "Wrong. It postpones the identical failure and does nothing about the measured quality drop in long responses.",
    B: "Wrong, and a genuinely tempting scope reduction. It works until adjudication needs another field, and it silently discards data the document contains.",
    C: "Correct. It addresses both the truncation and the degradation, and the merge is testable in a way that stitching is not.",
    D: "Wrong. Fragment stitching is brittle, and the continuation is generated with the same degraded attention that weakened the first tail."
  }
},
{
  n: 38, domain: "PESO", topic: "Topic 6", sc: "S5", type: "single",
  stem: "Atlas routes 8% of extractions to human review by random sampling. The queue is mostly correct documents while adjudication keeps finding errors that were never reviewed. An engineer proposes replacing random sampling entirely with confidence-based routing. What is the correct assessment?",
  opts: {
    A: "Correct: random sampling wastes reviewer capacity on documents that do not need it, and confidence routing directs that capacity at likely errors.",
    B: "Incomplete: route on per-field confidence and document characteristics, but retain a small random sample to measure the unreviewed error rate.",
    C: "Incorrect: confidence scores are self-reported and uncalibrated, so routing on them is less reliable than sampling documents at random.",
    D: "Correct, provided a single global confidence threshold is tuned against the historical correction data before the change is rolled out."
  },
  correct: ["B"],
  rule: "Targeted routing and random sampling answer different questions. Routing catches errors; sampling is the only way to measure the error rate of the population you did not review. Removing sampling entirely leaves you blind to how much the routing is missing.",
  why: {
    A: "Wrong, and the answer that follows most naturally from the complaint. It is right about the waste and wrong to discard the measurement instrument.",
    B: "Correct. Route on signal, sample to calibrate — and per-field thresholds, because one global bar is wrong for both the amount and the notes.",
    C: "Wrong. Extraction confidence signals are useful even when imperfect, and random sampling is not a routing mechanism at all.",
    D: "Wrong. A single global threshold is far too loose for the field that pays money and far too tight for free-text fields."
  }
},
{
  n: 39, domain: "PESO", topic: "Topic 6", sc: "S5", type: "single",
  stem: "Atlas processes two workloads: a nightly backfill of 2.1 million archived documents and a live path where an adjuster waits on screen. An architect proposes the Message Batches API for both, noting a 50% saving and that observed batch turnaround has been under ten minutes for the past quarter. Evaluate.",
  opts: {
    A: "Correct for both, since the measured turnaround is well inside what an adjuster will tolerate and the saving across both workloads is substantial.",
    B: "Incorrect for both, since batch processing does not support the schema-enforced structured output that the extraction pipeline relies on for every field.",
    C: "Correct for the live path only, since batching absorbs the arrival spikes that make an adjuster's wait unpredictable during busy periods.",
    D: "Correct for the backfill only; the live path stays synchronous, because the processing window is a guarantee measured in hours, not an observed average."
  },
  correct: ["D"],
  rule: "The question is whether anything is waiting. A person on screen means synchronous; nothing waiting and a tolerant window means batch. The trap is designing a human-facing path around an observed average rather than the stated guarantee.",
  why: {
    A: "Wrong, and the observed-turnaround detail exists to make it attractive. An average is not a bound, and the bad night is the one that matters.",
    B: "Wrong. Batch requests carry the same request shape including tools and schemas; only result timing differs.",
    C: "Wrong. It is exactly backwards: batching adds latency to the path where a human is waiting.",
    D: "Correct. Take the discount where latency is genuinely free and leave the interactive path on the mode that bounds it."
  }
},
{
  n: 40, domain: "PESO", topic: "Topic 5", sc: "S5", type: "single",
  stem: "Atlas's extraction currently asks in the prompt for JSON and parses the reply. About one response in forty arrives wrapped in explanation or with a trailing comma, and the pipeline throws. An engineer proposes prefilling the assistant response with an opening brace so the model commits to JSON from the first token. Evaluate.",
  opts: {
    A: "Sound: prefilling removes the possibility of preamble, which is the failure mode that accounts for the large majority of the malformed responses.",
    B: "Sound, provided the prompt also states that the response must contain no text outside the JSON object under any circumstances at all.",
    C: "Insufficient: a prefill constrains the opening only, so structural errors later in the response are unaffected and the pipeline still throws.",
    D: "Insufficient: the model needs more worked examples of correctly formatted output, which raises compliance above the current success rate."
  },
  correct: ["C"],
  rule: "Strictness requirement decides the method. A prefill nudges the opening; only a tool schema constrains the whole structure, and only <code>tool_choice</code> naming that tool guarantees the call happens at all. When a downstream system breaks on malformed output, anything short of that is a probability improvement.",
  why: {
    A: "Wrong, and it is the strongest distractor because prefilling genuinely fixes the preamble case. Trailing commas and truncated arrays are untouched.",
    B: "Wrong. It layers an advisory instruction on a partial mechanism, which is two weak surfaces rather than one strong one.",
    C: "Correct. Partial constraint on a hard requirement leaves the pipeline throwing, just less often.",
    D: "Wrong. Examples raise compliance without guaranteeing it, and one failure in forty on a paying pipeline is still a broken contract."
  }
},
{
  n: 41, domain: "TDM", topic: "Topic 8", sc: "S4", type: "single",
  stem: "Vantage's agent confuses <code>search_tickets</code> and <code>search_issues</code>, whose descriptions both read as variants of &quot;search for records&quot;. It also passes dates in three different formats to both. An engineer proposes adding a routing paragraph to the system prompt explaining when each applies, and listing the accepted date format. What is the correct assessment?",
  opts: {
    A: "Sound: the system prompt is read on every turn, so a routing paragraph there is applied consistently to every tool-selection decision the agent makes.",
    B: "Wrong surface: both fixes belong in the descriptions, with negative scope naming the other tool and an example value for each parameter.",
    C: "Sound for the date format, which is a global convention, but the routing guidance should instead be enforced by restricting the tool set.",
    D: "Wrong surface: the two tools should be consolidated into one with a record-type enum, which removes the selection decision altogether."
  },
  correct: ["B"],
  rule: "Disambiguation belongs where the decision is made. A tool description is attached to the choice itself; a system-prompt paragraph competes for attention with everything else there. Negative scope naming the alternative is the component that separates semantically similar tools, and input formats belong on the parameters they govern.",
  why: {
    A: "Wrong. Being read every turn is not the same as being applied at the point of decision, and it is the weaker of the two available surfaces.",
    B: "Correct on both halves, and note that negative scope — not a better positive description — is what does the separating.",
    C: "Wrong, and partially reasonable. Restricting the tool set is a legitimate technique, but these are two genuinely distinct record stores an agent may need.",
    D: "Wrong, and the sophisticated near-miss. Consolidation is right for near-duplicates; tickets and engineering issues are different domains that should stay distinct."
  }
},
{
  n: 42, domain: "TDM", topic: "Topic 9", sc: "S4", type: "single",
  stem: "Vantage's agent sometimes replies conversationally when the workflow requires a classification, and sometimes picks the wrong classifier among three similar tools. An engineer sets <code>tool_choice</code> to <code>{&quot;type&quot;: &quot;any&quot;}</code> and reports that conversational replies stopped. Mis-selection is unchanged. What does this tell you?",
  opts: {
    A: "The setting should be <code>{&quot;type&quot;: &quot;tool&quot;, &quot;name&quot;: ...}</code>, which would have fixed both problems in one change.",
    B: "The setting is working correctly and mis-selection needs a separate fix, since <code>any</code> guarantees that a tool is called but never which one.",
    C: "Mis-selection is unaffected because <code>any</code> only applies to the first turn of a session, after which the model reverts to choosing automatically.",
    D: "The three classifiers need to be merged into one tool, since <code>any</code> cannot distinguish between tools that accept the same input shape."
  },
  correct: ["B"],
  rule: "<code>any</code> constrains whether a tool is called, never which. Mis-selection is a tool-design problem — descriptions, distribution, consolidation — and it is a different failure from a conversational reply where a call was required.",
  why: {
    A: "Wrong here, and the strongest distractor. Forcing a named tool is right when exactly one tool is correct; with three legitimate classifiers it just hard-codes one.",
    B: "Correct, and it is the precise reading of the evidence: one symptom resolved, the other untouched, exactly as the parameter's semantics predict.",
    C: "Wrong. There is no such per-turn reversion; the parameter applies to the request it is set on.",
    D: "Wrong. It may or may not be a good idea, but it is not what the observation about <code>any</code> demonstrates."
  }
},
{
  n: 43, domain: "TDM", topic: "Topic 9", sc: "S4", type: "single",
  stem: "Vantage's <code>process_return(order_id)</code> requires an <code>order_id</code> that only <code>lookup_order(email)</code> produces. Under load the agent calls <code>process_return</code> with a constructed identifier. The tool returns <code>{}</code> and the agent tells the customer the return is processed. Which single change most improves this?",
  opts: {
    A: "Validate the identifier in the <code>process_return</code> backend and return a structured retryable error naming <code>lookup_order</code> as the remediation.",
    B: "Add the prerequisite to the <code>process_return</code> description, stating that the identifier must come from <code>lookup_order</code> first.",
    C: "Set <code>disable_parallel_tool_use</code> so the two calls cannot be emitted in the same turn, which forces the lookup to complete first.",
    D: "Add a system-prompt rule requiring a lookup before any return is processed, placed near the start where it is most likely to be followed by the agent."
  },
  correct: ["A"],
  rule: "Sequencing is enforced by the callee and taught by the description. There are two defects here — a skippable precondition and an empty result read as success — and only the structured error fixes both, by making the failure unmistakable and telling the agent exactly how to recover.",
  why: {
    A: "Correct. The precondition becomes unskippable, and the error replaces the empty object that was being read as success.",
    B: "Wrong on its own, and a genuine improvement. The description raises the success rate; under load it is still advisory, and the empty-result problem remains.",
    C: "Wrong, and the technically-informed distractor. Preventing parallel emission does not stop the model calling <code>process_return</code> alone with an invented identifier.",
    D: "Wrong. Weakest surface, and it fails precisely under the load conditions described."
  }
},
{
  n: 44, domain: "TDM", topic: "Topic 9", sc: "S1", type: "single",
  stem: "Meridian forces the identity-verification tool on the first turn of every session. QA reports the agent no longer greets the customer before verifying, though the system prompt tells it to. An engineer says this is a regression and should be raised with the platform. What is the correct response?",
  opts: {
    A: "It is expected: a forced tool call prefills the assistant turn, so emit the greeting from the orchestrator or request the tool in the user message.",
    B: "It is a regression: a forced tool choice constrains only which tool is called, and it should not suppress assistant text the system prompt has requested.",
    C: "It is expected, and the fix is <code>tool_choice: any</code>, which permits assistant text alongside a guaranteed tool call.",
    D: "It is expected, and the greeting should be moved into the tool's own response so the customer sees it after verification completes."
  },
  correct: ["A"],
  rule: "Forcing a specific tool effectively prefills the assistant turn with that call, so no natural-language text precedes it. The two remedies are to emit the greeting from the orchestrator, or to use <code>auto</code> and request the tool in the user message — accepting that <code>auto</code> no longer guarantees the call.",
  why: {
    A: "Correct. It names the mechanism and gives both remedies; in a banking flow the guaranteed verification usually outweighs in-turn text.",
    B: "Wrong. It is documented behaviour of forced tool use, so filing it upstream changes nothing.",
    C: "Wrong, and a subtle trap. <code>any</code> still forces a call and still prefills the turn; it only widens which tool may be chosen.",
    D: "Wrong. A greeting after verification is not a greeting before it, which is what the product requirement asked for."
  }
},
{
  n: 45, domain: "TDM", topic: "Topic 8", sc: "S4", type: "multi",
  stem: "Vantage's agent gets a 500 from an MCP account-status tool. The server returns <code>{&quot;error&quot;: &quot;Internal server error&quot;}</code>. The agent retries seven times in a row, then tells the customer their account is in good standing. Which TWO changes to the error contract fix this?",
  opts: {
    A: "Return a typed error with a category and an explicit retryable flag, so the agent can distinguish a transient fault from a permanent one.",
    B: "Return the HTTP status code in the message text so that the agent can infer from it whether another attempt is at all likely to succeed.",
    C: "Return the error as a <code>tool_result</code> with <code>is_error</code> set, carrying a remediation hint, so failure cannot be mistaken for an absence of findings.",
    D: "Have the MCP server retry internally up to three times before surfacing anything at all, which takes the retry decision away from the agent."
  },
  correct: ["A","C"],
  rule: "Two failures here: the agent could not tell whether retrying was sensible, and it could not tell a failure from a clean result. A typed, retryable-flagged error answers the first; an explicit error result with a remediation hint answers the second.",
  why: {
    A: "Correct. The retryable flag is what ends a blind retry loop, and the category is what lets the orchestrator route the failure.",
    B: "Wrong, and superficially helpful. Asking the model to infer retry semantics from a status code is exactly the inference the flag exists to remove.",
    C: "Correct. It closes the more dangerous defect: a failure that reads as a successful check of a healthy account.",
    D: "Wrong on its own. Internal retries are reasonable but the seventh failure still has to surface as something the agent can act on."
  }
},
{
  n: 46, domain: "TDM", topic: "Topic 8", sc: "S4", type: "single",
  stem: "Vantage's returns subagent has 31 tools, four of which are overlapping search tools inherited from different tenants. Mis-selection among the four causes most failures. An engineer proposes a decision tree in the subagent's system prompt describing when each of the four applies. What is the better change?",
  opts: {
    A: "Keep all four tools and rewrite each description with negative scope naming the other three, so the model can tell them apart.",
    B: "Consolidate the four overlapping operations behind one tool with a source enum, and scope the tool set to the returns role.",
    C: "Keep all 31 tools and set <code>tool_choice</code> to <code>any</code>, so that the agent commits to a tool rather than hesitating between them.",
    D: "Provide all 31 tools to every subagent, so that any agent can handle any request and mis-routing between agents stops mattering."
  },
  correct: ["B"],
  rule: "Selection accuracy falls as the catalogue grows and falls fastest among semantically similar tools. Consolidation removes the ambiguity; role scoping removes the tools that were never relevant. Both causes are addressed, and the per-turn schema cost drops as a side effect.",
  why: {
    A: "Wrong, and the strongest alternative. Negative scope is the right technique for two genuinely distinct tools; four tools doing the same thing should not exist separately.",
    B: "Correct. It attacks both the overlap and the catalogue size, which are the two things the evidence points at.",
    C: "Wrong. <code>any</code> forces a choice among four indistinguishable options without improving which one is chosen.",
    D: "Wrong. It is the anti-pattern the scenario already describes, generalised."
  }
},
{
  n: 47, domain: "TDM", topic: "Topic 9", sc: "S4", type: "single",
  stem: "Vantage's agent has gathered everything it needs and must now write a summary for the ticket. On this final turn it keeps calling <code>search_kb</code> again instead of summarising. Which configuration is correct for this turn?",
  opts: {
    A: "Set <code>tool_choice: {&quot;type&quot;: &quot;auto&quot;}</code> with a prompt instruction not to call further tools.",
    B: "Set <code>tool_choice: {&quot;type&quot;: &quot;none&quot;}</code> on the final summarising request.",
    C: "Remove the tools from the request entirely and set <code>tool_choice</code> to <code>any</code> for that turn.",
    D: "Omit <code>tool_choice</code> and rely on the model noticing that it already has what it needs to write."
  },
  correct: ["B"],
  rule: "<code>none</code> is the parameter that forbids tool use for a turn. It is the correct configuration for a terminal summarising step where the data is already gathered and any further call is wasted latency.",
  why: {
    A: "Wrong. An advisory instruction is what is already failing; <code>auto</code> leaves the choice open.",
    B: "Correct, and it is the value most candidates forget exists.",
    C: "Wrong, and internally contradictory: <code>any</code> forces a tool call, which cannot be satisfied with no tools supplied.",
    D: "Wrong. Omitting the parameter is <code>auto</code>, which is the current behaviour that is failing."
  }
},
{
  n: 48, domain: "TDM", topic: "Topic 8", sc: "S4", type: "single",
  stem: "Vantage's <code>list_open_tickets</code> returns every open ticket for a tenant with all fields; for large tenants that is 900 tickets and roughly 60,000 tokens, after which the agent loses track of the customer's question. An engineer proposes a <code>PostToolUse</code> hook truncating the tool result to the first 2,000 characters. Evaluate.",
  opts: {
    A: "Wrong layer: the tool should paginate with metadata and return high-signal fields plus identifiers the agent can chain into a detail call.",
    B: "Sound: it bounds the context cost deterministically, and 2,000 characters is enough for the agent to see the most recent tickets in the list.",
    C: "Sound, provided the truncation preserves whole ticket objects so the agent never receives a partially serialised record at the boundary.",
    D: "Wrong layer: the agent needs a larger context window, since 60,000 tokens is well within what current models are able to hold."
  },
  correct: ["A"],
  rule: "Truncation discards data arbitrarily and silently, and the agent cannot tell it happened. The tool's own contract should bound the response: a bounded page, pagination metadata so the agent knows more exists, and identifiers it can use to fetch detail on demand.",
  why: {
    A: "Correct. It bounds the response by design, keeps the information the agent needs to ask for more, and preserves a path to detail.",
    B: "Wrong. There is no guarantee the retained portion is the relevant portion, and the agent has no signal that anything was removed.",
    C: "Wrong, and the thoughtful-sounding refinement. Clean object boundaries make truncation tidier without making the discarded data less important.",
    D: "Wrong. Holding 60,000 tokens of mostly-irrelevant records is the problem, not the limit."
  }
},
{
  n: 49, domain: "TDM", topic: "Topic 8", sc: "S6", type: "single",
  stem: "Corvus commits <code>.mcp.json</code> with <code>&quot;env&quot;: {&quot;GITHUB_TOKEN&quot;: &quot;ghp_realtokenvalue&quot;}</code>, arguing the repository is private and only employees can read it. Which objection is the strongest technical one?",
  opts: {
    A: "The token enters version history permanently, is shared identically by everyone who clones, and cannot be rotated or revoked per user.",
    B: "Private repositories can be made public by mistake, at which point the token is exposed to anyone who happens to look at the repository.",
    C: "The token will eventually expire, and every engineer will then be blocked until someone commits a replacement value to the repository.",
    D: "Committed configuration cannot be overridden per engineer, so nobody can use a token with narrower scopes than the shared one provides."
  },
  correct: ["A"],
  rule: "Three independent problems in one line: it is permanent in history even after removal, it is one credential for every user so nothing is attributable, and rotation requires a commit and a redeploy. Environment variable expansion solves all three by keeping the configuration committed and the secret out of it.",
  why: {
    A: "Correct, and it is the objection that holds even if the repository stays private forever.",
    B: "Wrong as the strongest objection, and it is the one people reach for. It is a real risk but it is contingent; the others are certain.",
    C: "Wrong. Expiry is an operational nuisance rather than the security defect.",
    D: "Wrong. It is a genuine downside of the shared credential, but it is a consequence of the sharing rather than the primary objection."
  }
},
{
  n: 50, domain: "TDM", topic: "Topic 9", sc: "S4", type: "single",
  stem: "A Vantage workflow needs three lookups: employee record by email, policy by department, and asset by employee ID. The employee record yields both the department and the employee ID. The agent currently issues all three in one parallel turn and the asset lookup frequently fails. What is the correct execution plan?",
  opts: {
    A: "All three strictly in sequence with <code>disable_parallel_tool_use</code> set, since two of the three depend on the first lookup's output.",
    B: "All three in parallel as now, with a retry on the asset lookup using the employee ID once the first turn's results have returned.",
    C: "The employee lookup first, then the policy and asset lookups together in a single parallel turn once the record is available.",
    D: "The asset lookup first, since it is the call that carries a dependency and therefore needs the longest to be satisfied."
  },
  correct: ["C"],
  rule: "Read the dependency graph. One call is independent and produces the inputs for the other two, which are independent of each other. That is two waves, not three sequential calls and not one parallel batch.",
  why: {
    A: "Wrong. It respects the dependency but pays an unnecessary third round trip for two calls that can go together.",
    B: "Wrong, and the pragmatic-sounding distractor. Retrying after a predictable failure normalises a wasted call and a fabricated input.",
    C: "Correct. Two waves is the minimum that satisfies the dependency, and it is the optimal schedule here.",
    D: "Wrong. The asset lookup is the dependent call, so it cannot go first; the reasoning inverts the direction of the dependency."
  }
},
{
  n: 51, domain: "TDM", topic: "Topic 8", sc: "S4", type: "single",
  stem: "Vantage's ticketing MCP server exposes <code>get_sla_schedule</code>, <code>get_escalation_matrix</code> and <code>list_tenant_config</code> as tools. Every session calls all three before doing anything else. The content is identical for all sessions within a tenant and changes monthly. What is the correct server-side change?",
  opts: {
    A: "Combine the three tools into a single tool that returns all three payloads in one response, saving two round trips at session start.",
    B: "Cache the three tool responses on the client for a month, so only the first session in each tenant pays the round-trip cost.",
    C: "Move the three payloads into the agent's system prompt, regenerating it whenever any of the three underlying documents changes.",
    D: "Expose the three as MCP resources, so the client attaches the content directly with no model decision and no exploratory tool calls."
  },
  correct: ["D"],
  rule: "Tools are model-invoked actions; resources are addressable content the client attaches. Static, addressable content exposed as tools forces the model to rediscover it every session, at the cost of a turn each and a schema in every request.",
  why: {
    A: "Wrong, and the obvious efficiency answer. One round trip beats three, but it still costs a turn and still requires the model to decide to make it.",
    B: "Wrong. Client caching hides latency for repeat sessions while leaving the first session and the per-request schema cost untouched.",
    C: "Wrong. Ninety tenants cannot each carry a regenerated system prompt, and an escalation matrix is not standing instruction material.",
    D: "Correct. The profile — stable, addressable, needed every session — is exactly what the resource abstraction exists for."
  }
},
{
  n: 52, domain: "CMR", topic: "Topic 4", sc: "S3", type: "single",
  stem: "A Helix engineer says the incident agent &quot;remembers&quot; the incident across turns and asks why a restarted orchestrator loses everything even though the same session ID is used. Which explanation is correct?",
  opts: {
    A: "Session state is held server-side but scoped to a single process connection, so a restart invalidates that handle even when the same ID is reused.",
    B: "The conversation is cached server-side for a limited window, and a restart that takes longer than that window causes the cached history to expire.",
    C: "History is retained but must be re-authorised after a restart, and this orchestrator is failing to re-establish the session's authorisation context properly.",
    D: "The API is stateless, so the conversation exists only as the messages array your orchestrator resends; a session ID identifies your record, not server state."
  },
  correct: ["D"],
  rule: "There is no server-side conversation. Continuity is an illusion produced entirely by your code resending the accumulated messages array on every request. If your process loses that array and has not persisted it, the conversation is gone regardless of any identifier you kept.",
  why: {
    A: "Wrong. There is no server-side session handle of this kind to invalidate.",
    B: "Wrong, and it is a plausible mental model borrowed from other APIs. Prompt caching affects cost and latency, not whether history exists.",
    C: "Wrong. Authorisation is per request; it has nothing to do with conversational continuity.",
    D: "Correct, and it is the fact that explains why durable session state is an orchestration requirement rather than an optimisation."
  }
},
{
  n: 53, domain: "CMR", topic: "Topic 4", sc: "S1", type: "single",
  stem: "A Meridian session runs 40 turns. At turn 6 the customer said they cannot receive SMS. At turn 34, after compaction, the agent offers to send a one-time code by SMS. The team keeps the last 15 turns verbatim and drops older ones. Which change addresses the failure rather than deferring it?",
  opts: {
    A: "Maintain a structured state object of constraints and established facts outside the transcript, re-injected near the start of every request.",
    B: "Extend the retained window from fifteen turns to thirty-five, which covers the great majority of sessions Meridian actually handles in practice.",
    C: "Summarise the dropped turns into a paragraph and append it to the end of the conversation, so nothing from the early turns is entirely lost.",
    D: "Have the agent re-read the persisted transcript at each turn and restate any customer constraints it finds before composing its reply."
  },
  correct: ["A"],
  rule: "A recency policy evicts exactly the content whose loss is most damaging, because constraints and commitments are established early. A structured state object holds them at full fidelity independent of turn count, and early placement in the request is where attention is strongest.",
  why: {
    A: "Correct on both counts: full fidelity, and position in the request rather than at the end.",
    B: "Wrong. It moves the cliff to turn 50; any pure recency policy eventually drops a turn-6 constraint.",
    C: "Wrong, and the most reasonable-looking alternative. Summarisation is lossy about precisely this kind of specific constraint, and the end of the context is the weakest position.",
    D: "Wrong. Re-reading everything every turn is the cost that compaction exists to avoid, and it scales with session length."
  }
},
{
  n: 54, domain: "CMR", topic: "Topic 4", sc: "S6", type: "single",
  stem: "A Corvus engineer traces authentication across nine services over 90 minutes. After compaction the session contradicts a conclusion it reached an hour earlier, and the engineer wants to continue tomorrow. Which practice would have prevented both problems?",
  opts: {
    A: "Restating the accumulated conclusions at the end of every turn, so the summary is always among the most recent content in the window.",
    B: "Writing each conclusion with its file and line provenance to a scratchpad file as it was reached, and re-reading that file on resumption.",
    C: "Delegating each service to a separate subagent, so no single context ever held more than one service's worth of material at a time.",
    D: "Starting the session with a larger context window sized so that a ninety-minute exploration never triggers compaction in the first place."
  },
  correct: ["B"],
  rule: "Scratchpads solve durability: a conclusion must live somewhere that survives compaction, session end and process death. Written as findings are made — not at the end, when compaction has already happened — and carrying provenance so the resumed session can verify rather than trust.",
  why: {
    A: "Wrong, and superficially sensible. Restating grows the context being compacted, and the oldest conclusions are still the first evicted.",
    B: "Correct. It survives both the compaction and the overnight boundary, which is what makes tomorrow a resumption rather than a restart.",
    C: "Wrong. Isolation helps with breadth, but nine subagent summaries still accumulate in the coordinator and nothing is written down.",
    D: "Wrong. A bigger window postpones compaction and does nothing at all about the session boundary."
  }
},
{
  n: 55, domain: "CMR", topic: "Topic 4", sc: "S6", type: "multi",
  stem: "A Corvus review agent runs nightly against the main branch. Each run currently re-analyses all 1,200 files, taking 50 minutes. The team wants incremental runs, but security requires that no finding is missed because an earlier run cached a stale conclusion. Which TWO mechanisms satisfy both?",
  opts: {
    A: "Persist per-file findings keyed by a content fingerprint, and on each run reuse only the findings whose fingerprint is unchanged.",
    B: "Re-analyse any file whose fingerprint changed, any file that is new, and any file whose analysis was produced under an older prompt or schema version.",
    C: "Analyse only the files touched by commits made since the previous run, on the basis that untouched files were already analysed by the run that covered them.",
    D: "Cache the previous run's verdict for a fixed 24 hours, and re-run the full analysis only once that window has expired."
  },
  correct: ["A","B"],
  rule: "Targeted re-analysis is the safe resume: reuse conclusions only where the input fingerprint is unchanged. The second half is the part usually missed — a change to the prompt or schema invalidates cached findings just as surely as a change to the file, because the analysis itself is different.",
  why: {
    A: "Correct. Content-keyed caching ties reuse to what was actually analysed rather than to elapsed time.",
    B: "Correct, and it is the subtle requirement: a cached finding is only valid under the configuration that produced it.",
    C: "Wrong, and the intuitive incremental approach. A finding can arise from the interaction of a change with an untouched file, which a commit-diff scope never examines.",
    D: "Wrong. A time window is unrelated to whether the code changed, so it can serve a stale verdict minutes after a risky merge."
  }
},
{
  n: 56, domain: "CMR", topic: "Topic 4", sc: "S3", type: "single",
  stem: "Helix's incident agent runs for hours. The team wants a policy for what to keep in context. Which retention strategy fits an incident session best?",
  opts: {
    A: "Selective retention of decisions, confirmed facts and errors, with transient tool output dropped once its conclusion has been recorded.",
    B: "A sliding window over the most recent turns, since incident work is most concerned with the current state of the investigation.",
    C: "Full retention with no compaction at all, so that no observation made during the incident is ever lost from the agent's working context.",
    D: "Periodic summarisation of everything older than thirty minutes into a single narrative paragraph appended to the conversation."
  },
  correct: ["A"],
  rule: "Incident sessions are dominated by transient tool output — metric dumps, log slices, health checks — whose value is the conclusion drawn from them, not the raw bytes. Selective retention keeps decisions, confirmed facts and errors while discarding the bulk that has already been reduced to a finding.",
  why: {
    A: "Correct. It matches the content profile of the session, and it retains the classes whose loss actually causes contradictions.",
    B: "Wrong. Recency evicts the incident's earliest established facts, which are usually the ones that constrain everything after.",
    C: "Wrong. It is not a strategy so much as a deferral; the window fills and the failure mode returns without any policy to shape it.",
    D: "Wrong, and the most plausible alternative. Time-based narrative summarisation is lossy about specific values and appends at the weakest position."
  }
},
{
  n: 57, domain: "CMR", topic: "Topic 4", sc: "S6", type: "single",
  stem: "A Corvus session is resumed the next morning against a repository where four files have changed overnight. The resumption logic restores every cached conclusion and continues. The session then makes a recommendation based on a function signature that was changed last night. What is missing from the resumption design?",
  opts: {
    A: "A rule that a resumed session must discard every cached conclusion entirely, since no checkpoint can be known to remain valid after a gap of any length.",
    B: "A shorter maximum gap before resumption is disallowed, so that a session left overnight is required to start again from the beginning.",
    C: "A timestamp on each cached conclusion so that the engineer reading the recommendation can judge how current the underlying analysis is.",
    D: "An input fingerprint recorded per analysed file, compared on resumption so that conclusions about changed files are re-derived rather than trusted."
  },
  correct: ["D"],
  rule: "Resumption must be explicit about staleness. Fingerprints are not an optimisation, they are what makes restored state true: unchanged inputs keep their cached conclusion, changed inputs are re-analysed, and never-analysed files are analysed.",
  why: {
    A: "Wrong. That is a restart, and it abandons the requirement not to repeat completed work.",
    B: "Wrong, and a plausible-sounding heuristic. A file can change five minutes after a checkpoint; elapsed time is not the variable that matters.",
    C: "Wrong. It moves the correctness burden onto the reader, who cannot know whether the file changed after the timestamp.",
    D: "Correct. It targets exactly the four changed files while preserving the value of everything else that was established."
  }
},
{
  n: 58, domain: "CMR", topic: "Topic 4", sc: "S3", type: "single",
  stem: "Helix's agent must hand an incident to a follow-up agent after a shift change. Today it passes a narrative summary. The follow-up agent frequently re-attempts an action the first agent had ruled out, and once contradicted a commitment made to the customer. Which change fixes this?",
  opts: {
    A: "Make the narrative summary substantially longer, so that fewer of the decisions and commitments from the first shift are omitted from it.",
    B: "Pass the entire conversation from the first shift to the follow-up agent instead of a summary, so that nothing at all is lost anywhere in the transfer.",
    C: "Extract constraints, commitments and ruled-out options into an explicit structured block at the start of the handoff, separate from the narrative.",
    D: "Have the follow-up agent begin by asking the customer to restate any constraints and commitments from the earlier part of the incident."
  },
  correct: ["C"],
  rule: "Two mechanisms in one change: structure prevents the compression loss that drops a specific commitment from a narrative, and position at the start of the handoff mitigates the attention drop in the middle of a long input. Ruled-out options are as load-bearing as confirmed facts.",
  why: {
    A: "Wrong. A longer narrative is a bigger haystack, and prose remains lossy about exactly which options were eliminated.",
    B: "Wrong, and the tempting completeness answer. The full transcript makes the follow-up agent re-derive the state under time pressure, which is the cost a handoff exists to remove.",
    C: "Correct on both halves, and the ruled-out list is the part that stops the repeated attempt.",
    D: "Wrong. It asks the customer to do the system's job, and they have no way to know what the first agent ruled out internally."
  }
},
{
  n: 59, domain: "CMR", topic: "Topic 4", sc: "S1", type: "single",
  stem: "Meridian wants to shrink the human review queue without increasing errors. Today reviewers see a random 8% of contacts. Which routing design achieves this?",
  opts: {
    A: "Route on per-field confidence with thresholds set from the cost of each field being wrong, on document characteristics, and keep a small random sample.",
    B: "Raise the random sample to 20% so that a higher proportion of erroneous contacts is seen, then reduce it as the error rate falls over time.",
    C: "Route every contact from any customer who has previously complained, since prior complaints are the strongest available predictor of a later error occurring.",
    D: "Route on the agent's self-reported confidence in its own resolution, escalating any contact where that confidence falls below a tuned threshold."
  },
  correct: ["A"],
  rule: "Targeted routing catches errors; the retained random sample is the only instrument that measures the error rate of the population nobody reviewed. Thresholds are per field, because the cost of being wrong differs enormously between a payment amount and a free-text note.",
  why: {
    A: "Correct, and the retained sample is the part most answers drop — without it you cannot tell how much the routing is missing.",
    B: "Wrong. It scales cost linearly for a linear improvement in coverage and still selects mostly correct contacts.",
    C: "Wrong, and a plausible-sounding heuristic. Complaint history is a customer attribute, not a signal about whether this extraction or resolution is wrong.",
    D: "Wrong. Self-reported confidence is uncalibrated and systematically overconfident on exactly the out-of-distribution cases that need review."
  }
},
{
  n: 60, domain: "CMR", topic: "Topic 4", sc: "S6", type: "multi",
  stem: "Corvus wants a codebase-wide audit — which of 340 handlers still call a deprecated helper, and what each needs to migrate — run from inside an ordinary working session, with the session still usable afterwards. Which TWO techniques deliver this?",
  opts: {
    A: "Read the handlers in the main session in batches of twenty files, summarising after each batch until all 340 of the handlers have been covered.",
    B: "Delegate the sweep to a subagent whose delegation prompt names the helper and specifies the exact return schema for the per-handler table.",
    C: "Have the subagent return only the structured table, so the main session pays for the answer rather than for the 340 files behind it.",
    D: "Raise the main session's context window so that all 340 handlers and their surrounding code fit without degrading."
  },
  correct: ["B","C"],
  rule: "Subagent isolation is for exactly this shape: a wide read whose useful output is narrow. Both halves are required — the delegation package makes the sweep possible without a round trip, and the return contract is what keeps the isolation worth having.",
  why: {
    A: "Wrong. Seventeen lossy summarisation steps in the same session still accumulate, and the degradation is deferred rather than avoided.",
    B: "Correct. Naming the helper and the schema is what lets the subagent finish without coming back for missing context.",
    C: "Correct, and it is the half most often forgotten: a subagent that returns everything it read has isolated nothing.",
    D: "Wrong. A bigger window degrades attention over long inputs, costs more per turn, and leaves the session full afterwards."
  }
}

];
