# Milestones

## v1.0 MVP (Shipped: 2026-10-11)

**Phases completed:** 3 phases, 4 plans, 9 tasks

**Key accomplishments:**

- MySQL 8.4.11 local, semente idempotente da loja 2312 e login do entregador 1 com o JWT de demonstração
- O entregador autenticado grava o pedido 1 como Waiting, o segundo POST responde Shopping já usado, e o código 4821 conclui essa mesma linha
- `npm run test:delivery` semeia a demo, autentica o entregador e prova a fila, o código 0000 e o código 4821 na mesma linha
- O README em português leva até a confirmação do pedido 1, e `npm run seed` espera o MySQL do Compose por até 130 segundos

**Closeout:** override_closeout

**Known verification overrides:** 1 newly recorded, 0 carried forward

### Known Gaps

- Fase 1 (Demo que autentica): a verificação estava `stale` no fechamento. ENV-02, SEED-01 e SEED-02 estão marcados como completos. O override foi explícito.

---
