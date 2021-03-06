const TABLE_NAME = 'vehicles'

export async function up (sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
      id         varchar PRIMARY KEY,
      type       smallint NOT NULL,
      created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamptz DEFAULT NULL
    )
  `
}

export async function down (sql) {
  await sql`
    DROP TABLE IF EXISTS ${sql(TABLE_NAME)}
  `
}
