# CISSPrep

A CISSP study guide.

A single-page study site for the CISSP exam (ISC2 outline effective April 15, 2024).

- **Setup** – first visit asks for a name, design style, exam date and focus areas (editable any time)
- **Navigation** – Plan · Learn (Cheat Sheet, Acronyms, Laws & Bodies, Models) · Practice (Quiz, Drills, Practice Test, Flashcards, Brain Dump) · Exam Day. Every practice mode uses the same setup panel and opens a focused session
- **Design styles** – eight full looks, each with its own type, layout treatment, borders and buttons: Minimal, Swiss, Neo-brutalist, Editorial, Terminal, Glass, Blueprint, High contrast (header → Style)
- **Plan** – study plan generated from your exam date and focus areas (daily, or weekly if 3+ weeks out), domain mastery, "think like a manager" rules
- **Cheat Sheet** – highest-yield facts for all 8 domains, plus formulas and memory aids
- **Acronyms** – ~420 acronyms tagged by domain, with commonly confused pairs
- **Laws & Bodies** – regulators, laws, standards, who enforces what, breach-notification clocks
- **Models & Mnemonics** – 46 ordered models (OSI, RMF, IR, kill chain, EALs…) with mnemonics and "Test me" ordering drills
- **Drills** – acronym rounds with same-initials decoys, look-alike acronyms, redacted law/body/standard questions, generated calculations (SLE/ALE/ARO, safeguard value, RTO/MTD, availability, key counts, backup restores) and "Which key?" crypto scenarios
- **Domain Quiz** – 194 scenario questions, 51 BEST/FIRST manager-mindset questions (with why the runner-up loses), multi-select, ordering, matching and hotspot (click-the-diagram) items, plus **Smart review** that targets misses, weak and focus domains
- **Practice Test** – timed, domain-weighted, forward-only like the CAT
- **History** – every quiz, drill, smart review and practice test is recorded: score-over-time chart, average/best/last/trend, per-domain breakdown and session list (filterable by drill or mode)
- **Deep links** – plan items open the exact spot: a domain's cheat-sheet section, a ready-started domain quiz or drill; search results have "Open →" links
- **Brain Dump** – write formulas, ports and models from memory; auto-checks what you got and whether it's in order; 10-minute timer
- **Exam Day** – test-centre expectations, after-you-pass steps (endorsement, CPEs) and curated free resources
- **Flashcards** – study-set cards, acronyms, laws and models with spaced repetition (4 h → 1 → 3 → 7 → 14 days)

## Install on your phone

CISSPrep is an installable web app (manifest + service worker), so it works offline once loaded. On first visit on a phone it offers to add itself to the Home Screen: Android shows an Install button; iPhone shows the Share → Add to Home Screen steps. The prompt can be reopened from the Plan tab.

## Progress

Your setup, quiz results, practice-test history and retired flashcards are saved in the browser's
`localStorage` under the key `cissp-cram-v1`. Nothing is sent anywhere. Progress is per
browser and per site. To move it, copy your progress code on the Plan tab and paste it on the other device.

## Editing

The page is built from `src/`:

| File | Contents |
| --- | --- |
| `src/cheat.js` | Domains, cheat-sheet blocks, mindset rules, exam facts |
| `src/acronyms.js` | Acronym list (`ACR|Expansion|domain|note`) |
| `src/regs.js` | Regulatory bodies, laws, standards |
| `src/questions.js`, `src/questions2.js` | Scenario questions (correct answer listed first; shuffled at runtime) |
| `src/hotspot.js` | Diagrams and click-the-zone items |
| `src/advanced.js` | Multi-select and matching items |
| `src/manager.js` | BEST/FIRST questions: best answer, runner-up and why it loses |
| `src/models.js` | Ordered models + mnemonics (also generate ordering questions) |
| `src/review.json` | Quick-review cards, formulas and memory aids parsed from the study set |
| `src/app.js` | App logic |
| `src/template.html` | Styles and page shell |
| `icons/`, `favicon.svg` | App icons (logo sources are the SVGs in `icons/`) |
| `manifest.webmanifest`, `sw.js` | Install metadata and offline caching |

After editing, rebuild:

```bash
python3 scripts/build.py
```

## Hosting

Served with GitHub Pages from the repository root (`index.html`).
