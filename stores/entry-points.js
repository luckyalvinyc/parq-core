import { execute } from './utils.js'

export const tableName = 'entry_points'

export async function bulkCreate (labels) {
  const sql = execute()

  return sql`
    INSERT INTO
      ${sql(tableName)} ${sql(labels, 'label')}
  `
}
