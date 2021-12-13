<script>
  import { api } from '../../api'
  import { modal, slots } from '../../stores'

  import Input from '../../components/Input.svelte'
  import Button from '../../components/Button.svelte'
  import FormField from '../../components/FormField.svelte'
  import SelectTypes from '../../components/SelectTypes.svelte'

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

  function addSlotInput () {
    slotInputs = slotInputs.concat({
      type: '',
      distance: {}
    })
  }

  function removeSlotInput (index) {
    slotInputs = [
      ...slotInputs.slice(0, index),
      ...slotInputs.slice(index + 1)
    ]
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <div class="c-entry-points">
  {#each slotInputs as slot, index}
    <div class="p-10px m-b-8px border-2px border-magenta rounded-10px">
      {#if slotInputs.length > 1}
        <button
          on:click={() => removeSlotInput(index)}
          type="button"
          class="remove-slot" />
      {/if}
      <FormField
        id="type-{index}"
        label="Type"
        required
      >
        <SelectTypes
          id="type-{index}"
          bind:value={slot.type} />
      </FormField>
      {#each entryPoints as entryPoint (entryPoint.id)}
        <FormField
          id="entry-{index}-{entryPoint.id}"
          label={entryPoint.label}
        >
          <Input
            type="number"
            min="0"
            max="1"
            step="0.01"
            id="entry-{index}-{entryPoint.id}"
            bind:value={slot.distance[entryPoint.id]} />
        </FormField>
      {/each}
    </div>
  {/each}
  </div>
  <div class="text-right m-b-8px">
    <button type="button" class="adder w-15% text-16px" on:click={addSlotInput}>+</button>
  </div>
  <Button type="submit">add</Button>
</form>

<style>
  .c-entry-points {
    max-height: 750px;
    overflow-y: auto;
    margin-bottom: 4px;
  }

  .remove-slot {
    display: inline-flex;
    border-radius: 50%;
    color: #ca3422;
    width: 25px;
    height: 25px;
    position: relative;
    border: 2px solid currentColor;
  }
  .remove-slot::before, .remove-slot::after {
    content: '';
    position: absolute;
    display: block;
    background-color: currentColor;
    width: 10px;
    height: 2px;
    top: 10px;
    left: 5px;
  }
  .remove-slot::before {
    transform: rotate(-45deg);
  }
  .remove-slot::after {
    transform: rotate(45deg);
  }
</style>
