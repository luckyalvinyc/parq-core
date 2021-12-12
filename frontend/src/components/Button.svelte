<script>
  import { createEventDispatcher } from 'svelte'

  let klass = ''

  export { klass as class }

  /**
   * @type {string}
   */
  export let type = 'button'

  export let disabled = false

  const dispatch = createEventDispatcher()

  const base = 'bg-green hover:bg-green-light'

  function toClass (...names) {
    return names.join(' ')
  }

  function onClick () {
    dispatch('click')
  }

</script>

<button
  {disabled}
  on:click={onClick}
  class={toClass(base, klass)}
  type={type}
>
  <slot />
</button>

<style>
  button {
    text-transform: uppercase;
    padding: 0.5rem 1rem;
    width: 100%;
    border-radius: 8px;
    color: #fff;
    font-weight: 700;
  }

  button:hover {
    transition: background-color 0.2s ease-out;
  }

  button:disabled {
    background-color: #babebf;
  }
</style>
