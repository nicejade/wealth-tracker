<script lang="ts">
  export let options: Array<any>
  export let active: number = 0
  export let label: string = ''
  export let listboxClass: string = 'w-36'

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

  /* Make the selected item change according to the system language switch */
  const updateSelectedItem = () => {
    selectedItem = options.find((item) => item.value === selectedItem?.value)
  }

  $: if (options) {
    updateSelectedItem()
  }

  $: if (selectedItem?.name !== selectedItemCopy?.name) {
    selectedItemCopy = deepClone(selectedItem)
    dispatch('selected', selectedItem)
  }

  // Form rows pass w-full; toolbar passes fixed widths (w-36). Never expand unless asked.
  $: isFullWidth = /\bw-full\b/.test(listboxClass)
</script>

<div
  class="custom-select flex items-center justify-center space-x-2 text-ink-secondary"
  class:w-full={isFullWidth}
  class:shrink-0={!isFullWidth}>
  {#if label}
    <label for="custom-select" class="shrink-0 text-sm font-medium tracking-tight">{label}</label>
  {/if}
  <Listbox bind:value={selectedItem} let:open class={listboxClass}>
    <div class="relative w-full">
      <ListboxButton
        class="relative h-10 w-full cursor-pointer rounded-full border border-line bg-white pl-3.5 pr-10 text-left text-ink-primary shadow-soft transition-[border-color] duration-180 ease-apple hover:bg-surface-muted focus:border-brand focus:outline-none focus:ring-0 focus:ring-offset-0 active:border-brand sm:text-sm">
        <span class="block truncate text-sm font-medium">{selectedItem?.name}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <SvgIcon name="selector" width={18} height={18} />
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
            class="custom-select-options absolute left-0 top-full z-50 mt-1.5 max-h-60 w-full min-w-full overflow-auto rounded-xl border border-line bg-white py-1.5 text-base shadow-elevated focus:outline-none sm:text-sm">
            {#each options as item (item.name)}
              <ListboxOption let:selected let:active value={item} disabled={item.disabled}>
                <li
                  class="relative select-none py-2 pl-10 pr-4
                  {item.disabled ? 'cursor-not-allowed text-ink-tertiary' : 'cursor-pointer'}
                  {active ? 'bg-blue-soft text-blue' : 'text-ink-primary'}">
                  <span
                    class="{selected ? 'font-semibold text-blue' : 'font-normal'} block truncate">
                    {item.name}
                  </span>
                  {#if selected}
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue">
                      <SvgIcon name="check" color="#0071E3" />
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

<style>
  .custom-select {
    position: relative;
  }

  :global(.custom-select-options) {
    background-color: #ffffff !important;
    box-shadow: var(--shadow-elevated) !important;
  }
</style>

