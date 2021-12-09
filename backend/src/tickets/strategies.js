import config from '../../config.js'
import { ONE_DAY_IN_HR } from './constants.js'

export function standard (hours, rate, initialHours = config.initialHours) {
  if (hours <= initialHours) {
    return 0
  }

  return (hours - initialHours) * rate
}

export function overnight (hours, rate, fullDayRate = config.rates.fullDay) {
  const days = hoursToDays(hours)
  const hoursExceeded = hours - daysToHours(days)

  return (hoursExceeded * rate) + (days * fullDayRate)
}

function hoursToDays (hours) {
  return Math.floor(hours / ONE_DAY_IN_HR)
}

function daysToHours (days) {
  return days * ONE_DAY_IN_HR
}
