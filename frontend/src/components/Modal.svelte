<script context="module">
  export function bind (Component, props) {
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
    if (e.key !== 'Escape') {
      return
    }

    close()
  }

  function close () {
    if (!Content) {
      return
    }

    Content = null
  }

</script>

<svelte:window on:keydown={onKeydown} />

{#if Content}
  <section
    on:click|self={close}
    class="c-modal"
  >
    <div class="modal__content">
      <svelte:component this={Content} />
    </div>
  </section>
{/if}

<style>
  .c-modal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    background-color:rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .modal__content {
    max-width: 400px;
    background-color: white;
    border-radius: 10px;
    padding: 1.5rem;
  }
</style>
