# Phase 1: Demo que autentica - Pattern Map

**Mapped:** 2026-10-04
**Files analyzed:** 6
**Analogs found:** 5 / 6

Arquivos desta fase: `compose.yaml`, `.env.example`, `seed/demo.sql`, `scripts/apply-demo-sql.js`, alteração de `src/main.ts` e do script `seed` em `package.json`. Não criar rota, guard, DTO, entidade, `Dockerfile`, `migrations/`, `.nvmrc`, `engines` nem README. Não alterar o literal `developmen` em `src/app.module.ts`. Não adicionar dependência.

Documentação em `.planning/` e o comentário no topo de `seed/demo.sql` saem em português do Brasil (`.cursor/rules/documentacao-pt-br.mdc`). Identificadores, nomes de tabela, colunas, rotas e chaves de ambiente permanecem como no código.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `compose.yaml` | config | batch | — | none |
| `.env.example` | config | request-response | `src/app.module.ts` (chaves `DB_*` / `ENV`), `src/modules/auth.module.ts` (`JWT_SECRET`), `src/services/mailingService.ts` (`MAIL_*` / `CLIENT_URL`) | role-match |
| `seed/demo.sql` | migration | batch | `src/entities/userClient.entity.ts`, `src/entities/user.entity.ts`, `src/entities/userDelivery.entity.ts`, `src/entities/shopping.entity.ts`, `src/entities/deliveryQueue.entity.ts` | role-match |
| `scripts/apply-demo-sql.js` | utility | file-I/O | `src/services/mailingService.ts` (leitura UTF-8) e `.eslintrc.js` (CommonJS) | role-match |
| `src/main.ts` | config | request-response | `src/main.ts` (o próprio arquivo) | exact |
| `package.json` | config | batch | `package.json` scripts, em especial `test:debug` | exact |

## Pattern Assignments

### `src/main.ts` (config, request-response)

**Analog:** `src/main.ts` (editar no lugar)

**Imports pattern** (linhas 1-7): o `AppModule` é importado na linha 3 e `dotenv.config()` só roda na linha 7. Com `"module": "commonjs"`, `TypeOrmModule.forRoot` e `JwtModule.register` já leram `process.env` antes dessa chamada.

```1:7:src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();
```

**Core pattern:** o primeiro import do arquivo passa a ser `import 'dotenv/config'`. Remover `import * as dotenv from 'dotenv'` e a chamada `dotenv.config()`. O restante do `bootstrap` (Swagger, `ValidationPipe`, `enableCors`, `listen(3000)`) permanece nas linhas 9-31.

**O que o preload tem de alimentar** (`src/app.module.ts` linhas 28-47). `ConfigModule.forRoot()` na linha 28 não substitui o preload: o `forRoot` do TypeORM é síncrono e lê o ambiente na avaliação do módulo. O literal `developmen` da linha 47 não muda. `ENV=demo` deixa `synchronize` desligado.

```28:47:src/app.module.ts
    ConfigModule.forRoot(),
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

**JWT no mesmo momento** (`src/modules/auth.module.ts` linhas 12-15, repetido em 23-26). `String(undefined)` vira a string `"undefined"` se o preload não aconteceu. Não unificar `expiresIn`.

```12:15:src/modules/auth.module.ts
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
      signOptions: { expiresIn: '12h' }, //usado para definir globalmente quanto tempo o jwt vai valer
    }),
```

---

### `.env.example` (config, request-response)

**Analog:** os três leitores de `process.env`. Não existe `.env.example` no repositório. `.gitignore` linha 45 já ignora `.env`. Não ignorar `.env.example`. Não versionar `.env`. Não sobrescrever um `.env` já existente com script.

**Chaves que o boot lê** (copiar estes nomes; valores de demonstração estão no CONTEXT D-02 e D-03 e no RESEARCH):

| Chave | Onde é lida |
|-------|-------------|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | `src/app.module.ts` linhas 31-35 |
| `ENV` | `src/app.module.ts` linha 47 |
| `JWT_SECRET` | `src/modules/auth.module.ts` linhas 13 e 24 |
| `MAIL_HOST`, `MAIL_PORT`, `MAILER_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM` | `src/services/mailingService.ts` linhas 17-28 |
| `CLIENT_URL` | `src/services/mailingService.ts` linhas 46 e 57 |

**Core pattern** do e-mail (`src/services/mailingService.ts` linhas 15-30). O construtor chama `createTransport` e em seguida `readFileSync` dos templates. Os `MAIL_*` precisam ser string para o boot não quebrar no construtor. Não descomentar o envio em `AuthService` (linhas 60 e 89 são `//this.mailingService`).

```15:30:src/services/mailingService.ts
    this.transporter = nodemailer.createTransport(
      {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAILER_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      {
        from: {
          name: 'No-reply',
          address: process.env.MAIL_FROM,
        },
      },
    );
```

**Cabeçalho:** comentário `#` em português, curto: copiar para `.env`, não commitar `.env`, valores já batem com o Compose, MySQL 8.4.11 local pode ajustar `DB_*`. Sem o percurso do pedido. `MYSQL_ROOT_PASSWORD` fica só no `compose.yaml`, fora deste arquivo.

---

### `package.json` (config, batch)

**Analog:** o bloco `scripts` do próprio `package.json` (linhas 8-21).

**Core pattern:** acrescentar uma chave, sem pacote novo e sem `test:delivery`. O preload fora do `main.ts` já aparece em `test:debug` (`node --inspect-brk -r ...`). O seed usa o mesmo estilo `-r`, com `dotenv/config`:

```json
"seed": "node -r dotenv/config scripts/apply-demo-sql.js"
```

`dotenv` 16.4.5 e `mysql2` 3.9.7 já estão em `dependencies` (linhas 35 e 38). `bcrypt` 5.1.1 está na linha 32. Não alterar `dependencies` nem `devDependencies`.

---

### `scripts/apply-demo-sql.js` (utility, file-I/O)

**Analog de módulo CommonJS:** `.eslintrc.js` linhas 1-6. O `package.json` não declara `"type": "module"`. O script fica fora de `src/`, em JavaScript, com `require` e `__dirname`.

```1:6:.eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
```

**Analog de leitura de arquivo:** `MailingService.loadTemplate` (`src/services/mailingService.ts` linhas 37-42). `readFileSync` com `'utf8'`. O script lê `seed/demo.sql` a partir de `__dirname`, não a pasta `templates/`.

```37:42:src/services/mailingService.ts
  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    const templatesFolderPath = join(__dirname, '../../templates');
    const templatePath = join(templatesFolderPath, templateName);

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource);
  }
```

**Analog das credenciais:** as mesmas chaves de `src/app.module.ts` linhas 31-35 (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`). O `node -r dotenv/config` do script `seed` preenche `process.env` antes do arquivo rodar.

**Sem analog no repositório:** nenhum arquivo de aplicação chama `mysql2` direto. O TypeORM é o único cliente. A conexão (`mysql2/promise`, `multipleStatements: true` só nesta conexão, `query` e não `execute`, retry de conexão, preâmbulo `CREATE DATABASE` / `USE` separado do miolo, validação `^[A-Za-z0-9_]+$` em `DB_DATABASE`) vem do RESEARCH, não de um arquivo existente. O script não chama `bcrypt` e não sobe a API.

**Error handling:** não há wrapper de erro de SQL no projeto para copiar. Falha de conexão depois das tentativas e qualquer erro que não seja o caso tratado de `CREATE DATABASE` (errno 1044 com `USE` bem-sucedido) devem encerrar o processo com o erro. Não engolir a falha.

---

### `seed/demo.sql` (migration, batch)

**Analog:** as cinco entidades do grafo. Não há `.sql` nem pasta `migrations/` no repositório. O DDL escrito à mão imita essas colunas. `CREATE TABLE IF NOT EXISTS` não altera tabela já existente. Não criar `product`, `categoryEntity`, `cards` nem `address`.

**Ordem das tabelas** (nomes em `@Entity`): `users` → `userbackoffice` → `userdelivery` → `shoppings` → `deliveryqueue`.

**Reexecução (D-18):** `DELETE` na ordem inversa das FKs, só dos ids `1`, e `INSERT` de novo com id explícito. A fila do pedido `1` é apagada e não é reinserida.

1. `DELETE FROM deliveryqueue WHERE shoppingId = 1 OR userDeliveryId = 1`
2. `DELETE FROM shoppings WHERE id = 1`
3. `DELETE FROM userdelivery WHERE id = 1`
4. `DELETE FROM userbackoffice WHERE id = 1`
5. `DELETE FROM users WHERE id = 1`
6. `INSERT` com `id` `1` em `users`, `userbackoffice`, `userdelivery`, `shoppings`
7. Nenhum `INSERT` em `deliveryqueue`

**Padrão de coluna a copiar.** `@PrimaryGeneratedColumn({ unsigned: true })` nas cinco. `@Column()` sem `nullable: true` e sem `default` é `NOT NULL` sem default no MySQL enquanto `synchronize` está desligado: o `INSERT` lista a coluna com valor explícito. `Boolean` → `tinyint`. `Number` → `int`. `String` sem `length` → `varchar(255)`. `CreateDateColumn` / `UpdateDateColumn` → `datetime(6)`. `enum: [Role]` não é `ENUM` do MySQL: `role` de `userbackoffice` e `userdelivery` é `varchar(255)` com `'1'` e `'4'`.

`users` (`src/entities/userClient.entity.ts`):

```14:55:src/entities/userClient.entity.ts
@Entity({
  name: 'users',
})
export class UserClientEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id?: number;

  @Column({
    length: 63,
  })
  name: string;

  @Column({
    length: 127,
    unique: true,
  })
  email: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthAt?: Date;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({
    default: Role.User,
  })
  role: number;

  @Column()
  cpf: string;

  @Column()
  numero: string;
```

`role` aqui é `number`. O default `Role.User` é a string `'1'` (`src/enums/role.enum.ts` linhas 1-2). No SQL a coluna é `int` e o valor é `1`. `birthAt` é o único nullable deste grafo.

`userbackoffice` (`src/entities/user.entity.ts` linhas 10-65): `name` varchar(63), `email` varchar(127) unique, `validatedEmail` boolean sem default, `password` varchar(127), `createdAt`/`updatedAt`, `role` string com `enum: [Role]`, `userAuthorized` number sem default, `phoneNumber` varchar(11), `storeCode` string sem length, `active` boolean default `true`, `authorized` boolean default `false`, `validCode` number sem default.

```42:65:src/entities/user.entity.ts
  @Column({
    enum: [Role],
  })
  role: string;

  @Column()
  userAuthorized: number;

  @Column({
    length: 11,
  })
  phoneNumber: string;

  @Column()
  storeCode: string;

  @Column({ default: true })
  active: boolean;

  @Column({ default: false })
  authorized: boolean;

  @Column()
  validCode: number;
```

`userdelivery` (`src/entities/userDelivery.entity.ts` linhas 12-69): mesmos `name` / `email` / `validatedEmail` / `password` / datas / `role`. Depois `phoneNumber` e `cpf` varchar(11), `numberVehicle` string sem length, `acceptTerms` boolean sem default, `active` boolean default `false`, `validCode` number sem default. A relação `deliveryQueueEntity` não vira coluna nesta tabela.

`shoppings` (`src/entities/shopping.entity.ts`): sem `CreateDateColumn`. Colunas: `storeAddress`, `deliveryAddress`, `deliveryTime`, `duration` (string sem length), `status` number default `Created` (`1`), `verificationCode` string, `storeCode` string, `value` string, `modoPagamento` number default `Credit` (`1`), e o cliente em `userEntityId` (não `userClientId`).

```37:57:src/entities/shopping.entity.ts
  @Column({
    default: solicitacaoCompraStatus.Created,
  })
  status: number;

  @Column()
  verificationCode: string;

  @Column()
  storeCode: string;

  @Column()
  value: string;

  @Column({
    default: modoPagamento.Credit,
  })
  modoPagamento: number;

  @Column({ name: 'userEntityId' })
  userClientId: number;
```

O `INSERT` do pedido passa `status` `6` (`WaitingMotoboy`, `src/enums/solicitacaoCompraStatus.enum.ts` linha 7), não o default `1`. `modoPagamento` `1` (`src/enums/modoPagamento.enum.ts` linha 2). A coluna `value` recebe crase: `VALUE` não é reservada no MySQL 8.4, `VALUES` é. Usar crase em todos os identificadores. Não criar `UNIQUE` em `deliveryqueue.shoppingId`.

`deliveryqueue` (`src/entities/deliveryQueue.entity.ts` linhas 15-39): `id` unsigned, `status` number default `Waiting` (`1`), `createdAt`, `updatedAt`, `userDeliveryId`, `shoppingId`. A tabela é criada para o `DELETE` da reexecução. Nenhuma linha é inserida.

**Hash da senha.** O `INSERT` guarda só o hash. O mesmo hash pode ir em `userbackoffice.password` e `userdelivery.password` (`length: 127`; o hash bcrypt tem 60 caracteres). Gerar uma vez com o `bcrypt` 5.1.1 do projeto e gravar o literal no `.sql` via Node (`fs`), para o PowerShell não expandir `$2b$`. O `npm run seed` não chama `bcrypt`.

O código vivo usa `bcrypt.hash` + `bcrypt.genSalt()` sem custo explícito (default 10, prefixo `$2b$`):

```26:29:src/services/userDelivery.service.ts
    user.password = await bcrypt.hash(
      createUserDeliveryDto.password,
      await bcrypt.genSalt(),
    );
```

O operador faz o mesmo em `src/services/user.service.ts` linhas 33-36, com `user.role = Role.User` na linha 37. O entregador recebe `Role.Delivery` em `src/services/userDelivery.service.ts` linha 35. No SQL: operador `'1'`, entregador `'4'` (`src/enums/role.enum.ts` linhas 2 e 5).

**Contrato que a linha tem de satisfazer, sem alterar esses arquivos.**

Login do entregador: busca só por e-mail e `bcrypt.compare`. Não filtra `active` nem `role`.

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

A senha em claro `Entrega1!` tem de passar em `LoginAuthDto` antes de chegar nesse `compare`:

```12:24:src/dtos/login/login.dto.ts
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
```

O operador, semeado para o comentário e para a fase seguinte, é filtrado por `email`, `storeCode`, `authorized: true` e `active: true` (`src/repositories/user.repository.ts` linhas 170-177). `userAuthorized` não entra nesse `where`.

**Comentário obrigatório no topo do arquivo** (português; a fase 3 copia daqui):

```sql
-- Demo iFarma. Copie estes valores; não há senha no .env.example.
-- Entregador: entregador.demo@example.com / Entrega1!
-- Operador: operador.demo@example.com / Entrega1! / storeCode 2312
-- Pedido: 1 / verificationCode 4821
```

Identidade fechada no RESEARCH (D-13 a D-16): cliente `cliente.demo@example.com`, operador `operador.demo@example.com`, entregador `entregador.demo@example.com`, pedido `1`, `verificationCode` `4821`, `storeCode` `2312`. Nomes e endereços em português. CPF, telefone, veículo, `validCode` e `userAuthorized` recebem valores claramente falsos que cabem no `length` da coluna.

Marcador `-- @schema` separa o preâmbulo (`CREATE DATABASE` / `USE`) do miolo que o script manda num único `query`. Sem `;` dentro de string. O hash bcrypt não tem ponto e vírgula.

---

### `compose.yaml` (config, batch)

**Analog:** nenhum. Não há `compose.yaml`, `Dockerfile` nem outro manifesto de container no repositório.

O planner usa o esqueleto do RESEARCH (imagem `mysql:8.4.11`, `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD` só aqui, porta `127.0.0.1:3306:3306`, volume nomeado `ifarma_mysql` em `/var/lib/mysql`, charset `utf8mb4` / `utf8mb4_unicode_ci`). Não montar `seed/demo.sql` em `docker-entrypoint-initdb.d`. A API continua no host (`npm run start:dev`).

Se o healthcheck com `mysqladmin` não existir na imagem, o RESEARCH manda removê-lo. O retry fica em `scripts/apply-demo-sql.js`.

---

## Shared Patterns

### Preload do ambiente antes da avaliação do módulo

**Source:** `src/main.ts` linhas 1-7, `src/app.module.ts` linhas 29-47, `src/modules/auth.module.ts` linhas 12-15
**Apply to:** `src/main.ts`, `package.json` (script `seed`), `.env.example`

O `.env` tem de existir em `process.env` antes do `require` de `./app.module`. No boot, o primeiro import é `import 'dotenv/config'`. No seed, `node -r dotenv/config`. Variável que já existe no ambiente não é sobrescrita pelo dotenv 16.4.5. Copiar `.env.example` para `.env` é passo humano.

### Contrato de colunas do grafo da demo

**Source:** `src/entities/userClient.entity.ts`, `src/entities/user.entity.ts`, `src/entities/userDelivery.entity.ts`, `src/entities/shopping.entity.ts`, `src/entities/deliveryQueue.entity.ts`
**Apply to:** `seed/demo.sql`

Nomes de tabela e de coluna saem dos decorators, inclusive `userEntityId`, `userDeliveryId` e `shoppingId`. `synchronize` permanece desligado com `ENV=demo`. O `INSERT` não omite coluna `NOT NULL` sem default.

### Senha que o login já compara

**Source:** `src/services/userDelivery.service.ts` linhas 26-29, `src/repositories/userDelivery.repository.ts` linhas 36-50, `src/dtos/login/login.dto.ts` linhas 16-24
**Apply to:** `seed/demo.sql` (só o hash no `INSERT`; a senha em claro só no comentário)

Não criar usuário por HTTP nesta fase. Não alterar `POST /auth/loginDelivery`. A rota já é `@Public()` no controller inteiro:

```9:26:src/controllers/auth.controller.ts
@Public()
@UseGuards(RoleGuard)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto): Promise<LoginReturnDto> {
    return this.authService.login(loginAuthDto);
  }

  @Post('loginDelivery')
  LoginDeliveryDto(
    @Body() loginAuthDto: LoginAuthDto,
  ): Promise<LoginReturnDto> {
    return this.authService.loginDelivery(loginAuthDto);
  }
```

O token do entregador já monta `sub` `{"userDelivery":"<id>"}` com `issuer` `'login'` e `audience` `'user'` (`src/services/auth.service.ts` linhas 12-13 e 121-134). A resposta de `loginDelivery` é `id`, `name`, `role` e `token` (linhas 38-46). Não mudar `issuer`, `audience` nem o formato do `sub`.

### Arquivo secreto fora do Git

**Source:** `.gitignore` linha 45
**Apply to:** `.env.example`, `compose.yaml`

```45:45:.gitignore
.env
```

Versionar `.env.example` e `compose.yaml`. A senha root `ifarma-root` não entra no exemplo de ambiente. A API conecta como `ifarma`, não como root.

### Comentário em português para quem clona

**Source:** `.cursor/rules/documentacao-pt-br.mdc`
**Apply to:** cabeçalho de `.env.example` e comentário do topo de `seed/demo.sql`

Sem README nesta fase. O comentário da semente é a fonte que a fase 3 vai copiar.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `compose.yaml` | config | batch | Não há Compose, Dockerfile nem outro manifesto de container. Usar o esqueleto do RESEARCH. |
| Conexão `mysql2` dentro de `scripts/apply-demo-sql.js` | utility | batch | O driver está no `package.json`, mas nenhum fonte chama `mysql2`. A leitura de arquivo copia `mailingService.ts`; a conexão copia o RESEARCH (Pitfall 2 e o exemplo do script). |

## Metadata

**Analog search scope:** raiz do repositório (`package.json`, `.gitignore`, `.eslintrc.js`), `src/main.ts`, `src/app.module.ts`, `src/modules/auth.module.ts`, `src/entities/`, `src/services/`, `src/repositories/`, `src/controllers/auth.controller.ts`, `src/dtos/login/login.dto.ts`, `src/enums/`. Busca por `compose*`, `Dockerfile`, `*.sql`, `scripts/**` e `process.env`.
**Files scanned:** 22 arquivos rastreados pelo Git como análogos, mais a ausência confirmada de Compose, SQL e `scripts/`.
**Pattern extraction date:** 2026-10-04

**Arquivos que esta fase não edita, só respeita:** `src/app.module.ts` (literal `developmen`), `src/modules/auth.module.ts`, `src/controllers/auth.controller.ts`, `src/services/auth.service.ts`, `src/repositories/userDelivery.repository.ts`, `src/repositories/user.repository.ts`, `src/dtos/login/login.dto.ts`, as cinco entidades e os enums.
