<script>
  import { api } from '../../../api'
  import { modal, spaces } from '../../../stores'

  import Input from '../../../components/Input.svelte'
  import Button from '../../../components/Button.svelte'
  import FormField from '../../../components/FormField.svelte'

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
  <FormField
    id="name"
    label="Name"
    required
  >
    <Input id="name" bind:value={space.name} required />
  </FormField>
  <FormField
    id="entry_points"
    label="# of entry points"
    required
  >
    <input
      id="entry_points"
      type="number"
      bind:value={space.entryPoints}
      min="3"
      required>
  </FormField>
  <Button type="sumit" class="m-t-1rem">create</Button>
</form>

<style>
  input {
    width: 100%;
    padding: 0 0.4rem;
    height: 1.75rem;
    background-color: #e1e1e1;
  }
</style>
