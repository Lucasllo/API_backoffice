---
status: complete
phase: 01-demo-que-autentica
source: [01-01-SUMMARY.md]
started: 2026-10-05T22:45:00.000Z
updated: 2026-10-05T23:17:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Teste de partida a frio
expected: Encerre qualquer servidor ou serviço em execução. Limpe estado efêmero (bancos temporários, caches, arquivos de lock). Suba a aplicação do zero. O servidor inicia sem erro, a semente conclui, e uma consulta primária (health check, página inicial ou chamada básica da API) devolve dados vivos.
result: pass

### 2. Confirmação dos critérios cobertos automaticamente
expected: Os três critérios abaixo já passaram na verificação registrada no plano. Confirme se isso corresponde ao que você observa. D1 (ENV-02): MySQL 8.4.11 a partir do ambiente de exemplo, preso a 127.0.0.1, com dotenv carregado antes do AppModule. Coberto por docker compose up mysql:8.4.11 healthy on 127.0.0.1:3306 e o primeiro import de src/main.ts sendo dotenv/config. D2 (SEED-01): a semente versionada insere a loja 2312, o operador, o entregador, o cliente e o pedido 1 com verificationCode 4821, e uma segunda execução deixa esse pedido sem linha em deliveryqueue. Coberto por node scripts/apply-demo-sql.js duas vezes (seed-ok) e npm run seed depois de uma fila artificial (reseed-ok). D3 (SEED-02): POST /auth/loginDelivery do entregador semeado devolve token, id 1, nome Entregador Demo e role 4, e o JWT confere com o segredo de demonstração. Coberto por nest start e POST /auth/loginDelivery com login-ok antes e depois de npm run seed.
result: pass

### 3. MySQL 8.4.11 from the example env, bound to 127.0.0.1, with dotenv loaded before AppModule.
expected: MySQL 8.4.11 from the example env, bound to 127.0.0.1, with dotenv loaded before AppModule.
result: pass
source: automated
coverage_id: D1

### 4. Versioned seed inserts store 2312, operator, delivery user, client and order 1 with verificationCode 4821, and a second run leaves that order with no deliveryqueue row.
expected: Versioned seed inserts store 2312, operator, delivery user, client and order 1 with verificationCode 4821, and a second run leaves that order with no deliveryqueue row.
result: pass
source: automated
coverage_id: D2

### 5. POST /auth/loginDelivery for the seeded delivery user returns token, id 1, name Entregador Demo and role 4, and the JWT verifies with the demo secret.
expected: POST /auth/loginDelivery for the seeded delivery user returns token, id 1, name Entregador Demo and role 4, and the JWT verifies with the demo secret.
result: pass
source: automated
coverage_id: D3

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
