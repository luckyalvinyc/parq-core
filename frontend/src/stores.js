import { writable } from 'svelte/store'

export const modal = writable(null)

export const spaces = writable([])
export const slots = createSlots()

function createSlots () {
  const { subscribe, set, update } = writable({})

  function add (slots) {
    const byIds = {}

    for (const slot of slots) {
      byIds[slot.id] = slot
    }

    update(state => ({
      ...state,
      ...byIds
    }))
  }

  /**
   *
   * @param {object[]} slots
   * @param {number} slots[].id
   * @param {string} slots[].type
   * @param {boolean} slots[].available
   */

  function resolve (slots) {
    const byIds = {}

    for (const slot of slots) {
      byIds[slot.id] = slot
    }

    set(byIds)
  }

  function markAsOccupied (ticket) {
    const { slotId } = ticket

    update(slots => {
      const slot = slots[slotId]

      return {
        ...slots,
        [slotId]: {
          ...slot,
          available: false,
          ticket
        }
      }
    })
  }

  function markAsVacant (slotId) {
    update(slots => {
      const slot = slots[slotId]

      return {
        ...slots,
        [slotId]: {
          ...slot,
          available: true,
          ticket: null
        }
      }
    })
  }

  return {
    subscribe,

    add,
    resolve,
    markAsOccupied,
    markAsVacant
  }
}
