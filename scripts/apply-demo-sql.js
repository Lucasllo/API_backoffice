const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const RETRYABLE = new Set([
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST',
]);

const MAX_ATTEMPTS = 130;

function assertDatabaseName(name) {
  if (!/^[A-Za-z0-9_]+$/.test(name || '')) {
    throw new Error('DB_DATABASE invalido');
  }
  return name;
}

function isCharsetError(err) {
  const message = String((err && err.message) || '');
  return /charset/i.test(message) || (err && err.code === 'HANDSHAKE_UNKNOWN_CHARSET');
}

function isRetryable(err) {
  if (!err) return false;
  if (RETRYABLE.has(err.code)) return true;
  if (Number(err.errno) === 1045) return true;
  if (err.code === 'ER_ACCESS_DENIED_ERROR') return true;
  return false;
}

function report(err) {
  const dollar = String.fromCharCode(36);
  const hash = new RegExp(
    dollar + '2[aby]' + dollar + '\\d{2}' + dollar + '[./A-Za-z0-9]{53}',
    'g',
  );
  const message = String((err && (err.sqlMessage || err.message)) || err);
  const code = err && err.code ? err.code + ': ' : '';
  console.error(code + message.replace(hash, '[hash]'));
}

function stripComments(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .trim();
}

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }

    if (inSingle) {
      current += ch;
      if (ch === "'" && next === "'") {
        current += next;
        i += 1;
        continue;
      }
      if (ch === "'") inSingle = false;
      continue;
    }

    if (ch === '-' && next === '-') {
      inLineComment = true;
      current += ch;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      current += ch;
      continue;
    }

    if (ch === ';') {
      const text = current.trim();
      if (stripComments(text)) statements.push(text);
      current = '';
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (stripComments(tail)) statements.push(tail);
  return statements;
}

async function connect() {
  let useCharset = true;
  let last;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const options = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    };
    if (useCharset) options.charset = 'utf8mb4';

    try {
      return await mysql.createConnection(options);
    } catch (err) {
      if (useCharset && isCharsetError(err)) {
        useCharset = false;
        attempt -= 1;
        continue;
      }
      if (!isRetryable(err)) throw err;
      last = err;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw last;
}

async function runPreamble(connection, preamble, databaseName) {
  const statements = splitStatements(preamble);

  for (const statement of statements) {
    try {
      await connection.query(statement);
    } catch (err) {
      const code = stripComments(statement);
      const isCreate = /^\s*CREATE\s+DATABASE\b/i.test(code);
      const denied =
        err &&
        (Number(err.errno) === 1044 || err.code === 'ER_DBACCESS_DENIED_ERROR');

      if (isCreate && denied) {
        try {
          await connection.query('USE `' + databaseName + '`');
          continue;
        } catch (useErr) {
          report(useErr);
          process.exit(1);
        }
      }

      report(err);
      process.exit(1);
    }
  }
}

async function main() {
  const databaseName = assertDatabaseName(process.env.DB_DATABASE);
  const sql = fs.readFileSync(path.join(__dirname, '..', 'seed', 'demo.sql'), 'utf8');
  const lines = sql.split(/\r?\n/);
  const markerIndex = lines.findIndex((line) => line.trim() === '-- @schema');

  if (markerIndex < 0) {
    console.error('seed/demo.sql sem marcador -- @schema');
    process.exit(1);
  }

  const preamble = lines.slice(0, markerIndex).join('\n');
  const body = lines.slice(markerIndex + 1).join('\n');
  const connection = await connect();

  try {
    await runPreamble(connection, preamble, databaseName);
    if (stripComments(body)) {
      await connection.query(body);
    }
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  report(err);
  process.exit(1);
});
