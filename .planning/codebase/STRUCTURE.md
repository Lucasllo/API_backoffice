# Estrutura do código

**Analysis Date:** 2026-10-04

## Layout de diretórios

```
api_ifarma/
├── src/                          # Código da API (sourceRoot do Nest)
│   ├── main.ts                   # Bootstrap HTTP
│   ├── app.module.ts             # Módulo raiz
│   ├── controllers/              # Rotas HTTP, um arquivo por agregado
│   ├── services/                 # Casos de uso
│   ├── repositories/             # Acesso TypeORM por agregado
│   ├── entities/                 # Mapa das tabelas MySQL
│   ├── modules/                  # @Module Nest por agregado
│   ├── mappers/                  # Entity ↔ DTO
│   ├── dtos/                     # Contratos de entrada/saída, pasta por agregado
│   ├── enums/                    # Papéis, status de pedido, pagamento, cartão
│   ├── guard/                    # AuthGuard e RoleGuard
│   ├── decorators/               # @Public, @Roles, @User, @Delivery, @PasswordCode
│   └── tests/                    # Specs Jest (rootDir do Jest é src)
│       ├── controllers/
│       └── services/
├── test/                         # E2E Supertest
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── templates/                    # Handlebars de e-mail
│   ├── confirmation.hbs
│   └── recoverPassword.hbs
├── dist/                         # Saída do nest build (gitignored)
├── coverage/                     # Jest coverage (gitignored)
├── node_modules/                 # Dependências (gitignored)
├── .planning/                    # Artefatos GSD, inclusive este mapa
├── .cursor/                      # Skills, agents e hooks do GSD
├── package.json
├── package-lock.json
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── .env                          # Configuração de ambiente (gitignored; não versionar)
└── README.md                     # Texto padrão do starter Nest
```

Não há `apps/` nem `libs/`. O repositório é um único projeto Nest, não um monorepo.

## Propósito dos diretórios

**`src/controllers/`:**
- Purpose: Handlers HTTP. Um controller por recurso.
- Contains: `*.controller.ts`.
- Key files: `src/controllers/auth.controller.ts` (`auth`), `src/controllers/user.controller.ts` (`user`), `src/controllers/userDelivery.controller.ts` (`delivery`), `src/controllers/userClient.controller.ts` (`userClient`), `src/controllers/shopping.controller.ts` (`shopping`), `src/controllers/product.controller.ts` (`product`), `src/controllers/deliveryqueue.controller.ts` (`deliveryqueue`), `src/controllers/category.controller.ts`, `src/controllers/card.controller.ts`, `src/controllers/address.controller.ts`.

**`src/services/`:**
- Purpose: Regra de negócio e orquestração entre agregados.
- Contains: `*.service.ts`. O e-mail foge do sufixo com ponto: `src/services/mailingService.ts`.
- Key files: `src/services/auth.service.ts`, `src/services/user.service.ts`, `src/services/userDelivery.service.ts`, `src/services/shopping.service.ts`, `src/services/deliveryqueue.service.ts`, `src/services/product.service.ts`, `src/services/userClient.service.ts`.

**`src/repositories/`:**
- Purpose: Único lugar que injeta `Repository<Entity>`.
- Contains: `user.repository.ts`, `userDelivery.repository.ts`, `userClient.repository.ts`, `shopping.repository.ts`, `product.repository.ts`, `deliveryQueue.repository.ts`.
- Key files: `src/repositories/user.repository.ts` (login, paginação, autorização, soft delete), `src/repositories/shopping.repository.ts`, `src/repositories/deliveryQueue.repository.ts`.

**`src/entities/`:**
- Purpose: Tabelas e relações TypeORM. A lista também é repetida em `TypeOrmModule.forRoot` dentro de `src/app.module.ts`.
- Contains: uma classe `@Entity` por arquivo.
- Key files: `src/entities/user.entity.ts` (`userbackoffice`), `src/entities/userDelivery.entity.ts` (`userdelivery`), `src/entities/userClient.entity.ts` (`users`), `src/entities/shopping.entity.ts` (`shoppings`), `src/entities/product.entity.ts` (`product`), `src/entities/category.entity.ts` (`categoryEntity`), `src/entities/card.entity.ts` (`cards`), `src/entities/address.entity.ts` (`address`), `src/entities/deliveryQueue.entity.ts` (`deliveryqueue`).

**`src/modules/`:**
- Purpose: Composição DI. Não coloque regra aqui.
- Contains: `auth.module.ts`, `user.module.ts`, `userDelivery.module.ts`, `userClient.module.ts`, `shopping.module.ts`, `product.module.ts`, `deliveryqueue.module.ts`, `category.module.ts`, `card.module.ts`, `address.module.ts`.
- Key files: `src/modules/user.module.ts` (modelo completo: feature + mapper + repository + export), `src/modules/auth.module.ts` (JWT e imports de `UserModule` / `UserDeliveryModule`), `src/modules/deliveryqueue.module.ts` (importa `ShoppingModule` e `UserDeliveryModule`).

**`src/dtos/`:**
- Purpose: Payload e resposta validados. Única árvore agrupada por feature.
- Contains: subpastas `user`, `userDelivery`, `userClient`, `shopping`, `product`, `login`, `password`, `deliveryqueue`.
- Key files: `src/dtos/user/createUser.dto.ts`, `src/dtos/user/userQueryPaginate.dto.ts`, `src/dtos/user/userPaginate.dto.ts`, `src/dtos/login/login.dto.ts`, `src/dtos/login/loginReturn.dto.ts`, `src/dtos/password/changePasswordAuth.dto.ts`, `src/dtos/password/recoverPasswordAuth.dto.ts`, `src/dtos/shopping/shoppingQueryPaginate.dto.ts`, `src/dtos/shopping/shopping.dto.ts`, `src/dtos/product/product.dto.ts`, `src/dtos/userClient/userClientPhone.dto.ts`, `src/dtos/userDelivery/createUserDelivery.dto.ts`.

**`src/mappers/`:**
- Purpose: Cópia manual entity/DTO. Só existem para usuário, permissão de usuário, produto e pedido.
- Contains: `user.mapper.ts`, `userPermission.mapper.ts`, `product.mapper.ts`, `shopping.mapper.ts`.
- Key files: `src/mappers/userPermission.mapper.ts` (listagem sem senha), `src/mappers/shopping.mapper.ts`.

**`src/enums/`:**
- Purpose: Conjuntos fechados persistidos como número ou string.
- Contains: `role.enum.ts`, `solicitacaoCompraStatus.enum.ts`, `deliveryStatus.enum.ts`, `modoPagamento.enum.ts`, `tipoCartao.enum.ts`.
- Key files: `src/enums/role.enum.ts`, `src/enums/solicitacaoCompraStatus.enum.ts`.

**`src/guard/` e `src/decorators/`:**
- Purpose: Autenticação global, autorização por rota e injeção do ator.
- Contains: `auth.guard.ts`, `role.guard.ts`; `public.decorator.ts`, `roles.decorator.ts`, `user.decorator.ts`, `delivery.decorator.ts`, `passwordCode.decorator.ts`.
- Key files: `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/decorators/roles.decorator.ts`.

**`src/tests/`:**
- Purpose: Testes unitários descobertos pelo Jest (`testRegex`: `.*\.spec\.ts$`, `rootDir`: `src` em `package.json`).
- Contains: `src/tests/controllers/*.spec.ts`, `src/tests/services/*.spec.ts`. Inclui `src/tests/controllers/app.controller.spec.ts`.
- Key files: specs espelhados dos controllers e services ativos (`auth`, `user`, `shopping`, `product`, `deliveryqueue`, `user-delivery`, `user-client`).

**`test/`:**
- Purpose: E2E fora do `rootDir` unitário.
- Contains: `test/app.e2e-spec.ts`, `test/jest-e2e.json`.
- Key files: `test/app.e2e-spec.ts`.

**`templates/`:**
- Purpose: HTML de e-mail compilado por `MailingService.loadTemplate` a partir de `join(__dirname, '../../templates')` (`src/services/mailingService.ts:37-42`). No build, `__dirname` cai em `dist/services` ou `dist`, então o caminho relativo precisa continuar alcançando esta pasta.
- Contains: `templates/confirmation.hbs`, `templates/recoverPassword.hbs`.
- Key files: `templates/recoverPassword.hbs`.

## Localização dos arquivos principais

**Entry Points:**
- `src/main.ts`: sobe HTTP, Swagger e validação.
- `src/app.module.ts`: registra banco, entidades e módulos; instala `AuthGuard` global.
- `package.json`: scripts `start`, `start:dev`, `start:prod`, `test`, `test:e2e`, `lint`, `build`.

**Configuration:**
- `nest-cli.json`: `sourceRoot` `src`, `deleteOutDir` true.
- `tsconfig.json`: `commonjs`, `ES2021`, `baseUrl` `./`, decorators e `emitDecoratorMetadata` ligados, `outDir` `./dist`. Sem chave `paths`.
- `tsconfig.build.json`: estende o tsconfig e exclui `node_modules`, `test`, `dist`, `**/*spec.ts`.
- `.eslintrc.js`: TypeScript ESLint + Prettier.
- `.prettierrc`: aspas simples e trailing comma.
- `.env`: presente na raiz. Contém a configuração de ambiente. Não documentar valores.
- `package-lock.json`: lockfile npm presente.

**Core Logic:**
- `src/services/auth.service.ts`: emissão e verificação de JWT.
- `src/guard/auth.guard.ts`: popula `request.user` / `request.userDelivery` / `request.codeRecover`.
- `src/services/user.service.ts` e `src/repositories/user.repository.ts`: ciclo de vida do operador de loja.
- `src/services/shopping.service.ts` e `src/repositories/shopping.repository.ts`: pedidos da loja.
- `src/services/deliveryqueue.service.ts`: vínculo entregador-pedido.
- `src/entities/shopping.entity.ts`: centro do grafo (produtos, cliente, fila).

**Testing:**
- `src/tests/controllers/`: spec de controller.
- `src/tests/services/`: spec de service.
- `test/app.e2e-spec.ts`: e2e do `AppModule`.
- `test/jest-e2e.json`: config do `npm run test:e2e`.

## Convenções de nomenclatura

**Files:**
- Camada com ponto e sufixo em camelCase do agregado: `user.service.ts`, `user.controller.ts`, `user.module.ts`, `user.entity.ts`, `user.repository.ts`, `user.mapper.ts`.
- DTO: verbo ou papel + `.dto.ts` dentro da pasta do agregado: `createUser.dto.ts`, `userQueryPaginate.dto.ts`, `shoppingPaginate.dto.ts`, `changePasswordAuth.dto.ts`.
- Enum: `<nome>.enum.ts`.
- Guard e decorator: `<papel>.guard.ts`, `<papel>.decorator.ts`. A pasta de guards é `src/guard/` (singular).
- Spec: `src/tests/<camada>/<agregado>.<controller|service>.spec.ts`. Entregador e cliente usam hífen no spec (`user-delivery.service.spec.ts`, `user-client.controller.spec.ts`) enquanto o fonte usa camelCase (`userDelivery.service.ts`).
- Exceção existente: `src/services/mailingService.ts` não usa ponto antes de `Service`. Arquivo novo de e-mail segue `mailing.service.ts` somente se o módulo e os imports forem atualizados juntos; ao editar o atual, mantenha o nome `mailingService.ts`.
- Casing da fila: o controller/service/módulo usam `deliveryqueue` minúsculo (`deliveryqueue.controller.ts`, `deliveryqueue.service.ts`, `deliveryqueue.module.ts`, classe `DeliveryqueueService`). Entity e repository usam `deliveryQueue` (`deliveryQueue.entity.ts`, `deliveryQueue.repository.ts`, classe `DeliveryQueueRepository`). `tsconfig.json` tem `forceConsistentCasingInFileNames: false`. Arquivo novo da fila copia o casing do vizinho da mesma pasta.

**Directories:**
- Pasta de camada em minúsculo plural: `controllers`, `services`, `repositories`, `entities`, `modules`, `mappers`, `dtos`, `enums`, `decorators`, `tests`.
- `guard` permanece no singular já usado.
- Subpasta de DTO repete o agregado em camelCase: `src/dtos/userDelivery/`, `src/dtos/userClient/`.
- Não crie `src/<feature>/` com controller e service juntos. A feature só ganha pasta própria em `src/dtos/`.

**Classes e símbolos:**
- PascalCase + sufixo: `UserService`, `UserController`, `UserModule`, `UserEntity`, `UserRepository`, `UserMapper`, `CreateUserDto`, `AuthGuard`, `RoleGuard`.
- Tabela MySQL no `@Entity({ name })`: minúsculo, às vezes uma palavra (`userbackoffice`, `userdelivery`, `shoppings`, `deliveryqueue`, `categoryEntity`).
- Rotas: prefixo em inglês (`user`, `shopping`, `product`, `delivery`, `deliveryqueue`) e ação em português quando o handler já é assim (`mudaSenha`, `recuperaSenha`, `validaCodigo`, `mudaSenhaDelivery`). Handler novo de um controller existente usa o idioma dos handlers vizinhos desse arquivo.
- Enum `Role` é PascalCase. `solicitacaoCompraStatus`, `modoPagamento` e `tipoCartao` são camelCase. Ao adicionar valor, preserve o nome do enum existente em vez de renomear o export.

**Imports:**
- `baseUrl` é `./` (`tsconfig.json`). Importe DTO, entity, enum, decorator e guard com prefixo `src/...`.
- O controller importa o próprio service em caminho relativo: `import { UserService } from '../services/user.service'`.
- Alias `@/` ou `paths` do TypeScript: Não detectado.
- Barrel `index.ts`: Não detectado. Importe o arquivo concreto.

## Onde adicionar código novo

**Novo agregado HTTP (exemplo: cupom):**
- Primary code:
  - `src/entities/coupon.entity.ts` — classe `@Entity`.
  - Inclua a classe no array `entities` de `TypeOrmModule.forRoot` em `src/app.module.ts` (a lista é manual).
  - `src/dtos/coupon/` — DTOs de entrada e, se a listagem for paginada, `couponQueryPaginate.dto.ts` e `couponPaginate.dto.ts` no formato `{ count, data }`.
  - `src/enums/` — só se houver conjunto fechado novo.
  - `src/repositories/coupon.repository.ts` — `@Injectable` com `@InjectRepository`.
  - `src/mappers/coupon.mapper.ts` — se a resposta não for a entity crua. Siga `toDTO` / `toListDTO` de `src/mappers/shopping.mapper.ts`.
  - `src/services/coupon.service.ts` — regra e `BadRequestException`.
  - `src/controllers/coupon.controller.ts` — `@Controller('coupon')`, `@UseGuards(RoleGuard)`, `@Roles`, `@ApiTags`, `@ApiBearerAuth('access-token')`. Rota pública leva `@Public()`.
  - `src/modules/coupon.module.ts` — `TypeOrmModule.forFeature([CouponEntity])`, controller, providers. Exporte o service se outro módulo for chamá-lo.
  - Registre `CouponModule` em `imports` de `src/app.module.ts`.
- Tests: `src/tests/controllers/coupon.controller.spec.ts` e `src/tests/services/coupon.service.spec.ts`.

**Endpoint dentro de um agregado que já existe:**
- Implementation: handler no controller existente, método no service existente, query no repository existente. Reutilize o DTO da pasta `src/dtos/<agregado>/` ou acrescente um arquivo nessa pasta.
- Papel: copie o guard já usado nesse controller (`@UseGuards(RoleGuard)` na classe em `src/controllers/user.controller.ts`). Não dependa só de `@Roles`.
- Ator da request: operador com `@User()` (`src/decorators/user.decorator.ts`); entregador com `@Delivery()` (`src/decorators/delivery.decorator.ts`); troca de senha com o usuário já carregado e papel `Role.Recover`.

**Orquestração entre agregados:**
- Implementation: o service chamador injeta o service exportado, não o repository alheio. Modelo: `DeliveryqueueModule` importa `ShoppingModule` e `UserDeliveryModule` (`src/modules/deliveryqueue.module.ts`) e `DeliveryqueueService` chama `ShoppingService` / `UserDeliveryService`.
- Exporte o service no módulo de origem antes de importar o módulo no chamador.

**Categoria, cartão ou endereço:**
- Implementation: substitua o stub em `src/services/category.service.ts`, `src/services/card.service.ts` ou `src/services/address.service.ts`. Crie o repository que falta e descomente o handler só quando a query existir. As entidades já estão em `src/entities/` e no `forRoot`.

**Utilitários:**
- Shared helpers: Não há pasta `src/common/` nem `src/shared/`. Validação de senha e hash ficam no service do agregado (`bcrypt` em `src/services/user.service.ts`). Comparação de login fica no repository desse ator.
- E-mail: estenda `src/services/mailingService.ts` e coloque o `.hbs` em `templates/`. O service já é provido e exportado por `src/modules/user.module.ts`.
- Constante de domínio pequena: `src/enums/<nome>.enum.ts`.

**Teste e2e de fluxo HTTP:**
- Implementation: spec novo em `test/`, config `test/jest-e2e.json`, comando `npm run test:e2e`. O spec unitário continua em `src/tests/`.

## Diretórios especiais

**`dist/`:**
- Purpose: JavaScript emitido pelo `nest build` (`outDir` `./dist`). Entrada de produção: `node dist/main`.
- Generated: Sim
- Committed: Não (`.gitignore` ignora `/dist`)

**`node_modules/`:**
- Purpose: Dependências npm.
- Generated: Sim (`npm install`)
- Committed: Não

**`coverage/`:**
- Purpose: Relatório de `npm run test:cov` (`coverageDirectory`: `../coverage` no Jest, relativo ao `rootDir` `src`).
- Generated: Sim
- Committed: Não

**`templates/`:**
- Purpose: Fontes Handlebars lidas em runtime pelo `MailingService`.
- Generated: Não
- Committed: Sim

**`.env`:**
- Purpose: Variáveis lidas por `dotenv` e por `process.env` (banco, JWT, SMTP, `ENV`, `CLIENT_URL`).
- Generated: Não
- Committed: Não (`.gitignore` lista `.env`)

**`src/tests/`:**
- Purpose: Suíte unitária colada ao `rootDir` do Jest. Fica de fora do build via `tsconfig.build.json` (`**/*spec.ts`).
- Generated: Não
- Committed: Sim

**`test/`:**
- Purpose: E2E isolado da suíte unitária.
- Generated: Não
- Committed: Sim

**`.planning/`:**
- Purpose: Documentos de planejamento GSD, incluindo `codebase/ARCHITECTURE.md` e `codebase/STRUCTURE.md`.
- Generated: Não (escrito pelo fluxo de mapa)
- Committed: conforme o uso do repositório de planejamento; não é código de runtime.

**`.cursor/`:**
- Purpose: Agents, skills e hooks do GSD. Não faz parte do request path da API.
- Generated: Não
- Committed: Sim, como tooling do workspace.

**Docker, CI e pasta de migrations TypeORM:**
- Purpose: Não detectado na raiz (`Dockerfile`, `docker-compose`, workflow de CI e `src/migrations` ausentes). O schema segue as entidades em `src/entities/` e o flag `synchronize` em `src/app.module.ts`.

---

*Structure analysis: 2026-10-04*
