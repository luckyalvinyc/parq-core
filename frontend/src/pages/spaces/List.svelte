<script context="module">
  import { api } from '../../api'
  import { spaces } from '../../stores'

  export async function preload () {
    const data = await api.spaces.list()

    spaces.set(data.spaces)
  }
</script>

<script>
  import { modal } from '../../stores'
  import CreateForm from './forms/Create.svelte'

  function openModalToCreateSpace () {
    modal.set(CreateForm)
  }
</script>

<section class="container">
  <div on:click={openModalToCreateSpace}>Create</div>

  {#each $spaces as space (space.id)}
    <div>
      <a href="/{space.id}">{space.name}</a>
    </div>
  {/each}
</section>
