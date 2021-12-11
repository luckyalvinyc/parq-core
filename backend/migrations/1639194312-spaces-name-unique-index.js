const TABLE_NAME = 'spaces'
const INDEX_NAME = 'spaces_name_unique_idx'

export async function up (sql) {
  await sql`
    CREATE UNIQUE INDEX
      ${sql(INDEX_NAME)}
    ON ${sql(TABLE_NAME)} (lower(name));
  `
}

export async function down (sql) {
  await sql`
    DROP INDEX IF EXISTS ${sql(INDEX_NAME)};
  `
}
