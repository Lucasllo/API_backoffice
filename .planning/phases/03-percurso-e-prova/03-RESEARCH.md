# Phase 3: Percurso e prova - Research

**Researched:** 2026-10-11
**Domain:** README em português do percurso HTTP e um comando Jest que prova só login, fila, código errado e código `4821`
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

- Citar `GET /deliveryqueue/findByUserDelivery` no README para a pessoa ver `Waiting` e `Finished` na resposta. A discussão manteve os quatro POST. Isso continua em `DLVY-05` (v2).
- WR-01 (o SQL ignora `DB_DATABASE`) e WR-02 (`validCode` `0`). Não travam o percurso com `.env.example` intacto.
- `DLVY-06`, `DLVY-07` e `DLVY-08`: dono da confirmação, segunda confirmação e `userClientEntity` nula. Fora deste roadmap.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENV-01 | Quem clona o repositório segue um README em português e sobe a API até confirmar a entrega do pedido semeado | Substituir o README do starter. Quatro blocos `curl.exe` na ordem login, `POST /deliveryqueue/1`, código `0000`, código `4821`. Antes disso: Node, `npm install`, copiar `.env.example` sem editar, MySQL, `npm run seed`, `npm run start:dev` na porta `3000`. WR-04 alonga a espera do seed para a pessoa semear logo depois do Compose. |
| TEST-01 | Um comando Jest prova só esse caminho: login do entregador, fila persistida, código certo conclui a mesma linha e o pedido, código errado não conclui | `npm run test:delivery` com config própria, `--runTestsByPath` em `test/delivery-path.spec.ts` e `--runInBand`. O spec semeia de novo, sobe `AppModule` em processo e lê a mesma linha em `deliveryqueue`. Não entra em `npm test` nem em `npm run test:e2e`. |
</phase_requirements>

## Summary

A fase não abre rota, não muda o service da fila e não instala pacote. O caminho HTTP já existe. O que falta é o texto que a pessoa cola, a espera do `npm run seed` cobrindo o healthcheck do Compose, e um Jest que executa só esse caminho contra o MySQL do `.env`.

Os quatro POST devolvem status do Nest, não `200` por padrão. `POST` sem `@HttpCode` responde `201`. Login devolve JSON com `token`. Enfileirar e confirmar não dão `return`, então o corpo vai vazio. O código `0000` responde `400` com `message` `Dados invalidos` e não grava. O código `4821` grava `Finished` (`2`) na linha já carregada e só então marca o pedido `Concluded` (`4`). O spec tem de ler o banco entre os passos, porque o HTTP de sucesso não traz a linha.

**Primary recommendation:** Trocar `README.md` pelo percurso em português; em `scripts/apply-demo-sql.js`, esperar até 130 segundos e tratar acesso negado transitório; acrescentar `test/jest-delivery.json`, `test/delivery-path.spec.ts` e o script `test:delivery` com `--runTestsByPath` e `--runInBand`, sem `--forceExit` até um hang depois de `app.close()`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Ensinar o clone a subir a demo | CDN / Static | — | O contrato é o `README.md`. Não há tela. |
| Esperar o MySQL do Compose ficar aceitável | Database / Storage | API / Backend | A janela mora no healthcheck de `compose.yaml`. Quem espera é `scripts/apply-demo-sql.js`, chamado por `npm run seed`. |
| Quatro passos HTTP da entrega | API / Backend | Database / Storage | As rotas já estão nos controllers. A pessoa fala com o processo na porta `3000`. |
| Provar o mesmo caminho | API / Backend | Database / Storage | Jest sobe `AppModule` no processo, via Supertest, e lê `deliveryqueue` e `shoppings` pela conexão que o TypeORM já abriu. |
| Isolar o comando dos outros Jest | API / Backend | — | A seleção de arquivo é config do Jest. Não é regra de negócio. |

## Project Constraints (from .cursor/rules/)

- Documentação deste repositório em português do Brasil. Identificadores, rotas, comandos e chaves permanecem em inglês.
- `README.md` entra nessa regra. Esta fase substitui o texto inteiro do starter.
- Sem pacote novo no `package.json`. Sem `console.log` em service, repositório ou guard.
- Não acrescentar bloco de código comentado. Não abrir `/** */` em método novo.
- Mensagens HTTP existentes permanecem. `Dados invalidos` e `Shopping já usado` não ganham acento nesta fase.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | 29.7.0 | Roda só o spec da entrega | Já é o runner de `npm test`. A CLI instalada tem `--runTestsByPath` e `--runInBand`. |
| ts-jest | 29.1.2 | Transforma o spec TypeScript | Já está no transform de `package.json` e de `test/jest-e2e.json`. |
| `@nestjs/testing` | 10.3.8 | Sobe `AppModule` sem escutar a porta `3000` | O e2e existente já usa `Test.createTestingModule`. |
| supertest | 6.3.4 | Chama os quatro POST no servidor em memória | Já importado em `test/app.e2e-spec.ts`. |
| `@nestjs/typeorm` | 10.0.2 | Fecha o `DataSource` no `app.close()` | `onApplicationShutdown` chama `dataSource.destroy()`. |
| typeorm | 0.3.20 | Lê a linha da fila e o pedido dentro do spec | Token de injeção padrão é a classe `DataSource`. |
| mysql2 | 3.9.7 | Driver que o seed e o TypeORM já usam | O spec não abre outra conexão. |
| dotenv | 16.4.5 | Carrega `.env` antes do `AppModule` avaliar `process.env` | `npm run seed` já usa `node -r dotenv/config`. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nestjs/common` | 10.3.8 | Status `201` e `400` | Só para o spec aplicar o mesmo `ValidationPipe` de `src/main.ts`. |
| `@nestjs/core` | 10.3.8 | `app.close()` dispara o hook que destrói o pool | Não chamar `enableShutdownHooks` para isso. |
| express | 4.19.2 | `res.send()` sem argumento quando o handler não retorna | Explica o corpo vazio do `201`. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Config Jest nova `test/jest-delivery.json` | Reusar `test/jest-e2e.json` | O `testRegex` `.e2e-spec.ts$` faria `npm run test:e2e` executar o spec novo. D-07 deixa esse comando como está. |
| `--runTestsByPath` | Argumento posicional do Jest | O argumento posicional vira regex. No Windows, barra invertida quebra o padrão. `--runTestsByPath` resolve o caminho. |
| Ler a fila pelo `Repository` do app | Segunda conexão `mysql2` no spec | Outra conexão é outro handle para o Jest não sair. `app.close()` só destrói o pool do Nest. |
| `curl.exe` nos blocos | `curl` no PowerShell | Nesta máquina `curl` é alias de `Invoke-WebRequest`. `curl.exe` é o binário em `C:\WINDOWS\system32\curl.exe`. |

**Installation:**

```bash
# Nenhum pacote. Não alterar dependencies nem devDependencies.
```

**Version verification:** versões lidas de `node_modules/<pacote>/package.json` nesta sessão. Não publicar pacote novo.

## Package Legitimacy Audit

Esta fase não instala pacote. O gate de legitimidade não se aplica.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
Pessoa
  |  copia .env.example -> .env (sem editar)
  |  docker compose up -d
  v
compose.yaml  mysql:8.4.11
  |  healthcheck: start_period 30s, interval 5s, retries 20
  v
npm run seed
  scripts/apply-demo-sql.js
  |  ate 130 tentativas, 1s
  |  DELETE + INSERT do pedido 1, sem linha em deliveryqueue
  v
npm run start:dev
  src/main.ts  dotenv, ValidationPipe, listen 3000
  |
  |  1. POST /auth/loginDelivery                         -> 201 { token }
  |  2. POST /deliveryqueue/1                            -> 201 corpo vazio, fila Waiting
  |  3. POST /deliveryqueue/validateDelivery/1/0000      -> 400 Dados invalidos
  |  4. POST /deliveryqueue/validateDelivery/1/4821      -> 201 corpo vazio
  v
MySQL ifarma
  deliveryqueue.id estavel, status 1 depois 2
  shoppings.id 1, status 6 depois 4

npm run test:delivery
  |  node -r dotenv/config
  |  jest --config test/jest-delivery.json
  |       --runTestsByPath test/delivery-path.spec.ts --runInBand
  |  spawn do mesmo apply-demo-sql.js
  |  AppModule.init() sem listen(3000)
  |  Supertest na mesma ordem dos quatro POST
  |  Repository.find entre os POST
  |  app.close() -> DataSource.destroy()
  v
processo Jest encerra (sem --forceExit, salvo hang observado)
```

### Recommended Project Structure

```text
README.md                         # substitui o starter; unico texto do percurso
package.json                      # script test:delivery ao lado de test:e2e
scripts/apply-demo-sql.js         # WR-04: 130 tentativas e acesso negado
test/jest-delivery.json           # config que so este comando usa
test/delivery-path.spec.ts        # unico arquivo citado por test:delivery
test/jest-e2e.json                # nao editar
test/app.e2e-spec.ts              # nao editar
src/tests/**/*.spec.ts            # continuam so no npm test
```

O spec fica em `test/`, fora do `rootDir` `src`. O nome termina em `.spec.ts`, não em `.e2e-spec.ts`. `tsconfig.build.json` já exclui a pasta `test` e `**/*spec.ts`.

### Pattern 1: Config Jest que nenhum outro script coleta

**What:** `test/jest-e2e.json` tem `rootDir` `"."`. O Jest resolve `rootDir` relativo ao diretório do arquivo de config. `--showConfig` nesta máquina mostrou `rootDir` `...\api_ifarma\test` e o `testRegex` `.e2e-spec.ts$`. O Jest de `package.json` tem `rootDir` `...\api_ifarma\src` e `testRegex` `.*\.spec\.ts$`.
**When to use:** O spec da entrega precisa de `moduleNameMapper` para `src/...` e não pode casar com os dois regex atuais.
**Example:**

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": "..",
  "testEnvironment": "node",
  "testRegex": "delivery-path\\.spec\\.ts$",
  "testTimeout": 180000,
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/src/$1"
  }
}
```

`rootDir` `".."` a partir de `test/jest-delivery.json` cai na raiz do repositório. O mapper da unidade usa `"<rootDir>/$1"` porque o `rootDir` de lá já é `src`. Copiar esse mapper para cá aponta para o lugar errado.

O script cita o arquivo:

```json
"test:delivery": "node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-delivery.json --runTestsByPath ./test/delivery-path.spec.ts --runInBand"
```

`--runTestsByPath` ainda exige que o caminho esteja dentro de `roots` e case com `testRegex`. Por isso o regex da config nova é o nome desse arquivo, e o script repete o caminho. Não acrescentar `--passWithNoTests`: caminho errado tem de falhar, não passar com zero testes. Não acrescentar `--forceExit` na primeira versão.

### Pattern 2: Spec no processo, semente no filho

**What:** `TypeOrmModule.forRoot` em `src/app.module.ts` lê `process.env.DB_*` na avaliação do arquivo, não dentro de factory. `src/main.ts` carrega `import 'dotenv/config'` antes do `AppModule`. O spec não passa por `main.ts`.
**When to use:** `npm run test:delivery` e o primeiro import do spec.
**Example:**

```typescript
import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { spawnSync } from 'node:child_process';
import { AppModule } from '../src/app.module';

describe('delivery path', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const seeded = spawnSync(process.execPath, ['scripts/apply-demo-sql.js'], {
      stdio: 'inherit',
      env: process.env,
    });
    if (seeded.status !== 0) {
      throw new Error('npm run seed falhou');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
```

`spawnSync` herda o `.env` que o `-r dotenv/config` já colocou em `process.env`. Não dar `require` em `scripts/apply-demo-sql.js`: o `main()` chama `process.exit(1)` e derruba o Jest. Não usar `app.listen(3000)`. A porta `3000` fica para o `start:dev` do README. Um único `it` percorre os quatro POST na ordem do README e guarda o `id` da fila.

### Pattern 3: Blocos do README com curl.exe

**What:** No PowerShell desta máquina, `curl` é alias de `Invoke-WebRequest`. `curl.exe` é o cliente HTTP.
**When to use:** Os quatro blocos coláveis. JSON entre aspas simples, que o PowerShell repassa literal ao executável. O mesmo bloco vale no Git Bash.
**Example:**

```powershell
curl.exe -sS -w "`nHTTP %{http_code}`n" -X POST http://localhost:3000/auth/loginDelivery -H "Content-Type: application/json" -d '{"email":"entregador.demo@example.com","password":"Entrega1!"}'
```

O texto ao lado do bloco diz: HTTP `201` e um JSON com `token`. Os três passos seguintes repetem `-H "Authorization: Bearer TOKEN"` com a frase para colar o token. Enfileirar e o código `4821`: HTTP `201` e corpo vazio. Código `0000`: HTTP `400` e `Dados invalidos`. Uma frase, fora dos blocos, aponta `http://localhost:3000/api`.

### Anti-Patterns to Avoid

- **Nomear o arquivo `*.e2e-spec.ts`:** `npm run test:e2e` passa a executar a entrega e o Hello World. D-07 não mexe nesse comando.
- **Colocar o spec em `src/tests/`:** `npm test` coleta `.*\.spec\.ts$` debaixo de `src` e tenta abrir MySQL na suíte de unidade.
- **Provar a fila só pelo HTTP:** `create` e `validateDelivery` não devolvem a linha. Sem leitura do banco, "a mesma linha" não fica provada.
- **Incluir o segundo `POST /deliveryqueue/1`:** `Shopping já usado` é DLVY-02, já fechado. TEST-01 lista login, fila, código certo e código errado.
- **`--forceExit` preventivo:** D-08 só aceita o flag depois de `app.close()` deixar o processo preso.
- **Pedir para alterar `DB_DATABASE`:** WR-01 continua aberto. O SQL usa o database `ifarma`. O `.env.example` já diz `ifarma`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Esperar o MySQL | `sleep` no README ou loop novo | Alongar o loop que já está em `scripts/apply-demo-sql.js` | O script já distingue erro transitório de erro fatal e usa o `mysql2` instalado. |
| Reaplicar a semente no teste | SQL copiado dentro do spec | `spawnSync` de `scripts/apply-demo-sql.js` | A semente idempotente já apaga a fila do pedido `1` e reinsere o pedido. |
| Selecionar um spec | Runner próprio ou `--testPathPattern` solto | `--runTestsByPath` mais `testRegex` do arquivo | Argumento posicional é regex. `--passWithNoTests` esconde arquivo ausente. |
| Fechar o pool | `process.exit` no spec | `await app.close()` | O `close()` do Nest 10.3.8 chama `onApplicationShutdown`, e o TypeORM 10.0.2 destrói o `DataSource`. |
| Cliente HTTP no spec | `curl` disparado pelo Jest | Supertest no `app.getHttpServer()` | Não disputa a porta `3000` com o README. |
| Corpo da fila no README | Rota nova ou GET da v2 | Frase de espera e de conclusão, mais o status HTTP | DLVY-05 ficou de fora. Os métodos não retornam a linha. |

**Key insight:** O HTTP de sucesso é mudo. A prova da mesma linha é uma leitura TypeORM entre os POST, no mesmo processo que vai fechar o pool.

## Common Pitfalls

### Pitfall 1: `npm run test:e2e` engole o spec novo
**What goes wrong:** O comando da entrega e o Hello World rodam juntos. O Hello World continua vermelho e a entrega passa a depender do MySQL dentro de `test:e2e`.
**Why it happens:** `test/jest-e2e.json` usa `testRegex` `.e2e-spec.ts$` com `rootDir` na pasta `test`.
**How to avoid:** Arquivo `test/delivery-path.spec.ts` e config `test/jest-delivery.json`. Não editar `test/jest-e2e.json` nem `test/app.e2e-spec.ts`.
**Warning signs:** `npm run test:e2e` lista dois arquivos.

### Pitfall 2: `AppModule` sobe sem `DB_*`
**What goes wrong:** TypeORM recebe host `undefined` e o spec falha antes do login.
**Why it happens:** `src/app.module.ts` lê `process.env` na hora do import. `ConfigModule.forRoot()` roda depois.
**How to avoid:** `node -r dotenv/config` no script e `import 'dotenv/config'` como primeiro import do spec.
**Warning signs:** `ECONNREFUSED` ou database vazio com `.env` presente na raiz.

### Pitfall 3: `beforeAll` estoura em 5 segundos
**What goes wrong:** O seed legítimo, ainda tentando o MySQL, mata o spec.
**Why it happens:** O schema do Jest 29.7.0 traz `testTimeout` `5000`. O WR-04 pode dormir até cerca de 130 segundos.
**How to avoid:** `"testTimeout": 180000` na config da entrega.
**Warning signs:** falha `Exceeded timeout of 5000 ms for a hook` com o Compose ainda em `start_period`.

### Pitfall 4: O README documenta HTTP `200`
**What goes wrong:** A pessoa vê `201` e acha que errou o passo.
**Why it happens:** Os três handlers são `@Post` sem `@HttpCode`. O Nest 10.3.8 usa `201` para `POST`.
**How to avoid:** Os blocos e o spec afirmam `201` no login, no enfileirar e no código `4821`. O `400` fica só no código `0000`.
**Warning signs:** corpo de login com `token` e status `201`, não `200`.

### Pitfall 5: Código errado depois do certo
**What goes wrong:** O spec vê a fila já `Finished` e não prova que o código divergente deixou de concluir.
**Why it happens:** A comparação do código acontece antes do `save`, mas o pedido já foi concluído por um passo anterior.
**How to avoid:** A ordem do `it` é a do README: login, enfileirar, `0000`, `4821`.
**Warning signs:** o `id` da fila muda, ou o status do pedido vai a `4` antes do `0000`.

### Pitfall 6: `curl` no PowerShell
**What goes wrong:** O bloco colado vira `Invoke-WebRequest` e os flags `-X`, `-H` e `-d` não montam o POST.
**Why it happens:** O alias `curl` do PowerShell aponta para `Invoke-WebRequest`.
**How to avoid:** Escrever `curl.exe`. JSON em aspas simples.
**Warning signs:** erro de parâmetro do PowerShell em vez de HTTP `201`.

### Pitfall 7: `--forceExit` esconde handle
**What goes wrong:** O comando fica verde com pool ou transporte ainda aberto, e o próximo hang volta sem pista.
**Why it happens:** O flag chama `exit` assim que os testes acabam.
**How to avoid:** Primeiro `await app.close()`. Só então, se o processo não sair, acrescentar `--forceExit` no script.
**Warning signs:** Jest imprime o aviso de open handles depois dos testes verdes, ou o `npm run test:delivery` não devolve o prompt.

### Pitfall 8: Seed curto demais para o Compose
**What goes wrong:** Quem segue o README, sobe o Compose e semeia em seguida toma `ECONNREFUSED` ou `ER_ACCESS_DENIED_ERROR` e desiste.
**Why it happens:** O loop atual para em 30 tentativas de 1 segundo. O healthcheck espera `start_period` de 30s mais 20 vezes 5s. Acesso negado nem entra no conjunto retry.
**How to avoid:** `MAX_ATTEMPTS` `130` e tratar `errno` `1045` / `ER_ACCESS_DENIED_ERROR` como retry. O README não pede `sleep`.
**Warning signs:** `npm run seed` sai em cerca de 30s com o container ainda em health `starting`.

## Code Examples

Valores lidos nesta sessão. O spec compara estes literais.

Comentário da semente (`seed/demo.sql`):

```text
-- Demo iFarma. Copie estes valores; não há senha no .env.example.
-- Entregador: entregador.demo@example.com / Entrega1!
-- Operador: operador.demo@example.com / Entrega1! / storeCode 2312
-- Pedido: 1 / verificationCode 4821
```

Pedido semeado, status `6`, código `4821`, sem fila antes do POST:

```sql
INSERT INTO `shoppings` (`id`, `storeAddress`, `deliveryAddress`, `deliveryTime`, `duration`, `status`, `verificationCode`, `storeCode`, `value`, `modoPagamento`, `userEntityId`) VALUES (1, 'Rua das Acácias, 100', 'Rua do Comércio, 50', '30 min', '15 min', 6, '4821', '2312', '42.00', 1, 1);
```

O `DELETE` da fila do pedido `1` está na mesma transação, antes desse `INSERT`.

Enums persistidos:

```typescript
export enum DeliveryStatus {
  Waiting = 1,
  Finished = 2,
}

export enum solicitacaoCompraStatus {
  Created = 1,
  Accepted = 2,
  Refused = 3,
  Concluded = 4,
  SeparateRequest = 5,
  WaitingMotoboy = 6,
  OrderOnTheWay = 7,
  OrderAtTheDeliveryPoint = 8,
}
```

Papel do entregador no JWT e na tabela: `Role.Delivery = '4'`. O `INSERT` de `userdelivery` grava `role` `'4'`.

### Status HTTP que o README e o spec afirmam

`RouterResponseController.getStatusByMethod` no `@nestjs/core` 10.3.8:

```javascript
getStatusByMethod(requestMethod) {
    switch (requestMethod) {
        case common_1.RequestMethod.POST:
            return common_1.HttpStatus.CREATED;
        default:
            return common_1.HttpStatus.OK;
    }
}
```

`HttpStatus.CREATED = 201`. Nenhum handler deste caminho declara `@HttpCode`.

`create` e `validateDelivery` não retornam valor. O adapter Express chama `response.send()` quando o corpo é nil. `res.send` sem argumento termina a resposta com chunk `undefined`. O spec afirma status `201` e texto vazio. O README diz sucesso sem corpo.

`BadRequestException('Dados invalidos')` monta o corpo assim no `@nestjs/common` 10.3.8 (`createBody` com string):

```javascript
return {
    message: arg0,
    error: arg1,
    statusCode: statusCode,
};
```

`arg1` padrão de `BadRequestException` é `'Bad Request'`. `HttpStatus.BAD_REQUEST = 400`. O corpo do código `0000` é:

```json
{
  "message": "Dados invalidos",
  "error": "Bad Request",
  "statusCode": 400
}
```

Login (`loginDelivery`) devolve `id`, `name`, `role` e `token`. Não devolve `code`. O quadro do README pede para a pessoa reconhecer `token`. O spec exige `token` string, `id` `1` e `role` `'4'`.

### O que o spec lê no banco

Depois do enfileirar, uma linha com `shoppingId` `1`, `userDeliveryId` `1`, `status` `1`. Guardar `id`. O pedido continua `status` `6` e `verificationCode` `'4821'`.

Depois do `0000`, o mesmo `id`, o mesmo `status` `1`, pedido ainda `6` e `'4821'`.

Depois do `4821`, o mesmo `id`, `status` `2`, pedido `status` `4`.

```typescript
const dataSource = app.get(DataSource);
const queueRepo = dataSource.getRepository(DeliveryQueueEntity);
const shoppingRepo = dataSource.getRepository(ShoppingEntity);
const rows = await queueRepo.find({ where: { shoppingId: 1 } });
const shopping = await shoppingRepo.findOne({ where: { id: 1 } });
```

O token padrão do TypeORM no Nest, sem nome de conexão, é a classe `DataSource`. `getDataSourceToken('default')` devolve essa classe. Uma conexão só.

### Fechar o processo

`NestApplicationContext.close` no `@nestjs/core` 10.3.8:

```javascript
async close(signal) {
    await this.callDestroyHook();
    await this.callBeforeShutdownHook(signal);
    await this.dispose();
    await this.callShutdownHook(signal);
    this.unsubscribeFromProcessSignals();
}
```

`enableShutdownHooks` só registra sinais do processo. O `close()` já chama o shutdown hook. `TypeOrmCoreModule.onApplicationShutdown` faz `await dataSource.destroy()` quando `dataSource.isInitialized`.

`--forceExit` na CLI do Jest 29.7.0: "Force Jest to exit after all tests have completed running. This is useful when resources set up by test code cannot be adequately cleaned up." Fica de fora até esse sintoma aparecer depois do `close()`.

### WR-04 no seed

Hoje o loop para em `attempt <= 30` e `isRetryable` só aceita o conjunto `ECONNREFUSED`, `ETIMEDOUT`, `ENOTFOUND`, `ECONNRESET`, `PROTOCOL_CONNECTION_LOST`.

`compose.yaml`:

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uifarma", "-pifarma"]
  interval: 5s
  timeout: 5s
  retries: 20
  start_period: 30s
```

`30 + 20 * 5 = 130` segundos. Subir `MAX_ATTEMPTS` para `130`, manter o intervalo de `1000` ms, e tratar como retry `Number(err.errno) === 1045` ou `err.code === 'ER_ACCESS_DENIED_ERROR'`. Não mudar a imagem, o healthcheck nem o literal `developmen`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| README do starter Nest, em inglês, com badges do upstream | README do percurso, em português | Esta fase | ENV-01 |
| `npm test` e `npm run test:e2e` como únicos Jest | `npm run test:delivery` cita um arquivo | Esta fase | TEST-01 |
| Seed desiste por volta de 30s | Espera alinhada ao healthcheck | Esta fase, WR-04 | Quem semeia logo após o Compose |

**Deprecated/outdated:**

- O texto atual de `README.md` (badges CircleCI/Coveralls do `nestjs/nest`) sai inteiro. Não preservar a seção Test do starter.
- A pesquisa antiga do marco, que apontava `test/delivery-confirm.e2e-spec.ts` dentro de `test/jest-e2e.json`, ficou para trás de D-07. Esse nome faria `npm run test:e2e` coletar o arquivo.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | O `201` sem corpo chega no Supertest com `res.text` igual a `''`. | Code Examples | O spec aperta a asserção demais. Ajustar a asserção para corpo vazio. Não mudar o service para devolver JSON. |
| A2 | Bloco `curl.exe` com JSON em aspas simples cola no PowerShell e no Git Bash. `cmd.exe` não foi o alvo. | Pattern 3 | Quem cola no `cmd.exe` manda aspas simples no JSON e toma `400` de validação. O README pode ganhar uma frase dizendo PowerShell ou Git Bash. |

## Open Questions (RESOLVED)

1. **`--forceExit` entra ou não?** — RESOLVED
   - What we know: `app.close()` chama `dataSource.destroy()`. O flag existe na CLI 29.7.0. D-08 proíbe colocá-lo antes do sintoma.
   - Resolution: D-08. O script nasce sem `--forceExit`. O flag entra somente nesse script se, depois de `app.close()`, `npm run test:delivery` não devolver o prompt com os testes verdes. A dúvida sobre o transporter do `MailingService` ou um timer do `mysql2` não muda o procedimento: só o sintoma observado depois do `close()` autoriza o flag.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | API, Jest, seed | ✓ | v24.5.0 | — |
| npm | scripts | ✓ | 11.9.0 | — |
| Docker | Compose da demo | ✓ | 29.8.0 | MySQL local que já aceite os `DB_*` do exemplo |
| Docker Compose | `compose.yaml` | ✓ | v5.5.1 | MySQL local na mesma condição |
| curl.exe | Blocos do README | ✓ | `C:\WINDOWS\system32\curl.exe` | — |
| MySQL aceitando conexão | Seed e spec | não medido nesta sessão | imagem `mysql:8.4.11` no Compose | `docker compose up -d` na execução |

O repositório não declara `engines`. O README pede Node.js e npm instalados, sem inventar faixa de versão.

**Missing dependencies with no fallback:**

- Nenhuma ferramenta de build. MySQL em si não foi sondado; a execução sobe o Compose ou usa um servidor que já combine com `.env.example`.

**Missing dependencies with fallback:**

- Nenhuma.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Login já existente. O spec manda `Entrega1!` para `POST /auth/loginDelivery`. Não forjar JWT. Não escrever `JWT_SECRET` no README. O exemplo continua `demo-jwt-secret-ifarma` no `.env.example`. |
| V3 Session Management | yes | JWT stateless de 7 dias, já emitido por `createTokenDelivery`. O spec guarda o `token` em memória e não cria sessão. |
| V4 Access Control | yes | `AuthGuard` global e `@Roles(Role.Delivery)` com `RoleGuard`. O spec usa o Bearer do login. Guard que retorna `false` continua `403`. O README não documenta um `401` para header ausente. |
| V5 Input Validation | yes | `ValidationPipe` global em `src/main.ts`. O spec aplica o mesmo pipe. `verificationCode` segue comparado em memória. Leitura do spec usa `where` do repositório, sem concatenar o código na SQL. |
| V6 Cryptography | yes | A senha em claro fica no comentário do seed e no quadro do README. O `INSERT` continua com o hash bcrypt. Não gerar outro hash e não logar senha nem token. |

Nível ASVS do projeto: 1. `security_block_on` é `high`. Esta fase não abre superfície nova.

### Known Threat Patterns for NestJS + MySQL da demo

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Spec com SQL concatenada | Tampering | `Repository.find` / `findOne` com `where`. |
| `.env` apontando para banco que não é a demo | Tampering | O README manda copiar `.env.example` sem editar. O seed apaga os ids `1`. Não documentar outro `DB_DATABASE`. |
| Token no README | Information disclosure | O bloco mostra o campo `token` da resposta ao vivo. Não colar um JWT fixo no markdown. |
| Código `0000` revelar se o pedido existe | Information disclosure | A mensagem continua só `Dados invalidos`, já usada para pedido ausente, código divergente e fila que não tem uma linha. |
| Segundo pool no teste | Denial of service (local) | Uma conexão, fechada por `app.close()`. |

## Sources

### Primary (HIGH confidence)

- `seed/demo.sql` linhas 1-4 e o `INSERT` do pedido `1` — quadro do README e estado inicial
- `src/controllers/auth.controller.ts` — `POST auth/loginDelivery`
- `src/controllers/deliveryqueue.controller.ts` — `POST :idShopping` e `POST validateDelivery/:idShopping/:codeShopping`
- `src/services/deliveryqueue.service.ts` — `Waiting`, `Dados invalidos`, `Finished`, `Concluded`, sem `return`
- `src/services/auth.service.ts` — corpo do login do entregador: `id`, `name`, `role`, `token`
- `src/enums/deliveryStatus.enum.ts`, `src/enums/solicitacaoCompraStatus.enum.ts`, `src/enums/role.enum.ts` — valores numéricos e `'4'`
- `src/app.module.ts` — `process.env` na avaliação do `TypeOrmModule.forRoot`; `synchronize` só com `developmen`
- `src/main.ts` — `import 'dotenv/config'`, `ValidationPipe`, `SwaggerModule.setup('api')`, `listen(3000)`
- `scripts/apply-demo-sql.js` — 30 tentativas e `RETRYABLE` sem acesso negado
- `compose.yaml` — healthcheck `start_period` `30s`, `interval` `5s`, `retries` `20`, imagem `mysql:8.4.11`
- `package.json` — scripts `test`, `test:e2e`, `seed`; ausência de `test:delivery`; Jest `rootDir` `src`
- `test/jest-e2e.json` mais `jest --showConfig` — `rootDir` resolvido para a pasta `test`
- `node_modules/jest-config/build/readConfigFileAndSetRootDir.js` — `rootDir` relativo ao diretório do config
- `node_modules/@jest/core/build/SearchSource.js` — `--runTestsByPath` ainda passa por `roots` e `testRegex`
- `node_modules/jest-cli/build/args.js` — textos de `--runInBand`, `--runTestsByPath` e `--forceExit`
- `node_modules/@nestjs/core/router/router-response-controller.js` — `POST` → `201`
- `node_modules/@nestjs/common/exceptions/http.exception.js` e `bad-request.exception.js` — corpo do `400`
- `node_modules/@nestjs/core/nest-application-context.js` — `close()` chama shutdown hook
- `node_modules/@nestjs/typeorm/dist/typeorm-core.module.js` — `dataSource.destroy()`
- `node_modules/@nestjs/typeorm/dist/common/typeorm.utils.js` — token padrão é a classe `DataSource`
- `node_modules/express/lib/response.js` — `res.send` sem corpo
- `.planning/phases/01-demo-que-autentica/01-REVIEW.md` — texto do WR-04, `MAX_ATTEMPTS` `130` e `errno` `1045`
- PowerShell desta sessão — alias `curl` → `Invoke-WebRequest`; `curl.exe` em `C:\WINDOWS\system32\curl.exe`

### Secondary (MEDIUM confidence)

- Nenhuma página externa foi necessária. O Context7 pedido pelo seam de pesquisa não está disponível neste agente. A CLI `ctx7` não está no PATH.

### Tertiary (LOW confidence)

- Nenhuma. As duas linhas do Assumptions Log são o que a execução ainda confirma.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — versões lidas dos `package.json` instalados; nenhum pacote novo
- Architecture: HIGH — rotas, status, semente, Jest e shutdown lidos no código desta sessão
- Pitfalls: HIGH — `rootDir` confirmado com `--showConfig`; o hang do pool continua condicional por D-08

**Research date:** 2026-10-11
**Valid until:** 2026-11-10






