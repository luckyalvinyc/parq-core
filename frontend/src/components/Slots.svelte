<script>
  import { createEventDispatcher } from 'svelte'

  import Slot from './Slot.svelte'

  export let slots = {}

  const dispatch = createEventDispatcher()
</script>

<div class="flex flex-col flex-wrap content-start max-h-330px">
  <button
    on:click={() => dispatch('addslots')}
    class="slot adder bg-white"
    type="button"
  >
    +
  </button>
  {#each Object.entries(slots) as [slotId, slot] (slotId)}
    <Slot {slot} on:click />
  {/each}
</div>
