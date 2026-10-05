---
phase: "01"
slug: demo-que-autentica
status: verified
threats_open: 0
asvs_level: 1
created: "2026-10-05"
---

# Fase 01 — Segurança

> Contrato de segurança da fase: registro de ameaças, riscos aceitos e trilha de auditoria.

---

## Fronteiras de confiança

| Fronteira | Descrição | Dado que cruza |
|----------|-------------|---------------|
| Pessoa que clona → arquivos versionados | `.env.example`, `compose.yaml` e o comentário de `seed/demo.sql` são públicos de propósito e só com valores de demo | Credenciais fictícias de demonstração |
| Host → MySQL | A porta 3306 sai do container só em 127.0.0.1. A API conecta como `ifarma`, não como root | Tráfego MySQL local |
| `scripts/apply-demo-sql.js` → MySQL | O SQL vem de `seed/demo.sql`. Só `DB_DATABASE` é interpolado, e apenas se casar o alfabeto seguro | Nome do schema |
| Cliente → `POST /auth/loginDelivery` | Corpo não confiável na rota que já existe. Esta fase não alarga o guard | E-mail e senha do entregador |

---

## Registro de ameaças

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-01 | Information disclosure | compose.yaml ports | high | mitigate | `compose.yaml` publica `127.0.0.1:3306:3306` | closed |
| T-01-02 | Information disclosure | .env | medium | mitigate | Só `.env.example` é versionado. `.env` está no `.gitignore`. O aplicador não grava esse arquivo | closed |
| T-01-03 | Tampering | seed/demo.sql password | medium | mitigate | A coluna `password` guarda hash bcrypt. `scripts/apply-demo-sql.js` redacta o hash antes de `console.error` | closed |
| T-01-04 | Tampering | scripts/apply-demo-sql.js DB_DATABASE | high | mitigate | `assertDatabaseName` aceita só `^[A-Za-z0-9_]+$`. `multipleStatements` fica nesta conexão, com o SQL do repositório | closed |
| T-01-05 | Information disclosure | MYSQL_ROOT_PASSWORD | medium | mitigate | `ifarma-root` só em `compose.yaml`. `.env.example` não recebe a senha de root | closed |
| T-01-06 | Elevation of privilege | UserDeliveryRepository.login | low | accept | A rota atual não filtra `active` nem `role`. Fora desta fase. A linha semeada nasce `active` 1 | closed |
| T-01-07 | Spoofing | JwtModule.register | medium | mitigate | O primeiro import de `src/main.ts` é `dotenv/config`, para `JWT_SECRET` não virar a string `undefined` | closed |
| T-01-08 | Denial of service | connect retry | low | accept | No máximo 30 tentativas de 1 segundo, só em erro de conexão. Access denied não entra no retry | closed |
| T-01-09 | Information disclosure | comentario de seed/demo.sql | low | accept | D-09 publica `Entrega1!` no comentário de propósito. A coluna `password` guarda só o hash. Não é credencial de produção | closed |
| T-01-SC | Tampering | npm ci | high | mitigate | O plano não adicionou pacote. `npm ci` só se `node_modules/bcrypt` faltar, usando o lock já commitado | closed |

*Status: open · closed · open — abaixo do limiar high (não bloqueia)*
*Severity: critical > high > medium > low — só ameaças abertas em ou acima de `workflow.security_block_on` (`high`) entram em `threats_open`*
*Disposition: mitigate (controle no código) · accept (risco documentado) · transfer (terceiro)*

---

## Riscos aceitos

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-01-06 | T-01-06 | Login do entregador não filtra `active` nem `role`. A demo semeia a linha ativa. Correção fica fora desta fase | Plano 01-01 | 2026-10-05 |
| R-01-08 | T-01-08 | Retry de conexão limitado a 30 tentativas de 1 segundo e não cobre access denied | Plano 01-01 | 2026-10-05 |
| R-01-09 | T-01-09 | A senha de demonstração aparece no comentário de `seed/demo.sql` de propósito. O valor persistido é o hash | Plano 01-01 | 2026-10-05 |

*Riscos aceitos não voltam em auditorias futuras.*

---

## Trilha de auditoria

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-05 | 10 | 10 | 0 | gsd-verify-work |

Profundidade ASVS L1. Registro escrito no plano (`register_authored_at_plan_time: true`). Nenhuma ameaça aberta no limiar `high` ou acima, então o auditor não foi disparado.

## Security Audit 2026-10-05

| Metric | Count |
|--------|-------|
| Threats found | 10 |
| Closed | 10 |
| Open | 0 |

---

## Sign-Off

- [x] Todas as ameaças têm disposição (mitigate / accept / transfer)
- [x] Riscos aceitos documentados no registro
- [x] `threats_open: 0` confirmado
- [x] `status: verified` no frontmatter

**Approval:** verified 2026-10-05
