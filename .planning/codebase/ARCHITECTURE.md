<!-- refreshed: 2026-10-04 -->
# Arquitetura

**Analysis Date:** 2026-10-04

## Visão geral do sistema

API HTTP única do backoffice iFarma (documentação Swagger intitulada Colibri). Um processo NestJS atende o backoffice da loja, o entregador e a leitura de dados do cliente do app. Persistência em MySQL via TypeORM. Três tabelas de identidade convivem: `userbackoffice`, `userdelivery` e `users`.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         Borda HTTP (Express)                              │
│  `src/main.ts`  — CORS, ValidationPipe, Swagger em /api, porta 3000     │
├────────────────────┬─────────────────────────┬───────────────────────────┤
│  AuthGuard global  │  RoleGuard por rota     │  Controllers              │
│  `src/guard/`      │  `src/guard/role.guard` │  `src/controllers/`       │
│  `auth.guard.ts`   │                         │                           │
└─────────┬──────────┴────────────┬────────────┴─────────────┬─────────────┘
          │                       │                          │
          ▼                       ▼                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     Casos de uso (services)                               │
│  `src/services/`  +  mappers `src/mappers/`  +  enums `src/enums/`       │
└──────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              Repositórios customizados + TypeORM                         │
│  `src/repositories/`   →   entidades `src/entities/`   →   MySQL         │
└──────────────────────────────────────────────────────────────────────────┘
```

Módulos de composição ficam em `src/modules/` e são agregados por `src/app.module.ts`.

## Responsabilidades dos componentes

| Componente | Responsabilidade | Arquivo |
|-----------|----------------|------|
| Bootstrap | Sobe o app, pipe de validação, CORS aberto, Swagger | `src/main.ts` |
| Composição raiz | Config, TypeORM, módulos de domínio, guard global | `src/app.module.ts` |
| Auth | Login backoffice e entregador, JWT, código de recuperação | `src/modules/auth.module.ts`, `src/services/auth.service.ts`, `src/controllers/auth.controller.ts` |
| Usuário backoffice | Cadastro, listagem por loja, autorização, papel, senha, exclusão lógica | `src/modules/user.module.ts`, `src/services/user.service.ts`, `src/controllers/user.controller.ts` |
| Entregador | Cadastro público, perfil, troca de senha com papel Recover | `src/modules/userDelivery.module.ts`, `src/services/userDelivery.service.ts`, `src/controllers/userDelivery.controller.ts` |
| Cliente do app | Telefone do cliente para o entregador | `src/modules/userClient.module.ts`, `src/services/userClient.service.ts`, `src/controllers/userClient.controller.ts` |
| Pedido | Lista paginada, detalhe, troca de status | `src/modules/shopping.module.ts`, `src/services/shopping.service.ts`, `src/controllers/shopping.controller.ts` |
| Produto | Itens de um pedido | `src/modules/product.module.ts`, `src/services/product.service.ts`, `src/controllers/product.controller.ts` |
| Fila de entrega | Vincular pedido ao entregador, listar, validar código | `src/modules/deliveryqueue.module.ts`, `src/services/deliveryqueue.service.ts`, `src/controllers/deliveryqueue.controller.ts` |
| Categoria, cartão, endereço | Módulos registrados; handlers HTTP comentados; serviços ainda no stub do CLI | `src/modules/category.module.ts`, `src/modules/card.module.ts`, `src/modules/address.module.ts` |
| E-mail | Nodemailer + templates Handlebars | `src/services/mailingService.ts`, `templates/` |
| Papéis | `User`, `Admin`, `Recover`, `Delivery`, `Master` | `src/enums/role.enum.ts` |

## Visão geral do padrão

**Overall:** Monólito modular NestJS em camadas horizontais (controller → service → repository → entity), com um módulo Nest por agregado.

**Key Characteristics:**
- Cada agregado de negócio tem um `@Module` em `src/modules/` que declara controller, service, repository, mapper e `TypeOrmModule.forFeature`.
- O controller só traduz HTTP. A regra fica no service. O acesso ao banco fica num repository `@Injectable` que encapsula `Repository<Entity>` do TypeORM. O projeto não estende `Repository` com `@EntityRepository`.
- Autenticação é JWT stateless. `AuthGuard` é global (`APP_GUARD` em `src/app.module.ts`). Autorização por papel é opt-in via `@UseGuards(RoleGuard)` + `@Roles`.
- Três atores no mesmo processo: operador de loja (`UserEntity`, tabela `userbackoffice`), entregador (`UserDeliveryEntity`, tabela `userdelivery`) e cliente do aplicativo (`UserClientEntity`, tabela `users`, somente leitura neste backoffice).
- Listagens paginadas entram por `POST` com body (`take`, `skip`, `orderBy`, `storeCode`), não por query string.
- Pastas são por papel técnico (`controllers`, `services`, `repositories`), não por feature. A exceção é `src/dtos/<agregado>/`.

## Camadas

**Borda HTTP:**
- Purpose: Criar a aplicação Express, validar body e expor OpenAPI.
- Location: `src/main.ts`
- Contains: `bootstrap()`, `ValidationPipe` global, `app.enableCors()`, Swagger em `api`, `app.listen(3000)`.
- Depends on: `AppModule` (`src/app.module.ts`), `dotenv`.
- Used by: processo Node (`npm run start`, `start:dev`, `start:prod`).

**Módulos Nest:**
- Purpose: Ligar controller, providers e repositório TypeORM de um agregado e exportar o service quando outro módulo precisa dele.
- Location: `src/modules/`
- Contains: `*.module.ts`.
- Depends on: services, controllers, entities, `@nestjs/typeorm`.
- Used by: `src/app.module.ts`.

Exports atuais: `UserModule` exporta `UserService` e `MailingService`; `UserDeliveryModule` exporta `UserDeliveryService`; `ShoppingModule` exporta `ShoppingService`; `AuthModule` exporta um `JwtModule`.

**Controllers:**
- Purpose: Declarar rota, DTO de entrada, papel exigido e delegar ao service.
- Location: `src/controllers/`
- Contains: classes `@Controller`.
- Depends on: services, DTOs, decorators, `RoleGuard`.
- Used by: roteador HTTP do Nest.

**Services:**
- Purpose: Regra de negócio, hash de senha no cadastro, orquestração entre agregados, tradução de erro de persistência em `BadRequestException`.
- Location: `src/services/`
- Contains: classes `@Injectable`.
- Depends on: repositories, mappers, outros services exportados, `bcrypt` no cadastro.
- Used by: controllers e `AuthGuard`.

**Mappers:**
- Purpose: Copiar campos entre entity e DTO (`toDTO`, `toEntity`, `toListDTO`, `toListEntity`).
- Location: `src/mappers/`
- Contains: `UserMapper`, `UserPermissionMapper`, `ProductMapper`, `ShoppingMapper`.
- Depends on: DTOs e entities.
- Used by: services. Registrados em `providers` do módulo mesmo sem `@Injectable()`.

**Repositories:**
- Purpose: Queries TypeORM do agregado. Login com `bcrypt.compare` mora aqui em `UserRepository` e `UserDeliveryRepository`.
- Location: `src/repositories/`
- Contains: classes `@Injectable` com `@InjectRepository`.
- Depends on: `Repository<T>` do TypeORM.
- Used by: services do mesmo agregado.

Agregados sem repository: categoria, cartão e endereço (`src/services/category.service.ts`, `src/services/card.service.ts`, `src/services/address.service.ts`).

**Entidades e banco:**
- Purpose: Mapa objeto-relacional e grafo de pedidos.
- Location: `src/entities/`
- Contains: classes `@Entity`.
- Depends on: `typeorm`, enums em `src/enums/`.
- Used by: `TypeOrmModule.forRoot` em `src/app.module.ts` (lista explícita, sem glob) e `forFeature` de cada módulo.

Grafo persistido:

- `ShoppingEntity` (`shoppings`) possui muitos `ProductEntity` (`product`) e pertence a um `UserClientEntity` (`users`) pela coluna `userEntityId`.
- `ProductEntity` pertence a `CategoryEntity` (`categoryEntity`) e a `ShoppingEntity`.
- `UserClientEntity` possui muitos `AddressEntity` (`address`) e `CardEntity` (`cards`).
- `DeliveryQueueEntity` (`deliveryqueue`) aponta para um `UserDeliveryEntity` e para um `ShoppingEntity` (`OneToOne`).
- Status do pedido: `solicitacaoCompraStatus` em `src/enums/solicitacaoCompraStatus.enum.ts` (`Created` = 1 até `OrderAtTheDeliveryPoint` = 8).
- Status da fila: `DeliveryStatus` em `src/enums/deliveryStatus.enum.ts` (`Waiting` = 1, `Finished` = 2).
- Pagamento: `modoPagamento` em `src/enums/modoPagamento.enum.ts`. Tipo de cartão: `tipoCartao` em `src/enums/tipoCartao.enum.ts`.

**Guards e decorators:**
- Purpose: Autenticar o Bearer JWT e autorizar o papel; injetar o ator da request.
- Location: `src/guard/`, `src/decorators/`
- Contains: `AuthGuard`, `RoleGuard`, `@Public`, `@Roles`, `@User`, `@Delivery`, `@PasswordCode`.
- Depends on: `AuthService.checkToken`, `UserService.findOne`, `UserDeliveryService.findOne`, `Reflector`.
- Used by: pipeline HTTP global e controllers que declaram `@UseGuards(RoleGuard)`.

## Fluxo de dados

### Caminho principal da requisição

Listagem de usuários do backoffice (`POST /user/findAll`), papel `Admin`.

1. `bootstrap()` sobe o Nest e aplica `ValidationPipe` (`src/main.ts:9-29`). O body precisa satisfazer `UserQueryPaginateDto`.
2. `AuthGuard.canActivate` (`src/guard/auth.guard.ts:17-46`) lê `Authorization: Bearer`, chama `AuthService.checkToken`, faz `JSON.parse` do `sub` e, no ramo de usuário de loja, grava `request.user` com `UserService.findOne`.
3. `RoleGuard` (`src/guard/role.guard.ts:11-39`), aplicado em `UserController` (`src/controllers/user.controller.ts:24`), compara `request.user.role` com `@Roles(Role.Admin)` do handler `findAll` (`src/controllers/user.controller.ts:36-40`).
4. `UserController` delega a `UserService.findAll` (`src/services/user.service.ts:51-64`).
5. `UserRepository.findAll` (`src/repositories/user.repository.ts:98-115`) executa `findAndCount` filtrando `storeCode` e `active: true`, com `take`/`skip` default 10/0.
6. `UserPermissionMapper.toListDTO` (`src/mappers/userPermission.mapper.ts:39-48`) monta `UserPaginateDto` (`count` + `data`) e o Nest serializa o retorno em JSON.

```typescript
@Post('findAll')
@Roles(Role.Admin)
@ApiBearerAuth('access-token')
findOne(@Body() query: UserQueryPaginateDto) {
  return this.userService.findAll(query);
}
```

O mesmo encadeamento vale para `POST /shopping` (`src/controllers/shopping.controller.ts:24-28` → `ShoppingService.findAll` → `ShoppingRepository.findAll` com relation `userClientEntity` → `ShoppingMapper`).

### Login e formato do JWT

1. `POST /auth/login` é `@Public()` na classe `AuthController` (`src/controllers/auth.controller.ts:9-18`).
2. `AuthService.login` (`src/services/auth.service.ts:26-36`) chama `UserService.login` → `UserRepository.login`, que exige `authorized: true`, `active: true`, `email` e `storeCode`, e compara a senha com bcrypt (`src/repositories/user.repository.ts:165-183`).
3. `createToken` assina o JWT com `issuer` `login`, `audience` `user` e `expiresIn` `'7 days'`. O `sub` é uma string JSON, não um id cru (`src/services/auth.service.ts:105-118`):

```typescript
subject: JSON.stringify({
  user: String(id),
}),
```

4. `POST /auth/loginDelivery` usa o mesmo DTO `LoginAuthDto` e grava `{ userDelivery }` no `sub` (`src/services/auth.service.ts:121-134`). `AuthGuard` então preenche `request.userDelivery`.
5. Recuperação: `POST /auth/recuperaSenha` gera código de 4 dígitos e persiste em `validCode`. `POST /auth/validaCodigo/:codigo` emite JWT cujo `sub` contém `codeRecover` e `user`, com `expiresIn` `'1 day'` (`src/services/auth.service.ts:149-165`). `RoleGuard` trata `request.codeRecover` como papel `Role.Recover` e libera `POST /user/mudaSenha`.
6. O módulo JWT em `src/modules/auth.module.ts` registra `signOptions.expiresIn: '12h'`. Os tokens emitidos por `AuthService` sobrescrevem isso no `jwtService.sign`.

O entregador autenticado entra nas rotas de `src/controllers/deliveryqueue.controller.ts` (`@Roles(Role.Delivery)` na classe) e lê o ator com `@Delivery()`.

### Fila de entrega

1. `POST /deliveryqueue/:idShopping` (`src/controllers/deliveryqueue.controller.ts:17-24`) chama `DeliveryqueueService.create` (`src/services/deliveryqueue.service.ts:17-37`).
2. O service carrega o pedido via `ShoppingService.findOne` e o entregador via `UserDeliveryService.findOne`. Se `DeliveryQueueRepository.findByShopping` volta vazio, grava `DeliveryQueueEntity` com `DeliveryStatus.Waiting`.
3. `GET /deliveryqueue/findByUserDelivery` devolve as filas do entregador com relation `shoppingEntity` (`src/repositories/deliveryQueue.repository.ts:17-24`).
4. `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` compara `shopping.verificationCode`, grava uma `DeliveryQueueEntity` com `DeliveryStatus.Finished` e chama `ShoppingService.updateStatus(solicitacaoCompraStatus.Concluded, shopping.id)` (`src/services/deliveryqueue.service.ts:43-61`).
5. `PATCH /shopping/updateStatus/:codeShopping/:codeStatus` (`src/controllers/shopping.controller.ts:38-46`) aceita `Admin`, `User` e `Delivery` e persiste o enum numérico em `ShoppingRepository.updateStatus`.

### Cadastro

1. `POST /user/create` é `@Public()` (`src/controllers/user.controller.ts:30-34`). `UserService.create` exige senha igual à confirmação, faz `bcrypt.hash`, força `Role.User` e chama `UserRepository.create`.
2. `UserRepository.create` reativa o registro se o e-mail já existe com `active: false` na mesma `storeCode`; se já está ativo, lança `BadRequestException` (`src/repositories/user.repository.ts:22-37`).
3. `POST /delivery/create` segue o mesmo desenho em `UserDeliveryService.create`, rota pública em `src/controllers/userDelivery.controller.ts:19-23`.

**State Management:**
- A API é stateless entre requests. O estado de autenticação viaja no JWT.
- Durante a request, `AuthGuard` pendura `request.user`, `request.userDelivery` ou `request.codeRecover`. `@User()`, `@Delivery()` e `@PasswordCode` leem esses campos (`src/decorators/user.decorator.ts`, `src/decorators/delivery.decorator.ts`, `src/decorators/passwordCode.decorator.ts`).
- A fonte de verdade é o MySQL. Não há cache, sessão de servidor nem broker.
- `synchronize` do TypeORM só liga quando `process.env.ENV === 'developmen'` (`src/app.module.ts:47`). O schema em outros valores de `ENV` fica a cargo do banco já existente.
- `ConfigModule.forRoot()` está importado em `src/app.module.ts`, e `dotenv.config()` roda em `src/main.ts`. Os providers leem `process.env` direto. `ConfigService` não é injetado.

## Abstrações principais

**Módulo de agregado:**
- Purpose: Unidade de wiring Nest de um recurso HTTP.
- Examples: `src/modules/user.module.ts`, `src/modules/shopping.module.ts`, `src/modules/deliveryqueue.module.ts`
- Pattern: `@Module` com `TypeOrmModule.forFeature([Entidade])`, um controller, service, repository e mapper quando a resposta difere da tabela. Exporte o service se outro módulo orquestra esse agregado (`ShoppingModule`, `UserDeliveryModule`, `UserModule`).

**Repository de domínio:**
- Purpose: Isolar `Repository<Entity>` e devolver entidades ou `{ data, count }`.
- Examples: `src/repositories/user.repository.ts`, `src/repositories/shopping.repository.ts`, `src/repositories/deliveryQueue.repository.ts`
- Pattern: `@Injectable` + `@InjectRepository(Entidade)`. Métodos públicos `create`, `findById`, `findAll`, `save`. Paginação usa `findAndCount`.

**Mapper manual:**
- Purpose: Contrato de saída sem decorators TypeORM.
- Examples: `src/mappers/userPermission.mapper.ts`, `src/mappers/shopping.mapper.ts`, `src/mappers/product.mapper.ts`
- Pattern: classe com `toDTO` / `toListDTO`. Instancie o DTO com `new` e copie campo a campo. Retorne `null` quando a entity é `null`.

**DTO de entrada e de página:**
- Purpose: Validar body com `class-validator` e documentar com `@ApiProperty`.
- Examples: `src/dtos/user/createUser.dto.ts`, `src/dtos/login/login.dto.ts`, `src/dtos/shopping/shoppingPaginate.dto.ts`, `src/dtos/user/userPaginate.dto.ts`
- Pattern: classe com decorators. Página é `{ count: number; data: T[] }`.

**Papel no metadata:**
- Purpose: Declarar quem pode chamar o handler.
- Examples: `src/decorators/roles.decorator.ts`, `src/decorators/public.decorator.ts`, `src/enums/role.enum.ts`
- Pattern: `@Public()` pula `AuthGuard` e `RoleGuard`. `@Roles(Role.Admin, Role.User)` só tem efeito com `@UseGuards(RoleGuard)` no controller ou no handler. `Role` é enum de string (`'1'` … `'5'`).

**Token com assunto JSON:**
- Purpose: Distinguir operador, entregador e fluxo de troca de senha no mesmo segredo JWT.
- Examples: `src/services/auth.service.ts` (`createToken`, `createTokenDelivery`, `createTokenRecoverPassword`), leitura em `src/guard/auth.guard.ts:31-42`
- Pattern: `sub` stringificado. Chaves possíveis: `user`, `userDelivery`, `codeRecover`. `AuthGuard` escolhe o service de carga conforme a chave presente.

## Pontos de entrada

**Processo HTTP:**
- Location: `src/main.ts`
- Triggers: `npm run start`, `npm run start:dev`, `npm run start:prod` (`node dist/main` em `package.json`).
- Responsibilities: `NestFactory.create(AppModule)`, pipe global, CORS, Swagger, escuta na porta 3000.

**Módulo raiz:**
- Location: `src/app.module.ts`
- Triggers: importado por `src/main.ts` e por `test/app.e2e-spec.ts`.
- Responsibilities: `ConfigModule.forRoot`, `TypeOrmModule.forRoot` (MySQL, entidades listadas), import dos dez módulos de domínio, `APP_GUARD` → `AuthGuard`.

**Swagger:**
- Location: `src/main.ts:10-27`
- Triggers: `GET /api` depois do listen.
- Responsibilities: título "Documentação com Swagger - Colibri", bearer `access-token`. Controllers marcam o esquema com `@ApiBearerAuth('access-token')` e `@ApiTags`.

**Suíte e2e:**
- Location: `test/app.e2e-spec.ts`
- Triggers: `npm run test:e2e` (`test/jest-e2e.json`).
- Responsibilities: sobe `AppModule` com Supertest. O spec espera `GET /` com corpo `Hello World!`. Não existe `AppController` em `src/`.

Prefixo global de rota: Não se aplica. Os controllers montam `auth`, `user`, `delivery`, `userClient`, `shopping`, `product`, `deliveryqueue`, `category`, `card`, `address` na raiz do host.

## Restrições arquiteturais

- **Threading:** Event loop único do Node.js. Não há worker threads, filas Bull/Redis nem `@nestjs/microservices`. A "fila" de entrega é a tabela `deliveryqueue`, lida e escrita na request.
- **Global state:** `process.env` lido no bootstrap e nos construtores (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `ENV`, `JWT_SECRET` em `src/app.module.ts` e `src/modules/auth.module.ts`; `MAIL_HOST`, `MAIL_PORT`, `MAILER_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`, `CLIENT_URL` em `src/services/mailingService.ts`). Singletons de DI: `MailingService.transporter`, campos `issuer`/`audience` de `AuthService`. Arquivo `.env` presente na raiz (gitignored). Não ler nem versionar o conteúdo.
- **Circular imports:** Ciclo de valor entre entidades que se referenciam no topo do arquivo e de novo no callback da relação: `src/entities/shopping.entity.ts` ↔ `src/entities/product.entity.ts`; `shopping.entity.ts` ↔ `src/entities/deliveryQueue.entity.ts`; `shopping.entity.ts` ↔ `src/entities/userClient.entity.ts`; `product.entity.ts` ↔ `src/entities/category.entity.ts`; `userClient.entity.ts` ↔ `src/entities/address.entity.ts`; `userClient.entity.ts` ↔ `src/entities/card.entity.ts`; `src/entities/userDelivery.entity.ts` ↔ `deliveryQueue.entity.ts`. O callback `() => Entidade` do TypeORM adia a resolução da relação. Não há `forwardRef` entre módulos. `AuthModule` importa `UserModule` e `UserDeliveryModule`; esses dois não importam `AuthModule`.
- **Instância de AuthService:** `AuthService` está em `providers` de `src/app.module.ts` (consumido pelo `AuthGuard`) e de novo em `providers` de `src/modules/auth.module.ts` (consumido pelo `AuthController`). São dois providers de módulo. `JwtModule.register` também aparece duas vezes em `src/modules/auth.module.ts` (import e export).
- **Guard de papel não é global:** Só `AuthGuard` usa `APP_GUARD`. `@Roles` sem `@UseGuards(RoleGuard)` não consulta o papel. `src/controllers/product.controller.ts` declara `@Roles` e não declara `RoleGuard`.
- **CORS:** `app.enableCors()` sem origem restrita (`src/main.ts:25`).
- **Validação de params:** `ValidationPipe` global usa o default do Nest (`transform` desligado). Controllers convertem id de rota com `+id` / `Number`.
- **Exclusão de usuário:** `UserRepository.delete` põe `active: false` (`src/repositories/user.repository.ts:186-190`). Não usa `@DeleteDateColumn`.
- **Logging estruturado:** Não detectado. Nenhum `Logger` do Nest em `src/`.
- **Filtro de exceção, interceptor e middleware próprios:** Não detectado.
- **WebSocket, GraphQL, cache, fila de mensagens:** Não detectado.

## Anti-padrões

### `@Roles` sem `RoleGuard`

**O que acontece:** `ProductController` anota `@Roles(Role.Admin, Role.User)` em `findByShopping` (`src/controllers/product.controller.ts:17-18`) e não aplica `@UseGuards(RoleGuard)`.
**Por que está errado:** `RoleGuard` só roda onde é declarado. O metadata `roles` fica sem leitor. O `AuthGuard` global continua exigindo JWT, e qualquer papel autenticado passa.
**Faça isto:** Copie o par de `UserController`: `@UseGuards(RoleGuard)` na classe e `@Roles(...)` no handler (`src/controllers/user.controller.ts:24-37`).

### Service scaffold do CLI ainda registrado

**O que acontece:** `CategoryService`, `CardService` e `AddressService` devolvem a string `This action returns...`. Os handlers em `src/controllers/category.controller.ts`, `src/controllers/card.controller.ts` e `src/controllers/address.controller.ts` estão comentados. Os módulos seguem importados em `src/app.module.ts`.
**Por que está errado:** O módulo ocupa o grafo de DI e as entidades entram no `forRoot`, mas não há repositório nem rota ativa. Quem estender o stub publica uma rota que não fala com o MySQL.
**Faça isto:** Ao abrir o recurso, crie repository em `src/repositories/`, injete com `TypeOrmModule.forFeature` no módulo da feature (modelo: `src/modules/product.module.ts`) e apague o retorno de string. Mantenha a rota comentada até o repository existir.

### Fronteira de saída misturada

**O que acontece:** `UserService.findAll` devolve `UserPaginateDto` via mapper. `UserService.findbyId` e `ShoppingService.findOne` devolvem a entity do repository (`src/services/user.service.ts:112-114`, `src/services/shopping.service.ts:30-32`). `UserMapper.toDTO` copia `password` (`src/mappers/user.mapper.ts:5-20`).
**Por que está errado:** O cliente HTTP recebe ora DTO, ora colunas da tabela, inclusive o hash quando o mapper de usuário é usado na criação (`UserService.create`).
**Faça isto:** Resposta HTTP passa por `toDTO`/`toListDTO`. Liste no DTO de resposta só os campos públicos. `UserPermissionMapper` (`src/mappers/userPermission.mapper.ts`) é o modelo da listagem: não inclui senha.

### Orquestração que grava no agregado errado

**O que acontece:** `AuthService.recoverPasswordDelivery` gera o código e chama `this.userservice.setValidCode` (`src/services/auth.service.ts:76-89`), isto é, `UserRepository` / tabela `userbackoffice`, enquanto o usuário carregado veio de `UserDeliveryService.recoverPassword`. `DeliveryqueueService.validateDelivery` faz `new DeliveryQueueEntity()` e `save` sem carregar a fila daquele `shoppingId` (`src/services/deliveryqueue.service.ts:51-54`).
**Por que está errado:** O código de recuperação do entregador não segue o repository de `userdelivery`. A validação da entrega insere outra linha em `deliveryqueue` em vez de atualizar a linha `Waiting`.
**Faça isto:** Código de entregador persiste com `UserDeliveryService.setValidCode` (`src/services/userDelivery.service.ts`). Conclusão da entrega carrega a fila com `DeliveryQueueRepository.findByShopping` e altera `status` dessa instância antes do `save`.

### `AuthService` e `JwtModule` declarados duas vezes

**O que acontece:** `src/app.module.ts:66` lista `AuthService` em `providers` além de importar `AuthModule`, que também provê `AuthService`. `src/modules/auth.module.ts` chama `JwtModule.register` no `imports` e de novo no `exports`.
**Por que está errado:** O guard e o controller não compartilham, por construção do grafo, o mesmo provider de `AuthService`. O registro duplicado do JWT fixa o segredo em dois `JwtModule`.
**Faça isto:** Deixe `AuthService` somente em `AuthModule`, exporte `AuthService` e exporte o mesmo `JwtModule` importado (`exports: [JwtModule, AuthService]`). O `AuthGuard` no `AppModule` resolve `AuthService` pelo export.

## Tratamento de erros

**Strategy:** Exceções HTTP do Nest sobem até o filtro padrão do framework. Não há `@Catch` próprio. `AuthGuard`, no `catch`, retorna `false` em vez de lançar (`src/guard/auth.guard.ts:44-46`), então token ausente, inválido ou usuário inexistente cai na negação do guard.

**Patterns:**
- Entrada inválida de DTO: `ValidationPipe` global em `src/main.ts:24` responde 400 no formato padrão do Nest.
- Regra de negócio e dado inconsistente: `throw new BadRequestException('...')` no service ou no repository (`src/services/user.service.ts`, `src/services/shopping.service.ts`, `src/services/deliveryqueue.service.ts`, `src/repositories/user.repository.ts`, `src/repositories/userClient.repository.ts`).
- Credencial rejeitada: `UnauthorizedException` em `UserRepository.login` e `UserDeliveryRepository.login`.
- Service que chama repository costuma embrulhar o erro: `throw new BadRequestException(error.message)` (`src/services/user.service.ts:46-47`). A mensagem interna vira o corpo HTTP.
- Ator ausente no decorator de parâmetro: `BadRequestException` com texto fixo em `src/decorators/user.decorator.ts`, `src/decorators/delivery.decorator.ts` e `src/decorators/passwordCode.decorator.ts`.
- `MailingService.sendUserConfirmation` e `sendRecoverPassword` existem (`src/services/mailingService.ts:45-64`). Os fluxos `recoverPassword` e `recoverPasswordDelivery` deixam a chamada comentada (`src/services/auth.service.ts:59-60` e `88-89`). Falha de SMTP nesses fluxos: Não se aplica enquanto a chamada permanecer comentada.

## Preocupações transversais

**Logging:** Não detectado. Inclua `Logger` do `@nestjs/common` no service se uma fase precisar de rastreio. Não use `console` espalhado; o código atual não loga.

**Validation:** `class-validator` nos DTOs de `src/dtos/` mais `ValidationPipe` global. Senha forte via `@IsStrongPassword` em `src/dtos/login/login.dto.ts` e `src/dtos/user/user.dto.ts`. Confirmação de senha é comparação manual no service (`createUserDto.password != createUserDto.confirmPassword`), não um validator de classe. Documentação do body: `@ApiProperty` do `@nestjs/swagger`.

**Authentication:** JWT com `@nestjs/jwt` e segredo `JWT_SECRET`. Extração do header em `AuthService`/`AuthGuard`: esquema `Bearer`. Rotas abertas levam `@Public()` (`IS_PUBLIC_KEY` em `src/decorators/public.decorator.ts`): classe inteira de `AuthController`, `POST /user/create`, `POST /delivery/create`. Papéis aplicados hoje: `Admin` na gestão de usuários; `Admin` e `User` em pedidos e no `GET /user/me`; `Delivery` na fila, no telefone do cliente e no `GET /delivery/me`; `Recover` na troca de senha; `Delivery` também entra em `PATCH /shopping/updateStatus`. `Role.Master` existe no enum e não é aceito por `UserService.changeRoleUser`, que só grava `Admin` ou `User` (`src/services/user.service.ts:74-88`). Hash de senha: `bcrypt` no create do service e no compare do repository.

---

*Architecture analysis: 2026-10-04*
