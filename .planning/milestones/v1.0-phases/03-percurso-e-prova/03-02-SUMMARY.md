---
phase: 03-percurso-e-prova
plan: 02
subsystem: docs
tags: [readme, mysql2, compose, curl, seed]

requires:
  - phase: 03-percurso-e-prova
    provides: npm run test:delivery prova login, fila, código 0000 e código 4821
  - phase: 01-demo-que-autentica
    provides: .env.example, compose.yaml mysql:8.4.11 e npm run seed
provides:
  - README em português com quadro do entregador e quatro blocos curl.exe até a confirmação do pedido 1
  - connect de scripts/apply-demo-sql.js espera MAX_ATTEMPTS 130 e trata errno 1045 como retry
affects: [quem clona o repositório]

actuals:
  tokens: 1830
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "MAX_ATTEMPTS 130 e intervalo de 1000 ms cobrem start_period 30s mais 20 intervalos de 5s do Compose"
    - "errno 1045 e ER_ACCESS_DENIED_ERROR entram em isRetryable; errno 1044 permanece só no CREATE DATABASE"
    - "Os quatro passos do percurso são linhas curl.exe, com JSON do login entre aspas simples"

key-files:
  created: []
  modified:
    - scripts/apply-demo-sql.js
    - README.md

key-decisions:
  - "A espera do seed sobe para 130 tentativas de 1 segundo. Acesso negado transitório volta a tentar; acesso negado de CREATE DATABASE continua no preâmbulo."
  - "O README troca o starter inteiro. O quadro cita só o entregador, e o token do login é colado ao vivo."

patterns-established:
  - "O percurso manual pede npm run seed de novo imediatamente antes dos quatro blocos curl.exe."
  - "A seção final aponta npm run test:delivery como a repetição do mesmo caminho, e manda semear de novo depois que o pedido fica concluído."

requirements-completed: [ENV-01]

coverage:
  - id: D1
    description: "npm run seed tenta a conexão por até 130 segundos e trata acesso negado transitório como retry, sem misturar com o CREATE DATABASE."
    requirement: ENV-01
    verification:
      - kind: integration
        ref: "node seed-wait check imprime seed-wait-ok; npm run test:delivery passa em test/delivery-path.spec.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "O README em português pede a cópia do exemplo sem editar, sobe a demo e mostra os quatro blocos até a confirmação do pedido 1."
    requirement: ENV-01
    verification:
      - kind: other
        ref: "node readme check imprime readme-ok: quatro curl.exe na ordem, quadro do entregador, seed antes dos blocos e npm run test:delivery no fim"
        status: pass
    human_judgment: true
    rationale: "O checker prova o texto. Ver o token, o corpo vazio, Dados invalidos e a fila concluída ainda depende de colar os quatro blocos numa API no ar."

plan_head_before: 76add580ae2c33936cdca1c33c564d3230dbe06b
plan_head_after: 176d879c4939b35f14aa8aae01c2320dd240de57

duration: 8min
completed: 2026-10-11
status: complete
---

# Phase 3 Plan 02: Percurso e prova Summary

**O README em português leva até a confirmação do pedido 1, e `npm run seed` espera o MySQL do Compose por até 130 segundos**

## Performance

- **Duration:** 8 min
- **Started:** 2026-10-11T21:22:00Z
- **Completed:** 2026-10-11T21:30:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `scripts/apply-demo-sql.js` declara `MAX_ATTEMPTS` 130. As duas comparações de `connect` usam essa constante, com `setTimeout` de 1000 ms.
- `isRetryable` continua aceitando `ECONNREFUSED`, `ETIMEDOUT`, `ENOTFOUND`, `ECONNRESET` e `PROTOCOL_CONNECTION_LOST`, e também errno `1045` e `ER_ACCESS_DENIED_ERROR`. O errno `1044` e `ER_DBACCESS_DENIED_ERROR` ficam só no `CREATE DATABASE` de `runPreamble`.
- `README.md` substitui o starter. A abertura pede Node.js e npm, `npm install`, cópia de `.env.example` para `.env` sem editar, MySQL `mysql:8.4.11` ou MySQL local, `npm run seed` e `npm run start:dev` na porta 3000.
- O quadro lista `entregador.demo@example.com`, `Entrega1!`, pedido 1 e código `4821`. Quatro blocos `curl.exe` percorrem login, fila, código `0000` e código `4821`. A seção final diz que `npm run test:delivery` repete o mesmo caminho.

## Task Commits

Each task was committed atomically:

1. **Task 1: A semente espera a janela de saúde do Compose** - `3fec789` (fix)
2. **Task 2: O README em português leva até a confirmação do pedido 1** - `176d879` (docs)

## Files Created/Modified

- `scripts/apply-demo-sql.js` - espera de 130 segundos e retry de acesso negado transitório
- `README.md` - percurso em português com quadro do entregador e quatro blocos `curl.exe`

## Decisions Made

- A janela do healthcheck do Compose (`start_period` 30s mais 20 intervalos de 5s) vira 130 tentativas de 1 segundo. O healthcheck e a imagem `mysql:8.4.11` não foram editados.
- Acesso negado transitório (errno 1045 / `ER_ACCESS_DENIED_ERROR`) volta a tentar. Acesso negado de `CREATE DATABASE` (errno 1044 / `ER_DBACCESS_DENIED_ERROR`) permanece no preâmbulo.
- O README não escreve o segredo JWT, não cola um token fixo e não pede outro nome de banco. A senha fictícia `Entrega1!` fica só no quadro do entregador.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Quem clona o repositório tem o percurso em português e a prova `npm run test:delivery` do plano 01.
- WR-01 e WR-02 continuam abertos. O texto não pede para trocar o nome do banco.
- A premissa de concorrência de ENV-01 permanece sem garantia: o README descreve um leitor só, em sequência.

## Self-Check: PASSED

- FOUND: scripts/apply-demo-sql.js
- FOUND: README.md
- FOUND: 3fec789
- FOUND: 176d879

---
*Phase: 03-percurso-e-prova*
*Completed: 2026-10-11*
