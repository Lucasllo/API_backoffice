---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-10-05T00:19:44.151Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | package.json | 32 | Self-link api_ifarma file: ja estava no working tree e foi preservado no commit do script seed. | open |  | 2026-10-05T00:19:44.151Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "package.json",
    "line": 32,
    "description": "Self-link api_ifarma file: ja estava no working tree e foi preservado no commit do script seed.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-10-05T00:19:44.151Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
