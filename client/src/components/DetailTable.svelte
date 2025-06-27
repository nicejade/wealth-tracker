<script lang="ts">
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
    Tooltip,
  } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import Caption from './Caption.svelte'
  import SvgIcon from './SvgIcon.svelte'
  import { language } from '../stores'
  import { SUPPORTED_CURRENCIES } from './../helper/constant'

  export let options = []
  export let page: number = 0
  const dispatch = createEventDispatcher()

  const getCurrencyName = (code) => {
    const currency = SUPPORTED_CURRENCIES.find((item) => item.value === code)
    return currency ? $_(`currencys.${currency.value}`, { locale: $language }) : code
  }

  const onChangeClick = (elem) => {
    dispatch('change', elem)
  }

  const onDestroyClick = (elem) => {
    dispatch('destroy', elem)
  }
</script>

<Card size="xl" class="w-full max-w-none shadow-none md:p-4 2xl:col-span-2">
  <div class="mb-4 flex justify-between">
    <Caption title={$_('recordDetails')}></Caption>
  </div>
  {#if options?.length <= 0}
    <div class="my-4 flex w-full items-center justify-center">
      <SvgIcon name="empty" width={184} height={152} />
    </div>
  {:else}
    <Table hoverable={true} striped={true} divClass="relative overflow-x-auto customized-scrollbar">
      <TableHead class="text-sm">
        <TableHeadCell class="min-w-24">{$_('type')}</TableHeadCell>
        <TableHeadCell>{$_('amount')}</TableHeadCell>
        <TableHeadCell>{$_('datetime')}</TableHeadCell>
        <TableHeadCell>{$_('currency')}</TableHeadCell>
        <TableHeadCell>{$_('updateDate')}</TableHeadCell>
        <TableHeadCell>{$_('modifyRecord')}</TableHeadCell>
        <TableHeadCell>{$_('destroyRecord')}</TableHeadCell>
        <TableHeadCell>{$_('remark')}</TableHeadCell>
      </TableHead>
      <TableBody tableBodyClass="py-4">
        {#each options as item, index (item.id)}
          <TableBodyRow>
            <TableBodyCell>{item.alias || item.type}</TableBodyCell>
            <TableBodyCell>{item.amount}</TableBodyCell>
            <TableBodyCell>{dayjs(item.datetime).format('YY-MM-DD')}</TableBodyCell>
            <TableBodyCell>{getCurrencyName(item.currency) + ($language ? '' : '')}</TableBodyCell>
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
            <TableBodyCell>
              <Button size="sm" disabled={!item.note} outline class="hover:text-brand focus:ring-0">
                {$_('remark')}
              </Button>
              {#if item.note}
                <Tooltip type="light" placement="left">{item.note}</Tooltip>
              {/if}
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</Card>
