<script>
  import { api } from '../api'
  import { slots } from '../stores'

  export let slot

  async function pay (ticket) {
    if (!ticket) return

    const data = await api.tickets.update(ticket.id)

    slots.markAsVacant(data.ticket.slotId)
  }
</script>

  <div
    on:click={() => pay(slot.ticket)}
    class="slot"
    class:available={slot.available}>
    <p>{slot.id}</p>

    {#if slot.ticket}
      <p>{slot.ticket.vehicleId}</p>
    {/if}
  </div>

<style>
  .slot {
    background-color: hotpink;
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  .slot.available {
    color: #000;
    background-color: papayawhip;
  }
</style>
