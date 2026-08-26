/* =============================================================
   Claude Study Hub — CCAR-A1 exercise bank
   Types: classify | json | text | choice | lab
   ============================================================= */

var EXERCISES = [

/* ---------------------------------------------------------- 1 */
{
  id: 'ex1', type: 'classify', topics: 'Topic 2', level: 'Core',
  title: 'Route each requirement to the right configuration surface',
  brief: 'A retail bank is rolling out Claude Code to 400 engineers. For each requirement, choose the surface ' +
         'that actually enforces or expresses it. Remember: permissions answer "may this happen?", hooks answer ' +
         '"what must happen around it?", CLAUDE.md answers "what should Claude know?".',
  bins: [
    { id: 'perm',  label: 'permissions (settings.json)' },
    { id: 'hook',  label: 'Hook' },
    { id: 'md',    label: 'CLAUDE.md / rules' },
    { id: 'skill', label: 'Skill' }
  ],
  items: [
    { t: 'Claude must never read files under <code>secrets/</code> or any <code>.env</code> file.', a: 'perm',
      why: 'Security boundary, checkable from the tool input before execution → a <code>deny</code> rule (deployed via managed settings so nobody can override it).' },
    { t: 'Every edited Python file must be Black-formatted before the turn ends.', a: 'hook',
      why: 'Requires running a formatter — only a <code>PostToolUse</code> hook can execute something after the edit.' },
    { t: 'Service classes live in <code>src/services/</code>; handlers in <code>src/api/handlers/</code>.', a: 'md',
      why: 'A project fact that improves every session and has no deterministic check. Classic CLAUDE.md content.' },
    { t: 'Running <code>terraform apply</code> from a Claude session is forbidden.', a: 'perm',
      why: 'The command pattern is knowable before execution → <code>Bash(terraform apply:*)</code> in <code>deny</code>.' },
    { t: 'Every file write must be recorded in the compliance audit sink.', a: 'hook',
      why: 'A side effect that must occur 100% of the time. A model asked to "remember to log" will eventually not.' },
    { t: 'Our 34-step production release runbook.', a: 'skill',
      why: 'A long, multi-step procedure needed occasionally. Loading it into every session wastes context; a skill loads on demand.' },
    { t: 'Editing <code>package.json</code> should pause and ask a human.', a: 'perm',
      why: 'This is exactly what <code>permissions.ask</code> is for — the option candidates forget exists.' },
    { t: 'Prefer dependency injection over module-level singletons in this codebase.', a: 'md',
      why: 'A judgement-based convention with no mechanical check. Advisory context is the right home.' },
    { t: 'After touching <code>src/payments/</code>, the related unit tests must pass.', a: 'hook',
      why: 'Verification requires execution → <code>PostToolUse</code> hook, scoped to related tests so it stays fast.' },
    { t: 'A commit whose diff contains an AWS access key must be blocked before it happens.', a: 'hook',
      why: '"Before it happens" means <code>PreToolUse</code> — a hook that inspects <code>tool_input</code> and denies. <code>PostToolUse</code> would only detect it after the fact.' },
    { t: 'React component conventions that apply only to <code>*.tsx</code> files.', a: 'md',
      why: '<code>.claude/rules/react.md</code> with <code>paths: ["**/*.tsx"]</code> — the path-scoped form of CLAUDE.md, so it costs context only when relevant.' },
    { t: 'The build command is <code>pnpm build</code>, not <code>npm run build</code>.', a: 'md',
      why: 'A fact Claude needs in every session and cannot reliably infer. One line of CLAUDE.md.' }
  ]
},

/* ---------------------------------------------------------- 2 */
{
  id: 'ex2', type: 'json', topics: 'Topic 2', level: 'Core',
  title: 'Write the permissions block for a regulated repo',
  brief: 'Produce the <code>permissions</code> object for <code>.claude/settings.json</code> in a payments repo. ' +
         'Requirements: (a) reading <code>.env</code>, <code>.env.*</code> and anything under <code>secrets/</code> ' +
         'is forbidden; (b) outbound <code>curl</code> is forbidden; (c) editing <code>package.json</code> and ' +
         'pushing with git must prompt a human; (d) <code>npm run lint</code>, any <code>npm run test…</code>, and ' +
         'edits under <code>src/</code> are pre-approved.',
  starter: '{\n  "permissions": {\n    "deny":  [],\n    "ask":   [],\n    "allow": []\n  }\n}',
  checks: [
    { label: 'Valid JSON with a top-level "permissions" object', fn: function (o) { return o && typeof o.permissions === 'object'; } },
    { label: 'deny blocks .env (Read(./.env) or equivalent)', fn: function (o, raw) { return has(raw, /"deny"[\s\S]*?Read\([^)]*\.env/i); } },
    { label: 'deny blocks the whole secrets/ tree with ** (not just one level)', fn: function (o) { return arr(o.permissions && o.permissions.deny).some(function (r) { return /secrets\/\*\*/.test(r); }); } },
    { label: 'deny blocks curl', fn: function (o) { return arr(o.permissions && o.permissions.deny).some(function (r) { return /^Bash\(curl/i.test(r); }); } },
    { label: 'ask (not deny, not allow) contains package.json', fn: function (o) { return arr(o.permissions && o.permissions.ask).some(function (r) { return /package\.json/.test(r); }); } },
    { label: 'ask contains a git push rule', fn: function (o) { return arr(o.permissions && o.permissions.ask).some(function (r) { return /git push/i.test(r); }); } },
    { label: 'allow contains an exact "npm run lint" rule', fn: function (o) { return arr(o.permissions && o.permissions.allow).some(function (r) { return /npm run lint/.test(r); }); } },
    { label: 'allow contains a wildcarded npm run test rule', fn: function (o) { return arr(o.permissions && o.permissions.allow).some(function (r) { return /npm run test.*[:*]/.test(r); }); } },
    { label: 'allow contains Edit(src/**)', fn: function (o) { return arr(o.permissions && o.permissions.allow).some(function (r) { return /^Edit\(src\/\*\*\)/.test(r); }); } },
    { label: 'Nothing in allow re-opens a denied path', fn: function (o) { return !arr(o.permissions && o.permissions.allow).some(function (r) { return /\.env|secrets\//.test(r); }); } }
  ],
  solution:
'{\n  "permissions": {\n    "deny": [\n      "Read(./.env)",\n      "Read(./.env.*)",\n      "Read(./secrets/**)",\n      "Bash(curl:*)"\n    ],\n    "ask": [\n      "Edit(package.json)",\n      "Bash(git push:*)"\n    ],\n    "allow": [\n      "Bash(npm run lint)",\n      "Bash(npm run test:*)",\n      "Edit(src/**)"\n    ]\n  }\n}',
  notes: 'Evaluation order is <strong>deny → ask → allow</strong>, so a path listed in both <code>deny</code> and ' +
         '<code>allow</code> stays denied — but relying on that is bad hygiene. Note <code>*</code> stops at a path ' +
         'separator while <code>**</code> crosses directories, which is why <code>secrets/*</code> would leave ' +
         '<code>secrets/prod/keys.json</code> readable. If this must survive a developer editing the project file, ' +
         'ship the same block through <strong>managed settings</strong>.'
},

/* ---------------------------------------------------------- 3 */
{
  id: 'ex3', type: 'json', topics: 'Topic 3', level: 'Core',
  title: 'Configure the PostToolUse quality gate',
  brief: 'Write the <code>hooks</code> block that runs <code>.claude/hooks/quality-gate.sh</code> after every ' +
         '<code>Edit</code> and <code>Write</code> (and nothing else). Give it a 120-second budget, a status ' +
         'message, and a project-anchored path.',
  starter: '{\n  "hooks": {\n    \n  }\n}',
  checks: [
    { label: 'Valid JSON with hooks.PostToolUse as an array', fn: function (o) { return o && o.hooks && Array.isArray(o.hooks.PostToolUse); } },
    { label: 'Event is PostToolUse, not PreToolUse', fn: function (o) { return o && o.hooks && !o.hooks.PreToolUse && !!o.hooks.PostToolUse; } },
    { label: 'matcher targets Edit and Write only', fn: function (o, raw) { return has(raw, /"matcher"\s*:\s*"(Edit\|Write|Write\|Edit)"/); } },
    { label: 'matcher is not "*" (would fire on Read, Bash, everything)', fn: function (o, raw) { return !has(raw, /"matcher"\s*:\s*"\*?"/); } },
    { label: 'Handler type is "command"', fn: function (o, raw) { return has(raw, /"type"\s*:\s*"command"/); } },
    { label: 'Script path is anchored with ${CLAUDE_PROJECT_DIR}', fn: function (o, raw) { return has(raw, /\$\{CLAUDE_PROJECT_DIR\}/); } },
    { label: 'Points at quality-gate.sh', fn: function (o, raw) { return has(raw, /quality-gate\.sh/); } },
    { label: 'timeout is set to 120', fn: function (o, raw) { return has(raw, /"timeout"\s*:\s*120\b/); } },
    { label: 'A statusMessage is present', fn: function (o, raw) { return has(raw, /"statusMessage"\s*:\s*"[^"]+"/); } }
  ],
  solution:
'{\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Edit|Write",\n        "hooks": [\n          {\n            "type": "command",\n            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/quality-gate.sh",\n            "args": [],\n            "timeout": 120,\n            "statusMessage": "Formatting, linting and testing\\u2026"\n          }\n        ]\n      }\n    ]\n  }\n}',
  notes: 'Because <code>Edit|Write</code> contains only letters and a pipe, it is evaluated as an exact alternation ' +
         'list rather than a regex. Anything with other characters (<code>^Notebook</code>, ' +
         '<code>mcp__github__.*</code>) is treated as an unanchored JavaScript regex. Always anchor script paths ' +
         'with <code>${CLAUDE_PROJECT_DIR}</code> — the hook\'s working directory is not guaranteed. Put this in ' +
         '<code>.claude/settings.json</code> (committed) so the whole team inherits the gate.'
},

/* ---------------------------------------------------------- 4 */
{
  id: 'ex4', type: 'text', topics: 'Topic 3', level: 'Stretch',
  title: 'Write the quality-gate hook script',
  brief: 'Write the bash script the previous exercise invokes. It must: read the hook JSON from <strong>stdin</strong>, ' +
         'extract <code>tool_input.file_path</code>, exit 0 harmlessly when there is no file, auto-format, run a ' +
         'linter, and on failure print the <em>real</em> diagnostics to <strong>stderr</strong> and exit <strong>2</strong>.',
  starter: '#!/usr/bin/env bash\nset -uo pipefail\n\n# read the hook payload from stdin\n\n',
  checks: [
    { label: 'Reads the payload from stdin', fn: function (o, raw) { return has(raw, /\$\(\s*cat\s*\)|read -r|\/dev\/stdin/); } },
    { label: 'Extracts tool_input.file_path (e.g. with jq)', fn: function (o, raw) { return has(raw, /tool_input\s*[.\]"']*\s*\.?\s*file_path|\.tool_input\.file_path/); } },
    { label: 'Guards the empty / missing file case with an early exit 0', fn: function (o, raw) { return has(raw, /(-z\s+"?\$|! *-f|-f\s+"?\$)[\s\S]{0,80}exit 0/); } },
    { label: 'Auto-formats before complaining (black / prettier / gofmt / rustfmt)', fn: function (o, raw) { return has(raw, /black|prettier|gofmt|rustfmt|ruff format/i); } },
    { label: 'Runs a linter or type-checker', fn: function (o, raw) { return has(raw, /ruff|eslint|flake8|tsc|mypy|golangci/i); } },
    { label: 'Redirects diagnostics to stderr (>&2)', fn: function (o, raw) { return has(raw, />&\s*2/); } },
    { label: 'Exits 2 on failure so Claude is handed the error and can self-correct', fn: function (o, raw) { return has(raw, /exit\s+2/); } },
    { label: 'Bounds the output volume (head / tail)', fn: function (o, raw) { return has(raw, /\|\s*(head|tail)\b/); } },
    { label: 'Ends with an explicit exit 0 on the success path', fn: function (o, raw) { return has(raw, /exit\s+0\s*$/m); } }
  ],
  solution:
'#!/usr/bin/env bash\nset -uo pipefail\n\nINPUT=$(cat)\nFILE=$(echo "$INPUT" | jq -r \'.tool_input.file_path // empty\')\n\n[ -z "$FILE" ] && exit 0      # not a file-editing tool\n[ -f "$FILE" ] || exit 0      # file was deleted or moved\n\ncase "$FILE" in\n  *.py)\n    black -q "$FILE"                                  # auto-repair, silently\n    if ! OUT=$(ruff check "$FILE" 2>&1); then\n      echo "$OUT" | head -40 >&2                      # real diagnostics -> Claude\n      exit 2                                          # block; Claude fixes next turn\n    fi\n    ;;\n  *.ts|*.tsx)\n    npx prettier --write "$FILE" >/dev/null 2>&1\n    if ! OUT=$(npx tsc --noEmit -p tsconfig.json 2>&1); then\n      echo "$OUT" | head -40 >&2\n      exit 2\n    fi\n    ;;\n  *) exit 0 ;;\nesac\n\n# expensive checks stay scoped so the gate remains usable\nif [[ "$FILE" == src/payments/* ]]; then\n  if ! OUT=$(npm test -- --findRelatedTests "$FILE" 2>&1); then\n    echo "$OUT" | tail -60 >&2\n    exit 2\n  fi\nfi\n\nexit 0',
  notes: 'The load-bearing detail: <strong>exit 2 sends stderr back to Claude</strong>. That text is the model\'s ' +
         'entire view of what went wrong, so <code>echo "lint failed" >&2</code> produces guess-driven edits while ' +
         'piping the actual linter output produces a targeted fix. Equally important is scoping — a hook that runs ' +
         'a six-minute suite after every keystroke gets deleted by the team, and a deleted hook enforces nothing.'
},

/* ---------------------------------------------------------- 5 */
{
  id: 'ex5', type: 'choice', topics: 'Topic 3', level: 'Core',
  title: 'Pick the hook event',
  brief: 'For each requirement, choose the lifecycle event that satisfies it. The discriminator is almost always ' +
         'one word in the requirement: <em>prevent</em> vs <em>after</em> vs <em>before finishing</em>.',
  questions: [
    { q: 'A write to a path matching <code>infra/prod/**</code> must be blocked outright.',
      opts: ['PreToolUse', 'PostToolUse', 'Stop', 'SessionStart'], a: 0,
      why: 'Only <code>PreToolUse</code> runs before the tool executes and can deny it. <code>PostToolUse</code> would fire after the file is already written.' },
    { q: 'Every edited file must be Prettier-formatted.',
      opts: ['PreToolUse', 'PostToolUse', 'PreCompact', 'Notification'], a: 1,
      why: 'The file must exist before it can be formatted — a verify-and-repair job, which is exactly <code>PostToolUse</code>.' },
    { q: 'The agent must not end its turn while the test suite is red.',
      opts: ['PostToolUse', 'Stop', 'SessionEnd', 'UserPromptSubmit'], a: 1,
      why: '<code>Stop</code> fires when the agent tries to finish the turn and can block it, sending the failure back. <code>SessionEnd</code> is too late — the turn is already over.' },
    { q: 'Facts gathered during a long session must be persisted before context is compacted.',
      opts: ['PreCompact', 'PostToolUse', 'Stop', 'SessionStart'], a: 0,
      why: '<code>PreCompact</code> is the one point at which you still have the full context and know it is about to be summarized.' },
    { q: 'Every session should start with the current sprint ticket list injected as context.',
      opts: ['SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse'], a: 0,
      why: '<code>SessionStart</code> runs once per session and can add context. <code>UserPromptSubmit</code> would re-inject it on every single prompt, wasting tokens.' },
    { q: 'A prompt containing a customer account number must be rejected before it reaches the model.',
      opts: ['UserPromptSubmit', 'PreToolUse', 'SessionStart', 'PostToolUse'], a: 0,
      why: '<code>UserPromptSubmit</code> is the only event that sees the prompt before it is processed, and it can block.' }
  ]
},

/* ---------------------------------------------------------- 6 */
{
  id: 'ex6', type: 'json', topics: 'Topic 5', level: 'Core',
  title: 'Design an extraction schema that cannot force a lie',
  brief: 'An insurer extracts claim forms. <code>adjuster_name</code> is absent on ~25% of forms; <code>claim_type</code> ' +
         'has five known values but new ones appear; <code>incident_date</code> arrives in several formats; some ' +
         'scans are illegible. Write the JSON schema. Keep keys required but make values nullable, give the enums ' +
         'escape hatches, put the format contract in descriptions, and model the outcome.',
  starter: '{\n  "type": "object",\n  "additionalProperties": false,\n  "required": [],\n  "properties": {\n    \n  }\n}',
  checks: [
    { label: 'Valid JSON object schema', fn: function (o) { return o && o.type === 'object' && o.properties; } },
    { label: 'additionalProperties is false', fn: function (o) { return o.additionalProperties === false; } },
    { label: 'A required array exists and is non-empty (keys required, values nullable)', fn: function (o) { return arr(o.required).length > 0; } },
    { label: 'adjuster_name exists and is nullable', fn: function (o) { return o.properties.adjuster_name && nullable(o.properties.adjuster_name); } },
    { label: 'incident_date exists and is nullable', fn: function (o) { return o.properties.incident_date && nullable(o.properties.incident_date); } },
    { label: 'incident_date description states an explicit target format (ISO-8601 / YYYY-MM-DD)', fn: function (o) { return /iso|yyyy-mm-dd/i.test((o.properties.incident_date || {}).description || ''); } },
    { label: 'claim_type is an enum', fn: function (o) { return Array.isArray((o.properties.claim_type || {}).enum); } },
    { label: 'claim_type enum has an "other"-style escape hatch (real value outside the list)', fn: function (o) { return arr((o.properties.claim_type || {}).enum).some(function (v) { return /^(other|unlisted)$/i.test(String(v)); }); } },
    { label: 'claim_type enum has an "unclear"/"unknown" hatch (cannot be determined)', fn: function (o) { return arr((o.properties.claim_type || {}).enum).some(function (v) { return /^(unclear|unknown|indeterminate)$/i.test(String(v)); }); } },
    { label: 'An extraction_status field records the outcome of the extraction itself', fn: function (o) { return !!o.properties.extraction_status; } },
    { label: 'extraction_status can express illegibility', fn: function (o, raw) { return /illegible|unreadable/i.test(raw); } },
    { label: 'A fields_not_found array records which requested fields were absent', fn: function (o) { return o.properties.fields_not_found && o.properties.fields_not_found.type === 'array'; } },
    { label: 'A needs_human_review boolean routes the residue to people', fn: function (o) { return (o.properties.needs_human_review || {}).type === 'boolean'; } },
    { label: 'At least one description explains null semantics ("null if…")', fn: function (o, raw) { return /null (if|when)/i.test(raw); } }
  ],
  solution:
'{\n  "type": "object",\n  "additionalProperties": false,\n  "required": ["claim_number", "claim_type", "incident_date",\n               "adjuster_name", "extraction_status", "fields_not_found",\n               "needs_human_review"],\n  "properties": {\n    "claim_number": {\n      "type": ["string", "null"],\n      "description": "Claim reference exactly as printed. null if no claim number appears."\n    },\n    "claim_type": {\n      "type": "string",\n      "enum": ["auto", "property", "liability", "health", "travel",\n               "other", "unclear"],\n      "description": "\'other\' = a real claim type outside this list (taxonomy gap). \'unclear\' = cannot be determined from the document (evidence gap)."\n    },\n    "incident_date": {\n      "type": ["string", "null"],\n      "description": "Date of the incident normalized to ISO-8601 YYYY-MM-DD. Source forms use DD/MM/YYYY (EU) and MM/DD/YYYY (US); resolve using the policy region when shown. If the order is genuinely ambiguous, return null and set extraction_status to \'ambiguous\'. Do not guess."\n    },\n    "adjuster_name": {\n      "type": ["string", "null"],\n      "description": "Assigned adjuster. null if the field is absent or blank on the form \\u2014 roughly a quarter of forms have no adjuster assigned yet."\n    },\n    "claimed_amount": {\n      "type": ["number", "null"],\n      "description": "Amount claimed, as a number with no currency symbol and no thousands separators. null if not stated."\n    },\n    "extraction_status": {\n      "type": "string",\n      "enum": ["complete", "partial", "illegible", "ambiguous",\n               "wrong_document_type"],\n      "description": "\'partial\' = some requested fields were absent. \'illegible\' = the scan could not be read. \'ambiguous\' = multiple plausible readings existed."\n    },\n    "fields_not_found": {\n      "type": "array",\n      "items": { "type": "string" },\n      "description": "Names of requested fields that do not appear on the document. Drives routing and the feedback loop."\n    },\n    "needs_human_review": {\n      "type": "boolean",\n      "description": "True when any field was ambiguous or illegible, or when claimed_amount is null."\n    }\n  }\n}',
  notes: 'Required keys with nullable values beat optional keys: consumers always find the field and only test for ' +
         '<code>null</code>, and you can count nulls per field directly in your metrics. The twin escape hatches ' +
         'matter because they diagnose different problems — a rising <code>"other"</code> rate says extend the enum, ' +
         'a rising <code>"unclear"</code> rate says fix the scanning. Remember that numeric bounds and cross-field ' +
         'rules ("amount must be positive", "total = sum of lines") cannot go in the schema at all; they belong in a ' +
         'post-parse validator.'
},

/* ---------------------------------------------------------- 7 */
{
  id: 'ex7', type: 'classify', topics: 'Topic 6 · 7', level: 'Core',
  title: 'Diagnose the extraction symptom, then prescribe',
  brief: 'Each row is an observed failure in a document-extraction pipeline. Choose the single intervention that ' +
         'addresses the cause rather than the symptom.',
  bins: [
    { id: 'schema',  label: 'Schema change' },
    { id: 'desc',    label: 'Format / description fix' },
    { id: 'fewshot', label: 'Few-shot examples' },
    { id: 'code',    label: 'Validation code' }
  ],
  items: [
    { t: 'The model invents PO numbers on the 30% of invoices that have none.', a: 'schema',
      why: 'The field is required and non-nullable, so "absent" is inexpressible. Make it nullable — no prompt wording can beat a grammar that forbids the truth.' },
    { t: 'Dates are extracted correctly but appear as <code>3/4/26</code>, <code>04-Mar-2026</code> and <code>2026-03-04</code>.', a: 'desc',
      why: 'Right value, wrong normalization. The fix is an explicit format contract in the field description, including how to resolve DD/MM vs MM/DD and what to do when it cannot be resolved.' },
    { t: 'Accuracy is 97% on Vendor A and 71% on Vendor B; Vendor B uses a two-column layout.', a: 'fewshot',
      why: 'A layout the prompt has never demonstrated. Add examples from that layout (or classify and route to a vendor-specific prompt).' },
    { t: 'Line-item amounts are individually correct but do not sum to the extracted total.', a: 'code',
      why: 'A business invariant, not a shape problem. Structured outputs cannot express arithmetic; reconcile in a post-parse validator and flag mismatches.' },
    { t: 'A new "digital services" tax category is being coerced into "sales_tax".', a: 'schema',
      why: 'A missing enum member. Extend the enum — and note that a rising <code>"other"</code> rate is the signal that should have caught this earlier.' },
    { t: 'The model sometimes returns the ship-to address where bill-to was requested.', a: 'desc',
      why: 'An ambiguous field definition. Sharpen the description with explicit disambiguation ("the address next to the words Bill To, not Ship To") and add a contrastive example.' },
    { t: 'Statements showing both posted and available balances silently get one of the two.', a: 'schema',
      why: 'The schema forces a single value where two exist. Split into two fields, or keep one, null it, and record <code>extraction_status: "ambiguous"</code>.' },
    { t: 'Extracted currency codes are valid but the amount must be positive and sometimes is not.', a: 'code',
      why: 'Structured outputs do not support <code>minimum</code>/<code>maximum</code>. Range checks live in your validation layer.' }
  ]
},

/* ---------------------------------------------------------- 8 */
{
  id: 'ex8', type: 'json', topics: 'Topic 8', level: 'Core',
  title: 'Rewrite a tool description so it stops being mis-selected',
  brief: 'An e-commerce agent keeps calling <code>search_orders</code> when the customer asks about one specific ' +
         'order, and keeps calling <code>get_order_details</code> with a customer email instead of an order ID. ' +
         'Rewrite <code>get_order_details</code>. Cover: what it does · when to use it · when NOT to use it and ' +
         'which tool instead · the exact input format · what it returns · at least one example input.',
  starter: '{\n  "name": "get_order_details",\n  "description": "",\n  "input_schema": {\n    "type": "object",\n    "properties": {\n      "order_id": { "type": "string", "description": "" }\n    },\n    "required": ["order_id"]\n  }\n}',
  checks: [
    { label: 'Description is substantial (3+ sentences, 250+ characters)', fn: function (o, raw) { var d = (o && o.description) || ''; return d.length >= 250; } },
    { label: 'Says when to USE it', fn: function (o) { return /use (this|it) when|use when/i.test((o && o.description) || ''); } },
    { label: 'Has an explicit negative scope ("do NOT use…")', fn: function (o) { return /do not use|don’t use|not for|never use/i.test((o && o.description) || ''); } },
    { label: 'Names the alternative tool by name (search_orders / lookup_customer)', fn: function (o, raw) { return /search_orders|lookup_customer|find_customer/.test((o && o.description) || ''); } },
    { label: 'Specifies the order_id format explicitly', fn: function (o, raw) { return /format|pattern|e\.g\.|for example/i.test(JSON.stringify((o && o.input_schema) || {}) + ((o && o.description) || '')); } },
    { label: 'States that an email address is NOT a valid input', fn: function (o, raw) { return /email/i.test(raw); } },
    { label: 'Says what the tool returns', fn: function (o) { return /returns/i.test((o && o.description) || ''); } },
    { label: 'Says what it does NOT return / does not modify', fn: function (o) { return /does not return|does not modify|read-only|read only/i.test((o && o.description) || ''); } },
    { label: 'Provides an example input (input_examples or an inline example)', fn: function (o, raw) { return !!(o && o.input_examples) || /"example"|e\.g\./i.test(raw); } },
    { label: 'The order_id parameter has its own description', fn: function (o) { try { return (o.input_schema.properties.order_id.description || '').length > 20; } catch (e) { return false; } } }
  ],
  solution:
'{\n  "name": "get_order_details",\n  "description":\n    "Returns the complete record for ONE specific order: line items, quantities, unit and total prices, payment status, fulfilment status, carrier, tracking number and delivery timestamps. Use this when the customer refers to a single known order \\u2014 \'where is order A-7741\', \'what did I pay for my last order\' once the ID is known, or any follow-up about one order. Do NOT use it to find orders: if you do not already have an order ID, call search_orders with the customer_id or email first and use the order_id it returns. Do NOT pass an email address, a customer name, or a tracking number here \\u2014 those are not order IDs and the call will fail. This tool is read-only: it does not cancel, refund, or modify the order; use cancel_order or issue_refund for that. It does not return customer profile data or payment-method details.",\n  "input_schema": {\n    "type": "object",\n    "additionalProperties": false,\n    "properties": {\n      "order_id": {\n        "type": "string",\n        "description": "Order identifier in the format \'A-\' followed by four digits, e.g. A-7741. Uppercase A. Obtain it from search_orders \\u2014 never construct or guess one."\n      }\n    },\n    "required": ["order_id"]\n  },\n  "input_examples": [ { "order_id": "A-7741" } ]\n}',
  notes: 'The model selects tools using only the name, description and input schema — it cannot see your API docs or ' +
         'your intent. That is why every clause here is load-bearing: the negative scope prevents mis-selection, ' +
         'the named alternative teaches the prerequisite ordering, and the format spec prevents malformed calls. ' +
         'Anthropic\'s guidance is to aim for at least 3–4 sentences per tool, more when the tool is complex. If two ' +
         'tools remain genuinely confusable after this, the structural fix is to consolidate them behind one tool ' +
         'with an <code>action</code> enum.'
},

/* ---------------------------------------------------------- 9 */
{
  id: 'ex9', type: 'choice', topics: 'Topic 9', level: 'Core',
  title: 'Choose the right tool_choice',
  brief: 'Each scenario needs one <code>tool_choice</code> configuration. Watch for the ones where the correct ' +
         'answer is <em>not</em> a forcing mode.',
  questions: [
    { q: 'A ticket router must classify every incoming message into exactly one of nine queues, always returning structured data.',
      opts: ['{"type":"auto"}', '{"type":"any"}', '{"type":"tool","name":"classify_ticket"}', '{"type":"none"}'], a: 2,
      why: 'There is exactly one correct tool and it must always run — <code>tool</code> guarantees it. <code>any</code> would also force a call but leaves the choice open, which is unnecessary latitude when only one tool exists.' },
    { q: 'A support agent chats with customers; some turns need a tool, many are just conversation.',
      opts: ['{"type":"auto"}', '{"type":"any"}', '{"type":"tool","name":"reply"}', '{"type":"none"}'], a: 0,
      why: '<code>auto</code> is the default and the right answer. Forcing a tool call on a turn that needs none produces spurious calls and wasted latency.' },
    { q: 'After all data has been gathered, the final turn must be a plain-language summary with no further side effects.',
      opts: ['{"type":"auto"}', '{"type":"none"}', '{"type":"any"}', 'Omit tool_choice'], a: 1,
      why: '<code>none</code> forbids tool use for that turn. <code>auto</code> would still permit a stray call; omitting <code>tool_choice</code> defaults to <code>auto</code> whenever tools are supplied.' },
    { q: 'A diagnostic agent must take some investigative action every turn, but which tool depends on the symptom.',
      opts: ['{"type":"auto"}', '{"type":"any"}', '{"type":"tool","name":"run_diagnostic"}', '{"type":"none"}'], a: 1,
      why: '<code>any</code> is exactly this case: a tool must be called, but the model chooses which one.' },
    { q: 'The agent picks the wrong tool about 15% of the time among four similar tools.',
      opts: ['Set tool_choice to "any"', 'Rewrite the tool descriptions with negative scope and examples', 'Set tool_choice to "tool" for the most common one', 'Enable parallel tool use'], a: 1,
      why: '<code>tool_choice</code> controls <em>whether</em> a tool is called, never <em>which</em>. Mis-selection is a description problem (Topic 8). Forcing one specific tool would break the other three cases entirely.' },
    { q: 'A workflow uses manual extended thinking and you also want to force a specific tool call in the same request.',
      opts: ['Use {"type":"tool"} — they compose fine', 'Not supported; use auto, or drop manual thinking', 'Use {"type":"any"} instead', 'Use none and prompt for the tool'], a: 1,
      why: 'Manual extended thinking supports only <code>auto</code> and <code>none</code>; <code>any</code> and <code>tool</code> return an error. (Adaptive thinking does support forced tool use — know which one the scenario means.)' }
  ]
},

/* --------------------------------------------------------- 10 */
{
  id: 'ex10', type: 'classify', topics: 'Topic 4', level: 'Core',
  title: 'Escalation triage',
  brief: 'A retail bank\'s support agent. For each signal decide: escalate immediately, continue autonomously, or ' +
         'recognise it as an unreliable trigger that must not gate escalation at all.',
  bins: [
    { id: 'now',    label: 'Escalate immediately' },
    { id: 'auto',   label: 'Continue autonomously' },
    { id: 'unrel',  label: 'Unreliable trigger' }
  ],
  items: [
    { t: '"Stop, I want to speak to a human being."', a: 'now',
      why: 'Explicit request — honoured immediately and unconditionally, even one tool call from resolution. Attach everything gathered so the transfer is warm.' },
    { t: 'The customer asks for a $40 refund; the agent\'s auto-approval limit is $50 and policy covers the case.', a: 'auto',
      why: 'Inside the authority envelope, documented policy, tools available. Autonomous resolution is correct.' },
    { t: 'The customer asks for a $900 refund; the auto-approval limit is $50.', a: 'now',
      why: 'Authority exceeded — a deterministic trigger. Escalate with the refund pre-assembled so the human just approves.' },
    { t: 'The model reports 0.62 confidence in its answer.', a: 'unrel',
      why: 'Self-reported confidence is uncalibrated, overconfident precisely on unfamiliar inputs, unauditable, and drifts with every prompt edit. Never the gate.' },
    { t: 'The account-lookup API has returned 503 on three consecutive bounded retries.', a: 'now',
      why: 'A required dependency is down after bounded retries. Escalate with the error context rather than retrying indefinitely.' },
    { t: 'A sentiment classifier scores the message as "frustrated".', a: 'unrel',
      why: 'Useful as routing metadata or context for the human, never as the escalation gate — it misfires on terse writers and structured complaints.' },
    { t: 'The customer\'s request is not covered by any published policy.', a: 'now',
      why: 'A policy gap. An agent with no policy will invent one, which is worse than a transfer.' },
    { t: 'This is the customer\'s third contact about an issue already marked resolved.', a: 'now',
      why: 'The automated path has already failed twice on this issue. Repeat contact is a deterministic escalation trigger.' },
    { t: 'The agent has run the same three diagnostic tools twice with identical results and unchanged state.', a: 'now',
      why: 'No measurable progress — detect it deterministically by comparing tool-call signatures across turns, not by asking the model if it feels stuck.' },
    { t: 'A routine balance enquiry on a verified account with all tools healthy.', a: 'auto',
      why: 'All autonomy conditions hold: no human requested, documented workflow, inside authority, tools healthy, progress being made.' },
    { t: 'The message mentions a solicitor and a regulatory complaint.', a: 'now',
      why: 'Legal/regulatory risk is a hard trigger, typically to a specialist queue rather than general support.' },
    { t: 'The model judges the request "quite complex".', a: 'unrel',
      why: 'Unobservable and unauditable. Replace with the concrete conditions that actually make it complex: authority, policy coverage, tool availability, progress.' }
  ]
},

/* --------------------------------------------------------- 11 */
{
  id: 'ex11', type: 'text', topics: 'Topic 1', level: 'Stretch',
  title: 'Close every exit path in the orchestrator',
  brief: 'This session runner drops work silently. Rewrite it so that <strong>every</strong> way the loop can end ' +
         'maps to exactly one terminal state — <code>RESOLVED</code> or <code>ESCALATED</code>. Handle the loop ' +
         'falling through, unknown stop reasons, exceptions, and verify that a terminal action actually occurred.',
  starter:
'async function runSession(id, input) {\n  for (let turn = 0; turn < MAX_TURNS; turn++) {\n    const res = await claude.messages.create(ctx);\n    if (res.stop_reason === "tool_use") {\n      ctx.messages.push(res, await runTools(res));\n      continue;\n    }\n    if (res.stop_reason === "end_turn") {\n      return resolve(id, res);\n    }\n  }\n}\n',
  checks: [
    { label: 'end_turn is gated by a verification step before resolving', fn: function (o, raw) { return /verif|confirm|assertResolution|checkResolution/i.test(raw); } },
    { label: 'max_tokens is handled as incomplete, not as success', fn: function (o, raw) { return /max_tokens/.test(raw); } },
    { label: 'refusal is handled and escalates', fn: function (o, raw) { return /refusal/.test(raw); } },
    { label: 'There is a default / else branch for unknown stop reasons', fn: function (o, raw) { return /default\s*:|else\s*\{|else\s+return/.test(raw); } },
    { label: 'Turn-budget exhaustion (loop fall-through) escalates explicitly', fn: function (o, raw) { return /(TURN_BUDGET|budget|MAX_TURNS)[\s\S]{0,140}escalate|escalate[\s\S]{0,80}(TURN_BUDGET|budget)/i.test(raw); } },
    { label: 'A wall-clock / SLA deadline is enforced inside the loop', fn: function (o, raw) { return /deadline|Date\.now|SLA|timeout/i.test(raw); } },
    { label: 'Exceptions are caught at the orchestrator boundary and escalate', fn: function (o, raw) { return /catch\s*\(/.test(raw) && /catch[\s\S]{0,200}escalate/i.test(raw); } },
    { label: 'Escalations carry a machine-readable reason code', fn: function (o, raw) { return /escalate\s*\([^)]*['"][A-Z_]{4,}['"]/.test(raw); } },
    { label: 'A finally block or equivalent asserts the terminal-state invariant', fn: function (o, raw) { return /finally|assertTerminal|assertClosed/i.test(raw); } },
    { label: 'Session state is opened/persisted so an out-of-band reaper can find it', fn: function (o, raw) { return /sessions?\.(open|create|save|persist)|status\s*=\s*['"]IN_PROGRESS/i.test(raw); } }
  ],
  solution:
'async function runSession(id, input) {\n  await sessions.open(id);                    // durable: status = IN_PROGRESS\n  const deadline = Date.now() + SLA_MS;\n\n  try {\n    for (let turn = 0; turn < MAX_TURNS; turn++) {\n      if (Date.now() > deadline) return escalate(id, "SLA_TIMEOUT");\n\n      const res = await claude.messages.create(ctx);\n\n      switch (res.stop_reason) {\n        case "tool_use":\n          ctx.messages.push(res, await runTools(res));   // errors -> is_error tool_result\n          continue;\n\n        case "end_turn":\n          // "Claude stopped talking" is not "the refund was issued".\n          return (await verifyResolution(id))\n            ? resolve(id, res)\n            : escalate(id, "NO_TERMINAL_ACTION", res);\n\n        case "max_tokens":\n          return escalate(id, "TRUNCATED_OUTPUT", res);  // output is incomplete\n\n        case "refusal":\n          return escalate(id, "MODEL_REFUSAL", res);     // never retry the same prompt\n\n        default:\n          // unknown or future stop reasons fail into escalation, not silence\n          return escalate(id, "UNEXPECTED_STOP_" + res.stop_reason, res);\n      }\n    }\n    return escalate(id, "TURN_BUDGET_EXHAUSTED");        // the loop fell through\n\n  } catch (err) {\n    return escalate(id, "ORCHESTRATOR_EXCEPTION", err);  // never rethrow bare\n  } finally {\n    await sessions.assertTerminal(id);   // invariant: RESOLVED | ESCALATED\n  }\n}\n\n// And outside the process entirely, because SIGKILL runs no finally block:\n//   reaper: every 60s, find sessions where status = IN_PROGRESS\n//           and updated_at < now - SLA, then escalate them.',
  notes: 'The four structural features graders look for: an <strong>exhaustive switch with a default</strong>, ' +
         '<strong>explicit handling of loop fall-through</strong>, a <strong>verification gate on success</strong>, ' +
         'and an <strong>out-of-band sweeper</strong>. The last one is the most-missed: <code>try/finally</code> is ' +
         'in-process and does not survive a pod being killed mid-deploy, so durable session state plus a reaper is ' +
         'the only thing that closes that path.'
},

/* --------------------------------------------------------- 12 */
{
  id: 'ex12', type: 'json', topics: 'Topic 1 · 4', level: 'Core',
  title: 'Build the escalation handoff payload',
  brief: 'An e-commerce agent has verified a duplicate charge of $89.99 on order A-7741 for customer cus_401, ' +
         'attempted a refund, and been blocked because the amount exceeds its $50 tier limit. Write the handoff ' +
         'payload the human agent receives. Include provenance for facts; exclude anything that wastes the human\'s time.',
  starter: '{\n  \n}',
  checks: [
    { label: 'Valid JSON object', fn: function (o) { return o && typeof o === 'object' && !Array.isArray(o); } },
    { label: 'Carries session and customer identifiers', fn: function (o, raw) { return /session_?id/i.test(raw) && /customer_?id/i.test(raw); } },
    { label: 'Has a machine-readable reason code (not prose)', fn: function (o, raw) { return /"[a-z_]*reason[a-z_]*"\s*:\s*"[A-Z][A-Z_]{4,}"/.test(raw); } },
    { label: 'Reason code reflects the authority limit', fn: function (o, raw) { return /AUTHORITY|LIMIT|APPROVAL|EXCEED/i.test(raw); } },
    { label: 'States the interpreted customer intent', fn: function (o, raw) { return /intent|issue|problem_summary/i.test(raw); } },
    { label: 'Lists verified facts', fn: function (o, raw) { return /verified_?facts|findings|evidence/i.test(raw); } },
    { label: 'Facts carry provenance (which tool produced them)', fn: function (o, raw) { return /"source"|"tool"|provenance/i.test(raw); } },
    { label: 'Lists actions already attempted and their outcomes', fn: function (o, raw) { return /actions_?(taken|attempted)|attempts/i.test(raw); } },
    { label: 'Names the specific blocker', fn: function (o, raw) { return /blocked_?on|blocker|reason_detail/i.test(raw); } },
    { label: 'Recommends a concrete next step for the human', fn: function (o, raw) { return /suggested_?next|recommend|proposed_?action/i.test(raw); } },
    { label: 'Does NOT dump the raw transcript or reasoning chain', fn: function (o, raw) { return !/transcript|full_?history|reasoning_?chain|chain_of_thought/i.test(raw); } },
    { label: 'Does NOT include a model-generated confidence score', fn: function (o, raw) { return !/confidence_score|"confidence"\s*:\s*[0-9.]/i.test(raw); } }
  ],
  solution:
'{\n  "session_id": "sess_8823",\n  "customer_id": "cus_401",\n  "order_id": "A-7741",\n  "escalation_reason_code": "AUTHORITY_EXCEEDED",\n  "escalated_at": "2026-08-14T11:03:22Z",\n\n  "intent": "Customer reports being charged twice for order A-7741 and requests a refund of the duplicate.",\n\n  "verified_facts": [\n    { "fact": "Two settled charges of $89.99 on 2026-08-02 against the same order.",\n      "source": "payments.list_charges", "evidence_basis": "system_of_record" },\n    { "fact": "Order A-7741 contains a single line item priced $89.99.",\n      "source": "orders.get_order_details" },\n    { "fact": "No refund has been issued against this order.",\n      "source": "payments.list_refunds" }\n  ],\n\n  "actions_taken": [\n    { "tool": "lookup_order",   "result": "ok" },\n    { "tool": "list_charges",   "result": "ok \\u2014 duplicate confirmed" },\n    { "tool": "issue_refund",   "result": "blocked",\n      "error": { "errorCategory": "PERMISSION_DENIED", "isRetryable": false,\n                 "message": "Refund of 89.99 exceeds agent tier limit of 50.00" } }\n  ],\n\n  "blocked_on": "Refunds above $50.00 require a tier-2 approver (policy 4.2).",\n\n  "suggested_next_step": {\n    "action": "approve_refund",\n    "amount": 89.99,\n    "currency": "USD",\n    "charge_id": "ch_2291",\n    "policy_reference": "4.2 duplicate-charge remediation"\n  },\n\n  "context_notes": "Second contact about this issue; first contact 2026-08-09 closed without refund."\n}',
  notes: 'The design target is <strong>human handling time after escalation</strong>, not escalation rate. Everything ' +
         'here exists so the approver can click once instead of re-investigating. What is deliberately absent is as ' +
         'important: no raw transcript (the human will not read 4,000 lines), no reasoning chain, and no ' +
         'model-generated confidence score — an uncalibrated number in a decision packet is worse than no number, ' +
         'because it anchors the human.'
},

/* --------------------------------------------------------- 13 */
{
  id: 'ex13', type: 'json', topics: 'Topic 8 · 9', level: 'Core',
  title: 'Design a structured tool error that enables recovery',
  brief: 'An IT service-desk agent called <code>check_account_status</code> with <code>"jsmith@acme.com"</code>, but ' +
         'the tool requires an employee ID in the format <code>E######</code>. Write the error the tool returns. ' +
         'Remember: the error message <em>is</em> a prompt — it is the model\'s only information about how to recover.',
  starter: '{\n  \n}',
  checks: [
    { label: 'Valid JSON object', fn: function (o) { return o && typeof o === 'object'; } },
    { label: 'Explicitly flags the error (isError / is_error true)', fn: function (o, raw) { return /"is_?[eE]rror"\s*:\s*true/.test(raw); } },
    { label: 'Has a machine-readable error category', fn: function (o, raw) { return /error_?[cC]ategory|error_?code|"code"/.test(raw); } },
    { label: 'Category expresses a precondition/validation failure, not a generic error', fn: function (o, raw) { return /PRECONDITION|VALIDATION|INVALID_INPUT|BAD_REQUEST/i.test(raw); } },
    { label: 'States retryability explicitly', fn: function (o, raw) { return /is_?[rR]etryable|retryable/.test(raw); } },
    { label: 'Marks this one as NOT retryable (retrying the same input cannot work)', fn: function (o, raw) { return /is_?[rR]etryable"?\s*:\s*false/.test(raw); } },
    { label: 'Echoes the attempted input so the model can see what it sent', fn: function (o, raw) { return /attempted_?[iI]nput|received|"input"/.test(raw); } },
    { label: 'Message names the actual problem, not "failed"', fn: function (o, raw) { return !/"(message|error)"\s*:\s*"(failed|error|operation failed)"/i.test(raw) && /message|detail/i.test(raw); } },
    { label: 'Gives remediation naming the prerequisite tool', fn: function (o, raw) { return /remediation|next_?step|hint|suggestion/i.test(raw) && /lookup_employee|lookup|resolve/i.test(raw); } },
    { label: 'States the required format so the retry is well-formed', fn: function (o, raw) { return /E#{4,}|E\\?d\{6\}|E followed by|six digits|E######/i.test(raw); } }
  ],
  solution:
'{\n  "isError": true,\n  "errorCategory": "PRECONDITION_FAILED",\n  "isRetryable": false,\n  "message": "The value \'jsmith@acme.com\' is an email address, not an employee ID. check_account_status requires a corporate employee ID in the format E###### (uppercase E followed by exactly six digits, e.g. E004821).",\n  "attemptedInput": { "employee_id": "jsmith@acme.com" },\n  "remediation": "Call lookup_employee with { \\"email\\": \\"jsmith@acme.com\\" } to obtain the employee_id, then call check_account_status again with that value.",\n  "partialResults": null\n}',
  notes: 'Categories worth distinguishing, because each implies a different next action: <code>VALIDATION_ERROR</code> ' +
         '(fix the input), <code>PRECONDITION_FAILED</code> (call something else first), <code>NOT_FOUND</code> ' +
         '(do not retry), <code>RATE_LIMITED</code> (retry after a delay), <code>UPSTREAM_UNAVAILABLE</code> ' +
         '(retry or escalate), <code>PERMISSION_DENIED</code> (escalate, never retry). A bare ' +
         '<code>{"error":"failed"}</code> implies none of them, so the model guesses — producing retry storms on ' +
         'non-retryable failures, or a fabricated answer to satisfy the user. At the API level this is returned as a ' +
         '<code>tool_result</code> with <code>"is_error": true</code>.'
},

/* --------------------------------------------------------- 14 */
{
  id: 'ex14', type: 'json', topics: 'Topic 7', level: 'Stretch',
  title: 'Design the error record that makes a feedback loop possible',
  brief: 'Human reviewers correct extraction output. Design the record written on every correction so that next ' +
         'month you can answer: <em>which field fails most, for which vendor, in which error class, under which ' +
         'prompt version, and did last month\'s fix work?</em>',
  starter: '{\n  \n}',
  checks: [
    { label: 'Valid JSON object', fn: function (o) { return o && typeof o === 'object'; } },
    { label: 'Identifies the field that was wrong', fn: function (o, raw) { return /"field"|field_name/i.test(raw); } },
    { label: 'Records both the model value and the corrected value', fn: function (o, raw) { return /model_?value|extracted_?value/i.test(raw) && /correct(ed)?_?value|human_?value|ground_?truth/i.test(raw); } },
    { label: 'Has a typed error class (not free text)', fn: function (o, raw) { return /error_?(class|type|category)"\s*:\s*"[A-Z][A-Z_]{4,}"/.test(raw); } },
    { label: 'Uses a class that maps to an intervention (e.g. FABRICATED_VALUE, FORMAT_MISINTERPRETATION)', fn: function (o, raw) { return /FABRICATED|FORMAT_|WRONG_FIELD|MISSING_ENUM|LAYOUT_|AMBIGUITY|VALIDATION_ONLY|TOOL_MISSELECTION/.test(raw); } },
    { label: 'Records the prompt version', fn: function (o, raw) { return /prompt_?version/i.test(raw); } },
    { label: 'Records the schema version', fn: function (o, raw) { return /schema_?version/i.test(raw); } },
    { label: 'Records the model identifier', fn: function (o, raw) { return /"model"|model_?id|model_?name/i.test(raw); } },
    { label: 'Captures document segmentation (doc type and/or vendor/layout)', fn: function (o, raw) { return /doc_?type|document_?type/i.test(raw) && /vendor|layout|template|source/i.test(raw); } },
    { label: 'Records a severity so ranking is possible', fn: function (o, raw) { return /severity|impact|priority/i.test(raw); } },
    { label: 'Records who or what detected the error', fn: function (o, raw) { return /detected_?by|source_?of_?truth|reviewer/i.test(raw); } },
    { label: 'Timestamped', fn: function (o, raw) { return /timestamp|"at"|_at"/i.test(raw); } },
    { label: 'References the specific document so it can join a regression eval set', fn: function (o, raw) { return /doc_?id|document_?id|input_?ref/i.test(raw); } }
  ],
  solution:
'{\n  "record_id": "err_20260814_0912",\n  "timestamp": "2026-08-14T09:12:44Z",\n\n  "input_ref": {\n    "doc_id": "inv_88213",\n    "doc_type": "invoice",\n    "vendor_id": "v_ACME",\n    "layout_hash": "a91f",\n    "page_count": 3,\n    "source": "email_scan"\n  },\n\n  "model_meta": {\n    "model": "claude-opus-5",\n    "prompt_version": "extract-v7",\n    "schema_version": "invoice-v3",\n    "example_set": "fewshot-v2"\n  },\n\n  "field": "invoice_date",\n  "model_value": "2026-04-03",\n  "corrected_value": "2026-03-04",\n\n  "error_class": "FORMAT_MISINTERPRETATION",\n  "error_subclass": "DDMM_VS_MMDD",\n  "severity": "high",\n  "detected_by": "human_review",\n  "correction_cost_seconds": 45,\n\n  "eligible_for_eval_set": true\n}',
  notes: 'Two details separate a working loop from a log pile. First, the <strong>typed error class</strong>: each ' +
         'class maps to exactly one intervention (<code>FABRICATED_VALUE</code> → schema, ' +
         '<code>FORMAT_MISINTERPRETATION</code> → description, <code>LAYOUT_UNSEEN</code> → few-shot, ' +
         '<code>VALIDATION_ONLY</code> → code), so aggregation produces a ranked backlog rather than a feeling. ' +
         'Second, the <strong>version triple</strong>: without prompt, schema and example-set versions you cannot ' +
         'tell your fix from a model upgrade or a change in document mix. Finally, flag records for the regression ' +
         'eval set — production corrections are the highest-value eval data you will ever get, because they are ' +
         'real, human-labelled, and precisely the cases you fail.'
},

/* --------------------------------------------------------- 15 */
{
  id: 'ex15', type: 'lab', topics: 'Topic 2 · 3', level: 'Terminal lab',
  title: 'Lab — make a PostToolUse hook fire, block, and self-correct',
  brief: 'Reading about hooks is not the same as watching one block an edit and hand the error back to the model. ' +
         'This takes about fifteen minutes and makes the exit-code semantics permanent.',
  steps: [
    'Create a scratch project: <code>mkdir hook-lab &amp;&amp; cd hook-lab &amp;&amp; mkdir -p .claude/hooks</code>',
    'Write <code>.claude/hooks/gate.sh</code>: read stdin, extract <code>.tool_input.file_path</code> with <code>jq</code>, and — for any <code>.py</code> file containing the string <code>TODO</code> — print a message to stderr and <code>exit 2</code>. Otherwise <code>exit 0</code>. Make it executable.',
    'Register it in <code>.claude/settings.json</code> under <code>hooks.PostToolUse</code> with <code>"matcher": "Edit|Write"</code>.',
    'Start Claude Code and ask it to create <code>app.py</code> containing a <code>TODO</code> comment. Watch the hook block the write and the model react to your stderr text.',
    'Now change the stderr message to something useless like <code>echo "error" &gt;&amp;2</code> and repeat. Observe how much worse the model\'s recovery is when the diagnostics carry no information.',
    'Change <code>exit 2</code> to <code>exit 1</code> and repeat. The failure is now non-blocking — the edit stands.',
    'Change the matcher to <code>"*"</code> and run a <code>Read</code>. Watch the hook fire on tools it was never meant for.',
    'Finally, add a <code>PreToolUse</code> hook that denies writes to <code>secrets/**</code> and compare it with a <code>permissions.deny</code> rule doing the same job. Ask yourself which one you would trust for a compliance requirement, and why.'
  ],
  reveal:
'#!/usr/bin/env bash\n# .claude/hooks/gate.sh\nset -uo pipefail\nINPUT=$(cat)\nFILE=$(echo "$INPUT" | jq -r \'.tool_input.file_path // empty\')\n[ -z "$FILE" ] && exit 0\n[ -f "$FILE" ] || exit 0\n\ncase "$FILE" in\n  *.py)\n    if grep -n "TODO" "$FILE" >/dev/null 2>&1; then\n      echo "Policy violation in $FILE:" >&2\n      grep -n "TODO" "$FILE" | head -10 >&2\n      echo "Resolve or remove TODO markers before completing the edit." >&2\n      exit 2\n    fi\n    ;;\nesac\nexit 0\n\n# .claude/settings.json\n# {\n#   "hooks": {\n#     "PostToolUse": [\n#       { "matcher": "Edit|Write",\n#         "hooks": [ { "type": "command",\n#                      "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/gate.sh",\n#                      "timeout": 30 } ] }\n#     ]\n#   }\n# }',
  notes: 'What you should take away: exit 2 blocks <em>and</em> feeds stderr to Claude; exit 1 does neither usefully; ' +
         'the matcher is a real filter with real consequences; and a hook is configuration a developer can edit, ' +
         'which is why compliance requirements belong in managed settings with CI as the backstop.'
},

/* --------------------------------------------------------- 16 */
{
  id: 'ex16', type: 'lab', topics: 'Topic 2', level: 'Terminal lab',
  title: 'Lab — headless Claude Code in a CI pipeline',
  brief: 'The single most-tested CI fact is that a pipeline without <code>-p</code> hangs. Prove it to yourself, ' +
         'then build the review job properly.',
  steps: [
    'In any git repo with a branch containing changes, run <code>claude "summarise the diff against main"</code> — note that it opens an interactive session. In CI, that is a hung job burning a runner.',
    'Now run it headlessly: <code>claude -p "summarise the diff against main"</code>. It prints and exits.',
    'Add machine-readable output: <code>claude -p "…" --output-format json</code>. Inspect the envelope — this is what your pipeline parses.',
    'Constrain it: add <code>--allowedTools "Read,Grep,Glob,Bash(git diff:*)"</code> so the review job can read and diff but not write. Confirm a write attempt is refused.',
    'Write a GitHub Actions step that runs the review on pull requests and posts the JSON result as a PR comment.',
    'Deliberately reuse one session across two different PRs and read the second review closely. You should see it referencing code that is not in the second diff — the concrete cost of losing session isolation.',
    'Add a repository-level <code>.claude/settings.json</code> with a <code>permissions.deny</code> for <code>Read(./.env*)</code> and confirm the headless run honours it.'
  ],
  reveal:
'# .github/workflows/claude-review.yml\nname: Claude review\non: pull_request\n\njobs:\n  review:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      pull-requests: write\n    steps:\n      - uses: actions/checkout@v4\n        with: { fetch-depth: 0 }\n\n      - name: Review the diff\n        id: review\n        env:\n          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}\n        run: |\n          # -p is what keeps this from attaching to an interactive REPL and hanging.\n          claude -p "Review the diff against origin/${{ github.base_ref }}. \\\n                     Report correctness bugs and security issues only." \\\n            --output-format json \\\n            --allowedTools "Read,Grep,Glob,Bash(git diff:*)" \\\n            > review.json\n\n      - name: Post the review\n        run: |\n          jq -r \'.result\' review.json > body.md\n          gh pr comment "${{ github.event.pull_request.number }}" --body-file body.md\n        env:\n          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}\n\n# Each run is a fresh session, so review N+1 never sees review N\'s diff.',
  notes: 'Three exam-relevant facts fall out of this lab: <code>-p</code> is mandatory for non-interactive use; ' +
         '<code>--output-format json</code> is how a pipeline consumes the result; and each CI run must be an ' +
         'isolated session, because a reused session leaks the previous diff and produces confident comments about ' +
         'code that is not under review. Scope tools explicitly rather than granting a blanket permissions bypass.'
},

/* ==========================================================================
   BUILD TRACK — multi-agent systems, end to end.
   These are longer than the drills above. Each one asks you to design a whole
   system rather than a single configuration object, and the checklists name
   the properties the exam grades on.
   ========================================================================== */

/* ---------------------------------------------------------- 17 */
{
  id: 'ex17', type: 'json', topics: 'Build · Orchestration', level: 'Build',
  title: 'Build a PR-review multi-agent system: the agent manifest',
  brief: 'Design the agent set for an automated pull-request reviewer on a monorepo covering payments, identity ' +
         'and a public API. Requirements: three specialised review passes (security, business logic, API ' +
         'compatibility) that can run concurrently; one synthesis agent that merges them into a single gated ' +
         'verdict; and a coordinator that dispatches and owns the outcome. Reviewers must not be able to modify ' +
         'files. Synthesis must not be able to introduce claims no reviewer produced. Emit a JSON manifest: an ' +
         '<code>agents</code> array where each entry has <code>name</code>, <code>role</code>, ' +
         '<code>description</code>, <code>tools</code> (array) and <code>model</code>, plus a top-level ' +
         '<code>topology</code> string.',
  starter: '{\n  "topology": "",\n  "agents": [\n    {\n      "name": "",\n      "role": "",\n      "description": "",\n      "tools": [],\n      "model": ""\n    }\n  ]\n}',
  checks: [
    { label: 'Valid JSON with a topology and an agents array', fn: function (o) { return o && typeof o.topology === 'string' && Array.isArray(o.agents); } },
    { label: 'Five agents: coordinator, three specialised reviewers, one synthesis', fn: function (o) { return arr(o && o.agents).length >= 5; } },
    { label: 'The three review passes are separated by concern, not by file type', fn: function (o, raw) { return /security/i.test(raw) && /(business|logic|domain)/i.test(raw) && /(api|compat|contract)/i.test(raw); } },
    { label: 'Every reviewer is read-only (no Edit, Write or unscoped Bash)', fn: function (o) {
        return arr(o && o.agents).filter(function (a) { return /review|security|logic|api/i.test((a.name || '') + (a.role || '')); })
          .every(function (a) { return arr(a.tools).every(function (t) { return !/^(Edit|Write|MultiEdit)$/i.test(t) && !/^Bash$/i.test(t); }); }); } },
    { label: 'Reviewers can actually read the code (Read and/or Grep/Glob present)', fn: function (o) {
        return arr(o && o.agents).some(function (a) { return arr(a.tools).some(function (t) { return /^(Read|Grep|Glob)$/i.test(t); }); }); } },
    { label: 'The synthesis agent has an EMPTY tools array', fn: function (o) {
        var syn = arr(o && o.agents).filter(function (a) { return /synth|merge|verdict/i.test((a.name || '') + (a.role || '')); });
        return syn.length > 0 && syn.every(function (a) { return arr(a.tools).length === 0; }); } },
    { label: 'Each description says WHEN to use the agent, not only what it is', fn: function (o) {
        return arr(o && o.agents).filter(function (a) { return a.description; })
          .every(function (a) { return /\b(use|when|invoke|for)\b/i.test(a.description) && String(a.description).length > 40; }); } },
    { label: 'Any scoped Bash is scoped to a command family (e.g. Bash(git diff:*))', fn: function (o, raw) { return !/"Bash"/.test(raw) || /Bash\([^)]+\)/.test(raw); } },
    { label: 'Topology names a hybrid: fan-out for the passes, then synthesis', fn: function (o) { return /parallel|fan|concurrent/i.test(o && o.topology || '') && /synth|merge|then/i.test(o && o.topology || ''); } }
  ],
  solution:
'{\n  "topology": "coordinator dispatches three review passes in parallel (fan-out), then a synthesis stage merges them into one verdict",\n  "agents": [\n    {\n      "name": "review-coordinator",\n      "role": "coordinator",\n      "description": "Use to run a full pull-request review. Decomposes the diff, dispatches the specialised passes, and owns the final gated verdict.",\n      "tools": ["Bash(git diff:*)", "Bash(git log:*)"],\n      "model": "sonnet"\n    },\n    {\n      "name": "security-reviewer",\n      "role": "review-pass",\n      "description": "Use when a diff touches auth, crypto, input handling, secrets or tenant-scoped data. Reports authorization gaps, injection paths and secret handling only.",\n      "tools": ["Read", "Grep", "Glob"],\n      "model": "sonnet"\n    },\n    {\n      "name": "logic-reviewer",\n      "role": "review-pass",\n      "description": "Use when a diff changes domain rules, state transitions, money handling or invariants. Reports business-logic defects only.",\n      "tools": ["Read", "Grep", "Glob"],\n      "model": "sonnet"\n    },\n    {\n      "name": "api-reviewer",\n      "role": "review-pass",\n      "description": "Use when a diff changes a public route, request or response shape. Reports breaking changes, pagination and error-contract problems only.",\n      "tools": ["Read", "Grep", "Glob"],\n      "model": "sonnet"\n    },\n    {\n      "name": "review-synthesis",\n      "role": "synthesis",\n      "description": "Use after all review passes return. Merges finding sets into one verdict, de-duplicates on file/line/class, and preserves per-pass attribution.",\n      "tools": [],\n      "model": "sonnet"\n    }\n  ]\n}',
  notes: 'Three properties carry most of the marks. <strong>Reviewers are read-only</strong> because a reviewer ' +
         'that can edit will helpfully fix things unreviewed — and that is an allowlist decision, never a system-prompt ' +
         'instruction. <strong>Synthesis has no tools at all</strong>: a synthesis stage that can fetch will introduce ' +
         'claims no pass produced, which is untraceable by construction. And <strong>descriptions are the routing ' +
         'signal</strong> — an agent whose description says what it is but not when to use it never gets delegated to.'
},

/* ---------------------------------------------------------- 18 */
{
  id: 'ex18', type: 'text', topics: 'Build · Delegation', level: 'Build',
  title: 'Write the delegation package for one review pass',
  brief: 'The coordinator has the diff, the PR metadata and the project standards. It is about to dispatch the ' +
         'security reviewer. Write the delegation prompt it sends. The subagent starts with an empty context: it ' +
         'sees only its system prompt, its tools, and what you write here. It must complete without coming back ' +
         'for missing context. Cover all five parts of the package: objective, established facts, structured data, ' +
         'source metadata, and constraints plus the output contract.',
  starter: '## Objective\n\n\n## Established facts (do not re-derive)\n\n\n## Changed surface\n\n\n## Constraints\n\n\n## Return exactly\n',
  checks: [
    { label: 'States a single outcome-shaped objective', fn: function (o, raw) { return has(raw, /##\s*Objective[\s\S]{25,}/i); } },
    { label: 'Packs concrete values (a PR number, a branch, a commit SHA or file paths)', fn: function (o, raw) { return has(raw, /(#\d+|[0-9a-f]{7,40}|\/[\w.-]+\.(ts|js|py|go|rb|java|tsx))/); } },
    { label: 'Lists the changed files or surface explicitly rather than saying "the diff"', fn: function (o, raw) { return has(raw, /\.(ts|tsx|js|py|go|rb|java)\b/) && !/^\s*the diff\s*$/im.test(raw); } },
    { label: 'Carries facts the coordinator already established, marked not to re-derive', fn: function (o, raw) { return has(raw, /(do not re-?derive|already (established|verified|known)|established facts)/i); } },
    { label: 'Names the applicable standard or rule source, not just "our standards"', fn: function (o, raw) { return has(raw, /(CLAUDE\.md|\.claude\/rules|rules\/|standards?\/|payments-rules|policy)/i); } },
    { label: 'States what is OUT of scope (exclusions)', fn: function (o, raw) { return has(raw, /(do not report|out of scope|exclude|ignore|not in scope)/i); } },
    { label: 'Constrains the tools or forbids modification', fn: function (o, raw) { return has(raw, /(you may (only )?(call|use)|read-only|do not (edit|modify|write))/i); } },
    { label: 'Specifies an exact return shape, not "a summary"', fn: function (o, raw) { return has(raw, /\{[\s\S]*\}/) && has(raw, /return|output|respond with/i); } },
    { label: 'Return shape carries per-finding evidence or source references', fn: function (o, raw) { return has(raw, /(evidence|source|ref|line|citation)/i); } },
    { label: 'No pointers into a conversation the subagent cannot see', fn: function (o, raw) { return !has(raw, /(as (discussed|mentioned|noted) (above|earlier)|the address they (gave|provided)|earlier in (the|this) (chat|conversation)|see above)/i); } }
  ],
  solution:
'## Objective\nDetermine whether PR #4471 introduces an authorization regression on tenant-scoped data.\nReport findings only; do not fix anything.\n\n## Established facts (do not re-derive)\n- Base commit 8f2a91c, head commit d41c07b, branch feature/orders-bulk.\n- Auth runs in src/api/middleware/auth.ts:44 and is applied per-router, not globally\n  (verified by the coordinator via Grep on `router.use(requireAuth`).\n- The payments review standards in .claude/rules/payments.md are the applicable ruleset.\n- A previous review (PR #4402) accepted direct process.env reads inside config/*.ts.\n\n## Changed surface\n- src/api/orders.ts            (+118 / -12)\n- src/api/routers/bulk.ts      (new file)\n- src/db/queries/orders.sql    (+9)\n\n## Constraints\n- You may call Read, Grep and Glob only. You may not edit, write or run shell commands.\n- Do not report style, naming or formatting; the linter owns those.\n- Do not report anything in **/generated/** or in test fixtures.\n- Report a finding only where you can state a concrete exploit path in this codebase.\n\n## Return exactly\n{\n  "status": "complete" | "partial" | "failed",\n  "findings": [\n    { "id": "SEC-1",\n      "severity": "high" | "medium" | "low",\n      "class": "missing_authz" | "injection" | "secret_exposure" | "other",\n      "file": "src/api/orders.ts",\n      "line": 142,\n      "claim": "one sentence",\n      "exploit_path": "concrete steps",\n      "evidence": [{ "source": "src/api/orders.ts", "ref": "L138-L151" }],\n      "confidence": "established" | "probable" | "contested" }\n  ],\n  "coverage": { "files_examined": 3, "files_skipped": 0, "skipped_reason": null },\n  "unresolved": ["free-text list of what you could not settle"]\n}',
  notes: 'The single highest-value habit here is packing <strong>values, not pointers</strong>. "The address they ' +
         'provided" and "as discussed above" are references into a conversation the subagent has never seen; ' +
         '"14 Bridge St, Bristol BS1 4ND" is a value. The other easily-missed part is <code>coverage</code> and ' +
         '<code>unresolved</code>: without them, a reviewer that looked in the wrong place is indistinguishable ' +
         'from one that found nothing.'
},

/* ---------------------------------------------------------- 19 */
{
  id: 'ex19', type: 'classify', topics: 'Build · Context contracts', level: 'Build',
  title: 'Context handling: orchestrator, subagent, synthesis, scratchpad',
  brief: 'The hardest part of a multi-agent system is deciding <em>where each piece of information lives</em>. ' +
         'For each item below, choose the one place it belongs. Remember: the system prompt carries the ' +
         '<strong>role</strong>, the delegation prompt carries the <strong>task</strong>, the orchestrator holds ' +
         'what must outlive any single agent, and the scratchpad holds what must outlive the context window.',
  bins: [
    { id: 'sys',   label: "Subagent's system prompt" },
    { id: 'deleg', label: 'Delegation prompt' },
    { id: 'orch',  label: 'Orchestrator state' },
    { id: 'pad',   label: 'Scratchpad / durable store' }
  ],
  items: [
    { t: 'You are a security reviewer. You never modify files.', a: 'sys',
      why: 'A standing property of the role, identical on every invocation. Role in the body; task in the delegation prompt.' },
    { t: 'The head commit of the PR under review is <code>d41c07b</code>.', a: 'deleg',
      why: 'A per-task value. Put it in the system prompt and the next invocation inherits the wrong commit.' },
    { t: 'Which of the twelve review passes have completed and which are still running.', a: 'orch',
      why: 'No single subagent can know this. Ownership of the merged outcome is the coordinator\'s job.' },
    { t: 'For each finding, report the file, the line and the exploit path.', a: 'sys',
      why: 'A standing output convention for the role. It does not change between tasks, so it does not belong in every delegation prompt.' },
    { t: 'The customer said at turn 6 that they cannot receive SMS.', a: 'orch',
      why: 'An established constraint that must survive compaction and be passed to every subagent that could offer SMS. It lives in the structured state object.' },
    { t: 'Conclusions reached over a 90-minute exploration, needed again tomorrow.', a: 'pad',
      why: 'Anything that must outlive the context window or the session goes to durable storage, written as it is discovered rather than at the end.' },
    { t: 'Do not report anything under <code>**/generated/**</code> on this task.', a: 'deleg',
      why: 'Exclusions belong with the task. A project-wide exclusion could live in the role, but a task-specific one is delegation.' },
    { t: 'The per-task status of each of 400 file analyses in a long pipeline.', a: 'pad',
      why: 'Task graph plus per-task output, in a store that outlives the worker. In-process state does not survive a kill.' },
    { t: 'You may call Read, Grep and Glob only.', a: 'sys',
      why: 'The role\'s standing capability boundary. In Claude Code this is the <code>tools:</code> frontmatter, which is part of the agent definition, not the per-task prompt.' },
    { t: 'The content hash of every file analysed, so a resume can detect staleness.', a: 'pad',
      why: 'Fingerprints are what make targeted re-analysis possible, and they are only useful if they outlive the run that computed them.' },
    { t: 'Auth runs in <code>middleware/auth.ts:44</code> — verified, do not re-derive.', a: 'deleg',
      why: 'An established fact for this task. Packing it stops the subagent spending turns rediscovering it.' },
    { t: 'Which subagent produced each claim in the final report.', a: 'orch',
      why: 'Attribution is a property of the merge, owned by the component that performed it. A subagent cannot attribute claims it did not make.' }
  ]
},

/* ---------------------------------------------------------- 20 */
{
  id: 'ex20', type: 'json', topics: 'Build · Output schemas', level: 'Build',
  title: 'Design the subagent return schema and the synthesis contract',
  brief: 'Three review passes return to a synthesis stage that must produce one gated verdict. Design the JSON a ' +
         'single pass returns. It has to support four things the exam cares about: deterministic merging, ' +
         'per-claim attribution, honest uncertainty, and the ability to tell "clean" apart from "not examined". ' +
         'Emit an example return object for the security pass with at least two findings.',
  starter: '{\n  "agent": "security-reviewer",\n  "status": "",\n  "findings": [],\n  "coverage": {},\n  "unresolved": []\n}',
  checks: [
    { label: 'Valid JSON naming the producing agent', fn: function (o) { return o && typeof o.agent === 'string' && o.agent.length > 0; } },
    { label: 'A status field distinguishing complete from partial or failed', fn: function (o, raw) { return typeof (o && o.status) === 'string' && /complete|partial|failed/i.test(raw); } },
    { label: 'Findings is an array with at least two entries', fn: function (o) { return arr(o && o.findings).length >= 2; } },
    { label: 'Every finding carries a file and a line (mergeable identity)', fn: function (o) { return arr(o && o.findings).length > 0 && arr(o.findings).every(function (f) { return f && f.file && (f.line !== undefined); }); } },
    { label: 'Every finding carries an enum-style class or category', fn: function (o) { return arr(o && o.findings).every(function (f) { return f && (f.class || f.category || f.error_class); }); } },
    { label: 'Every finding carries a severity', fn: function (o) { return arr(o && o.findings).every(function (f) { return f && f.severity; }); } },
    { label: 'Per-claim evidence or source references, not one reference for the report', fn: function (o) { return arr(o && o.findings).every(function (f) { return f && (arr(f.evidence).length > 0 || f.source || f.ref); }); } },
    { label: 'Per-finding confidence or epistemic status (established / probable / contested)', fn: function (o, raw) { return arr(o && o.findings).every(function (f) { return f && (f.confidence || f.status); }) && /established|probable|contested|confirmed/i.test(raw); } },
    { label: 'A coverage object saying what was examined and what was skipped', fn: function (o) { return o && o.coverage && typeof o.coverage === 'object' && Object.keys(o.coverage).length >= 2; } },
    { label: 'An unresolved list, so silence is not read as an all-clear', fn: function (o) { return o && Array.isArray(o.unresolved); } },
    { label: 'A bounded prose summary field alongside the structured data', fn: function (o) { return o && typeof o.summary === 'string' && o.summary.length > 0; } }
  ],
  solution:
'{\n  "agent": "security-reviewer",\n  "status": "partial",\n  "findings": [\n    {\n      "id": "SEC-1",\n      "severity": "high",\n      "class": "missing_authz",\n      "file": "src/api/orders.ts",\n      "line": 142,\n      "claim": "Bulk handler reads :orgId from the path without checking membership.",\n      "exploit_path": "Authenticated user of org A requests /orgs/B/orders/bulk and receives org B rows.",\n      "evidence": [\n        { "source": "src/api/orders.ts", "ref": "L138-L151" },\n        { "source": "src/api/middleware/auth.ts", "ref": "L44-L58" }\n      ],\n      "confidence": "established"\n    },\n    {\n      "id": "SEC-2",\n      "severity": "medium",\n      "class": "injection",\n      "file": "src/db/queries/orders.sql",\n      "line": 17,\n      "claim": "Sort column is interpolated into the ORDER BY clause.",\n      "exploit_path": "Reachable only if the sort parameter bypasses the allowlist in bulk.ts; not demonstrated.",\n      "evidence": [{ "source": "src/db/queries/orders.sql", "ref": "L14-L20" }],\n      "confidence": "contested"\n    }\n  ],\n  "summary": "One confirmed tenant-isolation gap on the new bulk router, and one ORDER BY interpolation whose reachability I could not settle.",\n  "coverage": {\n    "files_examined": 3,\n    "files_skipped": 1,\n    "skipped_reason": "src/generated/schema.ts is generated code and is excluded by the review standards"\n  },\n  "unresolved": [\n    "Could not determine whether requireAuth is applied to the new bulk router; the router is registered dynamically in src/api/index.ts."\n  ]\n}',
  notes: '<code>coverage</code> and <code>unresolved</code> are the fields people leave out, and they are the ones ' +
         'that make the system honest. A pass that returns an empty findings array is indistinguishable from a pass ' +
         'that looked in the wrong place — unless it also says what it examined and what it could not settle. ' +
         'Per-finding <code>confidence</code> is what lets synthesis report a contested claim as contested instead ' +
         'of flattening three different epistemic states into one confident paragraph.'
},

/* ---------------------------------------------------------- 21 */
{
  id: 'ex21', type: 'json', topics: 'Build · Support orchestration', level: 'Build',
  title: 'Build a customer-support multi-agent system: tool distribution',
  brief: 'A retail bank runs a support orchestrator with four specialised subagents: <em>accounts</em>, ' +
         '<em>disputes</em>, <em>cards</em> and <em>policy</em>. Available tools are ' +
         '<code>verify_identity</code>, <code>get_account</code>, <code>get_transactions</code>, ' +
         '<code>get_statement</code>, <code>block_card</code>, <code>issue_replacement</code>, ' +
         '<code>issue_refund</code>, <code>get_seller_policy</code>, <code>escalate_to_human</code> and ' +
         '<code>close_session</code>. Refunds up to $50 are auto-approvable; above that a human must approve. ' +
         'Produce a JSON object mapping each agent name to its tool array, plus a <code>rationale</code> object ' +
         'mapping each agent to one sentence naming a tool it deliberately does NOT have and why.',
  starter: '{\n  "coordinator": [],\n  "accounts": [],\n  "disputes": [],\n  "cards": [],\n  "policy": [],\n  "rationale": {}\n}',
  checks: [
    { label: 'All five agents present with array tool lists', fn: function (o) { return o && ['coordinator','accounts','disputes','cards','policy'].every(function (k) { return Array.isArray(o[k]); }); } },
    { label: 'The disputes agent does NOT hold issue_refund', fn: function (o) { return arr(o && o.disputes).every(function (t) { return !/issue_refund/i.test(t); }); } },
    { label: 'Exactly one agent holds issue_refund, and it is the coordinator', fn: function (o) {
        var holders = ['coordinator','accounts','disputes','cards','policy'].filter(function (k) { return arr(o && o[k]).some(function (t) { return /issue_refund/i.test(t); }); });
        return holders.length === 1 && holders[0] === 'coordinator'; } },
    { label: 'escalate_to_human is on the coordinator (it owns the authority boundary)', fn: function (o) { return arr(o && o.coordinator).some(function (t) { return /escalate_to_human/i.test(t); }); } },
    { label: 'close_session is on the coordinator only', fn: function (o) {
        var holders = ['coordinator','accounts','disputes','cards','policy'].filter(function (k) { return arr(o && o[k]).some(function (t) { return /close_session/i.test(t); }); });
        return holders.length === 1 && holders[0] === 'coordinator'; } },
    { label: 'The cards agent holds the card tools and nothing outside its role', fn: function (o) {
        var t = arr(o && o.cards).join(' ');
        return /block_card/.test(t) && /issue_replacement/.test(t) && !/issue_refund|get_seller_policy|get_transactions/.test(t); } },
    { label: 'The policy agent is read-only (no action tools at all)', fn: function (o) {
        return arr(o && o.policy).length > 0 && arr(o.policy).every(function (t) { return !/(issue_|block_|close_|escalate_)/i.test(t); }); } },
    { label: 'No agent holds the full catalogue', fn: function (o) { return ['coordinator','accounts','disputes','cards','policy'].every(function (k) { return arr(o && o[k]).length < 9; }); } },
    { label: 'A rationale for every agent naming a deliberately absent tool', fn: function (o) {
        return o && o.rationale && ['coordinator','accounts','disputes','cards','policy'].every(function (k) { return typeof o.rationale[k] === 'string' && o.rationale[k].length > 25; }); } }
  ],
  solution:
'{\n  "coordinator": ["verify_identity", "issue_refund", "escalate_to_human", "close_session"],\n  "accounts":    ["get_account", "get_transactions", "get_statement"],\n  "disputes":    ["get_transactions", "get_account"],\n  "cards":       ["get_account", "block_card", "issue_replacement"],\n  "policy":      ["get_seller_policy"],\n  "rationale": {\n    "coordinator": "No get_statement or block_card: it delegates domain work rather than doing a worker\'s job badly, but it must own issue_refund because the $50 authority boundary and the escalation path are its responsibility.",\n    "accounts": "No issue_refund: an accounts agent that can move money will eventually settle a dispute it was only asked to explain.",\n    "disputes": "No issue_refund: its output contract is a recommendation, so it does not need an execution tool, and holding one is how four $49.99 refunds get issued to dodge a $50 limit.",\n    "cards": "No issue_refund and no get_transactions: card replacement never needs transaction history, and narrowing the catalogue improves selection among the tools it does hold.",\n    "policy": "No action tools whatsoever: it answers a question, and any ability to act would let a read-only lookup change the world."\n  }\n}',
  notes: 'The rule is that <strong>tool access follows the output contract, not the topic</strong>. The disputes ' +
         'agent is about disputes, so a refund tool feels natural — and that is exactly the trap. Its contract is a ' +
         'recommendation, so it needs no execution tool. Note also that concentrating <code>issue_refund</code> on ' +
         'the coordinator is what makes a per-dispute authority check possible at all: you cannot aggregate an ' +
         'exposure limit across four agents that can each spend independently.'
},

/* ---------------------------------------------------------- 22 */
{
  id: 'ex22', type: 'text', topics: 'Build · Terminal state', level: 'Build',
  title: 'Write the orchestrator loop that cannot drop a session',
  brief: 'Write the session runner in pseudocode or JavaScript. Every exit path must record an outcome. Handle ' +
         'each stop reason explicitly; bound the loop three ways; and account for the case where the process is ' +
         'killed mid-session and no in-process code runs at all. Assume <code>callModel()</code>, ' +
         '<code>runTools()</code>, <code>persist(state)</code> and <code>escalate(reason, partial)</code> exist.',
  starter: 'async function runSession(session) {\n  // three budgets\n\n  while (true) {\n    const r = await callModel(session);\n\n    switch (r.stop_reason) {\n\n    }\n  }\n}\n',
  checks: [
    { label: 'Handles tool_use by running tools and continuing the loop', fn: function (o, raw) { return has(raw, /tool_use/) && has(raw, /runTools|executeTools/); } },
    { label: 'Handles end_turn as terminal AND verifies before recording success', fn: function (o, raw) { return has(raw, /end_turn/) && has(raw, /verif|systemOfRecord|confirm|check[A-Z]/); } },
    { label: 'Handles max_tokens as truncation rather than as a completed answer', fn: function (o, raw) { return has(raw, /max_tokens/); } },
    { label: 'Handles refusal as terminal and escalates it', fn: function (o, raw) { return has(raw, /refusal/) && has(raw, /refusal[\s\S]{0,160}escalate/); } },
    { label: 'Has a default branch that escalates on any unrecognised stop reason', fn: function (o, raw) { return has(raw, /default\s*:|else\s*\{/) && has(raw, /(default\s*:|else\s*\{)[\s\S]{0,200}escalate/); } },
    { label: 'Bounds iterations with a turn budget', fn: function (o, raw) { return has(raw, /(turn|iteration)s?\s*(<|>|\+\+|>=|<=)|MAX_TURNS|maxTurns/i); } },
    { label: 'Bounds elapsed time with a wall-clock deadline checked inside the loop', fn: function (o, raw) { return has(raw, /(Date\.now|deadline|elapsed|wallClock|nowMs)/i); } },
    { label: 'Bounds spend with a cost or token budget', fn: function (o, raw) { return has(raw, /(cost|tokens?|usage|spend)\s*(>|>=|\+=)/i); } },
    { label: 'EVERY budget exit escalates rather than merely breaking or returning', fn: function (o, raw) {
        var m = raw.match(/(TURN_BUDGET|DEADLINE|COST|BUDGET)[A-Z_]*/g) || [];
        return m.length >= 2 && has(raw, /escalate\([^)]*(BUDGET|DEADLINE|EXHAUST|TIMEOUT)/i); } },
    { label: 'Persists session state durably as the session progresses', fn: function (o, raw) { return has(raw, /persist\s*\(/); } },
    { label: 'Names the out-of-band sweeper for the killed-process case', fn: function (o, raw) { return has(raw, /(sweeper|reaper|out-of-band|cron|reconcil)/i); } },
    { label: 'No path can fall through without recording something', fn: function (o, raw) { return !/\breturn;\s*$/m.test(raw) || has(raw, /escalate/); } }
  ],
  solution:
'async function runSession(session) {\n  const deadline = Date.now() + session.slaMs;   // wall clock\n  let turns = 0;                                 // iterations\n  let cost  = 0;                                 // spend\n\n  await persist({ ...session, status: "RUNNING" });   // durable BEFORE work starts\n\n  while (true) {\n    if (turns++ >= MAX_TURNS)     return escalate("TURN_BUDGET_EXHAUSTED", session);\n    if (Date.now() > deadline)    return escalate("SLA_DEADLINE_EXCEEDED", session);\n    if (cost > MAX_COST_USD)      return escalate("COST_BUDGET_EXHAUSTED", session);\n\n    const r = await callModel(session);\n    cost += r.usage.costUsd;\n    session.messages.push(r);\n    await persist(session);\n\n    switch (r.stop_reason) {\n      case "tool_use": {\n        const results = await runTools(r);          // parallel where independent\n        session.messages.push(results);\n        await persist(session);\n        continue;\n      }\n      case "end_turn": {\n        // end_turn means generation stopped, NOT that anything happened in the world\n        const verified = await verifyAgainstSystemOfRecord(session);\n        return verified.ok\n          ? persist({ ...session, status: "RESOLVED", reason: verified.reason })\n          : escalate("CLAIMED_BUT_UNVERIFIED", session);\n      }\n      case "max_tokens":\n        // truncated mid-generation: never parse as final\n        return escalate("OUTPUT_TRUNCATED", session);\n      case "refusal":\n        return escalate("MODEL_REFUSAL", session);       // terminal; do not retry\n      case "pause_turn":\n        continue;                                        // send back unchanged\n      default:\n        // unknown stop reasons fail INTO escalation, never into silence\n        return escalate("UNKNOWN_STOP_REASON:" + r.stop_reason, session);\n    }\n  }\n}\n\n// The path no in-process code can cover: SIGKILL, node eviction, deploy restart.\n// A separate out-of-band sweeper reads durable state on a schedule and escalates\n// any session left in a non-terminal status past its SLA. try/finally and even a\n// SIGTERM handler do not run when the process is killed outright.',
  notes: 'The property being graded is that <strong>every exit is a decision</strong>. A budget that merely ' +
         '<code>break</code>s is not a safeguard: "the loop ended" is not an outcome. Two details separate a good ' +
         'answer from a complete one — <code>end_turn</code> must be verified against the system of record before ' +
         'it is recorded as success, and the killed-process path needs an <em>external</em> reaper, because a ' +
         '<code>finally</code> block and a <code>SIGTERM</code> handler both need a process that is still running.'
},

/* ---------------------------------------------------------- 23 */
{
  id: 'ex23', type: 'choice', topics: 'Build · Orchestration decisions', level: 'Build',
  title: 'Orchestration decisions under pressure',
  brief: 'Ten judgement calls of the kind the exam builds whole scenarios around. Each has one best answer; ' +
         'several of the wrong answers work, they are just not the thing being asked for.',
  questions: [
    { q: 'Four investigations; three of them need the first one\'s output. What topology?',
      opts: ['All four in parallel, reconciling afterwards', 'Investigation one alone, then the other three in parallel', 'All four strictly sequential', 'One subagent per investigation, chained peer to peer'],
      a: 1,
      why: 'Read the dependency graph: one independent node, then three that become independent once it returns. Two waves is the minimum that respects the dependency, and parallelising all four just makes three agents guess.' },
    { q: 'A subagent returns "cannot determine — I need the customer\'s prior claim history". The coordinator has it. Systemic fix?',
      opts: ['Let the subagent query the coordinator mid-task', 'Give the subagent the coordinator\'s transcript', 'Build delegation packages from a structured state object', 'Move the determination into the coordinator'],
      a: 2,
      why: 'Round-tripping normalises the latency; transcript access destroys isolation and costs the whole history per turn. Building the package from maintained state fixes the class of failure for every subagent, not just this prompt.' },
    { q: 'A worker returns an empty result because its upstream timed out. What must change?',
      opts: ['Retry the worker three times before merging', 'Return a structured error and treat a missing required input as blocking', 'Note in the coordinator\'s prompt that empty may mean failure', 'Run that worker first so failures surface earlier'],
      a: 1,
      why: 'An empty result is indistinguishable from a legitimate absence. The failure must be expressible as data, and the merge step must refuse to proceed without a required input — that second half is the one people drop.' },
    { q: 'Your synthesis agent has web search so it can "fill gaps". Assess.',
      opts: ['Good: it makes reports more complete', 'Good, provided it cites what it finds', 'Bad: remove all tools; route gaps back to an investigator or a human', 'Bad: replace search with scratchpad read access'],
      a: 2,
      why: 'A synthesis stage reasons over worker output and introduces nothing. Any tool there is a path for claims to enter a report with no worker behind them — and citing a claim synthesis found itself just makes it an uncontrolled investigator with no brief.' },
    { q: 'Which is the strongest reason to split one agent into several?',
      opts: ['Specialised prompts make the model smarter', 'It mirrors how the team is organised', 'Context isolation: a wide read whose useful output is narrow', 'It reduces total token cost'],
      a: 2,
      why: 'Isolation and parallelism are the two real reasons. Multi-agent almost always costs MORE tokens — every subagent re-pays for a system prompt and a tool block — so a question framing it as the cheap option is signalling a trap.' },
    { q: 'A goal-oriented brief needs coordinator visibility and control. Where does the control come from?',
      opts: ['Enumerating the steps the agent must follow', 'The tool allowlist and the output schema', 'A lower temperature setting', 'Requiring approval before each tool call'],
      a: 1,
      why: 'Control over what it may touch and what must come back, latitude over how. Scripting the steps buys control by giving away the adaptability you delegated for.' },
    { q: 'A defined subagent is never selected; invoked by name it works perfectly. Cause?',
      opts: ['Its tools list is incomplete', 'Its description does not say when to use it', 'The parent session lacks a permission', 'It is in the project rather than user directory'],
      a: 1,
      why: 'Manual invocation succeeding rules out the definition, the tools and the permissions in one stroke. Description is the only routing signal left, and it must say WHEN, not merely what.' },
    { q: 'Three specialised review passes share one library of few-shot examples drawn from security incidents. Effect?',
      opts: ['Efficient: one library is easier to maintain', 'The API pass inherits the security severity bar and notion of a finding', 'No effect: examples only teach format', 'It improves recall on all three passes equally'],
      a: 1,
      why: 'Few-shot examples calibrate the severity bar as much as the category. Shared examples are the subtle wrong answer: each pass needs its own, ideally including a look-alike that is deliberately NOT a finding.' },
    { q: 'A pipeline is killed at 45% and the re-run produces a different answer. What was missing?',
      opts: ['A longer pod termination grace period', 'Durable per-task state plus an input fingerprint per task', 'A larger context window on the coordinator', 'Checkpointing every task to the conversation history'],
      a: 1,
      why: 'Two properties: durable state so completed work is skipped, and fingerprints so restored conclusions are still true. Grace periods move the cliff; conversation history dies with the process.' },
    { q: 'An agent has looped for nine turns making identical tool calls. Best detection?',
      opts: ['Ask the model each turn whether it is making progress', 'Compare tool-call signatures and observed state across turns', 'Raise the turn budget so it can find a new angle', 'Lower the temperature so it stops varying its approach'],
      a: 1,
      why: 'Repetition is directly observable and needs no introspection. Asking a stuck agent whether it is stuck is asking the failing component to diagnose itself — it believes each turn is productive.' }
  ]
},

/* ---------------------------------------------------------- 24 */
{
  id: 'ex24', type: 'lab', topics: 'Build · Terminal lab', level: 'Terminal lab',
  title: 'Lab — build and run a two-agent review pipeline locally',
  brief: 'Everything above is on paper. This lab takes about thirty minutes and makes the delegation boundary ' +
         'physical: you will watch a subagent succeed with a good package and fail with a bad one, and you will ' +
         'see exactly what the coordinator does and does not receive back.',
  steps: [
    'Create a scratch repo with a real defect to find: <code>mkdir agent-lab &amp;&amp; cd agent-lab &amp;&amp; git init</code>. Add <code>src/api/orders.ts</code> containing a handler that reads an <code>orgId</code> from the path and queries by it with no membership check, plus two or three innocuous files.',
    'Create <code>.claude/agents/security-reviewer.md</code>. Frontmatter: <code>name</code>, a <code>description</code> that says <em>when</em> to use it, <code>tools: Read, Grep, Glob</code>, and a model. Body: the role, the finding format, and a rule that a finding requires a concrete exploit path.',
    'Ask Claude Code to review the diff using that subagent. Read the output: does it name the file and line? Does it say what it did not examine?',
    'Now break the allowlist deliberately — add <code>Edit</code> to <code>tools:</code> and ask for a review of a file with an obvious small bug. Watch whether the reviewer stays a reviewer. This is the single most persuasive demonstration of why role boundaries are allowlists and not system prompts.',
    'Restore the allowlist. Now break the description instead: change it to just <code>Reviews code.</code> Start a fresh session and ask for a security review without naming the agent. Observe whether it is selected at all.',
    'Delegation experiment. Write two delegation prompts for the same task. Prompt A says "review the changes we discussed for auth problems". Prompt B names the commit, lists the changed files, states the applicable rules file, gives the exclusions and specifies the exact return shape. Run both. Compare what comes back — and count how many turns each one takes.',
    'Add a second agent, <code>.claude/agents/api-reviewer.md</code>, with its own concern and its own examples. Ask for both reviews in one request and watch whether they are dispatched together or one after the other.',
    'Finally, write a tiny synthesis step yourself: take both agents\' outputs and merge them by hand into one verdict. Notice what you needed in order to de-duplicate — file, line and class — and notice what you could not do because one of the reports gave you a paragraph instead of a structure. That gap is what the output-schema exercise is about.'
  ],
  reveal:
'What the lab is designed to make permanent:\n\n1. tools: is the boundary. A reviewer with Edit edits. Every time. Not because the\n   model is disobedient, but because in some situation fixing the bug is obviously\n   the helpful thing to do, and nothing in the system prevents it.\n\n2. description is the router. "Reviews code." is not a routing signal. The\n   coordinator matches a task against descriptions, so a description that does not\n   say WHEN produces an agent that exists and is never used.\n\n3. The delegation prompt is a closure. Prompt A sends the subagent to look for a\n   conversation it cannot see; it will either ask, or guess, or review the wrong\n   thing confidently. Prompt B finishes in fewer turns AND produces a mergeable\n   result. That difference is the whole of objective "construct subagent prompts\n   that include everything required for task completion".\n\n4. Structure is what makes synthesis possible. You cannot de-duplicate prose. The\n   moment you try to merge two reports by hand you discover exactly which fields\n   the schema needed: a stable identity (file + line + class), an epistemic status,\n   and a statement of what was not examined.',
  notes: 'If you only do one step, do the delegation experiment. Running the same task with a pointer-style ' +
         'prompt and a closure-style prompt, back to back, is the fastest way to internalise the single idea that ' +
         'the largest family of exam questions turns on.'
}

];
