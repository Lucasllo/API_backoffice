<!-- gsd-project-start source:PROJECT.md -->

## Project

**API iFarma Backoffice**

API HTTP do backoffice iFarma (Swagger intitulado Colibri): operadores de loja e entregadores autenticam, consultam pedidos e conduzem a entrega. Este trabalho não adiciona produto novo. Ele deixa o repositório apresentável como portfólio simples: alguém clona, segue o README, sobe a API e percorre um pedido até a confirmação da entrega.

**Core Value:** Uma pessoa clona o repositório, segue o README e confirma a entrega de um pedido, e um comando de teste prova esse caminho.

### Constraints

- **Stack**: Permanecer em NestJS 10, TypeORM, MySQL e npm — é o código que o portfólio mostra
- **Escopo**: Portfólio simples — dívida interna só entra quando impede subir a API ou percorrer a entrega
- **Testes**: Um comando para o fluxo enfileirar e confirmar; sem meta de cobertura geral
- **Documentação**: Texto de projeto e README em português do Brasil; identificadores de código permanecem como estão
- **Dados**: Pedido, loja e usuários da demo são fictícios e versionáveis; segredos reais não entram no repositório

<!-- gsd-project-end -->

<!-- gsd-stack-start source:codebase/STACK.md -->

## Technology Stack

## Linguagens

- TypeScript 5.4.5 (faixa `^5.1.3` em `package.json`) — toda a API em `src/`. O compilador emite CommonJS para `dist/`.
- Alvo de compilação: `ES2021` em `tsconfig.json` (`"target": "ES2021"`, `"module": "commonjs"`).
- Handlebars 4.7.8 — templates de e-mail em `templates/confirmation.hbs` e `templates/recoverPassword.hbs`, compilados por `src/services/mailingService.ts`.
- JavaScript — configuração do ESLint em `.eslintrc.js` (`module.exports`).

## Runtime

- Node.js. Os tipos instalados são `@types/node` 20.12.12 (faixa `^20.3.1`). O repositório não fixa a versão do runtime: não existe campo `engines` em `package.json`, nem `.nvmrc`, nem `.node-version`.
- Processo HTTP único. `src/main.ts` sobe a aplicação com `NestFactory.create` e escuta a porta `3000` de forma fixa (`await app.listen(3000)`). Não há variável `PORT`.
- Adaptador HTTP: Express, via `@nestjs/platform-express` 10.3.8.
- npm. Lockfile presente: `package-lock.json` (`lockfileVersion` 3).
- Não há `yarn.lock` nem `pnpm-lock.yaml`.
- A versão do npm não está fixada no repositório.

## Frameworks

- NestJS 10.3.8 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, faixa `^10.0.0`) — API HTTP modular. Entrada: `src/main.ts`. Módulo raiz: `src/app.module.ts`.
- TypeORM 0.3.20 + `@nestjs/typeorm` 10.0.2 — ORM. Conexão única em `TypeOrmModule.forRoot` dentro de `src/app.module.ts`. Entidades em `src/entities/`.
- Express (transitivo de `@nestjs/platform-express`) — servidor HTTP. Não há Fastify.
- RxJS 7.8.1 — dependência do NestJS. O código de aplicação em `src/` não compõe streams RxJS nas regras de negócio.
- Jest 29.7.0 + `ts-jest` 29.1.2 — testes unitários. Configuração inline em `package.json` (`"jest"`), `rootDir`: `src`, regex `.*\.spec\.ts$`.
- `@nestjs/testing` 10.3.8 — módulo de teste do NestJS.
- Supertest 6.3.4 — testes e2e. Configuração em `test/jest-e2e.json`. Spec existente: `test/app.e2e-spec.ts`.
- Specs da aplicação ficam em `src/tests/**/*.spec.ts`, não ao lado de cada arquivo de produção.
- `@nestjs/cli` 10.3.2 — build e watch. Configuração em `nest-cli.json` (`sourceRoot`: `src`, `deleteOutDir`: true). O build usa o compilador TypeScript do Nest (não há `webpack.config.*`).
- TypeScript 5.4.5 — `tsc` via Nest. Configuração de build: `tsconfig.build.json` (estende `tsconfig.json` e exclui `node_modules`, `test`, `dist`, `**/*spec.ts`).
- `ts-node` 10.9.2 e `tsconfig-paths` 4.2.0 — usados no script `test:debug`.
- `ts-loader` 9.5.1 — presente nas devDependencies; não há configuração Webpack no repositório que o referencie.
- ESLint 8.57.0 + `@typescript-eslint/parser` e `@typescript-eslint/eslint-plugin` (faixa `^6.0.0`) + `eslint-config-prettier` 9 + `eslint-plugin-prettier` 5 — lint. Configuração: `.eslintrc.js`.
- Prettier 3.2.5 — formatação. Configuração: `.prettierrc` (`singleQuote: true`, `trailingComma: "all"`).
- `source-map-support` 0.5.21 — suporte a source map em desenvolvimento (devDependency padrão do starter Nest).

## Dependências principais

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
- `fs` `^0.0.1-security` — pacote npm placeholder listado em `package.json`. O código de e-mail importa o módulo nativo do Node (`import * as fs from 'fs'` em `src/services/mailingService.ts`). Novas leituras de arquivo devem usar o módulo nativo `node:fs`, sem depender do pacote npm `fs`.
- `api_ifarma`: `"file:"` em `package.json` — dependência local apontando para o próprio pacote. Não é um SDK externo. Não adicione features através dessa entrada.
- Cliente HTTP de saída (`axios`, `@nestjs/axios`, `node-fetch`, `got`): não detectado em `src/`.
- Cache (`cache-manager`, `ioredis`, `redis`): não detectado.
- Fila (`bull`, `@nestjs/bull`, SQS): não detectado.
- Logger estruturado (`winston`, `pino`, `nestjs-pino`): não detectado.
- Observabilidade (`@sentry/*`, OpenTelemetry): não detectado.
- Gateway de pagamento (Stripe, PagSeguro, Mercado Pago, SDK de PIX): não detectado.
- ORM alternativo (Prisma, Sequelize, Knex): não detectado.
- Provedor de identidade externo (Passport, Auth0, Cognito, Firebase Auth): não detectado.

## Configuração

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
- `ValidationPipe` global (opções padrão do Nest: whitelist desligada).
- `app.enableCors()` sem restrição de origem.
- Swagger em `SwaggerModule.setup('api', app, document)`. Título do documento: `Documentação com Swagger - Colibri`. Bearer scheme nomeado `access-token`.
- Sem prefixo global (`setGlobalPrefix` não é chamado).
- `nest-cli.json` — schema Nest CLI, `sourceRoot`: `src`, `deleteOutDir`: true.
- `tsconfig.json` — opções do compilador; `outDir`: `./dist`; `incremental`: true.
- `tsconfig.build.json` — exclui testes e `dist`.
- Saída de produção: `dist/main` (`npm run start:prod`).
- Artefatos ignorados pelo git (`.gitignore`): `/dist`, `/node_modules`, `/coverage`, `.env`, `*.log`.

## Requisitos de plataforma

- Node.js compatível com os tipos 20 (`@types/node` 20.12.12). Instale essa linha major; o repositório não documenta um patch exato.
- npm com lockfile v3 (`package-lock.json`).
- MySQL acessível pelos `DB_*`. O driver é `mysql2`; não há SQLite nem banco em memória no código de produção.
- Toolchain nativa para `bcrypt` 5.1.1 (node-gyp). No Windows, o `npm install` precisa conseguir compilar o binding nativo.
- SMTP opcional para o fluxo de e-mail: `MAIL_*` apontando para um servidor SMTP. Os métodos de envio existem em `src/services/mailingService.ts`; as chamadas de recuperação de senha em `src/services/auth.service.ts` estão comentadas (`//this.mailingService`).
- Porta local `3000` livre. Swagger em `http://localhost:3000/api`.
- Alvo de deploy: não detectado. Não há `Dockerfile`, `docker-compose*.yml`, manifesto Kubernetes, `fly.toml`, `Procfile`, nem workflow em `.github/`.
- Processo esperado pelo script: `node dist/main`, escutando a porta `3000`.
- Dependências externas obrigatórias em runtime: instância MySQL e, para e-mail, um servidor SMTP. O segredo JWT vem de `JWT_SECRET`.
- O `README.md` é o texto padrão do starter NestJS (badges CircleCI/Coveralls apontam para o repositório upstream `nestjs/nest`). Esse README não descreve o deploy desta API.

<!-- gsd-stack-end -->

<!-- gsd-conventions-start source:CONVENTIONS.md -->

## Conventions

## Padrões de Nomenclatura

- Uma classe por arquivo. O nome do arquivo repete o domínio em camelCase e o papel depois do ponto: `user.service.ts`, `user.controller.ts`, `user.repository.ts`, `user.mapper.ts`, `user.module.ts`, `user.entity.ts`, `createUser.dto.ts`, `role.enum.ts`.
- Coloque o arquivo na pasta da camada, não ao lado de um “feature folder”. DTOs ficam em subpasta de domínio: `src/dtos/user/createUser.dto.ts`, `src/dtos/login/login.dto.ts`, `src/dtos/password/changePasswordAuth.dto.ts`.
- Sufixos obrigatórios no nome do arquivo: `.service`, `.controller`, `.repository`, `.mapper`, `.module`, `.entity`, `.dto`, `.enum`, `.guard`, `.decorator`.
- Specs não ficam ao lado da classe. Use `src/tests/services/<dominio>.service.spec.ts` e `src/tests/controllers/<dominio>.controller.spec.ts`.
- Exceções já existentes — ao editar esses arquivos, preserve o nome; arquivo novo segue o padrão com ponto:
- A pasta de guardas é singular: `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`.
- Métodos em camelCase. O domínio mistura inglês de CRUD (`create`, `findAll`, `findOne`, `findById`, `delete`, `updateStatus`, `login`) e português nas rotas de senha e código (`mudaSenha`, `recuperaSenha`, `validaCodigo`, `recuperaSenhaDelivery`, `validaCodigoDelivery`). No arquivo que você alterar, copie o idioma do método vizinho.
- Handlers HTTP usam o mesmo nome do método de service que chamam. Exceção já presente em `src/controllers/user.controller.ts`: o handler `findOne` chama `findAll`, e `findById` chama `findbyId` (b minúsculo). Não propague `findbyId` para código novo; no `UserService` o método existente permanece `findbyId`.
- Métodos de repositório são `public`. Métodos de token em `src/services/auth.service.ts` são `private` (`createToken`, `createTokenDelivery`, `checkInToken`, `createTokenRecoverPassword`).
- Mappers expõem exatamente `toDTO`, `toEntity`, `toListDTO`, `toListEntity`.
- Constantes de metadata de decorator em SCREAMING_SNAKE: `ROLES_KEY`, `IS_PUBLIC_KEY` em `src/decorators/roles.decorator.ts` e `src/decorators/public.decorator.ts`.
- Factories de decorator em PascalCase: `Roles`, `Public`, `User`, `Delivery`, `PasswordCode`.
- Dependência injetada: `private readonly` + camelCase do tipo (`userRepository`, `userMapper`, `mailingService`).
- Em `src/services/auth.service.ts` o campo do `UserService` está `userservice` (s minúsculo). Nesse arquivo, mantenha `userservice`. Em código novo use camelCase com a fronteira da palavra (`userService`).
- Locais de paginação usam português: `dados`, `retorno` em `src/services/user.service.ts` e `src/services/shopping.service.ts`.
- Parâmetro de rota numérico chega como `string` e é convertido com `+id` ou `Number(...)` antes do service (`src/controllers/user.controller.ts`, `src/controllers/shopping.controller.ts`).
- Comparação com null e entre strings de papel usa `==` / `!=`, como em `src/mappers/user.mapper.ts`, `src/repositories/user.repository.ts` e `src/services/user.service.ts`. Mantenha esse operador no método que você editar.
- Não há `interface` nem `type` alias exportado. Modele contrato com `class`.
- Sufixo da classe = papel:
- Enums de status numérico: `DeliveryStatus` em `src/enums/deliveryStatus.enum.ts` (`Waiting = 1`). Enums de papel string: `Role` em `src/enums/role.enum.ts` (`User = '1'`).
- Três enums já estão em camelCase, não PascalCase: `solicitacaoCompraStatus` (`src/enums/solicitacaoCompraStatus.enum.ts`), `tipoCartao` (`src/enums/tipoCartao.enum.ts`), `modoPagamento` (`src/enums/modoPagamento.enum.ts`). Importe esses identificadores como estão. Enum novo de status usa PascalCase, no estilo de `Role` e `DeliveryStatus`.
- Relação TypeORM no nome do campo termina em `Entity`: `productEntity`, `userClientEntity` em `src/entities/shopping.entity.ts`.
- Colunas e propriedades em camelCase (`storeCode`, `createdAt`). Quando o nome da coluna difere, passe `name` no decorator: `@Column({ name: 'userEntityId' })` e `@JoinColumn({ name: 'userEntityId' })` em `src/entities/shopping.entity.ts`.

## Estilo de Código

- Prettier 3, config em `.prettierrc`: `singleQuote: true`, `trailingComma: "all"`. `printWidth` não está definido; o default do Prettier (80) é o que quebra assinatura e decorator em `src/controllers/user.controller.ts` e `src/services/auth.service.ts`.
- Indentação de 2 espaços. Ponto e vírgula em todo statement.
- Rode `npm run format` (`prettier --write "src/**/*.ts" "test/**/*.ts"`) antes de encerrar uma alteração de estilo.
- ESLint 8 em `.eslintrc.js`, parser `@typescript-eslint/parser` com `project: tsconfig.json`.
- Extends: `plugin:@typescript-eslint/recommended` e `plugin:prettier/recommended`.
- Ambiente: `node` e `jest`.
- Regras desligadas de propósito — não reative no arquivo:
- Comando: `npm run lint` (`eslint "{src,apps,libs,test}/**/*.ts" --fix`).
- `tsconfig.json` deixa `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`, `forceConsistentCasingInFileNames` e `noFallthroughCasesInSwitch` em `false`. O compilador não exige tipo em parâmetro (`createTokenRecoverPassword(codeRecover: number, id)` em `src/services/auth.service.ts`). Em método novo de repositório, anote o retorno (`Promise<UserEntity>`, `Promise<void>`), como em `src/repositories/user.repository.ts`.
- `any` aparece em `src/services/mailingService.ts` (`user: any`). Permitido pelo lint. Em DTO e entidade novos, declare a propriedade com o tipo concreto (`string`, `number`, `Date`).

## Organização de Imports

- `tsconfig.json` define `baseUrl: "./"` e não define `paths`. O prefixo `src/...` resolve a partir da raiz do repositório (`import { UserDto } from 'src/dtos/user/user.dto'`).
- Use `src/...` para cruzar camadas (service → repository, mapper, dto, entity, enum).
- Use relativo para a mesma feature a um nível (controller → `../services/...`, module → `../controllers/...` e `../services/...`), como em `src/modules/user.module.ts`.
- Specs usam somente relativo a partir de `src/tests/`: `../../services/user.service` e `../../controllers/user.controller`.

## Tratamento de Erros

- Não há `ExceptionFilter`, interceptor nem pipe customizado. O único pipe global é `new ValidationPipe()` sem opções em `src/main.ts` (sem `whitelist`, sem `transform`). Validação de body depende dos decorators `class-validator` no DTO.
- Controller não envolve chamada em `try/catch`. Devolve a Promise do service.
- Regra de negócio conhecida lança `BadRequestException` com mensagem fixa em português, antes ou dentro do `try`:
- Falha de repositório ou de regra de status vira `BadRequestException`. Dois formatos convivos:
- Método novo de service usa mensagem fixa em português (sem repassar `error.message`), no formato de `src/services/product.service.ts`.
- Login inválido lança `UnauthorizedException` no repositório, não no service: `'Email e/ou senha incorretos.'` em `src/repositories/user.repository.ts` e `src/repositories/userDelivery.repository.ts`.
- Duplicidade e código ausente também nascem no repositório como `BadRequestException` (`'Email invalido.'`, `'Codigo invalido.'`, `'Dado Invalido!'`).
- `src/guard/auth.guard.ts` captura qualquer erro de token e `return false` (o Nest responde 403). Não lance exceção dentro de `canActivate`.
- Param decorator sem usuário no request lança `BadRequestException('Usuario não encontrado')` em `src/decorators/user.decorator.ts`. O decorator de código de recuperação usa `'Codigo não encontrado'` (`src/decorators/passwordCode.decorator.ts`).
- Mensagens existentes omitem acento (`invalido`, `Codigo`). Ao acrescentar uma mensagem no mesmo método, copie essa grafia. Texto de `@ApiProperty` em DTO também está em português sem acento (`src/dtos/user/createUser.dto.ts`).

## Logging

- Nenhum `Logger` do Nest e nenhuma chamada `console.*` em `src/`.
- Não adicione `console.log` para depurar fluxo de service, repositório ou guard.
- Falha de negócio continua sendo exceção HTTP, não log.

## Comentários

- Comentário de uma linha, em português, só para efeito colateral que o nome do método não mostra. Exemplos em `src/services/auth.service.ts`: `//salvar codigo criado no banco`, `//enviar email`.
- Comentário inline em opções de módulo explica duração do JWT em `src/modules/auth.module.ts`: `//usado para definir globalmente quanto tempo o jwt vai valer`.
- O repositório guarda handlers inteiros comentados (`src/controllers/category.controller.ts`, `src/controllers/shopping.controller.ts`, `src/services/deliveryqueue.service.ts`). Não acrescente bloco novo comentado. Ao reativar um handler, apague o comentário e ligue o método de verdade.
- `README.md` é o texto padrão do starter Nest. Não é guia de estilo deste projeto.
- Não detectado. Não abra bloco `/** */` em método novo.

## Design de Funções

- Handler de controller: uma expressão `return this.<service>.<metodo>(...)`.
- Service: um caso de uso por método. Monte a entidade no service (`new UserEntity()` e atribuição campo a campo em `src/services/user.service.ts`) e delegue persistência ao repositório.
- Repositório: uma operação TypeORM por método (`findOne`, `save`, `update`, `findAndCount`). Paginação padrão em `findAll`: `take = query.take || 10`, `skip = query.skip || 0`, `order = query.orderBy || { id: 'DESC' }`, retorno `{ data, count }` (`src/repositories/user.repository.ts`).
- Métodos gerados pelo CLI que ainda devolvem string (`return \`This action returns all product\`` em `src/services/product.service.ts`, `src/services/category.service.ts`, `src/services/shopping.service.ts`) são stub. Ao implementar o caso de uso, substitua a string por chamada de repositório; não deixe os dois caminhos.
- Body: um DTO (`CreateUserDto`, `LoginAuthDto`, `UserQueryPaginateDto`).
- Rota: `@Param('id') id: string` e conversão numérica no handler.
- Usuário autenticado: `@User() user: UserDto` (`src/decorators/user.decorator.ts`). Entregador: `@Delivery()`. Código de recuperação: `@PasswordCode()`.
- Liste filtros de listagem no DTO de query com `class-validator` e `@ApiProperty`, como `src/dtos/user/userQueryPaginate.dto.ts` (`take`, `skip`, `orderBy?`, `storeCode`).
- Login no repositório desestrutura o DTO: `login({ email, password, storeCode }: LoginAuthDto)`.
- Injeção só pelo construtor. Sem `ModuleRef` e sem propriedade atribuída fora do construtor, exceto campos privados inicializados no construtor de `src/services/mailingService.ts` e os literais `issuer` / `audience` em `src/services/auth.service.ts`.
- Omita o tipo de retorno quando o ESLint já permite (regra desligada), exceto no repositório e nos métodos de auth que já declaram `Promise<LoginReturnDto>` ou `Promise<UserEntity>`.
- Fluxo assíncrono usa `async`/`await`. Não retorne `Observable` do RxJS; `rxjs` está no `package.json` como dependência do Nest, e os services não importam operadores.
- Lista paginada: instância de `*PaginateDto` com `count` e `data` preenchidos depois do mapper (`src/services/shopping.service.ts`).
- Mapper: entrada `null` devolve `null`; lista usa `list.map((element) => this.toDTO(element))` (`src/mappers/user.mapper.ts`).
- Delete de usuário é lógico: `active = false` e `save` em `src/repositories/user.repository.ts`. Não chame `repository.delete` físico para `UserEntity`.

## Design de Módulos

- Um `export class` (ou `export const` / `export enum`) nomeado por arquivo. Sem `export default` no código de `src/`.
- Classe de módulo Nest vazia de métodos: `export class UserModule {}`.
- `@Module` de feature registra `TypeOrmModule.forFeature([Entidade])`, o controller, e os providers `Service`, `Mapper`, `Repository`. Exporte o service (e o que outra feature precisa), como `exports: [UserService, MailingService]` em `src/modules/user.module.ts`.
- Mapper é classe simples, sem `@Injectable()`, e mesmo assim entra em `providers` (`UserMapper` em `src/modules/user.module.ts`). Mantenha assim: o construtor do mapper não recebe dependência.
- Service, repositório e guard levam `@Injectable()` e `implements CanActivate` no guard.
- Guard global de autenticação: `APP_GUARD` + `AuthGuard` em `src/app.module.ts`. `RoleGuard` é local, via `@UseGuards(RoleGuard)` no controller. Rota aberta leva `@Public()` (`src/decorators/public.decorator.ts`), lido pelos dois guards.
- Controller protegido declara, nesta ordem de decorators de classe e método: `@UseGuards(RoleGuard)`, `@ApiTags('Recurso')`, `@Controller('recurso')`; no método, `@Roles(...)`, `@ApiBearerAuth('access-token')`, verbo HTTP. Veja `src/controllers/shopping.controller.ts`.
- Rota pública de criação fica com `@Public()` no método (`POST user/create` em `src/controllers/user.controller.ts`). Controller inteiro público usa `@Public()` na classe (`src/controllers/auth.controller.ts`).
- Senha de usuário: `bcrypt.hash` + `bcrypt.genSalt` no service; `bcrypt.compare` no repositório. Confirme `password` e `confirmPassword` no service antes de persistir. DTO de senha usa `@IsStrongPassword` com `minLength: 6`, `minLowercase: 1`, `minNumbers: 1`, `minSymbols: 1`, `minUppercase: 1` (`src/dtos/user/createUser.dto.ts`).
- Entidade nova entra no array `entities` de `TypeOrmModule.forRoot` em `src/app.module.ts` e no `forFeature` do módulo da feature.
- `synchronize` segue `process.env.ENV === 'developmen'` em `src/app.module.ts`. Não altere essa expressão ao registrar entidade.
- Não detectado. Não crie `index.ts` reexportando a camada.

<!-- gsd-conventions-end -->

<!-- gsd-architecture-start source:ARCHITECTURE.md -->

## Architecture

## Visão geral do sistema

```text

```

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

- Cada agregado de negócio tem um `@Module` em `src/modules/` que declara controller, service, repository, mapper e `TypeOrmModule.forFeature`.
- O controller só traduz HTTP. A regra fica no service. O acesso ao banco fica num repository `@Injectable` que encapsula `Repository<Entity>` do TypeORM. O projeto não estende `Repository` com `@EntityRepository`.
- Autenticação é JWT stateless. `AuthGuard` é global (`APP_GUARD` em `src/app.module.ts`). Autorização por papel é opt-in via `@UseGuards(RoleGuard)` + `@Roles`.
- Três atores no mesmo processo: operador de loja (`UserEntity`, tabela `userbackoffice`), entregador (`UserDeliveryEntity`, tabela `userdelivery`) e cliente do aplicativo (`UserClientEntity`, tabela `users`, somente leitura neste backoffice).
- Listagens paginadas entram por `POST` com body (`take`, `skip`, `orderBy`, `storeCode`), não por query string.
- Pastas são por papel técnico (`controllers`, `services`, `repositories`), não por feature. A exceção é `src/dtos/<agregado>/`.

## Camadas

- Purpose: Criar a aplicação Express, validar body e expor OpenAPI.
- Location: `src/main.ts`
- Contains: `bootstrap()`, `ValidationPipe` global, `app.enableCors()`, Swagger em `api`, `app.listen(3000)`.
- Depends on: `AppModule` (`src/app.module.ts`), `dotenv`.
- Used by: processo Node (`npm run start`, `start:dev`, `start:prod`).
- Purpose: Ligar controller, providers e repositório TypeORM de um agregado e exportar o service quando outro módulo precisa dele.
- Location: `src/modules/`
- Contains: `*.module.ts`.
- Depends on: services, controllers, entities, `@nestjs/typeorm`.
- Used by: `src/app.module.ts`.
- Purpose: Declarar rota, DTO de entrada, papel exigido e delegar ao service.
- Location: `src/controllers/`
- Contains: classes `@Controller`.
- Depends on: services, DTOs, decorators, `RoleGuard`.
- Used by: roteador HTTP do Nest.
- Purpose: Regra de negócio, hash de senha no cadastro, orquestração entre agregados, tradução de erro de persistência em `BadRequestException`.
- Location: `src/services/`
- Contains: classes `@Injectable`.
- Depends on: repositories, mappers, outros services exportados, `bcrypt` no cadastro.
- Used by: controllers e `AuthGuard`.
- Purpose: Copiar campos entre entity e DTO (`toDTO`, `toEntity`, `toListDTO`, `toListEntity`).
- Location: `src/mappers/`
- Contains: `UserMapper`, `UserPermissionMapper`, `ProductMapper`, `ShoppingMapper`.
- Depends on: DTOs e entities.
- Used by: services. Registrados em `providers` do módulo mesmo sem `@Injectable()`.
- Purpose: Queries TypeORM do agregado. Login com `bcrypt.compare` mora aqui em `UserRepository` e `UserDeliveryRepository`.
- Location: `src/repositories/`
- Contains: classes `@Injectable` com `@InjectRepository`.
- Depends on: `Repository<T>` do TypeORM.
- Used by: services do mesmo agregado.
- Purpose: Mapa objeto-relacional e grafo de pedidos.
- Location: `src/entities/`
- Contains: classes `@Entity`.
- Depends on: `typeorm`, enums em `src/enums/`.
- Used by: `TypeOrmModule.forRoot` em `src/app.module.ts` (lista explícita, sem glob) e `forFeature` de cada módulo.
- `ShoppingEntity` (`shoppings`) possui muitos `ProductEntity` (`product`) e pertence a um `UserClientEntity` (`users`) pela coluna `userEntityId`.
- `ProductEntity` pertence a `CategoryEntity` (`categoryEntity`) e a `ShoppingEntity`.
- `UserClientEntity` possui muitos `AddressEntity` (`address`) e `CardEntity` (`cards`).
- `DeliveryQueueEntity` (`deliveryqueue`) aponta para um `UserDeliveryEntity` e para um `ShoppingEntity` (`OneToOne`).
- Status do pedido: `solicitacaoCompraStatus` em `src/enums/solicitacaoCompraStatus.enum.ts` (`Created` = 1 até `OrderAtTheDeliveryPoint` = 8).
- Status da fila: `DeliveryStatus` em `src/enums/deliveryStatus.enum.ts` (`Waiting` = 1, `Finished` = 2).
- Pagamento: `modoPagamento` em `src/enums/modoPagamento.enum.ts`. Tipo de cartão: `tipoCartao` em `src/enums/tipoCartao.enum.ts`.
- Purpose: Autenticar o Bearer JWT e autorizar o papel; injetar o ator da request.
- Location: `src/guard/`, `src/decorators/`
- Contains: `AuthGuard`, `RoleGuard`, `@Public`, `@Roles`, `@User`, `@Delivery`, `@PasswordCode`.
- Depends on: `AuthService.checkToken`, `UserService.findOne`, `UserDeliveryService.findOne`, `Reflector`.
- Used by: pipeline HTTP global e controllers que declaram `@UseGuards(RoleGuard)`.

## Fluxo de dados

### Caminho principal da requisição

```typescript

```

### Login e formato do JWT

```typescript

```

### Fila de entrega

### Cadastro

- A API é stateless entre requests. O estado de autenticação viaja no JWT.
- Durante a request, `AuthGuard` pendura `request.user`, `request.userDelivery` ou `request.codeRecover`. `@User()`, `@Delivery()` e `@PasswordCode` leem esses campos (`src/decorators/user.decorator.ts`, `src/decorators/delivery.decorator.ts`, `src/decorators/passwordCode.decorator.ts`).
- A fonte de verdade é o MySQL. Não há cache, sessão de servidor nem broker.
- `synchronize` do TypeORM só liga quando `process.env.ENV === 'developmen'` (`src/app.module.ts:47`). O schema em outros valores de `ENV` fica a cargo do banco já existente.
- `ConfigModule.forRoot()` está importado em `src/app.module.ts`, e `dotenv.config()` roda em `src/main.ts`. Os providers leem `process.env` direto. `ConfigService` não é injetado.

## Abstrações principais

- Purpose: Unidade de wiring Nest de um recurso HTTP.
- Examples: `src/modules/user.module.ts`, `src/modules/shopping.module.ts`, `src/modules/deliveryqueue.module.ts`
- Pattern: `@Module` com `TypeOrmModule.forFeature([Entidade])`, um controller, service, repository e mapper quando a resposta difere da tabela. Exporte o service se outro módulo orquestra esse agregado (`ShoppingModule`, `UserDeliveryModule`, `UserModule`).
- Purpose: Isolar `Repository<Entity>` e devolver entidades ou `{ data, count }`.
- Examples: `src/repositories/user.repository.ts`, `src/repositories/shopping.repository.ts`, `src/repositories/deliveryQueue.repository.ts`
- Pattern: `@Injectable` + `@InjectRepository(Entidade)`. Métodos públicos `create`, `findById`, `findAll`, `save`. Paginação usa `findAndCount`.
- Purpose: Contrato de saída sem decorators TypeORM.
- Examples: `src/mappers/userPermission.mapper.ts`, `src/mappers/shopping.mapper.ts`, `src/mappers/product.mapper.ts`
- Pattern: classe com `toDTO` / `toListDTO`. Instancie o DTO com `new` e copie campo a campo. Retorne `null` quando a entity é `null`.
- Purpose: Validar body com `class-validator` e documentar com `@ApiProperty`.
- Examples: `src/dtos/user/createUser.dto.ts`, `src/dtos/login/login.dto.ts`, `src/dtos/shopping/shoppingPaginate.dto.ts`, `src/dtos/user/userPaginate.dto.ts`
- Pattern: classe com decorators. Página é `{ count: number; data: T[] }`.
- Purpose: Declarar quem pode chamar o handler.
- Examples: `src/decorators/roles.decorator.ts`, `src/decorators/public.decorator.ts`, `src/enums/role.enum.ts`
- Pattern: `@Public()` pula `AuthGuard` e `RoleGuard`. `@Roles(Role.Admin, Role.User)` só tem efeito com `@UseGuards(RoleGuard)` no controller ou no handler. `Role` é enum de string (`'1'` … `'5'`).
- Purpose: Distinguir operador, entregador e fluxo de troca de senha no mesmo segredo JWT.
- Examples: `src/services/auth.service.ts` (`createToken`, `createTokenDelivery`, `createTokenRecoverPassword`), leitura em `src/guard/auth.guard.ts:31-42`
- Pattern: `sub` stringificado. Chaves possíveis: `user`, `userDelivery`, `codeRecover`. `AuthGuard` escolhe o service de carga conforme a chave presente.

## Pontos de entrada

- Location: `src/main.ts`
- Triggers: `npm run start`, `npm run start:dev`, `npm run start:prod` (`node dist/main` em `package.json`).
- Responsibilities: `NestFactory.create(AppModule)`, pipe global, CORS, Swagger, escuta na porta 3000.
- Location: `src/app.module.ts`
- Triggers: importado por `src/main.ts` e por `test/app.e2e-spec.ts`.
- Responsibilities: `ConfigModule.forRoot`, `TypeOrmModule.forRoot` (MySQL, entidades listadas), import dos dez módulos de domínio, `APP_GUARD` → `AuthGuard`.
- Location: `src/main.ts:10-27`
- Triggers: `GET /api` depois do listen.
- Responsibilities: título "Documentação com Swagger - Colibri", bearer `access-token`. Controllers marcam o esquema com `@ApiBearerAuth('access-token')` e `@ApiTags`.
- Location: `test/app.e2e-spec.ts`
- Triggers: `npm run test:e2e` (`test/jest-e2e.json`).
- Responsibilities: sobe `AppModule` com Supertest. O spec espera `GET /` com corpo `Hello World!`. Não existe `AppController` em `src/`.

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

### Service scaffold do CLI ainda registrado

### Fronteira de saída misturada

### Orquestração que grava no agregado errado

### `AuthService` e `JwtModule` declarados duas vezes

## Tratamento de erros

- Entrada inválida de DTO: `ValidationPipe` global em `src/main.ts:24` responde 400 no formato padrão do Nest.
- Regra de negócio e dado inconsistente: `throw new BadRequestException('...')` no service ou no repository (`src/services/user.service.ts`, `src/services/shopping.service.ts`, `src/services/deliveryqueue.service.ts`, `src/repositories/user.repository.ts`, `src/repositories/userClient.repository.ts`).
- Credencial rejeitada: `UnauthorizedException` em `UserRepository.login` e `UserDeliveryRepository.login`.
- Service que chama repository costuma embrulhar o erro: `throw new BadRequestException(error.message)` (`src/services/user.service.ts:46-47`). A mensagem interna vira o corpo HTTP.
- Ator ausente no decorator de parâmetro: `BadRequestException` com texto fixo em `src/decorators/user.decorator.ts`, `src/decorators/delivery.decorator.ts` e `src/decorators/passwordCode.decorator.ts`.
- `MailingService.sendUserConfirmation` e `sendRecoverPassword` existem (`src/services/mailingService.ts:45-64`). Os fluxos `recoverPassword` e `recoverPasswordDelivery` deixam a chamada comentada (`src/services/auth.service.ts:59-60` e `88-89`). Falha de SMTP nesses fluxos: Não se aplica enquanto a chamada permanecer comentada.

## Preocupações transversais

<!-- gsd-architecture-end -->

<!-- gsd-skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.cursor/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- gsd-skills-end -->

<!-- gsd-workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- gsd-workflow-end -->

<!-- gsd-profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- gsd-profile-end -->
