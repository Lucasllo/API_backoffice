---
status: testing
phase: 01-demo-que-autentica
source: [01-VERIFICATION.md]
started: 2026-10-06T02:12:17.000Z
updated: 2026-10-06T02:12:17.000Z
---

## Current Test

number: 1
name: Login da demo no ar
expected: |
  Copiar .env.example para .env, subir o Compose, rodar npm run seed e autenticar o entregador no POST /auth/loginDelivery com entregador.demo@example.com e a senha do comentário da semente. O MySQL escuta só em 127.0.0.1:3306, a API sobe na porta 3000 e o login devolve token, id 1, name Entregador Demo e role 4. O JWT confere com demo-jwt-secret-ifarma, issuer login, audience user e sub userDelivery 1.
awaiting: user response

## Tests

### 1. Login da demo no ar
expected: Copiar .env.example para .env, subir o Compose, rodar npm run seed e autenticar o entregador no POST /auth/loginDelivery com entregador.demo@example.com e a senha do comentário da semente. O MySQL escuta só em 127.0.0.1:3306, a API sobe na porta 3000 e o login devolve token, id 1, name Entregador Demo e role 4. O JWT confere com demo-jwt-secret-ifarma, issuer login, audience user e sub userDelivery 1.
result: [pending]

### 2. Semente de novo zera a fila
expected: Inserir uma linha em deliveryqueue para o pedido 1 e rodar npm run seed de novo. Os ids 1 permanecem, o verificationCode continua 4821, o status continua 6 e a fila desse pedido fica vazia.
result: [pending]

### 3. Pessoa fictícia na demo
expected: Nenhum CPF, telefone ou nome real. E-mails em example.com e documentos 00000000000.
result: [pending]

### 4. Exemplo fora de produção
expected: Host 127.0.0.1, JWT de demonstração e MAIL_* locais. O exemplo não se apresenta como produção.
result: [pending]

### 5. Senha só como hash
expected: O INSERT guarda só o hash bcrypt. A senha em claro fica no comentário.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps

[none yet]
