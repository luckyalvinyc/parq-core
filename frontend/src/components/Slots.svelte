<script>
  import Slot from './Slot.svelte'

  export let slots = {}
</script>

{#each Object.entries(slots) as [slotId, slot] (slotId)}
  <Slot {slot} />
{/each}
