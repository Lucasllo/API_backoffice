<!-- refreshed: 2026-10-04 -->
# Preocupações da Base de Código

**Analysis Date:** 2026-10-04

## Dívida Técnica

**Recuperação de senha incompleta e código de 4 dígitos:**
- Problema: `recoverPassword` e `recoverPasswordDelivery` geram `Math.floor(1000 + Math.random() * 9000)` e gravam o código, mas o envio de e-mail está comentado (`//this.mailingService`). O fluxo nunca chama `MailingService.sendRecoverPassword`.
- Arquivos: `src/services/auth.service.ts`, `src/services/mailingService.ts`, `src/controllers/auth.controller.ts`
- Impacto: o usuário não recebe o código; o endpoint público `POST /auth/validaCodigo/:codigo` aceita um espaço de 9000 valores previsíveis. `Math.random` não é gerador criptográfico.
- Correção: gerar código com `crypto.randomInt` (ou token opaco), persistir hash com expiração e tentativa limitada, e chamar `MailingService` de fato. Remover o código da URL.

**`updatePassword` grava senha sem bcrypt:**
- Problema: criação de usuário usa `bcrypt.hash` em `UserService.create` e `UserDeliveryService.create`. A troca de senha monta `{ password: changePasswordAuthDto.password }` e o repositório faz `user.password = userDto.password` seguido de `save`.
- Arquivos: `src/services/user.service.ts`, `src/services/userDelivery.service.ts`, `src/repositories/user.repository.ts`, `src/repositories/userDelivery.repository.ts`
- Impacto: após `POST /user/mudaSenha` ou `POST /delivery/mudaSenhaDelivery`, a coluna `password` fica em texto claro. `bcrypt.compare` no login espera hash e lança erro em hash inválido, então o login seguinte falha com 500.
- Correção: hashear no serviço, no mesmo padrão de `create`, antes de chamar o repositório. Nunca atribuir o DTO direto na coluna.

**Controladores gerados pelo CLI e métodos stub:**
- Problema: `CardService`, `AddressService`, `CategoryService`, `UserClientService.findAll/findOne/remove`, `ProductService.findAll/remove`, `ShoppingService.remove` e `UserDeliveryService.remove` devolvem a string padrão do schematic (`This action returns...`). Rotas correspondentes estão comentadas.
- Arquivos: `src/services/card.service.ts`, `src/services/address.service.ts`, `src/services/category.service.ts`, `src/services/userClient.service.ts`, `src/services/product.service.ts`, `src/services/shopping.service.ts`, `src/services/userDelivery.service.ts`, `src/controllers/card.controller.ts`, `src/controllers/address.controller.ts`, `src/controllers/category.controller.ts`
- Impacto: módulos entram em `AppModule` sem comportamento. Quem descomentar a rota publica um stub autenticado só pelo `AuthGuard`.
- Correção: implementar o caso de uso ou remover módulo, entidade e teste do grafo até existir contrato real.

**`@Roles` sem `RoleGuard` em produto:**
- Problema: `ProductController` declara `@Roles(Role.Admin, Role.User)` e não declara `@UseGuards(RoleGuard)`. O guard global é só `AuthGuard`. `RoleGuard` ignora a rota quando não está no controller. Sem metadata de papéis, `RoleGuard` também faz `if (!roles) return true`.
- Arquivos: `src/controllers/product.controller.ts`, `src/guard/role.guard.ts`, `src/app.module.ts`
- Impacto: qualquer JWT aceito pelo `AuthGuard` (incluindo `Role.Delivery` e token de recuperação) chama `GET /product/findByShopping/:id`.
- Correção: registrar `RoleGuard` no controller ou como `APP_GUARD` depois do `AuthGuard`. Tratar ausência de `@Roles` como negação, não como liberação.

**Schema sem migração e `synchronize` com typo:**
- Problema: `synchronize: process.env.ENV === 'developmen'` nunca liga no valor esperado `development`. Não há pasta `migrations/` nem script TypeORM migration no `package.json`.
- Arquivos: `src/app.module.ts`
- Impacto: a entidade diverge do MySQL em silêncio. Colunas obrigatórias de `UserEntity` e `UserDeliveryEntity` (`validatedEmail`, `userAuthorized`, `phoneNumber`) não são preenchidas no `create`, então o INSERT só funciona se o banco real for mais permissivo que a entidade.
- Correção: corrigir o literal para `development` apenas em ambiente local, e adotar migrations versionadas. Alinhar nullability e defaults entre entidade e `create`.

**`dotenv.config()` depois dos imports:**
- Problema: `src/main.ts` importa `AppModule` antes de `dotenv.config()`. `TypeOrmModule.forRoot` e `JwtModule.register` leem `process.env` na avaliação do módulo. `ConfigModule.forRoot()` está importado e nenhum serviço usa `ConfigService`.
- Arquivos: `src/main.ts`, `src/app.module.ts`, `src/modules/auth.module.ts`
- Impacto: processo que depende só do arquivo `.env` sobe com `DB_HOST` indefinido e `JWT_SECRET` convertido por `String(undefined)` para a string `"undefined"`. Arquivo `.env` presente na raiz — contém a configuração de ambiente; valores não documentados aqui.
- Correção: carregar env antes de avaliar os módulos (`node -r dotenv/config`, ou `ConfigModule` + `ConfigService` em `forRootAsync` / `JwtModule.registerAsync`).

**Dois `JwtModule.register` e `AuthService` duplicado:**
- Problema: `AuthModule` chama `JwtModule.register` nos `imports` e de novo nos `exports` (segunda instância). `AppModule` lista `AuthService` outra vez em `providers`, além do provider de `AuthModule` (que não exporta a classe).
- Arquivos: `src/modules/auth.module.ts`, `src/app.module.ts`
- Impacto: o `AuthGuard` global resolve um `AuthService` diferente do controller. Os dois `JwtModule` capturam o segredo no load. Comentário de `expiresIn: '12h'` não vale para o token emitido: `createToken` passa `expiresIn: '7 days'`.
- Correção: um único `JwtModule.registerAsync`, exportar `AuthService` e `JwtModule`, e tirar `AuthService` dos providers de `AppModule`. Um único `expiresIn` por tipo de token.

**Erros internos reempacotados como HTTP 400:**
- Problema: vários `catch` fazem `throw new BadRequestException(error.message)` ou `throw new BadRequestException(error)`.
- Arquivos: `src/services/user.service.ts`, `src/services/userDelivery.service.ts`, `src/services/auth.service.ts`, `src/repositories/user.repository.ts`
- Impacto: mensagem de SQL, stack do JWT ou detalhe do MySQL volta no corpo da resposta. Falha de infra vira 400.
- Correção: logar o erro interno e responder mensagem fixa. `checkInToken` deve lançar `UnauthorizedException` sem o objeto cru.

**Dinheiro e status como string ou número solto:**
- Problema: `ShoppingEntity.value`, `ProductEntity.price` e `deliveryTime` são `string`. `updateStatus` grava `codeStatus` vindo da URL sem whitelist de transição.
- Arquivos: `src/entities/shopping.entity.ts`, `src/entities/product.entity.ts`, `src/services/shopping.service.ts`, `src/controllers/shopping.controller.ts`
- Impacto: soma e ordenação no banco ficam lexicográficas. Qualquer número na URL vira `status`.
- Correção: tipo decimal para valor, enum validado com `class-validator` e máquina de estados explícita.

**`orderBy` do cliente vai direto ao TypeORM:**
- Problema: `UserQueryPaginateDto.orderBy` e `ShoppingQueryPaginateDto.orderBy` são `@IsObject()` opcional e entram em `findAndCount({ order })`. `take` não tem teto.
- Arquivos: `src/dtos/user/userQueryPaginate.dto.ts`, `src/dtos/shopping/shoppingQueryPaginate.dto.ts`, `src/repositories/user.repository.ts`, `src/repositories/shopping.repository.ts`
- Impacto: o cliente escolhe coluna (incluindo `password` / `validCode`) e page size arbitrário.
- Correção: whitelist de colunas e direção (`ASC`/`DESC`), e `take` máximo (por exemplo 100).

## Bugs Conhecidos

**Recuperação de senha do entregador grava o código na tabela errada:**
- Sintomas: `POST /auth/recuperaSenhaDelivery` não habilita `POST /auth/validaCodigoDelivery/:codigo`. `mudaSenhaDelivery` responde `Usuario não encontrado`.
- Arquivos: `src/services/auth.service.ts` (`recoverPasswordDelivery` chama `this.userservice.setValidCode`), `src/services/userDelivery.service.ts` (`setValidCode` existe e não é usado), `src/controllers/userDelivery.controller.ts`
- Gatilho: e-mail de um `UserDeliveryEntity`. O `id` desse registro é passado para `userbackoffice`. Se não houver usuário de backoffice com o mesmo `id`, `UserRepository.setValidCode` acessa `user.id` de `null`.
- Contorno: nenhum no código. O código de recuperação do entregador deveria ir para `UserDeliveryRepository.setValidCode`.

**Token de recuperação sempre autentica como usuário de backoffice:**
- Sintomas: `createTokenRecoverPassword` coloca `user` no `subject`, nunca `userDelivery`. `AuthGuard` no ramo `codeRecover` carrega `request.user` via `UserService.findOne`. `mudaSenhaDelivery` exige `@Delivery()`, que lê `request.userDelivery`.
- Arquivos: `src/services/auth.service.ts`, `src/guard/auth.guard.ts`, `src/decorators/delivery.decorator.ts`, `src/controllers/userDelivery.controller.ts`
- Gatilho: JWT emitido por `validaCodigoDelivery` (ou `validaCodigo`) usado em `POST /delivery/mudaSenhaDelivery`.
- Contorno: nenhum. O subject do entregador precisa da chave `userDelivery`, e o guard precisa popular `request.userDelivery` nesse fluxo.

**`findByValidCode` quebra quando o código não existe:**
- Sintomas: 500 ou `BadRequestException` genérico (`Usuario não encontrado` / `Usuario invalido`) em vez de 400 controlado.
- Arquivos: `src/repositories/user.repository.ts`, `src/repositories/userDelivery.repository.ts`
- Gatilho: `POST /auth/validaCodigo/:codigo` com código ausente. O código faz `user.id` depois de `findOne` sem checar `null`, e em seguida zera `validCode`.
- Contorno: nenhum. Retornar 400 antes do `update` se `user` for nulo. Não consumir o código quando a verificação falhar.

**`validateDelivery` insere fila nova em vez de concluir a existente:**
- Sintomas: a confirmação não atualiza a linha de `deliveryqueue` do pedido. `save` recebe um `DeliveryQueueEntity` sem `id`, sem `shoppingId` e sem `userDeliveryId`.
- Arquivos: `src/services/deliveryqueue.service.ts`, `src/repositories/deliveryQueue.repository.ts`, `src/entities/deliveryQueue.entity.ts`
- Gatilho: `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` com `verificationCode` igual ao do pedido. Colunas `shoppingId` e `userDeliveryId` são obrigatórias; o INSERT falha ou cria órfão. O status do pedido só muda se o `save` passar.
- Contorno: nenhum. Carregar a fila por `shoppingId`, conferir o entregador autenticado e atualizar essa linha.

**`DeliveryqueueService.create` não espera o `save`:**
- Sintomas: a API responde vazio enquanto o `INSERT` ainda está pendente. Dois POST paralelos em `POST /deliveryqueue/:idShopping` podem ambos ver `findByShopping` vazio.
- Arquivos: `src/services/deliveryqueue.service.ts`, `src/entities/deliveryQueue.entity.ts`
- Gatilho: duas requisições de entregadores diferentes para o mesmo pedido, antes do primeiro `save` concluir. Não há `unique` em `shoppingId`.
- Contorno: nenhum. `await` no `save` e índice único em `shoppingId`.

**`GET /user/me` devolve a entidade com hash e `validCode`:**
- Sintomas: a resposta inclui `password`, `validCode`, `userAuthorized` e os demais campos de `UserEntity`.
- Arquivos: `src/controllers/user.controller.ts` (`findbyId`), `src/services/user.service.ts`, `src/repositories/user.repository.ts`
- Gatilho: `GET /user/me` com papel `Admin` ou `User`.
- Contorno: nenhum. Responder `UserPermissionDto` (ou DTO sem segredo). `UserMapper.toDTO` também copia `password`; `POST /user/create` devolve o hash.

**`UserService.delete` não espera o `save` e não trata usuário ausente:**
- Sintomas: `DELETE /user/:id` resolve antes da baixa lógica. `id` inexistente acessa `user.active` de `null`.
- Arquivos: `src/services/user.service.ts`, `src/repositories/user.repository.ts`
- Gatilho: `DELETE /user/:id` com id desconhecido, ou leitura imediata após o delete.
- Contorno: nenhum. `await` e 404 quando `findById` for nulo.

**`updateStatus` não distingue pedido inexistente de status inválido:**
- Sintomas: qualquer falha vira `Compra/Status invalido.`
- Arquivos: `src/repositories/shopping.repository.ts`, `src/services/shopping.service.ts`
- Gatilho: `PATCH /shopping/updateStatus/:codeShopping/:codeStatus` com id inexistente (`shopping` nulo, acesso a `shopping.status`).
- Contorno: nenhum. 404 se o pedido não existir; 400 só para transição ilegal.

**Cadastro de backoffice não preenche colunas obrigatórias:**
- Sintomas: `POST /user/create` pode falhar no INSERT se o schema seguir a entidade.
- Arquivos: `src/services/user.service.ts`, `src/entities/user.entity.ts`, `src/dtos/user/createUser.dto.ts`
- Gatilho: `create` seta `storeCode`, `password`, `role`, `name`, `email`, `createdAt`. Não seta `validatedEmail`, `userAuthorized` nem `phoneNumber`, todos `@Column()` sem default. O DTO não tem telefone.
- Contorno: nenhum no código. O banco real pode divergir porque `synchronize` está desligado.

**Cadastro de entregador não preenche `validatedEmail`:**
- Sintomas: mesmo risco de INSERT no `POST /delivery/create`.
- Arquivos: `src/services/userDelivery.service.ts`, `src/entities/userDelivery.entity.ts`
- Gatilho: `validatedEmail` é `@Column()` booleano sem default e o `create` não atribui o campo. `active` tem default `false`, mas `login` do entregador não consulta `active` nem `validatedEmail`.
- Contorno: nenhum. Conta nova de entregador autentica em `POST /auth/loginDelivery` mesmo com `active === false`.

**Testes do scaffold apontam para arquivos que não existem:**
- Sintomas: `src/tests/controllers/app.controller.spec.ts` importa `src/controllers/app.controller` e `src/services/app.service`, que não estão no repositório. `test/app.e2e-spec.ts` espera `GET /` com corpo `Hello World!`. `main.ts` não registra essa rota.
- Arquivos: `src/tests/controllers/app.controller.spec.ts`, `test/app.e2e-spec.ts`, `src/main.ts`
- Gatilho: `npm test` ou `npm run test:e2e`.
- Contorno: nenhum. Remover os specs ou apontá-los para uma rota real de saúde.

**`ShoppingMapper.toEntity` e `ProductMapper.toEntity` escrevem em relação nula:**
- Sintomas: `entity.userClientEntity.name = ...` e `entity.shoppingEntity.deliveryTime = ...` lançam se alguém chamar `toEntity`.
- Arquivos: `src/mappers/shopping.mapper.ts`, `src/mappers/product.mapper.ts`
- Gatilho: uso futuro desses métodos. Hoje os fluxos de leitura usam `toDTO` / `toListDTO`.
- Contorno: não chamar `toEntity`. Instanciar a relação antes de atribuir, ou montar a entidade no serviço.

## Considerações de Segurança

**PAN e CVV em claro na tabela `cards`:**
- Risco: `CardEntity` persiste `cardNumber`, `cvv`, `expirationDate` e `cpf_cnpj` em colunas texto. `ManyToOne` do cartão está `eager: true` e `cascade: true`, então um load/save de cartão arrasta e pode regravar `UserClientEntity`.
- Arquivos: `src/entities/card.entity.ts`
- Mitigação atual: `CardController` / `CardService` são stubs; esta API não lê a tabela nos endpoints ativos. O modelo continua sendo o contrato TypeORM do schema compartilhado.
- Recomendações: não armazenar CVV (proibido por PCI). Tokenizar PAN em provedor de pagamento. Tirar `eager` e `cascade` do cartão. Não reativar `GET /card` em cima dessa entidade.

**Isolamento por loja é só um filtro enviado pelo cliente:**
- Risco: `POST /user/findAll` e `POST /shopping` usam `storeCode` do body, não `request.user.storeCode`. `GET /shopping/:id`, `PATCH /shopping/updateStatus/:codeShopping/:codeStatus`, `GET /product/findByShopping/:id` e `GET /userClient/getPhone/:idUserClient` buscam por id global. `authorizeUser`, `changeRoleUser` e `DELETE /user/:id` também não conferem a loja do admin.
- Arquivos: `src/controllers/user.controller.ts`, `src/controllers/shopping.controller.ts`, `src/controllers/product.controller.ts`, `src/controllers/userClient.controller.ts`, `src/repositories/shopping.repository.ts`, `src/repositories/user.repository.ts`, `src/services/deliveryqueue.service.ts`
- Mitigação atual: `RoleGuard` exige papel nas rotas que o declaram. Não há vínculo do papel com a loja do token.
- Recomendações: derivar `storeCode` do usuário autenticado. Em toda leitura e escrita, filtrar `id` + `storeCode`. Entregador só altera pedido presente na própria fila. `getPhone` só para pedido atribuído a ele.

**`GET /shopping/:id` devolve `verificationCode` e endereços:**
- Risco: `ShoppingService.findOne` retorna a entidade crua (`verificationCode`, `deliveryAddress`, `storeAddress`, `userClientId`). Qualquer `Admin` ou `User` autenticado lê qualquer pedido. Com o código, `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` marca o pedido como `Concluded`.
- Arquivos: `src/repositories/shopping.repository.ts`, `src/services/shopping.service.ts`, `src/controllers/shopping.controller.ts`, `src/entities/shopping.entity.ts`, `src/services/deliveryqueue.service.ts`
- Mitigação atual: a listagem passa por `ShoppingMapper`, que não copia o código. O `findOne` não usa o mapper.
- Recomendações: DTO de detalhe sem `verificationCode`. Comparar o código só no servidor, amarrado ao entregador da fila, com limite de tentativas.

**JWT de longa duração, segredo frágil e recuperação reutilizável:**
- Risco: access token dura 7 dias (`createToken` / `createTokenDelivery`). Não há revogação. O segredo é `String(process.env.JWT_SECRET)` avaliado cedo. Token de recuperação dura 1 dia e o `AuthGuard` confia no `subject`; não revalida `validCode` no banco. `POST /user/create` e `POST /delivery/create` são `@Public()`.
- Arquivos: `src/services/auth.service.ts`, `src/modules/auth.module.ts`, `src/guard/auth.guard.ts`, `src/controllers/user.controller.ts`, `src/controllers/userDelivery.controller.ts`
- Mitigação atual: login de backoffice exige `authorized: true` e `active: true`. Login de entregador só compara e-mail e senha. `changeRoleUser` recusa papel fora de `Admin` e `User` (`Role.Master` existe em `src/enums/role.enum.ts` e não entra nessa trilha).
- Recomendações: expiração curta, rotação de segredo via `registerAsync`, denylist ou versão de token no usuário. Invalidar o JWT de recuperação no `updatePassword`. Cadastro público de entregador precisa de aprovação antes do login.

**Código de recuperação e login sem limite de taxa:**
- Risco: `POST /auth/validaCodigo/:codigo` e `POST /auth/validaCodigoDelivery/:codigo` são públicos. O código tem 4 dígitos e vai no path (fica em log de proxy). Não há `@nestjs/throttler`, conta de falhas nem bloqueio.
- Arquivos: `src/controllers/auth.controller.ts`, `src/services/auth.service.ts`, `src/main.ts`
- Mitigação atual: `findByValidCode` apaga o código depois de achar a linha. Isso não impede varredura, e o apagamento ocorre mesmo no caminho que quebra com `user` nulo só depois do `findOne` bem-sucedido de outro usuário se houver colisão (o `setValidCode` não garante unicidade).
- Recomendações: rate limit em `auth/*`, código longo de uso único, resposta idêntica para e-mail inexistente e existente (`recuperaSenha` hoje responde `Usuario invalido` e permite enumerar).

**CORS aberto, Swagger público e sem headers de endurecimento:**
- Risco: `app.enableCors()` sem origem. Swagger UI em `GET /api` sem autenticação, com o mapa de rotas e dos DTOs. Não há `helmet`.
- Arquivos: `src/main.ts`
- Mitigação atual: autenticação das rotas de negócio depende do header `Bearer`. CORS `*` não envia credenciais de cookie; o token vai no header.
- Recomendações: lista de origens. Swagger só em desenvolvimento, ou atrás do mesmo guard. `helmet` e desligar stack em produção.

**`ValidationPipe` sem `whitelist` nem `transform`:**
- Risco: propriedades extras do JSON seguem para o serviço. Sem `transform`, `@IsNumber()` e `@IsBoolean()` não coercem string de query/path. `CreateUserDeliveryDto.email` é `@IsString()`, não `@IsEmail()`. CPF, telefone e placa não têm formato.
- Arquivos: `src/main.ts`, `src/dtos/userDelivery/createUserDelivery.dto.ts`, `src/dtos/user/userQueryPaginate.dto.ts`
- Mitigação atual: `class-validator` nos DTOs usados como `@Body()`.
- Recomendações: `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`. Validar CPF, e-mail e enums nos params.

**Hash de senha e código de recuperação na resposta:**
- Risco: `UserMapper.toDTO` copia `entity.password`. `GET /user/me` devolve a entidade inteira, inclusive `validCode`.
- Arquivos: `src/mappers/user.mapper.ts`, `src/controllers/user.controller.ts`, `src/entities/user.entity.ts`
- Mitigação atual: `findAll` usa `UserPermissionMapper`, que omite senha. O detalhe do próprio usuário não usa esse mapper.
- Recomendações: `@Column({ select: false })` em `password` e `validCode`. DTO de saída explícito.

**CPF, telefone e endereço de cliente expostos a qualquer entregador:**
- Risco: `GET /userClient/getPhone/:idUserClient` devolve `numero` para todo `Role.Delivery`, sem vínculo com a fila. `UserClientEntity.cpf` e `AddressEntity` estão no mesmo banco. `ProductMapper.toDTO` inclui `deliveryAddress`.
- Arquivos: `src/controllers/userClient.controller.ts`, `src/repositories/userClient.repository.ts`, `src/entities/userClient.entity.ts`, `src/entities/address.entity.ts`, `src/mappers/product.mapper.ts`
- Mitigação atual: a rota de telefone exige `Role.Delivery`. Não exige que o pedido seja desse entregador. `GET /product/findByShopping/:id` nem exige o `RoleGuard`.
- Recomendações: autorizar pelo `deliveryqueue` do token. Minimizar o DTO (sem endereço na listagem de produto para quem não está na entrega).

## Gargalos de Performance

**Paginação sem teto em usuários e pedidos:**
- Problema: `take` do body segue para `findAndCount`. Um valor alto carrega a página inteira, e em pedidos ainda a relação `userClientEntity`.
- Arquivos: `src/repositories/user.repository.ts`, `src/repositories/shopping.repository.ts`, `src/dtos/user/userQueryPaginate.dto.ts`, `src/dtos/shopping/shoppingQueryPaginate.dto.ts`
- Causa: não há `Math.min(take, MAX)` nem índice documentado para `(storeCode, id)`.
- Caminho de melhoria: teto de página, `select` só das colunas do DTO, índice composto por `storeCode`.

**Lista de produtos carrega o pedido inteiro por item:**
- Problema: `ProductRepository.findByShopping` pede `relations: ['shoppingEntity']` e o mapper lê endereço, valor e pagamento em cada item.
- Arquivos: `src/repositories/product.repository.ts`, `src/mappers/product.mapper.ts`, `src/services/product.service.ts`
- Causa: o pedido é repetido em toda linha. Com `shoppingEntity` nulo, `toDTO` lança e o serviço responde `Pedido invalido.`
- Caminho de melhoria: uma query do pedido e outra dos itens, ou `leftJoin` com colunas escolhidas.

**Cartão eager:**
- Problema: `CardEntity.userEntity` está `eager: true`. Qualquer `find` futuro de `cards` junta o cliente.
- Arquivos: `src/entities/card.entity.ts`
- Causa: eager no lado do dado sensível.
- Caminho de melhoria: eager desligado; carregar relação só no caso de uso que precisar.

**Fila de entrega sem índice único e com relação sempre carregada:**
- Problema: `findByUserDelivery` e `findByShopping` trazem `shoppingEntity` completo. `create` faz find + insert sem trava.
- Arquivos: `src/repositories/deliveryQueue.repository.ts`, `src/services/deliveryqueue.service.ts`
- Causa: checagem de duplicidade na aplicação, não no banco.
- Caminho de melhoria: unique em `shoppingId`, `select` enxuto, transação no aceite do pedido.

**Bcrypt com `genSalt()` em todo cadastro, sem fila:**
- Problema: custo aceitável por request, bloqueante no event loop do processo único (`src/main.ts` escuta a porta 3000).
- Arquivos: `src/services/user.service.ts`, `src/services/userDelivery.service.ts`, `src/main.ts`
- Causa: um processo Node, sem worker.
- Caminho de melhoria: manter o hash no request (correto) e escalar com mais de um processo só depois de rate limit. Não é o gargalo principal.

## Áreas Frágeis

**`AuthGuard` + `RoleGuard` + subject JSON:**
- Arquivos: `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/services/auth.service.ts`, `src/decorators/user.decorator.ts`, `src/decorators/delivery.decorator.ts`, `src/decorators/passwordCode.decorator.ts`
- Por que é frágil: o `subject` é `JSON.parse` de uma string com chaves `user`, `userDelivery` ou `codeRecover`. O `catch` do guard devolve `false` (403) para token ausente, JWT inválido e falha de banco, sem distinguir. `RoleGuard` lê `user.role` no ramo final; usuário nulo vira exceção. Papel ausente libera a rota.
- Modificação segura: teste de guard cobrindo token ausente, expirado, de recuperação, de entregador e de backoffice antes de mudar chaves do subject. Não adicionar rota sem `@UseGuards(RoleGuard)` e `@Roles`.
- Cobertura de teste: `src/tests/controllers/auth.controller.spec.ts` só verifica se o controller existe. Não há spec de guard.

**Troca de senha e login:**
- Arquivos: `src/services/user.service.ts`, `src/services/userDelivery.service.ts`, `src/repositories/user.repository.ts`, `src/repositories/userDelivery.repository.ts`
- Por que é frágil: dois caminhos gravam senha (hash no create, texto no update). Login assume hash bcrypt.
- Modificação segura: um único método `hashPassword` usado pelos dois fluxos, com teste de login após `mudaSenha`.
- Cobertura de teste: `src/tests/services/user.service.spec.ts` e `src/tests/services/auth.service.spec.ts` são smoke `should be defined`.

**Confirmação de entrega:**
- Arquivos: `src/services/deliveryqueue.service.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/entities/deliveryQueue.entity.ts`, `src/entities/shopping.entity.ts`
- Por que é frágil: `create` não dá `await`; `validateDelivery` instancia entidade nova; status do pedido muda no mesmo método; não há dono da fila. `@OneToMany` em `UserDeliveryEntity.deliveryQueueEntity` está tipado como objeto único, não array.
- Modificação segura: transação que trava a fila por `shoppingId` e o pedido. Teste de concorrência com dois entregadores.
- Cobertura de teste: `src/tests/services/deliveryqueue.service.spec.ts` não exercita `create` nem `validateDelivery`.

**Mapeamento TypeORM de papéis e relações:**
- Arquivos: `src/entities/user.entity.ts`, `src/entities/userDelivery.entity.ts`, `src/entities/userClient.entity.ts`, `src/enums/role.enum.ts`
- Por que é frágil: `@Column({ enum: [Role] })` não é `type: 'enum', enum: Role`. `Role` é string (`'1'`…`'5'`). `UserClientEntity.role` é `number` com default `Role.User`. O mesmo domínio tem três formatos.
- Modificação segura: não mudar o número persistido sem migração conferida no MySQL. `Role.Master` não deve ser aceito em `changeRoleUser` por acidente.
- Cobertura de teste: nenhuma asserção de enum.

**Boot com templates de e-mail e env:**
- Arquivos: `src/services/mailingService.ts`, `templates/recoverPassword.hbs`, `templates/confirmation.hbs`, `src/modules/user.module.ts`
- Por que é frágil: o construtor chama `fs.readFileSync` em `join(__dirname, '../../templates')`. `MailingService` é provider de `UserModule`, então a API não sobe se o template sumir no `dist`. O serviço está injetado e os métodos de envio não são chamados. `sendUserConfirmation` / `sendRecoverPassword` esperam `user.firstName`; as entidades usam `name`.
- Modificação segura: carregar template sob demanda e falhar só na rota de e-mail. Conferir o path no build (`nest build` copia ou não `templates/`).
- Cobertura de teste: não há spec de `MailingService`.

## Limites de Escala

**Processo único na porta 3000:**
- Capacidade atual: um listener em `src/main.ts` (`app.listen(3000)`). Sem cluster, fila ou cache.
- Limite: CPU do bcrypt e pool MySQL do `mysql2` no mesmo processo. Não há `extra.connectionLimit` em `TypeOrmModule.forRoot`.
- Caminho de escala: mais de uma instância atrás de balanceador só com JWT stateless (já é o caso) e rate limit compartilhado. Pool explícito no TypeORM.

**Listagens administrativas:**
- Capacidade atual: página definida pelo cliente, relação `userClientEntity` em todo pedido.
- Limite: `take` grande ou `skip` profundo (`OFFSET`) degrada no MySQL quando a loja acumular pedidos.
- Caminho de escala: keyset pagination por `id`, teto de `take`, colunas projetadas.

**Códigos de recuperação e de verificação:**
- Capacidade atual: `validCode` inteiro na linha do usuário; `verificationCode` string no pedido, sem tabela de tentativas.
- Limite: colisão dos 4 dígitos entre usuários; varredura paralela no endpoint público; confirmação de entrega chuta o código se ele for curto.
- Caminho de escala: token opaco com índice único e TTL, contador de tentativas, bloqueio por conta.

**Schema gerido à mão:**
- Capacidade atual: entidades em `src/app.module.ts` (`synchronize` efetivamente falso). Sem migrations.
- Limite: cada ambiente diverge. Deploy novo não cria tabela sozinho.
- Caminho de escala: migrations no pipeline antes do `node dist/main`.

## Dependências em Risco

**`fs` (`0.0.1-security`) e `api_ifarma` (`file:`):**
- Risco: `package.json` depende do pacote npm `fs`, que é placeholder vazio de segurança, e de `"api_ifarma": "file:"` (auto-referência). O código usa o módulo nativo em `import * as fs from 'fs'` dentro de `src/services/mailingService.ts`.
- Impacto: install frágil e superfície de supply chain inútil. Não substitui o `fs` do Node.
- Plano de migração: remover as duas entradas. Manter o import nativo.

**`@nestjs/mapped-types` com versão `*`:**
- Risco: o range não tem teto. Um install novo pode trazer major incompatível com Nest 10.
- Impacto: build ou types quebram sem mudança de código. O pacote não aparece nos imports de `src/`.
- Plano de migração: fixar a versão alinhada a `@nestjs/common` `^10.0.0`, ou remover se continuar sem uso.

**NestJS 10, TypeORM 0.3.20, Nodemailer 6, ESLint 8:**
- Risco: `package.json` usa `^` em `@nestjs/*` 10, `typeorm` `^0.3.20`, `nodemailer` `^6.9.13`, `eslint` `^8.42.0`, `reflect-metadata` `^0.1.13`. Lockfile presente: `package-lock.json`.
- Impacto: sem `npm audit` no CI, CVE fica invisível. Nodemailer 6 é a linha usada por `MailingService`; a API de transporte muda na linha 7.
- Plano de migração: subir com lockfile e suíte real (hoje a suíte não segura regressão). Tratar Nodemailer à parte do Nest.

**`handlebars` no e-mail:**
- Risco: `handlebars` `^4.7.8` compila HTML de `templates/*.hbs`. Os templates atuais não interpolam input cru de request além de `name` e `url`, e o envio está desligado.
- Impacto: ao religar o e-mail, nome de usuário entra no HTML.
- Plano de migração: escapar dados no template e manter a versão patchada. Não passar HTML do cliente para `compile`.

## Funcionalidades Críticas Ausentes

**E-mail de recuperação e de confirmação:**
- Problema: `MailingService.sendRecoverPassword` e `sendUserConfirmation` existem; `AuthService` não os chama. `validatedEmail` não é atualizado em lugar nenhum.
- Bloqueia: recuperação de senha utilizável e prova de posse do e-mail antes de autorizar o usuário.

**Migrações e pipeline:**
- Problema: sem `migrations/`, sem Dockerfile, sem workflow em `.github/` na raiz do projeto.
- Bloqueia: deploy reproduzível e evolução segura do MySQL.

**Papel `Master` e autorização de loja:**
- Problema: `Role.Master` está em `src/enums/role.enum.ts` e nenhum guard ou `changeRoleUser` o trata como escopo global. Também não existe escopo de loja no token.
- Bloqueia: administração multi-loja sem vazar dado entre `storeCode`.

**Módulos de cartão, endereço e categoria:**
- Problema: controllers e services são stub. A entidade de cartão já modela PAN/CVV.
- Bloqueia: backoffice desses recursos. Não reativar em cima do schema atual de `cards`.

**Observabilidade:**
- Problema: não há `Logger`, filtro de exceção, health check, tracing nem métrica. `AuthGuard` engole o erro.
- Bloqueia: diagnosticar 403 de token versus falha de banco, e saber se o processo está apto a receber tráfego.

**Revogação de sessão:**
- Problema: não há logout, rotação de senha que invalide JWT, nem lista de tokens.
- Bloqueia: encerrar acesso de um funcionário desligado antes de 7 dias.

## Lacunas de Cobertura de Testes

**Guards, JWT e recuperação de senha:**
- O que não é testado: `AuthGuard`, `RoleGuard`, `createToken`, `recoverPasswordDelivery` no serviço errado, expiração e `JSON.parse` do subject.
- Arquivos: `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`, `src/services/auth.service.ts`, `src/tests/services/auth.service.spec.ts`, `src/tests/controllers/auth.controller.spec.ts`
- Risco: regressão de autorização entra em produção sem falha de CI. Prioridade alta porque o bug do entregador já está no fonte.
- Prioridade: Alta

**Senha em texto na troca e vazamento no `GET /user/me`:**
- O que não é testado: hash após `updatePassword`; forma do JSON de `findbyId` e de `UserMapper.toDTO`.
- Arquivos: `src/services/user.service.ts`, `src/repositories/user.repository.ts`, `src/mappers/user.mapper.ts`, `src/tests/services/user.service.spec.ts`
- Risco: login quebrado depois da troca de senha e hash exposto passam despercebidos.
- Prioridade: Alta

**Fila de entrega e status do pedido:**
- O que não é testado: `create` sem `await`, corrida de dois entregadores, `validateDelivery` com entidade nova, IDOR de `updateStatus`.
- Arquivos: `src/services/deliveryqueue.service.ts`, `src/services/shopping.service.ts`, `src/tests/services/deliveryqueue.service.spec.ts`, `src/tests/services/shopping.service.spec.ts`
- Risco: pedido concluído sem fila consistente, ou concluído por quem não é o entregador.
- Prioridade: Alta

**Isolamento por `storeCode` e telefone do cliente:**
- O que não é testado: `findAll` com `storeCode` de outra loja; `findOne` por id; `getPhone` de cliente arbitrário; `ProductController` sem `RoleGuard`.
- Arquivos: `src/repositories/shopping.repository.ts`, `src/repositories/user.repository.ts`, `src/controllers/product.controller.ts`, `src/services/userClient.service.ts`, `src/tests/controllers/product.controller.spec.ts`, `src/tests/services/user-client.service.spec.ts`
- Risco: vazamento entre farmácias.
- Prioridade: Alta

**Suíte gerada pelo Nest, sem asserção de comportamento:**
- O que não é testado: cada spec em `src/tests/**/*.spec.ts` (exceto `app.controller.spec.ts`) contém um único `it('should be defined')`. Não há mock de repositório, nem supertest das rotas reais. `collectCoverageFrom` em `package.json` é `**/*.(t|j)s` e não há `coverageThreshold`.
- Arquivos: `src/tests/`, `package.json`, `test/app.e2e-spec.ts`, `test/jest-e2e.json`
- Risco: `npm test` não protege os fluxos acima. O spec de `AppController` e o e2e referenciam arquivos e rota inexistentes, então a suíte tende a falhar por motivo alheio ao domínio.
- Prioridade: Alta

**Stubs de cartão, endereço e categoria:**
- O que não é testado: persistência e autorização desses módulos, porque o serviço ainda retorna string fixa.
- Arquivos: `src/services/card.service.ts`, `src/services/address.service.ts`, `src/services/category.service.ts`, `src/tests/services/card.service.spec.ts`, `src/tests/services/address.service.spec.ts`, `src/tests/services/category.service.spec.ts`
- Risco: baixo enquanto as rotas permanecerem comentadas. Alto se alguém descomentar o controller sem teste de acesso a PAN/CVV e endereço.
- Prioridade: Média

**E2E contra MySQL:**
- O que não é testado: integração com o schema real, unique de e-mail, nullability de `validatedEmail` e concorrência da fila.
- Arquivos: `test/app.e2e-spec.ts`, `src/app.module.ts`
- Risco: bugs de INSERT e de `synchronize` só aparecem no ambiente.
- Prioridade: Média

---

*Concerns audit: 2026-10-04*
