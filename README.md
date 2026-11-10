# CISSP Cram Kit

A single-page study site for the CISSP exam (ISC2 outline effective April 15, 2024).

- **Plan** – day-by-day cram schedule, exam facts, domain mastery, "think like a manager" rules
- **Cheat Sheet** – highest-yield facts for all 8 domains, plus formulas and memory aids
- **Acronyms** – ~420 acronyms tagged by domain, with commonly confused pairs
- **Laws & Bodies** – regulators, laws, standards, who enforces what, breach-notification clocks
- **Models & Mnemonics** – 46 ordered models (OSI, RMF, IR, kill chain, EALs…) with mnemonics and "Test me" ordering drills
- **Drills** – acronym rounds with same-initials decoys, look-alike acronyms, and redacted law/body/standard questions
- **Domain Quiz** – 130 scenario questions plus multi-select ("Choose TWO"), ordering and matching items
- **Practice Test** – timed, domain-weighted, forward-only like the CAT
- **Flashcards** – study-set cards, acronyms and laws, with "Got it / Again" tracking

## Progress

Quiz results, practice-test history and retired flashcards are saved in the browser's
`localStorage` under the key `cissp-cram-v1`. Nothing is sent anywhere. Progress is per
browser and per site, so a phone and a laptop each keep their own.

## Editing

The page is built from `src/`:

| File | Contents |
| --- | --- |
| `src/cheat.js` | Domains, cheat-sheet blocks, mindset rules, exam facts |
| `src/acronyms.js` | Acronym list (`ACR|Expansion|domain|note`) |
| `src/regs.js` | Regulatory bodies, laws, standards |
| `src/questions.js` | Scenario questions (correct answer listed first; shuffled at runtime) |
| `src/advanced.js` | Multi-select and matching items |
| `src/models.js` | Ordered models + mnemonics (also generate ordering questions) |
| `src/review.json` | Quick-review cards, formulas and memory aids parsed from the study set |
| `src/app.js` | App logic |
| `src/template.html` | Styles and page shell |

After editing, rebuild:

```bash
python3 scripts/build.py
```

## Hosting

Served with GitHub Pages from the repository root (`index.html`).
