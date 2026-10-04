# API iFarma Backoffice

## What This Is

API HTTP do backoffice iFarma (Swagger intitulado Colibri): operadores de loja e entregadores autenticam, consultam pedidos e conduzem a entrega. Este trabalho não adiciona produto novo. Ele deixa o repositório apresentável como portfólio simples: alguém clona, segue o README, sobe a API e percorre um pedido até a confirmação da entrega.

## Core Value

Uma pessoa clona o repositório, segue o README e confirma a entrega de um pedido, e um comando de teste prova esse caminho.

## Requirements

### Validated

- ✓ API NestJS 10 em `src/main.ts`, com Swagger em `/api`, MySQL via TypeORM e JWT stateless — existing
- ✓ Login de backoffice e de entregador em `src/controllers/auth.controller.ts` — existing
- ✓ Listagem paginada e detalhe de pedido em `src/controllers/shopping.controller.ts` (`POST /shopping`, `GET /shopping/:id`) — existing
- ✓ Troca de status do pedido em `PATCH /shopping/updateStatus/:codeShopping/:codeStatus` — existing
- ✓ Entrada na fila e confirmação por código em `src/controllers/deliveryqueue.controller.ts` (`POST /deliveryqueue/:idShopping`, `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping`) — existing
- ✓ Itens do pedido em `GET /product/findByShopping/:id` — existing

### Active

- [ ] README e exemplo de ambiente para clonar, configurar e subir a API
- [ ] Dados de demonstração com loja, operador, entregador e um pedido já existente, porque a API não cria pedido
- [ ] O caminho semeado funciona de ponta a ponta: enfileirar o pedido e confirmar a entrega
- [ ] Um comando de teste prova esse caminho e nada mais
- [ ] Corrigir só a dívida que impede esse caminho (fila que não persiste, confirmação que não conclui a entrega, relações nulas no mapper, autenticação necessária para o fluxo)

### Out of Scope

- Criar pedido pela API — o domínio já trata o pedido como dado existente; a demo semeia o registro
- Cobertura de teste do restante da API — o comando novo prova só o fluxo da entrega
- Auditoria de segurança que não trava a demo (PAN/CVV, isolamento de loja, rate limit, CORS, revogação de sessão) — o portfólio é o fluxo, não o fechamento do `CONCERNS.md`
- Escala, observabilidade e pipeline de migração como meta — entram só se a demo não subir sem eles
- Recuperação de senha e e-mail — não fazem parte do caminho do pedido
- Módulos stub de cartão, endereço e categoria — handlers HTTP comentados, fora da demo

## Context

Monólito modular NestJS. Camadas em `src/controllers/`, `src/services/`, `src/repositories/` e `src/entities/`. Três identidades no mesmo processo: `userbackoffice`, `userdelivery` e `users`. Mapa em `.planning/codebase/`.

O fluxo que a API já tenta implementar é operacional, não de criação de pedido. `POST /shopping` lista. A fila nasce em `DeliveryqueueService.create`. A confirmação está em `validateDelivery` e hoje é frágil: o mapa de riscos registra save sem `await`, inserção de fila nova em vez de concluir a existente, e mappers que escrevem em relação nula.

A suíte Jest do scaffold aponta para arquivos ausentes e não afirma esse comportamento. O teste novo substitui essa lacuna só no caminho da demo.

## Constraints

- **Stack**: Permanecer em NestJS 10, TypeORM, MySQL e npm — é o código que o portfólio mostra
- **Escopo**: Portfólio simples — dívida interna só entra quando impede subir a API ou percorrer a entrega
- **Testes**: Um comando para o fluxo enfileirar e confirmar; sem meta de cobertura geral
- **Documentação**: Texto de projeto e README em português do Brasil; identificadores de código permanecem como estão
- **Dados**: Pedido, loja e usuários da demo são fictícios e versionáveis; segredos reais não entram no repositório

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Demo que sobe, não auditoria fechada | O repositório precisa ser apresentável; o mapa de riscos é maior do que um portfólio simples | — Pending |
| Caminho do pedido: semear, enfileirar, confirmar | A API não cria pedido; `POST /deliveryqueue/:idShopping` e `validateDelivery` são o fluxo que ela já tenta implementar | — Pending |
| Teste único desse caminho | Prova a demo sem abrir cobertura do restante da API | — Pending |
| Dívida só se bloquear a demo | Senha, cartão, isolamento e escala ficam de fora enquanto o caminho semeado funcionar | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-10-04 after initialization*
