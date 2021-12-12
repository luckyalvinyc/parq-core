<script>
  import dayjs from 'dayjs'
  import duration from 'dayjs/plugin/duration'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { createEventDispatcher } from 'svelte'

  import { capitalize } from '../utils'
  import Input from './Input.svelte'
  import Button from './Button.svelte'
  import FormField from './FormField.svelte'

  // props
  export let slot = null
  export let paid = false
  export let amountPaid = 0
  export let endedAt

  dayjs.extend(duration)
  dayjs.extend(relativeTime)

  const dispatch = createEventDispatcher()

  let numberOfHoursToAdvance

  function formatDate () {
    return dayjs(slot.ticket.startedAtd).format('YYYY-MM-DD hh:mm:ss a')
  }

  function formatAmount () {
    return new Intl.NumberFormat('en-PH', {
      currency: 'PHP'
    }).format(amountPaid)
  }

  function durationParked () {
    const startedAtd = dayjs(slot.ticket.startedAt)
    const endedAtd = dayjs(endedAt)

    return dayjs.duration(endedAtd.diff(startedAtd)).humanize()
  }

  function close () {
    slot = null
  }

  function onPay (ticket) {
    if (!ticket) {
      return
    }

    dispatch('pay', {
      ticket,
      numberOfHoursToAdvance
    })
  }
</script>

<aside class="p-1rem flex flex-col justify-between" class:show={slot}>
  {#if slot}
    <span class="close" on:click={close} />
    <div>
      <FormField label="ID">
        {slot.id}
      </FormField>
      <FormField label="Slot type">
        {capitalize(slot.type)}
      </FormField>

      <hr class="m-y-1rem">

      {#if slot.ticket}
        <FormField label="Plate number">
          {slot.ticket.vehicle.id}
        </FormField>
        <FormField label="Vehicle type">
          {capitalize(slot.ticket.vehicle.type)}
        </FormField>
        <FormField label="Rate">
          {slot.ticket.rate}/hr
        </FormField>
        <FormField label="Time started">
          {formatDate()}
        </FormField>
      {/if}
    </div>

    {#if slot.ticket}
      <div>
        {#if paid}
          <div class="m-b-4.5rem text-center">
            <h2 class="text-3rem font-700 color-green">{formatAmount()} PHP</h2>
            <div class="flex flex-col color-gray-dark">
              <span>Amount paid</span>
              <span class="text-12px m-t-1rem">Thank for staying with us for {durationParked()}</span>
              <span class="text-12px">Keep safe always ❤️</span>
            </div>
          </div>
        {/if}
        <form on:submit|preventDefault={() => onPay(slot.ticket)}>
          {#if !paid}
            <FormField
              label="Advance time"
              class="m-b-2.5rem w-285px"
            >
              <Input
                type="number"
                min="0"
                bind:value={numberOfHoursToAdvance}
              />
            </FormField>
          {/if}
          <Button
            type="submit"
            disabled={paid}
          >
            {paid ? 'paid 💸' : 'pay'}
          </Button>
        </form>
      </div>
    {/if}
  {/if}
</aside>

<style>
  :root {
    --base-width: 320px;
  }

  aside {
    position: fixed;
    top: 0;
    right: calc(var(--base-width) * -1);
    height: 100%;
    min-width: var(--base-width);
    background-color: white;
    transition: 0.1s;
  }

  aside.show {
    right: 0;
    transition: 0.2s;
    box-shadow: -9px 0px 15px -8px rgba(0, 0, 0, 0.5);
  }

  h2 {
    line-height: 1
  }

  .close {
    cursor: pointer;
    position: absolute;
    width: 30px;
    height: 30px;
    left: -30px;
    background: #fff;
    box-shadow: -9px 0px 15px -8px rgba(0, 0, 0, 0.5);
  }
  .close::before, .close::after {
    content: '';
    position: absolute;
    display: block;
    background-color: currentColor;
    width: 13px;
    height: 2px;
    top: 14px;
    left: 10px;
  }
  .close::before {
    transform: rotate(-45deg);
  }
  .close::after {
    transform: rotate(45deg);
  }
</style>
