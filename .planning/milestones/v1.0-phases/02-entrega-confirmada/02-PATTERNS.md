# Phase 2: Entrega confirmada - Pattern Map

**Mapped:** 2026-10-11
**Files analyzed:** 3
**Analogs found:** 3 / 3

Arquivos desta fase: `src/services/deliveryqueue.service.ts` e `seed/demo.sql`. `scripts/apply-demo-sql.js` só entra se o `PREPARE` do miolo falhar (suposição A1 da pesquisa). Não criar rota, módulo, DTO, entidade, método de repositório, mapper, spec, `migrations/`, README nem script `test:delivery`. Não alterar `src/app.module.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/repositories/deliveryQueue.repository.ts`, `package.json`. Não adicionar dependência. Fase 3 é dona do README e de `npm run test:delivery`.

Documentação em `.planning/` sai em português do Brasil. Identificadores, rotas, enums, nomes de tabela, índice e chaves de ambiente permanecem como no código.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/services/deliveryqueue.service.ts` | service | CRUD | o próprio arquivo (fluxo e mensagens); persistência da linha carregada em `src/repositories/shopping.repository.ts` (`updateStatus`); conclusão do pedido em `src/services/shopping.service.ts` (`updateStatus`) | exact |
| `seed/demo.sql` | migration | batch | o próprio arquivo: `UNIQUE KEY \`UQ_*\`` em `users`, `userbackoffice` e `userdelivery`; `CREATE TABLE` de `deliveryqueue` e o `COMMIT` do miolo | exact |
| `scripts/apply-demo-sql.js` | utility | batch | o próprio arquivo: `catch` que olha `errno`/`code` e segue; corpo depois de `-- @schema` num único `connection.query` | exact (condicional) |

## Pattern Assignments

### `src/services/deliveryqueue.service.ts` (service, CRUD)

**Analog:** `src/services/deliveryqueue.service.ts` (editar no lugar). A gravação da entidade já carregada copia `src/repositories/shopping.repository.ts` linhas 43-47. A conclusão do pedido continua sendo `ShoppingService.updateStatus` (`src/services/shopping.service.ts` linhas 34-42). Não mover essa regra para um método novo de repositório: `findByShopping` e `save` já bastam (`src/repositories/deliveryQueue.repository.ts` linhas 13-32).

**Imports pattern** (linhas 1-7). Manter esses imports. `DeliveryStatus` e `solicitacaoCompraStatus` já estão no arquivo. Não importar mapper.

```1:7:src/services/deliveryqueue.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveryQueueRepository } from '../repositories/deliveryQueue.repository';
import { ShoppingService } from './shopping.service';
import { UserDeliveryService } from './userDelivery.service';
import { DeliveryQueueEntity } from 'src/entities/deliveryQueue.entity';
import { DeliveryStatus } from 'src/enums/deliveryStatus.enum';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';
```

**Auth pattern:** o service não autentica. O controller já limita a classe a `Role.Delivery` e o `create` já recebe `@Delivery()`. `validateDelivery` não recebe `@Delivery()` — não acrescentar (DLVY-06 está fora). Não editar o controller.

```10:23:src/controllers/deliveryqueue.controller.ts
@Roles(Role.Delivery)
@UseGuards(RoleGuard)
@ApiTags('Delivery Queue')
@Controller('deliveryqueue')
export class DeliveryqueueController {
  constructor(private readonly deliveryqueueService: DeliveryqueueService) {}

  @Post(':idShopping')
  @ApiBearerAuth('access-token')
  create(
    @Param('idShopping') idShopping: string,
    @Delivery() userDelivery: UserDeliveryDto,
  ) {
    return this.deliveryqueueService.create(+idShopping, userDelivery.id);
  }
```

```32:41:src/controllers/deliveryqueue.controller.ts
  @Post('validateDelivery/:idShopping/:codeShopping')
  @ApiBearerAuth('access-token')
  validateDelivery(
    @Param('idShopping') idShopping: string,
    @Param('codeShopping') verificationCode: string,
  ) {
    return this.deliveryqueueService.validateDelivery(
      +idShopping,
      verificationCode,
    );
  }
```

**Core pattern — enfileirar** (linhas 17-37). Preservar a ordem: `findOne` do pedido e do entregador, `!= null` nos dois, `findByShopping`, ramo `length <= 0` monta `new DeliveryQueueEntity()` com `createdAt`, `shoppingId`, `userDeliveryId` e `DeliveryStatus.Waiting`. O buraco é a linha 30: `save` sem `await`. Passar a `await` nesse `save`. No `else`, manter `throw new BadRequestException('Shopping já usado')`. Pedido ou entregador ausente continua `Dados invalidos`.

```17:37:src/services/deliveryqueue.service.ts
  async create(idShopping: number, idDelivery: number) {
    const shopping = await this.shoppingService.findOne(idShopping);
    const delivery = await this.userDeliveryService.findOne(idDelivery);

    if (shopping != null && delivery != null) {
      const shoppinggDelivery =
        await this.deliveryQueueRepository.findByShopping(idShopping);
      if (shoppinggDelivery.length <= 0) {
        const deliveryQueue = new DeliveryQueueEntity();
        deliveryQueue.createdAt = new Date();
        deliveryQueue.shoppingId = idShopping;
        deliveryQueue.userDeliveryId = idDelivery;
        deliveryQueue.status = DeliveryStatus.Waiting;
        this.deliveryQueueRepository.save(deliveryQueue);
      } else {
        throw new BadRequestException('Shopping já usado');
      }
    } else {
      throw new BadRequestException('Dados invalidos');
    }
  }
```

O `await` fica só em volta do `save` do ramo vazio. Traduzir somente duplicata MySQL para a mesma mensagem do `else`. Outro erro (FK, por exemplo) segue sem virar `error.message`. O nome local `shoppinggDelivery` permanece.

```typescript
try {
  await this.deliveryQueueRepository.save(deliveryQueue);
} catch (error) {
  const code = error?.code ?? error?.driverError?.code;
  const errno = Number(error?.errno ?? error?.driverError?.errno);
  if (code === 'ER_DUP_ENTRY' || errno === 1062) {
    throw new BadRequestException('Shopping já usado');
  }
  throw error;
}
```

**Core pattern — confirmar a linha carregada** (linhas 43-62). Hoje o acerto do código faz `new DeliveryQueueEntity()` sem `id`. `Repository.save` insere. Substituir esse trecho por: `findByShopping`; se `length != 1`, `BadRequestException('Dados invalidos')` antes de qualquer escrita; senão atribuir `updatedAt` e `DeliveryStatus.Finished` na instância `rows[0]` e `await save` dessa instância; só então `shoppingService.updateStatus(solicitacaoCompraStatus.Concluded, shopping.id)`. Os três lançamentos de `Dados invalidos` (pedido nulo, código divergente, fila que não é exatamente uma linha) ficam antes dos dois `await` de escrita. Comparação continua `==` / `!=`.

```43:62:src/services/deliveryqueue.service.ts
  async validateDelivery(idShopping: number, verificationCode: string) {
    const shopping = await this.shoppingService.findOne(idShopping);

    if (shopping != null) {
      if (shopping.verificationCode != verificationCode) {
        throw new BadRequestException('Dados invalidos');
      }

      const deliveryQueue = new DeliveryQueueEntity();
      deliveryQueue.updatedAt = new Date();
      deliveryQueue.status = DeliveryStatus.Finished;
      await this.deliveryQueueRepository.save(deliveryQueue);
      await this.shoppingService.updateStatus(
        solicitacaoCompraStatus.Concluded,
        shopping.id,
      );
    } else {
      throw new BadRequestException('Dados invalidos');
    }
  }
```

**Analog de carregar e salvar** (`src/repositories/shopping.repository.ts` linhas 43-47). O repositório do pedido lê a linha, atribui `status` e dá `await` no `save`. No service da fila, o `find` já existe (`findByShopping`); não criar `DeliveryQueueRepository.updateStatus`.

```43:47:src/repositories/shopping.repository.ts
  public async updateStatus(codeStatus: solicitacaoCompraStatus, id: number) {
    const shopping = await this.findOne(id);
    shopping.status = codeStatus;
    return await this.shoppingRepository.save(shopping);
  }
```

**Analog da conclusão do pedido** (`src/services/shopping.service.ts` linhas 34-42). `validateDelivery` já chama este método. Mantê-lo depois do `save` da fila. O `catch` daqui engole qualquer erro numa mensagem fixa; não copiar esse `catch` largo para o `create` da fila.

```34:42:src/services/shopping.service.ts
  async updateStatus(
    codeStatus: solicitacaoCompraStatus,
    codeShopping: number,
  ) {
    try {
      await this.shoppingRepository.updateStatus(codeStatus, codeShopping);
    } catch (error) {
      throw new BadRequestException('Compra/Status invalido.');
    }
  }
```

**Repositório que o service já chama** (não alterar):

```13:32:src/repositories/deliveryQueue.repository.ts
  public async save(deliveryQueueEntity: DeliveryQueueEntity) {
    return await this.deliveryQueueRepository.save(deliveryQueueEntity);
  }

  public async findByUserDelivery(id: number) {
    return await this.deliveryQueueRepository.find({
      relations: ['shoppingEntity'],
      where: {
        userDeliveryId: id,
      },
    });
  }

  public async findByShopping(id: number) {
    return await this.deliveryQueueRepository.find({
      relations: ['shoppingEntity'],
      where: {
        shoppingId: id,
      },
    });
  }
```

**Error handling:** mensagem nova no mesmo método copia a grafia já usada: `Shopping já usado` e `Dados invalidos`. Não copiar `throw new BadRequestException(error.message)` de `src/services/user.service.ts`. Não acrescentar `console.log`. Não reativar o `remove` comentado nas linhas 64-66.

**Validation:** `idShopping` chega `number` porque o controller já fez `+idShopping`. O código da URL chega `string` e compara com `shopping.verificationCode` em memória. Não concatenar o param em SQL.

**Enums a usar, sem editar:**

```1:4:src/enums/deliveryStatus.enum.ts
export enum DeliveryStatus {
  Waiting = 1,
  Finished = 2,
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

---

### `seed/demo.sql` (migration, batch)

**Analog:** o próprio arquivo. O nome do índice único copia `UNIQUE KEY \`UQ_<tabela>_<coluna>\``. O `CREATE TABLE` de `deliveryqueue` e o `COMMIT` já existem; o `ALTER` idempotente não tem statement anterior no repositório (ver No Analog Found).

**Imports / aplicador:** o miolo depois de `-- @schema` (linha 7) vai inteiro em um `connection.query` com `multipleStatements: true` (`scripts/apply-demo-sql.js` linhas 164-183). Não usar `DELIMITER` nem procedure. Não colocar o `PREPARE` no preâmbulo: `splitStatements` quebra em `;`.

**Core pattern — chave única no CREATE** (linhas 78-90). No banco novo, trocar a linha 87 (`KEY \`IDX_deliveryqueue_shoppingId\``) por `UNIQUE KEY \`UQ_deliveryqueue_shoppingId\` (\`shoppingId\`)`. Manter `KEY \`IDX_deliveryqueue_userDeliveryId\`` e as duas `CONSTRAINT` de FK. Não dropar `IDX_deliveryqueue_shoppingId` de uma tabela que a fase 1 já criou: a FK `FK_deliveryqueue_shoppingId` pode estar apoiada nele. O `ALTER` abaixo acrescenta o UNIQUE sem remover o `KEY` antigo.

Grafia do índice único já usada nas outras tabelas:

```18:20:seed/demo.sql
  `numero` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`)
```

```56:58:seed/demo.sql
  `validCode` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_userdelivery_email` (`email`)
```

Tabela da fila como está hoje:

```78:90:seed/demo.sql
CREATE TABLE IF NOT EXISTS `deliveryqueue` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `status` int NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `userDeliveryId` int unsigned NOT NULL,
  `shoppingId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_deliveryqueue_userDeliveryId` (`userDeliveryId`),
  KEY `IDX_deliveryqueue_shoppingId` (`shoppingId`),
  CONSTRAINT `FK_deliveryqueue_userDeliveryId` FOREIGN KEY (`userDeliveryId`) REFERENCES `userdelivery` (`id`),
  CONSTRAINT `FK_deliveryqueue_shoppingId` FOREIGN KEY (`shoppingId`) REFERENCES `shoppings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Core pattern — semente que o ALTER não pode atropelar** (linhas 92-102). O `DELETE` da fila do pedido 1 roda dentro da transação, antes do `COMMIT`. O `ALTER` condicional fica depois da linha 102, quando essa fila da demo já foi apagada; senão duas linhas do mesmo `shoppingId` fazem o `ADD UNIQUE` falhar. Não mudar o `INSERT` do pedido 1 (`verificationCode` `4821`, `status` `6`) nem o e-mail `entregador.demo@example.com`.

```92:102:seed/demo.sql
START TRANSACTION;
DELETE FROM `deliveryqueue` WHERE `shoppingId` = 1 OR `userDeliveryId` = 1;
DELETE FROM `shoppings` WHERE `id` = 1;
DELETE FROM `userdelivery` WHERE `id` = 1;
DELETE FROM `userbackoffice` WHERE `id` = 1;
DELETE FROM `users` WHERE `id` = 1;
INSERT INTO `users` (`id`, `name`, `email`, `birthAt`, `createdAt`, `updatedAt`, `role`, `cpf`, `numero`) VALUES (1, 'Cliente Demo', 'cliente.demo@example.com', NULL, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 1, '00000000000', '0');
INSERT INTO `userbackoffice` (`id`, `name`, `email`, `validatedEmail`, `password`, `createdAt`, `updatedAt`, `role`, `userAuthorized`, `phoneNumber`, `storeCode`, `active`, `authorized`, `validCode`) VALUES (1, 'Operador Demo', 'operador.demo@example.com', 1, '$2b$10$l8NjzXTt.61KYtXhFxjdROgyAuywnqx8Rl8XRI5x9zoVQ2lK/u0zG', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), '1', 0, '00000000000', '2312', 1, 1, 0);
INSERT INTO `userdelivery` (`id`, `name`, `email`, `validatedEmail`, `password`, `createdAt`, `updatedAt`, `role`, `phoneNumber`, `cpf`, `numberVehicle`, `acceptTerms`, `active`, `validCode`) VALUES (1, 'Entregador Demo', 'entregador.demo@example.com', 1, '$2b$10$l8NjzXTt.61KYtXhFxjdROgyAuywnqx8Rl8XRI5x9zoVQ2lK/u0zG', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), '4', '00000000000', '00000000000', 'DEMO-000', 1, 1, 0);
INSERT INTO `shoppings` (`id`, `storeAddress`, `deliveryAddress`, `deliveryTime`, `duration`, `status`, `verificationCode`, `storeCode`, `value`, `modoPagamento`, `userEntityId`) VALUES (1, 'Rua das Acácias, 100', 'Rua do Comércio, 50', '30 min', '15 min', 6, '4821', '2312', '42.00', 1, 1);
COMMIT;
```

**Bloco sem análogo no repositório** — colar depois do `COMMIT`, ainda no miolo (depois de `-- @schema`). `CREATE TABLE IF NOT EXISTS` não altera a tabela que a fase 1 já criou.

```sql
SET @add_uq_deliveryqueue = (
  SELECT IF(
    (
      SELECT COUNT(*)
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'deliveryqueue'
        AND index_name = 'UQ_deliveryqueue_shoppingId'
    ) = 0,
    'ALTER TABLE `deliveryqueue` ADD UNIQUE KEY `UQ_deliveryqueue_shoppingId` (`shoppingId`)',
    'SELECT 1'
  )
);
PREPARE stmt_uq_deliveryqueue FROM @add_uq_deliveryqueue;
EXECUTE stmt_uq_deliveryqueue;
DEALLOCATE PREPARE stmt_uq_deliveryqueue;
```

Não ligar `synchronize`. O literal abaixo não se edita:

```47:47:src/app.module.ts
      synchronize: process.env.ENV === 'developmen',
```

---

### `scripts/apply-demo-sql.js` (utility, batch) — só se A1 falhar

**Analog:** o próprio arquivo. O caminho feliz não muda: preâmbulo statement a statement, corpo num único `query`. O `catch` estreito de errno já existe no preâmbulo (linhas 141-156) e é o modelo se o `PREPARE` do corpo falhar e o `ALTER` tiver de sair do SQL e ir para o aplicador.

**Core pattern — corpo único** (linhas 164-183). O `ALTER`/`PREPARE` fica nesse `body`. Não passar o miolo por `splitStatements`.

```164:183:scripts/apply-demo-sql.js
async function main() {
  const databaseName = assertDatabaseName(process.env.DB_DATABASE);
  const sql = fs.readFileSync(path.join(__dirname, '..', 'seed', 'demo.sql'), 'utf8');
  const lines = sql.split(/\r?\n/);
  const markerIndex = lines.findIndex((line) => line.trim() === '-- @schema');

  if (markerIndex < 0) {
    console.error('seed/demo.sql sem marcador -- @schema');
    process.exit(1);
  }

  const preamble = lines.slice(0, markerIndex).join('\n');
  const body = lines.slice(markerIndex + 1).join('\n');
  const connection = await connect();

  try {
    await runPreamble(connection, preamble, databaseName);
    if (stripComments(body)) {
      await connection.query(body);
    }
  } finally {
    await connection.end();
  }
}
```

**Error handling analog** (linhas 141-156). Um errno conhecido segue um caminho; o resto chama `report` e `process.exit(1)`. Se o fallback de A1 for necessário: executar o `ALTER TABLE ... ADD UNIQUE KEY \`UQ_deliveryqueue_shoppingId\` (\`shoppingId\`)` no aplicador e ignorar só errno `1061` (`ER_DUP_KEYNAME`) na segunda execução. Não engolir `ER_DUP_ENTRY` (`1062`) nesse script — duplicata de dados no `ADD UNIQUE` é falha de semente, não sucesso.

```141:156:scripts/apply-demo-sql.js
    } catch (err) {
      const code = stripComments(statement);
      const isCreate = /^\s*CREATE\s+DATABASE\b/i.test(code);
      const denied =
        err &&
        (Number(err.errno) === 1044 || err.code === 'ER_DBACCESS_DENIED_ERROR');

      if (isCreate && denied) {
        try {
          await connection.query('USE `' + databaseName + '`');
          continue;
        } catch (useErr) {
          report(useErr);
          process.exit(1);
        }
      }
```

Não instalar cliente `mysql`. O seed usa `mysql2`, já requerido na linha 3.

## Shared Patterns

### Authentication

**Source:** `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/services/auth.service.ts`, `src/controllers/deliveryqueue.controller.ts`
**Apply to:** nenhuma edição. As duas rotas da fila já passam pelo guard global e por `RoleGuard` com `Role.Delivery` (`'4'`).

O login do entregador grava `userDelivery` no `sub`:

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

O guard global pendura `request.userDelivery` e, em qualquer erro de token, devolve `false` (403). Não lançar exceção dentro de `canActivate`.

```36:45:src/guard/auth.guard.ts
      } else if (data.userDelivery != undefined) {
        request.userDelivery = await this.userDeliveryService.findOne(
          Number(data.userDelivery),
        );
      } else {
        request.user = await this.userService.findOne(Number(data.user));
      }
      return true;
    } catch (error) {
      return false;
```

O papel do entregador é opt-in no controller, não um guard novo:

```31:36:src/guard/role.guard.ts
    if (!roles) {
      return true;
    } else if (recoverPasswordCode != undefined) {
      return roles.includes(Role.Recover);
    } else if (userDeliveryCode != undefined) {
      return roles.includes(Role.Delivery);
```

### Error Handling

**Source:** `src/services/deliveryqueue.service.ts` linhas 32, 35, 48 e 60
**Apply to:** os dois métodos editados no service

Regra de negócio lança `BadRequestException` com texto fixo em português, na grafia já usada (`Shopping já usado`, `Dados invalidos`). O `catch` novo do `create` só traduz `ER_DUP_ENTRY` / errno `1062`. Não repassar `error.message`. Não há `ExceptionFilter` no projeto. Controller continua `return this.deliveryqueueService...` sem `try/catch`.

`src/services/product.service.ts` linhas 16-22 também usa mensagem fixa, mas o `catch` engole todo erro. Não usar esse formato no `create` da fila: FK e falha que não é duplicata têm de propagar.

### Validation

**Source:** `src/services/deliveryqueue.service.ts` linhas 21 e 47; `src/controllers/deliveryqueue.controller.ts` linhas 23 e 38-40
**Apply to:** `create` e `validateDelivery`

Comparação com `null` e entre strings usa `==` / `!=` no método editado. Param de rota numérico é `string` no controller e vira número com `+idShopping` antes do service. O código de verificação compara em memória com a coluna já lida por `ShoppingService.findOne` (`src/services/shopping.service.ts` linhas 30-32), que devolve a entidade do repositório sem mapper.

### Persistence

**Source:** `src/repositories/deliveryQueue.repository.ts` (`save`, `findByShopping`) e `src/repositories/shopping.repository.ts` (`updateStatus`)
**Apply to:** `DeliveryqueueService.create` e `validateDelivery`

Uma operação TypeORM por método de repositório. Insert e update da fila usam o `save` que já existe: entidade nova no `create` (com `id` ausente) insere; entidade devolvida por `findByShopping` (com `id`) atualiza. Status do pedido continua em `ShoppingRepository.updateStatus`. Não abrir transação, `SELECT FOR UPDATE`, fila Bull nem SQL manual no service.

### Schema versionado

**Source:** `seed/demo.sql` e `src/app.module.ts` linha 47
**Apply to:** só `seed/demo.sql` no caminho feliz

`ENV=demo` mantém `synchronize` desligado. Índice único nasce no SQL. Não decorar `@Column({ unique: true })` em `src/entities/deliveryQueue.entity.ts` no lugar do `ALTER`.

### Logging

Não há `Logger` nem `console.*` em `src/`. Falha de negócio permanece exceção HTTP. `console.error` em `scripts/apply-demo-sql.js` (`report`) fica restrito ao aplicador, se o fallback A1 for escrito.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| Bloco `PREPARE`/`information_schema` dentro de `seed/demo.sql` | migration | batch | Nenhum SQL do repositório consulta `information_schema.statistics` nem usa `PREPARE`/`EXECUTE`/`DEALLOCATE`. O nome `UQ_<tabela>_<coluna>` copia as linhas 20, 39 e 58 de `seed/demo.sql`. O statement em si vem do Pattern 3 de `02-RESEARCH.md`. |

Não há arquivo novo sem análogo. Controller, repositório, guard, entidade, enum e spec de `deliveryqueue` já existem e ficam de fora desta fase.

## Metadata

**Analog search scope:** `src/services/`, `src/repositories/`, `src/controllers/`, `src/guard/`, `src/entities/`, `src/enums/`, `seed/`, `scripts/`
**Files scanned:** 15 caminhos conferidos com `git ls-files` (todos rastreados): `src/services/deliveryqueue.service.ts`, `src/services/shopping.service.ts`, `src/services/product.service.ts`, `src/services/auth.service.ts`, `src/repositories/deliveryQueue.repository.ts`, `src/repositories/shopping.repository.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/entities/deliveryQueue.entity.ts`, `src/enums/deliveryStatus.enum.ts`, `src/enums/solicitacaoCompraStatus.enum.ts`, `src/app.module.ts`, `seed/demo.sql`, `scripts/apply-demo-sql.js`
**Pattern extraction date:** 2026-10-11

**Coverage**

- Arquivos com análogo exact: 3 (`deliveryqueue.service.ts`, `seed/demo.sql`, `apply-demo-sql.js` condicional)
- Arquivos com análogo só de papel: 0 (o load-then-save do repositório de pedido é apoio do service, não um arquivo desta fase)
- Arquivos sem análogo: 0
- Trecho sem análogo: o `ALTER` idempotente via `PREPARE`
