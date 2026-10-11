---
phase: 01
review: 01-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "O SQL ignora `DB_DATABASE` e o fallback é desfeito"
  - id: WR-02
    severity: warning
    disposition: open
    title: "`validCode` 0 é um código de recuperação que não sai da linha"
  - id: WR-03
    severity: warning
    disposition: open
    title: "`shoppingId` da fila não é único"
  - id: WR-04
    severity: warning
    disposition: open
    title: "O seed desiste antes da janela de saúde do MySQL"
open: 4
total: 4
recorded: 2026-10-06T01:30:00.000Z
---

# Phase 01: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-02 | warning | open | - |
| WR-03 | warning | open | - |
| WR-04 | warning | open | - |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
