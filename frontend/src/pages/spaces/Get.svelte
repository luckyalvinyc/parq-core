<script context="module">
  import { api } from '../../api'
  import { modal, slots } from '../../stores'

  let spaceId
  let entryPoints = []

  /**
   *
   * @param {object} params
   * @param {number} params.spaceId
   */

  export async function preload (params) {
    spaceId = params.spaceId
    const data = await api.spaces.get(spaceId)

    entryPoints = data.entryPoints
    slots.resolve(data.slots)
  }
</script>

<script>
  import AddSlotForm from './forms/AddSlot.svelte'
  import IssueTicketForm from './forms/IssueTicket.svelte'

  /**
   * @param {number} entryPointId
   */

  async function openModalForCreatingTicket (entryPointId) {
    modal.set(bind(IssueTicketForm, {
      entryPointId
    }))
  }

  function openModalForAddingSlots () {
    modal.set(bind(AddSlotForm, {
      spaceId,
      entryPoints
    }))
  }

  async function pay (ticketId) {
    if (!ticketId)  return

    const { ticket } = await api.tickets.update(ticketId)

    slots.markAsVacant(ticket.slotId)
  }

  function bind (Component, props) {
    return function (options) {
      return new Component({
        ...options,
        props: {
          ...props,
          ...options.props
        }
      })
    }
  }
</script>

<button on:click={openModalForAddingSlots}>Add Slot</button>

{#each Object.entries($slots) as [slotId, slot] (slotId)}
  <div
    on:click={() => pay(slot.ticket?.id)}
    class="slot"
    class:available={slot.available}>{slot.id}</div>
{/each}

{#each entryPoints as entryPoint (entryPoint.id)}
  <div>
    <button
      on:click={() => openModalForCreatingTicket(entryPoint.id)}
      type="button">{entryPoint.label}</button>
  </div>
{/each}

<style>
  .slot {
    background-color: hotpink;
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
  }

  .slot.available {
    background-color: papayawhip;
  }
</style>
