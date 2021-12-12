import { writable } from 'svelte/store'

export const modal = writable(null)

export const spaces = writable([])
export const slots = createSlots()

// the selected slot that will also show the ticket info
export const slot = writable(null)

function createSlots () {
  const { subscribe, set, update } = writable({})

  /**
   * Adds the provided `slots` to the list of slots
   *
   * @param {object[]} slots
   * @param {number} slots[].id
   */

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
   * Sets the slots by their IDs
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

  /**
   * Marks a slot as occupied in which the `available` status will be `false`
   *
   * @param {object} ticket
   * @param {number} ticket.slotId
   */

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

  /**
   * Marks a slot as vacant in which the `available` status will be `true`
   *
   * @param {object} slotId
   */

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
