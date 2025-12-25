<script lang="ts">
  export let type: 'table' | 'text' | 'all' = 'all'
  export let rows: number = 3
</script>

<div class="w-full space-y-8">
  {#if type === 'table' || type === 'all'}
    <div
      role="status"
      class="animate-pulse space-y-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="mb-2.5 h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div class="h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
      {#each Array(rows) as _}
        <div class="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <div>
            <div class="mb-2.5 h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div class="h-3 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div class="h-4 w-36 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        </div>
      {/each}
      <span class="sr-only">Loading Table...</span>
    </div>
  {/if}

  {#if type === 'text' || type === 'all'}
    <div role="status" class="w-full animate-pulse space-y-2.5">
      <div class="flex w-full items-center space-x-2">
        <div class="h-4 w-32 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-4 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div class="h-4 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
      <div class="flex w-full items-center space-x-2">
        <div class="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-4 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div class="h-4 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
      <div class="flex w-full items-center space-x-2">
        <div class="h-4 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div class="h-4 w-80 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-4 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
      <div class="flex w-full items-center space-x-2">
        <div class="h-4 w-full rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-4 w-full rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <div class="h-4 w-24 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>
      <span class="sr-only">Loading Text...</span>
    </div>
  {/if}
</div>

