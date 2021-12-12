/**
 * Converts the first character of the provided `string` to upper case
 *
 * @param {string} string
 * @returns {string}
 */

export function capitalize (string) {
  return string[0].toUpperCase() + string.slice(1)
}
