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

<Card size="xl" class="hide-scrollbar w-full max-w-none overflow-x-scroll 2xl:col-span-2">
  <div class="mb-2 flex justify-between">
    <Caption title="记录财富"></Caption>
    <a href="/detail" class="regular-btn hover:text-brand text-center text-sm">查阅详情</a>
  </div>
  <Table hoverable={true} striped={true} class="divide-y last:border-b-0">
    <TableHead>
      <TableHeadCell>账户类型</TableHeadCell>
      <TableHeadCell>金额</TableHeadCell>
      <TableHeadCell>时间</TableHeadCell>
      <TableHeadCell>币种</TableHeadCell>
      <TableHeadCell class="flex justify-center">
        <Button size="sm" outline on:click={onAddClick}>
          <span class="text-mark hover:text-brand">新增</span>
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
              on:click={() => {
                onUpdateClick(item)
              }}>
              <span class="hover:text-brand text-black">更新</span>
            </Button>
          </TableBodyCell>
        </TableBodyRow>
      {/each}
      <TableBodyRow>
        <TableBodyCell><strong>总计</strong></TableBodyCell>
        <TableBodyCell>
          <strong class="text-brand">{totalWealth}</strong>
        </TableBodyCell>
        <TableBodyCell>{dayjs().format('YYYY-MM-DD')}</TableBodyCell>
        <TableBodyCell>CNY</TableBodyCell>
        <TableBodyCell class="flex justify-center">
          <Button size="sm" outline on:click={onFightClick}>
            <span class="text-mark hover:text-brand">加油</span>
          </Button>
        </TableBodyCell>
      </TableBodyRow>
    </TableBody>
  </Table>
</Card>
