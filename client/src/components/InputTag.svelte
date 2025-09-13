<svelte:options accessors={true} />

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import Tooltips from './Tooltips.svelte'
  import SvgIcon from './SvgIcon.svelte'

  // Props
  export let modelValue: string[] = []
  export let placeholder: string = ''
  export let max: number | undefined = 3
  export let trigger: 'Enter' | 'Space' = 'Enter'
  export let draggable: boolean = false
  export let delimiter: string | RegExp | undefined
  export let size: 'small' | 'default' | 'large' = 'default'
  export let collapseTags: boolean = false
  export let collapseTagsTooltip: boolean = false
  export let maxCollapseTags: number = 1
  export let saveOnBlur: boolean = true
  export let clearable: boolean = false
  export let disabled: boolean = false
  // validateEvent reserved for API parity (not used)
  export let readonly: boolean = false
  export let autofocus: boolean = false
  export let id: string | undefined
  export let tabindex: string | number | undefined
  export let maxlength: string | number | undefined
  export let minlength: string | number | undefined
  export let autocomplete: string = 'off'
  export let ariaLabel: string | undefined

  // Internal state
  let inputValue: string = ''
  let inputEl: HTMLInputElement

  const dispatch = createEventDispatcher()

  const emit = (name: string, detail?: any) => dispatch(name, detail)

  const addTag = (val: string) => {
    const value = val.trim()
    if (!value) return
    if (max !== undefined && modelValue.length >= max) return
    if (modelValue.includes(value)) return
    modelValue = [...modelValue, value]
    emit('add-tag', value)
    emit('change', modelValue)
    emit('input', modelValue)
  }

  const removeTagAt = (idx: number) => {
    const removed = modelValue[idx]
    modelValue = modelValue.filter((_, i) => i !== idx)
    emit('remove-tag', removed)
    emit('change', modelValue)
    emit('input', modelValue)
  }

  const clearAll = () => {
    if (!clearable || disabled) return
    if (modelValue.length === 0) return
    modelValue = []
    emit('clear')
    emit('change', modelValue)
    emit('input', modelValue)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled || readonly) return
    const key = e.key
    const shouldTrigger =
      (trigger === 'Enter' && key === 'Enter') || (trigger === 'Space' && key === ' ')
    if (shouldTrigger) {
      e.preventDefault()
      if (delimiter) {
        // When pressing trigger, also flush pending value
        flushInput(inputValue)
      } else {
        addTag(inputValue)
        inputValue = ''
      }
    }
    // Backspace to remove last when empty
    if (key === 'Backspace' && inputValue.length === 0 && modelValue.length > 0) {
      removeTagAt(modelValue.length - 1)
    }
  }

  const flushInput = (val: string) => {
    if (!val) return
    if (delimiter) {
      const parts = typeof delimiter === 'string' ? val.split(delimiter) : val.split(delimiter)
      parts.forEach((p) => addTag(p))
      inputValue = ''
    } else {
      addTag(val)
      inputValue = ''
    }
  }

  const handleBlur = () => {
    emit('blur')
    if (saveOnBlur) flushInput(inputValue)
  }

  const handleFocus = () => {
    emit('focus')
  }

  const focus = () => inputEl?.focus()
  const blur = () => inputEl?.blur()

  // Drag & Drop
  let dragIndex: number | null = null
  const onDragStart = (e: DragEvent, idx: number) => {
    if (!draggable || disabled) return
    dragIndex = idx
    e.dataTransfer?.setData('text/plain', String(idx))
  }
  const onDragOver = (e: DragEvent) => {
    if (!draggable || disabled) return
    e.preventDefault()
  }
  const onDrop = (e: DragEvent, idx: number) => {
    if (!draggable || disabled) return
    e.preventDefault()
    const from = dragIndex ?? Number(e.dataTransfer?.getData('text/plain'))
    const to = idx
    if (Number.isFinite(from) && from !== to) {
      const next = [...modelValue]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      modelValue = next
      emit('change', modelValue)
      emit('input', modelValue)
    }
    dragIndex = null
  }

  // Expose methods
  export { focus, blur }

  onMount(() => {
    if (autofocus) focus()
  })

  // Size classes mapping (Tailwind-like, matching project style)
  const sizeToClasses = (s: typeof size) => {
    if (s === 'small') return 'h-8 text-sm'
    if (s === 'large') return 'h-12 text-base'
    return 'h-10 text-sm'
  }

  const baseInputClass =
    'focus:ring-0 border-none hover:border-none px-2 text-gray-600 active:border-none focus:border-none flex-1 min-w-[6rem] bg-transparent outline-none placeholder-grey text-base md:text-sm'
  const containerClass =
    'relative flex flex-wrap items-center gap-2 rounded-lg border border-silver border-solid bg-white'
  const tagClass =
    'inline-flex items-center gap-1 rounded-md bg-silver text-gray-700 px-1 py-1 mx-1 text-sm'
  const tagBtnClass = 'hover:text-red-500 cursor-pointer'
  const disabledClass = 'opacity-60 cursor-not-allowed bg-gray-50'
  const hoverClass = 'hover:bg-gray-50'

  // Input handler (extracted to avoid complex inline TS in template)
  const onInput = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement
    const v = target?.value ?? ''
    if (delimiter) {
      const hasDelimiter =
        typeof delimiter === 'string' ? v.includes(delimiter) : (delimiter as RegExp).test(v)
      if (hasDelimiter) {
        flushInput(v)
        return
      }
    }
    inputValue = v
  }

  // silence unused prop warning (kept for API parity)
  // Coerced numeric attributes for DOM
  $: tabindexNum = typeof tabindex === 'string' ? parseInt(tabindex, 10) : tabindex
  $: maxlengthNum = typeof maxlength === 'string' ? parseInt(maxlength, 10) : maxlength
  $: minlengthNum = typeof minlength === 'string' ? parseInt(minlength, 10) : minlength
</script>

<div class="w-full">
  <div
    class="{containerClass} {sizeToClasses(size)} {disabled ? disabledClass : hoverClass}"
    role="list">
    {#if collapseTags && modelValue.length > 0}
      <!-- Collapsed tags -->
      {#each modelValue.slice(0, Math.max(1, maxCollapseTags)) as tag, idx (tag + '-' + idx)}
        <span
          class={tagClass}
          {draggable}
          on:dragstart={(e) => onDragStart(e, idx)}
          on:dragover={onDragOver}
          on:drop={(e) => onDrop(e, idx)}
          role="listitem">
          <slot name="tag" {tag}>
            <span>{tag}</span>
          </slot>
          {#if !disabled}
            <button
              class={tagBtnClass}
              type="button"
              on:click={() => removeTagAt(idx)}
              aria-label="Remove tag">
              <SvgIcon name="close" width={16}></SvgIcon>
            </button>
          {/if}
        </span>
      {/each}
      {#if modelValue.length > Math.max(1, maxCollapseTags)}
        {#if collapseTagsTooltip}
          <Tooltips placement="bottom">
            <span slot="tooltip">
              {#each modelValue as t, i}
                <span class="mr-1">{t}{i < modelValue.length - 1 ? ',' : ''}</span>
              {/each}
            </span>
            <span class="text-xs text-gray-500">
              +{modelValue.length - Math.max(1, maxCollapseTags)}
            </span>
          </Tooltips>
        {:else}
          <span class="text-xs text-gray-500">
            +{modelValue.length - Math.max(1, maxCollapseTags)}
          </span>
        {/if}
      {/if}
    {:else}
      {#each modelValue as tag, idx (tag + '-' + idx)}
        <span
          class={tagClass}
          {draggable}
          on:dragstart={(e) => onDragStart(e, idx)}
          on:dragover={onDragOver}
          on:drop={(e) => onDrop(e, idx)}
          role="listitem">
          <slot name="tag" {tag}>
            <span>{tag}</span>
          </slot>
          {#if !disabled}
            <button
              class={tagBtnClass}
              type="button"
              on:click={() => removeTagAt(idx)}
              aria-label="Remove tag">
              <SvgIcon name="close" width={16}></SvgIcon>
            </button>
          {/if}
        </span>
      {/each}
    {/if}

    <!-- Prefix slot -->
    <slot name="prefix" />

    <!-- Input -->
    {#if modelValue.length < max}
      <input
        bind:this={inputEl}
        class={baseInputClass}
        type="text"
        bind:value={inputValue}
        {placeholder}
        {id}
        tabindex={tabindexNum}
        maxlength={maxlengthNum}
        minlength={minlengthNum}
        {autocomplete}
        on:keydown={handleKeyDown}
        on:blur={handleBlur}
        on:focus={handleFocus}
        {disabled}
        {readonly}
        aria-label={ariaLabel}
        on:input={onInput} />
    {/if}

    <!-- Suffix slot -->
    <slot name="suffix" />

    {#if clearable && modelValue.length > 0 && !disabled}
      <button
        class="absolute right-2 text-gray-400 hover:text-gray-600"
        type="button"
        on:click={clearAll}
        aria-label="Clear tags">
        <SvgIcon name="close" width={16}></SvgIcon>
      </button>
    {/if}
  </div>
</div>
