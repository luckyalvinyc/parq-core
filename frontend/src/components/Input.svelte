<script>
  import {
    onMount,
    createEventDispatcher
  } from 'svelte'

  // props
  export let id = ''
  export let value = null

  const dispatch = createEventDispatcher()

  function onInput (event) {
    value = $$restProps.type === 'number'
      ? Number(event.target.value)
      : event.target.value

    dispatch('input', {
      value
    })
  }

  onMount(() => {
    if ($$restProps.type === 'number') {
      value = Number($$restProps.min) ?? 1
    }
  })
</script>

<input
  {id}
  {value}
  class="bg-gray-light"
  on:input={onInput}
  {...$$restProps}
>

<style>
  input {
    padding: 0 0.7rem;
  }
</style>
