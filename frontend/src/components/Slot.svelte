<script>
  import { createEventDispatcher } from 'svelte'

  export let slot

  const dispatch = createEventDispatcher()

  function onClick () {
    dispatch('click', {
      slot
    })
  }
</script>

<div
  on:click={onClick}
  class="slot bg-white {slot.type} cursor-pointer"
  class:occupied={!slot.available}
>
  <span>{slot.id}</span>
</div>

<style>
  .slot:hover {
    background-color: #e5e1d6;
  }
  .slot.small {
    border: 2px solid #fdc04e;
  }

  .slot.medium {
    border: 2px solid #b4dcea;
  }

  .slot.large {
    border: 2px solid #ca3422;
  }

  .occupied {
    color: #fdc04e;
    background-color: #90a68e;
  }
  .occupied:hover {
    background-color: #879f84;
  }
</style>
