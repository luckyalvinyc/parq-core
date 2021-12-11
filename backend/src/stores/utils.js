/**
 * A helper function to ease the process of inserting a row
 *
 * @param {import('postgres').Sql} sql
 * @param {object[]|object} rows
 */

export function valuesForInsert (sql, rows) {
  let row = rows

  if (Array.isArray(rows)) {
    row = rows[0]
  }

  const columns = Object.keys(row)
  const args = [rows].concat(columns)

  return sql(...args)
}
