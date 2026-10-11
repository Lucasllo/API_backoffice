---
phase: 02-entrega-confirmada
plan: 01
subsystem: api
tags: [nestjs, typeorm, mysql, deliveryqueue, jwt]

requires:
  - phase: 01-demo-que-autentica
    provides: Pedido 1 sem fila, verificationCode 4821, entregador que autentica e npm run seed
provides:
  - DeliveryqueueService.create espera o INSERT Waiting
  - Segundo POST /deliveryqueue/:idShopping responde Shopping já usado
  - UNIQUE KEY UQ_deliveryqueue_shoppingId no seed da demo
  - validateDelivery grava Finished na linha carregada e conclui o pedido
affects: [03-percurso-e-prova]

actuals:
  tokens: 1134
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "O save da fila nova é aguardado no ramo vazio de create"
    - "ER_DUP_ENTRY e errno 1062, também em driverError, viram Shopping já usado"
    - "validateDelivery atualiza a instância de findByShopping e só então chama updateStatus"
    - "O UNIQUE de shoppingId nasce em seed/demo.sql, no CREATE e no PREPARE depois do COMMIT"

key-files:
  created: []
  modified:
    - src/services/deliveryqueue.service.ts
    - seed/demo.sql

key-decisions:
  - "O INSERT Waiting é aguardado antes do handler resolver."
  - "A chave única de shoppingId fica no SQL versionado, sem unique na entidade e sem alterar o literal developmen."
  - "A confirmação grava DeliveryStatus.Finished na linha já carregada e só então marca o pedido como Concluded."

patterns-established:
  - "Duplicata MySQL no create da fila usa a mesma mensagem do ramo em que a lista já tem linha."
  - "Código divergente, pedido ausente e fila que não tem exatamente uma linha lançam Dados invalidos antes de qualquer save."

requirements-completed: [DLVY-01, DLVY-02, DLVY-03, DLVY-04]

coverage:
  - id: D1
    description: "O entregador autenticado envia POST /deliveryqueue/1 e a fila do pedido 1 fica com status Waiting, userDeliveryId 1, e o pedido permanece com verificationCode 4821 e status 6."
    requirement: DLVY-01
    verification:
      - kind: e2e
        ref: "nest start, POST /auth/loginDelivery e POST /deliveryqueue/1 imprimiram enqueue-ok"
        status: pass
    human_judgment: false
  - id: D2
    description: "O segundo POST /deliveryqueue/1 responde HTTP 400 com Shopping já usado, a mesma linha permanece, e npm run seed duas vezes deixa o índice UQ_deliveryqueue_shoppingId com a fila do pedido 1 vazia."
    requirement: DLVY-02
    verification:
      - kind: e2e
        ref: "duas execuções de npm run seed e o segundo POST /deliveryqueue/1 imprimiram dup-ok"
        status: pass
    human_judgment: false
  - id: D3
    description: "POST /deliveryqueue/validateDelivery/1/4821 atualiza a mesma linha para DeliveryStatus.Finished e o pedido para solicitacaoCompraStatus.Concluded."
    requirement: DLVY-03
    verification:
      - kind: e2e
        ref: "POST /deliveryqueue/validateDelivery/1/4821 depois do enfileiramento imprimiu confirm-ok com status 2 na fila e status 4 no pedido"
        status: pass
    human_judgment: false
  - id: D4
    description: "POST /deliveryqueue/validateDelivery/1/0000 responde Dados invalidos e não altera a fila nem o pedido."
    requirement: DLVY-04
    verification:
      - kind: e2e
        ref: "POST /deliveryqueue/validateDelivery/1/0000 antes do código 4821 imprimiu confirm-ok com a fila ainda em status 1 e o pedido em status 6"
        status: pass
    human_judgment: false

plan_head_before: 49d77c3024a766958b07c35245f050bd1b4dc07c
plan_head_after: fb62158bd5e86cc6369efb88394e8f3ff6c2c8a1

duration: 13min
completed: 2026-10-11
status: complete
---

# Phase 2 Plan 01: Entrega confirmada Summary

**O entregador autenticado grava o pedido 1 como Waiting, o segundo POST responde Shopping já usado, e o código 4821 conclui essa mesma linha**

## Performance

- **Duration:** 13 min
- **Started:** 2026-10-11T18:02:57Z
- **Completed:** 2026-10-11T18:15:44Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- `DeliveryqueueService.create` espera `deliveryQueueRepository.save` com `DeliveryStatus.Waiting`. Depois do login do entregador, `POST /deliveryqueue/1` deixa uma linha com `shoppingId` 1, `userDeliveryId` 1 e status 1. O pedido continua com `verificationCode` 4821 e status 6.
- O mesmo método traduz `ER_DUP_ENTRY` e errno 1062, lidos também de `driverError`, para `BadRequestException` com a mensagem `Shopping já usado`. Outro erro segue sem `error.message`.
- `seed/demo.sql` declara `UNIQUE KEY UQ_deliveryqueue_shoppingId` no `CREATE TABLE` de `deliveryqueue` e, depois do `COMMIT`, o `PREPARE stmt_uq_deliveryqueue` acrescenta a chave se ela ainda não existir. Duas execuções de `npm run seed` saem 0, zeram a fila do pedido 1 e deixam o índice com `non_unique` 0.
- `validateDelivery` compara o código em memória. Pedido nulo, código diferente de `verificationCode` ou fila que não tem exatamente uma linha lançam `Dados invalidos` antes de gravar. No acerto, a linha carregada por `findByShopping` vai para `DeliveryStatus.Finished` e só então o pedido vai para `solicitacaoCompraStatus.Concluded`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fatia ponta a ponta: o entregador autentica e enfileira o pedido 1 como Waiting** - `c60ad7c` (feat)
2. **Task 2: Segundo POST responde Shopping já usado e o UNIQUE impede outra linha** - `287302f` (feat)
3. **Task 3: O código 4821 conclui a mesma linha e um código divergente não grava** - `fb62158` (feat)

## Files Created/Modified

- `src/services/deliveryqueue.service.ts` - `create` espera o `save` e traduz duplicata; `validateDelivery` atualiza a linha carregada e conclui o pedido
- `seed/demo.sql` - `UNIQUE KEY UQ_deliveryqueue_shoppingId` no `CREATE` e `PREPARE stmt_uq_deliveryqueue` depois do `COMMIT`

## Decisions Made

- O INSERT de `Waiting` é aguardado antes da resposta HTTP, para a linha existir quando o handler resolve.
- A unicidade de `shoppingId` fica no SQL da demo. A entidade não ganhou `unique`, e o literal `developmen` de `synchronize` não foi editado.
- A confirmação não insere `DeliveryQueueEntity` nova. Ela grava `Finished` na instância de `findByShopping` e só depois chama `shoppingService.updateStatus` com `Concluded`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- O `.env` local já existia e a primeira linha é `//.env`. `docker compose` na raiz do repositório recusa esse arquivo. O arquivo não foi lido para o Git nem sobrescrito. O MySQL subiu com `--env-file .env.example` e `--project-name api_ifarma` a partir de outro diretório. As provas ainda imprimiram `enqueue-ok`, `dup-ok` e `confirm-ok`. O script de prova, rodando na raiz, registra o mesmo aviso e segue.
- `package.json` já estava sujo, fora deste plano, com `moduleNameMapper` do Jest. A cerca da prova compara esse arquivo com `HEAD` e falharia no working tree. Durante cada prova o arquivo voltou ao `HEAD` e, ao terminar, a alteração local foi restaurada. Ela não entrou em nenhum commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- O pedido semeado entra na fila como `DeliveryStatus.Waiting` e sai como `DeliveryStatus.Finished`, com o pedido em `solicitacaoCompraStatus.Concluded`.
- O segundo enfileiramento responde `Shopping já usado` e o índice único impede outra linha.
- A fase 3 pode escrever o README e `npm run test:delivery` em cima desse caminho. WR-01, WR-02 e WR-04 continuam abertos. DLVY-05 a DLVY-08 ficam fora deste plano.

## Self-Check: PASSED

- FOUND: src/services/deliveryqueue.service.ts
- FOUND: seed/demo.sql
- FOUND: c60ad7c
- FOUND: 287302f
- FOUND: fb62158

---
*Phase: 02-entrega-confirmada*
*Completed: 2026-10-11*
