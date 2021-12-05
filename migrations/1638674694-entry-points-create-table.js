const TABLE_NAME = 'entry_points'

export async function up (sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
      id    smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      label varchar NOT NULL
    )
  `
}

export async function down (sql) {
  await sql`
    DROP TABLE IF EXISTS ${sql(TABLE_NAME)}
  `
}
