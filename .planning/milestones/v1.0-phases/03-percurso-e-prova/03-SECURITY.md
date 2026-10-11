---
phase: "03"
slug: percurso-e-prova
status: verified
threats_open: 0
asvs_level: 1
created: "2026-10-11"
---

# Fase 03 — Segurança

> Contrato de segurança da fase: registro de ameaças, riscos aceitos e trilha de auditoria.

---

## Fronteiras de confiança

| Fronteira | Descrição | Dado que cruza |
|----------|-------------|---------------|
| Spec para MySQL do .env | O beforeAll reaplica a semente, que apaga a fila do pedido 1 e reinsere esse pedido. A entrada é o ambiente carregado pelo dotenv. | Host, banco e ENV da demo |
| Spec para POST /auth/loginDelivery | O corpo leva o e-mail e a senha fictícios. O token dos POST seguintes sai da resposta. | Credencial fictícia e Bearer |
| Spec para deliveryqueue e shoppings | A leitura usa o DataSource que o AppModule já abriu. Os códigos 0000 e 4821 vão na URL, como a rota já publica. | Identificador do pedido e código |
| Leitor para o terminal | Os blocos são colados no shell local e falam com a API em localhost:3000. O token vem da resposta ao vivo. | Comandos curl e token da sessão |
| README para o .env | O texto manda copiar o exemplo sem editar. A semente apaga e reinsere o pedido 1 no banco dessa conexão. | Caminho do exemplo, sem segredo novo |
| apply-demo-sql.js para o MySQL | A espera continua no mesmo cliente mysql2. Acesso negado transitório volta a tentar; acesso negado de CREATE DATABASE permanece no preâmbulo. | Tentativas de conexão |

---

## Registro de ameaças

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-01 | Tampering | test/delivery-path.spec.ts | high | mitigate | A fila é lida com `queueRepo.find({ where: { shoppingId: 1 } })` e o pedido com `shoppingRepo.findOne({ where: { id: 1 } })`. O spec não concatena `verificationCode` nem `shoppingId` em SQL. | closed |
| T-03-02 | Tampering | package.json script test:delivery | high | mitigate | O script usa `--runTestsByPath ./test/delivery-path.spec.ts` e `--runInBand`. `test/jest-delivery.json` restringe `testRegex` a `delivery-path.spec.ts`. O script não usa `passWithNoTests`. | closed |
| T-03-03 | Spoofing | POST autenticados do spec | high | mitigate | O Bearer sai só de `login.body.token`. O spec exige `login.body.id` 1 e `login.body.role` `'4'`. Não há JWT literal. | closed |
| T-03-04 | Tampering | spawnSync da semente | high | mitigate | Antes do `spawnSync`, o spec recusa `DB_HOST` diferente de `127.0.0.1`, `DB_DATABASE` diferente de `ifarma` ou `ENV` diferente de `demo`. | closed |
| T-03-05 | Denial of service | pool e porta 3000 | medium | mitigate | O spec fecha a conexão do `AppModule` com `await app.close()`. Não chama `app.listen` nem abre `mysql2`. | closed |
| T-03-06 | Information disclosure | saída do Jest | medium | mitigate | O spec não chama `console.log`. A senha fictícia aparece só no corpo do login que o teste envia. | closed |
| T-03-07 | Information disclosure | README.md | medium | mitigate | O README não escreve `JWT_SECRET`, não cola token `eyJ` e não pede para versionar o `.env`. O campo token é o da resposta ao vivo. | closed |
| T-03-08 | Tampering | README e npm run seed | high | mitigate | O texto manda copiar `.env.example` sem editar e não pede outro nome de banco. Não há `DB_DATABASE=` no README. | closed |
| T-03-09 | Denial of service | scripts/apply-demo-sql.js connect | medium | mitigate | `MAX_ATTEMPTS` é 130, com intervalo de 1000 ms. `errno` 1045 e `ER_ACCESS_DENIED_ERROR` entram no retry. `errno` 1044 permanece no preâmbulo de `CREATE DATABASE`. | closed |
| T-03-10 | Information disclosure | quadro do README | low | accept | O quadro cita só o entregador. O operador já está no SQL versionado da semente, e o dado é fictício. | closed |
| T-03-SC | Tampering | npm ci | high | mitigate | Os dois planos não adicionam pacote. `dependencies` e `devDependencies` não mudam. | closed |

*Status: open · closed · open — abaixo do limiar high (não bloqueia)*
*Severidade: critical > high > medium > low — só ameaças abertas no limiar `high` ou acima entram em `threats_open`*
*Disposition: mitigate · accept · transfer*

---

## Riscos aceitos

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-10 | Omitir o operador no quadro não reduz o que `seed/demo.sql` já publica. O dado é fictício. | Plano 03-02 | 2026-10-11 |

*Riscos aceitos não voltam em auditorias futuras.*

---

## Trilha de auditoria

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-11 | 11 | 11 | 0 | gsd-verify-work |

Classificação no nível ASVS 1, com o registro escrito nos planos 03-01 e 03-02. Nenhuma ameaça aberta no limiar `high`. A checagem foi por leitura dos arquivos citados no registro.

---

## Sign-Off

- [x] Todas as ameaças têm disposition (mitigate / accept / transfer)
- [x] Riscos aceitos documentados no log
- [x] `threats_open: 0` confirmado
- [x] `status: verified` no frontmatter

**Approval:** verified 2026-10-11
