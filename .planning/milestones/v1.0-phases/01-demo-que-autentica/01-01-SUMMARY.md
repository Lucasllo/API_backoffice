---
phase: 01-demo-que-autentica
plan: 01
subsystem: database
tags: [mysql, dotenv, bcrypt, nestjs, jwt, seed]

requires: []
provides:
  - Compose MySQL 8.4.11 bound to 127.0.0.1:3306 with named volume ifarma_mysql
  - .env.example contract for DB_*, JWT_SECRET, ENV=demo, MAIL_* and CLIENT_URL
  - Idempotent seed/demo.sql for store 2312, order 1, verificationCode 4821
  - npm run seed and dotenv preload before AppModule
affects: [02-fila, 03-readme]

actuals:
  tokens: 3624
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "import 'dotenv/config' as the first line of src/main.ts"
    - "npm run seed applies seed/demo.sql with mysql2 and node -r dotenv/config"
    - "Demo graph is DELETE then INSERT of ids 1, with no INSERT into deliveryqueue"

key-files:
  created:
    - compose.yaml
    - .env.example
    - seed/demo.sql
    - scripts/apply-demo-sql.js
  modified:
    - src/main.ts
    - package.json
    - package-lock.json

key-decisions:
  - "The bcrypt 5.1.1 hash of Entrega1! is written into seed/demo.sql by Node, cost 10, and the applicator never prints it."
  - "The pre-existing api_ifarma file: self-link stayed in package.json; this plan did not npm-install any package."
  - "ENV=demo and the developmen literal stay, so synchronize remains off."

patterns-established:
  - "Demo DDL and DML live in seed/demo.sql, split from the CREATE DATABASE preamble by a lone -- @schema line."
  - "DB_DATABASE is interpolated only after ^[A-Za-z0-9_]+$."

requirements-completed: [ENV-02, SEED-01, SEED-02]

coverage:
  - id: D1
    description: "MySQL 8.4.11 from the example env, bound to 127.0.0.1, with dotenv loaded before AppModule."
    requirement: ENV-02
    verification:
      - kind: integration
        ref: "docker compose up mysql:8.4.11 healthy on 127.0.0.1:3306; src/main.ts first import dotenv/config"
        status: pass
    human_judgment: false
  - id: D2
    description: "Versioned seed inserts store 2312, operator, delivery user, client and order 1 with verificationCode 4821, and a second run leaves that order with no deliveryqueue row."
    requirement: SEED-01
    verification:
      - kind: integration
        ref: "node scripts/apply-demo-sql.js twice printed seed-ok; npm run seed after an artificial queue row printed reseed-ok"
        status: pass
    human_judgment: false
  - id: D3
    description: "POST /auth/loginDelivery for the seeded delivery user returns token, id 1, name Entregador Demo and role 4, and the JWT verifies with the demo secret."
    requirement: SEED-02
    verification:
      - kind: e2e
        ref: "nest start then POST /auth/loginDelivery printed login-ok before and after npm run seed"
        status: pass
    human_judgment: false

plan_head_before: a9d2ace1547040370f8ed09b0f9fae5a303d21aa
plan_head_after: 45a21cb06f2086bf69c0b4cf818951331c69db4a

duration: 15min
completed: 2026-10-04
status: complete
---

# Phase 1 Plan 01: Demo que autentica Summary

**MySQL 8.4.11 local, semente idempotente da loja 2312 e login do entregador 1 com o JWT de demonstração**

## Performance

- **Duration:** 15 min
- **Started:** 2026-10-05T00:03:00Z
- **Completed:** 2026-10-05T00:17:39Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- `compose.yaml` publica `mysql:8.4.11` só em `127.0.0.1:3306`, com volume nomeado `ifarma_mysql`, usuário `ifarma` e charset `utf8mb4`.
- `.env.example` cobre `DB_*`, `JWT_SECRET=demo-jwt-secret-ifarma`, `ENV=demo`, `MAIL_*` e `CLIENT_URL`. `src/main.ts` carrega `dotenv/config` antes do `AppModule`. O literal `developmen` não mudou.
- `seed/demo.sql` grava cliente, operador, entregador e pedido `1` (`verificationCode` `4821`, status `6`, `storeCode` `2312`). A coluna `password` guarda só o hash bcrypt. Não há `INSERT` em `deliveryqueue`.
- `npm run seed` reaplica esse grafo. Depois de uma linha artificial na fila do pedido `1`, a contagem volta a `0` e `POST /auth/loginDelivery` continua devolvendo o token do entregador `1`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fatia ponta a ponta: MySQL do exemplo, semente e login do entregador** - `350f85d` (feat)
2. **Task 2: Comando npm run seed zera a fila do pedido 1** - `45a21cb` (feat)

## Files Created/Modified

- `compose.yaml` - Serviço `mysql` 8.4.11, porta local, volume `ifarma_mysql` e healthcheck `mysqladmin`
- `.env.example` - Contrato de ambiente da demo, sem senha de root
- `src/main.ts` - Primeiro import `dotenv/config`; `ValidationPipe`, CORS, Swagger e `listen(3000)` permanecem
- `scripts/apply-demo-sql.js` - Aplica `seed/demo.sql` com `mysql2`, retry só de conexão e `assertDatabaseName`
- `seed/demo.sql` - DDL e DML idempotentes dos ids `1`, com o comentário da senha em claro
- `package.json` - Script `seed` = `node -r dotenv/config scripts/apply-demo-sql.js`
- `package-lock.json` - Entrada já presente do self-link `api_ifarma`, preservada junto do manifesto

## Decisions Made

- O hash de `Entrega1!` foi gerado uma vez com o `bcrypt` 5.1.1 do projeto, custo 10, dentro do Node, e gravado no SQL. O aplicador não chama `bcrypt` e não imprime senha nem hash.
- `ENV=demo` deixa `synchronize` desligado. O literal `developmen` em `src/app.module.ts` não foi editado.
- O self-link `"api_ifarma": "file:"` já estava no working tree. O script `seed` foi acrescentado em cima dele, sem `npm install` de pacote novo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Dispatch constraint] Self-link `api_ifarma` preservado no manifesto**
- **Found during:** Task 1 (checagem de dependências) e Task 2 (edição do script)
- **Issue:** `package.json` e `package-lock.json` já estavam sujos com `"api_ifarma": "file:"` antes deste plano. A prova estática compara as chaves com `HEAD` e falha enquanto essa chave não está no commit. O plano também pede para não acrescentar pacote.
- **Fix:** Nenhum pacote foi instalado. A chave que já existia no working tree foi mantida e entrou no commit do script `seed`, para o manifesto e o lock continuarem juntos.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm run seed` imprimiu `reseed-ok`. `dependencies` não ganhou outro nome além dessa chave pré-existente.
- **Committed in:** `45a21cb` (Task 2 commit)

---

**Total deviations:** 1 (manifesto pré-existente preservado)
**Impact on plan:** O script `seed` e o grafo da demo seguem o plano. A chave `file:` não foi introduzida por um `npm install` desta execução.

## Issues Encountered

- O `.env` local já existia e a primeira linha é `//.env`. `docker compose` no diretório do repositório recusa esse arquivo. O arquivo não foi lido para o Git nem sobrescrito. O MySQL subiu com `--project-name api_ifarma` a partir de outro diretório de projeto, e o healthcheck ficou healthy. Quem for rodar `docker compose up` neste checkout precisa corrigir essa primeira linha do `.env` local.
- A expressão da prova estática `new RegExp(dollar + "2b" + ...)` trata `$` como âncora de fim, então não casa um hash bcrypt e não imprime `static-ok`. O hash de 60 caracteres passou em `bcrypt.compareSync`, e o login imprimiu `login-ok`.

## User Setup Required

O `.env` deste checkout não foi alterado. A primeira linha atual (`//.env`) impede o Compose de ler o arquivo. O contrato versionado é `.env.example`.

## Next Phase Readiness

- Pedido `1` existe, status `6`, `verificationCode` `4821`, sem linha em `deliveryqueue`.
- `POST /auth/loginDelivery` autentica `entregador.demo@example.com` e devolve `id` `1`, `name` `Entregador Demo`, `role` `4` e um JWT com `sub` `userDelivery` `1`.
- A fase 2 pode persistir a fila em cima desse grafo. A fase 3 pode copiar o comentário do topo de `seed/demo.sql`.

## Self-Check: PASSED

- FOUND: compose.yaml
- FOUND: .env.example
- FOUND: seed/demo.sql
- FOUND: scripts/apply-demo-sql.js
- FOUND: src/main.ts
- FOUND: 350f85d
- FOUND: 45a21cb

---
*Phase: 01-demo-que-autentica*
*Completed: 2026-10-04*
