# API iFarma Backoffice

Esta API é o backoffice iFarma. Você sobe a demo, entra como entregador e confirma a entrega do pedido semeado.

## Primeira subida

Você precisa de Node.js e npm instalados.

Na raiz do repositório, instale as dependências:

```bash
npm install
```

Copie `.env.example` para `.env` sem editar. Não altere o nome do banco.

Suba o MySQL. Com Docker, use o Compose, que sobe a imagem `mysql:8.4.11` de `compose.yaml`:

```bash
docker compose -f compose.yaml up -d
```

Se você já tem um MySQL local que aceita o exemplo, use esse servidor.

Semeie a demo e suba a API:

```bash
npm run seed
npm run start:dev
```

`npm run start:dev` escuta a porta 3000.

## Quadro do entregador

| Campo | Valor |
| --- | --- |
| E-mail | entregador.demo@example.com |
| Senha | Entrega1! |
| Pedido | 1 |
| Código | 4821 |

## Confirmar a entrega

Rode `npm run seed` de novo imediatamente antes dos quatro blocos, mesmo que você já tenha semeado na abertura.

O Swagger está em http://localhost:3000/api. Os blocos valem no PowerShell ou no Git Bash, porque curl sem o sufixo .exe não é o cliente HTTP.

### Login do entregador

A resposta é HTTP 201 e um JSON com `token`.

```bash
curl.exe -sS -w "`nHTTP %{http_code}`n" -X POST http://localhost:3000/auth/loginDelivery -H "Content-Type: application/json" -d '{"email":"entregador.demo@example.com","password":"Entrega1!"}'
```

### Enfileirar o pedido 1

Cole o token do login no lugar de TOKEN. A resposta é HTTP 201 e corpo vazio. A fila ficou em espera.

```bash
curl.exe -sS -w "`nHTTP %{http_code}`n" -X POST http://localhost:3000/deliveryqueue/1 -H "Authorization: Bearer TOKEN"
```

### Código 0000

Cole o token do login no lugar de TOKEN. A resposta é HTTP 400 e `Dados invalidos`.

```bash
curl.exe -sS -w "`nHTTP %{http_code}`n" -X POST http://localhost:3000/deliveryqueue/validateDelivery/1/0000 -H "Authorization: Bearer TOKEN"
```

### Código 4821

Cole o token do login no lugar de TOKEN. A resposta é HTTP 201 e corpo vazio. A mesma entrega ficou concluída.

```bash
curl.exe -sS -w "`nHTTP %{http_code}`n" -X POST http://localhost:3000/deliveryqueue/validateDelivery/1/4821 -H "Authorization: Bearer TOKEN"
```

## Prova do mesmo caminho

`npm run test:delivery` repete o mesmo caminho. A confirmação que você vê é a dos quatro blocos. Depois do comando, o pedido fica concluído, então o próximo percurso manual começa de novo com `npm run seed`.
