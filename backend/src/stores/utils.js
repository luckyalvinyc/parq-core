import sql from '../pg.js'

export function execute (txn) {
  return txn ? txn : sql
}
