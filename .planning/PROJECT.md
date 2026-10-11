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
- ✓ Exemplo de ambiente para configurar MySQL e a API, sem segredo real e sem pacote novo no `package.json` — Phase 1
- ✓ Dados de demonstração com loja, operador, entregador e um pedido já existente, porque a API não cria pedido — Phase 1
- ✓ O caminho semeado enfileira o pedido e a confirmação pelo código conclui essa mesma entrega — Phase 2
- ✓ README em português para clonar, configurar e subir a API até confirmar a entrega — Phase 3
- ✓ Um comando de teste prova esse caminho e nada mais — Phase 3

### Active

- [ ] Corrigir WR-01 e WR-02 do code review da fase 1. WR-04 fechou na fase 3: `npm run seed` espera 130 segundos e trata acesso negado transitório como retry

### Out of Scope

- Criar pedido pela API — o domínio já trata o pedido como dado existente; a demo semeia o registro
- Cobertura de teste do restante da API — o comando novo prova só o fluxo da entrega
- Auditoria de segurança que não trava a demo (PAN/CVV, isolamento de loja, rate limit, CORS, revogação de sessão) — o portfólio é o fluxo, não o fechamento do `CONCERNS.md`
- Escala, observabilidade e pipeline de migração como meta — entram só se a demo não subir sem eles
- Recuperação de senha e e-mail — não fazem parte do caminho do pedido
- Módulos stub de cartão, endereço e categoria — handlers HTTP comentados, fora da demo

## Context

Monólito modular NestJS. Camadas em `src/controllers/`, `src/services/`, `src/repositories/` e `src/entities/`. Três identidades no mesmo processo: `userbackoffice`, `userdelivery` e `users`. Mapa em `.planning/codebase/`.

O fluxo que a API implementa é operacional, não de criação de pedido. `POST /shopping` lista. A fila nasce em `DeliveryqueueService.create` e a confirmação em `validateDelivery`. Desde a fase 2, o `save` de Waiting é aguardado, um segundo POST no mesmo pedido responde `Shopping já usado` pela chave `UQ_deliveryqueue_shoppingId`, e o código certo grava `Finished` na linha já carregada antes de marcar o pedido como `Concluded`.

`npm run test:delivery` prova só o percurso da entrega. A suíte Jest do scaffold continua sem esse spec.

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
| Caminho do pedido: semear, enfileirar, confirmar | A API não cria pedido; `POST /deliveryqueue/:idShopping` e `validateDelivery` são o fluxo que ela já implementa | — Phase 2 |
| INSERT de Waiting aguardado | A linha precisa existir quando o handler resolve | — Phase 2 |
| Unicidade de shoppingId no SQL da demo | `ENV=demo` não sincroniza; a entidade não ganhou `unique`; o literal `developmen` permanece | — Phase 2 |
| Confirmação grava Finished na linha carregada | Inserir uma `DeliveryQueueEntity` nova abria outra fila em vez de concluir a Waiting | — Phase 2 |
| Teste único desse caminho | Prova a demo sem abrir cobertura do restante da API | — Phase 3 |
| `npm run test:delivery` sem `--forceExit` | O processo devolveu o prompt depois de `app.close()` | — Phase 3 |
| Espera do seed em 130 tentativas de 1 s | Cobre o healthcheck do Compose. Errno 1045 volta a tentar. Errno 1044 fica no `CREATE DATABASE` | — Phase 3 |
| README substitui o starter | O quadro cita só o entregador. O token do login é colado ao vivo. O texto não leva o segredo JWT | — Phase 3 |
| Dívida só se bloquear a demo | Senha, cartão, isolamento e escala ficam de fora enquanto o caminho semeado funcionar | — Pending |
| Hash bcrypt da senha da demo no SQL | O hash de `Entrega1!` (bcrypt 5.1.1, custo 10) fica em `seed/demo.sql`; o aplicador não chama bcrypt nem imprime senha | — Phase 1 |
| `ENV=demo` mantém `synchronize` desligado | O literal `developmen` em `src/app.module.ts` não foi alterado | — Phase 1 |
| Nenhum pacote novo no manifesto | O self-link `"api_ifarma": "file:"` pré-existente foi preservado; `npm run seed` não instalou dependência | — Phase 1 |

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

*Last updated: 2026-10-11 after Phase 3*
