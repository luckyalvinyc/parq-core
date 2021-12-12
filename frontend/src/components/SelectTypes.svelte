<script>
  // props
  export let id = ''

  export let value = ''

  const types = [
    'small',
    'medium',
    'large'
  ]

  function onChange (event) {
    value = event.target.value
  }

  function capitalize (string) {
    return string[0].toUpperCase() + string.slice(1)
  }
</script>

<select
  {id}
  {value}
  on:change={onChange}
  class="bg-gray-light"
  required
>
  {#each types as type}
    <option value={type}>{capitalize(type)}</option>
  {/each}
</select>
