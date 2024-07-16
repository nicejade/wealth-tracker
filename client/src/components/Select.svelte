<script lang="ts">
  export let options: Array<any>
  export let active: number = 0
  export let label: string = ''
  export let width: string = 'w-36'

  import { createEventDispatcher } from 'svelte'
  import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition } from '@rgossiaux/svelte-headlessui'
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

<div class="max-w-xs text-gray-600 flex justify-center items-center space-x-2">
  {#if label}
    <label for="custom-select" class="font-medium">{label}</label>
  {/if}
  <Listbox bind:value={selectedItem} let:open class={width}>
    <div class="relative">
      <ListboxButton
        class="relative w-full h-10 pl-3 pr-10 text-left bg-white border border-solid rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
        <span class="block truncate">{selectedItem.name}</span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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
            class="absolute w-full py-1 mt-2 overflow-auto text-base bg-white rounded-md shadow-lg 
            max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {#each options as item (item.name)}
              <ListboxOption let:selected let:active value={item} disabled={item.disabled}>
                <li
                  class="relative select-none py-2 pl-10 pr-4
                  {item.disabled ? 'cursor-not-allowed text-gray' : 'cursor-pointer'}
                  {active ? 'bg-blue-100 text-brand' : 'text-black'}">
                  <span class="{selected ? 'text-brand font-medium' : 'font-normal'} block truncate">
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
