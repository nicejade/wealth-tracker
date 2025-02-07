<script>
  import { createEventDispatcher } from 'svelte'
  import {
    Button,
    Card,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import Caption from '../Caption.svelte'
  import confetti from 'canvas-confetti'
  import { randomInRange } from './../../helper/utils'

  export let options = []
  let totalWealth = 0
  const dispatch = createEventDispatcher()

  $: totalWealth = options.reduce((sum, item) => sum + item.amount, 0).toFixed(2)

  const fireConfetti = (opts) => {
    const scalar = randomInRange(1.1, 2)
    const dollar = confetti.shapeFromText({ text: '💸', scalar })
    const money = confetti.shapeFromText({ text: '💰', scalar })
    const defaults = {
      angle: randomInRange(81, 99),
      shapes: ['circle', 'circle', 'square', dollar, money],
      spread: randomInRange(66, 99),
      particleCount: randomInRange(39, 269),
      startVelocity: randomInRange(39, 69),
      drift: randomInRange(-0.1, 0.1),
      ticks: randomInRange(180, 220),
      origin: { x: randomInRange(0.49, 0.51), y: 0.6 },
      scalar,
    }
    confetti({
      ...defaults,
      ...opts,
    })
  }

  const onUpdateClick = (elem) => {
    dispatch('update', elem)
  }

  const onDestroyClick = (elem) => {
    dispatch('destroy', elem)
  }

  const onAddClick = (elem) => {
    dispatch('add', elem)
  }

  const onPersistClick = () => {
    fireConfetti({ spread: 30, startVelocity: 60, decay: 0.9 })
    fireConfetti({ spread: 60, startVelocity: 30, decay: 0.91 })
    fireConfetti({ spread: 120, startVelocity: 50, decay: 0.92 })
    fireConfetti({ spread: 120, startVelocity: 10, decay: 0.93 })
  }

  const onResetClick = () => {
    dispatch('reset')
  }
</script>

<Card
  size="xl"
  class="hide-scrollbar w-full  max-w-none overflow-x-scroll shadow-none md:p-4 2xl:col-span-2">
  <div class="mb-2 flex justify-between">
    <Caption title={$_('recordAssets')}></Caption>
    <a href="/detail" class="regular-btn hover:text-brand text-center text-sm">
      {$_('viewDetails')}
    </a>
  </div>
  <Table hoverable={true} striped={true} class="divide-y last:border-b-0">
    <TableHead class="text-sm">
      <TableHeadCell>{$_('type')}</TableHeadCell>
      <TableHeadCell>{$_('amount')}</TableHeadCell>
      <TableHeadCell>{$_('currency')}</TableHeadCell>
      <TableHeadCell>
        <Button class="border-none focus:ring-0" size="sm" outline on:click={onAddClick}>
          <span class="text-mark hover:text-brand animate-bounce whitespace-nowrap font-bold">
            {$_('addition')}
          </span>
        </Button>
      </TableHeadCell>
      <TableBodyCell><span class="px-4 py-2">{$_('action')}</span></TableBodyCell>
    </TableHead>
    <TableBody tableBodyClass="py-4">
      {#each options as item (item.type)}
        <TableBodyRow>
          <TableBodyCell>{item.alias || item.type}</TableBodyCell>
          <TableBodyCell>{item.amount}</TableBodyCell>
          <TableBodyCell>{item.currency}</TableBodyCell>
          <TableBodyCell>
            <Button
              size="sm"
              outline
              class="border-none focus:ring-0"
              on:click={() => {
                onUpdateClick(item)
              }}>
              <span class="hover:text-brand text-mark">{$_('update')}</span>
            </Button>
          </TableBodyCell>
          <TableBodyCell>
            <Button
              size="sm"
              outline
              class="border-none focus:ring-0"
              on:click={() => {
                onDestroyClick(item)
              }}>
              <span class="hover:text-brand text-mark">{$_('destroy')}</span>
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
      <TableBodyRow>
        <TableBodyCell><strong>{$_('total')}</strong></TableBodyCell>
        <TableBodyCell>
          <strong class="text-brand">{totalWealth}</strong>
        </TableBodyCell>
        <TableBodyCell>CNY</TableBodyCell>
        <TableBodyCell>
          <Button size="sm" outline class="border-none focus:ring-0" on:click={onPersistClick}>
            <span class="text-mark hover:text-brand">{$_('persist')}</span>
          </Button>
        </TableBodyCell>
        <TableBodyCell>
          <Button size="sm" outline class="border-none focus:ring-0" on:click={onResetClick}>
            <span class="text-mark hover:text-brand">{$_('reset')}</span>
          </Button>
        </TableBodyCell>
      </TableBodyRow>
    </TableBody>
  </Table>
</Card>
