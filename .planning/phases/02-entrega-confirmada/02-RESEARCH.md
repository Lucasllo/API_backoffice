# Phase 2: Entrega confirmada - Research

**Researched:** 2026-10-11
**Domain:** Fila `deliveryqueue` (NestJS 10, TypeORM 0.3, MySQL 8.4) — persistir `Waiting`, recusar o segundo enfileiramento e concluir a mesma linha pelo `verificationCode`
**Confidence:** MEDIUM

## User Constraints

Não há `CONTEXT.md`. O usuário seguiu sem `/gsd-discuss-phase`. O que está travado abaixo foi copiado de `PROJECT.md`, `STATE.md`, `ROADMAP.md` e `REQUIREMENTS.md`.

### Locked Decisions

- Stack: permanecer em NestJS 10, TypeORM, MySQL e npm. Nenhum pacote novo no `package.json`.
- Schema pelo SQL versionado. O literal `synchronize: process.env.ENV === 'developmen'` em `src/app.module.ts` não é editado. `ENV=demo` mantém `synchronize` desligado.
- `npm run seed` reaplica os ids 1 e deixa o pedido 1 sem linha em `deliveryqueue`. `verificationCode` semeado é `4821`. Entregador: `entregador.demo@example.com`.
- O contrato HTTP da fila permanece: `POST /deliveryqueue/:idShopping` e `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping`.
- A recusa do segundo enfileiramento responde `Shopping já usado` e não abre outra fila.
- A confirmação com o código da semente atualiza essa mesma linha para `DeliveryStatus.Finished` e o pedido para `solicitacaoCompraStatus.Concluded`.
- Um código diferente de `verificationCode` não altera a fila nem o pedido.
- Fase 3 é dona do README e de `npm run test:delivery`. Esta fase não planeja esses artefatos.
- Avisos WR-01, WR-02 e WR-04 continuam abertos. Só WR-03 (`shoppingId` sem UNIQUE) entra aqui, porque a fila passa a ser gravada.

### Claude's Discretion

Não houve discuss-phase. O desenho abaixo é o que o código atual já tenta fazer, restrito ao que destrava DLVY-01..04.

### Deferred Ideas (OUT OF SCOPE)

Copiado de `REQUIREMENTS.md`:

- Criar pedido pela API. `POST /shopping` lista. A demo semeia o pedido.
- Foto, assinatura, GPS, SMS ou documento de quem recebeu. A prova deste backoffice é o `verificationCode`.
- Lock para dois entregadores ao mesmo tempo. Um leitor só. A recusa sequencial `Shopping já usado` basta.
- Status intermediários até `Concluded`. `validateDelivery` conclui. O teste não afirma os oito status.
- Fila Bull, Redis ou microserviço. A fila é a tabela `deliveryqueue`.
- Recuperação de senha, e-mail, cartão, endereço e categoria. Não participam do caminho semeado. Stubs permanecem.
- Auditoria de segurança que não trava a demo. PAN/CVV, isolamento de loja, rate limit, CORS e revogação ficam de fora.
- Cobertura do restante da API e o e2e `Hello World`. O comando novo prova só a entrega.
- Trocar o contrato HTTP da fila. O portfólio mostra as rotas que o Swagger já publica.
- **DLVY-05**: citar `GET /deliveryqueue/findByUserDelivery` no README.
- **DLVY-06**: a confirmação só é aceita do entregador que reivindicou o pedido.
- **DLVY-07**: uma segunda confirmação não insere outra linha. O conserto de DLVY-03 já atualiza a linha existente; não planejar rejeição extra da segunda confirmação.
- **DLVY-08**: `POST /shopping` com `userClientEntity` nula.
- WR-01 (SQL ignora `DB_DATABASE`), WR-02 (`validCode` 0) e WR-04 (janela de saúde do seed). Não bloqueiam o enfileiramento quando o banco da demo já é `ifarma`.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DLVY-01 | O entregador autenticado envia `POST /deliveryqueue/:idShopping` e a fila desse pedido fica gravada como `DeliveryStatus.Waiting` | `create` já monta a entidade com `DeliveryStatus.Waiting`, mas não dá `await` no `save`. O `await` faz a resposta HTTP esperar o INSERT. Auth e `Role.Delivery` já estão no controller. |
| DLVY-02 | Um segundo `POST /deliveryqueue/:idShopping` no mesmo pedido responde `Shopping já usado` e não abre outra fila | O `throw new BadRequestException('Shopping já usado')` já existe. Ele só é confiável depois do `await`. O UNIQUE em `shoppingId` impede a segunda linha quando o `CREATE TABLE IF NOT EXISTS` da fase 1 já criou a tabela sem essa chave. |
| DLVY-03 | `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` com o código da semente atualiza essa mesma linha para `DeliveryStatus.Finished` e o pedido para `solicitacaoCompraStatus.Concluded` | `validateDelivery` hoje faz `new DeliveryQueueEntity()` sem `id` e o `save` insere. Carregar a linha com `findByShopping` e salvar essa instância. Em seguida `shoppingService.updateStatus(solicitacaoCompraStatus.Concluded, shopping.id)`. |
| DLVY-04 | Um código diferente de `verificationCode` não altera a fila nem o pedido | A comparação `shopping.verificationCode != verificationCode` já lança `Dados invalidos` antes de escrever. Manter essa ordem. Não gravar fila nem status se o código divergir, se o pedido não existir, ou se não houver exatamente uma linha de fila. |

</phase_requirements>

## Summary

A fase não adiciona rota, módulo nem pacote. O controller já publica as duas rotas, o guard global já exige JWT, e `@Roles(Role.Delivery)` com `RoleGuard` já limita o controller ao papel `'4'`. O pedido semeado é o id `1`, status `6` (`WaitingMotoboy`), `verificationCode` `'4821'`, sem linha em `deliveryqueue`. O que falta é a gravação terminar antes da resposta e a confirmação alterar a linha que o enfileiramento criou.

`DeliveryqueueService.create` consulta `findByShopping` e, se a lista está vazia, monta a fila com `status = DeliveryStatus.Waiting` (`1`). O `save` não é esperado, então a Promise do handler resolve antes do INSERT. O segundo POST só vê a linha se esse INSERT já tiver commitado. `validateDelivery` compara o código e, no acerto, instancia uma `DeliveryQueueEntity` nova, sem `id`, sem `shoppingId` e sem `userDeliveryId`. `Repository.save` insere quando a entidade não existe no banco. As duas colunas são `NOT NULL` com FK, então o INSERT falha e `updateStatus` não roda. O pedido permanece em `6`.

**Primary recommendation:** Em `src/services/deliveryqueue.service.ts`, esperar o `save` do enfileiramento, traduzir só a duplicata MySQL `ER_DUP_ENTRY` para `Shopping já usado`, e na confirmação carregar a única linha de `findByShopping`, marcar `DeliveryStatus.Finished` (`2`) e então chamar `updateStatus` com `solicitacaoCompraStatus.Concluded` (`4`). Em `seed/demo.sql`, trocar o `KEY` de `shoppingId` por `UNIQUE KEY` e, depois do `COMMIT`, acrescentar um `ALTER` idempotente para o banco que a fase 1 já criou. Não editar `src/app.module.ts`, `package.json`, o controller, nem o README.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Autenticar o entregador | API / Backend | — | `AuthGuard` global e `RoleGuard` já leem o JWT. A fase não muda token nem login. |
| Enfileirar o pedido como `Waiting` | API / Backend | Database / Storage | A regra fica em `DeliveryqueueService.create`. A linha mora em `deliveryqueue`. |
| Recusar o segundo enfileiramento | API / Backend | Database / Storage | A mensagem nasce no service. O UNIQUE no MySQL impede a segunda linha se as duas requisições passarem da consulta. |
| Confirmar pelo código e concluir a mesma linha | API / Backend | Database / Storage | A comparação do código e o `save` da linha carregada ficam no service. O status do pedido já tem `ShoppingRepository.updateStatus`. |
| Rejeitar código divergente sem gravar | API / Backend | — | O ramo já lança `BadRequestException` antes de qualquer `save`. Não há escrita no banco nesse ramo. |

## Project Constraints (from .cursor/rules/)

- Documentação deste repositório em português do Brasil. Identificadores, rotas, comandos e chaves permanecem em inglês.
- Não acrescentar `console.log`. Falha de negócio continua sendo exceção HTTP.
- Não acrescentar bloco comentado. Não abrir docblock `/** */` em método novo.
- Mensagem nova no mesmo método copia a grafia já usada: `Dados invalidos` e `Shopping já usado`.
- Comparação com `null` e entre strings no método editado usa `==` / `!=`.
- Método novo de service usa mensagem fixa em português. Não repassar `error.message` num `BadRequestException` genérico.
- Repositório: uma operação TypeORM por método. `findByShopping` e `save` já existem. Não criar método só para embrulhar o que o service já chama.
- Handler do controller continua `return this.deliveryqueueService...`. Esta fase não precisa alterar o controller.
- `npm run format` nos TypeScript de `src/` e `test/` se o service for reformatado.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nestjs/common` / `@nestjs/core` | `^10.0.0` em `package.json` | HTTP, `BadRequestException`, guards | Já é a API. Não trocar de framework. |
| `typeorm` | `^0.3.20` | `Repository.save` e `find` | Já persiste a fila. `save` insere ou atualiza conforme a entidade exista no banco. |
| `@nestjs/typeorm` | `^10.0.2` | `forFeature([DeliveryQueueEntity])` | O módulo da fila já registra a entidade. |
| `mysql2` | `^3.9.7` | Driver do TypeORM e do `npm run seed` | O schema da demo é MySQL. A imagem do Compose é `mysql:8.4.11`. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@nestjs/jwt` | `^10.2.0` | JWT do `loginDelivery` | Já emite `sub` com `userDelivery`. Não reimplementar. |
| Jest / `@nestjs/testing` | `^29.5.2` / `^10.0.0` | Specs de scaffold | Já falham por DI. Não são a prova desta fase. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `await repository.save` da linha carregada | `repository.update(id, { status })` | `update` também grava, mas o arquivo vizinho `ShoppingRepository.updateStatus` carrega e chama `save`. Copiar esse caminho. |
| UNIQUE no SQL versionado | `@Column({ unique: true })` e `synchronize` | `ENV=demo` não sincroniza. O decorator não altera o banco que a fase 1 já criou. |
| `SELECT ... FOR UPDATE` | — | Fora de escopo. A recusa sequencial basta. O UNIQUE só impede a segunda linha; não é um lock de aplicação. |

**Installation:**

Não instalar pacotes. Não alterar `dependencies` nem `devDependencies`.

## Package Legitimacy Audit

Esta fase não instala pacote externo. A auditoria de legitimidade não se aplica.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```text
POST /auth/loginDelivery
        |
        v
JWT sub {"userDelivery":"1"}
        |
        v
POST /deliveryqueue/:idShopping
        |
        v
AuthGuard --> RoleGuard (Role.Delivery = '4') --> DeliveryqueueController.create
        |
        v
shopping.findOne + userDelivery.findOne
        |
        +-- ausente --> 400 "Dados invalidos"
        |
        v
findByShopping(id)
        |
        +-- length > 0 --> 400 "Shopping já usado" (nenhum INSERT)
        |
        v
await save(status = Waiting = 1, shoppingId, userDeliveryId)
        |
        +-- ER_DUP_ENTRY (1062) --> 400 "Shopping já usado"
        |
        v
linha deliveryqueue do pedido

POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping
        |
        v
shopping.findOne
        |
        +-- null OU verificationCode diferente --> 400 "Dados invalidos" (zero writes)
        |
        v
findByShopping
        |
        +-- length != 1 --> 400 "Dados invalidos" (zero writes)
        |
        v
await save(mesma entidade, status = Finished = 2)
        |
        v
shopping.updateStatus(Concluded = 4, shopping.id)
```

### Recommended Project Structure

```text
src/services/deliveryqueue.service.ts   # await do create; validateDelivery atualiza a linha carregada
src/repositories/deliveryQueue.repository.ts  # sem método novo; findByShopping e save já bastam
src/controllers/deliveryqueue.controller.ts   # não alterar rotas nem guards
seed/demo.sql                            # UNIQUE no CREATE e ALTER idempotente depois do COMMIT
src/app.module.ts                        # não alterar o literal developmen
```

### Pattern 1: Enfileirar esperando o INSERT

**What:** O service já recusa fila existente e já preenche `Waiting`. O buraco é a Promise solta.
**When to use:** `create`, no ramo `shoppinggDelivery.length <= 0`.
**Example:**

```typescript
deliveryQueue.status = DeliveryStatus.Waiting;
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

O `catch` estreito existe para o UNIQUE. O caminho sequencial continua no `if (shoppinggDelivery.length <= 0)` / `else throw new BadRequestException('Shopping já usado')`. Não engolir erro de FK.

### Pattern 2: Confirmar a entidade já carregada

**What:** `save` atualiza quando a entidade já está no banco. A instância que `find` devolve tem `id`.
**When to use:** `validateDelivery`, somente depois que o código conferir e houver uma única linha.
**Example:**

```typescript
if (shopping == null || shopping.verificationCode != verificationCode) {
  throw new BadRequestException('Dados invalidos');
}

const rows = await this.deliveryQueueRepository.findByShopping(idShopping);
if (rows.length != 1) {
  throw new BadRequestException('Dados invalidos');
}

const deliveryQueue = rows[0];
deliveryQueue.updatedAt = new Date();
deliveryQueue.status = DeliveryStatus.Finished;
await this.deliveryQueueRepository.save(deliveryQueue);
await this.shoppingService.updateStatus(
  solicitacaoCompraStatus.Concluded,
  shopping.id,
);
```

Não construir `new DeliveryQueueEntity()` nesse método. Não chamar `updateStatus` antes do `save` da fila, e não chamá-lo nos ramos que lançam.

### Pattern 3: UNIQUE idempotente no SQL da demo

**What:** Banco novo recebe a chave no `CREATE TABLE`. Banco da fase 1 já tem a tabela, e `CREATE TABLE IF NOT EXISTS` não a altera. O `ALTER` condicional roda depois do `COMMIT`, quando o `DELETE` do pedido 1 já limpou a fila da demo.
**When to use:** só `seed/demo.sql`. Não criar pasta `migrations/` nem ligar `synchronize`.

No `CREATE TABLE` de `deliveryqueue`, substituir o índice simples de `shoppingId` por:

```sql
UNIQUE KEY `UQ_deliveryqueue_shoppingId` (`shoppingId`),
```

Manter `KEY IDX_deliveryqueue_userDeliveryId`. Não apagar `IDX_deliveryqueue_shoppingId` de uma tabela já criada: a FK `FK_deliveryqueue_shoppingId` pode estar apoiada nele. O UNIQUE adicional basta.

Depois do `COMMIT` do miolo:

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

O corpo de `seed/demo.sql` (depois de `-- @schema`) já vai inteiro em `connection.query` com `multipleStatements: true`. Não usar `DELIMITER` nem procedure: o separador do preâmbulo quebra em `;`, e `DELIMITER` é comando de cliente.

### Anti-Patterns to Avoid

- **`new DeliveryQueueEntity()` na confirmação:** `save` insere. As colunas `shoppingId` e `userDeliveryId` são `NOT NULL`. A linha `Waiting` permanece e o pedido não vai para `Concluded`.
- **`save` sem `await` no `create`:** o HTTP devolve antes do INSERT. O segundo POST ainda pode ver a lista vazia.
- **Editar só o `CREATE TABLE IF NOT EXISTS`:** quem já rodou a fase 1 fica sem UNIQUE. Quem clona do zero fica com UNIQUE. Os dois caminhos têm de convergir.
- **`@Column({ unique: true })` no lugar do SQL:** com `ENV=demo` o TypeORM não cria índice.
- **Amarrar a confirmação ao entregador do token:** isso é DLVY-06, fora desta fase. `validateDelivery` hoje não recebe `@Delivery()`.
- **Transação com `SELECT FOR UPDATE`:** o requisito explícito dispensa lock de dois entregadores.
- **Mapper de shopping neste fluxo:** `ShoppingService.findOne` devolve a entidade do repositório. `ShoppingMapper` não participa. Não corrigir mapper de relação nula aqui.
- **Reordenar ou reescrever rotas:** `POST :idShopping` tem um segmento; `validateDelivery` tem três. Não colidem. Não mudar o controller para “organizar”.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Insert ou update da fila | SQL manual ou um segundo repositório | `DeliveryQueueRepository.save` na entidade carregada | O TypeORM já distingue insert de update. O repositório já expõe `save`. |
| Uma fila por pedido | Lock na aplicação, Redis ou fila Bull | `UNIQUE KEY` em `shoppingId` mais a checagem que já lança `Shopping já usado` | O requisito sequencial já tem mensagem. O índice cobre a corrida sem um lock novo. |
| Comparar o código | Query concatenada com o código da URL | `shopping.verificationCode != verificationCode` em memória, depois dos `find` | O código já está na entidade. Concatenar o param em SQL abre injection à toa. |
| Autenticação do entregador | Guard ou esquema Bearer novo | `AuthGuard` + `RoleGuard` + `POST /auth/loginDelivery` | O subject `userDelivery` e o papel `'4'` já fecham a rota. |

**Key insight:** Os dois bugs cabem em um método cada. O schema só precisa da chave única que o `CREATE TABLE` da fase 1 não gravou nas bases já existentes.

## Runtime State Inventory

A fase altera uma tabela que o `npm run seed` da fase 1 pode já ter criado.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Tabela `deliveryqueue` pode já existir só com `KEY IDX_deliveryqueue_shoppingId`. Pedido `1` fica sem linha depois do seed, com `verificationCode` `4821` e `status` `6`. | Edição de código no service. Migração idempotente no `seed/demo.sql` (ALTER condicional), não um UPDATE das linhas de pedido. |
| Live service config | Nenhum — não há n8n, Datadog nem painel fora do git. Verificado pela ausência desses artefatos no escopo da fase. | Nenhuma. |
| OS-registered state | Nenhum — a fila não está em Task Scheduler, pm2 nem systemd. | Nenhuma. |
| Secrets/env vars | `DB_*`, `JWT_SECRET`, `ENV=demo` continuam com os mesmos nomes. | Nenhuma. Não renomear chave. |
| Build artifacts | `dist/` é gitignored e o `nest build` recompila o service. Não há pacote global com o nome antigo. | Recompilar na execução. Não versionar `dist/`. |

## Common Pitfalls

### Pitfall 1: `save` sem `id` insere outra fila

**What goes wrong:** A confirmação não conclui a linha `Waiting`. O MySQL recusa o INSERT sem `shoppingId` / `userDeliveryId`, ou grava uma linha que não é a do pedido. `updateStatus` fica atrás desse `await` e não roda.
**Why it happens:** `Repository.save` insere quando a entidade não existe no banco. Entidade nova sem chave primária não existe.
**How to avoid:** `findByShopping` e `save` da instância devolvida, com `status = DeliveryStatus.Finished`.
**Warning signs:** Continua `new DeliveryQueueEntity()` dentro de `validateDelivery`. A tabela ganha linha sem o id do pedido, ou o POST volta 500 e `shoppings.status` segue `6`.

### Pitfall 2: `CREATE TABLE IF NOT EXISTS` não migra

**What goes wrong:** O plano troca o índice no `CREATE` e o banco da fase 1 continua permitindo duas filas para o mesmo `shoppingId`.
**Why it happens:** O manual do MySQL 8.4 diz que `IF NOT EXISTS` evita o erro se a tabela existe e não verifica se a estrutura é a mesma. `CREATE INDEX` / `CREATE UNIQUE INDEX` não têm cláusula `IF NOT EXISTS`.
**How to avoid:** UNIQUE no `CREATE` para banco novo, e o `PREPARE`/`ALTER` condicional depois do `COMMIT` para banco já criado. O `DELETE` do pedido 1 roda antes, senão duas linhas da demo fazem o `ADD UNIQUE` falhar com duplicata.
**Warning signs:** `SHOW INDEX FROM deliveryqueue` não lista `UQ_deliveryqueue_shoppingId` depois de `npm run seed` num volume antigo. O segundo `npm run seed` não pode falhar com "duplicate key name".

### Pitfall 3: Código conferido depois da escrita

**What goes wrong:** Um código diferente de `4821` muda status da fila ou do pedido.
**Why it happens:** Alguém “otimiza” e chama `updateStatus` antes da comparação, ou trata código errado como conclusão.
**How to avoid:** Os três `throw new BadRequestException('Dados invalidos')` (pedido ausente, código divergente, fila que não é exatamente uma linha) ficam antes dos dois `await` de escrita.
**Warning signs:** `shoppings.status` deixa de ser `6`, ou `deliveryqueue.status` deixa de ser `1`, depois de `POST .../validateDelivery/1/0000`.

### Pitfall 4: Duplicata vira 500

**What goes wrong:** Com o UNIQUE, duas requisições que passaram do `find` fazem o segundo `save` estourar `QueryFailedError`. O Nest responde 500, não `Shopping já usado`.
**Why it happens:** O TypeORM copia as propriedades do erro do driver para `QueryFailedError`, inclusive `code` e `errno`. Sem `catch`, isso não é `HttpException`.
**How to avoid:** No `create`, capturar só `ER_DUP_ENTRY` ou errno `1062` e relançar `BadRequestException('Shopping já usado')`. Qualquer outro erro segue sem virar `error.message`.
**Warning signs:** Corpo HTTP sem o texto `Shopping já usado` quando a chave única recusa o INSERT.

### Pitfall 5: Arrastar dívida que não trava a entrega

**What goes wrong:** A fase mexe em mapper, `validCode`, `DB_DATABASE`, healthcheck do seed, README ou `npm run test:delivery`.
**Why it happens:** `CONCERNS.md` e o review da fase 1 listam esses itens ao lado da fila.
**How to avoid:** Tocar `deliveryqueue.service.ts` e `seed/demo.sql`. Não editar `scripts/apply-demo-sql.js` para criar o UNIQUE. Os specs em `src/tests/**/deliveryqueue*.spec.ts` já falham antes desta fase (`Nest can't resolve dependencies of the DeliveryqueueService`). Não transformá-los na prova. A prova é a fase 3.

## Code Examples

Valores lidos no código desta sessão:

```typescript
export enum DeliveryStatus {
  Waiting = 1,
  Finished = 2,
}
```

```typescript
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

```typescript
export enum Role {
  User = '1',
  Admin = '2',
  Recover = '3',
  Delivery = '4',
  Master = '5',
}
```

Trechos que a fase corrige, como estão hoje:

```typescript
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
```

```typescript
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
```

Índice atual da semente:

```sql
KEY `IDX_deliveryqueue_userDeliveryId` (`userDeliveryId`),
KEY `IDX_deliveryqueue_shoppingId` (`shoppingId`),
```

Pedido semeado:

```sql
INSERT INTO `shoppings` (`id`, `storeAddress`, `deliveryAddress`, `deliveryTime`, `duration`, `status`, `verificationCode`, `storeCode`, `value`, `modoPagamento`, `userEntityId`) VALUES (1, 'Rua das Acácias, 100', 'Rua do Comércio, 50', '30 min', '15 min', 6, '4821', '2312', '42.00', 1, 1);
```

`synchronize` que não se edita:

```typescript
synchronize: process.env.ENV === 'developmen',
```

Subject do token de entregador:

```typescript
subject: JSON.stringify({
  userDelivery: String(id),
}),
```

### O que a fase 3 precisa conseguir observar

Sem escrever o teste nem o README aqui:

1. Login `POST /auth/loginDelivery` com `entregador.demo@example.com` segue sendo a porta de entrada. A senha em claro está só no comentário do seed (`Entrega1!`); o INSERT guarda o hash.
2. `POST /deliveryqueue/1` com esse Bearer grava uma linha `shoppingId = 1`, `userDeliveryId = 1`, `status = 1`.
3. O segundo `POST /deliveryqueue/1` responde 400 com `message` igual a `Shopping já usado` e a contagem de linhas desse pedido continua 1.
4. `POST /deliveryqueue/validateDelivery/1/4821` deixa essa linha em `status = 2` e `shoppings.status` em `4`.
5. Um código diferente, chamado antes da confirmação certa, deixa a fila em `1` e o pedido em `6`.
6. `npm run seed` de novo apaga a fila do pedido 1 e restaura `verificationCode` `4821` e status `6`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `save` sem `await` e entidade nova na confirmação | `await` no INSERT; `save` da linha carregada | Esta fase | A resposta só volta com a linha gravada, e a confirmação conclui essa linha |
| `KEY` não único em `shoppingId` | `UNIQUE KEY UQ_deliveryqueue_shoppingId` | Esta fase, no SQL versionado | Uma linha por pedido no banco que `ENV=demo` realmente usa |

**Deprecated/outdated:**

- Tratar `synchronize` como migração: o literal permanece `developmen` e o exemplo usa `ENV=demo`.
- Inserir fila na confirmação: é o bug, não um atalho aceitável.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `PREPARE`/`EXECUTE`/`DEALLOCATE` no corpo multi-statement de `seed/demo.sql` roda na mesma sessão do `mysql2` e o `@add_uq_deliveryqueue` sobrevive até o `EXECUTE`. [ASSUMED] | Pattern 3 | Se o `npm run seed` falhar no miolo, parar e reportar. `UQ_deliveryqueue_shoppingId` continua só em `seed/demo.sql`: `UNIQUE KEY` no `CREATE` e o `PREPARE` depois do `COMMIT`. Não mover o `ALTER` para `scripts/apply-demo-sql.js`. |
| A2 | Acrescentar `UNIQUE KEY` sem remover `IDX_deliveryqueue_shoppingId` não quebra `FK_deliveryqueue_shoppingId`. [ASSUMED] | Pattern 3 | Se o `ALTER` falhar por causa do índice antigo, manter os dois índices não é opcional: não dropar o `KEY` que a FK usa. Ajustar só o nome do UNIQUE. |
| A3 | `QueryFailedError` expõe `code`/`errno` do `mysql2` porque o construtor copia `driverError`. O errno `1062` não foi reproduzido ao vivo nesta sessão. [ASSUMED] | Pitfall 4 | O `catch` não reconhece a duplicata e a corrida responde 500. O caminho sequencial, que lança antes do `save`, continua válido para DLVY-02. |

**If this table is empty:** não se aplica. A1–A3 pedem confirmação na execução, não uma decisão nova de produto.

## Open Questions (RESOLVED)

1. **O `PREPARE` do miolo sobrevive ao `connection.query` único?** — RESOLVED
   - What we know: o corpo inteiro depois de `-- @schema` é um `query` com `multipleStatements: true`. MySQL 8.4 aceita `ALTER TABLE` como prepared statement.
   - Resolution: `UQ_deliveryqueue_shoppingId` nasce em `seed/demo.sql`. O `CREATE TABLE` de `deliveryqueue` declara `UNIQUE KEY UQ_deliveryqueue_shoppingId`. Depois do `COMMIT`, o mesmo arquivo traz o `PREPARE stmt_uq_deliveryqueue` idempotente do Pattern 3. `npm run seed` aplica esse SQL duas vezes; a segunda execução deixa o pedido 1 sem linha em `deliveryqueue` e o índice único presente. `scripts/apply-demo-sql.js` não recebe o `ALTER`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | API e `npm run seed` | ✓ | v24.5.0 | — |
| npm | Scripts existentes | ✓ | 11.9.0 | — |
| Docker | Compose `mysql:8.4.11` na execução | ✓ | server 29.8.0 | MySQL local já acessível por `DB_*` |
| Cliente `mysql` no PATH | Não é usado pelo seed | ✗ | — | `npm run seed` usa `mysql2`. Não instalar cliente. |

**Missing dependencies with no fallback:**

- Nenhuma para planejar. A execução que for olhar a linha no banco precisa do MySQL do Compose ou de um servidor já configurado pelo exemplo da fase 1.

**Missing dependencies with fallback:**

- Cliente `mysql`. O seed não depende dele.

## Security Domain

`workflow.security_enforcement` está ligado (`security_asvs_level` 1). A fase não abre superfície nova: as rotas, o Bearer e o papel já existem.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | JWT já emitido por `AuthService.createTokenDelivery`. Não criar outro login. |
| V3 Session Management | yes | Stateless. O estado de auth é o JWT. Não criar sessão de servidor. |
| V4 Access Control | yes | `AuthGuard` global + `@Roles(Role.Delivery)` + `RoleGuard` no controller. Não alargar papel. Não implementar DLVY-06. |
| V5 Input Validation | yes | `idShopping` continua `string` convertido com `+idShopping`. O código é comparado como string ao `varchar` `verificationCode`. Não concatenar param em SQL. |
| V6 Cryptography | no | A fase não hasheia senha nem gera código. O hash da demo permanece o que a fase 1 gravou. |

### Known Threat Patterns for NestJS + TypeORM + MySQL

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| `save` sem `await` deixa a fila ausente depois do HTTP 201 | Tampering | `await` no `save` antes do handler resolver |
| Confirmação insere linha órfã em vez de concluir a existente | Tampering | `save` da entidade carregada por `shoppingId` |
| Segunda fila para o mesmo pedido | Tampering | Checagem atual + `UNIQUE KEY (shoppingId)` |
| Código da URL comparado via SQL concatenado | Tampering | Comparar em memória com `!=` e só então gravar |
| Qualquer entregador autenticado confirma qualquer pedido | Elevation of privilege | Aceito nesta fase. DLVY-06 está fora do roadmap v1. Não enfraquecer o papel `Delivery`. |
| `QueryFailedError` de duplicata vira 500 | Information disclosure | Traduzir só `ER_DUP_ENTRY` para a mensagem já pública `Shopping já usado` |

## Sources

### Primary (HIGH confidence)

- `src/services/deliveryqueue.service.ts:17-61` — `create` sem `await`; `validateDelivery` instancia entidade nova; mensagens `Shopping já usado` e `Dados invalidos`
- `src/controllers/deliveryqueue.controller.ts:10-41` — rotas, `@Roles(Role.Delivery)`, `@Delivery()` só no create
- `src/repositories/deliveryQueue.repository.ts:13-32` — `save` e `findByShopping`
- `src/entities/deliveryQueue.entity.ts:24-39` — colunas `status`, `shoppingId`, `userDeliveryId`
- `src/enums/deliveryStatus.enum.ts:1-4` — `Waiting = 1`, `Finished = 2`
- `src/enums/solicitacaoCompraStatus.enum.ts:1-9` — `Concluded = 4`, `WaitingMotoboy = 6`
- `src/enums/role.enum.ts:1-7` — `Delivery = '4'`
- `src/repositories/shopping.repository.ts:35-47` — `findOne` sem relations; `updateStatus` atribui `status` e `save`
- `src/services/shopping.service.ts:30-42` — `findOne` não usa mapper
- `seed/demo.sql:1-7`, `78-101` — schema da fila, `DELETE` da fila, pedido `1` / `4821` / status `6`, e-mail do entregador
- `src/app.module.ts:47` — `synchronize: process.env.ENV === 'developmen'`
- `src/services/auth.service.ts:121-130` — subject `userDelivery`
- `src/guard/auth.guard.ts:36-39` e `src/guard/role.guard.ts:35-36` — carga do entregador e papel `Delivery`
- `scripts/apply-demo-sql.js:164-183` — corpo SQL num único `query` com `multipleStatements`
- `node_modules/typeorm/error/QueryFailedError.js:9-25` — `driverError` copiado para o erro
- `compose.yaml:2` — `image: mysql:8.4.11`
- Jest nesta sessão: os dois specs de `deliveryqueue` falham com `Nest can't resolve dependencies of the DeliveryqueueService`

### Secondary (MEDIUM confidence)

- [CITED: https://typeorm.io/docs/working-with-entity-manager/repository-api] — `save` atualiza se a entidade já existe e insere se não existe
- [CITED: https://dev.mysql.com/doc/refman/8.4/en/create-index.html] — gramática de `CREATE [UNIQUE] INDEX` sem `IF NOT EXISTS`; UNIQUE recusa valor repetido
- [CITED: https://dev.mysql.com/doc/refman/8.4/en/create-table.html] — `IF NOT EXISTS` não confere a estrutura da tabela existente
- [CITED: https://dev.mysql.com/doc/refman/8.4/en/sql-prepared-statements.html] — `ALTER TABLE` e `CREATE INDEX` são preparáveis
- [CITED: https://github.com/nestjs/nest/blob/master/packages/common/exceptions/bad-request.exception.ts] — string no `BadRequestException` vira `message` do JSON 400

O seam `classify-confidence --provider webfetch --verified` devolveu `LOW` para essas páginas. Por isso elas ficam como `[CITED]`, não como `[VERIFIED]`.

### Tertiary (LOW confidence)

- A1–A3 na Assumptions Log. Não foram executadas contra o MySQL nesta sessão.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — versões lidas em `package.json` e `compose.yaml`; nenhum pacote novo
- Architecture: HIGH — fluxo lido nos arquivos de fila, pedido, guard e seed
- Pitfalls: MEDIUM — o bug do `save` está no fonte; o `ALTER` idempotente ainda não rodou no MySQL

**Research date:** 2026-10-11
**Valid until:** 2026-11-10 (stack estável; o comportamento do seed merece confirmação na execução)

## What the planner should touch

| File | Action |
|------|--------|
| `src/services/deliveryqueue.service.ts` | `await` no `create`; `catch` só de `ER_DUP_ENTRY`; `validateDelivery` atualiza a única linha carregada e só então conclui o pedido |
| `seed/demo.sql` | `UNIQUE KEY` no `CREATE` de `deliveryqueue` e `ALTER` idempotente depois do `COMMIT` |

Não tocar: `src/app.module.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/repositories/deliveryQueue.repository.ts`, mappers, `package.json`, README, `src/tests/**/deliveryqueue*.spec.ts`, `scripts/apply-demo-sql.js`.

O UNIQUE fica em `seed/demo.sql`. Não mover o `ALTER` para o aplicador.
