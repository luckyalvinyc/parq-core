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
  import { error } from '../stores'

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
    <div
      class="modal__content"
      class:shake={$error}
    >
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
    width: 100%;
    background-color: white;
    border-radius: 10px;
    padding: 1.5rem;
  }

  /* https://css-tricks.com/snippets/css/shake-css-keyframe-animation */
  .modal__content.shake {
    animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {
    10%, 90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%, 80% {
      transform: translate3d(2px, 0, 0);
    }

    30%, 50%, 70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%, 60% {
      transform: translate3d(4px, 0, 0);
    }
  }
</style>
