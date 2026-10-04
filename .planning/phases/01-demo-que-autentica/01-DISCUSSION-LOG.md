# Phase 1: Demo que autentica - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-04
**Phase:** 1-Demo que autentica
**Areas discussed:** MySQL do exemplo, Senha conhecível nesta fase, Identidade da demo

---

## MySQL do exemplo

| Option | Description | Selected |
|--------|-------------|----------|
| Compose + exemplo | `compose.yaml` com `mysql:8.4.11` e `.env.example` alinhado. MySQL 8.4.11 local ajusta `DB_*` e pula o Compose. | ✓ |
| Só exemplo | `.env.example` sem `compose.yaml`. MySQL instalado fora do repositório. | |
| Plano segue a pesquisa | Compose mais fallback local, como a pesquisa já descreveu. | |

**User's choice:** Compose + `.env.example`, com fallback local.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Usuário dedicado | `ifarma` / `ifarma`, database `ifarma`, `127.0.0.1:3306`, `JWT_SECRET=demo-jwt-secret-ifarma`, `ENV=demo`. API não usa root. | ✓ |
| Root | API conecta como root. | |
| Plano escolhe os nomes | Valores fictícios, iguais nos dois arquivos. | |

**User's choice:** Usuário `ifarma`, senha `ifarma`, database `ifarma`.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Só banco e JWT | `DB_*`, `JWT_SECRET`, `ENV=demo`. Sem `MAIL_*`. | |
| Incluir e-mail | `MAIL_*` e `CLIENT_URL` fictícios. | ✓ |

**User's choice:** Incluir `MAIL_*` e `CLIENT_URL`.
**Notes:** O envio de e-mail continua fora da fase.

| Option | Description | Selected |
|--------|-------------|----------|
| Volume nomeado | `docker compose down` mantém os dados. `down -v` apaga. | ✓ |
| Sem volume | Cada `up` começa vazio. | |
| Plano escolhe | Desde que as credenciais permaneçam alinhadas. | |

**User's choice:** Volume nomeado.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Compose e script | `MYSQL_DATABASE` e o script criam `ifarma` se faltar. | ✓ |
| Só Compose | MySQL local cria o database na mão. | |
| Só o script | Compose não declara `MYSQL_DATABASE`. | |

**User's choice:** Compose e script.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| `ifarma-root` | Senha de root diferente, só no `compose.yaml`. | ✓ |
| Mesma senha | Root também usa `ifarma`. | |
| Plano escolhe | Senha fictícia diferente de `ifarma`. | |

**User's choice:** `MYSQL_ROOT_PASSWORD=ifarma-root`.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Cabeçalho curto | Português: copiar para `.env`, não commitar, valores batem com o Compose, MySQL local pode ajustar `DB_*`. Sem percurso do pedido. | ✓ |
| Uma linha | Só "copiar para `.env`". | |
| Só chaves | Nenhum comentário. | |

**User's choice:** Cabeçalho curto em português.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| localhost:1025 | `MAIL_HOST=localhost`, `MAIL_PORT=1025`, `MAILER_SECURE=false`, `MAIL_USER=demo`, `MAIL_PASSWORD=demo`, `MAIL_FROM=no-reply@example.com`, `CLIENT_URL=http://localhost:3000`. | ✓ |
| Plano escolhe | Valores fictícios, sem servidor de e-mail. | |
| Vazios | Chaves com valor vazio. | |

**User's choice:** Placeholders em localhost, sem SMTP.
**Notes:** A pergunta seguinte, sobre bind de `3306`, foi respondida com "proxima area". Bind não ficou decidido.

---

## Senha conhecível nesta fase

| Option | Description | Selected |
|--------|-------------|----------|
| Comentário da semente | E-mail, senha em claro, id e `verificationCode` no topo do SQL. `INSERT` só com hash. README da fase 3 copia. | ✓ |
| Só no CONTEXT | Hash no SQL. Senha em claro só para o plano. README é a primeira superfície pública. | |
| Cabeçalho do `.env.example` | Os quatro valores no exemplo de ambiente. | |

**User's choice:** Comentário no arquivo de semente.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| `Entrega1!` | Texto no comentário, hash gerado com bcrypt 5.1.1. | ✓ |
| `Demo#2026` | Mesma regra. | |
| Plano escolhe | Qualquer senha que passe no validator. | |

**User's choice:** `Entrega1!`.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Os dois no comentário | Entregador e operador com `Entrega1!`. | ✓ |
| Só entregador | Operador tem hash, sem texto no comentário. | |
| Outra senha | Operador com senha diferente, também no comentário. | |

**User's choice:** Os dois com `Entrega1!`.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Linha pronta | Operador `authorized` e `active`. Critério da fase continua só `loginDelivery`. | ✓ |
| Linha solta | `POST /auth/login` pode responder 401 nesta fase. | |

**User's choice:** Operador nasce pronto para a senha publicada.
**Notes:** —

---

## Identidade da demo

| Option | Description | Selected |
|--------|-------------|----------|
| Plano, neutro | E-mails `@example.com`, texto no comentário da semente. | ✓ |
| Usuário define | Conjunto de valores na mensagem seguinte. | |
| Tema Colibri | Loja no tema Colibri/iFarma, e-mails `@example.com`. | |

**User's choice:** Plano escolhe valores neutros.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| `4821` | Quatro dígitos, comentário e coluna. | ✓ |
| `482913` | Seis dígitos. | |
| Plano escolhe | String curta e estável. | |

**User's choice:** `4821`.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| Ids 1 | Cliente, operador, entregador e pedido com id `1`. Reexecução mantém os ids. | ✓ |
| Plano escolhe ids | Numéricos, estáveis, escritos no comentário. | |
| Autoincrement | Comentário não promete id de pedido. | |

**User's choice:** Ids fixos `1`.
**Notes:** —

| Option | Description | Selected |
|--------|-------------|----------|
| `2312` | Igual ao exemplo de `LoginAuthDto`. Nomes em português. E-mails `@example.com`. Plano escolhe o texto. | ✓ |
| `1001` | Outro código, mesma regra de nomes. | |
| Plano escolhe o código | Mesmo código no operador e no pedido. | |

**User's choice:** `storeCode` `2312`, nomes em português.
**Notes:** Área encerrada em seguida. Não houve outra área selecionada.

---

## Claude's Discretion

- Bind de `3306`: usuário não escolheu. CONTEXT recomenda `127.0.0.1:3306`.
- Reexecução da semente não foi uma área selecionada. Ficou o critério do roadmap mais os ids fixos: reaplica a semente e o pedido `1` fica sem fila.
- Caminho dos arquivos (`seed/demo.sql`, `scripts/apply-demo-sql.js`, `npm run seed`), preload do `dotenv`, charset `utf8mb4` e status inicial `WaitingMotoboy` não foram votados. Estão na discrição do CONTEXT.

## Deferred Ideas

- README do percurso (fase 3).
- Fila e confirmação pelo código (fase 2).
- SMTP real. Os `MAIL_*` são placeholders.
