# Phase 1: Demo que autentica - Research

**Researched:** 2026-10-04
**Domain:** Ambiente de demonstração MySQL 8.4.11, semente SQL versionada e boot NestJS que autentica o entregador já semeado
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### MySQL do exemplo
- **D-01:** Commitar `compose.yaml` com a imagem `mysql:8.4.11` e um `.env.example` alinhado a esse container. Quem já tem MySQL 8.4.11 local copia o exemplo, ajusta `DB_*` e não sobe o Compose.
- **D-02:** Copiar `.env.example` para `.env` sobe sem editar valores. Usuário `ifarma`, senha `ifarma`, database `ifarma`, host `127.0.0.1`, porta `3306`. O Compose cria esse usuário. A API não conecta como root. `JWT_SECRET=demo-jwt-secret-ifarma`. `ENV=demo`.
- **D-03:** `.env.example` também traz e-mail fictício, sem servidor SMTP nesta fase: `MAIL_HOST=localhost`, `MAIL_PORT=1025`, `MAILER_SECURE=false`, `MAIL_USER=demo`, `MAIL_PASSWORD=demo`, `MAIL_FROM=no-reply@example.com`, `CLIENT_URL=http://localhost:3000`. O envio em `AuthService` continua comentado.
- **D-04:** Volume nomeado. `docker compose down` mantém schema e semente. Apagar os dados é `docker compose down -v`.
- **D-05:** O Compose cria o database `ifarma` na primeira subida (`MYSQL_DATABASE`). O script da semente também cria o database se ele não existir, para o MySQL local funcionar sem passo manual.
- **D-06:** `MYSQL_ROOT_PASSWORD=ifarma-root`, só no `compose.yaml`. Diferente da senha do usuário `ifarma`.
- **D-07:** Cabeçalho curto do `.env.example` em português: copiar para `.env`, não commitar `.env`, os valores já batem com o Compose, MySQL 8.4.11 local pode ajustar `DB_*`. Sem o percurso do pedido.
- **D-08:** Copiar o exemplo para `.env` basta para o boot. A API enxerga `DB_*` e `JWT_SECRET` sem `export` no shell.

### Senha conhecível nesta fase
- **D-09:** Comentário no topo do arquivo de semente com e-mail, senha em claro, id do pedido e `verificationCode`. O `INSERT` guarda só o hash bcrypt. O README da fase 3 copia esses valores.
- **D-10:** Senha em claro `Entrega1!` para o entregador. O hash no `INSERT` é dessa senha, gerado com o `bcrypt` 5.1.1 já do projeto. Passa em `@IsStrongPassword` de `LoginAuthDto`.
- **D-11:** O mesmo comentário lista o operador, também com `Entrega1!`. O `INSERT` do operador guarda só o hash. O bloco do operador inclui `storeCode` `2312`, porque `UserRepository.login` exige e-mail, `storeCode`, `authorized: true` e `active: true`.
- **D-12:** O operador nasce `authorized`, `active` e com hash de `Entrega1!`. A senha publicada é verdadeira. O critério desta fase continua sendo só `POST /auth/loginDelivery`.

### Identidade da demo
- **D-13:** O plano escolhe nomes, endereços e e-mails neutros e fictícios. E-mails em `@example.com`. Tudo o que a pessoa precisa para autenticar fica no comentário da semente.
- **D-14:** `verificationCode` fixo `4821`, na coluna e no comentário.
- **D-15:** Ids fixos e repetíveis: cliente `1`, operador `1`, entregador `1`, pedido `1`. O comentário cita o pedido `1`.
- **D-16:** `storeCode` `2312` no operador (`userbackoffice`) e no pedido (`shoppings`). Nomes e endereços em português.

### Carregado do projeto, não rediscutido
- **D-17:** Schema por SQL versionado. `ENV=demo`, então `synchronize` permanece desligado. O literal `developmen` em `src/app.module.ts` não muda. Nenhum pacote novo no `package.json`.
- **D-18:** Reexecução reaplica a mesma semente: os ids continuam `1` e o pedido `1` termina sem linha em `deliveryqueue`.

### Claude's Discretion

- Bind da porta `3306` não foi escolhido (a pergunta foi encerrada com "proxima area"). Publicar só `127.0.0.1:3306`, porque a senha `ifarma` está no repositório.
- Charset do Compose: `utf8mb4` / `utf8mb4_unicode_ci`, para os nomes em português.
- Não criar `.nvmrc` nem `engines` nesta fase.
- Um comando `npm run seed` aplica `seed/demo.sql` via `scripts/apply-demo-sql.js`, com `node -r dotenv/config` e o `mysql2` já instalado. O SQL cria o database se faltar, cria as tabelas da demo e insere o grafo. Fora de `src/`. Sem seed no boot e sem rota de seed.
- O boot lê o `.env` antes de avaliar `AppModule`: primeiro import de `src/main.ts` é `import 'dotenv/config'`.
- Pedido semeado com status `solicitacaoCompraStatus.WaitingMotoboy` (`6`), não `Concluded`. Nenhuma linha em `deliveryqueue`. Sem produtos, cartão, endereço ou categoria.
- Papel do operador: `Role.User` (`'1'`). Papel do entregador: `Role.Delivery` (`'4'`). Cliente em `users` só para cumprir `userEntityId`.
- Colunas obrigatórias que a demo não exibe (CPF, telefone, veículo, `validCode`, `userAuthorized`) recebem valores claramente falsos. `UserRepository.login` olha `authorized` e `active`, não `userAuthorized`.
- Hash gerado pelo `bcrypt` do projeto e gravado no arquivo SQL. Não depender de o shell expandir `$2b$`.

### Deferred Ideas (OUT OF SCOPE)

- README em português com o percurso até a confirmação, copiando e-mail, `Entrega1!`, pedido `1` e `4821` do comentário da semente. Fase 3.
- Fila persistida, recusa do segundo enfileiramento e confirmação pelo código. Fase 2.
- Servidor SMTP de verdade. Os `MAIL_*` do exemplo são placeholders.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENV-02 | Quem clona configura MySQL e a API a partir de um exemplo de ambiente, sem segredo real e sem pacote novo no `package.json` | `compose.yaml` com `mysql:8.4.11`, `.env.example` com os valores de D-02/D-03, `.env` já ignorado, `import 'dotenv/config'` antes de `AppModule`. Nenhum `npm install`. |
| SEED-01 | A demo traz, em dados fictícios versionados, uma loja, um operador, um entregador e um pedido com `verificationCode` conhecido | `seed/demo.sql` cria `users`, `userbackoffice`, `userdelivery`, `shoppings` e `deliveryqueue`, insere ids `1`, `storeCode` `2312`, `verificationCode` `4821`, status `6`. Reexecução apaga a fila desse pedido e reinsere o mesmo grafo. |
| SEED-02 | A senha do entregador semeado autentica em `POST /auth/loginDelivery` | A rota já é `@Public()` e usa `LoginAuthDto`. O `INSERT` de `userdelivery` guarda o hash bcrypt de `Entrega1!`. O login compara e-mail e senha e devolve `token` com `sub` `{ userDelivery }`. |
</phase_requirements>

## Summary

A fase não cria autenticação. `POST /auth/loginDelivery` já existe, é pública e compara o e-mail com `bcrypt.compare`. O que falta é o banco: um exemplo de ambiente que o Nest lê antes de montar o TypeORM e o JWT, e um SQL versionado que cria só o grafo da demo e deixa o pedido `1` sem linha em `deliveryqueue`.

O boot hoje chama `dotenv.config()` depois dos imports. Com `"module": "commonjs"`, isso é tarde demais: `TypeOrmModule.forRoot` e `JwtModule.register` já leram `process.env`. O primeiro import de `src/main.ts` tem de ser `import 'dotenv/config'`. O script da semente não passa por `main.ts`, então o `package.json` usa `node -r dotenv/config`. `ConfigModule.forRoot()` não substitui esse preload.

A semente é idempotente por `DELETE` do grafo de ids `1` e `INSERT` de novo, com ids explícitos. `CREATE TABLE IF NOT EXISTS` não altera tabela já existente. `synchronize` continua `process.env.ENV === 'developmen'` e o exemplo usa `ENV=demo`. Nenhum pacote entra no `package.json`. O hash de `Entrega1!` é gerado uma vez com o `bcrypt` 5.1.1 do lock e gravado no `.sql` por um script Node, para o PowerShell não expandir `$2b$`.

**Primary recommendation:** Entregar `compose.yaml`, `.env.example`, `seed/demo.sql`, `scripts/apply-demo-sql.js` e o preload do `dotenv` em `src/main.ts`. Não mexer em rota, guard, DTO, entidade nem no literal `developmen`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Subir MySQL 8.4.11 com usuário `ifarma` | Runtime local (Compose) | — | O container só publica o banco. A API continua no host, em `npm run start:dev`. |
| Contrato `DB_*`, `JWT_SECRET`, `ENV`, `MAIL_*` | API / Backend (boot) | Arquivo de exemplo | `TypeOrmModule.forRoot` e `JwtModule.register` leem `process.env` na avaliação do módulo. O `.env.example` é o contrato; o `.env` não é versionado. |
| Schema e linhas fictícias | Database / Storage | Script Node fora de `src/` | `ENV=demo` deixa `synchronize` desligado. O SQL é a fonte do DDL e do DML. |
| `POST /auth/loginDelivery` | API / Backend | Database | A rota, o DTO e o `bcrypt.compare` já existem. A fase só garante a linha e o segredo JWT de demonstração. |
| Comentário com senha, pedido e código | Arquivo versionado `seed/demo.sql` | — | A fase 3 copia esse comentário. Esta fase não escreve README. |

## Project Constraints (from .cursor/rules/)

De `.cursor/rules/documentacao-pt-br.mdc` (alwaysApply):

- Documentação em `.planning/` sai em português do Brasil.
- Identificadores de código, nomes de arquivo, rotas, comandos e chaves de API permanecem como estão no código.
- O comentário da semente, voltado a quem clona, fica em português. O SQL e os nomes de coluna ficam iguais às entidades.

Não há `CLAUDE.md`. `workflow.nyquist_validation` está `false` em `.planning/config.json`. Esta fase não abre suíte de teste. `workflow.security_enforcement` está `true`, nível ASVS 1.

## Standard Stack

Nenhum pacote novo. As versões abaixo são as do `package-lock.json` lido nesta sessão.

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `mysql` (imagem Docker) | `8.4.11` | Banco da demo | D-01. Tag `8.4.11` observada ativa no registry em 2026-09-29. [CITED: https://hub.docker.com/v2/repositories/library/mysql/tags/8.4.11] |
| `mysql2` | 3.9.7 | Aplicar `seed/demo.sql` | Já é o driver do TypeORM. O script usa `mysql2/promise`. [VERIFIED: package-lock.json node_modules/mysql2 version 3.9.7] |
| `dotenv` | 16.4.5 | Preencher `process.env` antes dos módulos | `import 'dotenv/config'` e `node -r dotenv/config`. [VERIFIED: package-lock.json node_modules/dotenv version 16.4.5] |
| `bcrypt` | 5.1.1 | Gerar o hash de `Entrega1!` na autoria do SQL | O login já compara com esse pacote. [VERIFIED: package-lock.json node_modules/bcrypt version 5.1.1] |
| `typeorm` | 0.3.20 | Mapa coluna → tipo MySQL que o SQL tem de imitar | `synchronize` fica desligado. O DDL escrito à mão segue o driver MySQL dessa versão. [VERIFIED: package-lock.json node_modules/typeorm version 0.3.20] |
| `@nestjs/jwt` | ^10.2.0 no `package.json` | Token do entregador | Já registrado. A fase só garante `JWT_SECRET` no preload. Não trocar o `register`. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nestjs/config` | ^3.2.2 | Já importado em `AppModule` | Permanece. Não é o mecanismo que preenche `DB_HOST` para o `forRoot` síncrono. |
| `class-validator` | ^0.14.1 | `@IsStrongPassword` em `LoginAuthDto` | A senha da semente tem de passar nessa validação. Não alterar o DTO. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `import 'dotenv/config'` | `forRootAsync` + `ConfigService` | Funciona, mas mexe em TypeORM e JWT juntos. A discrição fecha o preload. |
| SQL aplicado pelo Node | `/docker-entrypoint-initdb.d` | O entrypoint oficial só roda na primeira inicialização de um datadir vazio. A reexecução da semente (D-18) precisa rodar com o volume já cheio. [CITED: https://hub.docker.com/_/mysql/] |
| `DELETE` + `INSERT` com id explícito | `INSERT ... ON DUPLICATE KEY UPDATE` | O upsert não apaga `deliveryqueue`. No MySQL 8.4, `VALUES(col)` nessa cláusula está deprecado; o alias de linha é a forma atual. [CITED: https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html] |
| `bcrypt` 5.1.1 já instalado | `bcrypt` 6 ou `bcryptjs` | Os dois alteram `package.json`. D-17 proíbe pacote novo. |

**Installation:**

```bash
npm ci
```

Só se `node_modules` não existir. Não rodar `npm install <pacote>`. Não adicionar dependência. O script novo entra só em `scripts` do `package.json`:

```json
"seed": "node -r dotenv/config scripts/apply-demo-sql.js"
```

Não adicionar `test:delivery` nesta fase (fase 3). Não criar `.nvmrc` nem `engines`.

**Version verification:** imagem `mysql:8.4.11` consultada no Docker Hub nesta sessão (`tag_status` active, `tag_last_pushed` 2026-09-29). Pacotes conferidos no `package-lock.json`, não no registry ao vivo, porque a fase não instala nada.

## Package Legitimacy Audit

Esta fase não instala pacote externo. O gate de legitimidade não se aplica a instalação nova.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| — | — | — | — | — | — | Nenhum pacote novo |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

`bcrypt` 5.1.1 já está no lock com `hasInstallScript: true` (`node-pre-gyp install --fallback-to-build`). Isso é o pacote existente, não uma adição. O release 5.1.1 publica o binário N-API `bcrypt_lib-v5.1.1-napi-v3-win32-x64-unknown.tar.gz`. [CITED: https://github.com/kelektiv/node.bcrypt.js/releases/tag/v5.1.1] Não subir para bcrypt 6. A tabela "Node 18 onwards → bcrypt >= 6" está no README atual do repositório, não no contrato do 5.1.1 que o lock fixa (`engines.node` `>= 10.0.0` no lock).

## Architecture Patterns

### System Architecture Diagram

```
pessoa
  │ copia .env.example → .env (não versionado)
  ├─ docker compose up -d ──► mysql:8.4.11
  │                              volume nomeado /var/lib/mysql
  │                              user ifarma / db ifarma
  │                              escuta só 127.0.0.1:3306
  └─ npm run seed
        │  node -r dotenv/config
        ▼
   scripts/apply-demo-sql.js
        │  mysql2 (multipleStatements só aqui)
        ▼
   seed/demo.sql
        │  CREATE DATABASE se faltar
        │  CREATE TABLE IF NOT EXISTS
        │  DELETE ids 1 (fila primeiro)
        │  INSERT cliente, operador, entregador, pedido
        │  zero linhas em deliveryqueue para o pedido 1
        ▼
   npm run start:dev
        │  primeiro import: dotenv/config
        ▼
   AppModule (ENV=demo → synchronize false)
        │
        ▼
   POST /auth/loginDelivery
        │  LoginAuthDto (e-mail + Entrega1!)
        │  UserDeliveryRepository.login → bcrypt.compare
        ▼
   { id: 1, role: "4", token }
        sub JWT = {"userDelivery":"1"}
```

### Recommended Project Structure

```
compose.yaml                 # só o MySQL; a API sobe no host
.env.example                 # contrato; .env continua no .gitignore
seed/demo.sql                # DDL + DML + comentário com a senha em claro
scripts/apply-demo-sql.js    # mysql2, fora de src/
src/main.ts                  # primeiro import: dotenv/config
package.json                 # só o script "seed"
```

Não criar `Dockerfile`, `migrations/`, rota de seed nem seed no boot.

### Pattern 1: Preload do dotenv antes do módulo

**What:** `import 'dotenv/config'` como primeiro import, para o `require` correspondente rodar antes de `./app.module`.
**When to use:** Sempre neste boot. O `dotenv.config()` que hoje fica depois dos imports não alimenta o objeto já montado do `forRoot`.
**Example:** o arquivo atual avalia `AppModule` antes de carregar o `.env`:

```1:7:src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();
```

O README do dotenv 16.4.5 diz que o import de efeito tem de vir antes dos módulos que leem `process.env`, e que `node --require dotenv/config` é o preload quando o arquivo de entrada não é o `main.ts`. Por padrão, variável que já existe no ambiente não é sobrescrita. [CITED: https://github.com/motdotla/dotenv/blob/v16.4.5/README.md]

Substituir o bloco acima: o primeiro import passa a ser `import 'dotenv/config'`, e saem `import * as dotenv` e a chamada `dotenv.config()`.

`TypeOrmModule.forRoot` lê o ambiente na avaliação:

```29:47:src/app.module.ts
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        UserEntity,
        UserClientEntity,
        ProductEntity,
        CategoryEntity,
        ShoppingEntity,
        CardEntity,
        AddressEntity,
        UserDeliveryEntity,
        DeliveryQueueEntity,
      ],
      synchronize: process.env.ENV === 'developmen',
    }),
```

O JWT faz o mesmo, duas vezes (`imports` e `exports`):

```12:16:src/modules/auth.module.ts
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
      signOptions: { expiresIn: '12h' }, //usado para definir globalmente quanto tempo o jwt vai valer
    }),
```

`String(undefined)` vira a string `"undefined"` se o preload não aconteceu. O `expiresIn: '7 days'` do `sign` do entregador continua valendo sobre o `'12h'` do `register`. Não unificar isso nesta fase.

### Pattern 2: SQL idempotente com ids explícitos

**What:** Cada `npm run seed` apaga o grafo de ids `1` e insere de novo. A fila do pedido `1` não é reinserida.
**When to use:** Primeira subida e qualquer reexecução, inclusive depois que a fase 2 tiver gravado uma linha em `deliveryqueue`.
**Example:** ordem obrigatória por causa das FKs.

1. `CREATE DATABASE` / `USE` (o script tolera falta de privilégio `CREATE` quando o database já existe).
2. `CREATE TABLE IF NOT EXISTS` na ordem `users`, `userbackoffice`, `userdelivery`, `shoppings`, `deliveryqueue`.
3. `DELETE FROM deliveryqueue WHERE shoppingId = 1 OR userDeliveryId = 1`.
4. `DELETE FROM shoppings WHERE id = 1`.
5. `DELETE FROM userdelivery WHERE id = 1`.
6. `DELETE FROM userbackoffice WHERE id = 1`.
7. `DELETE FROM users WHERE id = 1`.
8. `INSERT` com id `1` em `users`, `userbackoffice`, `userdelivery`, `shoppings`.
9. Não inserir em `deliveryqueue`.

`CREATE TABLE IF NOT EXISTS` não corrige coluna faltante. O caminho feliz é volume novo ou banco vazio. Não misturar este database com `ENV=developmen`.

### Pattern 3: Hash escrito pelo Node, comentário com a senha em claro

**What:** O `INSERT` guarda só o hash. O topo do `.sql` lista e-mail, `Entrega1!`, pedido `1` e `4821`.
**When to use:** Uma vez, na autoria do arquivo. O `npm run seed` não chama `bcrypt`.
**Example:** gerar o hash com custo 10, o default de `genSalt` do bcrypt (`minor` `b`, prefixo `$2b$`). [CITED: https://github.com/kelektiv/node.bcrypt.js/] Gravar o arquivo de hash com `fs.writeFileSync` dentro de um `.js` executado pelo Node. Colar o hash no SQL e apagar o arquivo auxiliar. Não colocar o hash em `package.json` nem em string com aspas duplas do PowerShell.

O mesmo hash pode ir nos dois `INSERT` (operador e entregador). `bcrypt.compare` aceita o mesmo hash nos dois. A coluna `password` tem `length: 127`; o hash bcrypt tem 60 caracteres.

### Anti-Patterns to Avoid

- **Corrigir `developmen`:** liga `synchronize` se alguém também mudar `ENV`. D-17 deixa o literal.
- **Montar a semente em `/docker-entrypoint-initdb.d`:** não roda de novo com o volume cheio.
- **Seed no `main.ts` ou rota HTTP de seed:** a discrição proíbe.
- **`npm install` de cliente MySQL, bcryptjs ou mailpit:** D-17.
- **Inserir linha em `deliveryqueue` "para a fase 2 já achar fila":** D-18 exige o pedido sem fila. A fase 2 cria a linha.
- **Criar tabelas `product`, `categoryEntity`, `cards`, `address`:** a discrição deixa esses módulos de fora. Não há `OnModuleInit` em `src/` que as consulte no boot.
- **Sobrescrever um `.env` já existente com um script:** a cópia é passo humano. O arquivo `.env` já existe nesta máquina e está no `.gitignore` (linha 45). Não lê-lo e não commitar.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hash de senha | SHA, MD5 ou substring | `bcrypt.hashSync('Entrega1!', 10)` do pacote 5.1.1 | O login usa `bcrypt.compare`. Outro formato devolve 401 ou 500. |
| Carregar `.env` | Parser próprio ou `export` no README | `dotenv/config` 16.4.5 | Comentário `#`, aspas e "não sobrescrever o que já existe" já estão no pacote. |
| Servidor MySQL | Script que baixa o ZIP do MySQL | Imagem oficial `mysql:8.4.11` | Usuário, database, root e charset já são variáveis e flags da imagem. Quem tem MySQL local ajusta `DB_*` e pula o Compose. |
| Cliente SQL | Depender do binário `mysql` no host | `mysql2` já no lock | Nesta máquina `mysql` não está no PATH. O Docker está. |
| Reaplicar semente | Entry point do Docker | `npm run seed` | Init do datadir não é repetível. |

**Key insight:** A autenticação já está escrita. O risco da fase é o schema escrito à mão divergir da entidade, ou o `.env` chegar depois que o módulo já leu `process.env`.

## Common Pitfalls

### Pitfall 1: `.env` lido tarde

**What goes wrong:** `DB_HOST` vazio, porta `NaN`, `JWT_SECRET` igual à string `"undefined"`. O log dentro de `bootstrap` mostra o valor certo e mente: o TypeORM já capturou o valor na importação.
**Why it happens:** `src/main.ts` importa `AppModule` na linha 3 e só chama `dotenv.config()` na linha 7. `tsconfig.json` tem `"module": "commonjs"`.
**How to avoid:** Primeiro import `import 'dotenv/config'`. Seed com `node -r dotenv/config`. Não migrar para `forRootAsync` nesta fase.
**Warning signs:** A API sobe e cai em `ECONNREFUSED` ou `Access denied` mesmo com `.env` na raiz. Ou o token só valida com o segredo `"undefined"`.

### Pitfall 2: `CREATE DATABASE` com o usuário `ifarma`

**What goes wrong:** O Compose já criou `ifarma` e deu `GRANT ALL` nesse database ao usuário `ifarma`. `CREATE DATABASE` exige o privilégio `CREATE`. [CITED: https://dev.mysql.com/doc/refman/8.4/en/create-database.html] Se a primeira sentença do arquivo falha, o `mysql2` não segue para o `CREATE TABLE`.
**Why it happens:** O usuário da aplicação não é root. `MYSQL_ROOT_PASSWORD` fica só no Compose (D-06).
**How to avoid:** O script executa o preâmbulo (`CREATE DATABASE` / `USE`) separado do resto. Se `CREATE DATABASE` recusar acesso e o `USE` do `DB_DATABASE` funcionar, segue. Se o database não existir e o `CREATE` falhar, o script termina com erro claro: a conta em `DB_USERNAME` precisa poder criar o database, ou o Compose precisa ter criado `ifarma`. Validar `DB_DATABASE` com `^[A-Za-z0-9_]+$` antes de interpolar o identificador. Não usar placeholder do `mysql2` no `USE` (o servidor não aceita placeholder em nome de database).
**Warning signs:** `ER_DBACCESS_DENIED_ERROR` (1044) no primeiro comando e nenhuma tabela criada.

### Pitfall 3: `INSERT` omite coluna `NOT NULL` sem default

**What goes wrong:** `Field 'validatedEmail' doesn't have a default value` (ou `userAuthorized`, `phoneNumber`, `validCode`, `verificationCode`, `userEntityId`).
**Why it happens:** O default do decorator TypeORM não vira default no MySQL enquanto `synchronize` está desligado. `@Column()` sem `nullable: true` e sem `default` é `NOT NULL`.
**How to avoid:** O `CREATE TABLE` declara tipo e, onde a entidade tem default, declara o default também. O `INSERT` mesmo assim lista todas as colunas do grafo, com valor explícito. Ver a tabela de colunas em Code Examples.
**Warning signs:** A primeira semente quebra no `INSERT` e a segunda nem chega a autenticar.

### Pitfall 4: `$2b$` comido pelo PowerShell

**What goes wrong:** A coluna `password` fica com lixo. `bcrypt.compare` devolve false e a API responde 401 `Email e/ou senha incorretos.` Se o valor nem parece hash, o binding pode lançar e o request vira 500: `UserDeliveryRepository.login` não tem `try/catch`.
**Why it happens:** Aspas duplas no PowerShell expandem `$2b`.
**How to avoid:** Node lê e grava o hash com `fs`. O `apply-demo-sql.js` lê o `.sql` como UTF-8 e manda `connection.query`. Não ecoar o hash no shell.
**Warning signs:** `SELECT password FROM userdelivery WHERE id = 1` não começa com `$2b$10$`.

### Pitfall 5: Reexecução deixa fila ou muda o id

**What goes wrong:** O pedido `1` continua com linha em `deliveryqueue`, ou o autoincrement grava o pedido como `2`.
**Why it happens:** `INSERT` sem id, ou `ON DUPLICATE KEY UPDATE` que não apaga a fila. FK impede `DELETE FROM shoppings` enquanto a fila existir.
**How to avoid:** `DELETE` da fila primeiro, depois o pedido, depois as pessoas. `INSERT` com `id` `1` explícito.
**Warning signs:** `SELECT COUNT(*) FROM deliveryqueue WHERE shoppingId = 1` maior que 0 depois do segundo `npm run seed`.

### Pitfall 6: Senha que não passa no DTO

**What goes wrong:** 400 antes de chegar no banco. O exemplo `123456` do Swagger não passa.
**Why it happens:** `LoginAuthDto.password` exige 6 caracteres, maiúscula, minúscula, número e símbolo.
**How to avoid:** Usar `Entrega1!`. O body do login do entregador é e-mail e senha. `storeCode` é opcional e o repository do entregador ignora.
**Warning signs:** `400` com mensagem do `class-validator`, não `401`.

### Pitfall 7: Boot quebra no template de e-mail, não no SMTP

**What goes wrong:** A API não escuta a porta 3000.
**Why it happens:** `MailingService` está no `UserModule`, que o `AuthModule` importa. O construtor faz `readFileSync` de `templates/confirmation.hbs` e `templates/recoverPassword.hbs` via `join(__dirname, '../../templates')`. Não conecta SMTP. Os dois arquivos existem. `nest-cli.json` não liga Webpack, então `__dirname` em `dist/services` aponta para `templates/` na raiz.
**How to avoid:** Não mover os templates. Não descomentar `//this.mailingService` em `AuthService`. Manter os `MAIL_*` do exemplo para o `createTransport` receber string.
**Warning signs:** `ENOENT` em `confirmation.hbs` no stack do boot.

### Pitfall 8: MySQL ainda não aceita conexão

**What goes wrong:** `npm run seed` logo após `docker compose up -d` toma `ECONNREFUSED`.
**Why it happens:** O processo `mysqld` termina a inicialização depois do container passar a existir.
**How to avoid:** No `apply-demo-sql.js`, repetir a conexão por cerca de 30 segundos só em erro de conexão. Healthcheck com `mysqladmin ping` no Compose é apoio, não substituto: o seed roda no host.
**Warning signs:** A primeira tentativa falha e, dez segundos depois, a mesma semente funciona.

## Code Examples

Valores abaixo estão copiados dos arquivos lidos nesta sessão. O esqueleto SQL só usa esses literais e os valores fechados no CONTEXT (`Entrega1!`, `4821`, `2312`, ids `1`).

### Papéis, status e senha

```1:6:src/enums/role.enum.ts
export enum Role {
  User = '1',
  Admin = '2',
  Recover = '3',
  Delivery = '4',
  Master = '5',
}
```

```1:9:src/enums/solicitacaoCompraStatus.enum.ts
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

```1:5:src/enums/modoPagamento.enum.ts
export enum modoPagamento {
  Credit = 1,
  Debit = 2,
  Pix = 3,
}
```

```1:4:src/enums/deliveryStatus.enum.ts
export enum DeliveryStatus {
  Waiting = 1,
  Finished = 2,
}
```

```12:32:src/dtos/login/login.dto.ts
  @ApiProperty({
    example: '123456',
    description:
      'Senha do usuario - Pelo menos 6 digitos, 1 numero, 1 simbolo, 1 letra maiuscula, 1 letra minuscula',
  })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty({
    example: '2312',
    description: 'Codigo da empresa',
  })
  @IsString()
  @IsOptional()
  storeCode?: string;
```

`POST /auth/loginDelivery` recebe `LoginAuthDto`, não `LoginDeliveryDto`:

```21:26:src/controllers/auth.controller.ts
  @Post('loginDelivery')
  LoginDeliveryDto(
    @Body() loginAuthDto: LoginAuthDto,
  ): Promise<LoginReturnDto> {
    return this.authService.loginDelivery(loginAuthDto);
  }
```

A classe do controller tem `@Public()`. `AuthGuard` e `RoleGuard` retornam cedo quando `IS_PUBLIC_KEY` está setado (`src/guard/auth.guard.ts` linhas 20-27, `src/guard/role.guard.ts` linhas 17-24).

O login do entregador não filtra `active` nem `role`:

```36:50:src/repositories/userDelivery.repository.ts
  public async login({
    email,
    password,
  }: Partial<LoginAuthDto>): Promise<UserDeliveryEntity> {
    const user = await this.userDeliveryRepository.findOne({
      where: {
        email,
      },
    });

    if (user != null && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      throw new UnauthorizedException('Email e/ou senha incorretos.');
    }
  }
```

O token do entregador:

```121:134:src/services/auth.service.ts
  private createTokenDelivery(id: number) {
    return {
      token: this.jwtService.sign(
        {},
        {
          expiresIn: '7 days',
          subject: JSON.stringify({
            userDelivery: String(id),
          }),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }
```

`issuer` e `audience` na mesma classe: `private issuer = 'login'` e `private audience = 'user'` (linhas 12-13). Com id `1`, o `sub` é `{"userDelivery":"1"}`. A resposta monta `id`, `name`, `role` e `token` (`auth.service.ts` linhas 38-46). Não envia `code` (isso é o login do operador).

O operador, fora do critério desta fase, mas semeado para o comentário e para a fase seguinte, filtra assim:

```170:177:src/repositories/user.repository.ts
    const user = await this.userRepository.findOne({
      where: {
        email,
        storeCode,
        authorized: true,
        active: true,
      },
    });
```

### Tipos MySQL que o DDL deve seguir

Do `MysqlDriver` 0.3.20: `String` → `varchar` com default de comprimento 255; `Boolean` / `"boolean"` → `tinyint`; `Number` → `int`; `CreateDateColumn` / `UpdateDateColumn` → `datetime` precisão 6 e default `CURRENT_TIMESTAMP(6)`. [CITED: https://raw.githubusercontent.com/typeorm/typeorm/0.3.20/src/driver/mysql/MysqlDriver.ts] Boolean no default do driver vira `1` ou `0`.

O decorator `enum: [Role]` não é `type: 'enum'`. A propriedade é `string`. Tratar `role` de `userbackoffice` e `userdelivery` como `varchar(255)`, não como `ENUM`. Guardar `'1'` e `'4'`.

```42:46:src/entities/user.entity.ts
  @Column({
    enum: [Role],
  })
  role: string;
```

```44:47:src/entities/userDelivery.entity.ts
  @Column({
    enum: [Role],
  })
  role: string;
```

`users.role` é número, com default `Role.User` (a string `'1'`). No SQL, coluna `int` e valor `1`.

```46:49:src/entities/userClient.entity.ts
  @Column({
    default: Role.User,
  })
  role: number;
```

O pedido aponta para o cliente pela coluna `userEntityId`, não `userClientId`:

```56:74:src/entities/shopping.entity.ts
  @Column({ name: 'userEntityId' })
  userClientId: number;
  // ...
  @ManyToOne(
    () => UserClientEntity,
    (userClientEntity) => userClientEntity.shoppingEntity,
    {},
  )
  @JoinColumn({ name: 'userEntityId' })
  userClientEntity: UserClientEntity;
```

Status do pedido semeado: `6`. Default da entidade é `Created` (`1`); o `INSERT` tem de passar `6` explícito.

```37:44:src/entities/shopping.entity.ts
  @Column({
    default: solicitacaoCompraStatus.Created,
  })
  status: number;

  @Column()
  verificationCode: string;
```

`VALUE` no MySQL 8.4 é keyword não reservada; `VALUES` é reservada. [CITED: https://dev.mysql.com/doc/refman/8.4/en/keywords.html] A coluna se chama `value`. Usar crase em todos os identificadores do SQL.

Não criar `UNIQUE` em `deliveryqueue.shoppingId`. A recusa `Shopping já usado` é regra da fase 2, no serviço, não uma constraint desta fase.

### Identidade que o plano deve gravar

Escolha fechada para o plano (D-13 deixa os nomes com o plano):

| Quem | Tabela | id | E-mail | Outros |
|------|--------|----|--------|--------|
| Cliente | `users` | 1 | `cliente.demo@example.com` | nome `Cliente Demo`; `role` `1`; `cpf` `00000000000`; `numero` `0`; `birthAt` NULL |
| Operador | `userbackoffice` | 1 | `operador.demo@example.com` | nome `Operador Demo`; `role` `'1'`; `storeCode` `2312`; `authorized` `1`; `active` `1`; senha hash de `Entrega1!` |
| Entregador | `userdelivery` | 1 | `entregador.demo@example.com` | nome `Entregador Demo`; `role` `'4'`; `active` `1`; `acceptTerms` `1`; senha o mesmo hash |
| Pedido | `shoppings` | 1 | — | `verificationCode` `4821`; `status` `6`; `storeCode` `2312`; `userEntityId` `1`; `modoPagamento` `1`; `value` `42.00` |

Endereços fictícios: `storeAddress` `Rua das Acácias, 100`; `deliveryAddress` `Rua do Comércio, 50`; `deliveryTime` `30 min`; `duration` `15 min`.

Falsos, todos cabendo no `length` lido na entidade: `phoneNumber` `00000000000` (`length: 11`), `cpf` do entregador `00000000000` (`length: 11`), `numberVehicle` `DEMO-000` (sem length → `varchar(255)`), `validCode` `0`, `userAuthorized` `0`, `validatedEmail` `1`.

`active` do entregador vai `1` mesmo com o login ignorando a coluna, para a linha não nascer no default `false` da entidade se um `INSERT` futuro omitir o campo. O `INSERT` desta fase inclui o valor.

Comentário obrigatório no topo de `seed/demo.sql` (a fase 3 copia daqui; não escrever o README agora):

```sql
-- Demo iFarma. Copie estes valores; não há senha no .env.example.
-- Entregador: entregador.demo@example.com / Entrega1!
-- Operador: operador.demo@example.com / Entrega1! / storeCode 2312
-- Pedido: 1 / verificationCode 4821
```

### Compose

```yaml
services:
  mysql:
    image: mysql:8.4.11
    environment:
      MYSQL_ROOT_PASSWORD: ifarma-root
      MYSQL_DATABASE: ifarma
      MYSQL_USER: ifarma
      MYSQL_PASSWORD: ifarma
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - ifarma_mysql:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uifarma", "-pifarma"]
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 30s

volumes:
  ifarma_mysql:
```

A flag de charset é o exemplo da imagem oficial. [CITED: https://hub.docker.com/_/mysql/] `MYSQL_USER` e `MYSQL_PASSWORD` juntos criam o usuário com permissão de superusuário no database de `MYSQL_DATABASE`. Não montar `seed/demo.sql` em `docker-entrypoint-initdb.d`. Não colocar `ifarma-root` no `.env.example`.

O healthcheck assume `mysqladmin` na imagem. Se o check falhar porque o binário não está no PATH, tirar o healthcheck e ficar só com o retry do script. [ASSUMED]

### `.env.example`

Chaves que o código lê, com os valores de D-02 e D-03. Cabeçalho em comentário `#` (o dotenv trata linha que começa com `#` como comentário). [CITED: https://github.com/motdotla/dotenv/blob/v16.4.5/README.md]

```
# Copie este arquivo para .env. Não commite o .env.
# Os valores já batem com o compose.yaml. MySQL 8.4.11 local pode ajustar DB_*.

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=ifarma
DB_PASSWORD=ifarma
DB_DATABASE=ifarma
JWT_SECRET=demo-jwt-secret-ifarma
ENV=demo
MAIL_HOST=localhost
MAIL_PORT=1025
MAILER_SECURE=false
MAIL_USER=demo
MAIL_PASSWORD=demo
MAIL_FROM=no-reply@example.com
CLIENT_URL=http://localhost:3000
```

`.gitignore` já contém `.env` na linha 45. Não ignorar `.env.example`.

### Script da semente

`multipleStatements` default é `false`. Ligar só nesta conexão e usar `query`, não `execute`. [CITED: https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Connection.d.ts]

```javascript
// scripts/apply-demo-sql.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const db = process.env.DB_DATABASE;
if (!/^[A-Za-z0-9_]+$/.test(db || '')) {
  throw new Error('DB_DATABASE invalido');
}

const sql = fs.readFileSync(path.join(__dirname, '../seed/demo.sql'), 'utf8');
const marker = '\n-- @schema\n';
const cut = sql.indexOf(marker);
if (cut < 0) throw new Error('seed/demo.sql sem marcador -- @schema');

async function connect() {
  let last;
  for (let i = 0; i < 30; i++) {
    try {
      return await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
        charset: 'utf8mb4',
      });
    } catch (err) {
      last = err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw last;
}
```

O arquivo SQL coloca `CREATE DATABASE` e `USE` antes da linha `-- @schema`. O script roda esse preâmbulo sentença a sentença. Em erro 1044 no `CREATE DATABASE`, tenta `USE`. O miolo depois do marcador vai num único `query`. `charset: 'utf8mb4'` no cliente é [ASSUMED] como nome de opção do mysql2; o que fixa os acentos é o charset do servidor e o `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` no `CREATE DATABASE` e em cada `CREATE TABLE`.

Não colocar `;` dentro de string no SQL. O hash bcrypt não tem ponto e vírgula.

### Prova manual de SEED-02

`workflow.nyquist_validation` está `false`. Não criar spec nesta fase. Depois de `npm run seed` duas vezes e `npm run start:dev`:

```http
POST /auth/loginDelivery
Content-Type: application/json

{"email":"entregador.demo@example.com","password":"Entrega1!"}
```

O body de sucesso traz `token`, `id` `1`, `name` `Entregador Demo` e `role` `"4"`. Código HTTP do `@Post()` do Nest não foi conferido nesta sessão; afirmar o JSON, não só o status. [ASSUMED]

Consulta, com o cliente que está dentro do container (não há `mysql` no host):

```bash
docker compose exec mysql mysql -uifarma -pifarma ifarma -e "SELECT id, email, role FROM userdelivery WHERE id = 1; SELECT id, verificationCode, status, storeCode FROM shoppings WHERE id = 1; SELECT COUNT(*) AS fila FROM deliveryqueue WHERE shoppingId = 1;"
```

Esperado: entregador `1` / `entregador.demo@example.com` / `4`; pedido `1` / `4821` / `6` / `2312`; `fila` `0`. Rodar `npm run seed` de novo e repetir a contagem.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `dotenv.config()` depois dos imports | `import 'dotenv/config'` como primeiro import, ou `node -r dotenv/config` | Contrato do dotenv 16, já a versão do lock | `forRoot` síncrono passa a ver `DB_*` e `JWT_SECRET` |
| `VALUES(col)` no upsert | Alias `AS new` no `INSERT ... ON DUPLICATE KEY UPDATE` | Deprecado no MySQL 8.0.20, ainda descrito como deprecado no manual 8.4 | Esta fase não usa upsert. Usa `DELETE` + `INSERT` |
| `synchronize: true` para criar tabela | SQL versionado com `ENV=demo` | Decisão D-17 deste marco | O literal `developmen` fica. O boot da demo não emite DDL |

**Deprecated/outdated:**

- `node --env-file` como único mecanismo: `nest start` não repassa a flag sozinho. O preload do dotenv cobre o boot e o seed.
- Tag `mysql:latest` ou `mysql:lts`: D-01 fixa `8.4.11`.
- Pesquisa anterior que deixava `MAIL_*` fora do exemplo: o CONTEXT (D-03) inclui esses placeholders. A discussão prevalece.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `CREATE DATABASE` com o usuário `ifarma` falha com 1044 mesmo quando o database já existe | Pitfall 2 | Se o `IF NOT EXISTS` for no-op sem privilégio, o `try/catch` nunca dispara e a semente segue. O plano continua correto. Se outro errno aparecer, o script precisa tratar esse código. |
| A2 | `charset: 'utf8mb4'` é aceito pelo `mysql2` 3.9.7 nesta conexão | Code Examples | Mojibake só se o cliente e o servidor discordarem. O `CREATE` com `utf8mb4_unicode_ci` ainda protege o dado. |
| A3 | A imagem `mysql:8.4.11` tem `mysqladmin` no PATH | Compose | Healthcheck fica unhealthy. Tirar o healthcheck; o retry do script cobre o seed. |
| A4 | `@Post()` do Nest responde 201 | Prova manual | Quem automatizar o curl pelo status erra. Afirmar `token` e `role`. |
| A5 | O binário N-API v3 do bcrypt 5.1.1 carrega no Node v24.5.0 desta máquina | Environment | `npm ci` ou `require('bcrypt')` falha e o hash não é gerado. Não trocar o pacote. Parar e reportar. |
| A6 | `role` com `enum: [Role]` vira `varchar`, não `ENUM` do MySQL | DDL | Se o TypeORM tratar isso como enum nativo, um `varchar(255)` ainda aceita `'1'` e `'4'` nas queries do login. `synchronize` está desligado, então o SQL é o schema. |

**If this table is empty:** não se aplica. Os itens acima precisam de confirmação só se a execução esbarrar neles. Nenhum muda D-01–D-18.

## Open Questions

1. **Errno exato de `CREATE DATABASE` quando `ifarma` já existe e o usuário não tem `CREATE` global**
   - What we know: a sentença exige privilégio `CREATE`. O Compose concede `GRANT ALL` no database `ifarma`, não necessariamente `CREATE` global.
   - What's unclear: se `IF NOT EXISTS` ainda consulta o privilégio quando o database está lá.
   - Recommendation: preâmbulo isolado; 1044 com `USE` bem-sucedido segue; qualquer outro erro aborta.

2. **`require('bcrypt')` depois de `npm ci` no Node 24.5.0**
   - What we know: o lock é 5.1.1, `engines` `>= 10`, e o release publica prebuild `napi-v3` para `win32-x64`. `node_modules` não está presente agora.
   - What's unclear: se o install script completa nesta máquina.
   - Recommendation: a primeira tarefa de implementação roda `npm ci` e um `require('bcrypt')`. Falhou: parar. Não adicionar `bcryptjs` nem subir a major.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Boot, seed, gerar hash | ✓ | v24.5.0 | — |
| npm | `npm ci` / `npm run seed` | ✓ | 11.9.0 | — |
| Docker | `compose.yaml` | ✓ | 29.8.0 | MySQL 8.4.11 local e `DB_*` ajustados (D-01) |
| Docker Compose | Subir o serviço `mysql` | ✓ | v5.5.1 | Mesmo fallback local |
| Cliente `mysql` no host | Não usar | ✗ | — | `mysql2` no script; `docker compose exec` só para a prova manual |
| `node_modules` | `bcrypt`, `mysql2`, `dotenv` | ✗ | — | `npm ci` com o lock atual, sem pacote novo |
| MySQL já escutando em 3306 | Porta do exemplo | Não probeado | — | Quem já tem MySQL local ajusta `DB_PORT` ou não sobe o Compose |

**Missing dependencies with no fallback:**

- Nenhuma. `npm ci` restaura o que o lock já descreve.

**Missing dependencies with fallback:**

- Cliente `mysql` no Windows: o seed não precisa dele.
- Imagem Docker, se o pull falhar: MySQL 8.4.11 instalado na máquina, mesmas `DB_*`. Não trocar a tag para `latest`.

Graphify está desligado (`graphify is not enabled`). Sem contexto de grafo nesta pesquisa.

## Security Domain

Nível ASVS do config: 1. A fase não abre superfície nova de login. Ela publica credencial fictícia de propósito (D-09) e prende o MySQL em localhost.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Rota existente. Senha só como hash bcrypt no `INSERT`. Texto `Entrega1!` apenas no comentário do SQL, que a fase 3 vai copiar. Não criar usuário real. |
| V3 Session Management | yes | JWT já emitido com `JWT_SECRET`. O exemplo usa `demo-jwt-secret-ifarma`. Não mudar `issuer`, `audience` nem o `sub`. |
| V4 Access Control | yes | `POST /auth/loginDelivery` permanece `@Public()`. Não alargar guard. |
| V5 Input Validation | yes | `LoginAuthDto` já valida a senha. O script da semente só interpola `DB_DATABASE` se casar `^[A-Za-z0-9_]+$`. O resto do SQL é arquivo do repositório. |
| V6 Cryptography | yes | `bcrypt` 5.1.1 do lock. Não implementar hash. |

### Known Threat Patterns for this phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| MySQL com senha `ifarma` exposto na rede | Information disclosure | Publicar `127.0.0.1:3306:3306`, não `0.0.0.0`. Root `ifarma-root` só no Compose. |
| `.env` commitado | Information disclosure | Já está no `.gitignore`. Versionar só `.env.example`. |
| Hash `$2b$` truncado pelo shell | Tampering | Node grava o hash. O SQL via `fs` + `mysql2`. |
| `multipleStatements` com SQL de fora | Tampering | A flag existe só na conexão do script, e o texto é `seed/demo.sql` lido do disco. |
| Segredo de produção no exemplo | Information disclosure | Valores são de demo (`ifarma`, `demo-jwt-secret-ifarma`, `MAIL_PASSWORD=demo`). Não colar credencial real. |
| Login do entregador sem checar `active` | Elevation of privilege | Comportamento atual. Fora desta fase. A linha semeada nasce `active` `1` mesmo assim. |

Não adicionar rate limit, CORS fechado nem revogação de JWT. O PROJECT marca isso como fora do portfólio.

## Sources

### Primary (HIGH confidence)

- `src/main.ts`, `src/app.module.ts`, `src/modules/auth.module.ts` — ordem do dotenv, `synchronize`, `JWT_SECRET`
- `src/controllers/auth.controller.ts`, `src/services/auth.service.ts`, `src/repositories/userDelivery.repository.ts`, `src/repositories/user.repository.ts`, `src/dtos/login/login.dto.ts` — contrato de `POST /auth/loginDelivery`
- `src/entities/user.entity.ts`, `src/entities/userDelivery.entity.ts`, `src/entities/userClient.entity.ts`, `src/entities/shopping.entity.ts`, `src/entities/deliveryQueue.entity.ts` — colunas e nomes de tabela
- `src/enums/role.enum.ts`, `src/enums/solicitacaoCompraStatus.enum.ts`, `src/enums/modoPagamento.enum.ts`, `src/enums/deliveryStatus.enum.ts`
- `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/services/mailingService.ts`, `package.json`, `package-lock.json`, `.gitignore`, `tsconfig.json`, `nest-cli.json`
- `.planning/phases/01-demo-que-autentica/01-CONTEXT.md` — decisões travadas

### Secondary (MEDIUM confidence)

- [dotenv 16.4.5 README](https://github.com/motdotla/dotenv/blob/v16.4.5/README.md) — `import 'dotenv/config'`, preload `--require`, override default false
- [Docker Hub mysql](https://hub.docker.com/_/mysql/) — `MYSQL_*`, charset no command, initdb só no primeiro datadir
- [Docker Hub tag 8.4.11](https://hub.docker.com/v2/repositories/library/mysql/tags/8.4.11) — tag ativa
- [TypeORM MysqlDriver 0.3.20](https://raw.githubusercontent.com/typeorm/typeorm/0.3.20/src/driver/mysql/MysqlDriver.ts) — varchar 255, tinyint, datetime(6)
- [mysql2 Connection.d.ts](https://github.com/sidorares/node-mysql2/blob/master/typings/mysql/lib/Connection.d.ts) — `multipleStatements` default false
- [MySQL 8.4 CREATE DATABASE](https://dev.mysql.com/doc/refman/8.4/en/create-database.html)
- [MySQL 8.4 INSERT ON DUPLICATE](https://dev.mysql.com/doc/refman/8.4/en/insert-on-duplicate.html)
- [MySQL 8.4 keywords](https://dev.mysql.com/doc/refman/8.4/en/keywords.html)
- [bcrypt 5.1.1 release](https://github.com/kelektiv/node.bcrypt.js/releases/tag/v5.1.1) e README da API `hashSync` / `genSalt`

Context7 e `ctx7` não estão disponíveis neste agente. As páginas oficiais foram lidas por fetch e busca. O seam `classify-confidence` marcou `websearch --verified` como MEDIUM e `webfetch` como LOW.

### Tertiary (LOW confidence)

- Presença de `mysqladmin` na imagem `mysql:8.4.11`
- Nome exato da opção `charset` do mysql2 3.9.7
- Status HTTP default de `@Post()` no Nest 10
- `require('bcrypt')` no Node 24.5.0 antes de `npm ci`

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH para os pacotes do lock e a tag Docker; a fase não introduz biblioteca
- Architecture: HIGH para o fluxo de login e o ponto em que o `process.env` é lido; MEDIUM para o DDL escrito à mão bater com o que o TypeORM leria se `synchronize` estivesse ligado
- Pitfalls: HIGH para dotenv tarde, hash no PowerShell e `NOT NULL`; MEDIUM para o privilégio `CREATE` do usuário do Compose

**Research date:** 2026-10-04
**Valid until:** 2026-11-03 (stack estável; a tag `8.4.11` é pinada)

Context7 não foi consultado (MCP e CLI ausentes). Graphify desligado. `nyquist_validation` false: sem seção de arquitetura de testes.
