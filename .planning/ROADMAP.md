# Roadmap: API iFarma Backoffice

## Overview

Quem clona o repositório segue o README em português, sobe a API com MySQL e dados fictícios, enfileira um pedido já existente e confirma a entrega pelo `verificationCode`. O comando `npm run test:delivery` prova só esse caminho. A ordem da pesquisa permanece: ambiente e semente, depois a fila que persiste e conclui a mesma linha, por último o percurso escrito e a prova.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Demo que autentica** - Exemplo de ambiente, schema e semente com entregador que autentica no pedido fictício (completed 2026-10-05)
- [x] **Phase 2: Entrega confirmada** - Fila persistida, recusa do segundo enfileiramento e confirmação pelo código na mesma linha (completed 2026-10-11)
- [ ] **Phase 3: Percurso e prova** - README em português até a confirmação, e um comando Jest só desse caminho

## Phase Details

### Phase 1: Demo que autentica

**Goal:**  As a pessoa que clona o repositório, I want to configurar o MySQL e a API a partir do exemplo e autenticar o entregador no pedido fictício já semeado, so that o login da demo funciona sem segredo real.
**Mode:** mvp
**Depends on**: Nada (primeira fase)
**Requirements**: ENV-02, SEED-01, SEED-02
**Success Criteria** (o que precisa ser verdadeiro):

  1. Quem copia o exemplo de ambiente sobe o MySQL e a API, sem segredo real no repositório e sem pacote novo no `package.json`.
  2. Os dados fictícios versionados incluem uma loja, um operador, um entregador e um pedido com `verificationCode` conhecido.
  3. Rodar a semente de novo deixa esse mesmo pedido sem fila.
  4. A senha do entregador semeado autentica em `POST /auth/loginDelivery`.

**Plans:** 1/1 plans complete

Plans:

- [x] 01-01-PLAN.md — Exemplo de ambiente, semente idempotente e login do entregador

### Phase 2: Entrega confirmada

**Goal:** O entregador autenticado enfileira o pedido semeado e a confirmação pelo código conclui essa mesma entrega.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DLVY-01, DLVY-02, DLVY-03, DLVY-04
**Success Criteria** (o que precisa ser verdadeiro):

  1. O entregador autenticado envia `POST /deliveryqueue/:idShopping` e a fila desse pedido fica gravada como `DeliveryStatus.Waiting`.
  2. Um segundo `POST /deliveryqueue/:idShopping` no mesmo pedido responde `Shopping já usado` e não abre outra fila.
  3. `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` com o código da semente atualiza essa mesma linha para `DeliveryStatus.Finished` e o pedido para `solicitacaoCompraStatus.Concluded`.
  4. Um código diferente de `verificationCode` não altera a fila nem o pedido.

**Plans:** 1/1 plans complete

Plans:

- [x] 02-01-PLAN.md — Enfileirar o pedido 1, recusar o segundo POST e concluir a mesma linha pelo código

### Phase 3: Percurso e prova

**Goal:** Quem segue o README em português confirma a entrega do pedido semeado, e um comando Jest prova só esse caminho.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: ENV-01, TEST-01
**Success Criteria** (o que precisa ser verdadeiro):

  1. Quem clona o repositório segue o README em português e confirma a entrega do pedido semeado.
  2. `npm run test:delivery` prova o login do entregador, a fila persistida, o código certo concluindo a mesma linha e o pedido, e o código errado sem concluir.
  3. Esse comando cita só o spec desse caminho.

**Plans:** 2 plans

Plans:
**Wave 1**

- [ ] 03-01-PLAN.md — Comando Jest que prova só o caminho da entrega

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-02-PLAN.md — README em português e espera do seed alinhada ao Compose

## Progress

**Execution Order:**
Fases na ordem numérica: 1, 2, 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Demo que autentica | 1/1 | Complete    | 2026-10-05 |
| 2. Entrega confirmada | 1/1 | Complete    | 2026-10-11 |
| 3. Percurso e prova | 0/2 | Not started | - |
