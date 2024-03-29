<script context="module">
  import { api } from '../api'
  import {
    modal,
    slots,
    slot,
    entryPoints
  } from '../stores'

  let spaceId

  /**
   *
   * @param {object} params
   * @param {number} params.spaceId
   */

  export async function preload (params) {
    spaceId = params.spaceId
    const data = await api.spaces.get(spaceId)

    slots.resolve(data.space.slots)
    entryPoints.set(data.space.entryPoints)
  }
</script>

<script>
  import SlotAddForm from './forms/SlotAdd.svelte'
  import TicketIssueForm from './forms/TicketIssue.svelte'
  import EntryPointAddForm from './forms/EntryPointAdd.svelte'
  import Slots from '../components/Slots.svelte'
  import SlotInfo from '../components/SlotInfo.svelte'

  let paid = false
  let amountPaid = 0
  let endedAt

  /**
   * @param {number} entryPointId
   */

  async function openModalForCreatingTicket (entryPointId) {
    modal.set(bind(TicketIssueForm, {
      entryPointId
    }))
  }

  function openModalForAddingSlots () {
    modal.set(bind(SlotAddForm, {
      spaceId,
      entryPoints: $entryPoints
    }))
  }

  function openModalForAddingEntryPoint () {
    modal.set(bind(EntryPointAddForm, {
      spaceId
    }))
  }

  function onSlotSelected (event) {
    if (!event.detail.slot) {
      return
    }

    paid = false
    slot.set(event.detail.slot)
  }

  async function payTicket (event) {
    const {
      ticket,
      numberOfHoursToAdvance
    } = event.detail

    if (!ticket) {
      return
    }

    if (paid) {
      return
    }

    const data = await api.tickets.update(ticket.id, numberOfHoursToAdvance)
    slots.markAsVacant(data.ticket.slotId)

    paid = true
    amountPaid = data.ticket.amount
    endedAt = data.ticket.endedAt
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

<section class="p-6 flex-1">
  <Slots
    slots={$slots}
    on:click={onSlotSelected}
    on:addslots={openModalForAddingSlots}
  />
</section>
<hr>
<section class="entry-points flex items-center h-100% overflow-auto relative">
  <div class="absolute top-0 left-0 m-t-1rem m-l-1rem">
    <button
      on:click={openModalForAddingEntryPoint}
      class="adder text-12px font-700 w-25px h-25px"
    >
      +
    </button>
  </div>
  {#each $entryPoints as entryPoint (entryPoint.id)}
    <div class="m-r-3rem">
      <button
        class="p-x-2rem p-y-0.6rem bg-yellow border-4px border-magenta"
        on:click={() => openModalForCreatingTicket(entryPoint.id)}
        type="button">{entryPoint.label}</button>
    </div>
  {/each}
</section>
<SlotInfo
  {paid}
  {amountPaid}
  {endedAt}
  slot={$slot}
  on:pay={payTicket}
/>

<style>
  .entry-points {
    flex-basis: 25%;
  }
  .entry-points::before, .entry-points::after {
    content: '';
    margin: auto;
  }
</style>
