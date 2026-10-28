// Вспомогательный локальный PostgreSQL-сервер для разработки/проверки в песочнице,
// где нет установленного системного PostgreSQL.
//
// Это WASM-сборка настоящего PostgreSQL 16 (PGlite) + pg wire-протокол из пакета
// @electric-sql/pglite-socket. Он нужен ТОЛЬКО чтобы до проекта мог подключиться
// `prisma migrate dev` / `prisma db seed` / сервер API по обычному DATABASE_URL.
// Никакого SQL для создания таблиц здесь не выполняется — таблицы создаёт Prisma.
//
// Запуск:  node scripts/pg-server.mjs   (данные лежат в ./pgdata, порт 5432)
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const dataDir = process.env.PGLITE_DATA_DIR || './pgdata';
const port = Number(process.env.PGLITE_PORT || 5432);

const pg = await PGlite.create({ dataDir });
const server = new PGLiteSocketServer({ db: pg, host: '127.0.0.1', port, maxConnections: 10 });
await server.start();
console.log(`PGlite (PostgreSQL) listening on ${server.getServerConn()}, dataDir=${dataDir}`);

const shutdown = async () => {
  await server.stop();
  await pg.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
