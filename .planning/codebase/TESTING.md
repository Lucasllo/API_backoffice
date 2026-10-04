<!-- refreshed: 2026-10-04 -->
# Padrões de Teste

**Analysis Date:** 2026-10-04

## Framework de Teste

**Runner:**

- Jest 29 (`jest` `^29.5.0`) com `ts-jest` `^29.1.0` e `@nestjs/testing` `^10.0.0`.
- Configuração de unidade embutida na chave `"jest"` de `package.json`. Não há `jest.config.js` nem `vitest.config.*`.
- E2E separado em `test/jest-e2e.json`.

**Biblioteca de Asserção:**

- `expect` do Jest (`@types/jest` `^29.5.2`). Sem Chai, sem Supertest nos specs de unidade.
- E2E importa `supertest` (`^6.3.3`) como `import * as request from 'supertest'` em `test/app.e2e-spec.ts`.

**Comandos:**

```bash
npm run test              # jest — specs unitários
npm run test:watch        # jest --watch
npm run test:cov          # jest --coverage
npm run test:debug        # node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand
npm run test:e2e          # jest --config ./test/jest-e2e.json
```

Os mesmos comandos estão documentados na seção Test de `README.md` (texto padrão do starter Nest).

Configuração efetiva de unidade (`package.json`):

```json
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "src",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" },
  "collectCoverageFrom": ["**/*.(t|j)s"],
  "coverageDirectory": "../coverage",
  "testEnvironment": "node"
}
```

`rootDir` é `src`, então o regex também pega `src/tests/**/*.spec.ts`. `tsconfig.build.json` exclui `**/*spec.ts` e a pasta `test` do build de produção.

E2E (`test/jest-e2e.json`): `rootDir` `"."`, `testRegex` `.e2e-spec.ts$`, `testEnvironment` `node`, o mesmo transform `ts-jest`. Sem `moduleNameMapper`. O alias `src/...` não é reescrito pelo Jest; specs de unidade importam por caminho relativo e por isso compilam sob `rootDir: src`.

## Organização dos Arquivos de Teste

**Local:**

- Specs de unidade ficam fora da pasta da classe, em duas pastas:
  - `src/tests/services/`
  - `src/tests/controllers/`
- E2E fica em `test/`, na raiz do repositório, não dentro de `src/`.
- Não há specs de `src/repositories/`, `src/mappers/`, `src/guard/`, `src/decorators/`, `src/dtos/` nem `src/modules/`.

**Nomenclatura:**

- Unidade: `<dominio>.service.spec.ts` e `<dominio>.controller.spec.ts`.
- Kebab-case só nestes quatro arquivos (a classe de produção permanece camelCase):
  - `src/tests/services/user-client.service.spec.ts`
  - `src/tests/controllers/user-client.controller.spec.ts`
  - `src/tests/services/user-delivery.service.spec.ts`
  - `src/tests/controllers/user-delivery.controller.spec.ts`
- E2E: `test/app.e2e-spec.ts` (`*.e2e-spec.ts`).
- `describe` usa o nome da classe: `'UserService'`, `'ShoppingController'`, `'DeliveryqueueService'`.

**Estrutura:**

```
src/tests/
├── controllers/
│   ├── address.controller.spec.ts
│   ├── app.controller.spec.ts
│   ├── auth.controller.spec.ts
│   ├── card.controller.spec.ts
│   ├── category.controller.spec.ts
│   ├── deliveryqueue.controller.spec.ts
│   ├── product.controller.spec.ts
│   ├── shopping.controller.spec.ts
│   ├── user.controller.spec.ts
│   ├── user-client.controller.spec.ts
│   └── user-delivery.controller.spec.ts
└── services/
    ├── address.service.spec.ts
    ├── auth.service.spec.ts
    ├── card.service.spec.ts
    ├── category.service.spec.ts
    ├── deliveryqueue.service.spec.ts
    ├── product.service.spec.ts
    ├── shopping.service.spec.ts
    ├── user.service.spec.ts
    ├── user-client.service.spec.ts
    └── user-delivery.service.spec.ts
test/
├── app.e2e-spec.ts
└── jest-e2e.json
```

`src/tests/controllers/app.controller.spec.ts` importa `../controllers/app.controller` e `../services/app.service`. Esses módulos não existem (o caminho relativo também aponta para `src/tests/`, não para `src/controllers/`). `test/app.e2e-spec.ts` sobe `AppModule` e espera `GET /` com corpo `Hello World!`; `src/app.module.ts` registra `controllers: []` e não há `AppController`. Trate os dois como scaffold do CLI, não como suíte do domínio. Spec novo de controller ou service entra em `src/tests/...` com import `../../controllers/...` ou `../../services/...`, no formato de `src/tests/controllers/user.controller.spec.ts`.

## Estrutura dos Testes

**Organização da Suíte:**

O spec real de service (`src/tests/services/user.service.spec.ts`):

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../services/user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

O spec real de controller (`src/tests/controllers/shopping.controller.spec.ts`):

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingController } from '../../controllers/shopping.controller';
import { ShoppingService } from '../../services/shopping.service';

describe('ShoppingController', () => {
  let controller: ShoppingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoppingController],
      providers: [ShoppingService],
    }).compile();

    controller = module.get<ShoppingController>(ShoppingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
```

Único spec com asserção de comportamento (`src/tests/controllers/app.controller.spec.ts`), apontando para classes ausentes:

```typescript
describe('root', () => {
  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });
});
```

**Padrões:**

- Um `describe` por classe. `beforeEach` assíncrono chama `Test.createTestingModule(...).compile()` e `module.get<Tipo>(Tipo)`.
- Sem `afterEach`, sem `afterAll`, sem `beforeAll`.
- O único `it` dos specs de domínio é `it('should be defined', () => { expect(service).toBeDefined(); })` (controller usa a variável `controller`). Título em inglês, herdado do schematic do Nest.
- Service spec lista só a classe sob teste em `providers`. Controller spec lista o controller em `controllers` e o service concreto em `providers`, sem `overrideProvider`.
- Isso só compila quando o service não tem construtor com dependência. `CategoryService`, `CardService` e `AddressService` são stubs sem `constructor` (`src/services/category.service.ts`). `UserService`, `AuthService`, `ProductService`, `ShoppingService`, `DeliveryqueueService`, `UserClientService` e `UserDeliveryService` exigem repositório, mapper ou outro service; o `compile()` desses specs falha por provider ausente.
- Teste novo de regra de negócio mantém `describe` + `beforeEach` + `TestingModule`, e substitui o `it('should be defined')` por um `it` por caminho (sucesso e `BadRequestException` / `UnauthorizedException`).

## Mocks

**Framework:** Jest (global `jest` no ambiente do ESLint em `.eslintrc.js`). Nenhum arquivo de `src/` ou `test/` chama `jest.fn`, `jest.spyOn`, `jest.mock` ou `useValue`.

**Padrões:**

Não detectado no repositório. O scaffold passa a classe real:

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [UserService],
}).compile();
```

Para um service que recebe repositório e mapper, o spec novo registra double com `useValue` e obtém a classe real com `module.get`. Exemplo alinhado ao construtor de `src/services/user.service.ts`:

```typescript
const userRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
};
const userMapper = {
  toDTO: jest.fn(),
  toListDTO: jest.fn(),
};
const mailingService = { sendUserConfirmation: jest.fn() };
const userPermissionMapper = { toListDTO: jest.fn() };

const module: TestingModule = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: UserRepository, useValue: userRepository },
    { provide: UserMapper, useValue: userMapper },
    { provide: MailingService, useValue: mailingService },
    { provide: UserPermissionMapper, useValue: userPermissionMapper },
  ],
}).compile();
```

`UserMapper` não tem `@Injectable()` (`src/mappers/user.mapper.ts`), mas o token de provider continua sendo a classe.

**O que mockar:**

- `*Repository` (`src/repositories/user.repository.ts` e equivalentes). O spec de service não abre MySQL.
- `MailingService` (`src/services/mailingService.ts`), `JwtService` e `bcrypt` quando o caso de uso os chama (`src/services/auth.service.ts`, `src/services/user.service.ts`).
- No spec de controller, o `*Service` inteiro com `useValue`. O handler só repassa argumentos (`src/controllers/user.controller.ts`).

**O que não mockar:**

- A classe sob teste (`UserService` no spec de `UserService`, `UserController` no spec de `UserController`).
- DTOs, enums e mappers puros quando o teste é do próprio mapper: instancie `new UserMapper()` e chame `toDTO` / `toListDTO` sem `TestingModule`, porque o mapper não tem dependência.
- `ValidationPipe` e o guard global. Isso pertence ao e2e, não ao spec de service.

## Fixtures e Factories

**Dados de Teste:**

Não detectado. Não há pasta `fixtures/`, factory nem builder.

Monte o objeto no próprio `it`, com as propriedades que o método lê. Para `UserService.create`, o DTO precisa de `password`, `confirmPassword`, `storeCode`, `name` e `email` (`src/services/user.service.ts` e `src/dtos/user/createUser.dto.ts`). Para paginação, `take`, `skip`, `storeCode` e `orderBy` opcional (`src/dtos/user/userQueryPaginate.dto.ts`).

Entidade de retorno do repositório mockado segue os campos de `src/entities/user.entity.ts` (`id`, `email`, `name`, `password`, `phoneNumber`, `role`, `storeCode`, `active`, `authorized`).

**Local:**

- Não detectado. Dados ficam dentro do spec em `src/tests/services/` ou `src/tests/controllers/`.

## Cobertura

**Requisitos:** Não há `coverageThreshold` em `package.json` nem em `test/jest-e2e.json`. Nenhum percentual é exigido no CI (pipeline de CI não detectado neste repositório).

`collectCoverageFrom` é `**/*.(t|j)s` com `rootDir` `src`. Isso inclui `src/tests/**/*.spec.ts` na coleta, além de `src/main.ts` e dos stubs CLI.

**Ver cobertura:**

```bash
npm run test:cov
```

Relatório em `coverage/` (irmão de `src/`, porque `coverageDirectory` é `../coverage`).

## Tipos de Teste

**Testes Unitários:**

- Escopo atual: “a classe existe no container de teste”.
- Arquivos: os 21 `*.spec.ts` em `src/tests/`.
- Não exercitam `BadRequestException`, paginação, bcrypt, JWT nem mapper.
- Ao adicionar comportamento, cubra o método público do service com repositório mockado. Casos mínimos do domínio já codificado:
  - senha diferente de confirmação → `BadRequestException` (`src/services/user.service.ts`, `src/services/userDelivery.service.ts`)
  - papel fora de `Role.Admin` e `Role.User` → `BadRequestException('Papel invalido!')`
  - shopping já vinculado à fila → `BadRequestException('Shopping já usado')` (`src/services/deliveryqueue.service.ts`)
  - lista paginada devolve `count` e `data` mapeados (`src/services/shopping.service.ts`)

**Testes de Integração:**

- Não detectado. Nenhum spec importa `TypeOrmModule`, sobe MySQL nem usa banco em memória.

**Testes E2E:**

- Ferramenta: Jest + Supertest, um arquivo: `test/app.e2e-spec.ts`.
- Sobe `AppModule` inteiro (`src/app.module.ts`), que abre conexão TypeORM com `process.env.DB_HOST` e aplica `AuthGuard` global. O `beforeEach` não chama `app.close()`.
- O `it` pede `GET /` → 200 e corpo `Hello World!`, rota que este `AppModule` não declara.
- E2E novo de uma rota real usa o prefixo já existente (`user`, `auth`, `shopping`) e o header `Authorization: Bearer <token>` nas rotas com `@ApiBearerAuth('access-token')`. Rota com `@Public()` (`POST /auth/login`, `POST /user/create`) não envia bearer. Arquivo novo: `test/<recurso>.e2e-spec.ts`, para casar com `.e2e-spec.ts$`.

## Padrões Comuns

**Teste Assíncrono:**

O único async presente é o `beforeEach` do `TestingModule`. Métodos de produção são `async`; o `it` novo espera a Promise:

```typescript
it('rejects when passwords differ', async () => {
  await expect(
    service.create({
      ...dto,
      password: 'Abcdef1!',
      confirmPassword: 'Outra1!',
    }),
  ).rejects.toBeInstanceOf(BadRequestException);
});
```

Para o caminho feliz, `await` no método e `expect` no `count` / `data` do `*PaginateDto`, ou no DTO devolvido por `toDTO`.

E2E existente devolve a cadeia do Supertest sem `async`:

```typescript
it('/ (GET)', () => {
  return request(app.getHttpServer())
    .get('/')
    .expect(200)
    .expect('Hello World!');
});
```

**Teste de Erro:**

Não detectado. Não há `rejects`, `toThrow` nem `expect(...).toBeInstanceOf(BadRequestException)` em spec algum.

Quando o service lança mensagem fixa, asserta a mensagem junto:

```typescript
await expect(service.findByShopping(1)).rejects.toThrow('Pedido invalido.');
```

Mensagens reais para copiar: `'Senha e confirma senha diferentes'`, `'Senha invalida'`, `'Papel invalido!'`, `'Pedido invalido.'`, `'Compra/Status invalido.'`, `'Dados invalidos'`, `'Shopping já usado'`, `'Usuario invalido'`, `'Usuario não encontrado'` (`src/services/user.service.ts`, `src/services/product.service.ts`, `src/services/shopping.service.ts`, `src/services/deliveryqueue.service.ts`, `src/services/auth.service.ts`).

Login inválido nasce como `UnauthorizedException` com `'Email e/ou senha incorretos.'` em `src/repositories/user.repository.ts`. Spec de repositório (ainda inexistente) mocka `Repository<UserEntity>` do TypeORM, não a classe `UserRepository` inteira, e compara senha via `bcrypt.compare` mockado.

---

*Testing analysis: 2026-10-04*
