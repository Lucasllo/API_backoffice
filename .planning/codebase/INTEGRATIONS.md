# Integrações externas

**Analysis Date:** 2026-10-04

## APIs e serviços externos

A API não chama serviços HTTP de terceiros. Não há `axios`, `@nestjs/axios`, `fetch` nem `HttpModule` em `src/`. Pagamento, armazenamento de objetos, fila e identidade externa não têm SDK.

**E-mail (SMTP genérico):**

- Serviço: servidor SMTP configurável. O host não está fixo no código; vem de `MAIL_HOST`. Não há SDK de SendGrid, SES, Mailgun nem Resend.
- SDK/cliente: `nodemailer` 6.9.13, instanciado em `src/services/mailingService.ts` (`nodemailer.createTransport`).
- Registro Nest: provider `MailingService` em `src/modules/user.module.ts` (exportado). `src/services/auth.service.ts` e `src/services/user.service.ts` recebem `MailingService` no construtor.
- Auth: `MAIL_USER` e `MAIL_PASSWORD`. TLS direto quando `MAILER_SECURE === 'true'`. Remetente: nome fixo `No-reply` e endereço `MAIL_FROM`.
- Templates: `templates/confirmation.hbs` e `templates/recoverPassword.hbs`, lidos com `fs.readFileSync` a partir de `join(__dirname, '../../templates')`.
- Métodos prontos:
  - `sendUserConfirmation` — assunto `Welcome user! Confirm your Email`. Link: `` `${process.env.CLIENT_URL}?token=${token}` ``.
  - `sendRecoverPassword` — assunto `Recuperação de senha`. Mesmo formato de link com `CLIENT_URL`.
- Estado do envio: `src/services/auth.service.ts` gera o código de recuperação e persiste com `setValidCode`, e deixa o envio comentado (`//this.mailingService`) em `recoverPassword` e `recoverPasswordDelivery`. `src/services/user.service.ts` tem o comentário de validação de e-mail em `create` e não chama `sendUserConfirmation`. Para disparar e-mail, chame esses métodos do `MailingService` a partir do serviço que já possui o usuário e o token.

**Cliente web (somente link):**

- `CLIENT_URL` é a base da URL colocada no HTML do e-mail. Não há cliente HTTP da API em direção a esse host.

**Documentação HTTP (superfície desta API, não um terceiro):**

- `@nestjs/swagger` monta a UI em `GET /api` (`src/main.ts`). Título: `Documentação com Swagger - Colibri`. Autenticação documentada: Bearer JWT, nome `access-token`.
- Controladores e prefixos (todos relativos à raiz, porta `3000`):

| Prefixo | Arquivo |
| --- | --- |
| `auth` | `src/controllers/auth.controller.ts` |
| `user` | `src/controllers/user.controller.ts` |
| `userClient` | `src/controllers/userClient.controller.ts` |
| `product` | `src/controllers/product.controller.ts` |
| `shopping` | `src/controllers/shopping.controller.ts` |
| `category` | `src/controllers/category.controller.ts` |
| `card` | `src/controllers/card.controller.ts` |
| `address` | `src/controllers/address.controller.ts` |
| `delivery` | `src/controllers/userDelivery.controller.ts` |
| `deliveryqueue` | `src/controllers/deliveryqueue.controller.ts` |

Rotas públicas de autenticação em `src/controllers/auth.controller.ts` (`@Public()`): `POST auth/login`, `POST auth/loginDelivery`, `POST auth/recuperaSenha`, `POST auth/validaCodigo/:codigo`, `POST auth/recuperaSenhaDelivery`, `POST auth/validaCodigoDelivery/:codigo`.

**Pagamento:**

- Não detectado como integração. `src/enums/modoPagamento.enum.ts` define `Credit = 1`, `Debit = 2`, `Pix = 3` como enum de domínio. Cartões persistem na tabela MySQL `cards` (`src/entities/card.entity.ts`) via `src/services/card.service.ts`. Não há chamada a adquirente, PSP nem API de PIX.

**CORS:**

- `app.enableCors()` em `src/main.ts`, sem lista de origens. Qualquer origem de browser pode chamar a API.

## Armazenamento de dados

**Bancos:**

- MySQL, via driver `mysql2` 3.9.7 e TypeORM 0.3.20.
- Conexão: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` em `src/app.module.ts`.
- Cliente: `TypeOrmModule.forRoot({ type: 'mysql', ... })`. Repositórios de feature usam `TypeOrmModule.forFeature` nos módulos em `src/modules/`.
- Acesso a dados: classes em `src/repositories/*.repository.ts` (não é o `Repository` genérico exposto direto nos controllers).
- `synchronize`: `process.env.ENV === 'developmen'` em `src/app.module.ts`. Não há pasta de migrations. O schema esperado é o das entidades abaixo; mudanças de coluna são feitas no MySQL (ou pelo synchronize somente com `ENV=developmen`).

Tabelas mapeadas:

| Tabela | Entidade |
| --- | --- |
| `userbackoffice` | `src/entities/user.entity.ts` |
| `users` | `src/entities/userClient.entity.ts` |
| `userdelivery` | `src/entities/userDelivery.entity.ts` |
| `product` | `src/entities/product.entity.ts` |
| `categoryEntity` | `src/entities/category.entity.ts` |
| `shoppings` | `src/entities/shopping.entity.ts` |
| `cards` | `src/entities/card.entity.ts` |
| `address` | `src/entities/address.entity.ts` |
| `deliveryqueue` | `src/entities/deliveryQueue.entity.ts` |

**Armazenamento de arquivos:**

- Somente sistema de arquivos local, para templates de e-mail em `templates/`. `src/services/mailingService.ts` lê `confirmation.hbs` e `recoverPassword.hbs` na subida do provider.
- Não há S3, GCS, Azure Blob, disco de upload nem `multer`.

**Cache:**

- Nenhum. Não há Redis, `cache-manager` nem cache em memória de aplicação além do processo Node.

## Autenticação e identidade

**Provedor:**

- Próprio (JWT simétrico). Não há OAuth, OIDC, Passport, Auth0, Cognito nem login social.

**Implementação:**

- Segredo: `JWT_SECRET`, passado a `JwtModule.register` em `src/modules/auth.module.ts` (registro duplicado: um em `imports`, outro em `exports`).
- Emissão: `src/services/auth.service.ts`.
  - Login de backoffice (`createToken`): `subject` JSON `{ user: id }`, `expiresIn: '7 days'`, `issuer: 'login'`, `audience: 'user'`.
  - Login de entregador (`createTokenDelivery`): `subject` JSON `{ userDelivery: id }`, mesma expiração, emissor e audiência.
  - Recuperação (`createTokenRecoverPassword`): payload `{ codeRecover }` e `subject` com `codeRecover` e `user`, `expiresIn: '1 day'`.
- O `expiresIn: '12h'` de `JwtModule.register` não vale para esses `jwtService.sign`, que passam `expiresIn` próprio.
- Transporte: header `Authorization: Bearer <token>`. Extração em `src/guard/auth.guard.ts` (`extractTokenFromHeader`). Verificação com `jwtService.verify` exigindo `audience: 'user'` e `issuer: 'login'`.
- Guard global: `APP_GUARD` → `AuthGuard` em `src/app.module.ts`. Rotas marcadas com `@Public()` (`src/decorators/public.decorator.ts`) pulam a checagem. Falha de token retorna `false` (requisição negada), sem body de erro customizado.
- Papéis: `RoleGuard` em `src/guard/role.guard.ts`, decorator `src/decorators/roles.decorator.ts`. Valores em `src/enums/role.enum.ts`: `User = '1'`, `Admin = '2'`, `Recover = '3'`, `Delivery = '4'`, `Master = '5'`. `AuthController` declara `@UseGuards(RoleGuard)` e também `@Public()`, então o guard de papel libera essas rotas.
- Senha: `bcrypt.hash` / `bcrypt.compare` com `bcrypt.genSalt()` (custo padrão da biblioteca). Arquivos: `src/services/user.service.ts`, `src/services/userDelivery.service.ts`, `src/repositories/user.repository.ts`, `src/repositories/userDelivery.repository.ts`.
- Recuperação de senha: código de 4 dígitos (`Math.floor(1000 + Math.random() * 9000)`) gravado no usuário. Confirmação por `POST auth/validaCodigo/:codigo` (e a variante delivery). O e-mail que levaria esse código ao usuário não é enviado (chamada comentada).

Contrato do header e da verificação:

```ts
const [type, token] = request.headers.authorization?.split(' ') ?? [];
return type === 'Bearer' ? token : undefined;
```

```ts
this.jwtService.verify(token, {
  audience: this.audience, // 'user'
  issuer: this.issuer,     // 'login'
});
```

## Monitoramento e observabilidade

**Rastreamento de erros:**

- Nenhum. Não há Sentry, Bugsnag, Datadog nem OpenTelemetry.

**Logs:**

- Logger padrão do NestJS (`NestFactory.create` sem logger customizado). Não há `Logger` do `@nestjs/common` nos serviços de `src/`, nem Winston/Pino.
- `.gitignore` ignora `logs` e `*.log`. Nenhum código em `src/` grava esses arquivos.
- Exceções de negócio usam `BadRequestException` (por exemplo `src/services/auth.service.ts` e `src/services/user.service.ts`). Não há `ExceptionFilter` global.

**Métricas e health check:**

- Não detectado. Não há `GET /health`, Terminus nem `@nestjs/terminus`.

## CI/CD e deploy

**Hospedagem:**

- Não detectada. Sem `Dockerfile`, `docker-compose*.yml`, manifesto de cloud, nem configuração de plataforma (Render, Railway, Fly, Heroku, ECS).

**Pipeline de CI:**

- Nenhum neste repositório. Não há `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml` nem Jenkinsfile.
- O `README.md` exibe badges CircleCI e Coveralls do starter NestJS, apontando para `nestjs/nest`. Eles não descrevem um pipeline desta API.

**Como o processo sobe hoje:**

```bash
npm run build      # nest build → dist/
npm run start:prod # node dist/main
```

A porta permanece `3000` (`src/main.ts`).

## Configuração de ambiente

**Variáveis exigidas pelo código:**

Banco (obrigatórias para o TypeORM subir com credenciais reais):

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `ENV` — só altera `synchronize`; o literal que liga o sync é `developmen`

Autenticação:

- `JWT_SECRET`

E-mail e link do cliente (lidas na construção de `MailingService`):

- `MAIL_HOST`
- `MAIL_PORT`
- `MAILER_SECURE`
- `MAIL_USER`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `CLIENT_URL`

**Onde ficam os segredos:**

- Arquivo `.env` na raiz do repositório (presente; conteúdo não documentado aqui).
- `.gitignore` ignora `.env`.
- Não há cofre (SOPS, Vault, secret manager) nem `.env.example` commitado.
- `ConfigModule.forRoot()` em `src/app.module.ts` também aponta para o `.env` padrão. Os módulos de banco e JWT leem `process.env` na carga do arquivo, então as variáveis precisam existir no ambiente do processo antes dessa avaliação. Veja a ordem em `src/main.ts`: `dotenv.config()` fica depois dos `import`.

## Webhooks e callbacks

**Entrada:**

- Nenhum. Não há rota `webhook`, verificação de assinatura, nem controller dedicado a callback de terceiro.

**Saída:**

- E-mail SMTP, quando `MailingService.sendUserConfirmation` ou `MailingService.sendRecoverPassword` forem chamados (`src/services/mailingService.ts` → `transporter.sendMail`). Os fluxos atuais de cadastro e recuperação não invocam esses métodos.
- Não há webhook HTTP de saída, fila nem callback de pagamento.

---

*Integration audit: 2026-10-04*
