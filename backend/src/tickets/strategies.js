import config from '../../config.js'
import { ONE_DAY_IN_HR } from './constants.js'

/**
 * Computation for the standard rate
 *
 * @param {number} hours
 * @param {number} rate
 * @param {number} [initialHours]
 */

export function standard (hours, rate, initialHours = config.initialHours) {
  if (hours <= initialHours) {
    return 0
  }

  return (hours - initialHours) * rate
}

/**
 * Computation for the overnight rate
 *
 * @param {number} hours
 * @param {number} rate
 * @param {number} [fullDayRate]
 */

export function overnight (hours, rate, fullDayRate = config.rates.fullDay) {
  // remove the fractional part to get the number of days
  const days = hoursToDays(hours)
  const hoursExceeded = hours - daysToHours(days)

  return (hoursExceeded * rate) + (days * fullDayRate)
}

/**
 * Converts hours to days
 *
 * @param {number} hours
 * @returns {number}
 */

function hoursToDays (hours) {
  return Math.floor(hours / ONE_DAY_IN_HR)
}

/**
 * Converts days to hours
 *
 * @param {number} days
 * @returns {number}
 */

function daysToHours (days) {
  return days * ONE_DAY_IN_HR
}
