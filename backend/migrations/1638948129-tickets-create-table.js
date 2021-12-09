const TABLE_NAME = 'tickets'

export async function up (sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
      id         smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      slot_id    int REFERENCES slots (id) NOT NULL,
      vehicle_id varchar REFERENCES vehicles (id) NOT NULL,
      rate       numeric NOT NULL,
      paid       boolean DEFAULT false NOT NULL,
      amount     numeric DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT NULL
    );
  `
}

export async function down (sql) {
  await sql`
    DROP TABLE IF EXISTS ${sql(TABLE_NAME)}
  `
}
