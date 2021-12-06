const TABLE_NAME = 'tickets'

export async function up (sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
      id         smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      slot_id    int REFERENCES slots (id) NOT NULL,
      rate       numeric NOT NULL,
      paid       boolean DEFAULT false NOT NULL,
      started_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      ended_at   timestamp
    )
  `
}

export async function down (sql) {
  await sql`
    DROP TABLE IF EXISTS ${sql(TABLE_NAME)}
  `
}
