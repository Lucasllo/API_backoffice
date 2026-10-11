---
phase: 03-percurso-e-prova
plan: 01
subsystem: testing
tags: [jest, supertest, nestjs, typeorm, mysql, dotenv]

requires:
  - phase: 02-entrega-confirmada
    provides: Fila Waiting persistida, segundo enfileiramento recusado e código 4821 concluindo a mesma linha
  - phase: 01-demo-que-autentica
    provides: Semente da demo, entregador que autentica e npm run seed
provides:
  - Script npm test:delivery com dotenv, config Jest própria, runTestsByPath e runInBand
  - Spec que semeia, autentica o entregador e percorre fila, código 0000 e código 4821
  - Isolamento desse spec em relação a npm test e npm run test:e2e
affects: [03-02, README]

actuals:
  tokens: 1352
  tasks: 2
  commits: 1

tech-stack:
  added: []
  patterns:
    - "test:delivery carrega dotenv, aponta jest-delivery.json e cita o spec com runTestsByPath e runInBand"
    - "O beforeAll semeia com spawnSync de scripts/apply-demo-sql.js e recusa host, banco ou ENV fora da demo local"
    - "O spec sobe AppModule com app.init, lê a fila pelo DataSource do módulo e fecha com app.close"

key-files:
  created:
    - test/delivery-path.spec.ts
    - test/jest-delivery.json
  modified:
    - package.json

key-decisions:
  - "npm run test:delivery não leva --forceExit porque o processo devolveu o prompt depois de app.close()."
  - "O moduleNameMapper já sujo no bloco jest de package.json ficou fora deste commit."

patterns-established:
  - "A prova da entrega mora em test/delivery-path.spec.ts, fora do rootDir src e fora do regex e2e-spec."
  - "O Bearer sai de body.token do loginDelivery. A fila e o pedido são lidos com where do repositório."

requirements-completed: [TEST-01]

coverage:
  - id: D1
    description: "npm run test:delivery autentica o entregador da demo, grava a fila do pedido 1, recusa o código 0000 sem concluir e, com 4821, conclui essa mesma linha e o pedido."
    requirement: TEST-01
    verification:
      - kind: e2e
        ref: "npm run test:delivery — test/delivery-path.spec.ts, 1 passed, processo encerrou com status 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "O script test:delivery cita só test/delivery-path.spec.ts. npm test e npm run test:e2e não coletam esse arquivo."
    requirement: TEST-01
    verification:
      - kind: other
        ref: "npm test --listTests e npm run test:e2e --listTests não citam delivery-path.spec.ts; o --listTests de test:delivery imprime esse arquivo uma vez"
        status: pass
    human_judgment: false

plan_head_before: 02ccd0080685a6cd5c08a01789951e24614e0377
plan_head_after: 05d2bc68200986bd109c94d8aca12d6d85613988

duration: 15min
completed: 2026-10-11
status: complete
---

# Phase 3 Plan 01: Percurso e prova Summary

**`npm run test:delivery` semeia a demo, autentica o entregador e prova a fila, o código 0000 e o código 4821 na mesma linha**

## Performance

- **Duration:** 15 min
- **Started:** 2026-10-11T21:02:00Z
- **Completed:** 2026-10-11T21:17:05Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- `package.json` ganhou `test:delivery` ao lado de `test:e2e`: `node -r dotenv/config`, `./node_modules/jest/bin/jest.js`, `--config ./test/jest-delivery.json`, `--runTestsByPath ./test/delivery-path.spec.ts` e `--runInBand`. Sem `--passWithNoTests` e sem `--forceExit`.
- `test/delivery-path.spec.ts` recusa `DB_HOST`, `DB_DATABASE` ou `ENV` fora da demo local, semeia com `spawnSync` de `scripts/apply-demo-sql.js`, sobe `AppModule` com `ValidationPipe` e `app.init`, e percorre login, `POST /deliveryqueue/1`, código `0000` e código `4821`.
- Entre os POST, `Repository.find` na conexão do `AppModule` mostra a mesma linha: depois da fila, `shoppingId` 1, `userDeliveryId` 1, status 1, pedido status 6 e `verificationCode` 4821; depois de `0000`, o mesmo id e os mesmos status; depois de `4821`, o mesmo id, status 2 e pedido status 4.
- `npm test` e `npm run test:e2e` não coletam esse arquivo. O `--listTests` de `test:delivery` imprime o caminho uma vez.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fatia ponta a ponta: npm run test:delivery prova login, fila, código 0000 e código 4821** - `05d2bc6` (test)
2. **Task 2: O comando cita só o spec e os outros Jest não o coletam** - sem commit; a conferência não alterou arquivo

## Files Created/Modified

- `package.json` - script `test:delivery` ao lado de `test:e2e`
- `test/jest-delivery.json` - `rootDir` `..`, `testTimeout` 180000, regex só de `delivery-path.spec.ts`, mapper `src/` para `<rootDir>/src/$1`
- `test/delivery-path.spec.ts` - describe `delivery path`, um `it` com os quatro POST e leitura da mesma linha

## Decisions Made

- `--forceExit` ficou de fora. As duas execuções de `npm run test:delivery` saíram 0 e devolveram o prompt depois de `app.close()`.
- O `moduleNameMapper` que já estava sujo no bloco `jest` de `package.json` não entrou no commit. O bloco commitado continua com `rootDir` `src`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- O contador da segunda tarefa trata cada linha de stdout que contém `delivery-path.spec.ts`. No npm 11, com `loglevel` `notice`, o banner do lifecycle repete o comando e o Jest imprime o caminho em outra linha. O script oficial sai com `list-count`. A listagem do Jest é uma ocorrência: `test/delivery-path.spec.ts`. `npm test --listTests` e `npm run test:e2e --listTests` não citam o arquivo. Com `loglevel` `silent` o banner some e a contagem fica em 1. Não gravei `.npmrc` para não calar `npm install` no restante do repositório.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `npm run test:delivery` prova o caminho semeado e o processo encerra. O README em português e a espera de 130 segundos do seed ficam no plano 02.
- O `.env` local não foi lido para o Git nem sobrescrito. `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_DATABASE`, `JWT_SECRET` e `ENV` já batiam com `.env.example`. O MySQL em `127.0.0.1:3306` aceitou a semente.

## Self-Check: PASSED

- FOUND: package.json
- FOUND: test/jest-delivery.json
- FOUND: test/delivery-path.spec.ts
- FOUND: 05d2bc6

---
*Phase: 03-percurso-e-prova*
*Completed: 2026-10-11*
