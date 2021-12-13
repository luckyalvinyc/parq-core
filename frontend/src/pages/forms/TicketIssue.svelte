<script>
  import { api } from '../../api'
  import { modal, slots } from '../../stores'

  import Input from '../../components/Input.svelte'
  import Button from '../../components/Button.svelte'
  import FormField from '../../components/FormField.svelte'
  import SelectTypes from '../../components/SelectTypes.svelte'

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
  <FormField
    id="plate_number"
    label="Plate number"
    required
  >
    <Input
      id="plate_number"
      bind:value={vehicle.plateNumber}
      required />
  </FormField>

  <FormField
    id="type"
    label="Type"
    required
  >
    <SelectTypes id="vehicle_type" bind:value={vehicle.type} />
  </FormField>
  <Button type="sumit" class="m-t-1rem">create</Button>
</form>
