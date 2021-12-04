const TABLE_NAME = 'slots'

export async function up (sql) {
  sql`
    CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
      id        serial PRIMARY KEY,
      distance jsonb,
      type     varchar
    )
  `
}

export async function down (sql) {
  sql`
    DROP TABLE IF EXISTS ${sql(TABLE_NAME)}
  `
}
