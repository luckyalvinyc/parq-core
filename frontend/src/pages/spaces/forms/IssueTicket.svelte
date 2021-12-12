<script>
  import { api } from '../../../api'
  import { modal, slots } from '../../../stores'

  // props
  export let entryPointId

  const vehicle = {
    plateNumber: '',
    type: ''
  }

  async function onSubmit () {
    const { ticket } = await api.tickets.create(entryPointId, vehicle)

    slots.markAsOccupied(ticket)

    modal.set(null)
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <div>
    <label for="plate_number">Plate number</label>
    <input type="text" id="plate_number" bind:value={vehicle.plateNumber} required>
  </div>
  <div>
    <label for="type">Type</label>
    <input type="text" id="type" bind:value={vehicle.type} required>
  </div>
  <button type="submit">CREATE</button>
</form>
