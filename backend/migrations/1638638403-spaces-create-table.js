const TABLE_NAME = 'spaces'

export async function up (sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
      id           int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name         varchar NOT NULL,
      entry_points int NOT NULL,
      created_at   timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at   timestamptz DEFAULT NULL
    );
  `
}

export async function down (sql) {
  await sql`
    DROP TABLE IF EXISTS ${sql(TABLE_NAME)};
  `
}
