/* =============================================================
   Claude Study Hub — CCAR-A2 exercise bank
   Written to the Attempt-2 test objectives, weighted heavily towards
   the seven scored at 0% and the tail scored at 50-67%.
   Types: classify | json | text | choice | lab
   ============================================================= */

var EXERCISES = [

/* ---------------------------------------------------------- 1 */
{
  id: 'a2ex1', type: 'classify', topics: 'O8 · review architecture', level: 'Priority · scored 0%',
  title: 'Plan mode, direct execution, or multi-phase?',
  brief: 'Three architectures chosen on three inputs: scope, risk and reversibility, and whether a human must ' +
         'approve <em>before</em> anything changes. Work the questions in order — the approval requirement ' +
         'dominates, then breadth and separable concerns, and direct execution is what is left.',
  bins: [
    { id: 'plan',   label: 'Plan mode' },
    { id: 'direct', label: 'Direct execution' },
    { id: 'multi',  label: 'Multi-phase workflow' }
  ],
  items: [
    { t: 'Fix the lint errors introduced on this branch. Fully revertible; nobody needs to approve.', a: 'direct',
      why: 'No approval requirement, small scope, cheap reversal. Adding a planning phase costs more than the fix itself.' },
    { t: 'Migrate 60 API handlers off a deprecated middleware. The platform lead wants to see the approach first.', a: 'plan',
      why: 'A stated requirement that a stakeholder sees the approach before code moves. The approval boundary is the feature, and it dominates every efficiency argument.' },
    { t: 'Review a 400-file pull request for security, business logic and API compatibility.', a: 'multi',
      why: 'Breadth plus separable concerns that trade recall against each other in a single pass. Distinct phases with their own prompts, examples and tool permissions.' },
    { t: 'Rename a private helper used in four places in one module.', a: 'direct',
      why: 'Small, mechanical, reversible, single-concern. Any ceremony here is pure overhead.' },
    { t: 'A schema migration that is irreversible once applied to production data.', a: 'plan',
      why: 'Irreversibility is a plan-mode criterion in its own right, even with no stakeholder asking. Reviewing the PR afterwards reviews an approach already committed to.' },
    { t: 'Investigate why checkout latency regressed, then fix whatever is found.', a: 'multi',
      why: 'Investigation and remediation are different phases needing different tools and different outputs; the second cannot be scoped until the first returns.' },
    { t: 'Add a unit test for a bug that was just fixed, in a repo with clear test conventions.', a: 'direct',
      why: 'Narrow, conventional and reversible. Nothing about it is uncertain or multi-concern.' },
    { t: 'Restructure the monorepo build so 400 engineers get a different local workflow.', a: 'plan',
      why: 'Architectural uncertainty plus a change that is expensive to unwind socially as well as technically. The approach needs approval before it lands.' },
    { t: 'Produce a dependency audit across 40 packages and a remediation plan for each.', a: 'multi',
      why: 'Survey then per-package analysis then synthesis. One pass over 40 packages truncates, and the phases have genuinely different shapes.' },
    { t: 'Update a copyright year in the footer component.', a: 'direct',
      why: 'The case that exists to remind you direct execution is a legitimate answer and not a failure to be thorough.' }
  ]
},

/* ---------------------------------------------------------- 2 */
{
  id: 'a2ex2', type: 'json', topics: 'O11 · CLI in CI/CD', level: 'Priority · scored 50%',
  title: 'Configure a Claude Code invocation that cannot hang or run away',
  brief: 'A CI runner has no TTY, no human to approve a permission prompt, and a billing account. Produce a JSON ' +
         'object describing the invocation: a <code>flags</code> object of CLI flags to values, an ' +
         '<code>allowedTools</code> array, and a <code>gating</code> object saying how the pipeline decides ' +
         'pass or fail. The job is a read-only review that must fail the build on any high-severity finding.',
  starter: '{\n  "flags": {},\n  "allowedTools": [],\n  "gating": {\n    "consumes": "",\n    "failsWhen": ""\n  }\n}',
  checks: [
    { label: 'Valid JSON with flags, allowedTools and gating', fn: function (o) { return o && typeof o.flags === 'object' && Array.isArray(o.allowedTools) && typeof o.gating === 'object'; } },
    { label: 'Runs non-interactively (-p / --print)', fn: function (o, raw) { return has(raw, /"-{1,2}p"|"--print"/); } },
    { label: 'Requests machine-readable output (--output-format json or stream-json)', fn: function (o, raw) { return has(raw, /output-?format/i) && has(raw, /json/i); } },
    { label: 'Bounds iterations with a turn limit', fn: function (o, raw) { return has(raw, /max-?turns/i); } },
    { label: 'The turn limit is a real number, not a placeholder', fn: function (o) { var f=(o&&o.flags)||{}; var k=Object.keys(f).filter(function(x){return /max-?turns/i.test(x);})[0]; return k && Number(f[k]) > 0; } },
    { label: 'Uses an explicit permission mode rather than a blanket bypass', fn: function (o, raw) { return has(raw, /permission-?mode/i) && !has(raw, /dangerously|skip-?permissions|bypassPermissions/i); } },
    { label: 'Permission mode does not allow edits (this is a read-only review)', fn: function (o, raw) { return !has(raw, /acceptEdits/i); } },
    { label: 'allowedTools grants read tools only — no Edit, Write or bare Bash', fn: function (o) { return arr(o && o.allowedTools).length > 0 && arr(o.allowedTools).every(function (t) { return !/^(Edit|Write|MultiEdit|Bash)$/i.test(String(t).trim()); }); } },
    { label: 'Any Bash access is scoped to a command family', fn: function (o, raw) { return !/Bash/i.test(raw) || /Bash\([^)]+\)/.test(raw); } },
    { label: 'Gating consumes the structured output, not the prose', fn: function (o, raw) { return has(raw, /(\.json|findings|severity)/i) && !/grep|string match/i.test((o && o.gating && o.gating.consumes) || ''); } },
    { label: 'Gating condition names a severity threshold', fn: function (o, raw) { return has(raw, /high|critical|severity/i); } }
  ],
  solution:
'{\n  "flags": {\n    "-p": "$(cat .github/review-prompt.md)",\n    "--output-format": "json",\n    "--permission-mode": "plan",\n    "--max-turns": 25,\n    "--model": "sonnet"\n  },\n  "allowedTools": [\n    "Read",\n    "Grep",\n    "Glob",\n    "Bash(git diff:*)",\n    "Bash(git log:*)"\n  ],\n  "gating": {\n    "consumes": "review.json — the structured findings array emitted by --output-format json",\n    "failsWhen": "any finding with severity == \\"high\\" whose file appears in the diff of this pull request",\n    "alsoFailsWhen": "the CLI exits non-zero, or the run ends on turn-budget exhaustion rather than a completed review"\n  }\n}',
  notes: 'Four concerns, and an answer that misses any one of them is incomplete. <strong>-p</strong> is what stops ' +
         'the job hanging on an interactive session that will never receive input. <strong>--output-format json</strong> ' +
         'is what makes the gate a query rather than a string match. <strong>--allowedTools</strong> is the right answer ' +
         'to permission prompts in CI — never a blanket bypass, which is how a reviewer ends up rewriting source ' +
         'files. <strong>--max-turns</strong> plus a handled budget branch is what stops the four-figure bill. Note ' +
         'the last gating clause: turn-budget exhaustion must fail the build, not silently pass it.'
},

/* ---------------------------------------------------------- 3 */
{
  id: 'a2ex3', type: 'classify', topics: 'O14 · context: fork', level: 'Priority · scored 0%',
  title: 'Fork it, or keep it in the session?',
  brief: 'A Skill or slash command normally runs <em>in the current session</em>: everything it reads and every ' +
         'intermediate step stays in that conversation. <code>context: fork</code> runs the invocation in an ' +
         'isolated subagent context and returns only its result. The rule is: <strong>fork when the work is wide ' +
         'and the result is narrow</strong>; do not fork when the command\'s purpose is to operate on the live ' +
         'conversation.',
  bins: [
    { id: 'fork',   label: 'context: fork' },
    { id: 'inline', label: 'Run in session' }
  ],
  items: [
    { t: 'Audit every dependency for advisories and licence conflicts; return a risk table.', a: 'fork',
      why: 'Reads a 6,000-line lockfile and 40 advisory records; the useful output is one table. The textbook wide-in, narrow-out case.' },
    { t: 'Explain the change you just made to this file.', a: 'inline',
      why: 'The answer IS the session context. A fork cannot see the edit and has nothing to describe.' },
    { t: 'Generate a release changelog from six months of git history.', a: 'fork',
      why: 'Large self-contained input, small output, no dependency on session state.' },
    { t: 'Fix the failing test we have been debugging for the last twenty minutes.', a: 'inline',
      why: 'Depends entirely on accumulated debugging state — hypotheses tried, output seen, things ruled out.' },
    { t: 'A research skill invoked three times in one session on different subjects.', a: 'fork',
      why: 'Without forking, run three inherits runs one and two. This is exactly the cross-contamination the objective names, and the reason answers degrade with each invocation.' },
    { t: 'Reformat the JSON you just printed into a table.', a: 'inline',
      why: 'Operates on output that exists only in the conversation.' },
    { t: 'Scan the whole monorepo for uses of a deprecated API and return a per-package count.', a: 'fork',
      why: 'Hundreds of files in, a count table out. The session should pay for the table only.' },
    { t: 'Continue the refactor using the naming convention we agreed earlier in this session.', a: 'inline',
      why: 'The convention was agreed in conversation; a fork starts clean and would not know it.' },
    { t: 'Produce a security posture summary by reading every settings and workflow file.', a: 'fork',
      why: 'Wide read, narrow summary, and none of the material read is useful to the developer afterwards.' },
    { t: 'Summarise what we decided in this conversation so far.', a: 'inline',
      why: 'The conversation is the input. Forking would seed an isolated context with nothing to summarise.' }
  ]
},

/* ---------------------------------------------------------- 4 */
{
  id: 'a2ex4', type: 'json', topics: 'O33 · tool distribution', level: 'Priority · scored 0%',
  title: 'Distribute tools across a research pipeline',
  brief: 'A competitive-intelligence pipeline has a <em>planner</em>, three <em>investigators</em>, and a ' +
         '<em>synthesis</em> agent. Available tools: <code>web_search</code>, <code>fetch_url</code>, ' +
         '<code>doc_store_read</code>, <code>internal_db_query</code>, <code>scratchpad_write</code>, ' +
         '<code>scratchpad_read</code>, <code>send_email</code>, <code>create_task</code>, ' +
         '<code>escalate_to_human</code>. Produce an object mapping each agent to its tool array, plus a ' +
         '<code>excluded</code> object naming, for each agent, one tool it must not have and the bad outcome if ' +
         'it did.',
  starter: '{\n  "planner": [],\n  "investigator": [],\n  "synthesis": [],\n  "excluded": {}\n}',
  checks: [
    { label: 'Valid JSON with all three agents as arrays', fn: function (o) { return o && ['planner','investigator','synthesis'].every(function (k) { return Array.isArray(o[k]); }); } },
    { label: 'The synthesis agent has NO tools at all', fn: function (o) { return arr(o && o.synthesis).length === 0; } },
    { label: 'No agent holds send_email', fn: function (o) { return ['planner','investigator','synthesis'].every(function (k) { return arr(o && o[k]).every(function (t) { return !/send_email/i.test(t); }); }); } },
    { label: 'Investigators can actually gather (search, fetch or read)', fn: function (o) { return arr(o && o.investigator).some(function (t) { return /(web_search|fetch_url|doc_store_read|internal_db_query)/i.test(t); }); } },
    { label: 'Investigators can write findings to the scratchpad', fn: function (o) { return arr(o && o.investigator).some(function (t) { return /scratchpad_write/i.test(t); }); } },
    { label: 'The planner does not do the investigators\' gathering for them', fn: function (o) { return arr(o && o.planner).every(function (t) { return !/(web_search|fetch_url)/i.test(t); }); } },
    { label: 'The planner owns task creation and the escalation path', fn: function (o) { var t = arr(o && o.planner).join(' '); return /create_task/i.test(t) && /escalate_to_human/i.test(t); } },
    { label: 'An exclusion rationale for each of the three agents', fn: function (o) { return o && o.excluded && ['planner','investigator','synthesis'].every(function (k) { return typeof o.excluded[k] === 'string' && o.excluded[k].length > 30; }); } },
    { label: 'The synthesis exclusion explains the fabrication risk', fn: function (o) { return /(invent|fabricat|no worker|introduce|unsupported|no investigator)/i.test((o && o.excluded && o.excluded.synthesis) || ''); } }
  ],
  solution:
'{\n  "planner": ["scratchpad_read", "create_task", "escalate_to_human"],\n  "investigator": ["web_search", "fetch_url", "doc_store_read", "internal_db_query", "scratchpad_write", "scratchpad_read"],\n  "synthesis": [],\n  "excluded": {\n    "planner": "No web_search or fetch_url: if the planner can gather, it will investigate instead of decomposing, and the work it does is invisible to the task graph it is supposed to be maintaining.",\n    "investigator": "No create_task and no escalate_to_human: an investigator that can spawn follow-up tasks turns dynamic decomposition into unbounded recursion with no owner of the plan.",\n    "synthesis": "No tools whatsoever, above all no web_search: a synthesis stage that can fetch will introduce claims that no investigator produced and that no reader can trace back to a source."\n  }\n}',
  notes: 'The objective names two reasons and most candidates only remember one. Preventing out-of-role calls is ' +
         'the obvious half. The other half is <strong>reducing decision complexity</strong>: selection accuracy ' +
         'falls as the catalogue grows, fastest where tools are semantically similar, and every tool definition is ' +
         'tokens on every turn. The <code>excluded</code> exercise is the real test — if you cannot name a tool an ' +
         'agent must not have and say what goes wrong if it does, you have not scoped that agent.'
},

/* ---------------------------------------------------------- 5 */
{
  id: 'a2ex5', type: 'choice', topics: 'O37 · tool_choice and sequencing', level: 'Priority · scored 0% twice',
  title: 'tool_choice and multi-tool sequencing',
  brief: 'You scored 0% on this objective on both attempts, which makes it the single highest-value drill in this ' +
         'hub. It has two halves: which <code>tool_choice</code> value guarantees what, and how a dependent tool ' +
         'call is prevented from running before its prerequisite.',
  questions: [
    { q: 'Exactly one tool is correct and it must always be called with schema-valid arguments. Configuration?',
      opts: ['tool_choice: auto with a strong prompt instruction', 'tool_choice: any', 'tool_choice: {type:"tool", name:"..."} with a strict input schema', 'Prefill the assistant turn with the tool name'],
      a: 2,
      why: 'Naming the tool guarantees which tool is called; the schema constrains the arguments. "any" guarantees a call but leaves the choice open, which is unnecessary latitude when only one tool is correct.' },
    { q: 'The model keeps choosing the wrong tool among four similar ones. Does tool_choice: any help?',
      opts: ['Yes — forcing a call removes hesitation and improves accuracy', 'No — it guarantees a call, never a correct call', 'Yes, if combined with a lower temperature', 'Only when fewer than four tools are supplied'],
      a: 1,
      why: 'This is the central trap of the objective. Mis-selection is a tool-design problem: fix the descriptions with negative scope, consolidate near-duplicates, and scope the catalogue to the role.' },
    { q: 'The final turn must summarise and must not call any more tools. Configuration?',
      opts: ['tool_choice: {type:"none"}', 'tool_choice: auto plus an instruction not to call tools', 'Remove the tools and set tool_choice: any', 'Omit tool_choice entirely'],
      a: 0,
      why: '"none" is the value that forbids tool use for a turn, and it is the one candidates forget exists. Omitting the parameter is "auto", which is the behaviour that is already failing.' },
    { q: 'process_return(order_id) needs an id only lookup_order(email) produces. Strongest enforcement?',
      opts: ['A system-prompt rule requiring the lookup first', 'The prerequisite stated in the tool description', 'A backend precondition returning a structured PRECONDITION_FAILED naming the remediation', 'disable_parallel_tool_use so the calls cannot be batched'],
      a: 2,
      why: 'Sequencing is enforced by the callee and taught by the description. A validated precondition cannot be skipped, and a structured error naming the remediation lets the agent recover in one turn instead of failing the session.' },
    { q: 'Forcing a specific tool on turn one suppressed the agent\'s greeting. What is happening?',
      opts: ['A platform regression to report', 'Expected: the forced call prefills the assistant turn, so no text precedes it', 'The system prompt needs the greeting stated more forcefully', 'disable_parallel_tool_use must be set to false'],
      a: 1,
      why: 'Documented behaviour, not a defect. Emit the greeting from the orchestrator, or use auto and request the tool in the user message — accepting that auto no longer guarantees the call.' },
    { q: 'Three lookups: A is independent, B and C both consume A\'s output. Best execution?',
      opts: ['All three in one parallel turn', 'A, then B and C together in one parallel turn', 'A, then B, then C strictly in sequence', 'B and C first, then A to validate them'],
      a: 1,
      why: 'Parallel only where there is no data dependency. Two waves is the minimum; batching all three makes the model invent A\'s output as input to B and C.' },
    { q: 'A tool returns {} when its precondition is unmet, and the agent reports success. Two defects — which pair?',
      opts: ['Missing retry logic and a missing turn budget', 'A skippable precondition and an empty result that reads as success', 'A wrong tool_choice value and a missing enum', 'An overlong description and a missing example'],
      a: 1,
      why: 'Both must be fixed. Validate the precondition so the order cannot be skipped, and replace the empty object with an explicit is_error result so failure cannot be mistaken for a clean outcome.' },
    { q: 'When is disable_parallel_tool_use the right setting?',
      opts: ['Whenever tools are semantically similar', 'When calls have side effects that must be ordered', 'To improve tool-selection accuracy', 'On the final summarising turn'],
      a: 1,
      why: 'It exists to switch off batching where ordering matters or a downstream system cannot tolerate concurrency. It is not a selection-accuracy mechanism and not a substitute for "none".' }
  ]
},

/* ---------------------------------------------------------- 6 */
{
  id: 'a2ex6', type: 'json', topics: 'O7 · dynamic decomposition', level: 'Priority · scored 0%',
  title: 'Model the re-planning loop',
  brief: 'A static decomposition computes the subtask list once and executes it. A dynamic one executes part of ' +
         'it and then <strong>re-plans from what came back</strong>. Model the plan object the re-planner mutates: ' +
         'a <code>tasks</code> array with per-task status and dependencies, a <code>bounds</code> object that ' +
         'keeps the loop from diverging, and a <code>replanRules</code> object saying what a re-plan step may do.',
  starter: '{\n  "objective": "",\n  "round": 1,\n  "tasks": [],\n  "bounds": {},\n  "replanRules": {}\n}',
  checks: [
    { label: 'Valid JSON with an objective, tasks array and bounds', fn: function (o) { return o && typeof o.objective === 'string' && Array.isArray(o.tasks) && typeof o.bounds === 'object'; } },
    { label: 'At least three tasks, each with an id and a status', fn: function (o) { return arr(o && o.tasks).length >= 3 && arr(o.tasks).every(function (t) { return t && t.id && t.status; }); } },
    { label: 'Status values distinguish pending, running, done and failed', fn: function (o, raw) { return /pending/i.test(raw) && /(done|complete)/i.test(raw) && /failed/i.test(raw); } },
    { label: 'Tasks carry dependencies, so independent ones can be batched in parallel', fn: function (o) { return arr(o && o.tasks).some(function (t) { return Array.isArray(t.dependsOn) || Array.isArray(t.deps); }); } },
    { label: 'At least one task records which round created it (discovery is traceable)', fn: function (o) { return arr(o && o.tasks).some(function (t) { return t.createdInRound !== undefined || t.round !== undefined || t.origin !== undefined; }); } },
    { label: 'A round or depth cap bounds how many times re-planning may run', fn: function (o, raw) { return has(raw, /(maxRounds|roundCap|maxDepth|maxReplans)/i); } },
    { label: 'A convergence rule: a round must close more tasks than it opens', fn: function (o, raw) { return has(raw, /(converg|closes? more|net|opened|mustClose)/i); } },
    { label: 'A scope rule limiting what a re-plan may add', fn: function (o, raw) { return has(raw, /(in-?scope|scope|must serve|original objective|relevant to)/i); } },
    { label: 'replanRules cover adding, dropping and re-scoping tasks', fn: function (o, raw) { return has(raw, /add/i) && has(raw, /(drop|remove|prune)/i) && has(raw, /(re-?scope|narrow|refine)/i); } },
    { label: 'An explicit escalation when the bounds are hit with work still open', fn: function (o, raw) { return has(raw, /escalat/i); } }
  ],
  solution:
'{\n  "objective": "Assess competitor X\'s supply-chain exposure",\n  "round": 2,\n  "tasks": [\n    { "id": "T1", "goal": "Identify primary manufacturing partners", "status": "done",\n      "dependsOn": [], "createdInRound": 1,\n      "result_ref": "scratchpad://findings/T1" },\n    { "id": "T2", "goal": "Map shipping routes from those partners", "status": "running",\n      "dependsOn": ["T1"], "createdInRound": 1 },\n    { "id": "T3", "goal": "Check pricing pages for surcharge signals", "status": "dropped",\n      "dependsOn": [], "createdInRound": 1,\n      "droppedBecause": "T1 established the partner set is domestic; surcharge signals do not apply" },\n    { "id": "T4", "goal": "Investigate the Aurora joint venture surfaced by T1", "status": "pending",\n      "dependsOn": ["T1"], "createdInRound": 2,\n      "createdBecause": "T1 surfaced an unplanned JV that materially changes the exposure picture" },\n    { "id": "T5", "goal": "Pull customs filings for the partner set", "status": "failed",\n      "dependsOn": ["T1"], "createdInRound": 2,\n      "failedBecause": "upstream customs API returned UPSTREAM_TIMEOUT after a bounded retry; retryable" }\n  ],\n  "bounds": {\n    "maxRounds": 4,\n    "maxOpenTasks": 12,\n    "convergence": "each round must close at least as many tasks as it opens; two consecutive non-converging rounds escalate",\n    "onBoundsHit": "escalate(PLAN_DID_NOT_CONVERGE) with the completed findings attached — never return a partial answer as if it were complete"\n  },\n  "replanRules": {\n    "add": "only subtasks that serve the original objective and that were not knowable at plan time",\n    "drop": "tasks a finding has made moot, recording droppedBecause so the decision is auditable",\n    "rescope": "narrow a task when a finding supplies a parameter it was missing",\n    "reorder": "when a dependency is discovered that was not visible at plan time",\n    "mayNotAdd": "adjacent curiosities, however interesting, that do not serve the stated objective"\n  }\n}',
  notes: 'Two things separate a complete answer. First, the <strong>bounds</strong>: dynamic does not mean ' +
         'unbounded, and a round cap plus a convergence rule plus an escalation on hitting them is what makes an ' +
         'adaptive plan safe to run in production. Second, the <strong>audit trail</strong> — ' +
         '<code>createdBecause</code> and <code>droppedBecause</code> are what let a human reconstruct why the ' +
         'plan is the shape it is. A plan object without them is adaptive but not inspectable.'
},

/* ---------------------------------------------------------- 7 */
{
  id: 'a2ex7', type: 'text', topics: 'O15 · test generation', level: 'Priority · scored 0%',
  title: 'Write the prompt that produces meaningful tests',
  brief: 'Asked for tests with no further input, a model produces assertions that restate the implementation: ' +
         'getters that return their constructor argument, mocks verifying mocks, snapshots locking in current ' +
         'behaviour. Write the instruction block that fixes it. The objective names three levers and they are ' +
         'additive: <strong>existing test files as context</strong>, <strong>fixture conventions</strong>, and ' +
         '<strong>criteria distinguishing meaningful from trivial</strong>.',
  starter: '## Context to read first\n\n\n## Fixture conventions\n\n\n## What makes a test meaningful here\n\n\n## Do not write\n\n\n## Scope\n',
  checks: [
    { label: 'Points at specific existing test files to read as context', fn: function (o, raw) { return has(raw, /\.(test|spec)\.(ts|tsx|js|py|go|rb)\b/); } },
    { label: 'Names more than one example file, so idiom is inferable', fn: function (o, raw) { return (raw.match(/\.(test|spec)\.[a-z]+/g) || []).length >= 2; } },
    { label: 'States where fixtures or factories live', fn: function (o, raw) { return has(raw, /(factor(y|ies)|fixture)/i) && has(raw, /(test\/|tests\/|__fixtures__|\/factories)/i); } },
    { label: 'Forbids constructing domain objects inline', fn: function (o, raw) { return has(raw, /(never construct|do not construct|no inline|extend a factory|use the factory)/i); } },
    { label: 'Says something about time, randomness or other non-determinism', fn: function (o, raw) { return has(raw, /(fake ?timers|freeze|Date\.now|seed|random|clock)/i); } },
    { label: 'States the behaviour-vs-implementation criterion explicitly', fn: function (o, raw) { return has(raw, /behaviou?r changes?[\s\S]{0,80}implementation|implementation changes?[\s\S]{0,80}behaviou?r/i); } },
    { label: 'Requires boundaries, empty/null inputs or error paths', fn: function (o, raw) { return has(raw, /(boundar|edge case|empty|null|error path|failure case)/i); } },
    { label: 'Names trivial patterns to avoid (getters, mock-verifying-mock, snapshots)', fn: function (o, raw) { return has(raw, /(getter|mock was called|snapshot)/i); } },
    { label: 'Defines an inclusion/exclusion scope for what to test', fn: function (o, raw) { return has(raw, /(do not (write|test)|out of scope|exclude|skip)/i) && has(raw, /(generated|third-party|vendor|node_modules|deprecated)/i); } },
    { label: 'Does NOT set a coverage percentage as the objective', fn: function (o, raw) { return !has(raw, /\b\d{2,3}\s?%\s*(coverage|cov)|coverage\s*(target|goal)\s*(of|:)?\s*\d/i); } }
  ],
  solution:
'## Context to read first\nRead these before writing anything; match their structure, naming and assertion style:\n- src/orders/orders.service.test.ts   (service-level, uses factories, freezes time)\n- src/orders/orders.repo.test.ts      (repository-level, real in-memory DB, no mocks)\n- test/factories/order.ts             (the factory you are expected to extend)\n\n## Fixture conventions\n- Factories live in test/factories/. Use makeOrder({ ...overrides }); never construct\n  a domain object inline.\n- Time is frozen with vi.useFakeTimers(); never assert against a real Date.now().\n- Randomness is seeded via makeRng(seed); no unseeded Math.random in a test.\n- One behaviour per test. The test name states the behaviour, not the method name.\n\n## What makes a test meaningful here\nA test is meaningful if it FAILS when the behaviour changes and PASSES when only the\nimplementation changes. Concretely, prefer:\n- invariants after a state transition (an order cannot leave PAID with a zero total)\n- boundaries: 0, 1, max, empty collection, null and undefined inputs\n- error paths and idempotency: calling cancel twice must not double-refund\n- observable effects on the system under test, not on a mock\n\n## Do not write\n- assertions that a getter returns what the constructor was handed\n- assertions that a mock was called with the arguments this test just passed in\n- snapshot tests of current output\n- happy-path-only tests for anything with a failure mode\n- any test that would still pass if the implementation were deleted and stubbed\n\n## Scope\nTest src/orders/** only. Do not write tests for src/generated/**, for third-party\nlibrary behaviour, or for src/legacy/pricing/** which is being deleted next sprint.\nIf a case sits on the boundary of this scope, leave it out and note it instead.',
  notes: 'The one sentence worth memorising is the criterion: <em>a meaningful test fails when the behaviour ' +
         'changes and passes when only the implementation changes</em>. It is a rule the model can actually apply, ' +
         'unlike "write good tests". And note the last check: a coverage target is the classic wrong instruction, ' +
         'because trivial tests are the cheapest possible coverage — asking for 90% reliably produces exactly the ' +
         'suite you are trying to avoid.'
},

/* ---------------------------------------------------------- 8 */
{
  id: 'a2ex8', type: 'json', topics: 'O13 · O30 · review configuration', level: 'Priority · scored 0%',
  title: 'Design the review configuration',
  brief: 'The objective names three requirements and a correct answer satisfies all three: <strong>load the ' +
         'correct project standards</strong>, <strong>restrict unnecessary tool access</strong>, and ' +
         '<strong>produce structured output suitable for automated downstream processing</strong>. Add the ' +
         'false-positive problem: the reviewer keeps reporting three things the team has already accepted. Emit a ' +
         'configuration object describing where each piece lives.',
  starter: '{\n  "standards": {},\n  "suppression": {},\n  "tools": [],\n  "output": {}\n}',
  checks: [
    { label: 'Valid JSON with standards, suppression, tools and output', fn: function (o) { return o && o.standards && o.suppression && Array.isArray(o.tools) && o.output; } },
    { label: 'Standards live in repository configuration surfaces, not in CI YAML', fn: function (o, raw) { return has(raw, /(CLAUDE\.md|\.claude\/rules|\.claude\/skills)/i) && !/workflow\.ya?ml["\s]*:\s*"[^"]*standard/i.test(raw); } },
    { label: 'Area-specific standards are path-scoped so only relevant ones load', fn: function (o, raw) { return has(raw, /paths?\s*[:"]/i) && has(raw, /\*\*|glob|src\//i); } },
    { label: 'Suppression covers project conventions the reviewer keeps flagging', fn: function (o, raw) { return has(raw, /(convention|house style|accepted pattern)/i); } },
    { label: 'Suppression names explicit exclusion criteria (paths or categories)', fn: function (o, raw) { return has(raw, /(generated|fixture|exclude|do not report)/i); } },
    { label: 'Suppression is persistent, applied on every review rather than per-run', fn: function (o, raw) { return has(raw, /(every review|persistent|always|all reviews|committed)/i); } },
    { label: 'Tools are read-only: no Edit, Write or bare Bash', fn: function (o) { return arr(o && o.tools).length > 0 && arr(o.tools).every(function (t) { return !/^(Edit|Write|MultiEdit|Bash)$/i.test(String(t).trim()); }); } },
    { label: 'Any Bash is scoped to a command family', fn: function (o, raw) { return !/Bash/i.test(raw) || /Bash\([^)]+\)/.test(raw); } },
    { label: 'Output is a structured finding list, not a prose comment', fn: function (o, raw) { return has(raw, /(severity|findings|schema|json)/i); } },
    { label: 'Output fields support gating: severity plus file and line', fn: function (o, raw) { return has(raw, /severity/i) && has(raw, /file/i) && has(raw, /line/i); } }
  ],
  solution:
'{\n  "standards": {\n    "projectWide": "CLAUDE.md — architecture, build commands, what this repo considers a defect",\n    "areaSpecific": [\n      { "file": ".claude/rules/payments.md",  "paths": ["src/payments/**"] },\n      { "file": ".claude/rules/public-api.md", "paths": ["src/api/**", "openapi/**"] },\n      { "file": ".claude/rules/react.md",      "paths": ["src/**/*.tsx"] }\n    ],\n    "reviewPlaybook": ".claude/skills/code-review/SKILL.md — the pass structure and per-pass examples",\n    "note": "Nothing lives in the workflow YAML except invocation and gating, so standards cannot drift from the code they govern and local runs apply the same rules."\n  },\n  "suppression": {\n    "appliesTo": "every review, in CI and locally, because it is committed alongside the standards",\n    "conventions": [\n      "snake_case DB columns mapped to camelCase in TS is deliberate; the mapping layer is intentional",\n      "direct process.env reads are permitted inside config/*.ts only"\n    ],\n    "acceptedPatterns": [\n      "the retry-with-jitter helper in lib/retry.ts is the approved pattern; do not suggest alternatives"\n    ],\n    "exclusions": [\n      "**/generated/**",\n      "**/*.fixture.ts and test fixtures",\n      "style, formatting and naming — the linter owns these",\n      "dependency CVEs — a separate pass owns these"\n    ],\n    "bar": "report a finding only where a concrete failure or exploit path in THIS codebase can be stated"\n  },\n  "tools": ["Read", "Grep", "Glob", "Bash(git diff:*)", "Bash(git log:*)"],\n  "output": {\n    "method": "tool schema / --output-format json",\n    "shape": {\n      "findings": [\n        { "id": "string", "severity": "high|medium|low", "class": "enum",\n          "file": "path", "line": "number", "claim": "string",\n          "evidence": [{ "source": "path", "ref": "L10-L20" }] }\n      ],\n      "coverage": { "files_examined": "number", "files_skipped": "number", "skipped_reason": "string|null" }\n    },\n    "gating": "fail the build on any severity==high finding whose file appears in this diff"\n  }\n}',
  notes: 'The word doing the work in the false-positive half is <strong>persistent</strong>. Suppression pasted ' +
         'into one engineer\'s prompt fixes one run; committed alongside the standards it applies to CI, local runs ' +
         'and every branch. And note what is deliberately NOT here: raising the severity threshold. Filtering to ' +
         '"high only" keeps the high-severity false positives and discards genuine medium findings — precision comes ' +
         'from saying what is accepted, never from hiding output.'
},

/* ---------------------------------------------------------- 9 */
{
  id: 'a2ex9', type: 'classify', topics: 'O32 · O17 · built-in tools', level: 'Scored 50% / 80%',
  title: 'Grep, Glob, Read or Bash?',
  brief: 'The funnel is <strong>Glob for structure, Grep for anchors, Read narrowly at the anchors, and Bash only ' +
         'for actions</strong>. Each step narrows before the expensive one. Most exploration questions on the exam ' +
         'describe a session that read too much, too early.',
  bins: [
    { id: 'glob', label: 'Glob' },
    { id: 'grep', label: 'Grep' },
    { id: 'read', label: 'Read' },
    { id: 'bash', label: 'Bash' }
  ],
  items: [
    { t: 'Which files in the repo are test files?', a: 'glob',
      why: 'A question about paths and shapes, answered without touching contents.' },
    { t: 'Where is the function <code>verifyToken</code> defined and called?', a: 'grep',
      why: 'A content question across the tree. One call returns file and line anchors; reading files to find it is the classic context-exhaustion path.' },
    { t: 'What exactly does <code>middleware/auth.ts</code> do between lines 40 and 70?', a: 'read',
      why: 'You already know the file and roughly where. Read is correct AFTER a search has narrowed it.' },
    { t: 'What changed on this branch relative to main?', a: 'bash',
      why: 'A git operation. Bash is for actions — and it should be scoped, e.g. Bash(git diff:*).' },
    { t: 'Are there any <code>.env.*</code> files anywhere in the tree?', a: 'glob',
      why: 'Pure path matching, no contents involved.' },
    { t: 'Which files import the deprecated <code>legacy-http</code> package?', a: 'grep',
      why: 'A content search. Grep returns the anchor set; reading candidate files to check imports is guessing.' },
    { t: 'Run the test suite for the package you just edited.', a: 'bash',
      why: 'An action with side effects, and the one legitimate use of a shell here.' },
    { t: 'Read the whole of <code>src/services/</code> to understand the module.', a: 'read',
      why: 'A trick item: Read is the tool named, but the STRATEGY is wrong. Grep for the specific thing; read the specific place. Reading a directory to build understanding does not scale to the next question.' },
    { t: 'What is the exact wording of the error string a user reported?', a: 'grep',
      why: 'A distinctive literal is the ideal grep target and turns discovery into one call.' },
    { t: 'What does the package manifest declare as the build script?', a: 'read',
      why: 'A known file, small, read directly. Orientation reads like this are cheap and appropriate.' },
    { t: 'Find every route file so you can count the API surface.', a: 'glob',
      why: 'Enumerate by path shape first; do not read them to count them.' },
    { t: 'Install the new dependency and regenerate the lockfile.', a: 'bash',
      why: 'A package-manager action. Note that search and read must NOT be routed through Bash via cat, find or grep — that bypasses the purpose-built tools and their output handling.' }
  ]
},

/* ---------------------------------------------------------- 10 */
{
  id: 'a2ex10', type: 'json', topics: 'O35 · MCP integration', level: 'Scored 50%',
  title: 'Configure MCP servers: scope, credentials, discovery',
  brief: 'Three requirements. The GitHub and internal-metrics servers must be available to all 400 engineers, ' +
         'identically and reproducibly. No credential may appear in the repository. The deployment server\'s write ' +
         'tools must be unavailable to everyone, with no local override possible. Produce a configuration object ' +
         'with an <code>mcpServers</code> block, a <code>scopes</code> note per server, and a ' +
         '<code>managedPolicy</code> block.',
  starter: '{\n  "mcpServers": {},\n  "scopes": {},\n  "managedPolicy": {},\n  "verifyDiscovery": ""\n}',
  checks: [
    { label: 'Valid JSON with an mcpServers object', fn: function (o) { return o && typeof o.mcpServers === 'object' && Object.keys(o.mcpServers).length >= 2; } },
    { label: 'No literal credential values anywhere in the configuration', fn: function (o, raw) { return !has(raw, /(ghp_[A-Za-z0-9]{6,}|sk-[A-Za-z0-9]{8,}|Bearer\s+[A-Za-z0-9._-]{12,})/); } },
    { label: 'Credentials are referenced by environment variable expansion', fn: function (o, raw) { return has(raw, /\$\{[A-Z_][A-Z0-9_]*(:-[^}]*)?\}/); } },
    { label: 'Shared servers are declared at project scope', fn: function (o, raw) { return has(raw, /project/i) && has(raw, /\.mcp\.json/i); } },
    { label: 'The scope choice is justified per server', fn: function (o) { return o && o.scopes && Object.keys(o.scopes).length >= 2 && Object.keys(o.scopes).every(function (k) { return String(o.scopes[k]).length > 20; }); } },
    { label: 'A managed-policy deny covers the deployment write tools', fn: function (o, raw) { return has(raw, /managed/i) && has(raw, /deny/i); } },
    { label: 'The deny rule uses namespaced MCP tool names', fn: function (o, raw) { return has(raw, /mcp__[a-z0-9_-]+__[a-z0-9_*-]+/i); } },
    { label: 'The policy explains that no user-editable layer can override it', fn: function (o, raw) { return has(raw, /(cannot be overridden|no local override|outranks|above (all )?user)/i); } },
    { label: 'A discovery verification step is described', fn: function (o) { return typeof (o && o.verifyDiscovery) === 'string' && o.verifyDiscovery.length > 40; } },
    { label: 'Verification checks the tool names actually appear, not just that the server starts', fn: function (o) { return /(list|appear|namespaced|tool names?|discover)/i.test((o && o.verifyDiscovery) || ''); } }
  ],
  solution:
'{\n  "mcpServers": {\n    "github": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-github"],\n      "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }\n    },\n    "metrics": {\n      "url": "https://mcp.internal.corvus/metrics",\n      "headers": { "Authorization": "Bearer ${METRICS_TOKEN:-}" }\n    },\n    "deploy": {\n      "url": "https://mcp.internal.corvus/deploy",\n      "headers": { "Authorization": "Bearer ${DEPLOY_TOKEN:-}" }\n    }\n  },\n  "scopes": {\n    "github": "project scope, committed in .mcp.json — every engineer needs it and the configuration must be identical and reproducible across 400 machines",\n    "metrics": "project scope, committed in .mcp.json — shared team tooling, same reasoning; the per-engineer credential comes from the environment",\n    "deploy": "project scope so the read tools are available uniformly, with its write tools removed by managed policy rather than by asking people to omit them"\n  },\n  "managedPolicy": {\n    "location": "enterprise-managed settings, which outrank every user-editable layer and cannot be overridden by project or local settings",\n    "permissions": {\n      "deny": [\n        "mcp__deploy__trigger_deploy",\n        "mcp__deploy__rollback",\n        "mcp__deploy__set_env"\n      ]\n    },\n    "why": "a must-hold requirement with no local override is exactly the managed-settings case; deny also outranks any allow in a merged rule set"\n  },\n  "verifyDiscovery": "A server that starts is not a server whose tools are usable. After configuring, list the server\'s tools and confirm the namespaced names (mcp__github__*, mcp__metrics__*) actually appear in the session, and confirm the deny rules reference those exact names. Silent discovery failure is the usual cause of \\"the agent ignores our MCP server\\"."\n}',
  notes: 'Three independent decisions that candidates tend to fuse. <strong>Scope</strong> answers who gets the ' +
         'server. <strong>Environment expansion</strong> answers how the committed file stays free of secrets — and ' +
         'committing a literal token is wrong even in a genuinely private repo, because it is permanent in history, ' +
         'shared by everyone who clones, and unrotatable per user. <strong>Managed policy</strong> answers what no ' +
         'engineer may grant themselves. Verifying discovery is the fourth thing, and it is the one that turns a ' +
         'plausible configuration into a working one.'
},

/* ---------------------------------------------------------- 11 */
{
  id: 'a2ex11', type: 'json', topics: 'O26 · O29 · extraction', level: 'Scored 67% / 50%',
  title: 'Design an extraction schema that cannot force a lie',
  brief: 'Build the schema for a claim form. Fields: <code>policy_number</code> (may be genuinely absent), ' +
         '<code>claim_date</code> (regional DD/MM vs MM/DD ambiguity), <code>claimed_amount</code> (never ' +
         'negative), <code>secondary_insurer</code> (may not apply to this document type, or may be illegible), ' +
         'and <code>document_type</code> (five known types, plus documents outside the list, plus unreadable ' +
         'scans). The rule: a schema that cannot express absence forces fabrication.',
  starter: '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}',
  checks: [
    { label: 'Valid JSON Schema with properties and a required array', fn: function (o) { return o && o.type === 'object' && o.properties && Array.isArray(o.required); } },
    { label: 'All five fields are present', fn: function (o) { var p=(o&&o.properties)||{}; return ['policy_number','claim_date','claimed_amount','secondary_insurer','document_type'].every(function(k){return p[k];}); } },
    { label: 'policy_number is nullable but its KEY stays required', fn: function (o) { var p=(o&&o.properties)||{}; return nullable(p.policy_number) && arr(o&&o.required).indexOf('policy_number') !== -1; } },
    { label: 'claim_date is nullable, so an unresolvable date is expressible', fn: function (o) { return nullable(((o&&o.properties)||{}).claim_date); } },
    { label: 'A companion status field distinguishes ambiguous from simply absent', fn: function (o, raw) { return has(raw, /(date_status|ambiguous)/i); } },
    { label: 'claimed_amount carries a numeric minimum of 0', fn: function (o) { var a=((o&&o.properties)||{}).claimed_amount||{}; return a.minimum === 0; } },
    { label: 'secondary_insurer is nullable AND has a status distinguishing not-applicable from illegible', fn: function (o, raw) { return nullable(((o&&o.properties)||{}).secondary_insurer) && has(raw, /not_?applicable/i) && has(raw, /illegible/i); } },
    { label: 'document_type is an enum', fn: function (o) { var d=((o&&o.properties)||{}).document_type||{}; return Array.isArray(d.enum) && d.enum.length >= 5; } },
    { label: 'The enum has BOTH an "other" and an "unclear" escape member', fn: function (o) { var d=((o&&o.properties)||{}).document_type||{}; var e=arr(d.enum).map(String).join(' ').toLowerCase(); return /other/.test(e) && /(unclear|unreadable|illegible)/.test(e); } },
    { label: 'Field descriptions carry the normalisation rule and the null semantics', fn: function (o, raw) { return has(raw, /"description"/) && has(raw, /(ISO ?8601|YYYY-MM-DD)/i) && has(raw, /null/i); } },
    { label: 'The date description states what to do when the region is unknown', fn: function (o, raw) { return has(raw, /(region|DD\/MM|MM\/DD)/i) && has(raw, /(no (regional )?signal|cannot|unknown|unable)/i); } }
  ],
  solution:
'{\n  "type": "object",\n  "properties": {\n    "policy_number": {\n      "type": ["string", "null"],\n      "description": "The policy number exactly as printed. Return null if no policy number appears anywhere in the document. Never infer one from a claim or account number."\n    },\n    "claim_date": {\n      "type": ["string", "null"],\n      "description": "ISO 8601 (YYYY-MM-DD). Resolve DD/MM vs MM/DD using the broker region recorded on the document. If no regional signal is available and the value is genuinely ambiguous, return null and set date_status to \'ambiguous\'."\n    },\n    "date_status": {\n      "type": "string",\n      "enum": ["resolved", "ambiguous", "absent"],\n      "description": "Why claim_date holds the value it does. \'ambiguous\' means two readings are equally supported; route these to review."\n    },\n    "claimed_amount": {\n      "type": ["number", "null"],\n      "minimum": 0,\n      "description": "The total claimed, in the document currency, as a number with no separators. Return null if no total is stated. Cross-field arithmetic (line items summing to this total) is validated after parsing, not here."\n    },\n    "secondary_insurer": {\n      "type": ["string", "null"],\n      "description": "Named secondary insurer. Return null when absent, illegible or not applicable, and use secondary_insurer_status to say which."\n    },\n    "secondary_insurer_status": {\n      "type": "string",\n      "enum": ["present", "not_applicable", "illegible", "absent"],\n      "description": "Distinguishes a document type that has no secondary insurer from a page that could not be read. These drive different fixes, so they must be separately countable."\n    },\n    "document_type": {\n      "type": "string",\n      "enum": ["claim_form", "invoice", "medical_report", "policy_schedule", "correspondence", "other", "unclear"],\n      "description": "\'other\' means a real document type outside this list — a rising rate means extend the enum. \'unclear\' means the document could not be read well enough to classify — a rising rate means an intake or scan-quality problem."\n    }\n  },\n  "required": ["policy_number", "claim_date", "date_status", "claimed_amount", "secondary_insurer", "secondary_insurer_status", "document_type"]\n}',
  notes: 'Three ideas are being graded at once. <strong>Required-but-nullable</strong> is the preferred form: ' +
         'consumers always find the key and only test for null, and the per-field null rate becomes a measurable ' +
         'early warning that a layout changed. <strong>Null answers whether, a status answers why</strong> — three ' +
         'situations need two dimensions. And <strong>"other" and "unclear" are not the same escape hatch</strong>: ' +
         'one says extend the enum, the other says fix the scanner, so a single catch-all collapses two metrics ' +
         'into one number nobody can act on.'
},

/* ---------------------------------------------------------- 12 */
{
  id: 'a2ex12', type: 'json', topics: 'O22 · human review routing', level: 'Scored 67% twice',
  title: 'Route to human review on signal, not at random',
  brief: 'Today 8% of extractions go to review by random sampling; the queue is mostly correct documents while ' +
         'adjudication keeps finding errors nobody reviewed. Design the routing policy. The objective is explicit: ' +
         'route on <strong>confidence scores, document characteristics and field-level ambiguity</strong> rather ' +
         'than random sampling. Include per-field thresholds and say what happens to random sampling.',
  starter: '{\n  "fieldThresholds": {},\n  "documentSignals": [],\n  "ambiguityRules": [],\n  "randomSample": {}\n}',
  checks: [
    { label: 'Valid JSON with all four sections present', fn: function (o) { return o && o.fieldThresholds && Array.isArray(o.documentSignals) && Array.isArray(o.ambiguityRules) && o.randomSample; } },
    { label: 'Thresholds are per field, not one global value', fn: function (o) { return o && o.fieldThresholds && Object.keys(o.fieldThresholds).length >= 3; } },
    { label: 'Thresholds differ between fields', fn: function (o) { var v=Object.values((o&&o.fieldThresholds)||{}).map(function(x){return typeof x==='object'?x.threshold:x;}); return new Set(v.map(String)).size > 1; } },
    { label: 'A money or high-consequence field has the strictest threshold', fn: function (o) { var f=(o&&o.fieldThresholds)||{}; var k=Object.keys(f).filter(function(x){return /amount|total|payment|sum/i.test(x);})[0]; if(!k) return false; var g=function(x){return typeof x==='object'?x.threshold:x;}; var mine=Number(g(f[k])); return Object.keys(f).every(function(x){return Number(g(f[x]))<=mine;}); } },
    { label: 'Thresholds are justified by the cost of that field being wrong', fn: function (o, raw) { return has(raw, /(cost|consequence|pays|risk|impact)/i); } },
    { label: 'Document signals include unseen layout or unknown vendor', fn: function (o, raw) { return has(raw, /(unseen|new (broker|vendor)|unknown (broker|vendor)|unfamiliar layout)/i); } },
    { label: 'Document signals include input quality (scan, fax, resolution)', fn: function (o, raw) { return has(raw, /(scan|fax|resolution|image quality|OCR)/i); } },
    { label: 'Ambiguity rules route on genuine field-level ambiguity, not low confidence', fn: function (o, raw) { return has(raw, /ambiguous/i); } },
    { label: 'Random sampling is RETAINED at a small rate', fn: function (o, raw) { return has(raw, /random/i) && !/remove random|replace random|drop random|eliminate random/i.test(raw); } },
    { label: 'The purpose of the retained sample is stated as measurement, not error-catching', fn: function (o, raw) { return has(raw, /(measure|calibrat|baseline|unreviewed|error rate)/i); } }
  ],
  solution:
'{\n  "fieldThresholds": {\n    "claimed_amount":    { "threshold": 0.98, "why": "this field pays money; a wrong digit is a wrong payment, so the bar is the strictest in the schema" },\n    "policy_number":    { "threshold": 0.95, "why": "a wrong policy number attaches the claim to the wrong contract, which is expensive but recoverable" },\n    "claim_date":       { "threshold": 0.93, "why": "drives eligibility windows; wrong dates cause wrong denials" },\n    "notes":            { "threshold": 0.60, "why": "free text that no automated decision consumes; a strict bar here would flood the queue for no benefit" }\n  },\n  "documentSignals": [\n    { "signal": "layout_hash unseen in the last 90 days", "action": "route", "why": "predicts error before extraction is even attempted" },\n    { "signal": "broker_id not in the known-good set",    "action": "route", "why": "new partners are where systematic layout errors first appear" },\n    { "signal": "source == fax OR scan_dpi < 200",        "action": "route", "why": "measured accuracy on this channel is 71% versus 99.1% on native PDFs" },\n    { "signal": "page_count > 40",                        "action": "route", "why": "long documents are where truncation and section-skipping errors concentrate" }\n  ],\n  "ambiguityRules": [\n    { "rule": "any field whose status is \'ambiguous\'", "action": "route", "why": "the model cannot resolve it at ANY confidence; only a human can. This is distinct from low confidence." },\n    { "rule": "document_type == \'unclear\'",            "action": "route", "why": "classification failed, so every downstream field is suspect" },\n    { "rule": "line items do not sum to claimed_amount", "action": "route", "why": "a deterministic post-parse invariant violation, caught in code rather than by confidence" }\n  ],\n  "randomSample": {\n    "rate": 0.02,\n    "appliesTo": "documents that no other rule routed",\n    "purpose": "measure the true error rate of the UNREVIEWED population — the one thing targeted routing cannot tell you. Without it you know what you caught and not what you missed.",\n    "usedFor": "recalibrating the per-field thresholds quarterly"\n  }\n}',
  notes: 'Two things separate a full-credit answer. <strong>Per-field thresholds</strong>: a single global bar is ' +
         'far too loose for the amount and far too tight for free text, so the threshold must come from the cost of ' +
         'that specific field being wrong. And <strong>keep the random sample</strong>: routing catches errors, ' +
         'sampling measures the ones you did not catch. "Replace sampling with routing" is the subtly wrong answer ' +
         'this objective is built around — the right framing is route on signal, sample to calibrate.'
},

/* ---------------------------------------------------------- 13 */
{
  id: 'a2ex13', type: 'text', topics: 'O3 · O19 · O20 · context contracts', level: 'Scored 67% / 50%',
  title: 'Write the synthesis contract',
  brief: 'Three investigators return finding sets; a synthesis agent must produce one report. Write the synthesis ' +
         'agent\'s system prompt. It has to preserve source-level uncertainty rather than collapsing conflicting ' +
         'data into confident statements, and it must not introduce anything no investigator produced. Cover: ' +
         'conflict handling, confidence propagation, attribution, gap reporting, and the no-new-facts rule.',
  starter: '# Role\n\n\n# Inputs\n\n\n# Rules\n\n\n# Output\n',
  checks: [
    { label: 'States that synthesis reasons over worker output only', fn: function (o, raw) { return has(raw, /(only|solely|exclusively)[\s\S]{0,90}(investigator|worker|pass|input)/i); } },
    { label: 'Contains an explicit no-new-claims rule', fn: function (o, raw) { return has(raw, /(may not|must not|never)[\s\S]{0,80}(introduce|add|invent|new (claim|fact))/i); } },
    { label: 'Handles conflict by reporting both positions with their sources', fn: function (o, raw) { return has(raw, /(conflict|disagree|contradict)/i) && has(raw, /(both|each) (position|source|side|view)/i); } },
    { label: 'Forbids silently picking the more confident-sounding source', fn: function (o, raw) { return has(raw, /(never|do not|must not)[\s\S]{0,80}(pick|choose|select|average|resolve)/i); } },
    { label: 'States confidence propagation: a conclusion is at most as strong as its weakest input', fn: function (o, raw) { return has(raw, /(weakest|no stronger than|at most as strong|lowest)/i); } },
    { label: 'Requires per-claim attribution to an investigator and a source', fn: function (o, raw) { return has(raw, /attribut|cite|trace/i) && has(raw, /(source|investigator|agent)/i); } },
    { label: 'Requires gaps to appear in the output rather than as silence', fn: function (o, raw) { return has(raw, /gap/i) && has(raw, /(report|state|list|surface|include)/i); } },
    { label: 'Distinguishes at least three epistemic states', fn: function (o, raw) { return (['established','corroborat','single-?source','contested','probable','unverified'].filter(function (t) { return new RegExp(t,'i').test(raw); }).length) >= 3; } },
    { label: 'Warns that agreement counts only when sources are independent', fn: function (o, raw) { return has(raw, /independen/i); } },
    { label: 'Specifies a structured output shape rather than free prose', fn: function (o, raw) { return has(raw, /\{[\s\S]*\}/) || has(raw, /(field|schema|json)/i); } },
    { label: 'Says what to do when a decision is costly and the evidence is contested', fn: function (o, raw) { return has(raw, /(human|escalat|review)/i); } }
  ],
  solution:
'# Role\nYou are a synthesis agent. You reason exclusively over the investigator reports\nyou are given, and over nothing else.\nYou have no tools. You do not gather, verify, or look anything up.\n\n# Inputs\nA list of investigator reports, each with: findings (claim, evidence[], confidence),\na coverage object, and an unresolved list.\n\n# Rules\n1. NO NEW CLAIMS. You may not introduce any statement that does not appear in an\n   investigator report. If something obvious seems missing, report it as a gap.\n2. CONFLICT. Where investigators disagree, report BOTH positions with their sources\n   and dates, and state what would settle it. Never average two numbers, and never\n   silently pick the more confident-sounding source.\n3. CONFIDENCE PROPAGATION. A conclusion is at most as strong as its weakest\n   supporting claim. Two "probable" inputs do not make an "established" output.\n4. INDEPENDENCE. Agreement between investigators is evidence only if their SOURCES\n   were independent. Three agents that read the same stale document agree and are\n   all wrong; check the evidence refs before treating corroboration as strength.\n5. ATTRIBUTION. Every claim in the report names the investigator that produced it\n   and the source reference behind it.\n6. GAPS. Anything no investigator covered appears in the output as a gap. Coverage\n   and unresolved fields from each report must be carried through, not dropped.\n7. ESCALATION. If a contested claim drives a costly or irreversible decision, mark\n   it for human review rather than resolving it yourself.\n\n# Output\n{\n  "claims": [\n    { "statement": "...",\n      "status": "established" | "single_source" | "contested",\n      "supported_by": [{ "agent": "...", "source": "...", "ref": "...", "date": "..." }],\n      "contested_by":  [{ "agent": "...", "source": "...", "ref": "...", "date": "..." }],\n      "needs_human": true | false }\n  ],\n  "gaps": ["what nobody covered, and which investigator would have owned it"],\n  "coverage_rollup": { "sources_examined": 0, "sources_skipped": 0 }\n}',
  notes: 'The rule that carries most of the marks is <strong>no new claims</strong> — and the configuration that ' +
         'enforces it is removing the synthesis agent\'s tools entirely, because a prompt rule alone is surface ' +
         'four guarding a surface one hole. The subtlest requirement is the independence check: "take the majority ' +
         'view" is a distractor precisely because three agents reading one stale document will agree with each ' +
         'other and be wrong together.'
},

/* ---------------------------------------------------------- 14 */
{
  id: 'a2ex14', type: 'lab', topics: 'O14 · O11 · O33 · terminal lab', level: 'Terminal lab',
  title: 'Lab — forked skills, a bounded CI invocation, and a scoped tool set',
  brief: 'Three of your zero-scored objectives are things you have to <em>see</em> before they stick. This lab ' +
         'takes about forty minutes and demonstrates context pollution, a runaway CI job, and an out-of-role tool ' +
         'call, in that order.',
  steps: [
    'Set up: <code>mkdir a2-lab &amp;&amp; cd a2-lab &amp;&amp; git init &amp;&amp; npm init -y</code>. Install two or three dependencies so there is a real lockfile to read.',
    '<strong>Context pollution.</strong> Create <code>.claude/commands/dep-audit.md</code> with a description and a body that reads <code>package.json</code> and the lockfile and returns a short risk table. Do NOT add <code>context: fork</code> yet.',
    'Start a session, ask an unrelated question about the repo, then run <code>/dep-audit</code> twice, then ask another unrelated question. Watch the later answers start referencing packages and advisories, and note how much sooner the session approaches compaction.',
    'Now add <code>context: fork</code> to the command frontmatter and repeat the exact same sequence in a fresh session. The command still works; the pollution is gone. This is the objective in one experiment.',
    'Try the counter-case: write <code>/explain-last-change</code> that describes the edit just made, add <code>context: fork</code>, and watch it fail because the thing it must describe lives in the session context a fork deliberately withholds.',
    '<strong>Runaway CI.</strong> Run <code>claude "summarise this repo"</code> with no flags in a terminal you can kill. Notice it attaches to an interactive session. Now add <code>-p</code> and watch it produce output and exit. That difference is a hung CI job.',
    'Add <code>--output-format json --max-turns 3</code> and give it a task that plainly needs more than three turns. Inspect the JSON: find how the run reports that it stopped on the turn budget, and write the shell condition that would fail the build on that — not on the exit code alone.',
    '<strong>Tool distribution.</strong> Create <code>.claude/agents/reviewer.md</code> with a system prompt saying it must never modify files, and NO <code>tools:</code> key. Ask it to review a file with an obvious one-line bug. Observe whether it stays a reviewer.',
    'Add <code>tools: Read, Grep, Glob</code> and repeat with the same file. The behaviour changes because the capability changed, not because the instruction got better. Sit with that for a moment — it is the whole of objective 33.',
    'Finally, give the reviewer a deliberately over-broad set (add <code>Bash</code>, <code>Write</code>, and half a dozen unrelated MCP tools if you have any configured) and ask a narrow question. Watch selection quality degrade as the catalogue grows. That is the second half of the objective: decision complexity, not just safety.'
  ],
  reveal:
'What each step is meant to prove:\n\n1-4  context: fork is about WHERE the work happens, not what it may touch. Without\n     it, every file the command reads is in your conversation for the rest of the\n     session, and invocation three inherits invocations one and two. With it, you\n     get the table and nothing else.\n\n5    Forking is a cost as well as a benefit. A command whose whole purpose is to\n     operate on the live conversation cannot run in an isolated context. "Fork\n     everything for consistency" is a wrong answer.\n\n6-7  -p is the difference between a job and a hang. --output-format json is the\n     difference between gating and string-matching. --max-turns bounds the loop,\n     and the run must FAIL the build when it exhausts the budget: a turn-limited\n     run that exits zero is a silent pass, which is the same silent-drop defect\n     the orchestration objectives are about.\n\n8-9  Omitting tools: means the subagent inherits the full tool set. A reviewer with\n     Edit edits — not from disobedience, but because in some situation fixing the\n     bug is obviously the helpful thing to do. Role boundaries are allowlists.\n\n10   The half people forget: fewer tools also means BETTER tool selection. Every\n     definition is tokens on every turn, and accuracy falls fastest where tools\n     are semantically similar.',
  notes: 'If you have time for only one section, do steps 8 to 10. Tool distribution scored 0% and it is the ' +
         'objective whose intuition is most easily fixed by watching it fail once.'
}

];
