---
phase: 01-demo-que-autentica
verified: 2026-10-06T02:12:17Z
status: passed
score: 4/5 must-haves verified
covered_files:
  - .env.example
  - .planning/phases/01-demo-que-autentica/01-01-PLAN.md
  - .planning/phases/01-demo-que-autentica/01-01-SUMMARY.md
  - compose.yaml
  - package-lock.json
  - package.json
  - scripts/apply-demo-sql.js
  - seed/demo.sql
  - src/main.ts

covered_digest: "v2:sha256:0df1bcb63f24c1fad5dfdde938a0898dc521651c63d9361ad28c89d4fd24ff8f"
behavior_unverified: 1
overrides_applied: 0
re_verification:
  previous_status: user_story_invalid
  previous_score: 0/0
  gaps_closed: []
  gaps_remaining: []
  regressions: []
behavior_unverified_items:
  - truth: "Rodar a semente de novo deixa esse mesmo pedido sem fila."
    test: "Inserir uma linha em deliveryqueue para shoppingId 1 e userDeliveryId 1, depois rodar npm run seed com o .env copiado do exemplo."
    expected: "O pedido 1 continua com id 1, verificationCode 4821 e status 6, e COUNT de deliveryqueue desse pedido volta a 0."
    why_human: "O SQL apaga a fila e não insere outra linha, mas isso é transição de estado. Não há spec Jest, e esta verificação não gravou no MySQL."
human_verification:
  - test: "Copiar .env.example para .env, subir o Compose, rodar npm run seed e autenticar o entregador no POST /auth/loginDelivery com entregador.demo@example.com e a senha do comentário da semente."
    expected: "O MySQL escuta só em 127.0.0.1:3306, a API sobe na porta 3000 e o login devolve token, id 1, name Entregador Demo e role 4. O JWT confere com demo-jwt-secret-ifarma, issuer login, audience user e sub userDelivery 1."
    why_human: "Compose e Nest não foram iniciados nesta verificação. O contrato está no código; o serviço externo não foi exercitado."
  - test: "Inserir uma linha em deliveryqueue para o pedido 1 e rodar npm run seed de novo."
    expected: "Os ids 1 permanecem, o verificationCode continua 4821, o status continua 6 e a fila desse pedido fica vazia."
    why_human: "Transição de estado presente no SQL e sem teste automatizado. Presença do DELETE não prova a execução."
  - test: "Conferir se as linhas da demo usam só pessoa fictícia. unverified-prohibition — human review recommended."
    expected: "Nenhum CPF, telefone ou nome real. E-mails em example.com e documentos 00000000000."
    why_human: "Proibição de julgamento, sem teste. Leitura não autoritativa: seed/demo.sql usa Cliente Demo, Operador Demo, Entregador Demo, @example.com e 00000000000."
  - test: "Conferir se o exemplo não aponta para produção. unverified-prohibition — human review recommended."
    expected: "Host 127.0.0.1, JWT de demonstração e MAIL_* locais. O exemplo não se apresenta como produção."
    why_human: "Proibição de julgamento, sem teste. Leitura não autoritativa: .env.example usa 127.0.0.1, ENV=demo, JWT_SECRET=demo-jwt-secret-ifarma e MAIL_HOST=localhost. ifarma-root só está no compose.yaml."
  - test: "Conferir se a coluna password não guarda a senha em claro. unverified-prohibition — human review recommended."
    expected: "O INSERT guarda só o hash bcrypt. A senha em claro fica no comentário."
    why_human: "Proibição de julgamento, sem teste. Leitura não autoritativa: o corpo SQL sem comentários não contém Entrega1!, e bcrypt.compareSync aceita o hash $2b$10$ das duas linhas."
---

# Phase 1: Demo que autentica — Verification Report

**Phase Goal:** As a pessoa que clona o repositório, I want to configurar o MySQL e a API a partir do exemplo e autenticar o entregador no pedido fictício já semeado, so that o login da demo funciona sem segredo real.
**Verified:** 2026-10-06T02:12:17Z
**Status:** human_needed
**Re-verification:** Não. O relatório anterior parou em `user_story_invalid` antes dos must-haves. Esse status não foi reaproveitado. `user-story.validate` agora devolve `valid: true` (papel, capacidade e resultado preenchidos).

## User Flow Coverage

User story: «As a pessoa que clona o repositório, I want to configurar o MySQL e a API a partir do exemplo e autenticar o entregador no pedido fictício já semeado, so that o login da demo funciona sem segredo real.»

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Configurar a partir do exemplo | Copiar `.env.example` para `.env` entrega `DB_*`, `JWT_SECRET`, `ENV=demo` e `MAIL_*` sem export no shell | `.env.example:3-17`; `src/main.ts:1` importa `dotenv/config` antes de `AppModule` | ✓ |
| Subir o MySQL local | `mysql:8.4.11` só em `127.0.0.1:3306`, volume nomeado | `compose.yaml:3`, `compose.yaml:13`, `compose.yaml:15-24` | ✓ |
| Autenticar o entregador no pedido semeado | Semente com loja 2312, entregador e pedido 1; login devolve o entregador 1 | `seed/demo.sql:98-101`; `src/controllers/auth.controller.ts:21-25`; `src/services/auth.service.ts:38-46` | ✓ |
| Outcome | O login da demo funciona sem segredo real | Hash bcrypt confere com a senha do comentário; `.env` está no `.gitignore:45`; o exemplo não tem senha de root | ⚠️ fluxo ao vivo não executado |

## Goal Achievement

### Observable Truths

Must-haves fundidos: quatro critérios do ROADMAP, mais o contrato do Compose que o plano acrescenta (imagem, bind e volume). Verdades do plano que só detalham um critério do roadmap ficaram na evidência, sem duplicar a linha.

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Quem copia o exemplo de ambiente sobe o MySQL e a API, sem segredo real no repositório e sem pacote novo no `package.json`. | ✓ VERIFIED | `.env.example` traz `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_USERNAME=ifarma`, `DB_PASSWORD=ifarma`, `DB_DATABASE=ifarma`, `JWT_SECRET=demo-jwt-secret-ifarma`, `ENV=demo` e `MAIL_*`. `src/main.ts:1` é `import 'dotenv/config'`; não há `dotenv.config(` depois. `src/app.module.ts:47` mantém `developmen`, então `ENV=demo` deixa `synchronize` desligado. `src/modules/auth.module.ts:13` lê `JWT_SECRET` na carga do módulo, depois desse import. `.env` é ignorado; `.env.example` não é. O script `seed` usa `mysql2` e `dotenv`, já presentes. Nenhuma dependência de registry entrou para a demo. |
| 2 | Os dados fictícios versionados incluem uma loja, um operador, um entregador e um pedido com `verificationCode` conhecido. | ✓ VERIFIED | `seed/demo.sql` insere loja `2312`, `operador.demo@example.com`, `entregador.demo@example.com`, `cliente.demo@example.com` e o pedido `1` com `verificationCode` `4821` e status `6` (`WaitingMotoboy`). Não há `INSERT` em `deliveryqueue`. |
| 3 | Rodar a semente de novo deixa esse mesmo pedido sem fila. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `seed/demo.sql:92-102` apaga `deliveryqueue` onde `shoppingId = 1` ou `userDeliveryId = 1`, apaga os ids `1` e reinsere os quatro registros, sem `INSERT` na fila. Não há spec que execute essa transição, e esta verificação não gravou no banco. |
| 4 | A senha do entregador semeado autentica em `POST /auth/loginDelivery`. | ✓ VERIFIED | Os dois hashes são iguais, 60 caracteres, prefixo `$2b$10$`. `bcrypt.compareSync` com a senha do comentário retornou verdadeiro. O corpo SQL sem comentários não contém essa senha. `LoginDelivery` é `@Public()` (`auth.controller.ts:9-25`); `RoleGuard` e `AuthGuard` deixam rota pública passar. `loginDelivery` devolve `id`, `name`, `role` e o token. `createTokenDelivery` (`auth.service.ts:121-131`) assina `sub` `{ userDelivery: String(id) }`, issuer `login`, audience `user`. `IsStrongPassword` aceita a senha da demo (`login.dto.ts:17-24`); `storeCode` é opcional. |
| 5 | `docker compose up` sobe `mysql:8.4.11` escutando só em `127.0.0.1:3306`, com volume nomeado que sobrevive a `docker compose down`. | ✓ VERIFIED | `compose.yaml:3` usa `mysql:8.4.11`. A porta é `127.0.0.1:3306:3306` (`compose.yaml:13`). O volume nomeado `ifarma_mysql` monta `/var/lib/mysql` (`compose.yaml:15-24`). `docker compose down` sem `--volumes` não remove volume nomeado. |

**Score:** 4/5 truths verified (1 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `compose.yaml` | MySQL 8.4.11 só em 127.0.0.1:3306, volume `ifarma_mysql` | ✓ VERIFIED | Imagem, bind, volume, `utf8mb4`, usuário `ifarma`, senha de root só aqui. Sem `docker-entrypoint-initdb.d`. |
| `.env.example` | Contrato `DB_*`, `JWT_SECRET`, `ENV`, `MAIL_*`, `CLIENT_URL` | ✓ VERIFIED | Contém `JWT_SECRET=demo-jwt-secret-ifarma`. Cabeçalho pede cópia para `.env`, sem commit. Não contém `ifarma-root`. |
| `seed/demo.sql` | DDL e DML idempotentes, senha em claro só no comentário | ✓ VERIFIED | Marcador `-- @schema` na linha 7. Comentário lista e-mails, senha, pedido 1 e `4821`. Transação nas linhas 92-102. |
| `scripts/apply-demo-sql.js` | Aplica a semente com `mysql2`, retry e `CREATE DATABASE` | ✓ VERIFIED | `assertDatabaseName` (`^[A-Za-z0-9_]+$`), `connect` com 30 tentativas só em erro de conexão, `runPreamble`, leitura UTF-8 de `seed/demo.sql`. |
| `src/main.ts` | `dotenv/config` antes do `AppModule` | ✓ VERIFIED | Primeira linha é o import de `dotenv/config`. `ValidationPipe`, CORS, Swagger e `listen(3000)` permanecem. |
| `package.json` | Script `seed` com preload do dotenv | ✓ VERIFIED | `scripts.seed` é `node -r dotenv/config scripts/apply-demo-sql.js` (`package.json:21`). Sem `engines` e sem `test:delivery`. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `src/main.ts` | `src/app.module.ts` | Primeiro import `dotenv/config`, antes do `AppModule`, para TypeORM e JWT lerem `DB_*` e `JWT_SECRET` | WIRED | `src/main.ts:1` precede o import do módulo na linha 4. `app.module.ts:31-47` e `auth.module.ts:13` leem `process.env` na avaliação do módulo. |
| `package.json` | `scripts/apply-demo-sql.js` | `npm run seed` executa `node -r dotenv/config scripts/apply-demo-sql.js` | WIRED | `package.json:21` aponta para o aplicador. |
| `scripts/apply-demo-sql.js` | `seed/demo.sql` | Lê `seed/demo.sql` em UTF-8 e manda o miolo com `query` e `multipleStatements` | WIRED | `apply-demo-sql.js:111-112` liga `multipleStatements`. Linha 166 lê o arquivo. Linha 182 executa o miolo. O preâmbulo separa em `-- @schema` (linhas 168-180). |
| `seed/demo.sql` | `src/repositories/userDelivery.repository.ts` | O hash bcrypt da coluna `password` é o que `loginDelivery` compara. A rota não foi alterada. | WIRED | `seed/demo.sql:100` grava o hash de `entregador.demo@example.com`. `userDelivery.repository.ts:40-47` busca por e-mail e chama `bcrypt.compare`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `seed/demo.sql` | linhas dos ids 1 | SQL versionado aplicado por `mysql2` | Sim, o script executa o arquivo; não há retorno estático | ✓ FLOWING |
| `POST /auth/loginDelivery` | `id`, `name`, `role`, `token` | `UserDeliveryRepository.login` → entidade semeada; JWT com `JWT_SECRET` | Sim, o handler devolve o resultado da consulta e o token assinado, não um JSON fixo | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| O hash da semente é a senha da demo | `bcrypt.compareSync` sobre os dois hashes de `seed/demo.sql` | `hashCount` 2, hashes iguais, comprimento 60, `compare` true, senha ausente do SQL sem comentários | ✓ PASS |
| User story do roadmap | `gsd-tools query user-story.validate` | `valid: true`; papel, capacidade e resultado preenchidos | ✓ PASS |
| Login HTTP e Compose no ar | não executado | Servidor e container não foram iniciados | ? SKIP |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| nenhum | — | O plano e o resumo não declaram `probe-*.sh` | SKIPPED |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| ENV-02 | `01-01-PLAN.md` | Quem clona configura MySQL e a API a partir de um exemplo, sem segredo real e sem pacote novo no `package.json` | ✓ SATISFIED | `.env.example`, `compose.yaml`, preload em `src/main.ts`. Diff de dependências contra `a9d2ace` não acrescenta pacote de registry. |
| SEED-01 | `01-01-PLAN.md` | A demo traz, em dados fictícios versionados, uma loja, um operador, um entregador e um pedido com `verificationCode` conhecido | ✓ SATISFIED | `seed/demo.sql` grava loja `2312`, operador, entregador, cliente e pedido `1` / `4821`. |
| SEED-02 | `01-01-PLAN.md` | A senha do entregador semeado autentica em `POST /auth/loginDelivery` | ✓ SATISFIED | Hash confere; a rota pública devolve `id`, `name`, `role` e o JWT de `userDelivery`. |

Os três IDs do frontmatter do plano estão em `.planning/REQUIREMENTS.md`, mapeados à fase 1. Nenhum ID da fase 1 ficou órfão. ENV-01, DLVY-* e TEST-01 pertencem às fases 2 e 3.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `package.json` | 32 | `"api_ifarma": "file:"` entrou no commit da fase; em `a9d2ace` essa chave não estava em `dependencies` | ℹ️ Info | Self-link do próprio pacote. A semente não importa essa entrada. Não é pacote de registry. |
| `scripts/apply-demo-sql.js` | — | Sem `TBD`, `FIXME`, `XXX`, `TODO` ou `console.log` | — | Nenhum marcador de dívida. |
| `seed/demo.sql`, `compose.yaml`, `.env.example`, `src/main.ts` | — | Sem `TBD` / `FIXME` / `XXX` | — | Nenhum marcador de dívida. |

### Human Verification Required

### 1. Login da demo no ar

**Test:** Copiar `.env.example` para `.env`, subir o Compose, rodar `npm run seed` e autenticar o entregador.
**Expected:** MySQL só em `127.0.0.1:3306`. `POST /auth/loginDelivery` devolve token, id 1, name Entregador Demo e role 4, com JWT válido no segredo de demonstração.
**Why human:** Compose e Nest não foram iniciados. O SUMMARY afirma `login-ok`; isso não foi usado como evidência.

### 2. Semente de novo zera a fila

**Test:** Inserir uma linha em `deliveryqueue` para o pedido 1 e rodar `npm run seed` outra vez.
**Expected:** Pedido 1 permanece, `verificationCode` 4821, status 6, fila desse pedido em 0.
**Why human:** Transição de estado. O `DELETE` está no SQL e nenhum teste a executa.

### 3. Proibição: pessoa fictícia

**Test:** Revisar nomes, e-mails, CPF e telefone da demo. unverified-prohibition — human review recommended.
**Expected:** Só valores fictícios (`example.com`, `00000000000`, nomes Demo).
**Why human:** Julgamento, sem teste. A leitura do arquivo já aponta só dados fictícios; a confirmação humana não é silenciosa.

### 4. Proibição: exemplo não é produção

**Test:** Revisar `.env.example` e o Compose. unverified-prohibition — human review recommended.
**Expected:** Banco local e JWT de demonstração, sem host de produção.
**Why human:** Julgamento, sem teste. A leitura já mostra `127.0.0.1`, `ENV=demo` e `MAIL_HOST=localhost`.

### 5. Proibição: senha só como hash

**Test:** Revisar a coluna `password`. unverified-prohibition — human review recommended.
**Expected:** INSERT só com hash bcrypt. Senha em claro restrita ao comentário.
**Why human:** Julgamento, sem teste. `bcrypt.compareSync` passou e o corpo SQL não contém a senha em claro.

### Gaps Summary

Nenhum must-have está ausente ou desligado. O que falta é execução humana: o login ao vivo e a reexecução da semente com uma fila já gravada. Três proibições de julgamento ficam marcadas para revisão humana, com leitura não autoritativa já alinhada ao arquivo.

A fase 2 cobre a fila de entrega e a fase 3 o README e o Jest. Nenhuma delas descreve “rodar a semente de novo zera a fila”, então esse item não foi adiado.

---

_Verified: 2026-10-06T02:12:17Z_
_Verifier: Claude (gsd-verifier)_
_Depth: standard_
