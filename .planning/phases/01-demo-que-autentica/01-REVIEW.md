---
phase: 01-demo-que-autentica
reviewed: 2026-10-06T01:24:49Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - compose.yaml
  - .env.example
  - seed/demo.sql
  - scripts/apply-demo-sql.js
  - src/main.ts
  - package.json
findings:
  critical: 0
  warning: 4
  info: 0
  total: 4
status: issues_found
---

# Phase 01-demo-que-autentica: Code Review Report

**Reviewed:** 2026-10-06T01:24:49Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Revisei o Compose, o exemplo de ambiente, o SQL da demo, o script que aplica esse SQL, o bootstrap e o `package.json`. O hash gravado para operador e entregador confere com `Entrega1!`, os papéis `'1'` e `'4'` batem com `Role.User` e `Role.Delivery`, e o pedido 1 fica em status 6 com `storeCode` 2312. `package-lock.json` ficou de fora do escopo porque é lockfile.

O caminho padrão (Compose + `.env.example` sem edição) cria as tabelas em `ifarma` depois que o `CREATE DATABASE` do usuário `ifarma` é recusado. Quatro falhas ficam no caminho: o nome do banco no SQL ignora `DB_DATABASE`, `validCode = 0` vira código de recuperação permanente, a fila não garante um pedido por linha, e o seed desiste antes da janela de saúde do MySQL.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: O SQL ignora `DB_DATABASE` e o fallback é desfeito

**File:** `seed/demo.sql:5-6`
**Issue:** `.env.example` diz que um MySQL local pode ajustar `DB_*`. O preâmbulo sempre executa `CREATE DATABASE` e `USE` no nome `ifarma`. Em `scripts/apply-demo-sql.js:148-155`, se o `CREATE DATABASE` volta errno 1044, o script faz `USE` no nome vindo de `DB_DATABASE` e segue para o próximo statement. Esse próximo statement é o `USE \`ifarma\`` do arquivo, então a conexão volta para `ifarma` antes do corpo criar tabelas e inserir a demo. Quem aponta `DB_DATABASE` para outro schema sobe a API num banco vazio, ou vê o seed falhar no `USE`, enquanto os dados foram parar em `ifarma`.
**Fix:** Montar o preâmbulo com o nome já validado por `assertDatabaseName` e não deixar um `USE` fixo no arquivo.

```js
const preamble = [
  'CREATE DATABASE IF NOT EXISTS `' + databaseName + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
  'USE `' + databaseName + '`',
].join(';\n');
```

Remova as linhas `CREATE DATABASE` e `USE` de `seed/demo.sql` (o marcador `-- @schema` continua separando o corpo). No `catch` de acesso negado, o `USE` do nome validado permanece e não existe um segundo `USE` para desfazê-lo.

### WR-02: `validCode` 0 é um código de recuperação que não sai da linha

**File:** `seed/demo.sql:99-100`
**Issue:** As colunas `validCode` nascem `int NOT NULL` (linhas 37 e 56) e os dois inserts gravam `0`. `UserRepository.findByValidCode` e `UserDeliveryRepository.findByValidCode` tratam qualquer inteiro encontrado como código válido e, em seguida, gravam `NULL`. Com `STRICT_TRANS_TABLES` (padrão do MySQL 8.4), esse `UPDATE` falha, `POST /auth/validaCodigo/0` e `POST /auth/validaCodigoDelivery/0` respondem como usuário inexistente, e o `0` continua na linha. O login por senha segue funcionando; a recuperação desses usuários não tem um valor que signifique "sem código".
**Fix:** Aceite ausência de código na coluna e grave `NULL` na demo.

```sql
`validCode` int NULL,
```

```sql
INSERT INTO `userbackoffice` (..., `validCode`) VALUES (..., NULL);
INSERT INTO `userdelivery` (..., `validCode`) VALUES (..., NULL);
```

No entity correspondente, a coluna precisa de `nullable: true`. Sem isso o TypeORM e o SQL divergem na próxima sincronização.

### WR-03: `shoppingId` da fila não é único

**File:** `seed/demo.sql:87`
**Issue:** `DeliveryQueueEntity.shoppingId` é o lado dono de um `@OneToOne` com `@JoinColumn`. Com `ENV=demo`, `synchronize` fica desligado e esta tabela é o schema real. O índice criado é `KEY`, então duas linhas podem apontar para o mesmo `shoppings.id`. O `create` da fila só consulta antes de inserir, sem trava. Duas requisições paralelas passam da consulta e gravam duas filas para o pedido 1. A leitura `OneToOne` depois não tem uma única linha para devolver.
**Fix:** Troque o índice simples pela chave única. Ela também serve a foreign key.

```sql
UNIQUE KEY `UQ_deliveryqueue_shoppingId` (`shoppingId`),
```

Mantenha `KEY IDX_deliveryqueue_userDeliveryId`. Um entregador pode ter mais de um pedido; o pedido é que só pode estar em uma fila.

### WR-04: O seed desiste antes da janela de saúde do MySQL

**File:** `scripts/apply-demo-sql.js:106`
**Issue:** A conexão recusada entra em até 30 tentativas com 1 segundo entre elas (`scripts/apply-demo-sql.js:126-128`), cerca de 29 segundos no total. O healthcheck em `compose.yaml:16-20` usa `start_period: 30s`, `interval: 5s` e `retries: 20`. O primeiro init da imagem oficial costuma ocupar o `start_period` inteiro antes de aceitar TCP. Quem sobe o Compose e roda `npm run seed` em seguida esgota as tentativas enquanto o container ainda está na janela em que o Docker não o considera doente. `ER_ACCESS_DENIED_ERROR` também não está em `RETRYABLE`, então um MySQL que já escuta e ainda não criou o usuário `ifarma` aborta na primeira falha.
**Fix:** Cubra a mesma janela do healthcheck e trate acesso negado transitório como retry.

```js
const MAX_ATTEMPTS = 130;

function isRetryable(err) {
  if (!err) return false;
  if (RETRYABLE.has(err.code)) return true;
  return Number(err.errno) === 1045 || err.code === 'ER_ACCESS_DENIED_ERROR';
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  // ...
  if (attempt < MAX_ATTEMPTS) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
```

130 segundos cobrem `start_period` mais `retries * interval`.

---

_Reviewed: 2026-10-06T01:24:49Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
