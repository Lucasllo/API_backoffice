# Pesquisa de stack

**Domínio:** demo local do backoffice iFarma / Colibri (NestJS + MySQL) — ambiente, semente e um comando de teste do caminho enfileirar → confirmar
**Pesquisado:** 2026-10-04
**Confiança:** MÉDIA

O repositório já é a stack. Este marco não troca NestJS, TypeORM, MySQL nem npm. O que falta para um clone percorrer o pedido semeado é runtime suportado, um MySQL 8.4 com schema e linhas fictícias, o `.env` lido antes de `TypeOrmModule.forRoot` e de `JwtModule.register`, e um script Jest que rode um único spec. Nenhum pacote novo entra no `package.json`.

Context7 não está neste ambiente. As páginas oficiais foram lidas por WebFetch e WebSearch. O seam marca WebFetch como BAIXA mesmo com verificação cruzada, e WebSearch verificado como MÉDIA. Versões já gravadas em `package-lock.json` ficam em ALTA.

## Stack recomendada

### Tecnologias centrais

| Tecnologia | Versão | Função | Por que |
|------------|--------|--------|---------|
| Node.js | 22.x (Maintenance LTS até 2027-04-30) | Runtime do `nest start` e do Jest | O calendário oficial marca Node 20 como EOL em 2026-04-30. Node 22 ainda recebe correção de segurança. `@nestjs/core@10.3.8` não declara `engines`; o anúncio da v10.0.0 exige Node `>=16`, sem teto. Os tipos instalados continuam `@types/node` 20.12.12: a demo não usa API exclusiva de Node 24. Confiança MÉDIA no calendário; ALTA na ausência de `engines` no pacote 10.3.8. |
| NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/testing`) | 10.3.8 (faixa `^10.0.0`) | API HTTP e o módulo de teste | É o processo que o portfólio mostra. A página atual de testes do Nest descreve Vitest para projeto novo; este repositório já tem Jest em `package.json`. Confiança ALTA na versão do lock; MÉDIA na leitura da página de testes (o texto publicado descreve o starter atual, não o 10.3.8). |
| TypeORM + `@nestjs/typeorm` | 0.3.20 e 10.0.2 | ORM e a conexão única em `src/app.module.ts` | A demo grava `deliveryqueue` e `shoppings` com as entities que já existem. A documentação do TypeORM trata `synchronize: true` como inseguro quando já há dado e aponta migrations para evoluir schema. Este marco não abre pasta `migrations/`. Confiança ALTA na versão; MÉDIA no aviso de `synchronize` (página de migrations). |
| `mysql2` | 3.9.7 | Driver que o TypeORM usa com `type: 'mysql'` | Já está no lock. O README atual do mysql2 não publica matriz de versão de servidor. O protocolo de consulta e o `caching_sha2_password` do MySQL 8 são o que a 3.9.x já fala. Confiança ALTA na versão instalada; MÉDIA em “3.9.7 atende 8.4.11 para CRUD da demo”. |
| MySQL Server | 8.4.11 (tag Docker `mysql:8.4.11`) | Banco local da demo | Linha 8.4 LTS (Premier Support até 2029-04). A imagem oficial, no README lido nesta pesquisa, aponta `latest` para 26.7 (innovation) e `lts` para 9.7.2. A tag `8.4.11` é a linha 8.4. MySQL 8.0 está em Sustaining Support desde 2026-04-21. Confiança MÉDIA nas tags (README da imagem + aviso de EOL da Oracle). |
| Jest + `ts-jest` | 29.7.0 e 29.1.2 | O único runner da prova | Já configurado. A CLI 29.7 trata argumento posicional como regex, oferece `--runTestsByPath` para caminho exato e `--runInBand` para rodar no processo atual. `--passWithNoTests` faz a suíte passar com zero arquivos. Confiança ALTA nas versões do lock; MÉDIA na CLI (página 29.7). |

### Bibliotecas de apoio

| Biblioteca | Versão | Função | Quando usar |
|------------|--------|--------|-------------|
| `dotenv` | 16.4.5 | Carregar `.env` em `process.env` | Sempre, antes de avaliar `AppModule`. O README dessa versão manda `import 'dotenv/config'` o mais cedo possível. `ConfigModule.forRoot()` (já presente via `@nestjs/config` 3.2.2) só corre depois que `TypeOrmModule.forRoot` e `JwtModule.register` já leram `process.env`. O spec e2e importa `AppModule` e não executa `src/main.ts`, então o script do teste e o da semente usam `node -r dotenv/config`. Confiança MÉDIA (README 16.4.5 + ordem de import já vista em `src/main.ts`). |
| `bcrypt` | 5.1.1 | Hash da senha do entregador, o mesmo módulo de `UserDeliveryRepository.login` | A semente versiona o hash gerado por este pacote. O release 5.1.1 publica prebuild N-API v3 `win32-x64`. No Windows x64 o `npm ci` baixa esse binário e não exige Visual Studio. Confiança MÉDIA (assets do release 5.1.1). |
| `supertest` + `@types/supertest` | 6.3.4 e 2.0.16 | HTTP contra `app.getHttpServer()` | O comando da demo sobe o `AppModule` real. A página de testes do Nest descreve `request(app.getHttpServer())` e `app.close()` no `afterAll`. Confiança ALTA na versão do lock; MÉDIA no contrato da página de testes. |
| `@nestjs/jwt` | 10.2.0 | Bearer de `POST /auth/loginDelivery` | Já emite o token com `JWT_SECRET`. A carga antecipada do `.env` cobre este `register` junto com o TypeORM. Sem biblioteca nova de sessão. Confiança ALTA (lock + `src/modules/auth.module.ts`). |
| `@nestjs/config` | 3.2.2 | Já importado em `src/app.module.ts` | Permanece. Não é o mecanismo que preenche `DB_HOST` para o `forRoot` síncrono. Não migrar os dois módulos para `forRootAsync` neste marco: o `import 'dotenv/config'` acerta TypeORM e JWT de uma vez. Confiança ALTA na versão; MÉDIA no limite do `forRoot`. |

### Ferramentas de desenvolvimento

| Ferramenta | Função | Notas |
|------------|--------|-------|
| npm + `package-lock.json` (lockfileVersion 3) | Instalar exatamente o que o lock trava | `npm ci`. Sem Yarn e sem pnpm. |
| `.nvmrc` com `22` e `"engines": { "node": ">=22 <23" }` | Fixar o runtime do clone | O campo `engines` ainda não existe. Node 20 fica de fora por EOL. Node 24 e 26 ficam de fora deste marco para o clone não divergir dos tipos 20. |
| `.env.example` na raiz | Contrato de ambiente, sem segredo | Copiar para `.env` (já está no `.gitignore`). Chaves que o código lê no caminho da demo: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`. `ENV` fica `demo`. Esse valor não é `developmen`, então `synchronize` em `src/app.module.ts` permanece desligado. `MAIL_*` e `CLIENT_URL` ficam de fora: `MailingService` não envia e-mail neste fluxo. O construtor cria o transporte sem conectar. |
| `compose.yaml` | Subir o MySQL da demo | Serviço com imagem `mysql:8.4.11`, `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` iguais ao `.env.example`, porta `3306:3306`, comando `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci` (o README da imagem documenta essas flags). Healthcheck com `mysqladmin ping` dentro do container. O diretório `/docker-entrypoint-initdb.d` só roda com datadir vazio; a semente repetível não depende dele. |
| `seed/demo.sql` + `scripts/apply-demo-sql.js` | Schema e linhas fictícias | SQL versionado: `CREATE TABLE` das tabelas da demo e `DELETE`/`INSERT` idempotente de loja, operador, entregador e um pedido sem linha em `deliveryqueue`. Ids e `verificationCode` fixos. O hash bcrypt vai no arquivo; a senha em texto fica só no README. O script Node lê o arquivo com `mysql2` (opção `multipleStatements` só nessa conexão) depois de `dotenv/config`. Assim o PowerShell não expande `$2b$`. Confiança MÉDIA na opção `multipleStatements` (não há matriz nova nesta pesquisa; é flag antiga do driver). |
| Script npm `test:delivery` | A prova, e nada mais | Ver bloco de instalação. Arquivo `test/delivery-confirm.e2e-spec.ts`, config já existente `test/jest-e2e.json` (`rootDir` `.`, regex `.e2e-spec.ts$`). |

## Instalação

Nada entra em `dependencies` nem em `devDependencies`. O lock atual já contém Nest 10, TypeORM, mysql2, dotenv, bcrypt, Jest, ts-jest, `@nestjs/testing` e supertest.

```bash
# Runtime: Node.js 22.x (https://nodejs.org/en/about/previous-releases)
npm ci

# Banco. Exige Docker. Não use a tag latest nem a tag lts.
docker compose up -d

# Copia .env.example para .env e aplica schema + semente (repetível)
npm run seed

# Sobe a API (Swagger em http://localhost:3000/api)
npm run start:dev

# Prova só o caminho enfileirar e confirmar
npm run test:delivery
```

Scripts a acrescentar em `package.json` (sem pacote novo):

```json
"seed": "node -r dotenv/config scripts/apply-demo-sql.js",
"test:delivery": "node -r dotenv/config ./node_modules/jest/bin/jest.js --config ./test/jest-e2e.json --runTestsByPath test/delivery-confirm.e2e-spec.ts --runInBand"
```

`src/main.ts` passa a ter `import 'dotenv/config'` como primeiro import, antes de `./app.module`. O `dotenv.config()` que hoje fica depois dos imports não preenche o objeto já montado do `forRoot`.

Quem já tem MySQL 8.4 local aponta `DB_*` para ele e pula o `docker compose`. O mesmo `npm run seed` aplica o SQL.

## Alternativas consideradas

| Recomendado | Alternativa | Quando a alternativa cabe |
|-------------|-------------|---------------------------|
| `import 'dotenv/config'` e `node -r dotenv/config` | `TypeOrmModule.forRootAsync` + `JwtModule.registerAsync` com `ConfigService` | Quando uma fase for refazer a configuração de propósito. As duas pontas (banco e JWT) precisam mudar juntas. Para a demo, o preload único é menor. |
| SQL versionado + script `mysql2` | `synchronize` com `ENV=developmen` | Em um banco vazio de experimento descartável, sem dado que importe. A documentação do TypeORM avisa perda de dado. Neste marco o literal `developmen` permanece, e o exemplo de ambiente não usa esse valor. |
| SQL versionado, sem CLI de migration | `typeorm migration:run` | Quando existir pipeline de schema. O projeto deixa esse pipeline fora enquanto a demo sobe com um arquivo SQL. |
| Imagem `mysql:8.4.11` | MySQL Community Server 8.4.11 instalado no Windows (MSI ou ZIP em dev.mysql.com) | Quando Docker não estiver disponível. Mesma linha 8.4, mesmas variáveis `DB_*`. |
| Jest 29 com `--runTestsByPath` no e2e | Spec em `src/tests/` com `useValue` nos repositórios | Quando a prova for só o `await` e o `id` do `save`, sem MySQL. O comando do portfólio sobe `AppModule` e o banco semeado, como o caminho que o README descreve. |
| `bcrypt` 5.1.1 | `bcrypt` 6.x | Se o prebuild N-API v3 não baixar (rede bloqueada ou Windows ARM, ausente nos assets 5.1.1). Aí o fallback é compilar o 5.1.1, ou subir de major com o mesmo `hash`/`compare`. Não é o caminho padrão: o login já importa o 5.1.1. |

## O que não usar

| Evitar | Por quê | No lugar |
|--------|---------|----------|
| NestJS 11, Vitest, Prisma, Drizzle, Sequelize | A página atual do Nest apresenta Vitest e outros ORMs para app novo. Trocar o runner ou o ORM reescreve o portfólio. | Nest 10.3.8, Jest 29.7.0, TypeORM 0.3.20 |
| Jest 30 | A CLI 30 renomeia `--testPathPattern`. O lock está em 29.7.0, que documenta `--runTestsByPath`. | Jest 29.7.0 |
| `npm test` e `npm run test:e2e` como prova | `npm test` coleta `src/tests/**/*.spec.ts`, inclusive `app.controller.spec.ts`, que importa módulo ausente. `test:e2e` também pega `test/app.e2e-spec.ts`, que espera `GET /` com `Hello World!`. | `npm run test:delivery` |
| `--passWithNoTests` | A CLI 29.7 deixa a suíte passar quando nenhum arquivo casa. Um caminho errado vira verde. | `--runTestsByPath` com o caminho completo `test/delivery-confirm.e2e-spec.ts` |
| Tag Docker `mysql:latest` ou `mysql:lts` | No README oficial lido hoje, `latest` é 26.7 e `lts` é 9.7.2. As duas são posteriores ao `mysql2` 3.9.7 e não são a linha 8.4. | `mysql:8.4.11` |
| MySQL 8.0 para um clone novo | Sustaining Support desde 2026-04-21. A Oracle encaminha para 8.4 LTS. | 8.4.11 |
| `typeorm-extension`, `typeorm-seeding`, Testcontainers, SQLite, `bcryptjs` | Pacote extra, segundo bootstrap ou segundo algoritmo de senha. `bcryptjs` no lugar do `bcrypt` muda o módulo que `loginDelivery` chama. | `seed/demo.sql`, `mysql2`, `bcrypt` 5.1.1 |
| `dotenvx`, dotenv-vault, `envalid`, Joi de ambiente | O README do dotenv 16 anuncia dotenvx para vários ambientes e cofre. A demo tem um `.env.example` com valores fictícios. | `dotenv` 16.4.5 |
| `node --env-file=.env` como único mecanismo | Node 22 carrega env por flag, mas `nest start --watch` não passa essa flag sozinho. No Windows o script npm ainda teria de compor a flag. | `import 'dotenv/config'` no `main.ts` e `-r dotenv/config` no seed e no Jest |
| Bull, Redis, fila externa | A fila da demo é a tabela `deliveryqueue`. | TypeORM + MySQL |
| SMTP, Mailhog, Mailpit | Recuperação de senha está fora do caminho. | Não definir `MAIL_*` no exemplo |
| Pacote npm `fs` e a dependência `"api_ifarma": "file:"` | Já estão no `package.json` e não são o driver da demo. Não acrescentar feature por essas entradas. | Módulo nativo `node:fs` se algum script ler arquivo |

## Padrões por variante

**Se o clone está no Windows x64 (este ambiente):**
- Use Node 22 e o prebuild N-API v3 do `bcrypt` 5.1.1 (`win32-x64`).
- O script npm usa barras `/` em `test/delivery-confirm.e2e-spec.ts`. A CLI do Jest 29 pede `/` ou `\\` escapado no padrão; `--runTestsByPath` recebe o caminho exato e evita essa regex.
- A semente entra por arquivo lido no Node. Um `mysql -e "INSERT ... $2b$..."` no PowerShell expandiria o hash.

**Se o clone já tem MySQL 8.4 e não tem Docker:**
- Use o servidor local na porta 3306 (ou a porta em `DB_PORT`).
- Rode o mesmo `npm run seed`. O `compose.yaml` é o atalho, não uma segunda stack.

**Se o spec e2e segurar o processo depois do `app.close()`:**
- O pool do TypeORM ainda está aberto. Feche a aplicação no `afterAll`, como a página de testes do Nest descreve.
- `--forceExit` é o escape da CLI do Jest quando um handle sobra. Ele não entra no script até esse sintoma aparecer.

## Compatibilidade de versões

| Pacote A | Compatível com | Notas |
|----------|----------------|-------|
| `@nestjs/core@10.3.8` | Node `>=16`; alvo deste marco Node 22.x | Sem campo `engines` no pacote publicado 10.3.8. Node 20 está EOL. Node 24 (Active LTS) não é o runtime documentado aqui. |
| `bcrypt@5.1.1` | Node 22 no Windows x64 via prebuild `napi-v3-win32-x64` | O README atual do bcrypt (master) pede `>=6` a partir do Node 18. O 5.1.1 continua instalável pelo binário N-API v3. Windows ARM não está nos assets desse release. |
| `typescript@5.4.5` + `ts-jest@29.1.2` | Jest 29.7.0 | O transform do `test/jest-e2e.json` já é `ts-jest`. Não há `moduleNameMapper`. Imports do spec e2e seguem o que `ts-jest` resolve a partir da raiz (`src/...` casa com `baseUrl` do `tsconfig.json`). |
| `@nestjs/testing@10.3.8` | `@nestjs/common@10.3.8` | Mesma linha 10.3.8 no lock. Não misturar `@nestjs/testing` 11. |
| `mysql2@3.9.7` | MySQL 8.4.11 | Sem matriz oficial de servidor no README atual. Fora desta combinação: imagens `latest` (26.7) e `lts` (9.7.2). |
| `dotenv@16.4.5` | O `.env` na raiz, carregado antes dos módulos | `ConfigModule` 3.2.2 também depende desse dotenv. Os dois podem coexistir; só o preload cedo alimenta o `forRoot` síncrono. |
| Jest 29.7.0 | `supertest@6.3.4` | O e2e existente em `test/app.e2e-spec.ts` já importa supertest. O spec novo mora em `test/` para casar com `.e2e-spec.ts$`. |

## Fontes

- `package.json` e `package-lock.json` deste repositório — versões travadas (ALTA): Nest 10.3.8 em `@nestjs/testing`, TypeORM 0.3.20, mysql2 3.9.7, dotenv 16.4.5, bcrypt 5.1.1, Jest 29.7.0, ts-jest 29.1.2, supertest 6.3.4, `@types/node` 20.12.12, `@nestjs/config` 3.2.2.
- `.planning/codebase/STACK.md` — variáveis lidas pelo código e a ordem `dotenv.config()` depois dos imports (ALTA, leitura do fonte; `.env` não foi aberto).
- [Nest v10.0.0](https://github.com/nestjs/nest/releases/tag/v10.0.0) — Node `>=16` (MÉDIA, WebSearch).
- [unpkg `@nestjs/core@10.3.8/package.json`](https://unpkg.com/@nestjs/core@10.3.8/package.json) — sem campo `engines` (BAIXA no seam de WebFetch; o JSON foi lido nesta sessão).
- [Node.js releases](https://nodejs.org/en/about/previous-releases) e [nodejs/Release](https://github.com/nodejs/release) — Node 20 EOL 2026-04-30, Node 22 Maintenance LTS até 2027-04-30, Node 24 Active LTS (MÉDIA, WebSearch verificado).
- [bcrypt 5.1.1](https://github.com/kelektiv/node.bcrypt.js/releases/tag/v5.1.1) — asset `bcrypt_lib-v5.1.1-napi-v3-win32-x64-unknown.tar.gz` (MÉDIA).
- [dotenv 16.4.5 README](https://github.com/motdotla/dotenv/blob/v16.4.5/README.md) — `import 'dotenv/config'` cedo (BAIXA no seam; texto do README conferido).
- [Jest CLI 29.7](https://jestjs.io/docs/29.7/cli) — argumento posicional, `--runTestsByPath`, `--runInBand`, `--passWithNoTests`, barras no Windows (BAIXA no seam; seções da página conferidas).
- [Nest testing](https://docs.nestjs.com/fundamentals/testing) — `createNestApplication`, Supertest, `app.close()`, sufixo `.e2e-spec` (BAIXA no seam; a página atual também cita Vitest para projeto novo).
- [TypeORM — por que migrations](https://typeorm.io/docs/migrations/why) — `synchronize: true` inseguro com dado existente (MÉDIA, WebSearch).
- [Docker Library mysql README](https://github.com/docker-library/docs/blob/master/mysql/README.md) — tags `8.4.11` / `8.4` / `8`, `latest` = 26.7, `lts` = 9.7.2; `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`; initdb só no primeiro datadir; `utf8mb4` (BAIXA no seam; README conferido nesta sessão).
- [MySQL EOL](https://www.mysql.com/support/eol-notice.html) — 8.0 em Sustaining Support desde 2026-04-21; encaminha para 8.4 LTS (MÉDIA).

---
*Pesquisa de stack para: demo local do backoffice iFarma / Colibri*
*Pesquisado: 2026-10-04*
