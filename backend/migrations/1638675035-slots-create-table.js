const TABLE_NAME = 'slots'

export async function up (sql) {
  sql`
    CREATE TABLE IF NOT EXISTS ${sql(TABLE_NAME)} (
      id         int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      space_id   int REFERENCES spaces (id) NOT NULL,
      distance   jsonb NOT NULL,
      type       smallint NOT NULL,
      available  boolean DEFAULT true NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at timestamp
    )
  `
}

export async function down (sql) {
  sql`
    DROP TABLE IF EXISTS ${sql(TABLE_NAME)}
  `
}
