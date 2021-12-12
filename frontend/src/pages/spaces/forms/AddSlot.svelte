<script>
  import { api } from '../../../api'
  import { modal, slots } from '../../../stores'

  // props
  export let spaceId
  export let entryPoints = []

  let slotInputs = [{
    type: '',
    distance: {}
  }]

  async function onSubmit () {
    const data = await api.spaces.update(spaceId, slotInputs)

    slots.add(data.slots)

    modal.set(null)
  }

  function addSlot () {
    slotInputs = slotInputs.concat({
      type: '',
      distance: {}
    })
  }

  function createId (id) {
    return 'ep_id_' + id
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  {#each slotInputs as slot}
    <div>
      <label for="type">Type</label>
      <input type="text" id="type" bind:value={slot.type} required>
    </div>
    {#each entryPoints as entryPoint (entryPoint.id)}
      <div>
        <label for={createId(entryPoint.id)}>{entryPoint.label}</label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          id={createId(entryPoint.id)}
          bind:value={slot.distance[entryPoint.id]}>
      </div>
    {/each}
  {/each}
  <button type="button" on:click={addSlot}>+</button>
  <button type="submit">ADD</button>
</form>
