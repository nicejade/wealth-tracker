<script>
  import { createEventDispatcher } from 'svelte'
  import dayjs from 'dayjs'
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
  import { notice } from '../../stores'

  export let options = []
  let totalWealth = 0
  const dispatch = createEventDispatcher()

  $: totalWealth = options.reduce((sum, item) => sum + item.amount, 0).toFixed(2)

  const onUpdateClick = (elem) => {
    dispatch('update', elem)
  }

  const onAddClick = (elem) => {
    dispatch('add', elem)
  }

  const onFightClick = () => {
    notice.set('应无所住，而生其心')
  }
</script>

<Card
  size="xl"
  class="hide-scrollbar w-full max-w-none overflow-x-scroll shadow-none 2xl:col-span-2">
  <div class="mb-2 flex justify-between">
    <Caption title={$_('recordAssets')}></Caption>
    <a href="/detail" class="regular-btn hover:text-brand text-center text-sm">
      {$_('viewDetails')}
    </a>
  </div>
  <Table hoverable={true} striped={true} class="divide-y last:border-b-0">
    <TableHead>
      <TableHeadCell>{$_('accountType')}</TableHeadCell>
      <TableHeadCell>{$_('amount')}</TableHeadCell>
      <TableHeadCell>{$_('datetime')}</TableHeadCell>
      <TableHeadCell>{$_('currency')}</TableHeadCell>
      <TableHeadCell class="flex justify-center">
        <Button class="focus:ring-0" size="sm" outline on:click={onAddClick}>
          <span class="text-mark hover:text-brand">{$_('addition')}</span>
        </Button>
      </TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="py-4">
      {#each options as item (item.type)}
        <TableBodyRow>
          <TableBodyCell>{item.type}</TableBodyCell>
          <TableBodyCell>{item.amount}</TableBodyCell>
          <TableBodyCell>{item.datetime}</TableBodyCell>
          <TableBodyCell>{item.currency}</TableBodyCell>
          <TableBodyCell class="flex justify-center">
            <Button
              size="sm"
              outline
              class="focus:ring-0"
              on:click={() => {
                onUpdateClick(item)
              }}>
              <span class="hover:text-brand text-black">{$_('update')}</span>
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
      <TableBodyRow>
        <TableBodyCell><strong>{$_('total')}</strong></TableBodyCell>
        <TableBodyCell>
          <strong class="text-brand">{totalWealth}</strong>
        </TableBodyCell>
        <TableBodyCell>{dayjs().format('YYYY-MM-DD')}</TableBodyCell>
        <TableBodyCell>CNY</TableBodyCell>
        <TableBodyCell class="flex justify-center">
          <Button size="sm" outline class="focus:ring-0" on:click={onFightClick}>
            <span class="text-mark hover:text-brand">{$_('keepGoing')}</span>
          </Button>
        </TableBodyCell>
      </TableBodyRow>
    </TableBody>
  </Table>
</Card>
