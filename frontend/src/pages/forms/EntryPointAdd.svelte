<script>
  import { api } from '../../api'
  import { modal, entryPoints } from '../../stores'

  import Input from '../../components/Input.svelte'
  import Button from '../../components/Button.svelte'
  import FormField from '../../components/FormField.svelte'

  // props
  export let spaceId

  let label = ''

  async function onSubmit () {
    const data = await api.spaces.addEntryPoint(spaceId, label)

    entryPoints.update(state => [
      ...state,
      data.entryPoint
    ])

    modal.set(null)
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <FormField
    id="entry_point_label"
    label="Label"
    required
  >
    <Input
      type="text"
      id="entry_point_label"
      bind:value={label}
      required/>
  </FormField>
  <Button type="submit" class="m-t-1rem">add</Button>
</form>
