# Stack de tecnologia

**Analysis Date:** 2026-10-04

## Linguagens

**Primária:**

- TypeScript 5.4.5 (faixa `^5.1.3` em `package.json`) — toda a API em `src/`. O compilador emite CommonJS para `dist/`.
- Alvo de compilação: `ES2021` em `tsconfig.json` (`"target": "ES2021"`, `"module": "commonjs"`).

**Secundária:**

- Handlebars 4.7.8 — templates de e-mail em `templates/confirmation.hbs` e `templates/recoverPassword.hbs`, compilados por `src/services/mailingService.ts`.
- JavaScript — configuração do ESLint em `.eslintrc.js` (`module.exports`).

Não há Python, Go, Java, C# nem SQL de migração versionado no repositório.

## Runtime

**Ambiente:**

- Node.js. Os tipos instalados são `@types/node` 20.12.12 (faixa `^20.3.1`). O repositório não fixa a versão do runtime: não existe campo `engines` em `package.json`, nem `.nvmrc`, nem `.node-version`.
- Processo HTTP único. `src/main.ts` sobe a aplicação com `NestFactory.create` e escuta a porta `3000` de forma fixa (`await app.listen(3000)`). Não há variável `PORT`.
- Adaptador HTTP: Express, via `@nestjs/platform-express` 10.3.8.

**Gerenciador de pacotes:**

- npm. Lockfile presente: `package-lock.json` (`lockfileVersion` 3).
- Não há `yarn.lock` nem `pnpm-lock.yaml`.
- A versão do npm não está fixada no repositório.

Comandos de ciclo de vida, definidos em `package.json`:

```bash
npm install          # instala dependências
npm run build        # nest build → dist/
npm run start        # nest start
npm run start:dev    # nest start --watch
npm run start:debug  # nest start --debug --watch
npm run start:prod   # node dist/main
npm run lint         # eslint "{src,apps,libs,test}/**/*.ts" --fix
npm run format       # prettier --write "src/**/*.ts" "test/**/*.ts"
npm run test         # jest
npm run test:watch   # jest --watch
npm run test:cov     # jest --coverage
npm run test:e2e     # jest --config ./test/jest-e2e.json
```

## Frameworks

**Núcleo:**

- NestJS 10.3.8 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, faixa `^10.0.0`) — API HTTP modular. Entrada: `src/main.ts`. Módulo raiz: `src/app.module.ts`.
- TypeORM 0.3.20 + `@nestjs/typeorm` 10.0.2 — ORM. Conexão única em `TypeOrmModule.forRoot` dentro de `src/app.module.ts`. Entidades em `src/entities/`.
- Express (transitivo de `@nestjs/platform-express`) — servidor HTTP. Não há Fastify.
- RxJS 7.8.1 — dependência do NestJS. O código de aplicação em `src/` não compõe streams RxJS nas regras de negócio.

**Testes:**

- Jest 29.7.0 + `ts-jest` 29.1.2 — testes unitários. Configuração inline em `package.json` (`"jest"`), `rootDir`: `src`, regex `.*\.spec\.ts$`.
- `@nestjs/testing` 10.3.8 — módulo de teste do NestJS.
- Supertest 6.3.4 — testes e2e. Configuração em `test/jest-e2e.json`. Spec existente: `test/app.e2e-spec.ts`.
- Specs da aplicação ficam em `src/tests/**/*.spec.ts`, não ao lado de cada arquivo de produção.

**Build e desenvolvimento:**

- `@nestjs/cli` 10.3.2 — build e watch. Configuração em `nest-cli.json` (`sourceRoot`: `src`, `deleteOutDir`: true). O build usa o compilador TypeScript do Nest (não há `webpack.config.*`).
- TypeScript 5.4.5 — `tsc` via Nest. Configuração de build: `tsconfig.build.json` (estende `tsconfig.json` e exclui `node_modules`, `test`, `dist`, `**/*spec.ts`).
- `ts-node` 10.9.2 e `tsconfig-paths` 4.2.0 — usados no script `test:debug`.
- `ts-loader` 9.5.1 — presente nas devDependencies; não há configuração Webpack no repositório que o referencie.
- ESLint 8.57.0 + `@typescript-eslint/parser` e `@typescript-eslint/eslint-plugin` (faixa `^6.0.0`) + `eslint-config-prettier` 9 + `eslint-plugin-prettier` 5 — lint. Configuração: `.eslintrc.js`.
- Prettier 3.2.5 — formatação. Configuração: `.prettierrc` (`singleQuote: true`, `trailingComma: "all"`).
- `source-map-support` 0.5.21 — suporte a source map em desenvolvimento (devDependency padrão do starter Nest).

As pastas `.cursor/skills/` e `.cursor/agents/` são o fluxo GSD de planejamento. Elas não entram no runtime da API e `src/` não as importa.

## Dependências principais

Versões abaixo são as travadas em `package-lock.json`. Faixas declaradas estão em `package.json`.

**Críticas:**

- `@nestjs/config` 3.2.2 — `ConfigModule.forRoot()` em `src/app.module.ts`. O código de aplicação lê `process.env` direto; não há injeção de `ConfigService`.
- `@nestjs/jwt` 10.2.0 — emissão e verificação de JWT em `src/modules/auth.module.ts` e `src/services/auth.service.ts`.
- `@nestjs/swagger` 7.3.1 + `swagger-ui-express` 5.0.0 — OpenAPI e UI em `src/main.ts` (rota `api`). DTOs usam `@ApiProperty`.
- `@nestjs/typeorm` 10.0.2 + `typeorm` 0.3.20 — persistência.
- `mysql2` 3.9.7 — driver MySQL usado pelo TypeORM (`type: 'mysql'`).
- `bcrypt` 5.1.1 — hash e comparação de senha em `src/services/user.service.ts`, `src/services/userDelivery.service.ts`, `src/repositories/user.repository.ts` e `src/repositories/userDelivery.repository.ts`.
- `class-validator` 0.14.1 + `class-transformer` 0.5.1 — validação de DTO. Pipe global em `src/main.ts`: `app.useGlobalPipes(new ValidationPipe())`.
- `dotenv` 16.4.5 — `dotenv.config()` no topo de `src/main.ts`.
- `nodemailer` 6.9.13 (`@types/nodemailer` na faixa `^6.4.15`) — transporte SMTP em `src/services/mailingService.ts`.
- `handlebars` 4.7.8 — compilação dos templates de e-mail.
- `reflect-metadata` 0.1.14 (faixa `^0.1.13`) — metadados de decorators do Nest/TypeORM. `tsconfig.json` liga `emitDecoratorMetadata` e `experimentalDecorators`.
- `@nestjs/mapped-types` 2.0.5 — presente em `package.json`. Vários DTOs de atualização importam `PartialType` de `@nestjs/swagger` (por exemplo `src/dtos/user/updateUser.dto.ts` e `src/dtos/deliveryqueue/updateDeliveryqueue.dto.ts`), não deste pacote.

**Infraestrutura (bibliotecas, sem serviço gerenciado):**

- `fs` `^0.0.1-security` — pacote npm placeholder listado em `package.json`. O código de e-mail importa o módulo nativo do Node (`import * as fs from 'fs'` em `src/services/mailingService.ts`). Novas leituras de arquivo devem usar o módulo nativo `node:fs`, sem depender do pacote npm `fs`.
- `api_ifarma`: `"file:"` em `package.json` — dependência local apontando para o próprio pacote. Não é um SDK externo. Não adicione features através dessa entrada.

**Ausentes na árvore de dependências da aplicação:**

- Cliente HTTP de saída (`axios`, `@nestjs/axios`, `node-fetch`, `got`): não detectado em `src/`.
- Cache (`cache-manager`, `ioredis`, `redis`): não detectado.
- Fila (`bull`, `@nestjs/bull`, SQS): não detectado.
- Logger estruturado (`winston`, `pino`, `nestjs-pino`): não detectado.
- Observabilidade (`@sentry/*`, OpenTelemetry): não detectado.
- Gateway de pagamento (Stripe, PagSeguro, Mercado Pago, SDK de PIX): não detectado.
- ORM alternativo (Prisma, Sequelize, Knex): não detectado.
- Provedor de identidade externo (Passport, Auth0, Cognito, Firebase Auth): não detectado.

## Configuração

**Ambiente:**

O arquivo `.env` existe na raiz e está listado em `.gitignore`. Não há `.env.example` nem `.env.sample`.

Duas cargas de ambiente coexistem:

1. `dotenv.config()` em `src/main.ts`, depois dos `import`.
2. `ConfigModule.forRoot()` em `src/app.module.ts` (arquivo padrão `.env`, sem `isGlobal: true` e sem `envFilePath` customizado).

Os módulos leem `process.env` na avaliação do decorator, não via `ConfigService`. Em `src/main.ts` os `import` (incluindo `src/app.module.ts` e `src/modules/auth.module.ts`) executam antes de `dotenv.config()`. Para a conexão e o JWT enxergarem o `.env` no boot, exporte as variáveis no processo antes do Node, ou carregue o `dotenv` antes desses módulos serem avaliados. `ConfigModule.forRoot()` sozinho não reescreve os objetos já passados a `TypeOrmModule.forRoot` e `JwtModule.register`.

Variáveis lidas pelo código (nomes apenas):

| Variável | Onde | Uso |
| --- | --- | --- |
| `DB_HOST` | `src/app.module.ts` | Host MySQL |
| `DB_PORT` | `src/app.module.ts` | Porta MySQL (`Number(...)`) |
| `DB_USERNAME` | `src/app.module.ts` | Usuário MySQL |
| `DB_PASSWORD` | `src/app.module.ts` | Senha MySQL |
| `DB_DATABASE` | `src/app.module.ts` | Nome do schema |
| `ENV` | `src/app.module.ts` | Liga `synchronize` somente quando o valor é exatamente `developmen` |
| `JWT_SECRET` | `src/modules/auth.module.ts` | Segredo HMAC do JWT (`String(...)`) |
| `MAIL_HOST` | `src/services/mailingService.ts` | Host SMTP |
| `MAIL_PORT` | `src/services/mailingService.ts` | Porta SMTP |
| `MAILER_SECURE` | `src/services/mailingService.ts` | TLS direto quando o valor é `'true'` |
| `MAIL_USER` | `src/services/mailingService.ts` | Usuário SMTP |
| `MAIL_PASSWORD` | `src/services/mailingService.ts` | Senha SMTP |
| `MAIL_FROM` | `src/services/mailingService.ts` | Endereço do remetente (`No-reply`) |
| `CLIENT_URL` | `src/services/mailingService.ts` | Base da URL colocada nos links dos e-mails |

Conexão TypeORM (sem migrations; entidades listadas à mão):

```ts
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [ /* 9 entidades em src/entities/ */ ],
  synchronize: process.env.ENV === 'developmen',
});
```

`synchronize` compara `ENV` com a string `developmen` (sem o `t` final). O valor `development` não liga o synchronize. Não há pasta `migrations/` nem `ormconfig.*`. Alterações de schema exigem SQL aplicado no MySQL, ou o valor literal `developmen` se a intenção for o synchronize do TypeORM.

JWT em `src/modules/auth.module.ts`: `JwtModule.register` com `expiresIn: '12h'`. `src/services/auth.service.ts` sobrescreve na assinatura: login com `expiresIn: '7 days'`; recuperação de senha com `expiresIn: '1 day'`. Emissor `login`, audiência `user`.

TypeScript em `tsconfig.json` está frouxo de propósito do starter: `strictNullChecks: false`, `noImplicitAny: false`, `strictBindCallApply: false`, `forceConsistentCasingInFileNames: false`, `noFallthroughCasesInSwitch: false`. `baseUrl` é `./`, então imports `src/...` resolvem a partir da raiz. Não há `paths` adicionais.

HTTP em `src/main.ts`:

- `ValidationPipe` global (opções padrão do Nest: whitelist desligada).
- `app.enableCors()` sem restrição de origem.
- Swagger em `SwaggerModule.setup('api', app, document)`. Título do documento: `Documentação com Swagger - Colibri`. Bearer scheme nomeado `access-token`.
- Sem prefixo global (`setGlobalPrefix` não é chamado).

**Build:**

- `nest-cli.json` — schema Nest CLI, `sourceRoot`: `src`, `deleteOutDir`: true.
- `tsconfig.json` — opções do compilador; `outDir`: `./dist`; `incremental`: true.
- `tsconfig.build.json` — exclui testes e `dist`.
- Saída de produção: `dist/main` (`npm run start:prod`).
- Artefatos ignorados pelo git (`.gitignore`): `/dist`, `/node_modules`, `/coverage`, `.env`, `*.log`.

## Requisitos de plataforma

**Desenvolvimento:**

- Node.js compatível com os tipos 20 (`@types/node` 20.12.12). Instale essa linha major; o repositório não documenta um patch exato.
- npm com lockfile v3 (`package-lock.json`).
- MySQL acessível pelos `DB_*`. O driver é `mysql2`; não há SQLite nem banco em memória no código de produção.
- Toolchain nativa para `bcrypt` 5.1.1 (node-gyp). No Windows, o `npm install` precisa conseguir compilar o binding nativo.
- SMTP opcional para o fluxo de e-mail: `MAIL_*` apontando para um servidor SMTP. Os métodos de envio existem em `src/services/mailingService.ts`; as chamadas de recuperação de senha em `src/services/auth.service.ts` estão comentadas (`//this.mailingService`).
- Porta local `3000` livre. Swagger em `http://localhost:3000/api`.

**Produção:**

- Alvo de deploy: não detectado. Não há `Dockerfile`, `docker-compose*.yml`, manifesto Kubernetes, `fly.toml`, `Procfile`, nem workflow em `.github/`.
- Processo esperado pelo script: `node dist/main`, escutando a porta `3000`.
- Dependências externas obrigatórias em runtime: instância MySQL e, para e-mail, um servidor SMTP. O segredo JWT vem de `JWT_SECRET`.
- O `README.md` é o texto padrão do starter NestJS (badges CircleCI/Coveralls apontam para o repositório upstream `nestjs/nest`). Esse README não descreve o deploy desta API.

---

*Stack analysis: 2026-10-04*
