/* =============================================================
   Claude Study Hub — CCAR-A2 mock exam item bank
   60 scenario-based questions written to the 37 Attempt-2 test
   objectives. Original items; not recalled or leaked exam content.

   SHAPE: items are deliberately long and each one spans two or three
   objectives, because that is how the Attempt-2 exam reads. The `topic`
   field lists the objectives an item draws on.

   NOTE: option LENGTH is balanced within every question and the correct
   option is never the longest and never the shortest. Do not edit an
   option without re-checking the whole set.
   ============================================================= */

var DOMAINS = {
  "ORCH": { "name": "Multi-agent Orchestration & Subagent Design", "weight": 27 },
  "CCW":  { "name": "Claude Code Configuration & Automated Review", "weight": 30 },
  "CTX":  { "name": "Context Management & Reliability",             "weight": 13 },
  "PESO": { "name": "Prompt Engineering & Structured Output",       "weight": 17 },
  "TDM":  { "name": "Tool Design & MCP Integration",                "weight": 13 }
};

var SCENARIOS = {
  S1: {
    title: "Halcyon Systems — automated pull-request review",
    text: "Halcyon runs a 1.4-million-line monorepo covering payments, identity, a public API and a React console. Every pull request triggers a Claude Code review in GitHub Actions. The review is expected to (a) load the standards for whichever areas the PR touches, (b) report security, business-logic and API-compatibility findings, and (c) emit something the pipeline can gate on. Engineers currently ignore the bot: it repeats findings the team has already accepted, occasionally rewrites files, and once ran for 40 minutes on a two-line change. Standards live partly in <code>CLAUDE.md</code>, partly in a wiki, and partly in the workflow YAML."
  },
  S2: {
    title: "Meridian Retail Bank — support orchestrator",
    text: "Meridian's support agent handles chat and email for 3.4 million customers. A coordinator parses the request and dispatches specialised subagents: <em>accounts</em>, <em>disputes</em>, <em>cards</em> and <em>policy</em>. Each subagent has its own tool set and returns a summary; the coordinator composes the customer-facing reply. Refunds up to $50 may be auto-approved; above that a tier-2 human must approve. Sessions routinely run 30+ turns, and regulators require every contact to reach a documented outcome. Peak load is 12,000 concurrent sessions."
  },
  S3: {
    title: "Northwind Research — parallel investigation pipeline",
    text: "Northwind runs a competitive-intelligence pipeline. A planner decomposes a research question into subtasks; investigator agents work sources concurrently; a synthesis agent produces one report with citations. Analysts have complained that the reports read as uniformly confident even when investigators disagreed, that the same source is sometimes analysed twice, and that a run interrupted by a deploy restarts from nothing. A single run can touch 400 documents and last two hours."
  },
  S4: {
    title: "Atlas Insurance — claims extraction pipeline",
    text: "Atlas extracts structured data from claim forms, invoices, medical reports and policy schedules arriving from 600 broker partners as email attachments and scans. Layouts vary widely. Output feeds an adjudication system that pays money, so errors are expensive. A human review queue exists but is the bottleneck. There is a nightly backfill of 2.1 million archived documents and a live path where an adjuster waits on screen. Accuracy is reported as a single figure, currently 94.2%."
  },
  S5: {
    title: "Corvus Engineering — Claude Code rollout at scale",
    text: "Corvus is rolling Claude Code out to 400 engineers across the same monorepo. Security requires that certain paths are never read and certain commands never run, on every machine, with no local override. Platform engineering wants formatting, linting and tests enforced consistently, and wants repeatable workflows — dependency audits, changelog generation, test authoring — available to everyone. Different teams have different conventions, and the root <code>CLAUDE.md</code> has grown to 900 lines that everybody pays for on every turn."
  },
  S6: {
    title: "Vantage IT Services — multi-tenant service desk",
    text: "Vantage operates an IT service desk for 90 corporate clients. Its agent resolves password resets, access requests, VPN faults and software installs across each client tenant. Tools are exposed over MCP: knowledge-base search, directory lookup, account-status check, an unlock/reset pair, asset lookup and a ticketing integration. Tool catalogues differ per tenant, several tools have overlapping names and purposes, and the ticketing server also holds the per-tenant escalation matrix and SLA schedule. Agents currently receive all 31 tools regardless of the task."
  }
};

var QUESTIONS = [
{
  n: 1, domain: "ORCH", topic: "O7 · O10", sc: "S3", type: "single",
  stem: "Northwind's planner decomposes every research question into the same five subtasks — market sizing, competitor list, pricing, hiring signals, patent activity — and dispatches five investigators in parallel. On a question about a competitor's supply-chain exposure, the pricing and hiring investigators returned nothing useful, while the competitor-list investigator surfaced a joint venture that nobody had planned to examine and that turned out to be the whole answer. The planner had no way to act on it. Which change addresses the architectural defect?",
  opts: {
    A: "Widen the standing subtask list to twelve so that a broader range of research angles is covered on every question that comes in.",
    B: "Have each investigator spawn follow-up investigators directly whenever it surfaces something outside its own assigned subtask.",
    C: "Ask each investigator at the end of its run whether the overall research question has been answered, and dispatch a second wave if any says no.",
    D: "Re-plan between rounds: run an initial batch, feed findings back into the planner to add, drop and re-scope subtasks, and cap the rounds."
  },
  correct: ["D"],
  rule: "Dynamic decomposition means the plan is a living object: an initial subtask set is executed, and findings are fed back into a re-planning step that adds, drops and re-scopes tasks. The test is whether a subtask's result can change which subtasks should exist — here it plainly can. Boundedness comes from a round cap and a persisted plan, not from restricting what may be discovered.",
  why: {
    A: "Wrong. A longer fixed plan is still fixed. It costs more on every question and still cannot generate the one subtask that this particular finding made necessary.",
    B: "Wrong. Peer-to-peer spawning abandons hub-and-spoke: no component owns the plan or the merged result, recursion is unbounded, and failures become untraceable.",
    C: "Wrong. Self-assessed completion is not a termination or expansion condition. It also arrives too late — after five full investigations have already been paid for.",
    D: "Correct. Re-planning between rounds is the mechanism the objective describes, and the round cap plus a persisted plan is what keeps an adaptive decomposition bounded and inspectable."
  }
},
{
  n: 2, domain: "ORCH", topic: "O3 · O19", sc: "S3", type: "single",
  stem: "Two Northwind investigators report on the same competitor's headcount. One says 4,200, the other 3,100. Both returned a short prose paragraph and a number; neither returned where the number came from. The synthesis agent emitted &quot;the competitor employs approximately 3,600 staff&quot;. An analyst who checked found that 4,200 came from a filing dated last quarter and 3,100 from a blog post of unknown date. What is the primary defect?",
  opts: {
    A: "The investigator output schema carries no per-claim source metadata, so synthesis had nothing with which to weigh, attribute or contest the two figures.",
    B: "The synthesis prompt should instruct the agent to average conflicting numeric findings only when the two values are within twenty percent of each other.",
    C: "The planner should not have dispatched two investigators onto the same fact, since duplicated work is what produced the conflict in the first place.",
    D: "The investigators needed a higher confidence threshold before reporting a figure, so that only the well-supported number would have reached synthesis."
  },
  correct: ["A"],
  rule: "Synthesis can only preserve what the workers returned. Source metadata is per-claim — source, reference, and date — not per-report. Without it, a filing and a blog post are indistinguishable inputs, and any reconciliation the synthesiser performs is arithmetic on unlabelled numbers.",
  why: {
    A: "Correct. Per-claim provenance is what lets synthesis attribute, weigh recency and reliability, and report a contested finding as contested rather than as a blended number.",
    B: "Wrong. Averaging is exactly the failure: it manufactures a figure that no source supports, and a numeric tolerance rule makes it look principled without making it true.",
    C: "Wrong. Independent corroboration is valuable and is often deliberate. The problem is not that two agents looked; it is that neither said where it looked.",
    D: "Wrong. Both investigators were confident. Confidence thresholds suppress reporting without improving the evidence, and would have hidden the disagreement entirely."
  }
},
{
  n: 3, domain: "ORCH", topic: "O9 · O2", sc: "S3", type: "multi",
  stem: "A Northwind run that had completed 180 of 400 document analyses was killed by a platform deploy at the 90-minute mark. The re-run started from zero and produced a different report, because several source documents had been updated in the interim and the second run analysed the new versions of everything while the first had analysed a mixture. Which TWO changes give reliable, non-repeating resumption?",
  opts: {
    A: "Persist a task graph with per-task status and per-task output to a store that outlives the worker process, keyed by task identifier.",
    B: "Hold the accumulated findings in the coordinator's conversation history so that a resumed session can read them back out of the transcript.",
    C: "Increase the platform's pod termination grace period so that an in-flight run has time to finish its remaining analyses.",
    D: "Record an input fingerprint per analysed document and, on resume, re-analyse only those whose fingerprint has changed since the checkpoint."
  },
  correct: ["A","D"],
  rule: "Resumption needs two properties: durable per-task state so completed work is skipped, and staleness detection so restored conclusions are still true. Fingerprints turn a blind cache into targeted re-analysis, which is what makes the resumed result comparable to an uninterrupted one.",
  why: {
    A: "Correct. In-process state does not survive a kill. A durable task graph with per-task output is what lets the resumer skip completed work rather than repeat it.",
    B: "Wrong. Conversation history is in-process, is subject to compaction, and is lost with the worker. It is the least durable place to keep findings.",
    C: "Wrong. A longer grace period moves the cliff. Deploys, evictions and crashes will still land mid-run, and nothing about correctness has changed.",
    D: "Correct. Fingerprints distinguish already-done from done-against-different-inputs, which is exactly the mixed-version defect described here."
  }
},
{
  n: 4, domain: "ORCH", topic: "O19 · O18", sc: "S3", type: "single",
  stem: "Analysts say Northwind reports read as uniformly confident. Reviewing one, you find the synthesis agent produced eleven declarative claims. Three were corroborated by two independent investigators, six came from a single source, and two appear in no investigator's output at all — the synthesis agent inferred them from the others. The synthesis agent has web search enabled so it can &quot;fill gaps&quot;. Which combination fixes this?",
  opts: {
    A: "Remove the synthesis agent's tools, and require it to label each claim as established, single-source or contested, with attribution and gaps stated.",
    B: "Give the synthesis agent a larger context window so it can hold every investigator's full output rather than working from truncated summaries of them.",
    C: "Have the synthesis agent re-run any single-source claim through a second investigator before that claim is allowed into the final report.",
    D: "Instruct the synthesis agent in its system prompt to write in a more hedged register whenever the underlying evidence base happens to be thin."
  },
  correct: ["A"],
  rule: "A synthesis stage reasons over worker output and introduces nothing. Tools let it manufacture facts that no worker found and that no reader can trace. Epistemic status — established, single-source, contested — must survive into the output, along with what nobody covered.",
  why: {
    A: "Correct. Removing tools closes the fabrication path, and explicit per-claim status plus stated gaps is what stops eleven claims of three different strengths reading identically.",
    B: "Wrong. Window size was not the constraint. The invented claims were not caused by missing input; they were caused by the agent being able and permitted to generate new ones.",
    C: "Wrong. It treats single-source as a defect to be eliminated rather than a status to be reported, and it doubles cost while still collapsing the distinction in the output.",
    D: "Wrong. Register is style. A hedged sentence with no attribution is no more traceable than a confident one, and the two fabricated claims remain."
  }
},
{
  n: 5, domain: "ORCH", topic: "O1 · O37", sc: "S2", type: "single",
  stem: "A Meridian session handling a disputed transaction takes 11 seconds before the customer sees anything. Tracing shows the agent makes three calls in sequence: <code>verify_identity(customer_id)</code>, then <code>get_account(customer_id)</code>, then <code>get_transactions(account_id)</code>. An engineer proposes emitting all three as parallel tool calls in one turn to cut two round trips. What is the correct assessment?",
  opts: {
    A: "Partly: the first two are independent and may go together, but the third consumes the second's output and must follow it.",
    B: "Correct for all three, provided the executor dispatches them concurrently rather than awaiting each promise in a sequential loop.",
    C: "Incorrect, because parallel tool use is only available when the request sets <code>disable_parallel_tool_use</code> to false.",
    D: "Incorrect, because emitting several tool calls in one response turn leaves the orchestrator unable to return a result for each call."
  },
  correct: ["A"],
  rule: "Parallel tool calls are legitimate only across independent calls. Two of these take <code>customer_id</code>, which the session already holds; the third needs <code>account_id</code>, which only the second can produce. Forcing it into the same batch makes the model invent an account identifier.",
  why: {
    A: "Correct. Batch the two independent lookups, then call the dependent one with the real account identifier once the second call has returned it.",
    B: "Wrong on the dependency, right on the executor. Concurrency in the executor is necessary for any latency win, but batching the third call is what breaks correctness.",
    C: "Wrong. Parallel tool use is the default behaviour; that flag exists to switch it off when calls have effects that must be ordered.",
    D: "Wrong. Multiple results are returned as multiple <code>tool_result</code> blocks inside one user message, matched by <code>tool_use_id</code>."
  }
},
{
  n: 6, domain: "ORCH", topic: "O3 · O5", sc: "S2", type: "single",
  stem: "A Meridian customer asks to have a replacement card sent to a new address they gave in the chat six turns ago. The coordinator delegates to the cards subagent, whose delegation prompt reads: &quot;Issue a replacement card for this customer and send it to the address they provided.&quot; The subagent's system prompt describes its role and its tools are <code>get_card</code>, <code>block_card</code> and <code>issue_replacement</code>. It issued the card to the address on file. What is the defect?",
  opts: {
    A: "The subagent's system prompt should state that a customer may supply a new delivery address during the conversation and that it takes precedence.",
    B: "The cards subagent is missing an address-lookup tool, which is what left it dependent on whatever address the card system already had stored.",
    C: "The delegation prompt referenced a value in a conversation the subagent cannot see, rather than packing the new address itself into the prompt.",
    D: "The coordinator should have asked the customer to confirm the new address a second time before delegating any work to the cards subagent."
  },
  correct: ["C"],
  rule: "A subagent starts with an empty context and sees only its system prompt, its tools and its delegation prompt. A delegation prompt must be a closure over the values the task needs, not a pointer into the coordinator's conversation. The system prompt carries the role; the delegation prompt carries the task's facts.",
  why: {
    A: "Wrong. A standing rule cannot supply a value the agent never received. It would correctly prefer an address it does not have.",
    B: "Wrong. A lookup tool returns the stored address — the very value that was wrong here. The new address existed only in the chat.",
    C: "Correct. &quot;The address they provided&quot; is a reference into history the subagent has no access to; the address string itself had to be in the delegation package.",
    D: "Wrong. Re-confirming with the customer changes nothing about what crosses the delegation boundary, and adds a turn the customer did not need."
  }
},
{
  n: 7, domain: "ORCH", topic: "O4 · O18", sc: "S1", type: "single",
  stem: "Halcyon's security review subagent is driven by a 40-step procedural prompt: read these six files, grep for these four patterns, check these call sites. It is fast, cheap and reproducible. Over six months its findings have dropped to near zero even as the codebase grew, and a real authorization bug shipped in a router that did not exist when the prompt was written. Platform engineering wants to keep the reproducibility. What should the review become?",
  opts: {
    A: "The same procedural prompt, regenerated automatically each month from the current routing table so that its step list can never go stale again.",
    B: "A goal-oriented brief with no output schema, so that the reviewer is free to report whatever categories of problem it judges to be relevant.",
    C: "A goal-oriented brief — find authorization regressions in the changed code — bounded by a read-only tool allowlist and a fixed finding schema.",
    D: "Two procedural prompts, one for the legacy routers and one for the newer routing layer, each maintained by the team that owns that area."
  },
  correct: ["C"],
  rule: "Procedural delegation is correct when steps are genuinely invariant; it goes stale wherever the search space moves. Control over a goal-oriented brief comes from the tool allowlist and the output contract — what it may touch and what it must return — not from scripting what it does.",
  why: {
    A: "Wrong. Regeneration keeps the list current with routes but still cannot look anywhere the generator did not think to point it. The blind spot is structural.",
    B: "Wrong. Dropping the schema throws away the control that made the procedural version valuable, and leaves the pipeline unable to gate on findings.",
    C: "Correct. The goal adapts to code the prompt has never seen, while the allowlist and the finding schema preserve the reproducibility and the machine-readable output.",
    D: "Wrong. Two staleness problems instead of one, plus a maintenance burden that scales with the number of areas rather than being eliminated."
  }
},
{
  n: 8, domain: "ORCH", topic: "O10 · O24", sc: "S1", type: "single",
  stem: "Halcyon's review runs as a single prompt asked to find security issues, business-logic errors and API-compatibility breaks. Measured against a labelled set of 90 known defects, it finds 71% of security issues when asked about security alone, but only 42% when asked about all three together. Recall on the other two categories shows the same pattern. The PR must still be gated on one combined verdict. What is the correct architecture?",
  opts: {
    A: "One prompt listing the three concerns in priority order, so that the reviewer allocates its attention to security first and to API compatibility last.",
    B: "Three specialised passes running concurrently, each with its own examples and tools, merged by a synthesis stage that de-duplicates and preserves attribution.",
    C: "Three specialised passes running one after another, each receiving the previous pass's findings so that later passes build on what is established.",
    D: "One prompt per pull-request size band, with the largest band given a substantially higher token budget and a longer list of things to check."
  },
  correct: ["B"],
  rule: "Competing criteria in one prompt produce a recall trade-off. Splitting into focused passes with their own few-shot examples restores per-concern recall; because the passes are independent they fan out in parallel, and a synthesis stage turns three finding sets into the one verdict the gate needs.",
  why: {
    A: "Wrong. Prioritising does not remove the competition, it just decides which concern loses. The measured recall drop applies to all three categories.",
    B: "Correct. Independent concerns, parallel execution, per-pass examples that also calibrate each pass's severity bar, and a merge that keeps findings attributable.",
    C: "Wrong. The passes have no data dependency, so sequencing them triples latency for nothing, and sharing findings re-imports the cross-contamination that caused the recall loss.",
    D: "Wrong. Size is not the variable. A small diff touching authorization and the public API has the same competing-concerns problem as a large one."
  }
},
{
  n: 9, domain: "ORCH", topic: "O5 · O33", sc: "S2", type: "single",
  stem: "Meridian's disputes subagent was given the full customer-service tool catalogue &quot;so it can handle whatever comes up&quot;. Over a month it issued 14 refunds itself rather than returning a recommendation to the coordinator, three of them above the $50 auto-approval limit. Its system prompt says it should recommend rather than act. Traces show the refunds were issued in situations where refunding genuinely looked like the helpful next step. What is the correct fix?",
  opts: {
    A: "Restate the recommend-do-not-act rule at both the beginning and the end of the disputes subagent's system prompt so that it is much harder to overlook.",
    B: "Add a validation step that reverses any refund the disputes subagent issued above the fifty dollar automatic approval limit for its tier.",
    C: "Remove the refund tool from the disputes subagent's allowlist, leaving execution with the coordinator, which owns the approval path.",
    D: "Move the disputes subagent onto a larger model, which is more likely to follow a standing instruction not to act directly."
  },
  correct: ["C"],
  rule: "Role boundaries are enforced by the tool allowlist, not by the system prompt. An agent that holds an action tool will eventually use it in a situation where using it looks correct. Tool distribution follows the output contract: an agent whose contract is a recommendation does not need an execution tool.",
  why: {
    A: "Wrong. Repetition strengthens an advisory instruction; it does not make it a control. The failures happened precisely where the action seemed reasonable.",
    B: "Wrong. Compensating after the fact means the money has already moved, the customer has already been told, and the approval requirement was still bypassed.",
    C: "Correct. Removing the capability removes the failure mode entirely, and it also narrows the decision space, which improves selection among the remaining tools.",
    D: "Wrong. A stronger model with an out-of-role tool is still an agent with an out-of-role tool. This substitutes a probability for a boundary."
  }
},
{
  n: 10, domain: "ORCH", topic: "O6 · O5", sc: "S1", type: "single",
  stem: "Halcyon added a test-authoring subagent at <code>.claude/agents/test-author.md</code> with <code>tools: Read, Grep, Glob, Write, Bash(npm test:*)</code> and a detailed system prompt. In practice the coordinator never delegates to it: it writes tests itself, inline, ignoring the fixture conventions the subagent's prompt describes. The file loads without error and the agent can be invoked by name manually, at which point it behaves exactly as intended. What is the defect?",
  opts: {
    A: "The subagent's <code>description</code> does not state the conditions under which it should be selected, so the coordinator has no routing signal for it.",
    B: "The subagent's <code>tools</code> list is missing an entry, and the coordinator silently declines to delegate to agents whose allowlist is incomplete.",
    C: "The file belongs in the user-level agents directory rather than the project directory, which is why automatic delegation never considers it.",
    D: "The parent session lacks the <code>Write</code> permission, so the coordinator cannot delegate any task that would require the subagent to create files."
  },
  correct: ["A"],
  rule: "A defined agent is not a called agent. Automatic delegation is driven by the <code>description</code> field, which must say when to use the agent, not merely what it is. Manual invocation working proves the definition, the tools and the permissions are all fine — which isolates the fault to discovery.",
  why: {
    A: "Correct. Manual invocation succeeding rules out every other cause, and the description is the only routing signal the coordinator has to match a task against.",
    B: "Wrong. An incomplete allowlist causes failures during execution, not a refusal to delegate, and manual runs would fail too.",
    C: "Wrong. Project-level agents are discoverable; that is the normal place for a repo-specific agent that the whole team shares.",
    D: "Wrong. A missing parent permission would break the manual invocation as well, since a subagent cannot exceed the session's own permissions."
  }
},
{
  n: 11, domain: "ORCH", topic: "O10 · O1 · O33", sc: "S6", type: "single",
  stem: "Vantage wants to cut the time to resolve a typical access request. Today one agent, holding all 31 tools, runs: knowledge-base search, then directory lookup, then account status, then asset lookup, then ticket creation. Directory lookup returns the user record that account status and asset lookup both need; the knowledge-base search is independent of everything. Ticket creation must happen last. What is the best structure?",
  opts: {
    A: "Fan out all five calls in a single parallel turn, and then have the agent reconcile any inconsistencies between the five sets of results that come back.",
    B: "Split into five subagents, one per tool, coordinated by a hub that passes each subagent's output along to whichever subagent needs it next.",
    C: "Batch the knowledge-base search with the directory lookup, then batch account status with asset lookup, then create the ticket, with a role-scoped tool set.",
    D: "Keep the sequence exactly as it is but move it onto a faster model, which reduces the per-call latency at every one of the five steps."
  },
  correct: ["C"],
  rule: "Read the dependency graph. Two calls are independent of everything, two depend on the directory record, one must come last. That yields three waves rather than five round trips. Scoping the tool set to the role reduces selection errors and stops paying for 31 schemas on every turn.",
  why: {
    A: "Wrong. Account status and asset lookup consume the directory record. Forcing them into the first wave makes the model invent a user identifier.",
    B: "Wrong. One subagent per tool is a distributed version of the same sequence: five round trips plus five delegation overheads, and no dependency has been removed.",
    C: "Correct. Three waves respect every dependency, remove two round trips, and the role-scoped allowlist addresses the separate cost and mis-selection problem.",
    D: "Wrong. It shaves each call without removing any of the four unnecessary round trips, and leaves the 31-tool catalogue untouched."
  }
},
{
  n: 12, domain: "ORCH", topic: "O18 · O19", sc: "S1", type: "multi",
  stem: "Halcyon's three review passes return free-form markdown. The synthesis stage must produce a JSON verdict the pipeline can gate on, and engineers must be able to see why any given finding was raised. Today synthesis re-reads all three markdown blobs, sometimes reports a finding twice under different wording, and occasionally reports a file that appears in no pass's output. Which TWO changes are correct?",
  opts: {
    A: "Have the synthesis stage call the repository tools itself to confirm each finding before deciding whether it belongs in the final gated verdict on the pull request.",
    B: "Ask each pass to write a longer and more detailed markdown summary, so that the synthesis stage has richer material from which to work.",
    C: "Give each pass a fixed output schema with per-finding file, line, severity, class and evidence references, plus explicit coverage and unresolved fields.",
    D: "Forbid synthesis from introducing any claim absent from pass output, and de-duplicate on structured identity rather than on wording similarity."
  },
  correct: ["C","D"],
  rule: "Structured worker output is what makes merging deterministic: de-duplication keys on file, line and class rather than on prose. Synthesis introduces nothing — a synthesis stage with its own tools is how findings appear that no pass produced. Coverage and unresolved fields are what distinguish clean from unexamined.",
  why: {
    A: "Wrong. Tools at the synthesis stage are exactly how claims enter a report without a pass behind them, which is one of the two symptoms described.",
    B: "Wrong. More prose makes both symptoms worse: more surface for restatement, and no additional structure on which to de-duplicate.",
    C: "Correct. A fixed schema makes the merge a code operation rather than a language one, and coverage plus unresolved fields prevent silence being read as an all-clear.",
    D: "Correct. The no-new-claims rule closes the fabrication path, and structured identity is what stops one defect being reported twice in two phrasings."
  }
},
{
  n: 13, domain: "ORCH", topic: "O9 · O7", sc: "S1", type: "single",
  stem: "Halcyon's review re-runs from scratch on every push. On a long-lived branch with 40 pushes, the same 300-file security pass ran 40 times and reported the same eight accepted findings each time. Platform engineering wants incremental reviews, but security requires that a finding is never missed because a previous run cached a stale conclusion. What design satisfies both?",
  opts: {
    A: "Cache the previous run's verdict for a fixed window of six hours, and re-run the complete review only once that caching window has expired.",
    B: "Review only the diff of the most recent push, since anything outside it was already reviewed by whichever run handled the push that introduced it.",
    C: "Keep the full re-run but suppress any finding that also appeared in the previous run, so that reviewers only ever see what is genuinely new.",
    D: "Persist per-file findings with a content fingerprint; on each push re-analyse files whose fingerprint changed or that are new, and reuse the rest."
  },
  correct: ["D"],
  rule: "Targeted re-analysis is the efficient and safe resume: reuse conclusions only where the input fingerprint is unchanged, re-run everything else. Time-based caching and diff-only review both make correctness a function of timing rather than of content.",
  why: {
    A: "Wrong. A six-hour window is unrelated to whether the code changed. It can serve a stale verdict minutes after a risky push, and re-run needlessly after none.",
    B: "Wrong. A finding can be introduced by the interaction of a new change with an untouched file, which a strict diff-only review never examines.",
    C: "Wrong. It suppresses output rather than avoiding work, and it hides genuine regressions that happen to resemble a previously reported finding.",
    D: "Correct. Fingerprints tie the cache to content, so unchanged files are skipped safely while any changed or new file is fully re-analysed."
  }
},
{
  n: 14, domain: "ORCH", topic: "O3 · O7 · O9", sc: "S2", type: "single",
  stem: "Meridian's coordinator dispatches a policy subagent to determine whether a disputed transaction qualifies for provisional credit. The policy subagent returns: &quot;Cannot determine — need to know whether the customer has had a prior provisional credit in the last 90 days.&quot; The coordinator has that fact; it was established at turn 4. It re-dispatches with the fact appended. Latency doubled and the pattern recurs across thousands of sessions. What is the systemic fix?",
  opts: {
    A: "Allow the policy subagent to query the coordinator mid-task whenever it discovers that it is missing a fact required to reach a determination.",
    B: "Move the policy determination back into the coordinator, since it already holds every fact that the determination turns out to require.",
    C: "Give the policy subagent read access to the coordinator's full conversation transcript so it can find any fact that it needs for itself.",
    D: "Build the delegation package from a structured state object of established facts, so the fields policy needs are packed before dispatch."
  },
  correct: ["D"],
  rule: "The delegation package must be complete on the first dispatch. A structured state object of established facts is what makes completeness systematic rather than a matter of whoever wrote that particular prompt remembering. Round-tripping and transcript sharing both defeat the isolation that delegation exists to provide.",
  why: {
    A: "Wrong. This normalises the round trip rather than removing it. Latency stays doubled and the coordinator's window fills with sub-conversations.",
    B: "Wrong. It dissolves the specialisation and pushes policy reasoning into the component that is already the busiest and most context-pressured.",
    C: "Wrong. Handing over the full transcript re-imports all the noise the subagent was isolated from, and costs the coordinator's entire history on every subagent turn.",
    D: "Correct. Pack values from a maintained state object, and the class of failure disappears for every subagent rather than being patched one prompt at a time."
  }
},
{
  n: 15, domain: "ORCH", topic: "O10 · O9", sc: "S4", type: "single",
  stem: "Atlas processes each document through four stages: classify layout, extract fields, validate against policy data, and enrich with broker metadata. Extraction needs the layout class; validation needs the extracted fields; enrichment needs only the broker identifier, which is known from the email envelope before any stage runs. Throughput is the constraint; the nightly backfill must finish in eight hours. What is the correct structure?",
  opts: {
    A: "A four-stage sequential pipeline, because each stage's output is what the next stage in the chain requires in order to be able to do its work.",
    B: "A pipeline of classify, extract and validate, with enrichment running concurrently from the start since it depends only on the envelope.",
    C: "Fan all four stages out in parallel and have a final reconciliation step resolve any conflicts between the outputs the four stages produced.",
    D: "A two-stage split where classification and extraction run together and validation and enrichment run together after both have completed."
  },
  correct: ["B"],
  rule: "Topology follows the dependency graph, and the graph must be read from the data, not from the order the stages were described in. Three stages form a genuine chain; the fourth has no upstream dependency at all and therefore has no reason to wait.",
  why: {
    A: "Wrong. It is true of three stages and false of the fourth. Enrichment waits for three stages whose output it never reads, which is pure serial latency.",
    B: "Correct. The real chain runs at its own pace while the independent stage runs alongside it, and the join happens once at the end.",
    C: "Wrong. Extraction without the layout class and validation without the fields are both guesswork, and reconciliation cannot recover information that was never available.",
    D: "Wrong. Pairing extraction with classification breaks the dependency between them, and it delays enrichment behind work it does not need."
  }
},
{
  n: 16, domain: "ORCH", topic: "O4 · O5 · O33", sc: "S3", type: "single",
  stem: "Northwind's investigators are defined with a shared system prompt and the full tool catalogue: web search, document store read, internal database query, a scratchpad writer, and an email tool used by another product. A run produced an investigator that emailed a summary to an external analyst distribution list. The team's proposed fix is a strongly worded line in the shared system prompt forbidding communication tools. Evaluate.",
  opts: {
    A: "Adequate, provided the line is placed at the very start of the shared system prompt where standing instructions are most reliably attended to.",
    B: "Adequate, because the investigators are read-only by design and the email tool was only ever included in the catalogue by an oversight.",
    C: "Inadequate: the email tool should stay available but be wrapped in a confirmation step that asks the operator before any message is actually sent.",
    D: "Inadequate: capability must be removed from the investigator allowlist, and the shared catalogue should be replaced by per-role tool sets."
  },
  correct: ["D"],
  rule: "A tool an agent holds is a tool an agent can call. Prompt-level prohibition is the weakest surface available and fails in exactly the situations where the action looks locally sensible. Tool distribution is per-role: each agent gets what its output contract requires and nothing else.",
  why: {
    A: "Wrong. Position strengthens an advisory instruction slightly; it does not convert it into a control, and a single lapse here sends real email to real people.",
    B: "Wrong. The design intent was read-only, but the configuration was not — and it is the configuration that decides what the agent can do.",
    C: "Wrong. A confirmation step puts a human in the loop of an action that should never have been offered, and does nothing about the other out-of-role tools.",
    D: "Correct. Remove the capability, and move from a shared catalogue to per-role allowlists so the same class of failure cannot recur with a different tool."
  }
},
{
  n: 17, domain: "CCW", topic: "O11 · O13", sc: "S1", type: "multi",
  stem: "Halcyon's review workflow step is <code>claude &quot;Review this PR&quot;</code> with an API key in the environment. On its first run the job consumed the full 60-minute runner timeout and produced no output; on a later run, after an engineer added a permission-skipping flag to stop the prompts, the reviewer rewrote three source files. Finance separately reports a four-figure spend for the month. Which TWO changes are required?",
  opts: {
    A: "Add <code>-p</code> so the CLI runs non-interactively, and <code>--output-format json</code> so the pipeline can gate on structured findings.",
    B: "Move the review to a self-hosted runner with a longer timeout, so a review needing more than sixty minutes is able to run to completion.",
    C: "Run the review only on pull requests changing more than fifty lines, which reduces the billable runs.",
    D: "Replace the permission-skipping flag with an explicit read-only allowlist such as <code>--allowedTools</code> with Read, Grep, Glob and a scoped git diff."
  },
  correct: ["A","D"],
  rule: "A CI invocation needs four things: non-interactive execution, machine-readable output, an explicit permission allowlist rather than a blanket bypass, and a runaway bound. The hang is the missing print flag; the rewrites are the bypass; the spend is an unbounded loop, which the allowlist and a turn limit together contain.",
  why: {
    A: "Correct. Without the print flag the CLI waits for an interactive session that never arrives, and prose output cannot be gated on by a later step.",
    B: "Wrong. The job did not need more time; it was waiting for input that would never come. A longer timeout buys a longer hang.",
    C: "Wrong. It reduces how often the broken configuration runs without fixing any of the three defects, and it stops reviewing small high-risk changes.",
    D: "Correct. Skipping permissions to silence prompts is what allowed the writes. The right answer to prompts in CI is a precise allowlist, not disabling the check."
  }
},
{
  n: 18, domain: "CCW", topic: "O8 · O13", sc: "S1", type: "single",
  stem: "Halcyon needs to migrate 60 API handlers from a deprecated authorization middleware to a new one. The change is mechanical but touches payments; the API is public, so a mistake is a customer-visible outage; and the platform lead has said she wants to see the approach before any file changes. An engineer proposes running Claude Code with edit permissions and reviewing the resulting PR. What is the correct architecture?",
  opts: {
    A: "Direct execution with edit permissions, followed by a careful human review of the resulting pull request before it is merged into the main branch.",
    B: "Plan mode first, so the approach is produced and approved as an artefact, then a multi-phase execution with per-area review passes.",
    C: "A multi-phase workflow that surveys, edits and reviews in three passes, with the platform lead reading the final report once all passes have finished.",
    D: "Direct execution one handler at a time, with the platform lead approving each of the sixty pull requests individually."
  },
  correct: ["B"],
  rule: "The approval requirement is decisive and comes first: a stakeholder who must see the approach before code moves is describing plan mode, whose value is the gate rather than the read-only tooling. Breadth and risk then argue for phased execution rather than one pass.",
  why: {
    A: "Wrong. Review after the fact is not approval before the change, and it puts the irreversible-in-practice work ahead of the decision that was meant to authorise it.",
    B: "Correct. Plan mode satisfies the approval boundary; multi-phase execution addresses the sixty-handler breadth and the payments risk profile.",
    C: "Wrong. Phases give coverage, not authority. The lead sees the approach only after every edit has been made, which is precisely what she asked to avoid.",
    D: "Wrong. Sixty approval events is ceremony, not governance: the lead never sees the overall approach, only sixty instances of it."
  }
},
{
  n: 19, domain: "CCW", topic: "O14 · O20", sc: "S5", type: "single",
  stem: "Corvus ships a <code>/dep-audit</code> slash command that reads the lockfile, runs an audit, cross-checks licences and returns a risk table. Engineers report that after running it twice in a long session, Claude's answers to unrelated questions start referencing packages and advisories, and the session hits compaction far sooner than usual. The command itself produces correct tables. What should change?",
  opts: {
    A: "Reduce the command's output to the ten highest-severity advisories, which keeps the returned table small enough not to disturb the session.",
    B: "Add <code>context: fork</code> to the command's frontmatter so each invocation runs in an isolated subagent context and returns only its table.",
    C: "Restrict the command with an <code>allowed-tools</code> list, since limiting what it can read is what limits how much enters the session context.",
    D: "Instruct the command in its body to forget the lockfile contents once it has finished producing the risk table for the engineer."
  },
  correct: ["B"],
  rule: "A skill or command normally executes in the current session, so everything it reads and every intermediate step stays in that conversation. Forking runs the invocation in an isolated context and returns only the result, which is exactly the fix when the work is wide and the useful output is narrow.",
  why: {
    A: "Wrong. The output was never the problem. The pollution comes from everything the command read on the way to producing it.",
    B: "Correct. Forking prevents both symptoms at once: the lockfile never enters the session, and run two does not inherit run one's exploration.",
    C: "Wrong. An allowlist bounds capability, not context. The command legitimately needs to read the lockfile; the question is where those tokens land.",
    D: "Wrong. There is no mechanism by which a model discards content already in its context. Isolation is structural; forgetting is not a thing you can request."
  }
},
{
  n: 20, domain: "CCW", topic: "O16 · O30", sc: "S1", type: "single",
  stem: "Halcyon's reviewer keeps reporting three things the team has decided are fine: direct <code>process.env</code> reads inside <code>config/*.ts</code>, snake_case column names in the ORM layer, and every finding in <code>packages/*/generated/</code>. An engineer has been pasting a &quot;please ignore these&quot; paragraph into the CI prompt string. Engineers running the review locally still see all three. What is the correct fix?",
  opts: {
    A: "Move the accepted patterns and exclusions into the repository's review standards so they load on every review, in CI and locally alike.",
    B: "Raise the reported severity threshold so that only high-severity findings appear, which removes all three of these categories from the output.",
    C: "Add a post-processing step in the workflow that filters the JSON findings against a list of the known-accepted patterns.",
    D: "Keep the paragraph in the CI prompt and document in the team wiki that engineers running locally should paste the same paragraph themselves."
  },
  correct: ["A"],
  rule: "False-positive suppression works only when it is persistent context applied on every review. Conventions, accepted patterns and exclusion criteria belong with the code they govern — in CLAUDE.md, a review skill, or path-scoped rules — so CI, local runs and every branch apply the same standard.",
  why: {
    A: "Correct. One source of truth, versioned with the code, applied identically wherever the review runs, and extensible as new accepted patterns emerge.",
    B: "Wrong. Thresholding keeps high-severity false positives and discards genuine medium findings; precision is unchanged and recall gets worse.",
    C: "Wrong. Filtering after the fact still pays for generating the findings, still shows them locally, and the filter list drifts from the standards it encodes.",
    D: "Wrong. A convention that depends on every engineer remembering to paste a paragraph is the definition of non-persistent context."
  }
},
{
  n: 21, domain: "CCW", topic: "O15 · O12", sc: "S1", type: "multi",
  stem: "Halcyon asked Claude Code to raise coverage on the payments module from 61% to 85%. Coverage now reads 86%. Reviewing the new suite: most tests construct a domain object inline, assert a getter returns the constructor argument, and mock the repository then assert the mock was called. Mutation testing shows the suite catches 12% of injected faults, down from 31%. Which TWO changes fix the generation?",
  opts: {
    A: "Provide two or three representative existing test files as context, and state the fixture conventions including where factories live and how time is frozen.",
    B: "Raise the coverage target to 95%, which forces the generator to reach the error paths, boundary conditions and edge cases that the current suite never touches.",
    C: "State the criterion that a meaningful test fails when behaviour changes and passes when only implementation changes, with trivial examples named.",
    D: "Ask for the tests to be regenerated with a substantially larger token budget so that each individual test can be written far more thoroughly."
  },
  correct: ["A","C"],
  rule: "Existing test files carry framework, idiom, fixture usage and the team's implicit standard more effectively than any description. An explicit quality criterion the model can apply replaces the unusable instruction to write good tests. Coverage is a diagnostic, never the objective — targeting it produces the cheapest possible coverage, which is exactly what happened here.",
  why: {
    A: "Correct. Real examples teach idiom and fixtures at once, which removes the inline-construction and bespoke-setup problems directly.",
    B: "Wrong. A higher coverage number is satisfied most cheaply by more trivial tests. The mutation score would very likely fall further.",
    C: "Correct. It is a criterion the model can actually evaluate against, and naming the trivial patterns tells it what to stop producing.",
    D: "Wrong. Length is not the deficiency. A longer test that asserts a getter returns its constructor argument is still a test that catches nothing."
  }
},
{
  n: 22, domain: "CCW", topic: "O16", sc: "S5", type: "single",
  stem: "Corvus has four requirements. (i) Security's list of never-read paths must hold on all 400 machines with no local override. (ii) React conventions should apply only when <code>.tsx</code> files are touched. (iii) The release runbook should be invocable by name when an engineer is cutting a release. (iv) The monorepo's build commands and architecture overview should always be available. Which mapping is correct?",
  opts: {
    A: "(i) a project settings deny list, (ii) a nested <code>CLAUDE.md</code> under React, (iii) a Skill, (iv) the root <code>CLAUDE.md</code>.",
    B: "(i) managed settings deny rules, (ii) <code>.claude/rules/</code> with <code>paths:</code>, (iii) a slash command, (iv) <code>CLAUDE.md</code>.",
    C: "(i) a <code>PreToolUse</code> hook that blocks reads, (ii) a Skill, (iii) <code>.claude/rules/</code>, (iv) a slash command.",
    D: "(i) managed settings deny rules, (ii) the root <code>CLAUDE.md</code>, (iii) <code>.claude/rules/</code>, (iv) a Skill invoked at session start."
  },
  correct: ["B"],
  rule: "Two questions decide every mapping: must it hold even if the model ignores it, and when is it relevant. A must-hold with no local override is managed settings; file-conditional guidance is path-scoped rules; an explicitly triggered workflow is a slash command; always-relevant project truth is CLAUDE.md.",
  why: {
    A: "Wrong on (i): project settings are user-editable, so a local file can shadow them, which is precisely what security ruled out.",
    B: "Correct. Each requirement lands on the surface whose enforcement strength and load timing match it, and the no-override constraint forces the managed layer specifically.",
    C: "Wrong on (i) and (iii). A blocking hook works but is the wrong surface for a static path list, and a runbook invoked by name is a command, not path-scoped rules.",
    D: "Wrong on (ii) and (iv). Putting React conventions in the root file makes all 400 engineers pay for them on every turn, which is the problem being solved."
  }
},
{
  n: 23, domain: "CCW", topic: "O32 · O17", sc: "S5", type: "single",
  stem: "A Corvus engineer asks Claude Code where a feature flag is evaluated. The session runs <code>Bash(&quot;find . -name '*.ts' | head -200&quot;)</code>, then reads eleven files in full, then reports it cannot find the evaluation and asks for a hint. The repository has 14,000 TypeScript files. The flag is named <code>checkout_v2_enabled</code> and appears in four places. What should the session have done?",
  opts: {
    A: "Read the feature-flag package's source first, since the evaluation logic for every flag in the monorepo is defined inside that package.",
    B: "Use Bash with a recursive grep, since shell tooling handles very large repositories far better than the built-in search tool does.",
    C: "Grep for the flag name to obtain file and line anchors, then read narrowly around those anchors rather than reading whole files.",
    D: "Glob for every file whose path contains checkout, then read each of the matches in turn until the evaluation site is located."
  },
  correct: ["C"],
  rule: "The funnel is Glob for structure, Grep for anchors, Read narrowly at the anchors, and Bash only for actions. Reading whole files to discover something is the standard context-exhaustion path; grep answers where in one call and turns a discovery problem into a read of a few known ranges.",
  why: {
    A: "Wrong. It assumes the answer's location, and the package defines the mechanism rather than the four call sites the engineer actually asked about.",
    B: "Wrong. Routing search through the shell bypasses the purpose-built tool and its output handling, and it was the shell find that started the problem here.",
    C: "Correct. A single grep on a distinctive literal produces exactly the anchors needed, after which the reads are small and targeted.",
    D: "Wrong. Path matching finds files named after a feature, not the place a flag is evaluated, and it ends in the same read-everything loop."
  }
},
{
  n: 24, domain: "CCW", topic: "O13 · O11", sc: "S1", type: "single",
  stem: "Halcyon wants the pipeline to fail when the review finds a high-severity security issue in changed lines, and to post everything else as a comment. The current step pipes the review's markdown into a comment and greps the text for the word &quot;critical&quot; to decide the exit code. Reviews that phrase a serious finding differently pass, and one review containing the word inside a code snippet failed the build. What is the correct design?",
  opts: {
    A: "Standardise the review prompt so that every high-severity finding is always described using the exact word critical in its opening sentence.",
    B: "Have the review emit a structured finding list with severity, file and line, and gate on a query over that structure rather than over prose.",
    C: "Grep for a longer list of severity synonyms, and exclude any match that falls inside a fenced code block within the review markdown output.",
    D: "Post the review as a comment and have a human decide whether the build should fail, since severity judgement is not reliably automatable."
  },
  correct: ["B"],
  rule: "If a downstream system consumes the review, the schema is the interface. Structure it with a tool schema or a JSON output format and query the structure; string matching on prose makes the gate a function of phrasing, and matches text that was never a finding.",
  why: {
    A: "Wrong. It makes the build depend on the model choosing one exact word, which is an advisory instruction guarding a hard gate.",
    B: "Correct. Severity, file and line as fields make the gate a deterministic query, immune to phrasing and to incidental matches in code samples.",
    C: "Wrong. A longer synonym list and a fence-exclusion rule are refinements to a fundamentally unreliable mechanism; the next phrasing still slips through.",
    D: "Wrong. It abandons the automation requirement. The judgement is being made by the reviewer already; the problem is only how it is transmitted."
  }
},
{
  n: 25, domain: "CCW", topic: "O14 · O16", sc: "S5", type: "single",
  stem: "Corvus has two new workflows. The first, <code>/changelog</code>, reads six months of git history and emits a release note. The second, <code>/explain-change</code>, describes the edit Claude has just made in the current session. An engineer adds <code>context: fork</code> to both frontmatter blocks for consistency. What is the outcome?",
  opts: {
    A: "The changelog command improves; the explain command breaks, because the edit it must describe exists only in the session context it no longer sees.",
    B: "Both improve: each one runs in a clean context, so neither is able to pollute the session with whatever material it happened to read while running.",
    C: "Both break: a forked context cannot invoke git tooling, so neither command can read the history or inspect the working tree it needs.",
    D: "Neither changes: forking affects only which permissions apply to the invocation, and both commands already had the same tool allowlist."
  },
  correct: ["A"],
  rule: "Fork when the work is wide and the result is narrow. A command whose entire purpose is to operate on the live conversation depends on the session state that forking deliberately withholds, and seeding a fork with the whole session would defeat the isolation.",
  why: {
    A: "Correct. Six months of history is the classic wide-in, narrow-out case; describing the edit just made is the classic case that needs the session.",
    B: "Wrong for the second command. Isolation is a cost as well as a benefit: what the fork cannot see, it cannot describe.",
    C: "Wrong. A forked context is a subagent context, not a sandbox without tooling; the tools it may use are governed by its allowlist.",
    D: "Wrong. The <code>context</code> option governs where the invocation executes; permissions are configured separately by the allowed-tools list."
  }
},
{
  n: 26, domain: "CCW", topic: "O12 · O30", sc: "S4", type: "single",
  stem: "Atlas reviewers correct extraction output in a shared queue. An engineer working on the invoice prompt sends Claude one correction at a time as reviewers file them: fifteen turns over an afternoon, each saying a version of &quot;this date is wrong, it should be X&quot;. The prompt now has fifteen date-handling clauses, contradicts itself on two brokers, and accuracy has not moved. What should the loop look like?",
  opts: {
    A: "Batch the fifteen corrections into one turn with concrete input and output pairs, so the shared cause can be identified and fixed once.",
    B: "Continue one correction per turn but require each turn to include the full prompt, so the model can see the clauses it has already added.",
    C: "Ask the model, after each correction, to rewrite the entire prompt from scratch so that contradictory clauses cannot accumulate over time.",
    D: "Route all date fields to human review permanently, since fifteen corrections is evidence that dates are not reliably extractable."
  },
  correct: ["A"],
  rule: "Corrections delivered one at a time invite local patches, and each turn also re-sends the whole conversation. Presenting failures together lets the shared cause emerge — here, almost certainly one regional-format rule rather than fifteen broker-specific clauses. Concrete input-output pairs make the target unambiguous.",
  why: {
    A: "Correct. Batching surfaces the pattern, and worked examples specify the rule far more precisely than fifteen prose corrections did.",
    B: "Wrong. It makes each turn more expensive without changing the incentive to patch locally, and the contradictions were introduced this way.",
    C: "Wrong. Rewriting from one correction discards the accumulated knowledge in the prompt and reintroduces regressions the earlier clauses fixed.",
    D: "Wrong. It concedes a field that a single normalisation rule and a null-plus-ambiguous status would handle, and it grows the queue that is already the bottleneck."
  }
},
{
  n: 27, domain: "CCW", topic: "O8 · O11", sc: "S5", type: "single",
  stem: "Corvus wants an agent that opens a pull request fixing any lint error introduced on a feature branch. Lint fixes are mechanical and fully revertible via git; nobody needs to approve them in advance; the job must not be able to touch anything outside the lint domain, and must not run away. Which configuration matches the requirements?",
  opts: {
    A: "Plan mode with a read-only allowlist, producing a plan that a reviewer then approves before a second job applies the mechanical lint fixes.",
    B: "Direct execution with permissions disabled so no prompt can block the job, plus a post-run script that reverts any file outside the lint domain.",
    C: "A multi-phase workflow that surveys the branch, plans the fixes, applies them and reviews the result before the pull request is opened.",
    D: "Direct execution with an edit-accepting permission mode, a tool allowlist scoped to the linter and file edits, and an explicit turn limit."
  },
  correct: ["D"],
  rule: "No approval requirement, small scope, cheap reversal: direct execution is correct, and adding ceremony costs more than the change. Safety comes from a scoped allowlist and a turn limit, not from disabling permission checks or from an approval gate nobody asked for.",
  why: {
    A: "Wrong. Plan mode's value is the approval boundary, and there is no approval requirement here. It doubles the job count for a revertible mechanical fix.",
    B: "Wrong. Disabling permissions to avoid prompts is the wrong answer in CI, and reverting after the fact is a weaker boundary than never granting the capability.",
    C: "Wrong. Four phases for a lint fix is ceremony; the concerns are not separable and nothing about the task is broad or multi-concern.",
    D: "Correct. It matches every stated constraint: it edits, it is bounded in scope by the allowlist, and it is bounded in cost by the turn limit."
  }
},
{
  n: 28, domain: "CCW", topic: "O24 · O30", sc: "S1", type: "single",
  stem: "Halcyon splits its review into security, business-logic and API-compatibility passes. To save maintenance, all three share one library of twelve few-shot examples drawn from past security incidents. Security recall improves markedly. API-compatibility recall does not, and the API pass now reports naming inconsistencies as high severity while missing an actual breaking change to a response field. What is the cause?",
  opts: {
    A: "The API pass needs more few-shot examples in total, because twelve examples is too small a sample from which to learn three separate review concerns.",
    B: "The three passes should run sequentially so that the API pass can see what the security pass already reported and avoid duplicating that work.",
    C: "The API pass is missing the tool access it needs to compare the current response schema against the version published in the previous release.",
    D: "The shared example set imports the security severity bar and the security notion of a finding into a pass whose categories and bar are different."
  },
  correct: ["D"],
  rule: "Few-shot examples calibrate the severity bar as much as the category. Each specialised pass needs its own examples, ideally including a look-alike that is deliberately not a finding, so the pass learns both what to report and how serious things are in its own domain.",
  why: {
    A: "Wrong. The number is not the issue. Twelve well-chosen API examples would work; twelve security examples will not, at any count.",
    B: "Wrong. The passes are independent; sequencing them adds latency and reintroduces the cross-contamination that splitting was meant to remove.",
    C: "Wrong. A missing comparison tool would prevent the pass from working at all, not cause it to mis-grade the findings it does produce.",
    D: "Correct. Shared examples teach the API pass to look for security-shaped problems and to grade severity on a security scale, which is exactly the pattern described."
  }
},
{
  n: 29, domain: "CCW", topic: "O13 · O16", sc: "S1", type: "multi",
  stem: "Halcyon's review standards live in three places: <code>CLAUDE.md</code> has general guidance, a Confluence page holds the payments-specific rules, and the workflow YAML contains a 200-line prompt with the API conventions. A PR touching only <code>src/payments/**</code> gets a review that applies API conventions and misses two payments rules. Which TWO changes address the root cause?",
  opts: {
    A: "Move the payments rules into <code>.claude/rules/</code> with a <code>paths:</code> pattern matching the payments tree so they load when it is touched.",
    B: "Paste the Confluence page into the workflow YAML prompt so that every review has the payments rules available to it regardless of what it touches.",
    C: "Reduce the workflow YAML to invocation and gating, moving the API conventions into the repository's configuration surfaces alongside the others.",
    D: "Have the reviewer fetch the Confluence page at the start of every run so the standards are always read from their canonical source."
  },
  correct: ["A","C"],
  rule: "Review standards belong in the repository's configuration surfaces, path-scoped so the right ones load for the files in play. Standards embedded in CI config drift from the code, cannot be path-scoped, and are invisible to engineers running the same review locally.",
  why: {
    A: "Correct. Path scoping is what makes a payments PR load payments rules and not the React or API conventions, which is the exact failure described.",
    B: "Wrong. It grows the always-on prompt, keeps the standards outside the repo, and still applies payments rules to reviews that have nothing to do with payments.",
    C: "Correct. Moving the conventions out of the YAML fixes both the drift and the invisibility, and lets them be scoped like everything else.",
    D: "Wrong. A network fetch at review time adds a dependency and a failure mode, and the page still cannot be path-scoped or versioned with the code."
  }
},
{
  n: 30, domain: "CCW", topic: "O11 · O2", sc: "S1", type: "single",
  stem: "Halcyon reuses one Claude Code session across the review jobs of every pull request on the runner, to avoid paying start-up cost repeatedly. Reviewers report findings that cite files not present in the PR under review, and occasionally a verdict that clearly refers to a different change. The team proposes clearing the session's conversation before each review. Evaluate.",
  opts: {
    A: "Correct in principle, and clearing history between reviews is sufficient because the tool definitions and permissions are what carry the real cost.",
    B: "Wrong: the real cause is context compaction dropping the current diff, so the fix is to disable automatic compaction on the review sessions.",
    C: "Wrong: each review must run in its own fresh session, since isolation is the property required and a cleared session is not a guarantee of it.",
    D: "Correct, and it should be combined with a larger context window so that a full review never comes close to the limit in the first place."
  },
  correct: ["C"],
  rule: "Every CI run should be a fresh session precisely so that review N+1 cannot inherit review N. Reuse is an optimisation that trades away the isolation property the job depends on; a manual clear is a procedure, and a procedure is not an isolation boundary.",
  why: {
    A: "Wrong. It substitutes a step that must be remembered and correctly implemented for a boundary that holds by construction.",
    B: "Wrong. Compaction drops old content; it does not import another pull request's files. The symptom points squarely at reuse.",
    C: "Correct. Fresh sessions make cross-contamination structurally impossible, and the start-up cost is trivial next to a wrong verdict on a public API change.",
    D: "Wrong. A larger window makes the contaminating history persist longer rather than removing it, and does nothing about the wrong-change verdicts."
  }
},
{
  n: 31, domain: "CCW", topic: "O15 · O31", sc: "S1", type: "single",
  stem: "Halcyon's test-authoring agent produces suites that compile and pass but that reviewers describe as noise. Asked to be stricter, the agent now also generates tests for generated protobuf accessors, for third-party library behaviour, and for a legacy module the team is deleting next sprint. Coverage keeps rising. What single change most improves the output?",
  opts: {
    A: "Increase the number of few-shot test examples supplied to the agent so that it has a broader sense of what a good test looks like in this codebase.",
    B: "Lower the coverage target so the agent has less pressure to reach into modules that do not really need any additional test coverage at all.",
    C: "Define explicit inclusion and exclusion boundaries: which modules are in scope, which are out, and what to do when a case falls near the boundary.",
    D: "Run the test author as a subagent with an isolated context so that its exploration does not contaminate the main development session."
  },
  correct: ["C"],
  rule: "Models are cooperative: asked for more, they produce more, including in categories where the output has no value. Explicit inclusion and exclusion criteria — with a stated tie-breaker for the ambiguous case — are what bound generation. Examples teach quality; boundaries teach scope.",
  why: {
    A: "Wrong. Better examples improve the tests it writes; they do not stop it writing tests for things that should not be tested at all.",
    B: "Wrong. A lower target reduces the volume of misdirected output without changing where it is directed, and coverage was never the quality signal.",
    C: "Correct. Generated code, third-party behaviour and a module being deleted are all scope problems, and only an explicit boundary rules them out.",
    D: "Wrong. Isolation is a context-management fix. It changes where the work happens, not what the agent decides is in scope."
  }
},
{
  n: 32, domain: "CCW", topic: "O17 · O20", sc: "S5", type: "single",
  stem: "A Corvus engineer asks Claude Code to document how authentication flows through the monorepo. The session greps well, reads narrowly, and after 90 minutes has traced the flow through nine services. Then the context compacts, and the next answer contradicts a conclusion the session reached an hour earlier. The engineer asks it to continue tomorrow. What should the session have been doing throughout?",
  opts: {
    A: "Writing each conclusion with its file and line provenance to a scratchpad file as it was reached, and re-reading that file when work resumes.",
    B: "Holding each conclusion in the conversation and re-stating the accumulated summary at the end of every turn so that it survives any later compaction.",
    C: "Delegating each service to a separate subagent, so that no single context ever had to hold more than one service's worth of material.",
    D: "Requesting a larger context window at the outset, sized so that a ninety-minute exploration of nine services never triggers compaction."
  },
  correct: ["A"],
  rule: "Scratchpads solve durability: conclusions must live somewhere that survives compaction, session end and process death. Isolation and targeted reads reduce what enters context; only an external record makes findings outlive the window. Write findings as they are made, because the end is when compaction has already happened.",
  why: {
    A: "Correct. It survives compaction and the overnight gap, carries provenance so the resumed session can verify rather than trust, and makes tomorrow a resumption.",
    B: "Wrong. Restating grows the very context that is being compacted, and it is the earliest conclusions — the ones restated most often — that get evicted first.",
    C: "Wrong. Isolation would have helped with breadth, but nine subagent summaries in one coordinator context still compact, and nothing is written down.",
    D: "Wrong. A bigger window postpones compaction without surviving the session boundary, and the engineer explicitly wants to continue the next day."
  }
},
{
  n: 33, domain: "CCW", topic: "O8 · O12", sc: "S4", type: "single",
  stem: "Atlas wants to change the extraction prompt for medical reports, a change that will alter how 40,000 documents per month are parsed and that feeds a system which pays claims. The data science lead wants to see the proposed prompt and the expected behaviour change before anything is deployed. An engineer suggests iterating directly against production traffic and watching the accuracy dashboard. Evaluate.",
  opts: {
    A: "Wrong architecture: the approval requirement calls for a plan-and-approve gate, with iteration against a held-out labelled set rather than live claims.",
    B: "Reasonable, provided the change is rolled out to a small percentage of traffic first so the dashboard can show the effect before full deployment.",
    C: "Reasonable, because the accuracy dashboard is the only measurement that reflects the real distribution of documents the pipeline receives in production.",
    D: "Wrong architecture: the change should be split into forty smaller prompt edits, each deployed and measured separately over the following weeks."
  },
  correct: ["A"],
  rule: "A stated requirement that a stakeholder sees the approach before anything changes is a plan-mode requirement, and it dominates efficiency arguments. Iterative refinement then belongs against a labelled evaluation set with concrete input-output pairs, not against traffic that pays money on every mistake.",
  why: {
    A: "Correct. It honours the approval boundary and moves the refinement loop somewhere the failures are labelled, cheap and reproducible.",
    B: "Wrong. A percentage rollout is still deployment before approval, and the dashboard cannot separate a prompt regression from a change in the document mix.",
    C: "Wrong. Real distribution is an argument for evaluating on sampled real documents, not for experimenting on live claims payments.",
    D: "Wrong. Forty deployments is forty unapproved changes, and it makes attribution harder rather than easier because the effects overlap."
  }
},
{
  n: 34, domain: "CCW", topic: "O11 · O13 · O31", sc: "S1", type: "single",
  stem: "Halcyon's review is now non-interactive, emits JSON, and is scoped to read-only tools. It still produces 30 to 50 findings per pull request, of which engineers act on two or three. Sampling shows most findings are real but irrelevant: style observations, suggestions about untouched code, and speculative concerns without a demonstrated path. The pipeline gates on high-severity findings only. What is the most effective change?",
  opts: {
    A: "Define inclusion criteria naming the reportable categories, exclusions covering style and untouched code, and require a demonstrated path per finding.",
    B: "Gate on medium severity as well as high, which gives engineers a stronger reason to read and act on the findings the reviewer produces on each pull request.",
    C: "Cap the reviewer at the ten findings it considers most important, so that the volume engineers face on each pull request stays manageable.",
    D: "Run the reviewer on a stronger model, which produces fewer speculative findings and is better at judging what is worth reporting to a team."
  },
  correct: ["A"],
  rule: "Volume is a scope problem, not a threshold or a model problem. Explicit inclusion and exclusion boundaries, plus a bar such as a demonstrated exploit or failure path, remove whole categories where precision is poor rather than hiding output that was never worth producing.",
  why: {
    A: "Correct. It removes the three categories the sampling identified, and the demonstrated-path requirement is what kills the speculative findings specifically.",
    B: "Wrong. It increases the number of things that block a merge without improving the proportion that matter; engineers disengage faster, not slower.",
    C: "Wrong. Truncating to ten keeps the same precision and silently discards findings, so a genuine issue can be cut in favour of a style observation.",
    D: "Wrong. A stronger model asked for all findings still reports style and untouched code, because nothing has told it those are out of scope."
  }
},
{
  n: 35, domain: "CTX", topic: "O21 · O20", sc: "S2", type: "single",
  stem: "A Meridian session runs 40 turns. At turn 6 the customer said they cannot receive SMS and refuse phone contact. At turn 34, after compaction, the agent offers to send a one-time code by SMS. The team's context policy keeps the last 15 turns verbatim and drops everything older. Compliance treats contact-preference breaches as reportable. What is the correct fix?",
  opts: {
    A: "Extend the sliding window from fifteen turns to thirty-five, which is long enough to cover the great majority of the sessions that Meridian actually sees.",
    B: "Summarise the dropped turns into a paragraph appended to the end of the conversation so no information from early turns is entirely lost.",
    C: "Have the agent re-read the full transcript from storage at every turn and restate any constraints that it finds before composing a reply.",
    D: "Maintain a structured state object holding constraints and established facts outside the transcript, and re-inject it near the start of every request."
  },
  correct: ["D"],
  rule: "A recency policy evicts exactly the content whose loss is most damaging, because constraints and commitments are established early. A structured state object keeps them outside the transcript at full fidelity, and re-injecting near the start of the request puts them where attention is strongest.",
  why: {
    A: "Wrong. It moves the cliff to turn 50. Any pure recency policy will eventually drop a turn-6 constraint from a long session.",
    B: "Wrong. Summarisation is lossy by construction, and appending at the end buries the constraint in the least-attended position.",
    C: "Wrong. Re-reading the full transcript every turn is the cost problem compaction exists to solve, and it scales with session length.",
    D: "Correct. Constraints are held losslessly, independent of turn count, and position at the start of the request is what keeps them attended to."
  }
},
{
  n: 36, domain: "CTX", topic: "O22", sc: "S4", type: "multi",
  stem: "Atlas routes 8% of extractions to human review by random sampling. Reviewers report the queue is mostly correct documents, while adjudication keeps finding errors in fields that were never reviewed. Analysis shows errors concentrate in three places: a new broker's unfamiliar layout, the <code>claimed_amount</code> field on scanned faxes, and dates from brokers whose region is not recorded. Which TWO changes should be made?",
  opts: {
    A: "Route on per-field confidence with thresholds set from the cost of that field being wrong, so a low-confidence amount is reviewed and a low-confidence note is not.",
    B: "Route on document characteristics — unseen layout, poor scan quality, unknown broker — which predict error before extraction has even been attempted.",
    C: "Raise the random sample from eight percent to twenty-five percent, which triples the chance that any given erroneous extraction is seen by a reviewer first.",
    D: "Route every document from the new broker to review permanently, since an unfamiliar layout is not something that extraction can be trusted to handle."
  },
  correct: ["A","B"],
  rule: "Routing must be driven by signal: per-field confidence with per-field thresholds, document characteristics that predict difficulty, and genuine field-level ambiguity. Random sampling measures the error rate of the unreviewed population and should continue at a small rate — but it is a calibration instrument, not a routing mechanism.",
  why: {
    A: "Correct. Field-level thresholds catch the single bad field in an otherwise good document, which document-level scores hide, and align effort with consequence.",
    B: "Correct. Layout, scan quality and unknown vendor are exactly the characteristics the objective names, and they predict error in advance.",
    C: "Wrong. Tripling a random sample triples cost for a linear improvement in coverage and still selects mostly correct documents.",
    D: "Wrong. A permanent blanket route abandons the field rather than measuring it; the correct treatment is a high routing weight that decays as the layout becomes known."
  }
},
{
  n: 37, domain: "CTX", topic: "O23 · O22", sc: "S4", type: "single",
  stem: "Atlas has two workloads: the nightly backfill of 2.1 million archived documents, and the live path where an adjuster waits on screen for a claim to be parsed. An architect proposes moving both to the Message Batches API for the 50% saving, arguing that the batch window is usually only a few minutes in practice. Evaluate.",
  opts: {
    A: "Correct for both, since the observed batch turnaround is short and the saving on 2.1 million documents is large enough to justify a little latency.",
    B: "Correct for the backfill only; the live path must stay synchronous, because the processing window is a guarantee measured in hours, not minutes.",
    C: "Incorrect for both, because batch processing does not support the schema-enforced structured output that the extraction pipeline depends upon.",
    D: "Correct for the live path only, since batching smooths the latency spikes an adjuster experiences when many claims arrive at the same time."
  },
  correct: ["B"],
  rule: "The question is whether anything is waiting. A person on a screen means synchronous, always. Nothing waiting and the work tolerating a long window means batch, for the discount. Mixed workloads split; observed averages are not a guarantee, and the guarantee is what a waiting adjuster depends on.",
  why: {
    A: "Wrong. Designing a human-facing path around an observed average rather than the stated window is how a busy night becomes an outage.",
    B: "Correct. It takes the discount exactly where latency is free and leaves the interactive path on the mode that bounds it.",
    C: "Wrong. Batch requests carry the same request shape, including tools and schemas; the difference is when results are available, not what they contain.",
    D: "Wrong. It is precisely backwards: batching adds latency to the interactive path and would make spikes far worse for the adjuster."
  }
},
{
  n: 38, domain: "CTX", topic: "O2 · O9", sc: "S3", type: "single",
  stem: "Northwind wants to resume an interrupted run rather than restart it. An engineer implements resumption by reloading the last checkpoint and marking every task recorded as done as complete. In testing, a resumed run reported a competitor's pricing that had been superseded two hours earlier, because the source page had been updated between the checkpoint and the resume. What is missing?",
  opts: {
    A: "A shorter checkpoint interval, so that the window in which a source can change between checkpoint and resume is as small as it can be made.",
    B: "A rule that any resumed run must discard all cached findings and re-run the tasks, since a checkpoint can never be known to still be valid.",
    C: "A timestamp on each finding, displayed in the report so that the analyst reading it can judge whether it is still current.",
    D: "An input fingerprint recorded per task, compared on resume so that tasks whose sources have changed are re-run rather than trusted."
  },
  correct: ["D"],
  rule: "Resumption must be explicit about staleness. Fingerprints are not an optimisation, they are what makes restored state true: unchanged inputs keep their cached output, changed inputs are re-analysed, and never-run tasks are run.",
  why: {
    A: "Wrong. It narrows the window without closing it, and a run interrupted for two hours has a two-hour window regardless of checkpoint frequency.",
    B: "Wrong. That is a restart with extra steps, and it abandons the requirement not to repeat completed work.",
    C: "Wrong. It moves the correctness problem to the reader, who has no way to know whether the source changed after the timestamp.",
    D: "Correct. Comparing fingerprints turns a blind cache into targeted re-analysis, which is exactly what distinguishes resumption from restarting."
  }
},
{
  n: 39, domain: "CTX", topic: "O20 · O10", sc: "S5", type: "single",
  stem: "A Corvus engineer needs to know which of 340 API handlers still call a deprecated helper, and what each would need in order to migrate. Doing this inline consumes the session's context within 60 handlers and the answers degrade. The engineer wants the full answer plus a per-handler migration note, and wants to keep working in the same session afterwards. What is the correct approach?",
  opts: {
    A: "Read the handlers in batches of twenty, summarising after each batch, and continue in the same session until all 340 have been covered.",
    B: "Increase the session's context window so that all 340 handlers and the code surrounding them fit without the answers degrading part way through.",
    C: "Delegate the sweep to a subagent whose delegation prompt names the helper and the return schema, and which returns only the per-handler table.",
    D: "Ask the engineer to narrow the question to the twenty handlers that are most likely to still be calling the deprecated helper function."
  },
  correct: ["C"],
  rule: "Subagent isolation exists for exactly this shape: a wide read whose useful output is narrow. The subagent absorbs 340 files in its own context and returns a table; the main session pays for the table only, and stays usable for the work that follows.",
  why: {
    A: "Wrong. Seventeen summarisation steps in the same session still accumulate, and each summary is lossy — the degradation is deferred, not avoided.",
    B: "Wrong. A bigger window degrades attention over very long inputs, costs more on every subsequent turn, and leaves the session full afterwards.",
    C: "Correct. The material never enters the main session, the return contract keeps the answer machine-usable, and the engineer's session survives intact.",
    D: "Wrong. It answers a different, smaller question and gives no basis for believing the other 320 are clean."
  }
},
{
  n: 40, domain: "CTX", topic: "O21 · O2", sc: "S6", type: "single",
  stem: "Vantage agents handle multi-day tickets. A ticket reopened after four days resumes with the last 20 turns re-injected verbatim. The agent re-ran three diagnostics that had already been run, contradicted an earlier decision to replace the laptop rather than repair it, and asked the user to repeat information they had given on day one. Which change most directly addresses all three symptoms?",
  opts: {
    A: "Re-inject the last sixty turns rather than the last twenty, so that material from the earlier days of the ticket is present in the resumed session too.",
    B: "Re-inject a structured state object holding established facts, decisions with their reasons, and completed diagnostics, in place of raw recent turns.",
    C: "Have the agent summarise the ticket at the end of each day, and re-inject that summary alongside the twenty most recent conversational turns.",
    D: "Store the full transcript and have the agent search it whenever it is unsure whether something has already been done during the ticket."
  },
  correct: ["B"],
  rule: "The three symptoms are one failure: the resumed session holds recent conversation instead of accumulated state. A structured state object carries facts, decisions with reasons, and completed work at full fidelity, independent of how many turns ago they happened.",
  why: {
    A: "Wrong. It triples the injected tokens and still uses recency as the selection rule, so day-one facts drop out again on a longer ticket.",
    B: "Correct. Completed diagnostics stop re-running, the recorded decision and its reason prevent the contradiction, and established facts stop the repeated questions.",
    C: "Wrong. A daily prose summary is lossy about exactly the specifics involved — which diagnostics ran, what was decided and why.",
    D: "Wrong. It depends on the agent knowing to be unsure, which is the thing that failed; it also pays a search on every uncertain moment."
  }
},
{
  n: 41, domain: "CTX", topic: "O20 · O21", sc: "S3", type: "single",
  stem: "Northwind investigators write everything they read into a shared scratchpad file so nothing is lost. The file is now 400KB. Investigators re-read it at the start of each task, which now consumes a third of their context before any work begins, and the synthesis agent has started citing raw source text from it as though it were a finding. What is wrong with the scratchpad design?",
  opts: {
    A: "The scratchpad should be split into one file per investigator, so that each agent re-reads only the material it wrote during its own tasks.",
    B: "The scratchpad should be summarised automatically whenever it exceeds a size threshold, so that re-reading it stays affordable for investigators.",
    C: "Investigators should not re-read the scratchpad at all, since the coordinator can pass anything relevant in each delegation prompt instead.",
    D: "It stores raw material rather than conclusions with provenance, so it grew without bound and blurred the line between a source and a finding."
  },
  correct: ["D"],
  rule: "A scratchpad holds conclusions with provenance, not raw dumps. Written as findings are made, in a stable structure, it stays small, stays re-readable, and keeps a clear boundary between what a source said and what an investigator concluded from it.",
  why: {
    A: "Wrong. Per-agent files shard the growth without stopping it, and they break the cross-investigator visibility the shared file was for.",
    B: "Wrong. Summarising a dump of raw sources loses specifics unpredictably and still leaves source text indistinguishable from conclusions.",
    C: "Wrong. Delegation packages carry what the coordinator knows; the scratchpad exists for findings that accumulate across tasks and outlive any one context.",
    D: "Correct. Both symptoms follow from storing sources rather than conclusions: unbounded growth, and material that reads like a finding to the synthesiser."
  }
},
{
  n: 42, domain: "CTX", topic: "O22 · O29", sc: "S4", type: "single",
  stem: "Atlas reports extraction accuracy as one figure: 94.2%. Adjudication has just paid out on a claim where <code>claimed_amount</code> was extracted as 1,200 instead of 12,000. Investigation shows amounts on faxed documents run at 71% accuracy while amounts on native PDFs run at 99.1%, and that the aggregate has been stable for months. What is the primary reporting defect?",
  opts: {
    A: "The accuracy figure is computed on far too small a sample, which is why a systematic failure on one document channel has not yet shown up in it.",
    B: "Accuracy is the wrong metric entirely, and the pipeline should report precision and recall separately for every single field that the extraction schema defines.",
    C: "Aggregate accuracy hides per-field and per-channel variation, so a field failing badly on one input class is invisible and thresholds cannot be set per field.",
    D: "The 94.2% figure is simply too low for a system that pays claims, regardless of how the underlying variation happens to be distributed across channels."
  },
  correct: ["C"],
  rule: "A single aggregate is the wrong instrument for a routing decision. Accuracy must be reported per field and per document characteristic, because that is the granularity at which review thresholds are set and at which a failing segment becomes visible.",
  why: {
    A: "Wrong. Sample size is not the issue; the figure is stable and correct. It is averaging over segments that behave completely differently.",
    B: "Wrong. Precision and recall are useful additions but change nothing if they are still reported as one number across every field and channel.",
    C: "Correct. Per-field, per-channel reporting is what surfaces a 71% segment and what lets a threshold be set on the field that pays money.",
    D: "Wrong. It judges the number without addressing why the number cannot be acted on, and 99.1% on the dominant channel is not the problem."
  }
},
{
  n: 43, domain: "PESO", topic: "O26 · O29", sc: "S4", type: "single",
  stem: "Atlas's medical-report schema declares <code>referring_physician</code> as a required string. Reviewers find that on reports where no referring physician exists, the pipeline returns a plausible name — sometimes the treating physician, sometimes a name that appears nowhere in the document. The prompt already says not to guess. Which change fixes the class of failure?",
  opts: {
    A: "Change the type to allow null while keeping the key required, and describe the null semantics in the field's own description.",
    B: "Strengthen the instruction to a categorical statement that under no circumstances should a value be produced that is not in the document.",
    C: "Add a validation step that rejects any extracted physician name which does not also appear somewhere in the document's raw text.",
    D: "Reduce the temperature to zero for medical reports, which removes the sampling variation that produces the invented names."
  },
  correct: ["A"],
  rule: "A schema that cannot express absence forces fabrication: a required non-nullable string leaves no legal way to say the field is not there. Required-but-nullable is the preferred form because consumers always find the key and only test for null, and the per-field null rate becomes measurable.",
  why: {
    A: "Correct. It makes absence expressible, keeps the key present for consumers, and the description is where null semantics travel with the field.",
    B: "Wrong. The instruction and the schema are in direct conflict, and the schema wins. No wording resolves a contradiction the structure creates.",
    C: "Wrong. It catches the subset that is fully invented and passes the more dangerous case where the treating physician's real name is misassigned.",
    D: "Wrong. Temperature affects variability, not the requirement to emit a string. At zero it will invent the same name every time."
  }
},
{
  n: 44, domain: "PESO", topic: "O25 · O27", sc: "S1", type: "single",
  stem: "Halcyon's review must emit findings the pipeline can gate on. The current implementation asks in the prompt for a JSON array and parses the reply. It works for most reviews, but roughly one in thirty responses wraps the array in prose, uses a trailing comma, or emits an explanatory paragraph first, and the gating step then throws. What is the correct implementation?",
  opts: {
    A: "Wrap the parser in a retry that re-prompts for valid JSON whenever parsing fails, and fall back to posting the review as a plain comment.",
    B: "Define the finding list as a tool input schema and force the call with <code>tool_choice</code> naming that tool, so shape and invocation are both guaranteed.",
    C: "Prefill the assistant response with an opening bracket so that the model has already committed to emitting a JSON array before it produces any prose.",
    D: "Add three worked examples of correctly formatted output to the prompt, which raises formatting compliance well above the current rate."
  },
  correct: ["B"],
  rule: "Strictness requirement decides the method. When a downstream system breaks on malformed output, prose instructions are the wrong surface. Tool use with a JSON schema enforces the shape, and forcing that specific tool guarantees the call happens rather than a text reply.",
  why: {
    A: "Wrong. It builds a retry loop around a preventable failure and degrades to an ungated comment, which is the outcome the gate exists to prevent.",
    B: "Correct. The schema constrains the arguments structurally, and naming the tool removes the possibility of a conversational answer instead.",
    C: "Wrong. A prefill constrains the opening, not the whole structure. Trailing commas and truncated arrays still get through.",
    D: "Wrong. Examples raise compliance without guaranteeing it, and a one-in-thirty failure on a merge gate is still a broken gate."
  }
},
{
  n: 45, domain: "PESO", topic: "O28 · O25", sc: "S1", type: "single",
  stem: "Halcyon's security pass on a 120-file pull request returns <code>stop_reason: max_tokens</code> with the finding array cut off mid-object. An engineer raises <code>max_tokens</code> from 4,096 to 16,384. It works for two weeks, then a 300-file refactor truncates again, and reviewers note the later findings in the long responses are noticeably weaker than the early ones. What is the correct fix?",
  opts: {
    A: "Raise <code>max_tokens</code> to the model's maximum, and add a monitor that alerts whenever any review response comes within ten percent of that ceiling.",
    B: "Ask the model to return only the ten most severe findings it has identified, which keeps every response comfortably inside the existing token budget.",
    C: "Have the model continue the truncated response in a follow-up turn, and concatenate the two fragments before the JSON is parsed.",
    D: "Split the review into scoped calls of a bounded number of files each, run them concurrently, and merge the resulting finding structures in code."
  },
  correct: ["D"],
  rule: "Truncation is a scoping problem, not a budget problem. Raising the ceiling buys headroom until the next larger input and degrades quality across a very long generation. Splitting into scoped calls and merging in code also buys parallelism and ties each finding to the scope that produced it.",
  why: {
    A: "Wrong. It postpones the same failure and does nothing about the quality degradation the engineer has already observed in long responses.",
    B: "Wrong. Severity is judged per response, so ten from a truncated view is not the ten most severe in the pull request. Findings are silently lost.",
    C: "Wrong. Stitching fragments is brittle and the continuation is generated with the same degraded attention that weakened the first response's tail.",
    D: "Correct. Bounded scopes keep every response short and high quality, the calls are independent so they fan out, and the merge is deterministic."
  }
},
{
  n: 46, domain: "PESO", topic: "O26 · O31", sc: "S4", type: "single",
  stem: "Atlas's <code>document_type</code> enum lists five values. Two problems appear together: unusual documents are being classified as the nearest listed type, and illegible scans are also being assigned a type with apparent confidence. The team proposes adding a single catch-all member. Evaluate.",
  opts: {
    A: "Insufficient: two escape members are needed, because a type outside the list and a document that cannot be read diagnose different problems.",
    B: "Sufficient: one catch-all absorbs both cases, and the reviewers can distinguish an unusual document from an illegible one when they see it.",
    C: "Insufficient: the enum should be removed entirely so the model can name whatever type it observes rather than being forced into a fixed list.",
    D: "Sufficient, provided a confidence score is emitted alongside the type so that low-confidence classifications can be routed for review."
  },
  correct: ["A"],
  rule: "Escape members must separate signals that drive different fixes. A rising rate of a real-but-unlisted type tells you to extend the enum; a rising rate of unreadable documents tells you about scan quality or intake. One catch-all collapses two metrics into one and hides both.",
  why: {
    A: "Correct. Separate members keep the two rates independently observable, and each rate points at a specific and different remediation.",
    B: "Wrong. It shifts diagnosis onto the review queue and destroys the metric: a single rate cannot tell you which of two very different problems is growing.",
    C: "Wrong. A free-form string loses the enumerable classification the downstream router depends on, and invites unbounded label drift.",
    D: "Wrong. A confidence score is a useful addition but it does not distinguish an unlisted type from an unreadable page — both simply score low."
  }
},
{
  n: 47, domain: "PESO", topic: "O29", sc: "S4", type: "single",
  stem: "Atlas gets 99% accuracy on invoice totals from one broker and 62% from a second whose invoice puts the total in a bottom-right box beneath a summary table, with a subtotal in the position the first broker uses for the total. The prompt is shared. Adding a sentence describing the second layout raised the second broker to 70% and dropped the first to 94%. What is the correct approach?",
  opts: {
    A: "Continue refining the shared prompt with more layout descriptions until it reaches an acceptable accuracy on both brokers simultaneously.",
    B: "Classify the layout first and route to a layout-specific prompt carrying that layout's own few-shot examples of a correctly read total.",
    C: "Add a validation rule that flags any extracted total which is smaller than the sum of the line items on the same invoice document.",
    D: "Route the second broker's invoices to human review, since a layout that inverts the position of subtotal and total is inherently ambiguous."
  },
  correct: ["B"],
  rule: "One prompt tuned to work everywhere degrades everywhere: layout instructions for one vendor are noise for another, and the observed trade-off is the signature. Classify first, then route to a layout-specific prompt whose few-shot examples show a correct read for that layout.",
  why: {
    A: "Wrong. The measured result already shows the trade-off. Each added layout description makes the prompt longer and every other layout slightly worse.",
    B: "Correct. Each prompt sees only relevant instructions and relevant examples, so accuracy on one layout stops being paid for out of another.",
    C: "Wrong. A useful safety net, but it detects a subset of errors after extraction and does nothing about the misread itself.",
    D: "Wrong. The layout is unambiguous once known; it is only ambiguous to a prompt that was written for a different one. This grows the bottleneck queue."
  }
},
{
  n: 48, domain: "PESO", topic: "O27 · O37", sc: "S2", type: "single",
  stem: "Meridian must classify every inbound message into one of nine intents before routing. Today the model replies in prose and a regular expression maps the reply to an intent; unmatched replies default to <code>general_enquiry</code>, which now accounts for 18% of traffic. The routing system cannot accept a tenth value. What is the correct configuration?",
  opts: {
    A: "Set <code>tool_choice</code> to <code>any</code> with the classifier as one of the available tools, and keep the regular expression as a fallback path.",
    B: "Prefill the assistant turn with the opening of a JSON object so the model commits to structured output before it can produce any prose.",
    C: "Force the classification tool by name with the nine intents as an enum in its input schema and strict validation enabled on the call.",
    D: "Keep the prose reply but supply nine worked examples in the prompt so that the regular expression matches a far higher share of replies."
  },
  correct: ["C"],
  rule: "Exactly one correct tool and a closed value set: force that tool by name and put the value set in the schema as an enum. Forcing the call removes the possibility of a text answer; the enum removes the possibility of a tenth value; strict validation removes malformed arguments.",
  why: {
    A: "Wrong. <code>any</code> guarantees some tool is called but not which one, and retaining the regular expression keeps the failure path that produced the 18%.",
    B: "Wrong. A prefill nudges format without constraining the value set, so a tenth intent can still be emitted in perfectly valid JSON.",
    C: "Correct. All three guarantees are structural — the call happens, the value is one of nine, and the arguments validate before your code sees them.",
    D: "Wrong. Better examples raise the match rate on an inherently unreliable mechanism and never close the gap to a hard routing requirement."
  }
},
{
  n: 49, domain: "PESO", topic: "O31 · O30", sc: "S3", type: "single",
  stem: "Northwind investigators are asked to report anything relevant to the research question. A run on a competitor's supply chain returned findings about the competitor's brand refresh, a speculative claim about an unannounced acquisition sourced from a forum post, and a correct observation about a shipping partner. The analyst wants the third and none of the others. What should change in the investigator prompt?",
  opts: {
    A: "Add a confidence field to the finding schema and instruct investigators to report only those findings scoring above a stated confidence value.",
    B: "Instruct investigators to report fewer findings overall, so that only the strongest and most clearly relevant material reaches the synthesis stage.",
    C: "Move the filtering to the synthesis stage, which sees every investigator's output and is therefore better placed to judge overall relevance.",
    D: "State inclusion categories, exclusions covering unrelated business news and unverifiable single-source rumour, and a rule for the boundary case."
  },
  correct: ["D"],
  rule: "Asked for anything relevant, a model will report generously, including in categories where its precision is poor. Explicit inclusion and exclusion criteria bound generation, and a stated tie-breaker for the ambiguous case is what stops uncertainty being resolved by reporting.",
  why: {
    A: "Wrong. Self-reported confidence is uncalibrated, and the forum-post rumour can be reported with high confidence while remaining unverifiable.",
    B: "Wrong. Fewer is not the same as in-scope: a shorter list can still consist entirely of brand news and rumour.",
    C: "Wrong. Filtering downstream still pays to generate the noise, and synthesis discarding material silently is how genuine findings disappear.",
    D: "Correct. It removes the two unwanted categories by name, and the boundary rule handles the next near-miss without another round of correction."
  }
},
{
  n: 50, domain: "PESO", topic: "O26 · O22", sc: "S4", type: "multi",
  stem: "Atlas wants dates extracted reliably across 600 brokers. Today <code>03/04/2026</code> is returned as 3 April by some documents' extractions and 4 March by others, with no way to tell which reading was used. Some brokers' documents carry no regional signal at all. Which TWO changes are correct?",
  opts: {
    A: "Normalise every date to the format used by the majority of the brokers, since a consistent output is more valuable downstream than a per-document reading of it.",
    B: "State the target format and the regional disambiguation rule in the date field's own description, so it travels with the field wherever the schema is reused.",
    C: "Return null with an explicit ambiguous status whenever no regional signal is available, and route those documents to review on that signal.",
    D: "Add a post-processing step that rewrites any date whose day component is greater than twelve into an unambiguous ISO form before adjudication."
  },
  correct: ["B","C"],
  rule: "Format normalisation belongs in the field description, where it travels with the field and applies exactly where relevant. Genuine ambiguity is not a formatting problem: when the source supports two readings, the only correct output is null plus an explicit status, which then becomes a routing signal.",
  why: {
    A: "Wrong. It manufactures consistency by discarding correctness: a majority convention silently converts half the ambiguous dates into wrong dates.",
    B: "Correct. The description is the right surface for the target format and the disambiguation rule, and it survives reuse of the schema across prompts.",
    C: "Correct. Ambiguity that no rule can resolve must be expressible, and the ambiguous status is exactly the field-level signal review routing should consume.",
    D: "Wrong. It resolves only the cases that were never ambiguous, since a day component above twelve already determines the reading unambiguously."
  }
},
{
  n: 51, domain: "PESO", topic: "O25 · O18", sc: "S3", type: "single",
  stem: "Northwind's synthesis agent receives investigator output as prose paragraphs and produces the final report as prose. Analysts want to filter reports by claim strength and to export contested claims into a follow-up queue. An engineer proposes asking the synthesis agent to add markdown bold tags around established claims so a downstream script can find them. Evaluate.",
  opts: {
    A: "Reasonable: markdown is easy to produce reliably and a script scanning for the tags is a small change compared with reworking the whole pipeline.",
    B: "Wrong surface: claim strength must be a schema field on structured output, since a downstream filter over prose formatting is not a contract.",
    C: "Reasonable, provided the synthesis agent is also instructed never to use bold formatting anywhere else in the report for any other purpose.",
    D: "Wrong surface: the filtering should be done by a second model call that reads the finished prose report and classifies each claim it finds."
  },
  correct: ["B"],
  rule: "If a system consumes the output, the schema is the interface. Formatting conventions in prose are advisory and collide with legitimate uses of the same formatting. Claim strength is data and belongs in a field, produced under a schema the consumer can rely on.",
  why: {
    A: "Wrong. It builds a machine contract out of a presentation convention, which breaks the first time bold is used for emphasis.",
    B: "Correct. A per-claim status field makes filtering and export deterministic, and it is the same structure the synthesis stage already needs for attribution.",
    C: "Wrong. It layers an additional advisory instruction on the first one and forbids ordinary emphasis in a document meant for human analysts.",
    D: "Wrong. It adds a model call to recover structure that was discarded a step earlier, with a second opportunity to misclassify."
  }
},
{
  n: 52, domain: "PESO", topic: "O29 · O12", sc: "S4", type: "single",
  stem: "Atlas's invoice prompt has drifted to 1,400 words after months of corrections. Accuracy is 91% and flat. An engineer proposes replacing it with a 200-word prompt plus twelve few-shot examples drawn from the six most common layouts, each showing the input region and the correct extraction. The team is nervous about deleting accumulated instructions. Evaluate.",
  opts: {
    A: "Too risky: the accumulated instructions encode months of hard-won corrections, and deleting them will reintroduce regressions that were already fixed.",
    B: "Sound: worked examples specify layout behaviour more precisely than prose, and the drifted prompt is where the flat accuracy is coming from.",
    C: "Sound only if the twelve examples are supplemented by keeping every existing instruction, so nothing that currently works can be lost.",
    D: "Too risky unless the change is applied one layout at a time over twelve weeks, measuring each layout's accuracy before the next is added."
  },
  correct: ["B"],
  rule: "Concrete input-output examples specify layout-specific behaviour far more precisely than accumulated prose, and a drifted prompt full of per-broker clauses is a known cause of flat, mutually-cancelling accuracy. The safeguard is a labelled evaluation set, not retention of every historical sentence.",
  why: {
    A: "Wrong. The corrections are exactly what has accumulated into contradictions; a held-out labelled set answers the regression worry directly and measurably.",
    B: "Correct. Examples carry the layout knowledge, and removing the contradictory clauses is the change most likely to move a flat number.",
    C: "Wrong. Keeping all 1,400 words alongside the examples preserves the contradictions and adds tokens, which is the status quo plus cost.",
    D: "Wrong. Twelve weeks of sequential single-layout changes is slower than one evaluation run and confounds each measurement with the previous change."
  }
},
{
  n: 53, domain: "TDM", topic: "O33 · O36", sc: "S6", type: "single",
  stem: "Vantage's password-reset agent receives all 31 MCP tools. It has four semantically overlapping options — <code>search_kb</code>, <code>search_articles</code>, <code>find_runbook</code> and <code>lookup_procedure</code> — inherited from different tenants' servers. Mis-selection among these four accounts for most of the agent's failed resolutions. Which combination of changes is correct?",
  opts: {
    A: "Keep all 31 tools available and add a decision tree to the agent's system prompt setting out which search tool applies in each case.",
    B: "Keep all 31 tools available and set <code>tool_choice</code> to <code>any</code>, so the agent always commits to a tool rather than replying in text.",
    C: "Rename the four search tools alphabetically by their tenant so that the agent evaluates them in a stable and predictable order on every request.",
    D: "Scope the agent's tool set to the reset role, and consolidate the four overlapping search tools behind one tool with a source enum parameter."
  },
  correct: ["D"],
  rule: "Tool distribution follows the output contract, and selection accuracy falls fastest where tools are semantically similar. Scoping removes irrelevant options and their per-turn schema cost; consolidating near-duplicates behind one tool with an enum removes the ambiguity that remains.",
  why: {
    A: "Wrong. Routing guidance in the system prompt competes with everything else there; disambiguation belongs in the tool descriptions or in the schema.",
    B: "Wrong. <code>any</code> guarantees a call, never the right call. Forcing a choice among four indistinguishable tools cannot improve which one is chosen.",
    C: "Wrong. Ordering is not the selection mechanism, and the names would still describe four tools that do the same thing.",
    D: "Correct. It attacks both causes: the catalogue is too large for the role, and four of its members are indistinguishable from the model's point of view."
  }
},
{
  n: 54, domain: "TDM", topic: "O37 · O36", sc: "S6", type: "single",
  stem: "Vantage's <code>unlock_account(user_id)</code> tool requires a <code>user_id</code> that only <code>directory_lookup(email)</code> can produce. Under load the agent sometimes calls <code>unlock_account</code> with a plausible-looking identifier it constructed from the user's email address. The tool returns an empty result and the agent tells the customer their account has been unlocked. What is the strongest fix?",
  opts: {
    A: "Add a line to the system prompt requiring the agent to always perform a directory lookup before attempting to unlock any customer account.",
    B: "Set <code>tool_choice</code> to force the directory lookup on the first turn of every session so the identifier is always available afterwards.",
    C: "Validate the identifier in the unlock tool's backend and return a structured retryable error naming <code>directory_lookup</code> as the remediation.",
    D: "Expand the unlock tool's description to state that the identifier must have been obtained from the directory lookup tool beforehand."
  },
  correct: ["C"],
  rule: "Sequencing is enforced by the callee and taught by the description. A precondition validated in the backend cannot be skipped, and a structured error naming the remediation lets the agent recover in one turn. Note the second defect here: an empty result was read as success, which is why the error must be explicit rather than empty.",
  why: {
    A: "Wrong. A prompt rule is the weakest surface and fails exactly under the load conditions described.",
    B: "Wrong. Forcing a lookup on turn one does not bind the identifier to this unlock, and many sessions have nothing to look up.",
    C: "Correct. It makes the ordering unskippable, replaces the empty result that was misread as success, and tells the agent precisely how to proceed.",
    D: "Wrong on its own. A better description raises the success rate but remains advisory; it is a useful complement to the backend check, not a substitute."
  }
},
{
  n: 55, domain: "TDM", topic: "O34", sc: "S6", type: "single",
  stem: "Every Vantage session begins the same way: the agent calls <code>list_tenants</code>, then <code>get_tenant_config</code>, then <code>get_escalation_matrix</code>, spending three turns and a large share of context before touching the customer's actual problem. This content changes roughly monthly and is identical for every session within a tenant. What is the correct change to the MCP server?",
  opts: {
    A: "Combine the three calls into one tool that returns the tenant configuration and escalation matrix together in a single round trip on session start.",
    B: "Cache the three tool results on the client for a month so that subsequent sessions within the same tenant do not repeat the same three calls.",
    C: "Expose the tenant configuration and escalation matrix as MCP resources so they can be attached directly without any exploratory tool calls at all.",
    D: "Move the tenant configuration into the agent's system prompt, regenerating the prompt whenever the configuration or escalation matrix changes."
  },
  correct: ["C"],
  rule: "Tools are model-invoked actions; resources are addressable content the client attaches. Static, addressable content exposed as tools forces the model to rediscover it every session. Exposing it as resources removes the model decision, the round trips and the per-turn schema cost.",
  why: {
    A: "Wrong. One round trip instead of three is an improvement, but it still requires the model to decide to call it and still costs a turn.",
    B: "Wrong. Client caching hides the latency for repeat sessions while leaving the first session and the schema cost untouched, and it invents an invalidation problem.",
    C: "Correct. The content is stable, addressable and needed every session, which is precisely the profile the resource abstraction exists for.",
    D: "Wrong. Ninety tenants cannot each have a bespoke regenerated system prompt, and the escalation matrix is not standing instruction material."
  }
},
{
  n: 56, domain: "TDM", topic: "O35", sc: "S6", type: "multi",
  stem: "Vantage adds a metrics MCP server. It is configured in a developer's personal user-level config with the API token pasted literally, and works on their machine. On other machines the agent behaves as though the server does not exist, and a security review flags the token. Which TWO changes are correct?",
  opts: {
    A: "Keep the user-level configuration and document the setup steps in the team wiki so that each engineer can add the server on their own machine themselves.",
    B: "Move the server definition into the project-scoped <code>.mcp.json</code> committed to the repository, so the whole team gets the same configuration.",
    C: "Move the server to local scope on each machine, since a metrics server is experimental and should not be shared with the whole team yet.",
    D: "Reference the credential through environment variable expansion in the committed configuration rather than embedding the literal token value."
  },
  correct: ["B","D"],
  rule: "Scope answers who gets the server: project scope for shared team tooling, user scope for personal tooling, local scope for machine-specific experiments. Authentication is separate: the configuration is committed and the secret is not, which is what environment variable expansion is for.",
  why: {
    A: "Wrong. Manual per-machine setup is the problem being reported, and it leaves the literal token in a personal file on every machine.",
    B: "Correct. A server the whole team needs belongs in project scope, which is what makes the configuration shared, versioned and reproducible.",
    C: "Wrong. Local scope narrows availability further, which is the opposite of the requirement, and does nothing about the credential.",
    D: "Correct. Expansion keeps the committed file free of secrets, allows per-engineer credentials, and makes rotation possible without a commit."
  }
},
{
  n: 57, domain: "TDM", topic: "O36 · O33", sc: "S2", type: "single",
  stem: "Meridian's accounts subagent has <code>get_balance</code> and <code>get_statement</code>. Both descriptions read as variations of &quot;retrieve account information for a customer&quot;. The agent calls <code>get_statement</code> for simple balance questions, returning twelve months of transactions where one number was needed, which inflates context and slows replies. Which change is correct?",
  opts: {
    A: "Remove <code>get_statement</code> from the accounts subagent and create a separate statements subagent that the coordinator dispatches when needed.",
    B: "Add a rule to the accounts subagent's system prompt stating that balance questions must be answered using the balance tool and nothing else.",
    C: "Rewrite both descriptions with explicit positive scope, negative scope naming the other tool, input formats and an example of when each applies.",
    D: "Have <code>get_statement</code> return only the three most recent months by default, so that any mis-selection costs far less context than it currently would."
  },
  correct: ["C"],
  rule: "Mis-selection between semantically similar tools is a description problem. The component that fixes it is negative scope naming the alternative, attached to the decision itself rather than sitting in the system prompt where it competes with everything else.",
  why: {
    A: "Wrong. Both tools are legitimately in this role; splitting adds a delegation hop and a coordinator decision to avoid writing two clear descriptions.",
    B: "Wrong. The system prompt is read once per turn and competes for attention; it is the weaker surface for a disambiguation rule.",
    C: "Correct. Negative scope is what separates two tools the model currently reads as synonyms, and it is placed where the choice is actually made.",
    D: "Wrong. It reduces the cost of the wrong choice rather than making the right choice, and it silently truncates genuine statement requests."
  }
},
{
  n: 58, domain: "TDM", topic: "O37 · O1", sc: "S2", type: "single",
  stem: "Meridian forces <code>tool_choice</code> to the identity-verification tool on the first turn of every session. QA files a bug: the agent no longer greets the customer or explains what it is doing before verifying, despite the system prompt instructing it to. Product wants both the greeting and the guaranteed verification. What is the correct response?",
  opts: {
    A: "Expected behaviour: forcing a tool prefills the assistant turn, so emit the greeting from the orchestrator or request the tool in the user message.",
    B: "A prompt defect: the greeting instruction needs to be restated more forcefully and placed at the very beginning of the system prompt.",
    C: "A platform regression: forcing a specific tool should not suppress the assistant text that the system prompt has explicitly and repeatedly asked for.",
    D: "Set <code>disable_parallel_tool_use</code> to false so that the assistant is permitted to emit text alongside the tool call it has been forced to make."
  },
  correct: ["A"],
  rule: "Forcing a specific tool effectively prefills the assistant turn with that tool call, so no natural-language text precedes it. The remedies are to emit the greeting from the orchestrator, or to use <code>auto</code> and request the tool in the user message — accepting that <code>auto</code> no longer guarantees the call.",
  why: {
    A: "Correct. It names the mechanism and gives both remedies, and in a banking flow the guaranteed verification is usually worth more than in-turn text.",
    B: "Wrong. No wording overcomes the mechanism. The model is not choosing to skip the greeting; the turn shape leaves no room for it.",
    C: "Wrong. It is documented behaviour of forced tool use rather than a defect, so filing it upstream will not change anything.",
    D: "Wrong. That flag governs whether several tools may be called in one turn; it has no bearing on whether text precedes a forced call."
  }
},
{
  n: 59, domain: "TDM", topic: "O33 · O19", sc: "S3", type: "single",
  stem: "Northwind's synthesis agent has been given web search &quot;so it can check anything an investigator left unresolved&quot;. Reports have improved in apparent completeness. An audit finds three claims in the last month's reports that trace to no investigator and no citation, and one that contradicts an investigator's explicitly contested finding. What is the correct configuration?",
  opts: {
    A: "Keep the search tool but require synthesis to add a citation to every claim it resolves itself, so that the provenance of those claims is recorded.",
    B: "Remove every tool from the synthesis agent, so it can only reason over worker output, and route unresolved items back to an investigator or a human.",
    C: "Keep the search tool but instruct the synthesis agent not to contradict any finding an investigator has explicitly marked as contested in its output.",
    D: "Replace the synthesis agent's web search with read access to the shared scratchpad, so it can resolve gaps from material already gathered."
  },
  correct: ["B"],
  rule: "A synthesis stage reasons over worker output and introduces nothing. Tools at that stage are how claims enter a report with no worker behind them. Unresolved items are a finding in their own right: they route back to an investigator with a proper delegation package, or to a human.",
  why: {
    A: "Wrong. A citation on a claim synthesis found itself still means synthesis is now an uncontrolled investigator with no delegation package or output contract.",
    B: "Correct. It closes the fabrication path structurally and puts gap-filling where it belongs, with an agent that has a brief and a return contract.",
    C: "Wrong. It patches one of the two symptoms with an advisory rule and leaves the three uncited claims entirely unaddressed.",
    D: "Wrong. A narrower source still lets synthesis originate claims, and the scratchpad holds investigator conclusions that were already available to it."
  }
},
{
  n: 60, domain: "TDM", topic: "O35 · O33 · O16", sc: "S5", type: "multi",
  stem: "Corvus wants every engineer to have the GitHub and internal-metrics MCP servers, wants the review subagent restricted to read-only GitHub operations, and must ensure that no engineer can grant themselves the deployment server's write tools. Tokens must not appear in the repository. Which TWO changes belong in the design?",
  opts: {
    A: "Define both shared servers in the committed <code>.mcp.json</code> with credentials referenced by environment variable expansion at load time.",
    B: "Deny the deployment server's write tools by their namespaced tool names in managed settings, which no user-editable layer can override.",
    C: "Ask each engineer to configure the deployment server at local scope and to voluntarily omit the write tools from their own configuration file.",
    D: "Grant the review subagent the full GitHub tool set and rely on its system prompt to keep it read-only while reviewing."
  },
  correct: ["A","B"],
  rule: "Three separate mechanisms: scope decides who gets a server, environment expansion keeps secrets out of the committed file, and a managed deny rule on namespaced tool names is the only layer an engineer cannot shadow. Role restriction for a subagent is its tool allowlist, never its system prompt.",
  why: {
    A: "Correct. Project scope makes the shared servers reproducible for all 400 engineers, and expansion satisfies the no-tokens-in-the-repo requirement.",
    B: "Correct. A must-hold with no local override is precisely the managed settings case, and namespaced tool names are what the rule matches on.",
    C: "Wrong. A requirement that depends on every engineer voluntarily omitting a capability is not a control at any scale, least of all 400 people.",
    D: "Wrong. Role boundaries are enforced by the allowlist. A read-only reviewer holding write tools will eventually use them helpfully."
  }
}

];
