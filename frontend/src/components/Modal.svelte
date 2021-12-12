<script>
  import { onMount } from 'svelte'

  // props
  export let component

  let Content = null
  let isMounted = false

  onMount(() => {
    isMounted = true
  })

  $: {
    if (isMounted) {
      Content = component
    }
  }

  function onKeydown (e) {
    if (!Content) {
      return
    }

    if (e.key !== 'Escape') {
      return
    }

    Content = null
  }

</script>

<svelte:window on:keydown={onKeydown} />

{#if Content}
  <section class="c-modal">
    <div class="modal__content">
      <svelte:component this={Content} />
    </div>
  </section>
{/if}

<style>
  .c-modal {
    display: flex;
    position: fixed;
    z-index: 100;
    background-color:rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .modal__content {
    min-width: 400px;
    background-color: white;
    border-radius: 10px;
    padding: 1.5rem;
  }
</style>
