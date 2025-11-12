<script lang="ts">
  import { onMount } from 'svelte'
  import {
    Button,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import { Modal } from 'flowbite-svelte'
  import {
    getAllCustomCurrencies,
    createCustomCurrency,
    updateCustomCurrency,
    deleteCustomCurrency,
  } from '../helper/apis'
  import { alert, customCurrencies } from '../stores'
  import { fetchExchangeRates } from '../helper/utils'

  let currencies: any[] = []
  let loading = false
  let editingId: number | null = null
  let isAddingNew = false
  let editingCurrency: any = {
    code: '',
    symbol: '',
    name: '',
    exchangeRate: 1,
    isActive: true,
  }

  onMount(async () => {
    await loadCurrencies()
  })

  const loadCurrencies = async () => {
    try {
      loading = true
      const response: any = await getAllCustomCurrencies()
      if (response.success) {
        currencies = response.data || []
        // 更新 store，只包含启用的货币
        const activeCurrencies = currencies.filter((c) => c.isActive !== false)
        customCurrencies.set(activeCurrencies)
      }
    } catch (error) {
      console.error('Failed to load custom currencies:', error)
    } finally {
      loading = false
    }
  }

  const startEdit = (currency: any) => {
    editingId = currency.id
    isAddingNew = false
    editingCurrency = { ...currency }
  }

  const cancelEdit = () => {
    editingId = null
    isAddingNew = false
    editingCurrency = {
      code: '',
      symbol: '',
      name: '',
      exchangeRate: 1,
      isActive: true,
    }
  }

  const saveCurrency = async () => {
    try {
      if (!editingCurrency.code || !editingCurrency.symbol) {
        alert.set($_('customCurrency.validation.codeSymbolRequired'))
        return
      }

      if (!editingCurrency.exchangeRate || editingCurrency.exchangeRate <= 0) {
        alert.set($_('customCurrency.validation.ratePositive'))
        return
      }

      loading = true
      let response: any

      if (editingId) {
        response = await updateCustomCurrency(editingId, editingCurrency)
      } else {
        response = await createCustomCurrency(editingCurrency)
      }

      if (response.success) {
        await loadCurrencies()
        // 重新获取汇率以包含新的自定义货币
        await fetchExchangeRates()
        cancelEdit()
      } else {
        alert.set(response.message || $_('customCurrency.message.saveFailed'))
      }
    } catch (error: any) {
      console.error('Failed to save currency:', error)
      alert.set(error.message || $_('customCurrency.message.saveFailed'))
    } finally {
      loading = false
    }
  }

  let isShowDeleteModal = false
  let deleteId: number | null = null

  // 点击删除按钮时先打开模态确认框
  const deleteCurrency = (id: number) => {
    deleteId = id
    isShowDeleteModal = true
  }

  // 在模态中确认删除后执行实际删除
  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      loading = true
      const response: any = await deleteCustomCurrency(deleteId)
      if (response.success) {
        await loadCurrencies()
        // 重新获取汇率
        await fetchExchangeRates()
        alert.set(response.message || $_('customCurrency.message.deleteFailed'))
      } else {
        alert.set(response.message || $_('customCurrency.message.deleteFailed'))
      }
    } catch (error: any) {
      console.error('Failed to delete currency:', error)
      alert.set(error.message || $_('customCurrency.message.deleteFailed'))
    } finally {
      loading = false
      isShowDeleteModal = false
      deleteId = null
    }
  }

  const cancelDelete = () => {
    isShowDeleteModal = false
    deleteId = null
  }

  const addNew = () => {
    editingId = null
    isAddingNew = true
    editingCurrency = {
      code: '',
      symbol: '',
      name: '',
      exchangeRate: 1,
      isActive: true,
    }
  }
</script>

<div class="w-full">
  <div class="mb-4 flex items-center justify-between">
    <h4 class="flex items-center gap-2 text-lg font-medium text-gray-900 md:text-base">
      {$_('customCurrency.managerTitle')}
    </h4>
    <button type="button" class="regular-btn" on:click={addNew}>
      {$_('customCurrency.addCurrency')}
    </button>
  </div>

  {#if isAddingNew && editingId === null}
    <!-- 新建表单 -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow">
      <div class="grid grid-cols-1 gap-1">
        <div class="module-warp">
          <label class="custom-label !text-sm" for="new-code">
            {$_('customCurrency.form.codeLabel')}
          </label>
          <input
            type="text"
            id="new-code"
            bind:value={editingCurrency.code}
            placeholder={$_('customCurrency.form.codePlaceholder')}
            class="custom-input text-sm"
            maxlength="10" />
        </div>
        <div class="module-warp">
          <label class="custom-label !text-sm" for="new-symbol">
            {$_('customCurrency.form.symbolLabel')}
          </label>
          <input
            type="text"
            id="new-symbol"
            bind:value={editingCurrency.symbol}
            placeholder={$_('customCurrency.form.symbolPlaceholder')}
            class="custom-input text-sm"
            maxlength="10" />
        </div>
        <div class="module-warp">
          <label class="custom-label !text-sm" for="new-name">
            {$_('customCurrency.form.nameLabel')}
          </label>
          <input
            type="text"
            id="new-name"
            bind:value={editingCurrency.name}
            placeholder={$_('customCurrency.form.namePlaceholder')}
            class="custom-input text-sm" />
        </div>
        <div class="module-warp">
          <label class="custom-label !text-sm" for="new-rate">
            {$_('customCurrency.form.rateLabel')}
          </label>
          <div class="w-full">
            <input
              type="number"
              id="new-rate"
              bind:value={editingCurrency.exchangeRate}
              placeholder={$_('customCurrency.form.ratePlaceholder')}
              step="0.0000000001"
              min="0.0000000001"
              class="custom-input text-sm" />
            <p class="mt-1 text-xs text-gray-500">
              {$_('customCurrency.form.rateHelper', {
                values: { rate: editingCurrency.exchangeRate || 1 },
              })}
            </p>
          </div>
        </div>
        <div class="module-warp">
          <label class="custom-label !text-sm" for="new-active">
            {$_('customCurrency.form.activeLabel')}
          </label>
          <div class="flex items-center gap-3">
            <input
              id="new-active"
              type="checkbox"
              class="text-brand focus:ring-brand h-4 w-4 rounded border-gray-300"
              bind:checked={editingCurrency.isActive} />
            <span class="text-xs text-gray-500">{$_('customCurrency.form.activeHelper')}</span>
          </div>
        </div>
      </div>
      <div class="mt-4 flex w-full justify-center space-x-12">
        <button type="button" class="comfirm-btn" on:click={saveCurrency} disabled={loading}>
          {$_('customCurrency.actions.save')}
        </button>
        <button type="button" class="cancel-btn" on:click={cancelEdit}>
          {$_('customCurrency.actions.cancel')}
        </button>
      </div>
    </div>
  {/if}

  {#if currencies.length > 0}
    <Table class="w-full">
      <TableHead>
        <TableHeadCell class="min-w-[60px] p-3 text-black">
          {$_('customCurrency.table.code')}
        </TableHeadCell>
        <TableHeadCell class="min-w-[50px] p-3 text-black">
          {$_('customCurrency.table.symbol')}
        </TableHeadCell>
        <TableHeadCell class="min-w-[50px] p-3 text-black">
          {$_('customCurrency.table.name')}
        </TableHeadCell>
        <TableHeadCell class="p-3 text-black">{$_('customCurrency.table.rate')}</TableHeadCell>
        <TableHeadCell class="p-3 text-black">{$_('customCurrency.table.status')}</TableHeadCell>
        <TableHeadCell class="p-3 text-black">
          <span class="px-2">{$_('action')}</span>
        </TableHeadCell>
      </TableHead>
      <TableBody>
        {#each currencies as currency (currency.id)}
          {#if editingId === currency.id}
            <!-- 编辑模式 -->
            <TableBodyRow>
              <TableBodyCell colspan={6}>
                <div class="rounded-lg bg-blue-50 p-4 ring-1 ring-blue-200">
                  <div class="grid grid-cols-1 gap-1">
                    <div class="module-warp">
                      <label class="custom-label !text-sm" for="edit-code">
                        {$_('customCurrency.form.codeLabel')}
                      </label>
                      <input
                        type="text"
                        id="edit-code"
                        bind:value={editingCurrency.code}
                        placeholder={$_('customCurrency.form.codePlaceholder')}
                        class="custom-input text-sm"
                        maxlength="10" />
                    </div>
                    <div class="module-warp">
                      <label class="custom-label !text-sm" for="edit-symbol">
                        {$_('customCurrency.form.symbolLabel')}
                      </label>
                      <input
                        type="text"
                        id="edit-symbol"
                        bind:value={editingCurrency.symbol}
                        placeholder={$_('customCurrency.form.symbolPlaceholder')}
                        class="custom-input text-sm"
                        maxlength="10" />
                    </div>
                    <div class="module-warp">
                      <label class="custom-label !text-sm" for="edit-name">
                        {$_('customCurrency.form.nameLabel')}
                      </label>
                      <input
                        type="text"
                        id="edit-name"
                        bind:value={editingCurrency.name}
                        placeholder={$_('customCurrency.form.namePlaceholder')}
                        class="custom-input text-sm" />
                    </div>
                    <div class="module-warp">
                      <label class="custom-label !text-sm" for="edit-rate">
                        {$_('customCurrency.form.rateLabel')}
                      </label>
                      <div class="w-full">
                        <input
                          type="number"
                          id="edit-rate"
                          bind:value={editingCurrency.exchangeRate}
                          placeholder={$_('customCurrency.form.ratePlaceholder')}
                          step="0.0000000001"
                          min="0.0000000001"
                          class="custom-input text-sm" />
                        <p class="mt-1 text-xs text-gray-500">
                          {$_('customCurrency.form.rateHelper', {
                            values: { rate: editingCurrency.exchangeRate || 1 },
                          })}
                        </p>
                      </div>
                    </div>
                    <div class="module-warp">
                      <label class="custom-label !text-sm" for="edit-active">
                        {$_('customCurrency.form.activeLabel')}
                      </label>
                      <div class="flex items-center gap-3">
                        <input
                          id="edit-active"
                          type="checkbox"
                          class="text-brand focus:ring-brand h-4 w-4 rounded border-gray-300"
                          bind:checked={editingCurrency.isActive} />
                        <span class="text-xs text-gray-500">
                          {$_('customCurrency.form.activeHelper')}
                        </span>
                      </div>
                    </div>
                    <div class="mt-4 flex w-full justify-center space-x-12">
                      <button
                        type="button"
                        class="comfirm-btn"
                        on:click={saveCurrency}
                        disabled={loading}>
                        {$_('customCurrency.actions.save')}
                      </button>
                      <button type="button" class="cancel-btn" on:click={cancelEdit}>
                        {$_('customCurrency.actions.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              </TableBodyCell>
            </TableBodyRow>
          {:else}
            <!-- 显示模式 -->
            <TableBodyRow>
              <TableBodyCell class="p-3 text-black">{currency.code}</TableBodyCell>
              <TableBodyCell class="p-3 text-black">
                <span class="border-brand text-brand rounded-sm border px-0.5 py-1">
                  {currency.symbol}
                </span>
              </TableBodyCell>
              <TableBodyCell class="p-3 text-black">{currency.name || '-'}</TableBodyCell>
              <TableBodyCell class="p-3 text-black">{currency.exchangeRate}</TableBodyCell>
              <TableBodyCell class="p-3 text-black">
                <span
                  class="rounded px-2 py-1 text-xs {currency.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'}">
                  {currency.isActive
                    ? $_('customCurrency.status.active')
                    : $_('customCurrency.status.inactive')}
                </span>
              </TableBodyCell>
              <TableBodyCell class="p-3 text-black">
                <div class="flex gap-2">
                  <Button
                    size="sm"
                    outline
                    class="border-none px-2 focus:ring-0"
                    on:click={() => startEdit(currency)}>
                    <span class="hover:text-brand text-mark">
                      {$_('customCurrency.actions.edit')}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    outline
                    class="border-none px-2 focus:ring-0"
                    on:click={() => deleteCurrency(currency.id)}>
                    <span class="hover:text-brand text-mark">
                      {$_('customCurrency.actions.delete')}
                    </span>
                  </Button>
                </div>
              </TableBodyCell>
            </TableBodyRow>
          {/if}
        {/each}
      </TableBody>
    </Table>
  {:else}
    <div class="rounded-lg bg-white p-8 text-center shadow">
      <SvgIcon name="empty" width={186} height={154} />
      <p class="text-gray-500">{$_('customCurrency.empty.title')}</p>
      <p class="text-grey mt-2 text-sm">{$_('customCurrency.empty.tip')}</p>
    </div>
  {/if}
</div>

<Modal bind:open={isShowDeleteModal} size="sm" outsideclose>
  <div class="text-center">
    <div class="my-4">
      <SvgIcon name="warning" width={36} height={36} color="#ff4582" />
    </div>
    <h3 class="text-warn mb-5 text-lg font-normal">
      {$_('customCurrency.confirm.delete')}
    </h3>
    <div class="flex justify-center space-x-6">
      <button type="button" class="comfirm-btn" on:click={confirmDelete} disabled={loading}>
        {$_('confirm')}
      </button>
      <button type="button" class="cancel-btn" on:click={cancelDelete}>
        {$_('cancel')}
      </button>
    </div>
  </div>
</Modal>
