<script>
  export let slot
</script>

<div
  class="slot {slot.type}"
  class:available={slot.available}>
</div>

<div>
  <h3>ID: {slot.id}</h3>
  <h3>Type: {slot.type}</h3>

  {#if !slot.available}
    <h3>Rate: {slot.ticket.rate}</h3>
  {/if}
</div>

<style>
  .slot {
    cursor: pointer;
    width: 8rem;
    height: 3rem;
    border-radius: 10px;
    margin-bottom: 0.65rem;
    background-color: #879f84;
  }

  .slot:hover {
    filter: brightness(85%);
  }

  .available {
    background-color: #babebf;
  }

  .slot.small {
    height: calc(var(--base-height) * 1.1);
  }

  .slot.medium {
    height: calc(var(--base-height) * 1.2);
  }

  .slot.large {
    height: calc(var(--base-height) * 1.3);
  }
</style>
