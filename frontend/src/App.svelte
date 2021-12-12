<script>
  import { onDestroy } from 'svelte'
  import navaid from 'navaid'

  import { modal } from './stores'
  import Modal from './components/Modal.svelte'

  // ~~~~~~~~~~
  // Routes
  // ~~~~~~~~~~

  let Page

  const router = navaid('/', on404)
    .on('/', () => load(import('./pages/spaces/List.svelte')))
    .on('/:spaceId', params => load(import('./pages/spaces/Get.svelte'), params))
    .listen()

  function on404 () {

  }

  async function load (promise, params) {
    const mod = await promise

    if (mod.preload) {
      await mod.preload(params)
    }

    Page = mod.default
  }

  onDestroy(router.unlisten)
</script>

<main>
  <Modal component={$modal}/>
  <svelte:component this={Page} />
</main>

<style>
  :root {
    --base-height: 3rem;
  }
</style>
