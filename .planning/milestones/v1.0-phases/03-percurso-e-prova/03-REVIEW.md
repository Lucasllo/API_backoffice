---
phase: 03-percurso-e-prova
reviewed: 2026-10-11T21:45:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - test/delivery-path.spec.ts
  - test/jest-delivery.json
  - scripts/apply-demo-sql.js
  - package.json
findings:
  critical: 0
  warning: 3
  info: 1
  total: 4
status: issues_found
---

# Phase 03-percurso-e-prova: Code Review Report

**Reviewed:** 2026-10-11T21:45:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Revisei o spec do percurso, a config Jest desse comando, o script que aplica `seed/demo.sql` e o script `test:delivery` em `package.json`. O `it` único chama as rotas certas: `POST /auth/loginDelivery`, `POST /deliveryqueue/:idShopping` e `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping`. O id `1` da URL é o pedido, e as leituras com `where` conferem a mesma linha da fila (status 1, depois 2) e o pedido (status 6, depois 4, que é `Concluded`). `npm test` (`rootDir` `src`) e `npm run test:e2e` (regex `.e2e-spec.ts$`) não coletam `test/delivery-path.spec.ts`.

O caminho feliz com MySQL recusando a porta na hora continua dentro do timeout. Três falhas ficam fora dele: a espera do seed não está limitada a 130 segundos nem ao `testTimeout` do Jest, o `USE` do preâmbulo desfaz o fallback de `DB_DATABASE`, e o intertravamento do spec não cobre porta nem usuário antes do `DELETE` da demo.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: A espera do seed estoura os 130 segundos e o timeout do Jest

**File:** `scripts/apply-demo-sql.js:5-11` e `scripts/apply-demo-sql.js:112-135`; `test/delivery-path.spec.ts:26-34`; `test/jest-delivery.json:6`
**Issue:** `isRetryable` trata `ETIMEDOUT` como falha transitória e `connect` repete isso até `MAX_ATTEMPTS` (130). As opções do `mysql.createConnection` não definem `connectTimeout`. No `mysql2` instalado, `connection_config.js` usa 10 segundos quando a opção está ausente (`isNaN(undefined)` cai no default `10 * 1000`). Cada tentativa que não recebe RST pode bloquear 10 segundos e, entre as 129 primeiras, o script ainda espera 1 segundo. O pior caso passa de 20 minutos, não dos 130 segundos do healthcheck.

No spec, esse processo é filho de `spawnSync`. A chamada bloqueia o event loop do Jest, então o `testTimeout` de 180000 não dispara enquanto o filho não voltar. Com a porta fechada em `127.0.0.1` o erro é `ECONNREFUSED` e o ciclo termina perto de 130 segundos. Com handshake que estoura o tempo, `npm run test:delivery` fica preso além do timeout configurado. `spawnSync` também não guarda `seeded.error`: se o binário nem chega a sair, `status` é `null` e a mensagem fica só `A semente da demo falhou.`
**Fix:** Limite o tempo de cada conexão e mate o filho antes do timeout do Jest.

```js
const options = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  connectTimeout: 1000,
};
```

```ts
const seeded = spawnSync(process.execPath, ['scripts/apply-demo-sql.js'], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.join(__dirname, '..'),
  timeout: 170000,
});

if (seeded.error) {
  throw seeded.error;
}

if (seeded.status !== 0) {
  throw new Error('A semente da demo falhou.');
}
```

### WR-02: O fallback de `DB_DATABASE` é desfeito pelo próximo `USE`

**File:** `scripts/apply-demo-sql.js:154-161`
**Issue:** Se `CREATE DATABASE` volta errno 1044 ou `ER_DBACCESS_DENIED_ERROR`, o script executa `USE` no nome validado por `assertDatabaseName` e segue o laço. O preâmbulo de `seed/demo.sql` tem dois statements: o `CREATE DATABASE` de `` `ifarma` `` (linha 5) e, em seguida, `USE `ifarma`` (linha 6). Esse segundo statement roda mesmo depois do fallback e devolve a conexão para `ifarma` antes do corpo criar tabelas e inserir a demo. Quem ajusta `DB_*` num MySQL local, como o comentário de `.env.example` permite, sobe a API em `DB_DATABASE` enquanto a semente gravou em `ifarma`, ou vê o `USE` fixo falhar. O guard do spec exige `DB_DATABASE === 'ifarma'`, então `npm run test:delivery` não esconde esse desvio; `npm run seed` continua exposto.
**Fix:** Monte o preâmbulo com o nome já validado e retire o `CREATE DATABASE` e o `USE` fixos de `seed/demo.sql`. O marcador `-- @schema` continua separando o corpo. No acesso negado, o `USE` do nome validado permanece e não existe um segundo `USE` para desfazê-lo.

```js
const preamble = [
  'CREATE DATABASE IF NOT EXISTS `' +
    databaseName +
    '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
  'USE `' + databaseName + '`',
].join(';\n');
```

### WR-03: O spec semeia com porta e usuário fora do intertravamento

**File:** `test/delivery-path.spec.ts:16-30`
**Issue:** O `beforeAll` só recusa `DB_HOST`, `DB_DATABASE` e `ENV`. Em seguida o `spawnSync` roda `scripts/apply-demo-sql.js`, cujo corpo apaga e reinsere as linhas `id` / `shoppingId` / `userDeliveryId` iguais a 1 em `deliveryqueue`, `shoppings`, `userdelivery`, `userbackoffice` e `users`. `DB_PORT` e `DB_USERNAME` não entram na comparação. `.env.example` diz que um MySQL local pode ajustar `DB_*`. Um servidor em `127.0.0.1` noutra porta, com schema também chamado `ifarma` e `ENV=demo`, passa no guard e perde essas linhas. O host `127.0.0.1` não distingue o Compose da porta 3306 de outra instância local.
**Fix:** Exija também a porta e o usuário da demo antes do spawn. Se algum divergir, lance o mesmo erro e não chame o seed.

```ts
if (
  process.env.DB_HOST !== '127.0.0.1' ||
  process.env.DB_PORT !== '3306' ||
  process.env.DB_USERNAME !== 'ifarma' ||
  process.env.DB_DATABASE !== 'ifarma' ||
  process.env.ENV !== 'demo'
) {
  throw new Error(
    'DB_HOST, DB_DATABASE ou ENV nao batem com a demo local.',
  );
}
```

## Info

### IN-01: O `testRegex` não está ancorado no começo do nome

**File:** `test/jest-delivery.json:5`
**Issue:** O padrão `delivery-path\\.spec\\.ts$` casa qualquer caminho que termine com esse sufixo, inclusive `my-delivery-path.spec.ts`. O script `test:delivery` em `package.json` ainda fixa o arquivo com `--runTestsByPath`, então o comando publicado não coleta outro spec. Quem rodar o Jest só com `--config ./test/jest-delivery.json` passa a incluir um arquivo novo com esse sufixo.
**Fix:** Ancore o nome do arquivo, por exemplo `test/delivery-path\\.spec\\.ts$`.

---

_Reviewed: 2026-10-11T21:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
