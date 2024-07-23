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
  import Caption from './Caption.svelte'

  export let options = []
  const dispatch = createEventDispatcher()

  const onChangeClick = (elem) => {
    dispatch('change', elem)
  }

  const onDestroyClick = (elem) => {
    dispatch('destroy', elem)
  }
</script>

<Card size="xl" class="mb-4 w-full max-w-none overflow-x-scroll pb-0 2xl:col-span-2">
  <div class="flex justify-between">
    <Caption title="记录详情"></Caption>
  </div>
  <Table hoverable={true} striped={true} class="divide-y last:border-b-0">
    <TableHead>
      <TableHeadCell class="min-w-24">账户类型</TableHeadCell>
      <TableHeadCell>金额</TableHeadCell>
      <TableHeadCell>时间</TableHeadCell>
      <TableHeadCell>币种</TableHeadCell>
      <TableHeadCell>更新日期</TableHeadCell>
      <TableHeadCell>更新记录</TableHeadCell>
      <TableHeadCell>销毁记录</TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="py-4">
      {#each options as item (item.id)}
        <TableBodyRow>
          <TableBodyCell>{item.type}</TableBodyCell>
          <TableBodyCell>{item.amount}</TableBodyCell>
          <TableBodyCell>{item.datetime}</TableBodyCell>
          <TableBodyCell>{item.currency}</TableBodyCell>
          <TableBodyCell>{dayjs(item.created).format('MM-DD hh:mm')}</TableBodyCell>
          <TableBodyCell>
            <Button
              size="sm"
              outline
              class="hover:text-brand text-black"
              on:click={() => {
                onChangeClick(item)
              }}>
              修改
            </Button>
          </TableBodyCell>
          <TableBodyCell>
            <Button
              size="sm"
              outline
              class="hover:text-brand text-mark"
              on:click={() => {
                onDestroyClick(item)
              }}>
              销毁
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
    </TableBody>
  </Table>
</Card>
