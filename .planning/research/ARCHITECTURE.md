# Pesquisa de Arquitetura

**Domínio:** API HTTP de backoffice de farmácia (iFarma / Colibri) — demo semeada de enfileirar e confirmar entrega
**Pesquisado:** 2026-10-04
**Confiança:** HIGH

## Arquitetura padrão

O trabalho cabe no monólito modular que já existe. Um processo NestJS 10 atende operador e entregador. A persistência continua MySQL via TypeORM. A fila de entrega continua sendo a tabela `deliveryqueue`, lida e escrita na request. Seed, correção da confirmação e o teste único ocupam lugares que o repositório já separa: dado versionado fora do grafo HTTP, regra no service do agregado, prova no e2e que sobe `AppModule`.

### Visão do sistema

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Fora da request                                                          │
│  seed/demo.sql  →  tabelas já mapeadas em src/entities/                  │
│  (users, userbackoffice, userdelivery, shoppings; sem linha em           │
│   deliveryqueue)                                                          │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ leitura posterior
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Borda HTTP (já existente)                                                │
│  src/main.ts          AuthGuard global          RoleGuard na rota        │
│  POST /auth/login     POST /auth/loginDelivery   Bearer JWT               │
│  POST /shopping       POST /deliveryqueue/:idShopping                     │
│  POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping           │
│  GET  /deliveryqueue/findByUserDelivery                                   │
└────────────┬────────────────────────────┬────────────────────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────────────┐  ┌──────────────────────────────────────────┐
│  Shopping (leitura/status) │  │  Fila (enfileirar e confirmar)           │
│  ShoppingController        │  │  DeliveryqueueController                 │
│  ShoppingService           │◀─│  DeliveryqueueService                    │
│  ShoppingRepository        │  │  DeliveryQueueRepository                 │
│  ShoppingMapper.toDTO      │  │  UserDeliveryService.findOne             │
└────────────┬───────────────┘  └──────────────────┬───────────────────────┘
             │                                      │
             ▼                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  MySQL                                                                    │
│  users · userbackoffice · userdelivery · shoppings · deliveryqueue       │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│  Prova do caminho (processo à parte, mesmo AppModule)                     │
│  npm script → seed/demo.sql → test/delivery-confirm.e2e-spec.ts          │
│  Supertest → app.getHttpServer() → rotas acima → MySQL                    │
└──────────────────────────────────────────────────────────────────────────┘
```

`DeliveryqueueModule` já importa `ShoppingModule` e `UserDeliveryModule`. `ShoppingModule` exporta `ShoppingService`. `UserDeliveryModule` exporta `UserDeliveryService`. Esse fio permanece. O teste importa `AppModule` e fala HTTP. Ele não ganha provider, módulo nem repository.

### Responsabilidades dos componentes

| Componente | O que é dele | Onde fica |
|-----------|----------------|-----------|
| Seed da demo | Grava loja fictícia, operador, entregador, cliente e um pedido sem fila. Repete sem duplicar e devolve o pedido ao estado anterior a `POST /deliveryqueue/:idShopping`. | `seed/demo.sql`, fora de `src/`. Script npm só aplica o arquivo. |
| `DeliveryqueueController` | Traduz params e o ator `@Delivery()` para o service. Continua com `@Roles(Role.Delivery)`, `@UseGuards(RoleGuard)` e Bearer. | `src/controllers/deliveryqueue.controller.ts` |
| `DeliveryqueueService.create` | Carrega pedido e entregador pelos services exportados. Se `findByShopping` vier vazio, grava `DeliveryStatus.Waiting` e espera o `save`. | `src/services/deliveryqueue.service.ts` |
| `DeliveryqueueService.validateDelivery` | Confere `shopping.verificationCode`, carrega a fila daquele `shoppingId`, marca essa instância como `DeliveryStatus.Finished`, espera o `save` e só então chama `ShoppingService.updateStatus(solicitacaoCompraStatus.Concluded, shopping.id)`. | O mesmo service |
| `DeliveryQueueRepository` | `save`, `findByShopping`, `findByUserDelivery`. A confirmação usa a linha que `findByShopping` já devolve. | `src/repositories/deliveryQueue.repository.ts` |
| `ShoppingService` | Lista, detalhe e `updateStatus`. O pedido da demo chega pelo seed. Este service não passa a criar pedido. | `src/services/shopping.service.ts` |
| `ShoppingRepository` | `findAll` com `relations: ['userClientEntity']`, `findOne`, `updateStatus`. | `src/repositories/shopping.repository.ts` |
| `ShoppingMapper` | `toDTO` / `toListDTO` da listagem. O seed preenche `users` e `shoppings.userEntityId` para `entity.userClientEntity.name` existir nesse caminho. | `src/mappers/shopping.mapper.ts` |
| Auth existente | `POST /auth/login` e `POST /auth/loginDelivery`. O `sub` do entregador continua `{ userDelivery }`. | `src/controllers/auth.controller.ts`, `src/services/auth.service.ts`, `src/guard/auth.guard.ts` |
| Teste único | Um `it` percorre login, lista, enfileira, confirma e lê a fila. Sobe o `AppModule` real, sem `overrideProvider`. | `test/delivery-confirm.e2e-spec.ts` |

## Estrutura recomendada do projeto

A árvore de camadas permanece. Entram dois artefatos ao lado dela.

```
api_ifarma/
├── seed/
│   └── demo.sql                         # dados fictícios, idempotentes
├── src/
│   ├── controllers/
│   │   └── deliveryqueue.controller.ts  # HTTP da fila; sem regra nova
│   ├── services/
│   │   ├── deliveryqueue.service.ts     # await do create; confirma a linha Waiting
│   │   └── shopping.service.ts          # updateStatus segue sendo o escritor do pedido
│   ├── repositories/
│   │   ├── deliveryQueue.repository.ts
│   │   └── shopping.repository.ts
│   ├── entities/                        # contrato das tabelas do seed
│   ├── modules/
│   │   └── deliveryqueue.module.ts      # imports atuais; sem módulo novo
│   ├── mappers/
│   │   └── shopping.mapper.ts
│   └── tests/                           # scaffold unitário; fora do comando da demo
├── test/
│   ├── jest-e2e.json                    # config já usada pelo e2e
│   ├── app.e2e-spec.ts                  # scaffold; fora do comando da demo
│   └── delivery-confirm.e2e-spec.ts     # o único spec deste caminho
└── package.json                         # um script que aplica o seed e roda só esse spec
```

### Por que essa organização

- **`src/controllers/`, `src/services/`, `src/repositories/`, `src/entities/`:** o repositório agrupa por papel técnico. Enfileirar e confirmar já têm controller, service, repository e entity. A correção edita o service (e o controller só se o handler precisar repassar um argumento que já está na request).
- **`src/modules/deliveryqueue.module.ts`:** a composição DI já liga fila, pedido e entregador. Exportar `ShoppingService` e importar `ShoppingModule` é a fronteira pública do agregado pedido. O repository de pedido fica encapsulado em `ShoppingModule`.
- **`seed/`:** a API trata o pedido como dado existente. O seed escreve as tabelas que as entities já mapeiam e não registra rota, provider nem `OnModuleInit`. Assim o boot de `src/main.ts` não insere a demo.
- **`test/delivery-confirm.e2e-spec.ts`:** o Jest de unidade usa `rootDir: src` e `*.spec.ts`. O e2e usa `test/jest-e2e.json`, `rootDir: "."` e `.e2e-spec.ts$`. O caminho que precisa de JWT, TypeORM e MySQL mora nesse segundo runner. `src/tests/services/deliveryqueue.service.spec.ts` continua no scaffold e não é o comando da demo.
- **Script npm novo:** `npm test` e `npm run test:e2e` também alcançam o scaffold (`src/tests/controllers/app.controller.spec.ts`, `test/app.e2e-spec.ts`). O comando da demo aplica `seed/demo.sql` e invoca o Jest com `test/jest-e2e.json` restrito a `delivery-confirm.e2e-spec.ts`.

## Padrões arquiteturais

### Padrão 1: Service exportado entre agregados

**O que é:** Quem orquestra outro agregado injeta o service exportado. O repository permanece no módulo dono da tabela.
**Quando usar:** `validateDelivery` precisa ler o pedido e gravar `shoppings.status`. `create` precisa carregar o entregador.
**Trade-offs:** A fila depende de `ShoppingModule` e `UserDeliveryModule`. O ciclo inverso fica de fora: `ShoppingModule` não importa `DeliveryqueueModule`, e hoje não há `forwardRef`. Trocar isso por injeção de `ShoppingRepository` dentro de `DeliveryqueueService` quebraria o encapsulamento que o módulo já declara em `exports`.

**Exemplo:**

```typescript
// src/modules/deliveryqueue.module.ts — wiring que permanece
imports: [
  TypeOrmModule.forFeature([DeliveryQueueEntity]),
  ShoppingModule,
  UserDeliveryModule,
]

// src/services/deliveryqueue.service.ts — a confirmação atualiza a linha existente
const rows = await this.deliveryQueueRepository.findByShopping(idShopping);
const deliveryQueue = rows[0];
deliveryQueue.status = DeliveryStatus.Finished;
deliveryQueue.updatedAt = new Date();
await this.deliveryQueueRepository.save(deliveryQueue);
await this.shoppingService.updateStatus(
  solicitacaoCompraStatus.Concluded,
  shopping.id,
);
```

`create` segue o mesmo desenho: `await this.deliveryQueueRepository.save(deliveryQueue)` depois de preencher `shoppingId`, `userDeliveryId`, `createdAt` e `DeliveryStatus.Waiting`.

### Padrão 2: Seed repetível fora do processo HTTP

**O que é:** Um SQL versionado, aplicado por um script, deixa o grafo mínimo da demo. Rodar de novo apaga a fila daquele pedido e recoloca o status anterior à entrega.
**Quando usar:** O domínio não cria pedido. A demo e o teste precisam do mesmo registro fictício.
**Trade-offs:** O SQL precisa nomear as colunas como as entities (`userEntityId` em `shoppings`, tabelas `users`, `userbackoffice`, `userdelivery`, `shoppings`, `deliveryqueue`). Um seeder TypeORM extra, ou `typeorm-extension`, acrescentaria dependência e um segundo bootstrap. O TypeORM documenta `synchronize` como conveniência de desenvolvimento e migrations como evolução de schema. Este repositório não tem pasta de migrations. O seed preenche linhas; quem cria tabela continua sendo o `synchronize` já ligado em `src/app.module.ts` quando `process.env.ENV === 'developmen'`.

Ordem de escrita, pelas FKs já mapeadas:

1. `users` (`UserClientEntity`: `name`, `email`, `cpf`, `numero`).
2. `userbackoffice` (`authorized: true`, `active: true`, senha em bcrypt, `storeCode` igual ao do pedido, `role` do operador). `UserRepository.login` exige `authorized` e `active`.
3. `userdelivery` (senha em bcrypt, `role` `Role.Delivery`, que é `'4'`). `UserDeliveryRepository.login` compara e-mail e bcrypt.
4. `shoppings` com `userEntityId`, `storeCode`, `verificationCode`, colunas de texto obrigatórias e status ainda não concluído (`solicitacaoCompraStatus.WaitingMotoboy` = 6 cabe na história; `create` só exige que o pedido exista).
5. Nenhuma linha em `deliveryqueue` para esse pedido. A cada reexecução, o script remove a fila desse pedido e restaura o status do `shoppings`.

A senha em claro da demo satisfaz `@IsStrongPassword` de `LoginAuthDto` (tamanho, maiúscula, minúscula, número e símbolo). A coluna guarda o hash. Valores fictícios ficam no seed e no README, nunca num `.env` de segredo real.

O teste descobre `id` por `POST /shopping` (lista paginada com `storeCode`), porque o id é `PrimaryGeneratedColumn`. A lista já passa por `ShoppingMapper.toDTO`. Com o cliente semeado e a relation `userClientEntity`, `dto.userClientName` tem de onde ler.

### Padrão 3: Um e2e do `AppModule` real

**O que é:** `Test.createTestingModule({ imports: [AppModule] })`, `createNestApplication()`, `init()`, Supertest em `app.getHttpServer()`, `close()` no `afterAll`.
**Quando usar:** O defeito está na persistência (`save` sem espera em `create`; `validateDelivery` faz `new DeliveryQueueEntity()` sem `shoppingId` nem `userDeliveryId`). Mock de repository em `src/tests/` passaria sem gravar MySQL.
**Trade-offs:** O spec abre o mesmo `TypeOrmModule.forRoot` e o `AuthGuard` global. Precisa do MySQL da demo e do seed aplicado antes. A documentação do Nest mostra `overrideProvider` para isolar um colaborador. Neste caminho o override fica de fora: o service, o repository e o banco são o objeto da prova.

O `it` único, com o header `Authorization: Bearer <token>` e o campo `token` de `LoginReturnDto`:

1. `POST /auth/login` com o operador semeado.
2. `POST /shopping` com o `storeCode` da demo e leitura do `id`.
3. `POST /auth/loginDelivery` com o entregador semeado.
4. `POST /deliveryqueue/:idShopping`.
5. `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` com o `verificationCode` semeado.
6. `GET /deliveryqueue/findByUserDelivery` e leitura de `status` `DeliveryStatus.Finished` (2) e de `shoppingEntity.status` `solicitacaoCompraStatus.Concluded` (4). A relation `shoppingEntity` já é pedida em `findByUserDelivery`.

`RoleGuard`, no ramo `request.userDelivery`, autoriza a rota quando `@Roles` inclui `Role.Delivery`. O JWT de `createTokenDelivery` é o que coloca `request.userDelivery`. O spec usa esse login. As rotas de fila permanecem autenticadas.

`GET /shopping/:id` exige `Role.Admin` ou `Role.User` e devolve a entity crua, inclusive `verificationCode`. A observação da confirmação usa a listagem da fila do entregador, que já traz o pedido relacionado.

## Fluxo de dados

### Fluxo da request

```
Operador / entregador
    ↓
AuthController.login | loginDelivery  →  JWT (sub user | userDelivery)
    ↓
AuthGuard  →  request.user | request.userDelivery
    ↓
RoleGuard  →  @Roles da rota
    ↓
Controller  →  Service  →  Repository  →  MySQL
    ↓
JSON (DTO na lista de pedidos; entity na fila)
```

### Estado

```
MySQL (fonte de verdade)
    ↑ save / find                         ↑ seed/demo.sql (antes da request)
DeliveryQueueRepository                   não entra no boot
ShoppingRepository
    ↑
JWT stateless na request (AuthGuard pendura o ator e descarta ao fim)
```

Não há cache, sessão de servidor nem broker. `synchronize` só cria ou ajusta schema quando `ENV` é exatamente `developmen`. O seed assume as tabelas presentes.

### Fluxos que importam

1. **Enfileirar:** `POST /deliveryqueue/:idShopping` → `DeliveryqueueService.create` → `ShoppingService.findOne` + `UserDeliveryService.findOne` → `DeliveryQueueRepository.findByShopping` → `save` de uma linha `Waiting`. Resposta vazia hoje; o teste confirma o efeito no GET seguinte, depois do `await`.
2. **Confirmar:** `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` → compara `verificationCode` → `save` da linha já carregada com `Finished` → `ShoppingService.updateStatus` → `ShoppingRepository.updateStatus` grava `Concluded`. Os dois `await` ficam nessa ordem: a fila conclui e, em seguida, o pedido.
3. **Lista que acha o pedido:** `POST /shopping` → `findAll` com `userClientEntity` → `ShoppingMapper.toListDTO`. É leitura. Não cria `shoppings`.
4. **Seed:** o script SQL corre antes do processo de teste e antes da pessoa seguir o README. Restaura o pedido sem fila para o `create` não responder `Shopping já usado`.
5. **Teste:** o mesmo HTTP dos passos 1–3, contra o `AppModule` já composto em `src/app.module.ts`.

## Ordem de construção

Pré-condição, sem componente novo: as tabelas existem. Com o código atual, isso acontece quando `ENV` vale `developmen` e o `TypeOrmModule.forRoot` sobe, ou quando o MySQL já tem o schema das entities. O seed não substitui esse passo e esta demo não abre pasta de migrations.

1. **Confirmação e espera do `save` no service da fila.** Editar `DeliveryqueueService.create` e `validateDelivery`. `DeliveryQueueRepository.findByShopping` e `save` já existem. `ShoppingService.updateStatus` continua o único escritor de `shoppings.status`. Sem esse passo, o GET depois do POST observa fila ausente ou insert inválido (`shoppingId` e `userDeliveryId` obrigatórios na entity nova).
2. **Seed idempotente do grafo.** Pode andar em paralelo com o passo 1. Depende só das entities e das regras de login (`authorized` / `active` no operador, bcrypt nos dois, cliente para a relation da lista). Não depende do corpo novo de `validateDelivery`, e o teste depende dos dois.
3. **Spec e comando.** `test/delivery-confirm.e2e-spec.ts` mais um script que aplica `seed/demo.sql` e roda só esse arquivo. Depende do service que persiste e do seed que deixa um pedido sem fila, com `verificationCode` e `storeCode` conhecidos.

O mapper de pedido não vira fase. `findAll` já carrega a relation; o seed cumpre o contrato de `toDTO`. `ShoppingMapper.toEntity` e `ProductMapper.toEntity` ficam fora deste caminho: nenhum handler de enfileirar, confirmar ou listar os chama.

## Escala

Esta demo é um operador, um entregador e um pedido. O monólito permanece.

| Escala | Ajuste |
|--------|--------|
| Demo (1 fluxo) | `await` no `save`, atualizar a linha `Waiting`, seed repetível, um e2e. A tabela `deliveryqueue` é a fila. |
| Uma loja com vários entregadores no mesmo pedido | O `await` encolhe a janela em que dois `create` veem `findByShopping` vazio. A coluna `shoppingId` não tem índice único. Isso fica fora da demo de um entregador. |
| Muitas lojas ou fila assíncrona | Continua um processo Nest. Worker, Redis ou serviço separado entram só num trabalho que não é este portfólio. |

### O que pressiona primeiro

1. **Persistência da fila no mesmo request.** `create` dispara `save` sem esperar. O teste e o README leem em seguida. A correção é o `await` no service, não um broker.
2. **Confirmação que abre outra linha.** `validateDelivery` instancia `DeliveryQueueEntity` sem id nem FKs. A correção reutiliza `findByShopping` e grava `Finished` nessa instância antes de `updateStatus`.

## Anti-padrões

### Anti-padrão 1: Novo serviço ou módulo para a demo

**O que acontece:** Alguém extrai "delivery-demo", cria `POST /shopping` de criação de pedido, ou move controller e service para uma pasta por feature.
**Por que atrapalha:** O monólito já tem o agregado, as rotas e o wiring. Um módulo novo duplica DI e sugere que a API passa a criar pedido, o que está fora do domínio atual.
**No lugar disso:** Editar `deliveryqueue.service.ts` e acrescentar `seed/demo.sql` e um spec em `test/`.

### Anti-padrão 2: Seed no boot ou num endpoint

**O que acontece:** `OnModuleInit` no `AppModule`, ou uma rota pública, inserem operador e pedido sempre que a API sobe.
**Por que atrapalha:** Todo ambiente que iniciar o processo ganha usuário fictício. A fronteira de "dado da demo" mistura com a request.
**No lugar disso:** SQL versionado, aplicado pelo script e pelo README, repetível, sem registrar provider.

### Anti-padrão 3: O comando da demo ser o spec unitário com mock

**O que acontece:** Completar `src/tests/services/deliveryqueue.service.spec.ts` com `useValue` no repository e chamar isso de prova do caminho.
**Por que atrapalha:** O bug é o `save` não esperado e o insert de uma entity nova. O mock devolve sucesso sem MySQL, sem JWT e sem `RoleGuard`.
**No lugar disso:** Um e2e que importa `AppModule` sem substituir `DeliveryqueueService` nem `DeliveryQueueRepository`. O scaffold em `src/tests/` fica de fora desse comando.

### Anti-padrão 4: Confirmar inserindo outra fila `Finished`

**O que acontece:** `new DeliveryQueueEntity()`, `status = Finished`, `save`, mesmo quando já existe linha `Waiting`.
**Por que atrapalha:** As colunas `shoppingId` e `userDeliveryId` são obrigatórias. O insert falha ou grava órfão. A linha `Waiting` continua aberta. `create` depois responde `Shopping já usado` se a primeira linha existir.
**No lugar disso:** Carregar com `findByShopping`, alterar `status` e `updatedAt` dessa instância, `await save`, então `updateStatus` do pedido.

### Anti-padrão 5: Abrir a rota para pular o login

**O que acontece:** `@Public()` em `deliveryqueue` para o teste não precisar de JWT.
**Por que atrapalha:** O fluxo real passa por `AuthGuard` e `RoleGuard`. A demo deixa de mostrar o entregador autenticado.
**No lugar disso:** Semear o entregador, chamar `POST /auth/loginDelivery` e enviar `Authorization: Bearer` com o `token` devolvido.

## Pontos de integração

### Serviços externos

| Serviço | Como entra | Notas |
|---------|------------|-------|
| MySQL | `TypeOrmModule.forRoot` em `src/app.module.ts` (`mysql2`) | Host, porta, usuário, senha e database vêm de `process.env` já lido pelo app. O seed usa a mesma base. Não versionar segredo. |
| JWT | `AuthModule` / `JwtService` | Segredo `JWT_SECRET` já usado por `loginDelivery`. O teste não inventa outro guard. |
| SMTP / Nodemailer | `MailingService` | Fora do caminho enfileirar → confirmar. O seed não dispara e-mail. |

### Fronteiras internas

| Fronteira | Comunicação | Notas |
|-----------|-------------|-------|
| `DeliveryqueueModule` → `ShoppingModule` | Import do módulo e injeção de `ShoppingService` | Já existe. `findOne` e `updateStatus`. Sem `ShoppingRepository` na fila. |
| `DeliveryqueueModule` → `UserDeliveryModule` | Import e `UserDeliveryService.findOne` | Já existe no `create`. |
| `ShoppingModule` → fila | Nenhuma chamada | O pedido não importa `DeliveryqueueModule`. |
| Seed → tabelas | SQL direto nas tabelas das entities | Fora do DI. Reexecutar limpa `deliveryqueue` da demo e restaura o status do pedido. |
| Spec e2e → `AppModule` | `imports: [AppModule]` e Supertest | Mesmo grafo de `src/app.module.ts`, incluindo `APP_GUARD`. `afterAll` fecha o app. O scaffold `test/app.e2e-spec.ts` não entra no comando. |
| Lista → mapper | `ShoppingService.findAll` chama `ShoppingMapper.toListDTO` | Exige cliente semeado. `toEntity` não está nesse fluxo. |

## Fontes

- Código do repositório (confiança HIGH): `src/services/deliveryqueue.service.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/modules/deliveryqueue.module.ts`, `src/repositories/deliveryQueue.repository.ts`, `src/services/shopping.service.ts`, `src/repositories/shopping.repository.ts`, `src/mappers/shopping.mapper.ts`, `src/entities/shopping.entity.ts`, `src/entities/deliveryQueue.entity.ts`, `src/entities/user.entity.ts`, `src/entities/userDelivery.entity.ts`, `src/entities/userClient.entity.ts`, `src/app.module.ts`, `src/guard/role.guard.ts`, `src/dtos/login/login.dto.ts`, `test/jest-e2e.json`, `package.json`. Mapa em `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/TESTING.md`.
- NestJS, testes de ponta a ponta (confiança MEDIUM; página oficial conferida com o markdown do repositório de docs): [Testing](https://docs.nestjs.com/fundamentals/testing). `Test.createTestingModule`, `createNestApplication`, Supertest em `getHttpServer`.
- NestJS, encapsulamento de providers (confiança MEDIUM; mesma conferência): [Modules](https://docs.nestjs.com/modules). Exportar o service é a interface do módulo.
- TypeORM, `synchronize` versus migrations (confiança MEDIUM): [How migrations work?](https://typeorm.io/docs/migrations/why) e [Data Source Options](https://typeorm.io/docs/data-source/data-source-options/). `synchronize` é opção de desenvolvimento. Context7 não estava disponível neste run; a leitura caiu nas páginas oficiais via busca web.

---
*Pesquisa de arquitetura para: API iFarma / Colibri — demo de entrega no monólito NestJS existente*
*Pesquisado: 2026-10-04*
