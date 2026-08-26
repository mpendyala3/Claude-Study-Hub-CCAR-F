# Claude Study Hub · CCAR-F

### 🔗 Live site: **https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/**

**[Home](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/)** — the two tracks and a way in to each.

**CCAR-A1** — [Overview](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a1-index.html) ·
[Docs](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a1-docs.html) ·
[Exercises](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a1-exercises.html) ·
[Mock exam](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a1-exam.html)

**CCAR-A2** — [Overview](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a2-index.html) ·
[Docs](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a2-docs.html) ·
[Exercises](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a2-exercises.html) ·
[Mock exam](https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/a2-exam.html)

---

A study site for one Anthropic certification:

- **Claude Certified Architect – Foundations** (CCA-F / CCAR-F) — built around two published objective lists from
  two sittings of the exam, carried as the **CCAR-A1** and **CCAR-A2** tracks.

It is a static site: plain HTML, CSS and JavaScript, no build step, no dependencies, no network calls at runtime.
It works from GitHub Pages and equally well from `file://`.

The Associate (CCAO-F) and Developer (CCDV-F) tracks live in a separate repository,
[Claude-Study-Hub](https://github.com/mpendyala3/Claude-Study-Hub).

---

## Two tracks

CCAR-A1 and CCAR-A2 are the same exam. Its published objective list changed materially between the two attempts,
so this site carries both rather than merging them — the second list is not a superset of the first, and the
material written for each is genuinely different in emphasis.

| Track | Built from | Emphasis |
|---|---|---|
| **CCAR-A1** | Attempt-1 objective list (29 objectives) | Orchestration safeguards, hooks and permissions, Messages API mechanics, extraction pipelines, tool design |
| **CCAR-A2** | Attempt-2 objective list (37 objectives) | Multi-agent orchestration and subagent context contracts, Claude Code driven non-interactively, automated review, `context: fork`, MCP |

Each track has the same four pages: an **Overview** (blueprint and study plan), **Documentation**, browser-graded
**Exercises**, and a 60-question / 120-minute **Mock Exam**.

The header carries two rows. The first is the three main pages — **Home**, **CCAR-A1**, **CCAR-A2** — and the
second is the four pages of whichever track you are in.

### The exam at a glance

| | |
|---|---|
| Full name | Claude Certified Architect – Foundations (CCA-F / CCAR-F) |
| Level | 300 — assumes you have shipped production work with Claude |
| Format | Proctored, closed-book, scenario-based multiple choice |
| Length | 60 questions / 120 minutes |
| Pass | **720** on a 100–1000 scale |

---

## What's in it

| Page | Contents |
|---|---|
| `index.html` — Home | A short overview and one card per track, each linking straight to that track’s Overview, Docs, Exercises and Mock Exam |
| `a1-index.html` — CCAR-A1 Overview | Exam blueprint, domain weightings, the seven anti-patterns used as distractors, a study plan, and primary sources |
| `a1-docs.html` — CCAR-A1 Documentation | A four-part primer (agentic loop and stop reasons, Claude Code config surfaces, MCP, cost/latency levers), then all nine CCAR-A1 test topics end-to-end, each with a **worked real scenario** (what went wrong at a named organisation, and the fix), 54 Q&A drills, an exam-day playbook and a cheat sheet |
| `a1-exercises.html` — CCAR-A1 Exercises | 24 exercises: 16 original drills (write real `settings.json`, hooks, schemas, tool definitions, error payloads) plus an 8-exercise **build track** — a PR-review multi-agent system, a support orchestrator's tool distribution, the orchestrator/subagent/synthesis context contract, and an orchestrator loop that cannot drop a session |
| `a1-exam.html` — CCAR-A1 Mock Exam | 60 scenario items, **rewritten from scratch at a much higher difficulty**: near-miss distractors, 10 select-two items, code-tracing and measurement-reading questions |
| `a2-index.html` — CCAR-A2 Overview | All 37 Attempt-2 objectives with per-objective scores, a gap analysis against Attempt 1, the repeat-failure list, and a derived domain weighting |
| `a2-docs.html` — CCAR-A2 Documentation | 41 sections written from first principles across five domains, deepest on the seven objectives scored 0%: dynamic decomposition, review architecture, review configurations, `context: fork`, test generation, tool distribution, and `tool_choice` sequencing. Every primer and topic carries a **worked real scenario** — 39 in all |
| `a2-exercises.html` — CCAR-A2 Exercises | 14 exercises weighted to the failed objectives — seven target the 0% list — with 9 graded in the browser and one terminal lab |
| `a2-exam.html` — CCAR-A2 Mock Exam | 60 items in the real exam's shape: long scenarios, **each item spanning two or three objectives**, weighted to the derived CCAR-A2 blueprint |
| `Test Topics.txt` | The Attempt-1 objective list as published, kept as the source the A1 material was written against |

### Mock exam construction

Both banks are built to the same rules:

- **Weighted to the blueprint**, so a weak per-domain score is a real signal.
- **The answer key is balanced** across A/B/C/D, and select-two items use distinct letter pairs.
- **No length tell.** Within every question the options are written to a similar length, and the correct option is
  deliberately never the longest and never the shortest. Measured across the banks, the key is the longest option
  on 2% (CCAR-A1) and 7% (CCAR-A2) of items, against 25% by chance.
- **Every option is explained** — the rule behind the right answer and why each distractor fails.

| Bank | Items | Select-two | Key letters (A/B/C/D) |
|---|---|---|---|
| CCAR-A1 | 60 | 10 | 19 / 18 / 17 / 16 |
| CCAR-A2 | 60 | 9 | 19 / 17 / 17 / 16 |

---

## Deploy to GitHub Pages

This repository is published at
**https://mpendyala3.github.io/Claude-Study-Hub-CCAR-F/** (Pages source: branch `main`, folder `/ (root)`).

To deploy your own copy, create an empty repository on GitHub (no README, no .gitignore), then from this
directory:

```bash
git init -b main && git add -A && git commit -m "Claude study hub: CCAR-F"
```

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git && git push -u origin main
```

Then in the repository on GitHub: **Settings → Pages → Source: Deploy from a branch →
Branch: `main`, folder: `/ (root)` → Save.**

The site appears at `https://<your-username>.github.io/<your-repo>/` within a minute or two.

`.nojekyll` is already present, which stops GitHub from running Jekyll over the files — without it,
paths beginning with an underscore are silently dropped.

## Run it locally

Opening `index.html` directly in a browser works. For a local server:

```bash
npx -y http-server . -p 8098 -c-1
```

## Progress and privacy

Your exam answers, flags, timer state and half-finished exercise editors are saved to
`localStorage` in your own browser. Nothing is sent anywhere — there is no analytics, no CDN and no
external request of any kind. Clearing site data resets everything; the exam's **Reset** button
clears just the exam attempt.

---

## Sources and caveat

The documentation is written from Anthropic's product documentation plus public candidate reports:

- [Claude Code — Hooks](https://code.claude.com/docs/en/hooks)
- [Claude Code — Settings & permissions](https://code.claude.com/docs/en/settings)
- [Claude Code — CLAUDE.md & memory](https://code.claude.com/docs/en/memory)
- [Claude Code — Subagents](https://code.claude.com/docs/en/sub-agents)
- [Claude API — Define tools & `tool_choice`](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
- [Claude API — Handle tool calls, `stop_reason`, `is_error`](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls)
- [Claude API — Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Anthropic Academy — Architect Foundations certification page and exam guide](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification)

**All 120 mock questions are original.** They were written to the two published objective lists, to documented
product behaviour, and to the traps reported by candidates who have sat the exam. They are not recalled or leaked
exam items, and no source claiming to hold verbatim exam content was used. Treat a strong score as evidence you
understand the material, not as a preview of the live item pool.

The per-objective percentages on the CCAR-A2 Overview page are transcribed from the candidate's own score
reports. Everything else on the site is original material written to those objectives.

Some details are version-sensitive — CLI flag names, hook event names, supported JSON Schema
keywords. Verify those against the live documentation close to your exam date.

Independent study material. Not affiliated with or endorsed by Anthropic.
