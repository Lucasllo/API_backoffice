# Phase 3: Percurso e prova - Pattern Map

**Mapped:** 2026-10-11
**Files analyzed:** 5
**Analogs found:** 5 / 5 (1 parcial)

Esta fase não abre rota, não altera service e não instala pacote. Os arquivos abaixo são os únicos a criar ou editar. O contrato HTTP já está nos controllers e services citados como fonte de asserção, não como arquivo a modificar.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `README.md` | documentação | estático (descreve request-response) | `seed/demo.sql` (valores) e `.env.example` (subida) | partial |
| `package.json` | config | configuração | `package.json` scripts `test:e2e` e `seed` | exact |
| `scripts/apply-demo-sql.js` | utility | batch | o próprio `connect()` e `compose.yaml` (janela do healthcheck) | exact |
| `test/jest-delivery.json` | config | configuração | `test/jest-e2e.json` | role-match |
| `test/delivery-path.spec.ts` | test | request-response | `test/app.e2e-spec.ts` | role-match |

Arquivos que permanecem como estão: `test/jest-e2e.json`, `test/app.e2e-spec.ts`, `src/tests/**/*.spec.ts`, `src/controllers/auth.controller.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/services/deliveryqueue.service.ts`, `src/services/auth.service.ts`, `compose.yaml`, `seed/demo.sql`.

## Pattern Assignments

### `README.md` (documentação, estático)

**Analog:** `seed/demo.sql` linhas 1-4 e `.env.example` linhas 1-10. O `README.md` atual é o starter Nest em inglês (badges CircleCI/Coveralls do `nestjs/nest`). Esse texto sai inteiro. Não copiar a seção Test do starter nem preservar badges.

**Valores do quadro** (`seed/demo.sql` linhas 1-4):

```text
-- Demo iFarma. Copie estes valores; não há senha no .env.example.
-- Entregador: entregador.demo@example.com / Entrega1!
-- Operador: operador.demo@example.com / Entrega1! / storeCode 2312
-- Pedido: 1 / verificationCode 4821
```

O quadro do README cita só o entregador, o pedido `1` e o código `4821`. O operador fica de fora do percurso.

**Subida sem editar o exemplo** (`.env.example` linhas 1-10):

```text
# Copie este arquivo para .env. Não commite o .env.
# Os valores já batem com o compose.yaml. MySQL 8.4.11 local pode ajustar DB_*.

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=ifarma
DB_PASSWORD=ifarma
DB_DATABASE=ifarma
JWT_SECRET=demo-jwt-secret-ifarma
ENV=demo
```

O texto manda copiar `.env.example` para `.env` sem editar. Não pede troca de `DB_DATABASE`. Não escreve `JWT_SECRET` fora do que já está no exemplo. Não cola um JWT fixo.

**Comandos já existentes** (`package.json` linhas 13, 16, 20-21): `npm run start:dev`, `npm test`, `npm run test:e2e`, `npm run seed`. A porta e o Swagger vêm de `src/main.ts` linhas 25-27: `SwaggerModule.setup('api', ...)` e `await app.listen(3000)`. Uma frase, fora dos blocos, aponta `http://localhost:3000/api`.

**Ordem do texto:** Node e npm (sem inventar faixa de versão), `npm install`, copiar `.env`, MySQL (`compose.yaml` imagem `mysql:8.4.11` ou MySQL local), `npm run seed`, `npm run start:dev`. Em seguida o quadro e os quatro blocos. O README manda rodar `npm run seed` imediatamente antes dos quatro blocos. Fecha com uma seção curta: `npm run test:delivery` repete o mesmo caminho. A confirmação visível é a dos quatro blocos.

**Blocos coláveis.** No PowerShell desta máquina `curl` é alias de `Invoke-WebRequest`. Os blocos usam `curl.exe`, JSON entre aspas simples. Não há bloco `curl` pronto no repositório; este formato vem da pesquisa, não de um arquivo existente:

```powershell
curl.exe -sS -w "`nHTTP %{http_code}`n" -X POST http://localhost:3000/auth/loginDelivery -H "Content-Type: application/json" -d '{"email":"entregador.demo@example.com","password":"Entrega1!"}'
```

Os três passos seguintes repetem `-H "Authorization: Bearer TOKEN"` e pedem para colar o token do login. Rotas, nesta ordem:

1. `POST /auth/loginDelivery` — HTTP `201` e JSON com `token`.
2. `POST /deliveryqueue/1` — HTTP `201` e corpo vazio. A frase diz que a fila ficou em espera.
3. `POST /deliveryqueue/validateDelivery/1/0000` — HTTP `400` e `Dados invalidos`.
4. `POST /deliveryqueue/validateDelivery/1/4821` — HTTP `201` e corpo vazio. A frase diz que a mesma entrega ficou concluída.

`@Post` sem `@HttpCode` responde `201`, não `200`. Não documentar `GET /deliveryqueue/findByUserDelivery` (DLVY-05, fora desta fase).

---

### `package.json` (config, configuração)

**Analog:** o próprio `package.json`, scripts `test:e2e` e `seed` (linhas 20-21).

**Core pattern** (linhas 16-21):

```json
"test": "jest",
"test:watch": "jest --watch",
"test:cov": "jest --coverage",
"test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
"test:e2e": "jest --config ./test/jest-e2e.json",
"seed": "node -r dotenv/config scripts/apply-demo-sql.js"
```

O script novo entra ao lado de `test:e2e`. Copia o prefixo `-r dotenv/config` do `seed` e o `--config` do `test:e2e`. Não altera `dependencies` nem `devDependencies`. Não mexe em `test` nem em `test:e2e`.

```json
"test:delivery": "node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-delivery.json --runTestsByPath ./test/delivery-path.spec.ts --runInBand"
```

Sem `--passWithNoTests`. Sem `--forceExit` na primeira versão (D-08: só se o processo continuar preso depois de `app.close()`).

O bloco `"jest"` (linhas 70-89) permanece. `rootDir` `"src"` e `testRegex` `.*\\.spec\\.ts$` continuam coletando só `src/tests/`. O spec novo fica em `test/` de propósito, fora desse `rootDir`.

---

### `scripts/apply-demo-sql.js` (utility, batch)

**Analog:** o próprio `connect()` (linhas 5-11 e 102-133). A janela de espera vem do healthcheck de `compose.yaml` (linhas 16-21), que não se edita.

**Conjunto retry atual** (linhas 5-11 e 25-27):

```javascript
const RETRYABLE = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST',
]);

function isRetryable(err) {
  return !!(err && RETRYABLE.has(err.code));
}
```

**Loop atual** (linhas 102-132): `attempt <= 30`, intervalo `1000` ms, `throw err` quando `isRetryable` é falso. `main()` (linhas 189-192) chama `process.exit(1)` no `catch`. Por isso o spec dispara o script com `spawnSync` e não faz `require` deste arquivo.

**Healthcheck que define o novo teto** (`compose.yaml` linhas 16-21):

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uifarma", "-pifarma"]
  interval: 5s
  timeout: 5s
  retries: 20
  start_period: 30s
```

`30 + 20 * 5 = 130` segundos. Subir o limite de `30` para `130` nas duas comparações (`attempt <= 30` e `attempt < 30`). Manter o intervalo de `1000` ms. Tratar como retry também `Number(err.errno) === 1045` ou `err.code === 'ER_ACCESS_DENIED_ERROR'`. O acesso negado de CREATE DATABASE já tratado em `runPreamble` é outro caso: `errno` `1044` / `ER_DBACCESS_DENIED_ERROR` (linhas 144-146). Não misturar os dois.

Não mudar imagem, healthcheck, SQL, nem o literal `developmen`. Não acrescentar `sleep` no README. Não acrescentar `console.log` de fluxo; `console.error` em `report()` (linhas 29-38) já é o relatório de falha deste script.

---

### `test/jest-delivery.json` (config, configuração)

**Analog:** `test/jest-e2e.json` (arquivo inteiro). O `moduleNameMapper` da unidade em `package.json` linhas 86-88 não se copia literal: lá `rootDir` já é `src`.

**Config e2e a espelhar, com divergências obrigatórias** (`test/jest-e2e.json`):

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

Divergências em relação a esse arquivo:

- `rootDir` `".."` (o Jest resolve `rootDir` relativo à pasta do config; `"."` cairia em `test/` e o mapper de `src/` quebraria).
- `testRegex` só o arquivo novo: `delivery-path\\.spec\\.ts$`. Não usar `.e2e-spec.ts$` — isso faria `npm run test:e2e` coletar a entrega.
- `testTimeout` `180000`. O default do Jest 29 é `5000` ms; o seed pode esperar cerca de 130 s.
- `moduleNameMapper` apontando para a raiz do repositório, não para `<rootDir>/$1` da unidade:

```json
"moduleNameMapper": {
  "^src/(.*)$": "<rootDir>/src/$1"
}
```

O mapper da unidade (`package.json` linhas 86-88) é `"^src/(.*)$": "<rootDir>/$1"` com `rootDir` `src`. Copiar essa string para a config nova aponta para o lugar errado.

Não editar `test/jest-e2e.json`.

---

### `test/delivery-path.spec.ts` (test, request-response)

**Analog:** `test/app.e2e-spec.ts` (arquivo inteiro, 24 linhas). O harness sobe `AppModule` e chama Supertest. O restante do spec (semente, pipe, leitura do banco, `app.close()`, um único `it` com quatro POST) não existe nesse arquivo e não deve ser copiado dos specs de unidade.

**Imports e bootstrap a copiar** (`test/app.e2e-spec.ts` linhas 1-16):

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
```

**Chamada HTTP a copiar** (linhas 18-22):

```typescript
it('/ (GET)', () => {
  return request(app.getHttpServer())
    .get('/')
    .expect(200)
    .expect('Hello World!');
});
```

Trocar `.get('/')` pelos quatro `.post(...)`. Não copiar `.expect(200)` nem `'Hello World!'`. `POST` sem `@HttpCode` responde `201`. Não chamar `app.listen(3000)`.

**Divergências em relação ao e2e:**

- Primeiro import do arquivo: `import 'dotenv/config';`, no mesmo papel da linha 1 de `src/main.ts`. `AppModule` lê `process.env` na avaliação do arquivo. O script `test:delivery` também carrega dotenv; o import cobre o spec se alguém o abrir direto.
- `beforeAll`, não `beforeEach`. Um único `it` percorre login, enfileirar, `0000` e `4821`. `beforeEach` recompilaria o módulo a cada teste e perderia a linha da fila.
- `app.useGlobalPipes(new ValidationPipe());` antes de `app.init()`, igual a `src/main.ts` linha 22. O e2e atual não registra o pipe.
- `afterAll` com `await app.close()`. O e2e atual não fecha o app. Não chamar `enableShutdownHooks` para destruir o pool: `close()` já dispara o shutdown do TypeORM.
- Nome do arquivo termina em `.spec.ts`, não em `.e2e-spec.ts`. Describe pode nomear o caminho (`delivery path`); não reutilizar `'AppController (e2e)'`.

**O que não copiar** de `src/tests/controllers/deliveryqueue.controller.spec.ts` (linhas 1-19): módulo só com o controller e `useValue: {}`, asserção `should be defined`. Esse spec não abre MySQL, não manda Bearer e não prova a linha.

**Semente no filho.** Não há `spawnSync` em teste nenhum. Não fazer `require` de `scripts/apply-demo-sql.js`: `main().catch` chama `process.exit(1)` (linhas 189-192) e derruba o Jest. Disparar o mesmo script que `npm run seed` já usa, herdando `process.env`:

```typescript
import { spawnSync } from 'node:child_process';

const seeded = spawnSync(process.execPath, ['scripts/apply-demo-sql.js'], {
  stdio: 'inherit',
  env: process.env,
});
```

`seeded.status !== 0` interrompe o `beforeAll`. O estado que o SQL deixa está em `seed/demo.sql` linhas 93 e 101: `DELETE` da fila do pedido `1`, depois `INSERT` do pedido `1` com `status` `6` e `verificationCode` `'4821'`. Ao terminar o spec, o pedido fica concluído. A próxima execução semeia de novo.

**Login.** Rota e DTO, sem alterar o controller (`src/controllers/auth.controller.ts` linhas 21-26 e `src/dtos/login/login.dto.ts` linhas 4-32):

```typescript
@Post('loginDelivery')
LoginDeliveryDto(
  @Body() loginAuthDto: LoginAuthDto,
): Promise<LoginReturnDto> {
  return this.authService.loginDelivery(loginAuthDto);
}
```

Body: `email` e `password`. `storeCode` é opcional; o passo do entregador não envia. Senha da demo: `Entrega1!` (passa em `@IsStrongPassword`).

Corpo devolvido (`src/services/auth.service.ts` linhas 38-46 e 121-134): `id`, `name`, `role` e `token`. Não devolve `code`. O spec exige `token` string, `id` `1` e `role` `'4'` (`Role.Delivery` em `src/enums/role.enum.ts` linha 5). Guardar o `token` em memória para o header. Não forjar JWT.

**Fila.** Rotas já protegidas (`src/controllers/deliveryqueue.controller.ts` linhas 10-42):

```typescript
@Roles(Role.Delivery)
@UseGuards(RoleGuard)
@Controller('deliveryqueue')
// POST :idShopping  -> create(+idShopping, userDelivery.id)
// POST validateDelivery/:idShopping/:codeShopping
//   -> validateDelivery(+idShopping, verificationCode)
```

Header: `Authorization: Bearer` mais o token do login. Sem esse header o guard global responde `403`. O README não documenta esse `401`/`403`.

`create` e `validateDelivery` não têm `return` (`src/services/deliveryqueue.service.ts` linhas 17-46 e 52-78). Sucesso é HTTP `201` e corpo vazio. O spec afirma status `201` e texto vazio. Não mudar o service para devolver JSON.

Código divergente (`validateDelivery` linhas 59-61):

```typescript
if (shopping.verificationCode != verificationCode) {
  throw new BadRequestException('Dados invalidos');
}
```

A comparação usa `!=`. A mensagem permanece sem acento. O corpo HTTP padrão do Nest para essa exceção é `message` `Dados invalidos`, `error` `Bad Request`, `statusCode` `400`. O passo `0000` vem antes do `4821`. Depois do código errado a linha não muda.

Gravação do código certo (linhas 70-77): `status` da fila vira `DeliveryStatus.Finished` (`2`) na linha já carregada, e só então o pedido vai para `solicitacaoCompraStatus.Concluded` (`4`).

**Leitura entre os POST.** Nenhum spec usa `DataSource`. Não abrir segunda conexão `mysql2`. Uma conexão, a que o `AppModule` já abriu:

```typescript
import { DataSource } from 'typeorm';
import { DeliveryQueueEntity } from 'src/entities/deliveryQueue.entity';
import { ShoppingEntity } from 'src/entities/shopping.entity';

const dataSource = app.get(DataSource);
const queueRepo = dataSource.getRepository(DeliveryQueueEntity);
const shoppingRepo = dataSource.getRepository(ShoppingEntity);
const rows = await queueRepo.find({ where: { shoppingId: 1 } });
const shopping = await shoppingRepo.findOne({ where: { id: 1 } });
```

Colunas (`src/entities/deliveryQueue.entity.ts` linhas 24-39 e `src/entities/shopping.entity.ts` linhas 37-43): `status`, `userDeliveryId`, `shoppingId` na fila; `status` e `verificationCode` no pedido.

Depois de enfileirar: uma linha com `shoppingId` `1`, `userDeliveryId` `1`, `status` `1`. Guardar `id`. Pedido continua `status` `6` e `verificationCode` `'4821'`.

Depois de `0000`: o mesmo `id`, `status` `1`, pedido ainda `6` e `'4821'`.

Depois de `4821`: o mesmo `id`, `status` `2`, pedido `status` `4`.

`where` do repositório. Não concatenar o código na SQL.

## Shared Patterns

### Dotenv antes do AppModule

**Source:** `src/main.ts` linha 1 e `package.json` linha 21
**Apply to:** `package.json` (`test:delivery`) e `test/delivery-path.spec.ts` (primeiro import)

```typescript
import 'dotenv/config';
```

```json
"seed": "node -r dotenv/config scripts/apply-demo-sql.js"
```

`ConfigModule.forRoot()` roda depois da avaliação de `TypeOrmModule.forRoot`. Sem o dotenv, `DB_*` e `JWT_SECRET` chegam `undefined`.

### ValidationPipe global

**Source:** `src/main.ts` linha 22
**Apply to:** `test/delivery-path.spec.ts` (o e2e atual não registra o pipe)

```typescript
app.useGlobalPipes(new ValidationPipe());
```

Sem opções (`whitelist` e `transform` continuam desligados). O spec aplica o mesmo pipe antes de `app.init()`.

### Supertest no servidor em memória

**Source:** `test/app.e2e-spec.ts` linhas 18-22
**Apply to:** `test/delivery-path.spec.ts`

```typescript
return request(app.getHttpServer())
  .get('/')
  .expect(200)
  .expect('Hello World!');
```

Trocar o verbo, o caminho e a expectativa. Não disputar a porta `3000` com o `start:dev` do README.

### Bearer de entregador

**Source:** `src/controllers/deliveryqueue.controller.ts` linhas 10-18
**Apply to:** os três POST autenticados do spec e os três blocos do README

```typescript
@Roles(Role.Delivery)
@UseGuards(RoleGuard)
@ApiTags('Delivery Queue')
@Controller('deliveryqueue')
export class DeliveryqueueController {
  @Post(':idShopping')
  @ApiBearerAuth('access-token')
  create(
```

`POST /auth/loginDelivery` é público (`@Public()` na classe em `src/controllers/auth.controller.ts` linha 9). Os passos da fila levam o token devolvido por `loginDelivery`.

### Erro de negócio sem acento

**Source:** `src/services/deliveryqueue.service.ts` linhas 44, 56, 60 e 67
**Apply to:** README (terceiro bloco) e asserção do spec

```typescript
throw new BadRequestException('Dados invalidos');
```

Não acrescentar acento. `Shopping já usado` (linhas 36 e 41) não entra no percurso nem no spec.

### Handler sem corpo

**Source:** `src/services/deliveryqueue.service.ts` métodos `create` (linhas 17-46) e `validateDelivery` (linhas 52-78)
**Apply to:** README e spec, nos POST de enfileirar e de código `4821`

Os dois métodos gravam e não devolvem a linha. Sucesso HTTP é `201` com corpo vazio. A prova de "a mesma linha" é `Repository.find` entre os POST, não um campo da resposta.

### Isolar o Jest

**Source:** `package.json` linhas 70-88 e `test/jest-e2e.json` linha 5
**Apply to:** `test/jest-delivery.json` e o script `test:delivery`

Unidade: `rootDir` `src`, regex `.*\\.spec\\.ts$`. E2e: regex `.e2e-spec.ts$`. O spec da entrega fica fora dos dois. `--runTestsByPath` ainda exige que o caminho case com `testRegex` e esteja dentro de `roots`. O regex da config nova é o nome do arquivo, e o script repete o caminho.

### Fechar o pool

**Source:** não há `app.close()` nos specs atuais. O e2e deixa o app aberto.
**Apply to:** `afterAll` de `test/delivery-path.spec.ts`

```typescript
afterAll(async () => {
  if (app) {
    await app.close();
  }
});
```

`--forceExit` fica de fora até o comando verde não devolver o prompt depois desse `close()`.

## No Analog Found

Nenhum arquivo da fase ficou sem análogo de papel. Os comportamentos abaixo não existem no código e o plano deve seguir a pesquisa, sem inventar um segundo cliente HTTP ou uma segunda conexão MySQL:

| Comportamento | Arquivo | Role | Data Flow | Reason |
|---------------|---------|------|-----------|--------|
| `spawnSync` do seed dentro do Jest | `test/delivery-path.spec.ts` | test | batch | Nenhum spec dispara processo filho. `require` do script chama `process.exit`. |
| `app.get(DataSource)` entre POST | `test/delivery-path.spec.ts` | test | CRUD | Nenhum spec lê `deliveryqueue` ou `shoppings`. |
| `await app.close()` | `test/delivery-path.spec.ts` | test | request-response | `test/app.e2e-spec.ts` não fecha o app. |
| Blocos `curl.exe` | `README.md` | documentação | request-response | Não há cliente HTTP de exemplo no repositório. O starter documenta `npm run start`. |
| `testTimeout` 180000 e `rootDir` `".."` | `test/jest-delivery.json` | config | configuração | `test/jest-e2e.json` não declara timeout e usa `rootDir` `"."`. |

## Metadata

**Analog search scope:** `test/`, `scripts/`, `src/controllers/`, `src/services/`, `src/tests/controllers/`, `src/entities/`, `src/enums/`, `src/dtos/login/`, `seed/`, `package.json`, `compose.yaml`, `.env.example`, `README.md`
**Files scanned:** 20 paths conferidos com `git ls-files` (todos rastreados)
**Pattern extraction date:** 2026-10-11

Todos os análogos citados estão no git. Nenhum caminho veio de espelho gitignored.
