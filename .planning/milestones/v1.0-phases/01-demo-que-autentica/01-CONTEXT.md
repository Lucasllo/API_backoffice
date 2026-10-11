# Phase 1: Demo que autentica - Context

**Gathered:** 2026-10-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Quem copia o exemplo de ambiente sobe MySQL 8.4.11 e a API, e autentica o entregador semeado em `POST /auth/loginDelivery`. A semente versionada traz loja (`storeCode`), operador, entregador, cliente e um pedido com `verificationCode` conhecido. Rodar a semente de novo mantém os mesmos ids e deixa esse pedido sem fila.

Fora desta fase: persistir e concluir a fila (fase 2) e o README do percurso mais `npm run test:delivery` (fase 3). O comentário da semente é a fonte que o README da fase 3 vai copiar. Esta fase não escreve esse README.

</domain>

<decisions>
## Implementation Decisions

### MySQL do exemplo
- **D-01:** Commitar `compose.yaml` com a imagem `mysql:8.4.11` e um `.env.example` alinhado a esse container. Quem já tem MySQL 8.4.11 local copia o exemplo, ajusta `DB_*` e não sobe o Compose.
- **D-02:** Copiar `.env.example` para `.env` sobe sem editar valores. Usuário `ifarma`, senha `ifarma`, database `ifarma`, host `127.0.0.1`, porta `3306`. O Compose cria esse usuário. A API não conecta como root. `JWT_SECRET=demo-jwt-secret-ifarma`. `ENV=demo`.
- **D-03:** `.env.example` também traz e-mail fictício, sem servidor SMTP nesta fase: `MAIL_HOST=localhost`, `MAIL_PORT=1025`, `MAILER_SECURE=false`, `MAIL_USER=demo`, `MAIL_PASSWORD=demo`, `MAIL_FROM=no-reply@example.com`, `CLIENT_URL=http://localhost:3000`. O envio em `AuthService` continua comentado.
- **D-04:** Volume nomeado. `docker compose down` mantém schema e semente. Apagar os dados é `docker compose down -v`.
- **D-05:** O Compose cria o database `ifarma` na primeira subida (`MYSQL_DATABASE`). O script da semente também cria o database se ele não existir, para o MySQL local funcionar sem passo manual.
- **D-06:** `MYSQL_ROOT_PASSWORD=ifarma-root`, só no `compose.yaml`. Diferente da senha do usuário `ifarma`.
- **D-07:** Cabeçalho curto do `.env.example` em português: copiar para `.env`, não commitar `.env`, os valores já batem com o Compose, MySQL 8.4.11 local pode ajustar `DB_*`. Sem o percurso do pedido.
- **D-08:** Copiar o exemplo para `.env` basta para o boot. A API enxerga `DB_*` e `JWT_SECRET` sem `export` no shell.

### Senha conhecível nesta fase
- **D-09:** Comentário no topo do arquivo de semente com e-mail, senha em claro, id do pedido e `verificationCode`. O `INSERT` guarda só o hash bcrypt. O README da fase 3 copia esses valores.
- **D-10:** Senha em claro `Entrega1!` para o entregador. O hash no `INSERT` é dessa senha, gerado com o `bcrypt` 5.1.1 já do projeto. Passa em `@IsStrongPassword` de `LoginAuthDto`.
- **D-11:** O mesmo comentário lista o operador, também com `Entrega1!`. O `INSERT` do operador guarda só o hash. O bloco do operador inclui `storeCode` `2312`, porque `UserRepository.login` exige e-mail, `storeCode`, `authorized: true` e `active: true`.
- **D-12:** O operador nasce `authorized`, `active` e com hash de `Entrega1!`. A senha publicada é verdadeira. O critério desta fase continua sendo só `POST /auth/loginDelivery`.

### Identidade da demo
- **D-13:** O plano escolhe nomes, endereços e e-mails neutros e fictícios. E-mails em `@example.com`. Tudo o que a pessoa precisa para autenticar fica no comentário da semente.
- **D-14:** `verificationCode` fixo `4821`, na coluna e no comentário.
- **D-15:** Ids fixos e repetíveis: cliente `1`, operador `1`, entregador `1`, pedido `1`. O comentário cita o pedido `1`.
- **D-16:** `storeCode` `2312` no operador (`userbackoffice`) e no pedido (`shoppings`). Nomes e endereços em português.

### Carregado do projeto, não rediscutido
- **D-17:** Schema por SQL versionado. `ENV=demo`, então `synchronize` permanece desligado. O literal `developmen` em `src/app.module.ts` não muda. Nenhum pacote novo no `package.json`.
- **D-18:** Reexecução reaplica a mesma semente: os ids continuam `1` e o pedido `1` termina sem linha em `deliveryqueue`.

### Claude's Discretion
- Bind da porta `3306` não foi escolhido (a pergunta foi encerrada com "proxima area"). Publicar só `127.0.0.1:3306`, porque a senha `ifarma` está no repositório.
- Charset do Compose: `utf8mb4` / `utf8mb4_unicode_ci`, para os nomes em português.
- Não criar `.nvmrc` nem `engines` nesta fase.
- Um comando `npm run seed` aplica `seed/demo.sql` via `scripts/apply-demo-sql.js`, com `node -r dotenv/config` e o `mysql2` já instalado. O SQL cria o database se faltar, cria as tabelas da demo e insere o grafo. Fora de `src/`. Sem seed no boot e sem rota de seed.
- O boot lê o `.env` antes de avaliar `AppModule`: primeiro import de `src/main.ts` é `import 'dotenv/config'`.
- Pedido semeado com status `solicitacaoCompraStatus.WaitingMotoboy` (`6`), não `Concluded`. Nenhuma linha em `deliveryqueue`. Sem produtos, cartão, endereço ou categoria.
- Papel do operador: `Role.User` (`'1'`). Papel do entregador: `Role.Delivery` (`'4'`). Cliente em `users` só para cumprir `userEntityId`.
- Colunas obrigatórias que a demo não exibe (CPF, telefone, veículo, `validCode`, `userAuthorized`) recebem valores claramente falsos. `UserRepository.login` olha `authorized` e `active`, não `userAuthorized`.
- Hash gerado pelo `bcrypt` do projeto e gravado no arquivo SQL. Não depender de o shell expandir `$2b$`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Fase e requisitos
- `.planning/ROADMAP.md` — Fase 1: objetivo, critérios de sucesso e o corte com as fases 2 e 3
- `.planning/REQUIREMENTS.md` — `ENV-02`, `SEED-01`, `SEED-02`; v2 e fora de escopo
- `.planning/PROJECT.md` — portfólio simples, SQL versionado, sem pacote novo, dados fictícios
- `.planning/STATE.md` — `developmen` permanece; fallback MySQL 8.4.11 local se a imagem não conectar

### Código que a semente e o boot têm de respeitar
- `.planning/codebase/STACK.md` — NestJS 10, TypeORM, `mysql2`, `dotenv` depois dos imports, ausência de `.env.example` e de Compose
- `.planning/codebase/ARCHITECTURE.md` — login do entregador, `sub` `{ userDelivery }`, grafo `shoppings` → `users`
- `.planning/codebase/INTEGRATIONS.md` — variáveis `DB_*`, `JWT_SECRET`, `ENV`, `MAIL_*`, `CLIENT_URL`

### Pesquisa do marco (a discussão prevalece onde divergir)
- `.planning/research/SUMMARY.md` — forma do Compose, do SQL e do preload do `dotenv`. Divergências fechadas aqui: `MAIL_*` entram no `.env.example`; a senha em claro entra no comentário da semente nesta fase, não só no README

Não há ADR externo. Requisitos e decisões estão nos arquivos acima.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bcrypt` 5.1.1, já usado em `src/services/userDelivery.service.ts` e `src/repositories/userDelivery.repository.ts`: gerar o hash de `Entrega1!` com esse pacote.
- `mysql2` 3.9.7, já no lock: o script da semente usa o driver existente. Não adicionar cliente MySQL novo.
- `dotenv` 16.4.5: `import 'dotenv/config'` no topo de `src/main.ts`, e `node -r dotenv/config` no script, porque o e2e e o seed não passam por um `dotenv.config()` tardio.

### Established Patterns
- `TypeOrmModule.forRoot` em `src/app.module.ts` lê `process.env` na avaliação do módulo. `synchronize` só liga com `ENV === 'developmen'`. `ENV=demo` deixa o DDL por conta do SQL.
- `POST /auth/loginDelivery` é `@Public()` e usa `LoginAuthDto`. A senha precisa de 6 caracteres, maiúscula, minúscula, número e símbolo. O exemplo `123456` do Swagger não passa.
- `UserDeliveryRepository.login` busca por e-mail e compara com `bcrypt.compare`. Não filtra `active` nem `role`.
- `UserRepository.login` filtra `email`, `storeCode`, `authorized: true` e `active: true` antes do `bcrypt.compare`.
- JWT do entregador: `sub` JSON `{ userDelivery: id }` em `src/services/auth.service.ts`.

### Integration Points
- `.env` está no `.gitignore`. O arquivo novo é `.env.example`. Não versionar `.env`.
- Não há `compose.yaml`, `Dockerfile` nem pasta `migrations/`.
- Entidades do grafo da demo: `src/entities/userClient.entity.ts` (`users`), `src/entities/user.entity.ts` (`userbackoffice`), `src/entities/userDelivery.entity.ts` (`userdelivery`), `src/entities/shopping.entity.ts` (`shoppings`). `ShoppingEntity.userClientId` mapeia `userEntityId`.
- `MailingService` lê `MAIL_*` no construtor e carrega os templates que já existem. Não chama SMTP no login.

</code_context>

<specifics>
## Specific Ideas

- Banco de demonstração: usuário `ifarma` / senha `ifarma` / database `ifarma` / `127.0.0.1:3306`. Root do container: `ifarma-root`.
- JWT de demonstração: `demo-jwt-secret-ifarma`.
- Senha dos dois atores HTTP: `Entrega1!`.
- Pedido `1`, código `4821`, loja `2312`.
- E-mails em `@example.com`, nomes em português, escolhidos no plano e repetidos no comentário da semente.

</specifics>

<deferred>
## Deferred Ideas

- README em português com o percurso até a confirmação, copiando e-mail, `Entrega1!`, pedido `1` e `4821` do comentário da semente. Fase 3.
- Fila persistida, recusa do segundo enfileiramento e confirmação pelo código. Fase 2.
- Servidor SMTP de verdade. Os `MAIL_*` do exemplo são placeholders.

</deferred>

---

*Phase: 1-Demo que autentica*
*Context gathered: 2026-10-04*
