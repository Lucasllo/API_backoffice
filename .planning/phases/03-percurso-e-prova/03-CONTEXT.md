# Phase 3: Percurso e prova - Context

**Gathered:** 2026-10-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Quem clona o repositório segue um README em português, sobe a API com a demo da fase 1 e confirma a entrega do pedido semeado. O comando `npm run test:delivery` prova só esse caminho: login do entregador, fila persistida, código certo concluindo a mesma linha e o pedido, código errado sem concluir.

O README substitui o texto do starter Nest. Os quatro passos HTTP são blocos para colar no terminal. A suíte `Hello World`, a cobertura do restante da API e o contrato HTTP da fila ficam como estão.

</domain>

<decisions>
## Implementation Decisions

### Passos do README
- **D-01:** A pessoa executa quatro passos, cada um com a resposta esperada: login do entregador, enfileirar o pedido `1`, código errado sem concluir, código `4821` concluindo a mesma entrega.
- **D-02:** Cada passo é um bloco para colar no terminal, com método, rota, body e a linha do que a resposta precisa mostrar. Uma frase aponta o Swagger em `http://localhost:3000/api`.
- **D-03:** O bloco afirma o status e o corpo que a rota devolve. O login mostra o `token`. Enfileirar e o código `4821` mostram sucesso sem corpo. O código errado mostra `400` e `Dados invalidos`. O texto diz que a fila ficou em espera e depois concluída.
- **D-04:** Um quadro no topo lista `entregador.demo@example.com`, `Entrega1!`, pedido `1` e código `4821`. O login usa esse quadro. Os três passos seguintes levam `Authorization: Bearer` e pedem para colar o token do login. O código errado do exemplo é `0000`.

### Carregado do projeto, não rediscutido
- **D-05:** Texto em português do Brasil. Identificadores de código permanecem. Nenhum pacote novo no `package.json`. O contrato de `POST /auth/loginDelivery`, `POST /deliveryqueue/:idShopping` e `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` permanece.
- **D-06:** Os valores do quadro saem do comentário de `seed/demo.sql`. Antes dos quatro blocos, o README leva a pessoa a copiar `.env.example` para `.env` sem editar, subir o MySQL da demo (Compose `mysql:8.4.11` ou MySQL local), rodar `npm run seed` e subir a API na porta `3000`.
- **D-07:** `npm run test:delivery` cita só o spec desse caminho. `npm test` e `npm run test:e2e` permanecem. O e2e `Hello World` não é trabalho desta fase.
- **D-08:** `--forceExit` entra no comando só se o pool do TypeORM segurar o processo depois de `app.close()`.

### Claude's Discretion
- O README abre com o que falta para a primeira subida (Node, `npm install`, `.env`, MySQL, `npm run seed`, `npm run start:dev`) e fecha com uma seção curta: `npm run test:delivery` repete o mesmo caminho. A confirmação que a pessoa vê é a dos quatro blocos.
- O quadro cita só o entregador da demo. Login de operador não é passo.
- `npm run test:delivery` reaplica a semente no MySQL do `.env` antes das asserções, para o pedido `1` começar sem fila mesmo depois do percurso manual. Ao terminar, o pedido fica concluído. O README manda rodar `npm run seed` imediatamente antes dos quatro blocos.
- WR-04 entra nesta fase: a espera do `npm run seed` cobre a janela de saúde do Compose, porque a ordem do README é subir o MySQL e semear em seguida. WR-01 e WR-02 ficam abertos. O texto não pede para trocar `DB_DATABASE`, e `validCode` `0` não participa do percurso.
- O spec novo é o único arquivo que o script executa. Os specs de unidade em `src/tests/` continuam no `npm test`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Fase e requisitos
- `.planning/ROADMAP.md` — Fase 3: README até a confirmação e `npm run test:delivery` só desse caminho
- `.planning/REQUIREMENTS.md` — `ENV-01` e `TEST-01`; `DLVY-05` a `DLVY-08` ficam na v2
- `.planning/PROJECT.md` — portfólio simples, sem pacote novo, dívida só se impedir o README ou a prova
- `.planning/STATE.md` — `--forceExit` condicional; WR-01, WR-02 e WR-04 ainda abertos no fim da fase 2
- `.planning/phases/01-demo-que-autentica/01-CONTEXT.md` — valores da semente, `.env.example`, Compose e o que o README da fase 3 copia

### Código que o README e a prova têm de respeitar
- `seed/demo.sql` — comentário com e-mail, senha, pedido `1` e `verificationCode` `4821`
- `src/controllers/auth.controller.ts` — `POST /auth/loginDelivery`
- `src/controllers/deliveryqueue.controller.ts` — enfileirar e `validateDelivery`; o handler devolve a Promise do service
- `src/services/deliveryqueue.service.ts` — `create` e `validateDelivery` gravam e não devolvem a linha; código diferente responde `Dados invalidos`
- `src/services/auth.service.ts` — login do entregador devolve `id`, `name`, `role` e `token`
- `.planning/codebase/TESTING.md` — Jest em `package.json`, e2e em `test/`, Supertest já instalado, specs atuais não afirmam a entrega
- `package.json` — scripts `test`, `test:e2e` e `seed`; o script `test:delivery` ainda não existe

Não há ADR externo. Requisitos e decisões estão nos arquivos acima.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `seed/demo.sql` e `npm run seed` (`scripts/apply-demo-sql.js`): reaplicam os ids `1` e deixam o pedido `1` sem linha em `deliveryqueue`. A prova e o percurso manual partem daí.
- Supertest `6.3.4` e Jest `29` já estão no projeto. O e2e existente está em `test/app.e2e-spec.ts` com config `test/jest-e2e.json`.
- `dotenv`: `node -r dotenv/config` já é o padrão de `npm run seed`. O spec que abre `AppModule` precisa enxergar `DB_*` e `JWT_SECRET` do `.env`.

### Established Patterns
- `POST /auth/loginDelivery` é público e usa `LoginAuthDto` (`email`, `password`; `storeCode` opcional). A senha da demo é `Entrega1!`.
- `POST /deliveryqueue/:idShopping` e `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` exigem Bearer de entregador (`Role.Delivery`) e `@UseGuards(RoleGuard)`.
- `create` grava `DeliveryStatus.Waiting` e, se o pedido já tem fila, responde `Shopping já usado`. `validateDelivery` com código diferente de `verificationCode` lança `BadRequestException('Dados invalidos')` e não altera a linha. O código `4821` grava `Finished` na linha carregada e então marca o pedido `Concluded`. Os dois métodos não retornam o corpo da fila.
- `ENV=demo` deixa `synchronize` desligado. O literal `developmen` em `src/app.module.ts` permanece.

### Integration Points
- `README.md` hoje é o starter Nest, em inglês, com badges do repositório upstream. Esta fase troca esse texto.
- O script novo entra em `package.json` ao lado de `test:e2e`. Não há `jest.config.js`.
- A API escuta a porta `3000` fixa. Swagger em `/api`.

</code_context>

<specifics>
## Specific Ideas

- Quadro: `entregador.demo@example.com`, `Entrega1!`, pedido `1`, código `4821`.
- Código errado colado no terceiro bloco: `0000`.
- Swagger citado numa frase: `http://localhost:3000/api`.
- Header dos três passos autenticados: `Authorization: Bearer`, com o token copiado do login.

</specifics>

<deferred>
## Deferred Ideas

- Citar `GET /deliveryqueue/findByUserDelivery` no README para a pessoa ver `Waiting` e `Finished` na resposta. A discussão manteve os quatro POST. Isso continua em `DLVY-05` (v2).
- WR-01 (o SQL ignora `DB_DATABASE`) e WR-02 (`validCode` `0`). Não travam o percurso com `.env.example` intacto.
- `DLVY-06`, `DLVY-07` e `DLVY-08`: dono da confirmação, segunda confirmação e `userClientEntity` nula. Fora deste roadmap.

</deferred>

---

*Phase: 3-Percurso e prova*
*Context gathered: 2026-10-11*
