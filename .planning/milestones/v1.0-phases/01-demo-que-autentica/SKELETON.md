# Walking Skeleton — API iFarma Backoffice

**Phase:** 1
**Generated:** 2026-10-04

## Capability Proven End-to-End

Quem copia `.env.example` para `.env` sobe o MySQL 8.4.11, aplica a semente versionada e autentica `entregador.demo@example.com` em `POST /auth/loginDelivery`.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | NestJS 10 já existente, sem novo scaffold | A API, o Swagger e `POST /auth/loginDelivery` já existem. A fase 1 só faz o boot ler o `.env` antes do `AppModule`. |
| Data layer | MySQL 8.4.11, schema em `seed/demo.sql`, `synchronize` desligado | `ENV=demo` mantém o literal `developmen` em `src/app.module.ts`. O SQL versionado é a fonte do DDL e da semente. |
| Auth | Rota já publicada, bcrypt 5.1.1, JWT com `JWT_SECRET` de demonstração | O `INSERT` guarda o hash. O texto `Entrega1!` fica no comentário de `seed/demo.sql`. O `sub` continua `{"userDelivery":"1"}`. |
| Deployment target | Local: `docker compose up -d` e `npm run start:dev` no host | A API não entra no Compose. O MySQL publica só `127.0.0.1:3306`. Quem já tem MySQL 8.4.11 local ajusta `DB_*` e não sobe o container. |
| Directory layout | `compose.yaml`, `.env.example`, `seed/demo.sql`, `scripts/apply-demo-sql.js` fora de `src/` | Sem `Dockerfile`, sem `migrations/`, sem rota de semente e sem semente no boot. |

## Stack Touched in Phase 1

- [x] Project scaffold — NestJS, build e Jest já estão no repositório. Esta fase não reinicia o projeto e não adiciona pacote.
- [x] Routing — `POST /auth/loginDelivery` já é `@Public()`. A fase prova essa rota com a linha semeada.
- [x] Database — `npm run seed` escreve o grafo e o login lê `userdelivery`. A reexecução apaga a fila do pedido `1`.
- [x] UI — não há frontend neste repositório. A interação da demo é o `POST` JSON do entregador.
- [x] Deployment — comando local: copiar `.env.example` para `.env`, `docker compose up -d`, `npm run seed`, `npm run start:dev`.

## Out of Scope (Deferred to Later Slices)

- Fila persistida, recusa `Shopping já usado` e confirmação por `verificationCode`. Fase 2.
- README em português e `npm run test:delivery`. Fase 3. O comentário de `seed/demo.sql` é a fonte que a fase 3 copia.
- Servidor SMTP. Os `MAIL_*` do exemplo são valores fictícios. O envio em `AuthService` continua comentado.
- Produto, cartão, endereço, categoria, `.nvmrc`, `engines` e pacote novo no `package.json`.

## Subsequent Slice Plan

Cada fase seguinte acrescenta uma fatia em cima deste esqueleto, sem trocar framework, banco, contrato de login nem o layout da semente:

- Phase 2: o entregador autenticado enfileira o pedido `1` e a confirmação pelo código `4821` conclui essa mesma linha.
- Phase 3: o README em português conduz até essa confirmação, e `npm run test:delivery` prova só esse caminho.
