# Project Research Summary

**Project:** API iFarma Backoffice
**Domain:** Demo local de um backoffice de farmácia já existente (NestJS + MySQL) — semear um pedido, enfileirar e confirmar a entrega por código
**Researched:** 2026-10-04
**Confidence:** MEDIUM

## Executive Summary

Este marco não cria produto. A API iFarma (Swagger intitulado Colibri) já é um monólito modular NestJS 10: operador e entregador autenticam, `POST /shopping` lista, e a fila de entrega é a tabela `deliveryqueue`. O valor do portfólio é uma pessoa clonar o repositório, seguir o README em português, subir a API e confirmar um pedido fictício já semeado. O ator HTTP desse caminho é o entregador (`Role.Delivery`). A prova é um único comando Jest contra o `AppModule` real e o MySQL semeado.

A abordagem fechada nesta síntese: nenhum pacote novo no `package.json`. Node.js 22.x, MySQL 8.4.11 (tag Docker `mysql:8.4.11`), `import 'dotenv/config'` antes de `AppModule`, e SQL versionado em `seed/demo.sql` aplicado por `scripts/apply-demo-sql.js` com `mysql2`. O literal `developmen` em `src/app.module.ts` permanece; o exemplo de ambiente usa `ENV=demo`, então `synchronize` continua desligado. A correção mora em `DeliveryqueueService`: `await` no `save` de `create`, e `validateDelivery` atualiza a linha `Waiting` já carregada por `findByShopping` e, na mesma transação, grava `solicitacaoCompraStatus.Concluded` no pedido. O comando da demo é `npm run test:delivery`, com `--runTestsByPath` em `test/delivery-confirm.e2e-spec.ts`. O README entra por último, citando senha, id e `verificationCode` que a semente já gravou.

Os riscos que deixam o clone vermelho, ou verde pelo motivo errado, são conhecidos no código. `dotenv.config()` hoje roda depois que `TypeOrmModule.forRoot` e `JwtModule.register` já leram `process.env`. `create` dispara `save` sem esperar. `validateDelivery` faz `new DeliveryQueueEntity()` sem `id`, e o `save` do TypeORM vira `INSERT`. Corrigir o typo `developmen` ligaria `synchronize` e reescreveria o MySQL. Hash bcrypt em aspas duplas no PowerShell não autentica. Um spec que só espera HTTP 201, ou `npm test` da suíte do scaffold, não prova a entrega. Mitigação: fases na ordem ambiente, semente, correção da fila, e2e com asserção de identidade da linha, README. Foto, SMS, criar pedido, lock, fila externa e auditoria de segurança ficam fora.

## Key Findings

### Recommended Stack

A stack é a do repositório. O marco trava o runtime e o banco da demo e acrescenta scripts npm, sem entrada nova em `dependencies` nem `devDependencies`. Detalhe em `.planning/research/STACK.md`.

**Core technologies:**

- Node.js 22.x: runtime de `nest start` e do Jest — Node 20 está em EOL (2026-04-30); Node 22 segue em Maintenance LTS até 2027-04-30. Fixar com `.nvmrc` (`22`) e `"engines": { "node": ">=22 <23" }`. Node 24 fica de fora: os tipos instalados são `@types/node` 20.12.12.
- NestJS 10.3.8 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/testing`): API HTTP e o módulo de teste — é o processo que o portfólio mostra. Não migrar para Nest 11 nem para Vitest.
- TypeORM 0.3.20 + `@nestjs/typeorm` 10.0.2: ORM e a conexão única em `src/app.module.ts` — a demo grava `deliveryqueue` e `shoppings` com as entities existentes. Sem pasta `migrations/`.
- `mysql2` 3.9.7: driver com `type: 'mysql'` — já no lock. A combinação com MySQL 8.4.11 não tem matriz oficial; é a combinação desta demo e precisa de um CRUD na execução.
- MySQL Server 8.4.11 (imagem `mysql:8.4.11`): banco local — linha 8.4 LTS. `latest` (26.7) e `lts` (9.7.2) ficam de fora. Quem já tem MySQL 8.4 local aponta `DB_*` e pula o Compose.
- Jest 29.7.0 + `ts-jest` 29.1.2: o único runner da prova — `--runTestsByPath` com o caminho completo e `--runInBand`. Sem `--passWithNoTests`.
- `dotenv` 16.4.5: preencher `process.env` antes de avaliar `AppModule` — `import 'dotenv/config'` como primeiro import de `src/main.ts`, e `node -r dotenv/config` no seed e no Jest (o e2e não executa `src/main.ts`). Não migrar para `forRootAsync` neste marco.
- `bcrypt` 5.1.1: o mesmo módulo de `UserDeliveryRepository.login` — o hash versionado no SQL; a senha em texto só no README. No Windows x64 o prebuild N-API v3 dispensa Visual Studio.
- `supertest` 6.3.4 e `@nestjs/jwt` 10.2.0: HTTP contra `app.getHttpServer()` e o Bearer de `POST /auth/loginDelivery` — já estão no lock.

Instalação alvo, sem pacote novo:

```bash
npm ci
docker compose up -d
npm run seed
npm run start:dev
npm run test:delivery
```

Scripts a acrescentar:

```json
"seed": "node -r dotenv/config scripts/apply-demo-sql.js",
"test:delivery": "node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.json --runTestsByPath test/delivery-confirm.e2e-spec.ts --runInBand"
```

`.env.example` na raiz, sem segredo: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `ENV=demo`. `MAIL_*` e `CLIENT_URL` ficam de fora. `compose.yaml` sobe `mysql:8.4.11` com `utf8mb4` / `utf8mb4_unicode_ci` e healthcheck `mysqladmin ping`. A semente não depende de `/docker-entrypoint-initdb.d`.

### Expected Features

O leitor clona e percorre um pedido semeado até a confirmação. O contrato já publicado é `POST /deliveryqueue/:idShopping` e depois `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping`. Detalhe em `.planning/research/FEATURES.md`.

**Must have (table stakes):**

- Pedido semeado, não criado pela API — `POST /shopping` lista; o clone precisa de um `id` conhecido
- Loja, operador e entregador fictícios na mesma semente — login exige `userdelivery` com hash bcrypt e `Role.Delivery`; o operador entra no conjunto mesmo sem o teste usar o token dele
- README em português e exemplo de ambiente — schema utilizável com `synchronize` desligado
- `POST /auth/loginDelivery` e Bearer nas duas rotas da fila — `@Roles(Role.Delivery)` e `RoleGuard`
- `POST /deliveryqueue/:idShopping` persiste `DeliveryStatus.Waiting` (`1`) — hoje `save` sem `await`
- Segunda reivindicação do mesmo pedido recusada com `Shopping já usado` — depois que o primeiro `save` persistiu; sem lock e sem teste de corrida
- Código certo conclui a mesma linha (`DeliveryStatus.Finished`, `2`) e o pedido (`solicitacaoCompraStatus.Concluded`, `4`)
- Código errado não conclui — `Dados invalidos`; fila e pedido permanecem
- Pedido ou entregador inexistente não abre fila — `Dados invalidos` já lançado; manter
- Um comando Jest só desse caminho — fora `npm test` e `npm run test:e2e`

**Should have (competitive):**

Nada disto entra nas fases deste marco. Só depois do caminho semeado estável (v1.x):

- `GET /deliveryqueue/findByUserDelivery` no roteiro manual, se a resposta já vier consistente — a rota existe; o e2e pode usá-la como leitura do efeito, sem virar feature nova
- Confirmação restrita ao `userDeliveryId` da fila — expectativa real de última milha; o `validateDelivery` atual não lê `@Delivery()`
- Segunda confirmação do mesmo pedido estável, sem linha nova
- `POST /shopping` sem exceção quando `userClientEntity` vier nula — só se um README futuro passar a listar pedidos

**Defer (v2+):**

- SMS ou push do `verificationCode`, limite de tentativas e entrega assistida sem PIN
- Foto, assinatura, geofence e documento de quem recebeu
- Vitrine de pedidos livres, reatribuição e lock para dois entregadores
- Status intermediários (`WaitingMotoboy`, `OrderOnTheWay`, `OrderAtTheDeliveryPoint`) no mesmo passeio
- Itens (`GET /product/findByShopping/:id`) e telefone do cliente no roteiro
- Fechamento do mapa de riscos: código em `GET /shopping/:id`, isolamento de loja, rate limit, CORS, revogação
- Criar pedido na API, Bull/Redis, recuperação de senha, cartão, endereço, categoria
- Trocar o contrato HTTP (o código permanece no path)

### Architecture Approach

O trabalho cabe no monólito que já existe. Um processo NestJS atende operador e entregador. A fila continua sendo a tabela `deliveryqueue`, lida e escrita na request. Seed, correção e o teste ocupam lugares que o repositório já separa: dado versionado fora do grafo HTTP, regra no service, prova no e2e que sobe `AppModule`. Detalhe em `.planning/research/ARCHITECTURE.md`.

**Major components:**

1. `seed/demo.sql` + `scripts/apply-demo-sql.js` — grava schema e o grafo fictício (cliente, operador, entregador, um pedido) e, a cada reexecução, apaga a fila daquele pedido e restaura o status anterior à entrega. Fora de `src/`. Sem `OnModuleInit` e sem rota de seed.
2. `DeliveryqueueController` — traduz params e mantém `@Roles(Role.Delivery)`, `@UseGuards(RoleGuard)` e Bearer. Sem regra nova e sem `@Public()`.
3. `DeliveryqueueService.create` — carrega pedido e entregador pelos services exportados; se `findByShopping` vier vazio, grava `Waiting` e devolve a Promise do `save`.
4. `DeliveryqueueService.validateDelivery` — compara `verificationCode`; se divergir, não grava; se bater, carrega a fila daquele `shoppingId` (length 1), marca essa instância como `Finished` e, na mesma transação, chama `ShoppingService.updateStatus(Concluded)`.
5. `DeliveryQueueRepository` — `save`, `findByShopping`, `findByUserDelivery`. A confirmação usa a linha que `findByShopping` devolve. Não ler `UserDeliveryEntity.deliveryQueueEntity` (é `@OneToMany` hidratado como lista, tipado como entidade única).
6. `ShoppingService` / `ShoppingRepository` — lista, detalhe e `updateStatus`. O pedido da demo chega pelo seed. Este service não passa a criar pedido. O repository de pedido permanece encapsulado em `ShoppingModule`.
7. Auth existente — `POST /auth/loginDelivery` emite `{ userDelivery }`. O spec usa esse login. `POST /auth/login` emite `{ user }` e na fila vira 403.
8. `test/delivery-confirm.e2e-spec.ts` — `Test.createTestingModule({ imports: [AppModule] })`, Supertest em `app.getHttpServer()`, `close()` no `afterAll`, sem `overrideProvider`.

Ordem de escrita da semente, pelas FKs: `users` (`UserClientEntity`), `userbackoffice` (`authorized` e `active` verdadeiros, bcrypt, `storeCode` do pedido), `userdelivery` (`Role.Delivery` = `'4'`, bcrypt), `shoppings` com `userEntityId`, `storeCode`, `verificationCode` e status ainda não concluído (`solicitacaoCompraStatus.WaitingMotoboy` = 6), nenhuma linha prévia em `deliveryqueue`. Ids fixos no `INSERT`. A senha em claro satisfaz `@IsStrongPassword` e aparece só no README.

O e2e, com ids fixos, não precisa de `POST /shopping` para descobrir o id. Passos do spec: `POST /auth/loginDelivery`, `POST /deliveryqueue/:idShopping`, código errado sem mudança de status, `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` com o código da semente, leitura de `Finished` e `Concluded` (a rota `GET /deliveryqueue/findByUserDelivery` já pede `shoppingEntity` e serve como observação HTTP). Segunda reivindicação responde `Shopping já usado` no caso sequencial. Cliente semeado existe para a relation da lista, e a lista fica fora do comando.

Padrões que permanecem: service exportado entre agregados (`DeliveryqueueModule` importa `ShoppingModule` e `UserDeliveryModule`; o ciclo inverso fica de fora); seed repetível fora do processo HTTP; um e2e do `AppModule` real. Anti-padrões: módulo novo, seed no boot, spec unitário com mock como prova, confirmar inserindo outra fila `Finished`, `@Public()` na rota.

### Critical Pitfalls

Os dez pitfalls estão em `.planning/research/PITFALLS.md`. Os cinco abaixo mudam a ordem do roadmap.

1. **`.env` lido depois que o módulo capturou `process.env`** — o primeiro import de `src/main.ts` é `import 'dotenv/config'`, antes de `./app.module`. O seed e o Jest usam `node -r dotenv/config`. `ConfigModule.forRoot()` não preenche o `forRoot` síncrono. As duas pontas (TypeORM e JWT) recebem o ambiente juntas.
2. **Corrigir o typo `developmen` para criar as tabelas** — deixar `synchronize: process.env.ENV === 'developmen'` como está. O exemplo usa `ENV=demo`. O SQL versionado cria as tabelas e lista as colunas `NOT NULL` sem default. O boot da demo não emite `CREATE`/`ALTER`/`DROP`.
3. **`create` resolve antes do `INSERT`, e `validateDelivery` grava uma fila nova** — `return await this.deliveryQueueRepository.save(...)` no `create`. Na confirmação, `findByShopping`, atualizar a instância com `id` presente (`status` `Finished`, `updatedAt`) e `save`. `await` extra em cima de `new DeliveryQueueEntity()` continua sendo `INSERT`. A asserção olha o mesmo `id`, `COUNT` 1, `status === 2` e `shoppings.status === 4`. `expect(save).toHaveBeenCalled()` sem `id` passa com o bug atual.
4. **Fila e pedido commitam separados, e a semente não casa com o README** — uma transação (`DataSource.transaction`) grava os dois status; código divergente não abre escrita. O hash sai de `bcrypt.hash` (pacote 5.1.1) para dentro do `.sql`, aplicado pelo script Node (`multipleStatements` só nessa conexão), para o PowerShell não expandir `$2b$`. Ids e `verificationCode` fixos, iguais aos do README. O SQL é reexecutável (`DELETE` antes do `INSERT`).
5. **O teste fica verde sem provar a linha, ou o comando citado executa o scaffold** — o comando da demo é `npm run test:delivery` com `--runTestsByPath test/delivery-confirm.e2e-spec.ts`. Ele não coleta `src/tests/controllers/app.controller.spec.ts` nem `test/app.e2e-spec.ts` (`Hello World`). Não apontar o script `test` para o scaffold. Não usar `--passWithNoTests`. `--forceExit` só entra se, depois de `app.close()`, o pool do TypeORM segurar o processo.

## Implications for Roadmap

Cinco fases, nesta ordem. A fase 3 não é demonstrável sem a 1 (processo no ar, tabelas presentes) e a 2 (pedido e entregador que logam). A fase 4 mente se entrar antes da 3: um spec frouxo fica verde no `save` sem `id`. A fase 5 por último, para não documentar senha, id ou param que as fases anteriores ainda vão gravar. Índice único em `shoppingId`, isolamento de loja, PAN/CVV, throttler, CORS, revogação e e-mail não ganham fase.

### Phase 1: Ambiente que sobe

**Rationale:** Sem `DB_HOST` na avaliação de `AppModule`, o clone não chega na confirmação. Sem tabelas, a semente não tem onde gravar. Esta fase entrega o runtime e o schema, e ainda não depende da regra da fila.
**Delivers:** `.nvmrc` e `engines` para Node 22; `.env.example` com `ENV=demo` e as chaves `DB_*` e `JWT_SECRET`; `import 'dotenv/config'` como primeiro import de `src/main.ts`; `compose.yaml` com `mysql:8.4.11`; `scripts/apply-demo-sql.js` e o DDL em `seed/demo.sql` (`CREATE TABLE` das tabelas da demo, colunas `NOT NULL` sem default, ordem de FKs). `npm run start:dev` conecta e escuta a porta 3000 só com o arquivo de exemplo copiado para `.env`, sem `export` no shell. O boot não emite DDL.
**Uses:** Node 22, Nest 10.3.8, TypeORM 0.3.20, `mysql2` 3.9.7, `dotenv` 16.4.5, imagem `mysql:8.4.11`. Nenhum pacote novo.
**Implements:** Borda de configuração do monólito existente. `synchronize` permanece no literal `developmen`.
**Avoids:** Pitfall 4 (ambiente lido tarde) e Pitfall 5 (typo de `synchronize`). Também evita `node --env-file` como único mecanismo, tags `mysql:latest` / `mysql:lts`, e `MAIL_*` no exemplo.
**Addresses:** README e exemplo de ambiente ficam incompletos até a fase 5; aqui nasce o contrato de ambiente e o schema que esse README vai citar.

### Phase 2: Semente do pedido

**Rationale:** A API não cria pedido. Login, fila e o teste precisam do mesmo registro fictício, repetível, com id estável. Depende do schema da fase 1 e das regras de login já existentes. Não depende do corpo novo de `validateDelivery`.
**Delivers:** DML idempotente no mesmo `seed/demo.sql`: cliente em `users`, operador em `userbackoffice` (`authorized`, `active`, bcrypt, `storeCode`), entregador em `userdelivery` (`Role.Delivery`, bcrypt), um `shoppings` com `verificationCode` e status `WaitingMotoboy` (6), zero linhas em `deliveryqueue` para esse pedido. Reexecução apaga a fila desse `shoppingId` e restaura o pedido. `npm run seed` aplica o arquivo via `mysql2` depois de `dotenv/config`. `POST /auth/loginDelivery` autentica com a senha que a fase 5 vai imprimir. Ids fixos.
**Uses:** `bcrypt` 5.1.1 e `mysql2` 3.9.7. Senha em texto fora do SQL.
**Implements:** Padrão de seed repetível fora do processo HTTP. Cliente semeado cumpre `userEntityId` para a relation, sem colocar `POST /shopping` no comando.
**Avoids:** Pitfall 6 (hash, ids, segundo run, PowerShell) e o ramo de lista do Pitfall 9 (mapper com relação nula). A lista não entra no roteiro, então não há fase de limpar mappers.
**Addresses:** Semente com loja, operador, entregador e pedido com `verificationCode` conhecido (table stakes P1).

### Phase 3: Fila e confirmação

**Rationale:** É a dívida que impede o caminho. O `await` e o `UPDATE` da linha existente são o produto desta fase. Entra depois da semente para que a verificação manual tenha um pedido sem fila, e antes do e2e para que a prova não congele o bug.
**Delivers:** `DeliveryqueueService.create` devolve a Promise do `save` de uma linha `Waiting` (`shoppingId`, `userDeliveryId` do token, `createdAt`). `validateDelivery` compara o código; código divergente não grava; código certo carrega `findByShopping` (exige length 1), grava `Finished` nessa instância e `Concluded` no pedido dentro de uma transação. `ShoppingService.updateStatus` continua o único escritor de `shoppings.status`. Controller, módulo e contrato de URL permanecem. Sem `@Delivery()` novo: a restrição de só quem reivindicou confirma é v1.x. Se uma fase futura passar a exigir o id do entregador, controller e service mudam no mesmo passo.
**Implements:** Padrão de service exportado. Confirmação reutiliza `DeliveryQueueRepository.findByShopping` e `save`. Sem `ShoppingMapper`, `ProductMapper` ou `toEntity`. Sem reescrever `@OneToMany` para `@OneToOne`.
**Avoids:** Pitfalls 1, 2, 3 e 10 (insert órfão, `save` flutuante, writes separados, relação lida como objeto). Pitfall 9 no diff da confirmação (mapper fora). Índice único em `shoppingId` adiado: o `await` segura a demo de uma pessoa.
**Addresses:** Fila `Waiting` persistida, recusa `Shopping já usado`, código certo conclui a mesma linha e o pedido, código errado não conclui (table stakes P1).

### Phase 4: Prova do caminho

**Rationale:** O defeito está na persistência. Mock de repository em `src/tests/` passaria sem MySQL, sem JWT e sem `RoleGuard`. O e2e só é honesto depois da fase 3, com asserção de identidade da linha. Depende também da semente (pedido sem fila, código e id conhecidos) e do preload do `.env` (o spec não executa `main.ts`).
**Delivers:** `test/delivery-confirm.e2e-spec.ts` e o script `test:delivery` acima. Sobe `AppModule` sem `overrideProvider`. Um fluxo com login de entregador, enqueue, código errado sem mudança, código certo, e leitura de `status` 2 na fila e 4 no pedido (via `GET /deliveryqueue/findByUserDelivery`). A Promise de `create` só resolve depois do `save`. Segunda chamada sequencial recebe `Shopping já usado`. `afterAll` chama `app.close()`. A saída do comando cita só esse spec e mais de zero testes.
**Uses:** Jest 29.7.0, `ts-jest`, `@nestjs/testing` 10.3.8, `supertest` 6.3.4, `test/jest-e2e.json` já existente (`rootDir` `.`, regex `.e2e-spec.ts$`).
**Implements:** Padrão de um e2e do `AppModule` real.
**Avoids:** Pitfall 8 (scaffold, `Hello World`, `--passWithNoTests`, asserção só de HTTP 201). Não promover `npm test` nem `npm run test:e2e` a prova. O spec unitário com `useValue` que o Pitfall 8 sugere fica rejeitado como comando da demo: ele não grava MySQL. A rigorosidade que esse pitfall pede (olhar `id`, não chamar `save` no código errado) entra no e2e.
**Addresses:** Um comando de teste só desse caminho (table stakes P1).

### Phase 5: README do percurso

**Rationale:** O texto cita senha, id, `verificationCode` e o significado do 201 vazio. Esses valores só estão estáveis depois das fases 2 e 3, e o comando citado é o da fase 4. Documentar antes prende o leitor num param que ainda vai mudar.
**Delivers:** README em português do Brasil com a ordem: copiar `.env.example`, `npm ci`, `docker compose up -d` (ou MySQL 8.4 já instalado), `npm run seed`, `npm run start:dev`, Swagger em `http://localhost:3000/api`. Percurso HTTP: `POST /auth/loginDelivery` com o e-mail e a senha em texto da semente; header `Authorization: Bearer` com o campo `token`; `POST /deliveryqueue/{id}` (resposta vazia, efeito na confirmação); `POST /deliveryqueue/validateDelivery/{id}/{verificationCode}`. Diz que token de `POST /auth/login` na fila é 403, que Bearer ausente também cai em 403, e que o código no lugar do id produz `Dados invalidos`. Manda rodar `npm run seed` de novo antes de repetir. Fecha com `npm run test:delivery`. Não manda `GET /shopping/:id` para copiar o código. Não documenta 401 nessa rota. Não inclui lista, produto, e-mail nem `MAIL_*`.
**Avoids:** Pitfall 7 (login e params errados) e os pitfalls de UX (201 vazio, 403, segunda passagem, Swagger com cadeado).
**Addresses:** README em português que torna o caminho reproduzível (table stakes P1).

### Phase Ordering Rationale

- Ambiente antes da semente: o script SQL precisa de MySQL no ar e de `DB_*` já lidos. Semente antes da prova: não há `POST` de criação de pedido.
- A correção da fila pode ser escrita em paralelo com a semente no código, e o teste depende das duas. No roadmap a ordem é sequencial: fase 3 depois da 2, fase 4 depois da 3, para a asserção nascer contra o comportamento já corrigido.
- Agrupamento pelo que o repositório já separa: configuração e SQL fora de `src/` (fases 1–2), regra no service (fase 3), prova em `test/` (fase 4), texto do clone (fase 5). Sem fase de módulo novo, de migration pipeline, de mapper ou de segurança.
- Quem cria tabela: `seed/demo.sql` (STACK e PITFALLS). A frase da arquitetura que deixa o `synchronize` com `ENV=developmen` criar o schema fica rejeitada para este marco. O literal `developmen` não é corrigido.
- Quem prova o caminho: e2e do `AppModule` com MySQL semeado (STACK, FEATURES, ARCHITECTURE, `PROJECT.md`). O spec unitário com `useValue` do Pitfall 8 não é o comando. As asserções de identidade desse pitfall valem dentro do e2e.
- Como o teste acha o pedido: ids fixos no `INSERT` (STACK e PITFALLS). `POST /shopping` no meio do `it` (ARCHITECTURE) fica de fora, para o comando não depender de `ShoppingMapper.toDTO`.
- Writes da confirmação: uma transação (PITFALLS), na ordem fila `Finished` e depois pedido `Concluded` (ARCHITECTURE). Código errado não entra na transação.
- Dono da fila na confirmação: fora do marco (FEATURES, v1.x). Não acrescentar `@Delivery()` na fase 3 só para conferir `userDeliveryId`.

### Research Flags

Phases likely needing deeper research during planning:

- Nenhuma. Os conflitos de schema, de prova e de transação estão fechados acima. A compatibilidade `mysql2` 3.9.7 com MySQL 8.4.11 não tem matriz oficial e se valida na execução da fase 1 (um CRUD da demo), sem pesquisa de fase.

Phases with standard patterns (skip research-phase):

- **Phase 1:** preload `dotenv/config`, Compose da imagem oficial e SQL de schema. O padrão está nas páginas do dotenv 16.4.5, do Docker Library mysql e do TypeORM sobre `synchronize`.
- **Phase 2:** `INSERT` idempotente com hash bcrypt e ids fixos. O login que o hash precisa satisfazer já está em `UserDeliveryRepository.login`.
- **Phase 3:** `await` de `save`, `findByShopping` e `DataSource.transaction` no service que já existe. O diagnóstico está no fonte (`deliveryqueue.service.ts`).
- **Phase 4:** e2e Nest com `createNestApplication`, Supertest e `app.close()`, restrito por `--runTestsByPath` do Jest 29.7.
- **Phase 5:** README de clone. O contrato HTTP já está no controller e no Swagger em `/api`.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Versões do `package-lock.json` são ALTA. Calendário do Node, tag `mysql:8.4.11` e o aviso de `synchronize` são MÉDIA. Páginas lidas por WebFetch (Jest CLI, dotenv, README da imagem Docker, `package.json` do Nest no unpkg) estão marcadas BAIXA no seam, com o texto conferido na sessão. Context7 não estava disponível. Não há matriz oficial `mysql2` 3.9.7 × MySQL 8.4.11. |
| Features | MEDIUM | Contrato deste repositório é ALTA (`deliveryqueue.service.ts`, `deliveryqueue.controller.ts`). Expectativa de mercado (Uber Direct, Instacart, iFood) é MÉDIA. Não há manual público Colibri/iFarma. O fetch do FAQ do iFood expirou; a busca devolveu o FAQ. |
| Architecture | HIGH | Lida no fonte e nos mapas em `.planning/codebase/`. Docs de Nest (testing, modules) e TypeORM (`synchronize` versus migrations) são MÉDIA e concordam com o wiring já presente. A divergência sobre quem cria tabela foi fechada na seção de roadmap, não por fonte nova. |
| Pitfalls | HIGH | Os bugs de `save` sem `await` e de `new DeliveryQueueEntity()` estão no fonte. Docs TypeORM/Nest que explicam `INSERT` sem `id` e opções de `forRoot` avaliadas na importação são MÉDIA. O binding do `bcrypt` não foi executado (`node_modules` ausente): 500 versus 401 para senha em texto claro permanece em aberto, e os dois resultados bloqueiam o Bearer. |

**Overall confidence:** MEDIUM

O diagnóstico do código e a forma do monólito sustentam o roadmap. A nota geral fica MÉDIA por causa da matriz de MySQL, da ausência de manual Colibri e do seam de WebFetch nas páginas de CLI.

### Gaps to Address

- Combinação `mysql2` 3.9.7 e MySQL 8.4.11: na fase 1, o critério de pronto inclui conectar e aplicar o DDL. Se o protocolo falhar, o fallback já pesquisado é o MySQL Community Server 8.4.11 local, na mesma linha, com as mesmas `DB_*`. Não trocar a tag para `latest` nem `lts`.
- `bcrypt.compare` com texto claro: o `login` do entregador não captura exceção do binding. A fase 2 grava hash gerado pelo mesmo pacote 5.1.1 e verifica `loginDelivery`. Não gastar a fase distinguindo 500 de 401.
- Pool do TypeORM depois de `app.close()`: `--forceExit` fica de fora do script até o sintoma aparecer na fase 4.
- `MailingService` no boot do e2e: o construtor não conecta SMTP; faz `readFileSync` de `templates/confirmation.hbs` e `templates/recoverPassword.hbs`. Com `nest build`, `__dirname` é `dist/services`. Não adicionar Webpack neste marco. Não encher o ambiente de `MAIL_*`.
- `PrimaryGeneratedColumn` versus id fixo: o `INSERT` explicita o id. A fase 2 confirma que o segundo run devolve o mesmo id que o README e o spec usam.
- Transação cobrindo `ShoppingRepository.updateStatus`: o método hoje faz `findOne` e atribui `status` sem testar nulo, e qualquer erro vira `Compra/Status invalido.`. Na fase 3 a transação envolve os dois writes; não remapear `QueryFailedError` para `Dados invalidos`. O 400 estável da demo continua sendo o de código divergente, antes da escrita.
- Windows ARM: o release 5.1.1 do `bcrypt` não publica prebuild para ARM. O ambiente alvo é Windows x64. ARM não é fase.

## Sources

### Primary (HIGH confidence)

- Código deste repositório — `src/services/deliveryqueue.service.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/modules/deliveryqueue.module.ts`, `src/repositories/deliveryQueue.repository.ts`, `src/services/shopping.service.ts`, `src/repositories/shopping.repository.ts`, `src/mappers/shopping.mapper.ts`, `src/mappers/product.mapper.ts`, `src/main.ts`, `src/app.module.ts`, `src/modules/auth.module.ts`, `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/entities/deliveryQueue.entity.ts`, `src/entities/shopping.entity.ts`, `src/entities/userDelivery.entity.ts`, `package.json`, `package-lock.json`, `test/jest-e2e.json`, `tsconfig.json`
- `.planning/PROJECT.md` — valor do marco, requisitos ativos e fora de escopo
- `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` — relatórios sintetizados aqui
- Mapas locais em `.planning/codebase/` (`STACK.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `TESTING.md`, `CONCERNS.md`) — citados pelos relatórios; `.env` não foi aberto

### Secondary (MEDIUM confidence)

- [Node.js releases](https://nodejs.org/en/about/previous-releases) — Node 20 EOL 2026-04-30; Node 22 Maintenance LTS até 2027-04-30
- [Nest v10.0.0](https://github.com/nestjs/nest/releases/tag/v10.0.0) — Node `>=16`
- [TypeORM — por que migrations](https://typeorm.io/docs/migrations/why) e [Data Source Options](https://typeorm.io/docs/data-source/data-source-options/) — `synchronize` inseguro com dado existente
- [TypeORM — entities / repository API](https://typeorm.io/docs/entity/entities) — `save` insere quando o `id` não está no banco; `undefined` omite coluna
- [Nest configuration](https://docs.nestjs.com/application/configuration) e [Nest Drizzle](https://docs.nestjs.com/data/drizzle) — opções de `forRoot` avaliadas na importação do módulo
- [Nest testing](https://docs.nestjs.com/fundamentals/testing) e [Nest modules](https://docs.nestjs.com/modules) — `createNestApplication`, Supertest, `app.close()`, exportar o service
- [bcrypt 5.1.1](https://github.com/kelektiv/node.bcrypt.js/releases/tag/v5.1.1) — prebuild `napi-v3-win32-x64`; `compare` delega ao binding
- [MySQL EOL](https://www.mysql.com/support/eol-notice.html) — 8.0 em Sustaining Support desde 2026-04-21; encaminha para 8.4 LTS
- [Uber Direct pincode](https://developer.uber.com/docs/deliveries/guides/pincode), [Instacart code verified delivery](https://docs.instacart.com/connect/fulfillment_guide/concepts/code_verified_delivery) — código certo conclui; código errado não conclui; foto e entrega sem PIN são outro produto

### Tertiary (LOW confidence)

- [Jest CLI 29.7](https://jestjs.io/docs/29.7/cli) — argumento posicional é regex; `--runTestsByPath`, `--runInBand`, `--passWithNoTests`; barras no Windows. WebFetch marcado BAIXA no seam; seções conferidas e alinhadas ao Jest 29.7.0 do lock
- [dotenv 16.4.5 README](https://github.com/motdotla/dotenv/blob/v16.4.5/README.md) — `import 'dotenv/config'` cedo. Mesmo seam
- [Docker Library mysql README](https://github.com/docker-library/docs/blob/master/mysql/README.md) — tags `8.4.11`, `latest` = 26.7, `lts` = 9.7.2; initdb só com datadir vazio. Mesmo seam
- [unpkg `@nestjs/core@10.3.8/package.json`](https://unpkg.com/@nestjs/core@10.3.8/package.json) — sem campo `engines`
- FAQ iFood Entregadores — busca devolveu o FAQ; o fetch da página expirou. Não há manual Colibri/iFarma. Comportamento de mercado aplicado ao contrato `deliveryqueue` já implementado

---
*Research completed: 2026-10-04*
*Ready for roadmap: yes*

