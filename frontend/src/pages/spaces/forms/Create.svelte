<script>
  import { api } from '../../../api'
  import { modal, spaces } from '../../../stores'

  const space = {
    name: '',
    entryPoints: 3
  }

  async function onSubmit () {
    const data = await api.spaces.create(space)

    spaces.update(state => [...state, data.space])

    history.pushState(undefined, '', `/${data.space.id}`)

    modal.set(null)
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <div>
    <label for="name">Name</label>
    <input type="text" id="name" bind:value={space.name} required>
  </div>
  <div>
    <label for="entry_points"># of entry points</label>
    <input
      id="entry_points"
      type="number"
      bind:value={space.entryPoints}
      min="3"
      required>
  </div>
  <button type="submit">CREATE</button>
</form>
