<!-- refreshed: 2026-10-04 -->
# Convenções de Código

**Analysis Date:** 2026-10-04

## Padrões de Nomenclatura

**Arquivos:**

- Uma classe por arquivo. O nome do arquivo repete o domínio em camelCase e o papel depois do ponto: `user.service.ts`, `user.controller.ts`, `user.repository.ts`, `user.mapper.ts`, `user.module.ts`, `user.entity.ts`, `createUser.dto.ts`, `role.enum.ts`.
- Coloque o arquivo na pasta da camada, não ao lado de um “feature folder”. DTOs ficam em subpasta de domínio: `src/dtos/user/createUser.dto.ts`, `src/dtos/login/login.dto.ts`, `src/dtos/password/changePasswordAuth.dto.ts`.
- Sufixos obrigatórios no nome do arquivo: `.service`, `.controller`, `.repository`, `.mapper`, `.module`, `.entity`, `.dto`, `.enum`, `.guard`, `.decorator`.
- Specs não ficam ao lado da classe. Use `src/tests/services/<dominio>.service.spec.ts` e `src/tests/controllers/<dominio>.controller.spec.ts`.
- Exceções já existentes — ao editar esses arquivos, preserve o nome; arquivo novo segue o padrão com ponto:
  - `src/services/mailingService.ts` (sem ponto antes de `Service`)
  - `deliveryqueue` em minúsculas em `src/services/deliveryqueue.service.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/modules/deliveryqueue.module.ts`, contra `src/repositories/deliveryQueue.repository.ts` e `src/entities/deliveryQueue.entity.ts`
  - specs em kebab-case só para cliente e entregador: `src/tests/services/user-client.service.spec.ts`, `src/tests/services/user-delivery.service.spec.ts` (as classes continuam `userClient.service.ts` e `userDelivery.service.ts`)
- A pasta de guardas é singular: `src/guard/auth.guard.ts`, `src/guard/role.guard.ts`.

**Funções:**

- Métodos em camelCase. O domínio mistura inglês de CRUD (`create`, `findAll`, `findOne`, `findById`, `delete`, `updateStatus`, `login`) e português nas rotas de senha e código (`mudaSenha`, `recuperaSenha`, `validaCodigo`, `recuperaSenhaDelivery`, `validaCodigoDelivery`). No arquivo que você alterar, copie o idioma do método vizinho.
- Handlers HTTP usam o mesmo nome do método de service que chamam. Exceção já presente em `src/controllers/user.controller.ts`: o handler `findOne` chama `findAll`, e `findById` chama `findbyId` (b minúsculo). Não propague `findbyId` para código novo; no `UserService` o método existente permanece `findbyId`.
- Métodos de repositório são `public`. Métodos de token em `src/services/auth.service.ts` são `private` (`createToken`, `createTokenDelivery`, `checkInToken`, `createTokenRecoverPassword`).
- Mappers expõem exatamente `toDTO`, `toEntity`, `toListDTO`, `toListEntity`.
- Constantes de metadata de decorator em SCREAMING_SNAKE: `ROLES_KEY`, `IS_PUBLIC_KEY` em `src/decorators/roles.decorator.ts` e `src/decorators/public.decorator.ts`.
- Factories de decorator em PascalCase: `Roles`, `Public`, `User`, `Delivery`, `PasswordCode`.

**Variáveis:**

- Dependência injetada: `private readonly` + camelCase do tipo (`userRepository`, `userMapper`, `mailingService`).
- Em `src/services/auth.service.ts` o campo do `UserService` está `userservice` (s minúsculo). Nesse arquivo, mantenha `userservice`. Em código novo use camelCase com a fronteira da palavra (`userService`).
- Locais de paginação usam português: `dados`, `retorno` em `src/services/user.service.ts` e `src/services/shopping.service.ts`.
- Parâmetro de rota numérico chega como `string` e é convertido com `+id` ou `Number(...)` antes do service (`src/controllers/user.controller.ts`, `src/controllers/shopping.controller.ts`).
- Comparação com null e entre strings de papel usa `==` / `!=`, como em `src/mappers/user.mapper.ts`, `src/repositories/user.repository.ts` e `src/services/user.service.ts`. Mantenha esse operador no método que você editar.

**Tipos:**

- Não há `interface` nem `type` alias exportado. Modele contrato com `class`.
- Sufixo da classe = papel:
  - service `UserService`, controller `UserController`, repositório `UserRepository`, módulo `UserModule`
  - entidade `UserEntity` (`@Entity({ name: 'userbackoffice' })` — o `name` da tabela pode divergir do nome da classe)
  - DTO `CreateUserDto`, `UserDto`, `UserQueryPaginateDto`, `UserPaginateDto`, `LoginAuthDto`, `LoginReturnDto`, `ChangePasswordAuthDto`
  - update DTO estende `PartialType` do DTO base: `src/dtos/user/updateUser.dto.ts`
  - mapper `UserMapper`, guarda `AuthGuard` / `RoleGuard`
- Enums de status numérico: `DeliveryStatus` em `src/enums/deliveryStatus.enum.ts` (`Waiting = 1`). Enums de papel string: `Role` em `src/enums/role.enum.ts` (`User = '1'`).
- Três enums já estão em camelCase, não PascalCase: `solicitacaoCompraStatus` (`src/enums/solicitacaoCompraStatus.enum.ts`), `tipoCartao` (`src/enums/tipoCartao.enum.ts`), `modoPagamento` (`src/enums/modoPagamento.enum.ts`). Importe esses identificadores como estão. Enum novo de status usa PascalCase, no estilo de `Role` e `DeliveryStatus`.
- Relação TypeORM no nome do campo termina em `Entity`: `productEntity`, `userClientEntity` em `src/entities/shopping.entity.ts`.
- Colunas e propriedades em camelCase (`storeCode`, `createdAt`). Quando o nome da coluna difere, passe `name` no decorator: `@Column({ name: 'userEntityId' })` e `@JoinColumn({ name: 'userEntityId' })` em `src/entities/shopping.entity.ts`.

## Estilo de Código

**Formatação:**

- Prettier 3, config em `.prettierrc`: `singleQuote: true`, `trailingComma: "all"`. `printWidth` não está definido; o default do Prettier (80) é o que quebra assinatura e decorator em `src/controllers/user.controller.ts` e `src/services/auth.service.ts`.
- Indentação de 2 espaços. Ponto e vírgula em todo statement.
- Rode `npm run format` (`prettier --write "src/**/*.ts" "test/**/*.ts"`) antes de encerrar uma alteração de estilo.

**Linting:**

- ESLint 8 em `.eslintrc.js`, parser `@typescript-eslint/parser` com `project: tsconfig.json`.
- Extends: `plugin:@typescript-eslint/recommended` e `plugin:prettier/recommended`.
- Ambiente: `node` e `jest`.
- Regras desligadas de propósito — não reative no arquivo:
  - `@typescript-eslint/interface-name-prefix`
  - `@typescript-eslint/explicit-function-return-type`
  - `@typescript-eslint/explicit-module-boundary-types`
  - `@typescript-eslint/no-explicit-any`
- Comando: `npm run lint` (`eslint "{src,apps,libs,test}/**/*.ts" --fix`).
- `tsconfig.json` deixa `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`, `forceConsistentCasingInFileNames` e `noFallthroughCasesInSwitch` em `false`. O compilador não exige tipo em parâmetro (`createTokenRecoverPassword(codeRecover: number, id)` em `src/services/auth.service.ts`). Em método novo de repositório, anote o retorno (`Promise<UserEntity>`, `Promise<void>`), como em `src/repositories/user.repository.ts`.
- `any` aparece em `src/services/mailingService.ts` (`user: any`). Permitido pelo lint. Em DTO e entidade novos, declare a propriedade com o tipo concreto (`string`, `number`, `Date`).

## Organização de Imports

**Ordem:**

Não há `eslint-plugin-import`. Ao escrever um arquivo novo, agrupe nesta ordem, com uma linha em branco entre grupos:

1. Pacotes `@nestjs/*`
2. Pacotes externos (`typeorm`, `bcrypt`, `class-validator`, `nodemailer`, `dotenv`)
3. Alias `src/...`
4. Relativos `./` e `../` para o vizinho imediato da mesma feature (o controller importa o service assim: `import { UserService } from '../services/user.service'`)

O código atual mistura os grupos 3 e 4 no mesmo bloco (`src/controllers/user.controller.ts` importa o service por relativo e o DTO por `src/`). Ao editar um arquivo, preserve a ordem que já está nele.

**Path Aliases:**

- `tsconfig.json` define `baseUrl: "./"` e não define `paths`. O prefixo `src/...` resolve a partir da raiz do repositório (`import { UserDto } from 'src/dtos/user/user.dto'`).
- Use `src/...` para cruzar camadas (service → repository, mapper, dto, entity, enum).
- Use relativo para a mesma feature a um nível (controller → `../services/...`, module → `../controllers/...` e `../services/...`), como em `src/modules/user.module.ts`.
- Specs usam somente relativo a partir de `src/tests/`: `../../services/user.service` e `../../controllers/user.controller`.

## Tratamento de Erros

**Padrões:**

- Não há `ExceptionFilter`, interceptor nem pipe customizado. O único pipe global é `new ValidationPipe()` sem opções em `src/main.ts` (sem `whitelist`, sem `transform`). Validação de body depende dos decorators `class-validator` no DTO.
- Controller não envolve chamada em `try/catch`. Devolve a Promise do service.
- Regra de negócio conhecida lança `BadRequestException` com mensagem fixa em português, antes ou dentro do `try`:

```typescript
if (createUserDto.password != createUserDto.confirmPassword) {
  throw new BadRequestException('Senha e confirma senha diferentes');
}
```

- Falha de repositório ou de regra de status vira `BadRequestException`. Dois formatos convivos:
  - mensagem fixa: `src/services/product.service.ts` (`'Pedido invalido.'`), `src/services/shopping.service.ts` (`'Compra/Status invalido.'`), `src/services/deliveryqueue.service.ts` (`'Dados invalidos'`, `'Shopping já usado'`)
  - `throw new BadRequestException(error.message)` em `src/services/user.service.ts` e `src/services/userDelivery.service.ts`
- Método novo de service usa mensagem fixa em português (sem repassar `error.message`), no formato de `src/services/product.service.ts`.
- Login inválido lança `UnauthorizedException` no repositório, não no service: `'Email e/ou senha incorretos.'` em `src/repositories/user.repository.ts` e `src/repositories/userDelivery.repository.ts`.
- Duplicidade e código ausente também nascem no repositório como `BadRequestException` (`'Email invalido.'`, `'Codigo invalido.'`, `'Dado Invalido!'`).
- `src/guard/auth.guard.ts` captura qualquer erro de token e `return false` (o Nest responde 403). Não lance exceção dentro de `canActivate`.
- Param decorator sem usuário no request lança `BadRequestException('Usuario não encontrado')` em `src/decorators/user.decorator.ts`. O decorator de código de recuperação usa `'Codigo não encontrado'` (`src/decorators/passwordCode.decorator.ts`).
- Mensagens existentes omitem acento (`invalido`, `Codigo`). Ao acrescentar uma mensagem no mesmo método, copie essa grafia. Texto de `@ApiProperty` em DTO também está em português sem acento (`src/dtos/user/createUser.dto.ts`).

## Logging

**Framework:** Não detectado

**Padrões:**

- Nenhum `Logger` do Nest e nenhuma chamada `console.*` em `src/`.
- Não adicione `console.log` para depurar fluxo de service, repositório ou guard.
- Falha de negócio continua sendo exceção HTTP, não log.

## Comentários

**Quando Comentar:**

- Comentário de uma linha, em português, só para efeito colateral que o nome do método não mostra. Exemplos em `src/services/auth.service.ts`: `//salvar codigo criado no banco`, `//enviar email`.
- Comentário inline em opções de módulo explica duração do JWT em `src/modules/auth.module.ts`: `//usado para definir globalmente quanto tempo o jwt vai valer`.
- O repositório guarda handlers inteiros comentados (`src/controllers/category.controller.ts`, `src/controllers/shopping.controller.ts`, `src/services/deliveryqueue.service.ts`). Não acrescente bloco novo comentado. Ao reativar um handler, apague o comentário e ligue o método de verdade.
- `README.md` é o texto padrão do starter Nest. Não é guia de estilo deste projeto.

**JSDoc/TSDoc:**

- Não detectado. Não abra bloco `/** */` em método novo.

## Design de Funções

**Tamanho:**

- Handler de controller: uma expressão `return this.<service>.<metodo>(...)`.
- Service: um caso de uso por método. Monte a entidade no service (`new UserEntity()` e atribuição campo a campo em `src/services/user.service.ts`) e delegue persistência ao repositório.
- Repositório: uma operação TypeORM por método (`findOne`, `save`, `update`, `findAndCount`). Paginação padrão em `findAll`: `take = query.take || 10`, `skip = query.skip || 0`, `order = query.orderBy || { id: 'DESC' }`, retorno `{ data, count }` (`src/repositories/user.repository.ts`).
- Métodos gerados pelo CLI que ainda devolvem string (`return \`This action returns all product\`` em `src/services/product.service.ts`, `src/services/category.service.ts`, `src/services/shopping.service.ts`) são stub. Ao implementar o caso de uso, substitua a string por chamada de repositório; não deixe os dois caminhos.

**Parâmetros:**

- Body: um DTO (`CreateUserDto`, `LoginAuthDto`, `UserQueryPaginateDto`).
- Rota: `@Param('id') id: string` e conversão numérica no handler.
- Usuário autenticado: `@User() user: UserDto` (`src/decorators/user.decorator.ts`). Entregador: `@Delivery()`. Código de recuperação: `@PasswordCode()`.
- Liste filtros de listagem no DTO de query com `class-validator` e `@ApiProperty`, como `src/dtos/user/userQueryPaginate.dto.ts` (`take`, `skip`, `orderBy?`, `storeCode`).
- Login no repositório desestrutura o DTO: `login({ email, password, storeCode }: LoginAuthDto)`.
- Injeção só pelo construtor. Sem `ModuleRef` e sem propriedade atribuída fora do construtor, exceto campos privados inicializados no construtor de `src/services/mailingService.ts` e os literais `issuer` / `audience` em `src/services/auth.service.ts`.

**Retornos:**

- Omita o tipo de retorno quando o ESLint já permite (regra desligada), exceto no repositório e nos métodos de auth que já declaram `Promise<LoginReturnDto>` ou `Promise<UserEntity>`.
- Fluxo assíncrono usa `async`/`await`. Não retorne `Observable` do RxJS; `rxjs` está no `package.json` como dependência do Nest, e os services não importam operadores.
- Lista paginada: instância de `*PaginateDto` com `count` e `data` preenchidos depois do mapper (`src/services/shopping.service.ts`).
- Mapper: entrada `null` devolve `null`; lista usa `list.map((element) => this.toDTO(element))` (`src/mappers/user.mapper.ts`).
- Delete de usuário é lógico: `active = false` e `save` em `src/repositories/user.repository.ts`. Não chame `repository.delete` físico para `UserEntity`.

## Design de Módulos

**Exports:**

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

**Barrel Files:**

- Não detectado. Não crie `index.ts` reexportando a camada.

---

*Convention analysis: 2026-10-04*
