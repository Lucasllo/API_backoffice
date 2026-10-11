---
phase: 03-percurso-e-prova
verified: 2026-10-11T22:35:25Z
status: passed
score: 6/6 must-haves verified
covered_files:
  - .planning/phases/03-percurso-e-prova/03-01-PLAN.md
  - .planning/phases/03-percurso-e-prova/03-01-SUMMARY.md
  - .planning/phases/03-percurso-e-prova/03-02-PLAN.md
  - .planning/phases/03-percurso-e-prova/03-02-SUMMARY.md
  - README.md
  - package.json
  - scripts/apply-demo-sql.js
  - test/delivery-path.spec.ts
  - test/jest-delivery.json
covered_digest: "v1:sha256:4945d838901824375eb906bbbdbd058ae05e75b99d8601563b5cfdb46e724b1f"
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 8
  total: 8
  not_honored: []
behavior_unverified_items:
  - truth: "Quem clona o repositório segue o README em português e confirma a entrega do pedido semeado."
    test: "Com o MySQL da demo aceitando conexão em 127.0.0.1:3306, seguir o README e colar os quatro blocos curl.exe no PowerShell."
    expected: "O login devolve HTTP 201 e um JSON com token. Enfileirar e o código 4821 devolvem HTTP 201 com corpo vazio. O código 0000 devolve HTTP 400 e Dados invalidos. A mesma entrega fica concluída."
    why_human: "O README e o spec descrevem esse percurso. Nesta verificação o MySQL recusou a conexão e nenhum bloco foi colado."
  - truth: "O login mostra o token. Enfileirar e o código 4821 mostram sucesso sem corpo. O código 0000 mostra 400 e Dados invalidos. O texto diz que a fila ficou em espera e depois concluída."
    test: "Colar os quatro blocos do README, com o token vivo no lugar de TOKEN."
    expected: "HTTP 201 com token no login. HTTP 201 e corpo vazio ao enfileirar, com a fila em espera. HTTP 400 e Dados invalidos no código 0000. HTTP 201 e corpo vazio no código 4821, com a mesma entrega concluída."
    why_human: "O texto do README afirma esses corpos. create e validateDelivery não retornam valor, e o spec espera res.text vazio e message Dados invalidos. A resposta no terminal não foi observada."
  - truth: "npm run test:delivery prova o login do entregador, a fila persistida, o código certo concluindo a mesma linha e o pedido, e o código errado sem concluir."
    test: "Subir o MySQL do exemplo e rodar npm run test:delivery na raiz."
    expected: "Exit 0. Um it passa: login 201 com id 1 e role 4, fila com shoppingId 1, userDeliveryId 1 e status 1, pedido status 6 e verificationCode 4821, código 0000 em 400 sem mudar essa linha, código 4821 em 201 com a mesma linha em status 2 e o pedido em status 4."
    why_human: "O it em test/delivery-path.spec.ts afirma essa ordem e lê a linha com Repository.find. A execução desta verificação parou em beforeAll com ECONNREFUSED 127.0.0.1:3306, antes de app.init."
  - truth: "O processo do comando encerra depois de app.close(). O flag de saída forçada da CLI do Jest só entra se essa espera não devolver o prompt."
    test: "Com o MySQL no ar, rodar npm run test:delivery e esperar o prompt."
    expected: "O processo volta ao prompt com exit 0 depois do afterAll. O script test:delivery continua sem --forceExit."
    why_human: "afterAll espera app.close() e o script não tem --forceExit. O processo desta verificação encerrou com exit 1, mas a semente falhou antes de criar o app, então o close do pool do TypeORM não rodou."
human_verification:
  - test: "Com o MySQL da demo em 127.0.0.1:3306, seguir o README e colar os quatro blocos curl.exe no PowerShell, colando o token vivo."
    expected: "HTTP 201 com token, HTTP 201 com corpo vazio e fila em espera, HTTP 400 Dados invalidos sem concluir, HTTP 201 com corpo vazio e a mesma entrega concluída."
    why_human: "Transição do pedido semeado. O MySQL recusou a conexão e os blocos não foram colados."
  - test: "No mesmo MySQL, rodar npm run test:delivery na raiz e esperar o prompt."
    expected: "Exit 0, um teste passado em test/delivery-path.spec.ts, a mesma linha da fila indo de status 1 para status 2 e o pedido de status 6 para status 4. O script segue sem --forceExit."
    why_human: "A execução desta verificação falhou na semente (ECONNREFUSED) antes das asserções e antes de app.close()."
  - test: "Conferir que npm run test:delivery não fica verde se o spec não roda, e que o README não pede segredo real, JWT colado nem outro nome de banco."
    expected: "O script não tem passWithNoTests. O README traz Entrega1! só no quadro, sem JWT_SECRET, sem token eyJ e sem DB_DATABASE=."
    why_human: "As três proibições dos planos continuam unresolved, sem verificação test no frontmatter. A leitura do script e do README mostra esses trechos ausentes, e o comando desta verificação saiu 1 quando a semente falhou. unverified-prohibition — revisão humana recomendada."
---

# Phase 3: Percurso e prova Verification Report

**Phase Goal:** Quem segue o README em português confirma a entrega do pedido semeado, e um comando Jest prova só esse caminho.
**Verified:** 2026-10-11T22:35:25Z
**Status:** human_needed
**Re-verification:** Não — verificação inicial

## User Flow Coverage

A linha **Goal** do roadmap permanece em português. O validador de user story devolve `valid: false` para essa frase: ela não começa com `As a`, não tem `I want to` e não tem `so that`. O objetivo de `03-01-PLAN.md` e de `03-02-PLAN.md` parte o mesmo goal em três slots. Essa frase, sem o markdown, passa no validador.

User story usada no fluxo: «As a pessoa que segue o README em português, I want to confirmar a entrega do pedido semeado, so that um comando Jest prova só esse caminho.»

| Step | Expected | Evidence | Status |
|------|----------|----------|--------|
| Abrir o README | Texto em português, cópia de `.env.example` sem editar, MySQL `mysql:8.4.11`, `npm run seed` e `npm run start:dev` na porta 3000 | `README.md` trata o leitor por você. A abertura pede Node.js, npm, `npm install`, a cópia sem editar e a imagem do Compose. Não há badge CircleCI, Coveralls nem `nestjs/nest`. | ✓ presente |
| Ver o quadro | `entregador.demo@example.com`, `Entrega1!`, pedido 1, código `4821` | Quadro em `README.md`. Os mesmos valores estão no comentário e no `INSERT` de `seed/demo.sql` (`role` `'4'`, `verificationCode` `'4821'`, `status` 6). | ✓ presente |
| Login | HTTP 201 e JSON com `token` | Bloco `curl.exe` de `POST /auth/loginDelivery`. `AuthController` é `@Public()` e chama `authService.loginDelivery`, que devolve `id`, `role` e `token`. | ⚠️ presente, resposta não observada |
| Enfileirar | HTTP 201, corpo vazio, fila em espera | Bloco `POST /deliveryqueue/1` com `Authorization: Bearer`. `DeliveryqueueService.create` grava `DeliveryStatus.Waiting` e não retorna a entidade. | ⚠️ presente, resposta não observada |
| Código 0000 | HTTP 400 e `Dados invalidos`, sem concluir | Bloco `validateDelivery/1/0000`. `validateDelivery` lança `BadRequestException('Dados invalidos')` quando `verificationCode` diverge, antes do `save`. | ⚠️ presente, resposta não observada |
| Código 4821 | HTTP 201, corpo vazio, mesma entrega concluída | Bloco `validateDelivery/1/4821`. No acerto, o service grava `DeliveryStatus.Finished` e só então `updateStatus(solicitacaoCompraStatus.Concluded)`. | ⚠️ presente, resposta não observada |
| Outcome | `npm run test:delivery` prova só esse caminho | O script cita `test/delivery-path.spec.ts` com `--runTestsByPath` e `--runInBand`. `npm test` e `npm run test:e2e` não listam esse arquivo. O `it` percorre os quatro POST e relê a linha. A execução parou na semente. | ⚠️ presente, caminho de sucesso não exercitado |

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | ------- | ---------- | -------------- |
| 1 | Quem clona o repositório segue o README em português e confirma a entrega do pedido semeado. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `README.md` substitui o starter e leva até os quatro blocos, com `npm run seed` de novo entre `npm run start:dev` e o primeiro `curl.exe`. A confirmação é transição de estado. Nesta verificação o MySQL em `127.0.0.1:3306` recusou a conexão e os blocos não foram colados. |
| 2 | O login mostra o token. Enfileirar e o código 4821 mostram sucesso sem corpo. O código 0000 mostra 400 e Dados invalidos. O texto diz que a fila ficou em espera e depois concluída. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | O README afirma HTTP 201 com `token`, corpo vazio, `Dados invalidos`, fila em espera e entrega concluída, nessa ordem de rotas. `create` e `validateDelivery` não retornam valor. O spec espera `queued.text` e `confirmed.text` iguais a `''` e `wrongCode.body.message` igual a `Dados invalidos`. Nenhuma dessas respostas foi recebida aqui. |
| 3 | `npm run seed` espera o MySQL do Compose ficar aceitável, até 130 segundos, inclusive quando o acesso é negado de forma transitória, e o README não pede sleep. | ✓ VERIFIED | `scripts/apply-demo-sql.js` declara `MAX_ATTEMPTS` 130. O `for` usa `attempt <= MAX_ATTEMPTS` e o intervalo é `setTimeout` de 1000 ms quando `attempt < MAX_ATTEMPTS`. `isRetryable` aceita `ECONNREFUSED` e também errno `1045` e `ER_ACCESS_DENIED_ERROR`. O errno `1044` e `ER_DBACCESS_DENIED_ERROR` ficam no `CREATE DATABASE` de `runPreamble`. `compose.yaml` continua com `mysql:8.4.11` e `start_period: 30s`. O README não pede sleep. `npm run test:delivery` desta verificação ficou 136 s em `ECONNREFUSED 127.0.0.1:3306` e só então falhou a semente. |
| 4 | `npm run test:delivery` prova o login do entregador, a fila persistida, o código certo concluindo a mesma linha e o pedido, e o código errado sem concluir. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | `test/delivery-path.spec.ts` tem um `it`: login 201, `id` 1, `role` `'4'`, `POST /deliveryqueue/1`, `find` com `shoppingId` 1, status 1, pedido status 6 e `verificationCode` `4821`, depois `0000` em 400 com a mesma linha intacta, depois `4821` em 201 com status 2 e pedido status 4. `npm run test:delivery` saiu 1: `A semente da demo falhou` em `beforeAll`, com `ECONNREFUSED`. As asserções HTTP não rodaram. |
| 5 | O script `test:delivery` cita só `test/delivery-path.spec.ts`. `npm test` e `npm run test:e2e` permanecem e não coletam esse arquivo. | ✓ VERIFIED | `package.json` mantém `"test": "jest"` e `"test:e2e": "jest --config ./test/jest-e2e.json"`. `test:delivery` é `node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-delivery.json --runTestsByPath ./test/delivery-path.spec.ts --runInBand`. Não há `passWithNoTests` nem `--forceExit`. O bloco `jest` continua com `rootDir` `src`. `npm test -- --listTests` lista só specs em `src/tests`. `npm run test:e2e -- --listTests` lista só `test/app.e2e-spec.ts`. `npm run test:delivery -- --listTests` lista só `test/delivery-path.spec.ts`. |
| 6 | O processo do comando encerra depois de `app.close()`. O flag de saída forçada da CLI do Jest só entra se essa espera não devolver o prompt. | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | O spec não chama `app.listen`. O `afterAll` espera `app.close()` quando `app` existe. O script não tem `--forceExit`. O Jest desta verificação devolveu o prompt com exit 1, porque `spawnSync` da semente falhou antes de `Test.createTestingModule`. O close depois de `app.init` não ocorreu. |

**Score:** 2/6 truths verified (4 present, behavior-unverified)

`03-01-SUMMARY.md` afirma que `npm run test:delivery` passou com 1 teste e exit 0. `03-02-SUMMARY.md` afirma `seed-wait-ok` e `readme-ok`. Esses marcadores não substituem a execução desta verificação. A execução atual do comando saiu 1 por MySQL ausente.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | ----------- | ------ | ------- |
| `package.json` | Script `test:delivery` com dotenv, config própria, `runTestsByPath` e `runInBand`, ao lado de `test:e2e` | ✓ VERIFIED | Linha do script ao lado de `test:e2e`. `seed` continua `node -r dotenv/config scripts/apply-demo-sql.js`. |
| `test/jest-delivery.json` | `rootDir` `..`, timeout 180000, regex só de `delivery-path.spec.ts` | ✓ VERIFIED | `rootDir` `..`, `testTimeout` 180000, `testRegex` `delivery-path\\.spec\\.ts$`, `moduleNameMapper` `^src/(.*)$` para `<rootDir>/src/$1`. `test/jest-e2e.json` segue com `rootDir` `.` e `testRegex` `.e2e-spec.ts$`. |
| `test/delivery-path.spec.ts` | Um `it` no processo: semente, quatro POST na ordem do README e leitura da mesma linha | ✓ VERIFIED | `describe('delivery path')`. `spawnSync` de `scripts/apply-demo-sql.js` com `process.execPath`, `env` e `cwd` na raiz. Recusa `DB_HOST`, `DB_DATABASE` ou `ENV` fora da demo local. Importa `AppModule`, usa `ValidationPipe` sem opções e `app.init`. Lê `DeliveryQueueEntity` e `ShoppingEntity` com `where`. Não há `console.log`, `it.skip` nem segundo `POST /deliveryqueue/1`. |
| `README.md` | Percurso em português com quadro do entregador e quatro blocos `curl.exe` | ✓ VERIFIED | Quatro ocorrências de `curl.exe`, na ordem login, fila, `0000`, `4821`. JSON do login entre aspas simples. `npm run test:delivery` fica depois do último bloco. |
| `scripts/apply-demo-sql.js` | `MAX_ATTEMPTS` 130 e errno 1045 como retry, sem misturar com o `CREATE DATABASE` | ✓ VERIFIED | Constante 130 nas duas comparações do `connect`. `isRetryable` não contém `1044` nem `ER_DBACCESS_DENIED_ERROR`. |

**Artifacts:** 5/5 verified

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| `package.json` | `test/jest-delivery.json` | `node -r dotenv/config` e `--config ./test/jest-delivery.json` | ✓ WIRED | O script `test:delivery` contém `jest-delivery.json`. |
| `package.json` | `test/delivery-path.spec.ts` | `--runTestsByPath ./test/delivery-path.spec.ts` e `--runInBand` | ✓ WIRED | O `--listTests` desse comando imprime só esse arquivo. |
| `test/delivery-path.spec.ts` | `scripts/apply-demo-sql.js` | `spawnSync` do mesmo arquivo que `npm run seed` usa | ✓ WIRED | Argumento `scripts/apply-demo-sql.js`. Não há `require` desse script. O `status` diferente de 0 lança erro. Nesta execução o status veio de `ECONNREFUSED`. |
| `test/delivery-path.spec.ts` | `src/app.module.ts` | `Test.createTestingModule` importa `AppModule`, `app.init`, `app.close` no `afterAll` | ✓ WIRED | Import de `../src/app.module`. Não há `app.listen`. O `afterAll` não chegou a rodar nesta execução. |
| `test/delivery-path.spec.ts` | `src/entities/deliveryQueue.entity.ts` | `app.get(DataSource)` e `Repository.find` com `shoppingId` 1 | ✓ WIRED | `getRepository(DeliveryQueueEntity)` e `find({ where: { shoppingId: 1 } })`. A query não chegou a executar. |
| `README.md` | `scripts/apply-demo-sql.js` | `npm run seed` antes dos quatro blocos e também na subida | ✓ WIRED | O script `seed` aponta para `scripts/apply-demo-sql.js`. O README pede `npm run seed` na abertura e de novo imediatamente antes dos blocos. |
| `README.md` | `src/controllers/auth.controller.ts` | Bloco `POST /auth/loginDelivery` com o e-mail e a senha do quadro | ✓ WIRED | `@Post('loginDelivery')` no controller público. |
| `README.md` | `src/controllers/deliveryqueue.controller.ts` | Três blocos com Bearer: fila, código `0000` e código `4821` | ✓ WIRED | `@Post(':idShopping')` e `@Post('validateDelivery/:idShopping/:codeShopping')`. |
| `scripts/apply-demo-sql.js` | `compose.yaml` | `MAX_ATTEMPTS` 130 cobre a janela do healthcheck, que não foi editado | ✓ WIRED | `start_period: 30s` e imagem `mysql:8.4.11` permanecem. O laço de 130 tentativas de 1 s foi o que segurou o Jest por 136 s. |

**Wiring:** 9/9 connections verified

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| `test/delivery-path.spec.ts` | `token`, linha da fila, `status` do pedido | `POST /auth/loginDelivery` e `Repository.find` / `findOne` no `DataSource` do `AppModule` | A query está no spec. Esta execução não chegou nela. | ✓ FLOWING |
| `README.md` | E-mail, senha, pedido 1, código `4821` | Comentário e `INSERT` de `seed/demo.sql` | Sim, como texto do percurso | ✓ FLOWING |
| `scripts/apply-demo-sql.js` | Conexão MySQL | `mysql.createConnection` com `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | A tentativa é real. `127.0.0.1:3306` recusou. | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| `npm test` não coleta o spec da entrega | `npm test -- --listTests` | 20 arquivos em `src/tests`. Nenhum `delivery-path.spec.ts`. | ✓ PASS |
| `npm run test:e2e` não coleta o spec da entrega | `npm run test:e2e -- --listTests` | Só `test/app.e2e-spec.ts`. | ✓ PASS |
| `test:delivery` lista só o spec do caminho | `npm run test:delivery -- --listTests` | A lista do Jest é `test/delivery-path.spec.ts`. O banner do npm também repete o caminho porque o script já cita `--runTestsByPath`. Não aparecem `app.e2e-spec.ts` nem `src/tests`. | ✓ PASS |
| Login, fila, código `0000` e código `4821` | `npm run test:delivery` | Exit 1 depois de 136 s. `ECONNREFUSED 127.0.0.1:3306`. `A semente da demo falhou` em `test/delivery-path.spec.ts:33`. Suites: 1 failed. | ? SKIP |
| Espera da semente | O mesmo `npm run test:delivery` | O processo só falhou a semente depois de ~136 s de `ECONNREFUSED`, dentro da janela de 130 tentativas de 1 s. | ✓ PASS |

O MySQL não estava aceitando conexão. Esta verificação não subiu `docker compose`.

### Probe Execution

Não há `scripts/*/tests/probe-*.sh` nesta fase. Os critérios dos planos são scripts `node -e` dentro de `03-01-PLAN.md` e `03-02-PLAN.md`.

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| — | — | Nenhum probe em arquivo | — |

### Requirements Coverage

Os IDs do frontmatter estão em `.planning/REQUIREMENTS.md` e os dois mapeiam para a Phase 3. `03-01-PLAN.md` declara `TEST-01`. `03-02-PLAN.md` declara `ENV-01`. Nenhum requisito da Phase 3 ficou sem plano. `ENV-02`, `SEED-01`, `SEED-02` e `DLVY-01` a `DLVY-04` pertencem às fases 1 e 2. `DLVY-05` a `DLVY-08` são v2.

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| ENV-01 | `03-02-PLAN.md` | Quem clona segue um README em português e sobe a API até confirmar a entrega do pedido semeado | ? NEEDS HUMAN | O README em português tem o quadro e os quatro blocos. A confirmação ao vivo não foi feita. |
| TEST-01 | `03-01-PLAN.md` | Um comando Jest prova só esse caminho: login, fila persistida, código certo conclui a mesma linha e o pedido, código errado não conclui | ? NEEDS HUMAN | O comando existe e os outros Jest não coletam o arquivo. A prova HTTP falhou na semente porque o MySQL recusou a conexão. |

### Test Quality Audit

| Test File | Linked Req | Active | Skipped | Circular | Assertion Level | Verdict |
|-----------|-----------|--------|---------|----------|-----------------|---------|
| `test/delivery-path.spec.ts` | TEST-01 | 1 `it` | 0 | 0 | Behavioral | Asserções de status HTTP, corpo e a mesma linha no banco. Esta execução não chegou nelas. |

**Disabled tests on requirements:** 0
**Circular patterns detected:** 0
**Insufficient assertions:** 0

O spec não gera o valor esperado rodando o sistema e gravando fixture. O código `4821` e os status 1, 2, 4 e 6 vêm do seed e dos enums (`DeliveryStatus.Waiting` = 1, `Finished` = 2, `solicitacaoCompraStatus.Concluded` = 4, status 6 no `INSERT` do pedido).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| `README.md` | 47 e blocos `curl.exe` | `-w` com `` `n `` dentro de aspas duplas, e o texto diz que os blocos valem no Git Bash | ℹ️ Info | No PowerShell, `` `n `` é quebra de linha. No Git Bash, crase dentro de aspas duplas é substituição de comando. O critério do plano pedia que o texto citasse os dois shells, e o texto cita. A colagem no Git Bash não foi executada. |
| `test/delivery-path.spec.ts` | — | `TBD`, `FIXME`, `XXX`, `TODO`, `console.log`, `it.skip` | — | Nenhum. |
| `scripts/apply-demo-sql.js` | — | `TBD`, `FIXME`, `XXX` | — | Nenhum. `console.error` permanece em `report`, como o plano pediu. |

### Decision Coverage

All trackable CONTEXT.md decisions are honored by shipped artifacts.

8/8 decisões de `03-CONTEXT.md` (`D-01` a `D-08`) aparecem nos artefatos da fase. O gate não altera o status.

### Human Verification Required

Quatro verdades estão no código e ligadas. O caminho de sucesso não rodou porque `127.0.0.1:3306` recusou a conexão. As proibições dos planos continuam `unresolved`. O parecer sobre elas é leitura de arquivo, mais o exit 1 desta execução. **unverified-prohibition — revisão humana recomendada.**

### 1. Percurso do README

**Test:** Com o MySQL da demo no ar, seguir o README e colar os quatro blocos `curl.exe` no PowerShell, usando o token da resposta do login.
**Expected:** HTTP 201 com `token`. HTTP 201 e corpo vazio, com a fila em espera. HTTP 400 e `Dados invalidos` no código `0000`. HTTP 201 e corpo vazio no código `4821`, com a mesma entrega concluída.
**Why human:** A confirmação é o que a pessoa vê no terminal. O spec descreve o mesmo contrato, e esta verificação não recebeu essas respostas.

### 2. Comando que prova o caminho

**Test:** Rodar `npm run test:delivery` na raiz e esperar o prompt.
**Expected:** Exit 0. O `it` `login, fila, codigo 0000 e codigo 4821` passa. A mesma linha passa de status 1 para status 2 e o pedido de status 6 para status 4. O script continua sem `--forceExit`.
**Why human:** `app.close()` e as asserções do banco só rodam depois da semente. A semente falhou com `ECONNREFUSED` antes de `app.init`.

### 3. Proibições ainda unresolved

**Test:** Olhar o script `test:delivery` e o README.
**Expected:** Sem `passWithNoTests`. Sem pedido para versionar o `.env`, sem `JWT_SECRET`, sem token `eyJ` e sem atribuir outro `DB_DATABASE`. A senha `Entrega1!` fica no quadro.
**Why human:** `03-01-PLAN.md` e `03-02-PLAN.md` deixam as proibições `unresolved`, sem `verification: test`. O comando desta verificação saiu 1 quando o caminho não concluiu. **unverified-prohibition — revisão humana recomendada.**

### Gaps Summary

Não há artefato ausente, stub nem elo quebrado. O README em português descreve a subida e os quatro blocos. `npm run test:delivery` cita só `test/delivery-path.spec.ts`. `npm test` e `npm run test:e2e` não coletam esse arquivo. A semente espera até 130 segundos e trata acesso negado transitório no `isRetryable`.

O que falta é o caminho de sucesso com o MySQL aceitando conexão. `npm run test:delivery` foi executado nesta verificação e saiu 1: a semente repetiu `ECONNREFUSED 127.0.0.1:3306` por cerca de 136 segundos e o `it` não chegou nos POST. Por isso as quatro verdades de confirmação, prova HTTP e encerramento depois de `app.close()` ficam presentes e sem comportamento exercitado. O status é `human_needed`, com score 2/6.

A premissa de concorrência de ENV-01 (dois `npm run seed` ou dois percursos ao mesmo tempo) continua sem garantia no plano e não entra como lacuna. Não há fase posterior neste roadmap para adiar esses itens.

---

_Verified: 2026-10-11T22:35:25Z_
_Verifier: Claude (gsd-verifier)_
