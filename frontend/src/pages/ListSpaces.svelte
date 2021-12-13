<script context="module">
  import { api } from '../api'
  import { spaces } from '../stores'

  export async function preload () {
    const data = await api.spaces.list()

    spaces.set(data.spaces)
  }
</script>

<script>
  import { modal } from '../stores'
  import SpaceCreateForm from './forms/SpaceCreate.svelte'

  function openModalToCreateSpace () {
    modal.set(SpaceCreateForm)
  }
</script>

<section class="container p-6 flex">
  <button
    class="space adder"
    type="button"
    on:click={openModalToCreateSpace}
  >
    +
  </button>

  {#each $spaces as space (space.id)}
    <a
      href="/{space.id}"
      class="space flex color-white bg-magenta border-magenta"
    >
      {space.name}
    </a>
  {/each}
</section>

<style>
  .space {
    width: 105px;
    height: 65px;
    margin-right: 1rem;
    justify-content: center;
    align-items: center;
  }
</style>
