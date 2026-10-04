# Pitfalls Research

**Domain:** API NestJS + TypeORM de backoffice de farmácia (iFarma / Colibri) — tornar demonstrável o caminho semear pedido, enfileirar e confirmar a entrega por código
**Researched:** 2026-10-04
**Confidence:** HIGH

O marco não cria produto. Ele faz um clone seguir o README, subir a API e concluir um pedido já semeado. Os erros abaixo são os que deixam esse percurso vermelho ou verde pelo motivo errado. PAN/CVV, isolamento de loja, rate limit, recuperação de senha e escala ficam de fora, salvo quando um "conserto" desses temas impede a demo.

## Critical Pitfalls

### Pitfall 1: `validateDelivery` grava uma fila nova

**What goes wrong:**
`POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` responde sucesso (ou 500) sem concluir a linha que `POST /deliveryqueue/:idShopping` criou. O pedido em `shoppings` pode ir para `solicitacaoCompraStatus.Concluded` (4) enquanto a linha original em `deliveryqueue` continua `DeliveryStatus.Waiting` (1). O leitor vê a entrega "confirmada" e a fila do entregador não muda.

**Why it happens:**
`DeliveryqueueService.validateDelivery` faz `new DeliveryQueueEntity()`, preenche só `updatedAt` e `status`, e chama `save`. A documentação do TypeORM diz que `save` procura a linha pela chave primária: se o `id` não existe no banco, a operação é `INSERT`. Sem `id`, `shoppingId` e `userDeliveryId`, o INSERT omite colunas (`undefined` não entra no `save`) e o MySQL recusa `NOT NULL` sem default — a API estoura antes de `updateStatus`. Se o schema real estiver mais permissivo que a entidade, o INSERT passa, nasce um órfão `Finished` e o `updateStatus` segue. O `await` dessa chamada já existe; acrescentar outro `await` não troca INSERT por UPDATE.

**How to avoid:**
Carregar a fila com `DeliveryQueueRepository.findByShopping(idShopping)`. Atualizar essa instância (`id` presente, `status = DeliveryStatus.Finished`) e só então `save`. Conferir o `userDeliveryId` com o entregador do token. `DeliveryqueueController.validateDelivery` hoje não recebe `@Delivery()`; o serviço não tem como saber o dono se o controller não passar o `id`. Mudar os dois arquivos no mesmo passo. A asserção do teste é: uma linha para aquele `shoppingId`, o mesmo `id` de depois do enqueue, `status === 2`, e `shoppings.status === 4`. `expect(save).toHaveBeenCalled()` sem olhar o `id` passa com o bug atual.

**Warning signs:**
- O objeto enviado ao `save` tem `id` `undefined`.
- `SELECT COUNT(*) FROM deliveryqueue WHERE shoppingId = ?` devolve 2 depois da confirmação.
- A confirmação devolve 500 com erro de coluna sem default, e o status do pedido não mudou.
- O teste só espera HTTP 201 ou `BadRequestException` ausente.

**Phase to address:**
Fase de correção da fila e da confirmação (antes do README e do teste que prova o caminho).

---

### Pitfall 2: `create` resolve antes do `INSERT`

**What goes wrong:**
O README (ou o teste) faz enqueue e, em seguida, confirma. A confirmação não acha fila, devolve `Dados invalidos`, ou perde a corrida e os dois POST enxergam `findByShopping` vazio. A resposta do enqueue já saiu vazia. Não é cenário de carga: uma pessoa, duas requisições em sequência, no mesmo processo.

**Why it happens:**
`DeliveryqueueController.create` devolve a Promise de `DeliveryqueueService.create`. O método é `async` e espera `findOne` / `findByShopping`, mas a linha `this.deliveryQueueRepository.save(deliveryQueue)` não é `await` nem `return`. A Promise do método assenta no fim da função, com o `save` ainda pendente. O Nest então manda o 201. O ESLint deste repositório estende `plugin:@typescript-eslint/recommended`, que não liga `no-floating-promises`. O lint fica limpo. Colocar `await` só no controller não muda nada: a Promise do serviço já resolve cedo.

**How to avoid:**
`return await this.deliveryQueueRepository.save(deliveryQueue)` dentro do `if`. O teste do enqueue usa um `save` que devolve uma Promise adiada: `await service.create(...)` só pode resolver depois que essa Promise resolver. Mock que devolve `Promise.resolve()` na hora não pega este bug. Não há índice único em `shoppingId`; o `await` é o que segura a demo de um entregador. Índice único é endurecimento extra e não substitui o `await`.

**Warning signs:**
- Entre o `findByShopping` e o fim de `create` existe uma chamada de `save` sem `await` (`src/services/deliveryqueue.service.ts`).
- O 201 chega e `findByShopping` ainda volta `[]`.
- Dois cliques seguidos no Swagger, o segundo não é `Shopping já usado` e nascem duas linhas.

**Phase to address:**
A mesma fase da confirmação. O teste dessa fase precisa falhar se o `save` do enqueue não for esperado. Sem isso, a fase do README documenta um 201 que ainda não persistiu.

---

### Pitfall 3: Fila e pedido commitam separados, e o 400 mente

**What goes wrong:**
A fila fica `Finished` e o pedido continua `Created`, ou o contrário. A pessoa repete a confirmação e recebe `Shopping já usado` no enqueue ou `Dados invalidos` / `Compra/Status invalido.` na confirmação. O corpo não diz qual dos dois writes falhou.

**Why it happens:**
`validateDelivery` grava a fila e depois chama `ShoppingService.updateStatus`. São duas conexões lógicas. `ShoppingRepository.updateStatus` faz `findOne` e atribui `shopping.status` sem testar nulo; qualquer erro vira `BadRequestException('Compra/Status invalido.')`. Pedido inexistente, falha de SQL e transição inválida saem com a mesma frase. `validateDelivery` também usa `Dados invalidos` para pedido ausente e para código diferente. A documentação do TypeORM trata `synchronize` e migrations como o lugar do schema; ela não junta estes dois `save` numa transação. `save` de uma entidade não cobre o `save` seguinte.

**How to avoid:**
Uma transação (`DataSource.transaction` ou o `EntityManager` do query runner) que trave a fila daquele `shoppingId` e o pedido, e grave os dois status juntos. Se o código não bater, não abrir a transação de escrita. Mensagem da demo pode continuar curta, mas o teste distingue: código errado não chama `save`; pedido ausente não chama `save` da fila; falha no meio dá rollback das duas tabelas. Não mapear `QueryFailedError` para `Dados invalidos` dentro deste fluxo — o README precisa de um 400 estável só para código divergente.

**Warning signs:**
- `deliveryqueue.status = 2` com `shoppings.status = 1` para o mesmo id.
- Log com `Compra/Status invalido.` logo depois de um `UPDATE` em `deliveryqueue`.
- Repetir o script do README não tem caminho de volta além de apagar linha à mão.

**Phase to address:**
Fase de correção da fila e da confirmação. A fase do teste asserta os dois status depois de um único `await` da confirmação.

---

### Pitfall 4: `.env` é lido depois que o módulo já capturou `process.env`

**What goes wrong:**
Quem clona, copia o exemplo de ambiente e roda `npm run start:dev` vê a API cair na conexão MySQL (`DB_HOST` vazio, porta `NaN`). O arquivo `.env` está na raiz e parece carregado. `JWT_SECRET` vira a string `"undefined"` no `JwtModule.register`, porque `String(undefined)` é essa string. O processo não chega na confirmação.

**Why it happens:**
`src/main.ts` importa `AppModule` e só então chama `dotenv.config()`. Com `"module": "commonjs"`, o `tsc` emite os `require` no topo. `dotenv.config()` como chamada solta roda depois de `AppModule` ter sido avaliado. `TypeOrmModule.forRoot({ host: process.env.DB_HOST, ... })` e o `JwtModule.register` em `src/modules/auth.module.ts` leem o ambiente nessa avaliação. `ConfigModule.forRoot()` está no mesmo `imports` e também só corre quando o Nest inicializa o módulo — tarde demais para o objeto já montado do `forRoot`. A documentação do Nest (página do Drizzle, o mesmo contrato de `forRoot`) diz que as opções são avaliadas quando o arquivo do `AppModule` é importado, então a variável precisa já existir, ou a leitura tem de ir para `forRootAsync` + `ConfigService`. Mover `dotenv.config()` para "acima" do import no `.ts` não muda o JavaScript emitido.

**How to avoid:**
O primeiro import de `src/main.ts` é `import 'dotenv/config'`, antes de `./app.module`. Isso vira o primeiro `require` e preenche `process.env` para o TypeORM e para o JWT. Alternativa equivalente: `TypeOrmModule.forRootAsync` e `JwtModule.registerAsync` lendo `ConfigService`, com `ConfigModule.forRoot()` importado nesse factory. Uma só das duas pontas deixa a outra com valor vazio. Não documentar `export` manual de cada variável como passo do README se o exemplo de ambiente já existe: o leitor vai copiar o arquivo e esperar que baste.

**Warning signs:**
- Stack de `mysql2` com host vazio na primeira subida, com `.env` presente.
- Token emitido e aceito com segredo `"undefined"` (a demo até loga, e o segredo real do arquivo é ignorado).
- `console.log(process.env.DB_HOST)` dentro de `bootstrap` mostra o valor, e o TypeORM já conectou sem ele — o log tardio mente.

**Phase to address:**
Fase de ambiente reproduzível, antes da semente e de qualquer teste que abra `AppModule`.

---

### Pitfall 5: Corrigir o typo de `synchronize` para "criar as tabelas"

**What goes wrong:**
O banco da demo sobe vazio, o seed falha, ou — depois do "conserto" — cada boot altera o MySQL. `synchronize: process.env.ENV === 'developmen'` em `src/app.module.ts` nunca é verdadeiro para `ENV=development`. Não há pasta `migrations/`. Coluna com `default` na entidade não vira default no MySQL enquanto o synchronize está desligado. O `INSERT` da semente que omite `validatedEmail`, `userAuthorized`, `phoneNumber`, `verificationCode` ou `userDeliveryId` quebra.

**Why it happens:**
O typo parece um bug óbvio a corrigir no mesmo PR do `.env`. Aí o exemplo de ambiente usa `ENV=development`, o Pitfall 4 passa a carregar esse valor, e `synchronize: true` liga. A documentação do TypeORM diz para não usar `synchronize` quando já existe dado: o schema é reescrito a partir das entidades e dá para perder coluna. O default de `@Column` também não é aplicado num `INSERT` SQL cru; ele só existe se o TypeORM criou a coluna ou se o SQL declara o default.

**How to avoid:**
Deixar `synchronize: false` de propósito neste marco. Versionar um SQL de schema + semente (arquivo no repositório, não um `mysql -e` com a senha hasheada na linha de comando). O SQL lista as colunas `NOT NULL` que a entidade marca sem default, na ordem das FKs: `users` (cliente do pedido, tabela de `UserClientEntity`), `userdelivery`, `shoppings`, e nenhuma linha prévia em `deliveryqueue` para aquele pedido. Não corrigir o literal `developmen` no mesmo passo em que o `.env` passa a ser lido, a menos que o valor comparado deixe de existir no exemplo. Migrations de pipeline ficam fora do marco; o SQL da demo é o substituto mínimo para o clone.

**Warning signs:**
- `npm run start:dev` loga queries de `CREATE`/`ALTER`/`DROP` no boot.
- Seed falha com `Field 'validatedEmail' doesn't have a default value` ou `userEntityId`.
- Ambiente local de quem já usava o banco muda de coluna depois do pull.

**Phase to address:**
Fase de ambiente reproduzível, junto com a semente. A fase da confirmação assume que as tabelas já existem e não liga synchronize para "aplicar" um `@Unique` novo.

---

### Pitfall 6: Semente que não autentica, não repete e não casa com o README

**What goes wrong:**
O entregador da demo não entra. `POST /auth/loginDelivery` responde 500 ou 401 `Email e/ou senha incorretos.` O segundo ensaio do README quebra com e-mail duplicado ou `Shopping já usado`. O id escrito no README não é o `AUTO_INCREMENT` que o MySQL gerou. O código de verificação do README não é o da linha `shoppings`.

**Why it happens:**
`UserDeliveryRepository.login` só segue se `bcrypt.compare` devolver true. `bcrypt` 5.1.1 (`package.json`) manda o hash ao binding nativo; texto claro não é hash bcrypt. O `login` do entregador não tem `try/catch` (o `catch` que reempacota erro fica no `create`). Exceção do binding vira 500; `false` vira `UnauthorizedException`. Os dois impedem o Bearer. A coluna `password` tem `length: 127`, cabe o hash de 60 caracteres — o corte clássico de `varchar(30)` não é o deste modelo. O que corrompe o hash aqui é outro: no PowerShell, string com aspas duplas expande `$2b$...` e o `INSERT` grava lixo. `email` é `unique`. `create` recusa pedido que já tem qualquer linha em `deliveryqueue`. `PrimaryGeneratedColumn` sem id fixo no SQL produz um id diferente do exemplo.

**How to avoid:**
Gerar o hash com `bcrypt.hash` (o mesmo pacote do login) e colocá-lo num arquivo `.sql`. O README mostra a senha em texto que a pessoa digita; o arquivo não passa por aspas duplas do PowerShell (`mysql ... -e "INSERT ..."`). Rodar o arquivo com redirecionamento (`Get-Content seed.sql | mysql ...`, ou `mysql < seed.sql` no cmd). Ids fixos no `INSERT`. O script apaga antes, pelas chaves da demo (`DELETE` da fila daquele `shoppingId`, depois pedido, entregador e cliente), e insere de novo. `verificationCode` do SQL é a string exata que o README e o teste usam. `active` false não bloqueia este login (o repositório não olha `active`); não gastar a fase com essa regra. O operador de backoffice, se entrar na semente porque o projeto pede a loja, precisa de `authorized = 1` e hash — e o percurso da demo não usa o token dele na fila.

**Warning signs:**
- `password` da linha demo não começa com `$2a$` ou `$2b$` e 60 caracteres.
- Segunda execução do seed estoura `Duplicate entry` em `userdelivery.email`.
- README manda `POST /deliveryqueue/1/...` e `SELECT id FROM shoppings` devolve outro número.
- Hash no histórico do shell aparece curto, sem o trecho `$10$`.

**Phase to address:**
Fase da semente, depois do ambiente sobe e antes do teste de ponta a ponta. O README só cita senha, id e código que essa fase gravou.

---

### Pitfall 7: O percurso usa o login e os parâmetros errados

**What goes wrong:**
Enqueue e confirmação respondem 403, ou 400 `Usuario não encontrado`, ou `Dados invalidos`, com senha certa e código certo. O Swagger em `/api` mostra o cadeado, a pessoa cola o token do operador, e a fila não anda.

**Why it happens:**
`DeliveryqueueController` declara `@Roles(Role.Delivery)` e `@UseGuards(RoleGuard)`. `Role.Delivery` é a string `'4'`. `AuthGuard` só preenche `request.userDelivery` quando o `subject` do JWT tem a chave `userDelivery`, emitida por `createTokenDelivery` (`POST /auth/loginDelivery`). `POST /auth/login` emite `{ user: id }`. Aí o `RoleGuard` cai em `roles.includes(user.role)` e devolve `false` — o Nest transforma isso em 403, não em 401. O decorator `@Delivery()` lança `BadRequestException('Usuario não encontrado')` se a rota chegar nele sem `request.userDelivery`. A rota de confirmação é `validateDelivery/:idShopping/:codeShopping`: o primeiro param é o id numérico do pedido; o segundo é `verificationCode`. O nome `codeShopping` parece o código do pedido-id. Trocar os dois faz `findOne` procurar o código como id (`+code` vira `NaN` ou outro número) e comparar o id com `verificationCode`. `ValidationPipe` global está sem `transform`; o param chega string, e o `+idShopping` do controller é o que vira número. Bearer ausente também cai no `catch` do `AuthGuard`, que dá `return false` (403).

**How to avoid:**
O README, na ordem: `POST /auth/loginDelivery` com o e-mail e a senha da semente; header `Authorization: Bearer` com o access token; `POST /deliveryqueue/{id}` ; `POST /deliveryqueue/validateDelivery/{id}/{verificationCode}`. O teste que sobe HTTP usa esse login, não `POST /auth/login`. Não mudar o contrato da URL neste marco (tirar o código do path quebra o endpoint que a demo exibe). Não acrescentar passo `GET /shopping/:id` para "ler o código": esse `findOne` devolve `verificationCode` cru, e o código da demo já está na semente. Não reativar `RoleGuard` global nem auditar loja nesta fase.

**Warning signs:**
- 403 com token que o `/auth/login` acabou de devolver.
- 400 `Dados invalidos` com o código correto colocado no primeiro segmento.
- O spec monta o header e nunca chama `loginDelivery`.
- README diz "401 se o token estiver ausente".

**Phase to address:**
Fase do README, com o contrato já estável na fase da fila. O teste da fase anterior já usa o id do entregador que o controller passaria; a fase do README é a que impede o 403 humano.

---

### Pitfall 8: O teste fica verde e o `npm test` continua vermelho

**What goes wrong:**
O comando que o leitor roda falha. Ou ele passa sem ter provado que a linha existente foi concluída. O portfólio parece quebrado no primeiro `npm test`, que é o que a seção Test do README starter ainda documenta.

**Why it happens:**
`package.json` usa Jest 29, `rootDir` `src`, `testRegex` `.*\.spec\.ts$`. Isso coleta `src/tests/**/*.spec.ts`. `src/tests/controllers/app.controller.spec.ts` importa `app.controller` e `app.service`, que não existem. Os specs de domínio fazem `Test.createTestingModule` com a classe concreta e sem `useValue`. `DeliveryqueueService` pede repositório, `ShoppingService` e `UserDeliveryService`; o `compile()` daquele spec joga antes de qualquer `it`. `test/app.e2e-spec.ts` espera `GET /` com `Hello World!` e sobe `AppModule` (MySQL, `MailingService`, guard global) sem `app.close()`. A CLI atual do Jest trata um argumento posicional como regex e só executa arquivos que casam; `npm test` sem argumento executa a suíte inteira. `--passWithNoTests` devolve sucesso com zero testes se o caminho do spec estiver errado. No Windows a própria documentação do Jest pede `/` ou `\\` escapado no padrão.

**How to avoid:**
Um arquivo novo, com nome que não case com os specs velhos, por exemplo `src/tests/services/delivery-confirmation.spec.ts`. Imports relativos (`../../services/...`), como os specs que já compilam o caminho. `useValue` para `DeliveryQueueRepository`, `ShoppingService` e `UserDeliveryService`. Casos mínimos no mesmo comando: enqueue só resolve depois do `save`; segunda chamada com fila existente lança `Shopping já usado`; confirmação dá `save` no `id` carregado e `updateStatus(solicitacaoCompraStatus.Concluded, id)`; código divergente não chama `save`. O script npm da demo é esse arquivo, via argumento posicional (`jest delivery-confirmation.spec.ts`), que a documentação descreve como regex de caminho. Apontar o script `test` para esse spec, ou tirar do `test` o scaffold que não compila — senão quem segue o README starter continua no vermelho. Não usar `npm run test:e2e` como prova: ele sobe o `AppModule` e o Hello World. Não colocar o spec novo em `test/` se o comando for `npm test` com `rootDir` `src`: esse regex não olha a pasta `test`.

**Warning signs:**
- `Cannot find module '../controllers/app.controller'` ou `Nest can't resolve dependencies of the DeliveryqueueService`.
- O `it` novo foi acrescentado no spec antigo e o `beforeEach` quebra antes dele.
- Cobertura sobe e nenhum `expect` olha `id` / `shoppingId` / `userDeliveryId`.
- O comando da demo imprime `Tests: 0`.

**Phase to address:**
Fase da prova automatizada, depois da correção da fila. Ela não "arruma" a suíte inteira. Ela impede que o comando citado no README execute o scaffold.

---

### Pitfall 9: O conserto passa pelo mapper com relação nula

**What goes wrong:**
Lista, item do pedido ou um save "via DTO" explode com `Cannot read properties of null` / `undefined` em `.name` ou `.deliveryTime`. O `catch` de `ProductService.findByShopping` transforma isso em `Pedido invalido.` A confirmação, se alguém passar a usar o mapper, cai no mesmo ponto.

**Why it happens:**
`ShoppingMapper.toDTO` lê `entity.userClientEntity.name`. `toEntity` atribui `entity.userClientEntity.name` numa entidade nova, com a relação ainda nula. `ProductMapper.toDTO` lê `entity.shoppingEntity.deliveryTime` (e endereço, valor, pagamento). `toEntity` atribui esses campos sem instanciar `shoppingEntity`. `strictNullChecks` está `false` no `tsconfig.json`, então o TypeScript aceita. O caminho atual de confirmar usa `ShoppingRepository.findOne` sem `relations` e não chama mapper. `POST /shopping` (lista) carrega `userClientEntity`; se a semente não tiver a linha em `users`, o `toDTO` quebra. `GET /product/findByShopping/:id` carrega `shoppingEntity` e quebra se o produto não tiver pedido. `toEntity` hoje não está no fluxo de leitura — entra na demo só se a fase "aproveitar" o mapper para montar a fila ou o pedido.

**How to avoid:**
Confirmar e enfileirar continuam no serviço e no repositório, sem `toEntity`. Se o README incluir a lista, a semente cria o `UserClientEntity` e o teste da lista não é o comando da entrega. Se alguma fase tocar o mapper, instanciar a relação antes de escrever (`entity.userClientEntity = new UserClientEntity()`) ou parar de escrever nela. Não trocar o acesso por encadeamento opcional que devolve nome vazio: a demo parece no ar com cliente faltando. `ProductMapper` fica fora do percurso, a menos que um passo do README chame `findByShopping`; aí o produto semeado precisa da FK do pedido, porque o serviço já esconde o `TypeError` atrás de `Pedido invalido.`

**Warning signs:**
- Stack em `shopping.mapper.ts` ou `product.mapper.ts` durante o script do README.
- Resposta `Pedido invalido.` para um id de pedido que existe, com item sem `shoppingEntity`.
- Diff da confirmação importa `ShoppingMapper`.

**Phase to address:**
Fase da confirmação: não acoplar o mapper. Fase da semente: cliente e FK só se a lista entrar no percurso. Não abrir fase de "limpar mappers" como pré-requisito da demo.

---

### Pitfall 10: A relação da fila é lida como um objeto só

**What goes wrong:**
O código novo carrega `UserDeliveryEntity.deliveryQueueEntity` e lê `.status` ou `.shoppingId`. O valor é um array (ou vem vazio). O status gravado é `undefined`, ou o `save` escreve a relação errada. Com duas linhas para o mesmo pedido (resto do Pitfall 1), o `OneToOne` não escolhe a linha da demo.

**Why it happens:**
`UserDeliveryEntity.deliveryQueueEntity` está anotado com `@OneToMany` e tipado como `DeliveryQueueEntity`, não como array. O TypeORM hidrata `OneToMany` como lista. `DeliveryQueueEntity.shoppingEntity` é `@OneToOne` sem unique em `shoppingId`, então o banco aceita duas filas para o mesmo pedido. `findByShopping` já devolve array e o `create` olha `.length`. O atalho "pegar a relação do entregador" ignora esse repositório.

**How to avoid:**
Continuar em `findByShopping`. Tratar o retorno como lista: zero linhas é `Dados invalidos` na confirmação; mais de uma é estado sujo da semente, não "a primeira que aparecer" sem critério. A semente não deixa linha prévia. Não reescrever o decorator `@OneToMany` para `@OneToOne` neste marco só para o tipo bater — isso muda o mapa e, com synchronize ligado, mexe no schema (Pitfall 5).

**Warning signs:**
- `deliveryQueueEntity.status` no fonte novo, com o campo tipado como entidade única em `userDelivery.entity.ts`.
- `findByShopping` devolve length diferente de 1 na confirmação da demo.
- Teste usa um objeto solto onde o repositório devolve `DeliveryQueueEntity[]`.

**Phase to address:**
Fase de correção da fila. A semente garante uma linha no máximo, criada pelo enqueue, não pelo SQL.

---

## Technical Debt Patterns

Atalhos que parecem fechar a demo e cobram depois.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `await` só no controller, `save` solto no `create` | O método controller "parece" async | O 201 sai antes do INSERT; a confirmação não vê a fila | Nunca |
| `save` de `new DeliveryQueueEntity()` com `status` preenchido | O código fica curto e o `await` existe | INSERT órfão ou 500 de `NOT NULL`; a linha `Waiting` permanece | Nunca |
| Assert `toHaveBeenCalled()` no `save` | O spec fica verde no mesmo dia | O bug do `id` ausente continua e a demo mente | Nunca neste fluxo |
| Ligar `synchronize` corrigindo `developmen` | Tabelas aparecem sem SQL | Boot reescreve o MySQL; dado local some | Nunca neste marco; usar SQL versionado |
| Senha da demo em texto na coluna `password` | O SQL lê igual ao README | `loginDelivery` não autentica | Nunca; texto só no README, hash no SQL |
| `npm test` intacto e um spec novo ao lado | Não mexe nos 21 specs do scaffold | O comando que o starter documenta continua vermelho (`app.controller` ausente e `compile()` sem provider) | Só se o README e o script `test` deixarem de apontar para essa suíte |
| Teste e2e com `AppModule` + MySQL real como única prova | Exercita HTTP de verdade | Exige MySQL no `npm test`, puxa `MailingService` e o `GET /` inexistente | Fora deste marco; a prova é o spec do fluxo com repositório duplo e asserção de identidade da linha |
| Encadeamento opcional no mapper | A lista para de lançar | Nome e endereço somem e a semente incompleta passa | Nunca; instanciar a relação ou não chamar o mapper |
| `GET /shopping/:id` no README para copiar `verificationCode` | Não precisa escrever o código na doc | Ensina o vazamento já conhecido do `findOne` e acopla a demo a um DTO cru | Nunca; o código fictício vem da semente |
| Fechar PAN, isolamento, throttler ou e-mail "já que o arquivo está aberto" | O diff parece mais responsável | Atrasa o caminho semeado e mexe em módulo que a demo não chama | Nunca neste marco |
| Índice único em `shoppingId` só na entidade | Parece eliminar fila dupla | Com `synchronize: false` o MySQL não ganha o índice | Adiar; o `await` segura a demo de uma pessoa |

## Integration Gotchas

Erros ao ligar MySQL, JWT, bcrypt e o boot do Nest. Não há PSP, fila externa nem HTTP de terceiro neste fluxo.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| MySQL via `TypeOrmModule.forRoot` | Achar que `ConfigModule.forRoot()` no `imports` preenche `DB_HOST` antes do objeto de opções | `import 'dotenv/config'` como primeiro import de `src/main.ts`, ou `forRootAsync` + `ConfigService` |
| `JwtModule.register` em `src/modules/auth.module.ts` | Corrigir só o TypeORM e deixar o segredo capturado na avaliação do módulo | A mesma carga antecipada do ambiente cobre o `register`; não abrir fase de rotação de segredo |
| `POST /auth/loginDelivery` + bcrypt 5.1.1 | Gravar a senha do README direto na coluna, ou embutir `$2b$` numa string do PowerShell | Hash no `.sql`; executar o arquivo sem expansão de `$` |
| `RoleGuard` + `subject` `userDelivery` | Usar o token de `POST /auth/login` no Swagger da fila | Token de `createTokenDelivery`; 403 é o sintoma de subject `user` |
| `MailingService` no boot | Tratar SMTP vazio como motivo da API não escutar, e encher o README de `MAIL_*` | O construtor não conecta no SMTP; ele faz `readFileSync` de `templates/confirmation.hbs` e `templates/recoverPassword.hbs` em `join(__dirname, '../../templates')`. Com `nest build`, `__dirname` é `dist/services` e o caminho sobe até `templates/` na raiz. E-mail continua desligado. Não adicionar Webpack neste marco: `__dirname` deixaria de ser `dist/services` e o boot quebraria com `ENOENT` |
| `ValidationPipe` sem `transform` | Declarar DTO num `@Param` e esperar número | Manter `+idShopping` no controller; o código de verificação continua string, igual à coluna |
| Jest 29 e `baseUrl` | Spec novo com import `src/...` e `rootDir` `src`, ou spec colocado em `test/` rodando via `npm test` | Import relativo a partir de `src/tests/`; comando com o nome do arquivo. Se aparecer `Cannot find module 'src/entities/deliveryQueue.entity'`, a resolução é a do `baseUrl` do `tsconfig.json`, não uma reescrita dos imports de produção |

## Performance Traps

Escala está fora do marco. A tabela registra o que quebra com uma pessoa, para não ser adiado como "problema de 10 mil usuários".

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `save` do enqueue sem `await` | 201 vazio e confirmação sem linha | `await` / `return` do `save` | 1 usuário, segunda requisição imediata |
| Duas filas para o mesmo `shoppingId` | `Shopping já usado` ou confirmação ambígua | Semente limpa + `await`; unique no banco fica para depois | 2 POST paralelos; a demo sequencial não precisa do índice |
| `take` sem teto em `POST /shopping` | Página enorme | Não colocar a listagem no comando da demo | Fora do percurso |
| `synchronize: true` no boot da demo | Boot lento e `ALTER` surpresa | SQL explícito, synchronize falso | Primeiro `start:dev` depois do typo corrigido |

## Security Mistakes

Só o que faz a demo falhar ou o que um endurecimento no meio do caminho quebra o script. O resto do `CONCERNS.md` permanece de propósito.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Token de backoffice na rota `@Roles(Role.Delivery)` | 403; a pessoa conclui que a fila está quebrada | README e teste usam `loginDelivery` |
| Código de verificação lido de `GET /shopping/:id` | O detalhe já devolve `verificationCode` para qualquer `Admin`/`User`; a demo passa a depender desse vazamento | Código fictício escrito na semente e no README; não alterar `findOne` neste marco |
| Confirmar sem o entregador que enfileirou | Outro JWT `Role.Delivery` que saiba o código conclui o pedido; se o serviço passar a exigir o id e o controller não enviar `@Delivery()`, a demo inteira toma 400 | Controller passa `userDelivery.id`; o teste usa o mesmo id do enqueue |
| Hash bcrypt dentro de aspas duplas no PowerShell | A senha "correta" do README não entra; parece falha do guard | Arquivo SQL |
| Abrir fase de PAN, CVV, throttler, CORS ou revogação | A demo não sobe enquanto o escopo cresce; cartão é stub | Deixar como está. `MailingService` permanece sem envio |
| `npm test` "verde" com segredo `"undefined"` | O leitor acha o ambiente configurado | A fase de ambiente carrega o `.env` antes do módulo; não é preciso encurtar `expiresIn` |

## UX Pitfalls

Quem percorre a demo é uma pessoa no README e no Swagger, não um app de entregador.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 201 sem corpo no enqueue | O Swagger parece ter falhado; a pessoa confirma achando que a fila não gravou | O README diz que o POST de fila responde vazio e que a prova é o POST seguinte. Se o handler passar a devolver a entidade, o exemplo do README mostra `status` 1, não um DTO inventado |
| `Dados invalidos` para três causas | Código errado, pedido ausente e entregador ausente parecem o mesmo erro | O teste separa os casos. O README manda conferir id e código da semente, nesta ordem de param |
| 403 sem corpo útil | Token do operador, Bearer ausente e JWT inválido se parecem | README mostra o login do entregador e o header `Bearer`. Não documentar 401 para essa rota |
| Segunda passagem do script | `Shopping já usado` ou e-mail duplicado; a demo "só funciona uma vez" | O SQL da semente é reexecutável e o README manda rodá-lo de novo antes de repetir o percurso |
| Swagger em `/api` com cadeado e sem exemplo de body | A pessoa chama `POST /auth/login` porque é o primeiro auth da lista | O README nomeia `loginDelivery` e cola a ordem dos dois POST da fila |
| Lista `POST /shopping` no meio do roteiro | `storeCode` vai no body; sem o cliente, o mapper quebra e o roteiro para antes da confirmação | O roteiro obrigatório é login do entregador, enqueue, confirmar. Lista fica de fora |

## "Looks Done But Isn't" Checklist

- [ ] **Enqueue:** `create` devolve a Promise do `save` — verificar com Promise adiada no spec, não só com 201
- [ ] **Confirmação:** o `save` recebe a entidade carregada por `shoppingId`, com o mesmo `id` — verificar que `id` não é `undefined` e que o `COUNT` da fila permanece 1
- [ ] **Pedido:** `shoppings.status` é `4` (`Concluded`) na mesma transação em que a fila vai para `2` (`Finished`) — verificar rollback se o segundo write falha
- [ ] **Entregador:** `validateDelivery` no controller recebe o id de `@Delivery()` — verificar que um token de `POST /auth/login` não é o exemplo do README
- [ ] **Ambiente:** `DB_HOST` existe na avaliação de `AppModule` — verificar subida só com o arquivo de exemplo, sem exportar variável no shell
- [ ] **Schema:** `synchronize` permanece falso com o `.env` carregado — verificar que o boot não emite `ALTER`
- [ ] **Semente:** senha persistida é hash bcrypt; id e `verificationCode` são os do README — verificar `loginDelivery` e um segundo run do SQL
- [ ] **Teste:** o comando do README não coleta `app.controller.spec.ts` nem o e2e do Hello World — verificar que a saída cita só o spec da entrega e que há mais de 0 testes
- [ ] **Mapper:** `validateDelivery` não chama `toEntity` — verificar ausência de `ShoppingMapper` / `ProductMapper` no diff da confirmação
- [ ] **Params:** o exemplo é `/deliveryqueue/validateDelivery/{id}/{verificationCode}` — verificar que o código não está no lugar do id

## Recovery Strategies

Quando o percurso quebrar mesmo com o plano acima.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| INSERT órfão na confirmação | LOW | Apagar linhas de `deliveryqueue` daquele `shoppingId`; voltar `shoppings.status` para `1`; corrigir o `save` para a entidade carregada; rerodar a semente |
| Enqueue sem `await` | LOW | Acrescentar o `await` no serviço; repetir o POST só depois que `findByShopping` devolver uma linha |
| Fila `Finished` e pedido `Created` | LOW | Mesma transação nos dois writes; semente reexecutável restaura os dois status |
| API não conecta com `.env` presente | LOW | Primeiro import `dotenv/config` em `src/main.ts`; subir de novo e ler o host que o TypeORM usou |
| Schema alterado pelo synchronize | MEDIUM | Restaurar o banco a partir do SQL da demo; voltar `synchronize` para `false`; não usar o banco que já tinha dado manual |
| Login 500/401 com a senha do README | LOW | Regerar o hash com bcrypt 5 e regravar via arquivo SQL, fora de aspas duplas do PowerShell |
| 403 no Swagger | LOW | Novo token via `POST /auth/loginDelivery`; descartar o token de `/auth/login` |
| `npm test` vermelho por scaffold | LOW | Script da demo aponta para o spec novo; não depurar `Hello World` nem `AppController` |
| `Pedido invalido.` ou throw no mapper | LOW | Tirar lista e produto do roteiro; não "corrigir" com optional chaining |

## Pitfall-to-Phase Mapping

Fases sugeridas para o roadmap deste marco, na ordem em que a demo passa a existir. Nomes curtos para o roadmapper reutilizar.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| `.env` lido tarde demais (Pitfall 4) | Fase 1 — Ambiente que sobe | Clone com arquivo de exemplo, sem export no shell, `start:dev` conecta no MySQL e escuta a porta 3000 |
| `synchronize` / tabelas ausentes (Pitfall 5) | Fase 1 — Ambiente que sobe | Boot não emite DDL; o SQL versionado cria as tabelas `NOT NULL` |
| Semente, hash, ids, rerun (Pitfall 6) | Fase 2 — Semente do pedido | `loginDelivery` ok; segundo run do SQL ok; id e `verificationCode` batem com o que a fase 5 vai imprimir |
| `save` sem `id` (Pitfall 1) | Fase 3 — Fila e confirmação | Uma linha em `deliveryqueue`, mesmo `id`, `status` 2 |
| `create` sem `await` (Pitfall 2) | Fase 3 — Fila e confirmação | A Promise de `create` espera o `save` adiado no spec |
| Writes separados e 400 genérico (Pitfall 3) | Fase 3 — Fila e confirmação | Pedido em `Concluded` só quando a fila `Finished` commitou; código errado não grava |
| Relação lida como objeto (Pitfall 10) | Fase 3 — Fila e confirmação | Confirmação usa `findByShopping` e exige length 1 |
| Mapper no caminho (Pitfall 9) | Fase 3 — Fila e confirmação | Diff sem `toEntity`; lista fora do roteiro |
| Teste que não prova a linha, suíte vermelha (Pitfall 8) | Fase 4 — Prova do caminho | Um comando Jest executa só o spec novo e falha se o `id` do `save` sumir |
| Login e params errados (Pitfall 7) | Fase 5 — README do percurso | Passos usam `loginDelivery`, Bearer, id e depois código; dizem o que é 201 vazio e 403 |

**Ordem:** a fase 3 no código atual não é demonstrável sem a fase 1 (processo no ar) e a fase 2 (pedido e entregador que logam). A fase 4 mente se entrar antes da fase 3, porque o spec ficaria verde no `save` sem `id` se as asserções forem frouxas — por isso a fase 4 exige a asserção de identidade, escrita contra o comportamento já corrigido. A fase 5 por último, para não documentar param, senha ou corpo que as fases anteriores ainda vão mudar. Índice único, isolamento de loja, PAN e e-mail não ganham fase.

## Sources

- Código deste repositório (HIGH): `src/services/deliveryqueue.service.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/repositories/deliveryQueue.repository.ts`, `src/entities/deliveryQueue.entity.ts`, `src/entities/shopping.entity.ts`, `src/entities/userDelivery.entity.ts`, `src/services/shopping.service.ts`, `src/repositories/shopping.repository.ts`, `src/mappers/shopping.mapper.ts`, `src/mappers/product.mapper.ts`, `src/main.ts`, `src/app.module.ts`, `src/modules/auth.module.ts`, `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/decorators/delivery.decorator.ts`, `src/services/mailingService.ts`, `src/repositories/userDelivery.repository.ts`, `.eslintrc.js`, `package.json`, `tsconfig.json`. Mapa local: `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md`.
- TypeORM — `save` insere quando o id não está no banco (MEDIUM): https://typeorm.io/docs/entity/entities (seção Primary columns, consultada em 2026-10-04). API de `save` e colunas `undefined` omitidas (MEDIUM): https://typeorm.io/docs/working-with-entity-manager/repository-api. O seam marca WebFetch como LOW e websearch verificado como MEDIUM; as duas leituras concordam com o `new DeliveryQueueEntity()` sem `id` neste repositório.
- TypeORM — `synchronize` não é caminho de produção e pode perder dado (MEDIUM): https://typeorm.io/docs/data-source/data-source-options e https://typeorm.io/docs/migrations/why.
- NestJS — opções de `forRoot` são avaliadas na importação do módulo; variável de ambiente precisa já existir, ou a leitura vai para `forRootAsync` (MEDIUM, enunciado na página de Drizzle e no mesmo padrão de `TypeOrmModule.forRoot` deste `AppModule`): https://docs.nestjs.com/data/drizzle. `ConfigModule` e `forRootAsync` com `ConfigService` (MEDIUM): https://docs.nestjs.com/application/configuration.
- Jest — argumento posicional é regex de arquivo; no Windows usar `/` (LOW, WebFetch da CLI; o seam não sobe esse provider): https://jestjs.io/docs/cli. A suíte local é Jest 29.7.0 com `testRegex` em `package.json` (HIGH, arquivo do repo). O comando da demo passa o nome do spec para não coletar o scaffold.
- bcrypt 5.1.1 — `compare` exige hash string e delega ao binding (MEDIUM, https://github.com/kelektiv/node.bcrypt.js/blob/v5.1.1/bcrypt.js). Texto claro não autentica no `UserDeliveryRepository.login`. O status HTTP exato (500 se o binding lança, 401 se devolve false) fica em aberto: `node_modules/bcrypt` não está instalado neste workspace, então o binding não foi executado aqui. O `login` do entregador não captura a exceção.
- Discussão de `save` sem `await` inserir duas vezes (MEDIUM, reforça o Pitfall 2, não é a fonte do diagnóstico): https://stackoverflow.com/questions/51583085/repository-save-uses-insert-instead-of-update.

ctx7 não está no PATH deste ambiente. A leitura oficial foi por WebFetch das páginas acima. O plano de pesquisa pediu Context7; o conteúdo equivalente saiu da documentação publicada do TypeORM, do Nest e do Jest.

---
*Pitfalls research for: confirmação de entrega iFarma / Colibri*
*Researched: 2026-10-04*
