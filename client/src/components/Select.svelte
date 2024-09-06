<script lang="ts">
  export let options: Array<any>
  export let active: number = 0
  export let label: string = ''
  export let width: string = 'w-36'

  import { createEventDispatcher } from 'svelte'
  import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
    Transition,
  } from '@rgossiaux/svelte-headlessui'
  import SvgIcon from './SvgIcon.svelte'
  import type { SelectItem } from '../typings'
  import { deepClone } from '../helper/utils'

  const dispatch = createEventDispatcher()
  let selectedItem: SelectItem = options[active]
  let selectedItemCopy: SelectItem = deepClone(selectedItem)

  $: if (selectedItem?.name !== selectedItemCopy?.name) {
    selectedItemCopy = deepClone(selectedItem)
    dispatch('selected', selectedItem)
  }
</script>

<div class="flex max-w-xs items-center justify-center space-x-2 text-gray-600">
  {#if label}
    <label for="custom-select" class="font-medium">{label}</label>
  {/if}
  <Listbox bind:value={selectedItem} let:open class={width}>
    <div class="relative">
      <ListboxButton
        class="relative h-10 w-full cursor-pointer rounded-lg border border-solid bg-white pl-3 pr-10 text-left hover:bg-gray-100 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm dark:hover:bg-gray-900">
        <span class="block truncate">{selectedItem.name}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <SvgIcon name="selector" width={20} height={20} />
        </span>
      </ListboxButton>

      {#if open}
        <Transition
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0">
          <ListboxOptions
            static
            style="z-index: 100"
            class="absolute mt-2 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base
            shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {#each options as item (item.name)}
              <ListboxOption let:selected let:active value={item} disabled={item.disabled}>
                <li
                  class="relative select-none py-2 pl-10 pr-4
                  {item.disabled ? 'text-gray cursor-not-allowed' : 'cursor-pointer'}
                  {active ? 'text-brand bg-blue-100' : 'text-black'}">
                  <span
                    class="{selected ? 'text-brand font-medium' : 'font-normal'} block truncate">
                    {item.name}
                  </span>
                  {#if selected}
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-500">
                      <SvgIcon name="check" color="#f59e0b" />
                    </span>
                  {/if}
                </li>
              </ListboxOption>
            {/each}
          </ListboxOptions>
        </Transition>
      {/if}
    </div>
  </Listbox>
</div>
