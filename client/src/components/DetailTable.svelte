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
  import { language, customCurrencies } from '../stores'
  import { SUPPORTED_CURRENCIES } from './../helper/constant'
  import { getCurrencySymbol } from './../helper/utils'

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
  <div class="mb-4 flex flex-row gap-3 sm:flex-row sm:items-start sm:justify-between">
    <Caption title={$_('recordDetails')}></Caption>
    <a href="/" class="regular-btn focus-visible-ring !min-w-fit">
      {$_('backToHomepage')}
    </a>
  </div>
  {#if options?.length <= 0}
    <div class="my-4 flex w-full items-center justify-center">
      <SvgIcon name="empty" width={186} height={154} />
    </div>
  {:else}
    <Table hoverable={true} striped={true} divClass="relative overflow-x-auto customized-scrollbar">
      <TableHead class="text-sm">
        <TableHeadCell class="min-w-24 p-5">{$_('account')}</TableHeadCell>
        <TableHeadCell class="p-5">{$_('amount')}</TableHeadCell>
        <TableHeadCell class="p-5">{$_('datetime')}</TableHeadCell>
        <TableHeadCell class="p-5">{$_('currency')}</TableHeadCell>
        <TableHeadCell class="p-5">{$_('updateDate')}</TableHeadCell>
        <TableHeadCell class="p-5">{$_('modifyRecord')}</TableHeadCell>
        <TableHeadCell class="p-5">{$_('destroyRecord')}</TableHeadCell>
        <TableHeadCell class="min-w-20 p-5">{$_('tags')}</TableHeadCell>
        <TableHeadCell class="p-5">{$_('remark')}</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each options as item, index (item.id)}
          <TableBodyRow>
            <TableBodyCell class="p-5">{item.alias || item.type}</TableBodyCell>
            <TableBodyCell class="p-5">
              <span
                class="text-brand border-brand me-1 inline-flex items-center rounded-sm border bg-yellow-50 px-1 py-0.5 text-xs font-medium">
                {getCurrencySymbol(item.currency, $customCurrencies)}
              </span>
              {item.amount}
            </TableBodyCell>
            <TableBodyCell class="p-5">
              {dayjs(item.datetime).format('YY-MM-DD')}
            </TableBodyCell>
            <TableBodyCell class="p-5">
              {getCurrencyName(item.currency) + ($language ? '' : '')}
            </TableBodyCell>
            <TableBodyCell class="p-5">
              {dayjs(item.created).format('MM-DD HH:mm')}
            </TableBodyCell>
            <TableBodyCell class="p-5">
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
            <TableBodyCell class="p-5">
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
            <TableBodyCell class="p-5">
              <p
                style="max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {item.tags || '-'}
              </p>
              {#if item.note}
                <Tooltip type="light" placement="left">{item.tags}</Tooltip>
              {/if}
            </TableBodyCell>
            <TableBodyCell class="p-5">
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
