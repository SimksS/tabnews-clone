import database from "infra/database.js";

async function status(request, response) {
  const dbVersion = await database.query("SHOW server_version;");
  const dbVersionString = dbVersion.rows[0].server_version;

  const dbMaxConnectionsResult = await database.query("SHOW max_connections;");
  const dbMaxConnectionsValue = dbMaxConnectionsResult.rows[0].max_connections;
  const dbName = process.env.POSTGRES_DB;
  const dbOpenConnectionsResult = await database.query({
    text: `SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;`,
    values: [dbName]
  });
  const dbOpenConnectionsValue = dbOpenConnectionsResult.rows[0].count;

  const updatedAt = new Date().toISOString();
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: dbVersionString,
        max_connections: Number(dbMaxConnectionsValue),
        opened_connections: dbOpenConnectionsValue,
      },
    },
  });
}

export default status;
