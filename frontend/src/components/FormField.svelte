<script>
  /**
   * @type {string}
   */
  let klass = ''

  export { klass as class }

  /**
   * @type {string}
   */
  export let label = ''

  /**
   * @type {string}
   */
  export let id = ''

  /**
   * @type {boolean}
   */
  export let required = false

  let base = "field flex m-b-0.5rem"

  base = base.concat(' ').concat(klass)
</script>

<div class={base}>
  <div class="c-label">
    <label for={id}>
      {label} {#if required}<span class="required">*</span>{/if}
    </label>
  </div>
  <div class="flex-1">
    <slot />
  </div>
</div>

<style>
  label {
    vertical-align: middle;
  }

  .c-label {
    flex-basis: 40%;
  }

  .required {
    color: #c43361;
  }
</style>
