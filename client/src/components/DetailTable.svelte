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
  import Caption from './Caption.svelte'
  import SvgIcon from './SvgIcon.svelte'

  export let options = []
  export let page = 0
  const dispatch = createEventDispatcher()

  const onChangeClick = (elem) => {
    dispatch('change', elem)
  }

  const onDestroyClick = (elem) => {
    dispatch('destroy', elem)
  }
</script>

<Card size="xl" class="w-full max-w-none shadow-none 2xl:col-span-2">
  <div class="flex justify-between">
    <Caption title={$_('recordDetails')}></Caption>
  </div>
  {#if page}
    <Table hoverable={true} striped={true} divClass="relative overflow-x-auto customized-scrollbar">
      <TableHead>
        <TableHeadCell class="min-w-24">{$_('accountType')}</TableHeadCell>
        <TableHeadCell>{$_('alias')}</TableHeadCell>
        <TableHeadCell>{$_('amount')}</TableHeadCell>
        <TableHeadCell>{$_('datetime')}</TableHeadCell>
        <TableHeadCell>{$_('currency')}</TableHeadCell>
        <TableHeadCell>{$_('updateDate')}</TableHeadCell>
        <TableHeadCell>{$_('modifyRecord')}</TableHeadCell>
        <TableHeadCell>{$_('destroyRecord')}</TableHeadCell>
      </TableHead>
      <TableBody tableBodyClass="py-4">
        {#each options as item, index (item.id)}
          <TableBodyRow>
            <TableBodyCell>{item.type}</TableBodyCell>
            <TableBodyCell>{item.alias}</TableBodyCell>
            <TableBodyCell>{item.amount}</TableBodyCell>
            <TableBodyCell>{item.datetime}</TableBodyCell>
            <TableBodyCell>{item.currency}</TableBodyCell>
            <TableBodyCell>{dayjs(item.created).format('MM-DD hh:mm')}</TableBodyCell>
            <TableBodyCell>
              <Button
                size="sm"
                outline
                disabled={index == 0 && page === 1}
                class="hover:text-brand text-black focus:ring-0"
                on:click={() => {
                  onChangeClick(item)
                }}>
                {$_('modify')}
              </Button>
            </TableBodyCell>
            <TableBodyCell>
              <Button
                size="sm"
                outline
                disabled={index == 0 && page === 1}
                class="hover:text-brand text-mark focus:ring-0"
                on:click={() => {
                  onDestroyClick(item)
                }}>
                {$_('destroy')}
              </Button>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {:else}
    <div class="my-4 flex w-full items-center justify-center">
      <SvgIcon name="empty" width={184} height={152} />
    </div>
  {/if}
</Card>
