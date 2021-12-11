<script>
  import { onMount, onDestroy } from 'svelte'
  import navaid from 'navaid'

  import { api } from './api'
  import Slot from './Slot.svelte'

  let entryPoints = []
  let slots = []

  // ~~~~~~~~~~
  // Routes
  // ~~~~~~~~~~

  let Page

  const router = navaid('/', on404)
    .listen()

  function on404 () {

  }

  function load (thunk) {
    thunk.then(mod => {
      Page = mod.default
    })
  }

  onMount(async () => {
    const spaces = await api.spaces.list()
    console.log(spaces)
  })

  onDestroy(router.unlisten)
</script>

<main class="h-full">
  <svelte:component this={Page} />

  {#each slots as slot (slot.id)}
    <div>
      <Slot {slot} />
    </div>
  {:else}
    <p>loading</p>
  {/each}
</main>

<style>
  :root {
    --base-height: 3rem;
  }
</style>
