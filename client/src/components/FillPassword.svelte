<script lang="ts">
  // @ts-ignore
  import { onDestroy } from 'svelte'
  // @ts-ignore
  import { _ } from 'svelte-i18n'
  import { Spinner } from 'flowbite-svelte'
  import { hashPassword } from './../helper/auth'
  import { verifyPassword } from './../helper/apis'
  import { alert, isAuthenticated, isLoading } from './../stores'
  import { sleep } from '../helper/utils'

  let password: string = ''
  let isSubmitting: boolean = false
  let failedAttempts: number = 0
  const ATTEMPT_LIMIT: number = 3

  const handleSubmit = async () => {
    if (isSubmitting) return
    isSubmitting = true

    if (failedAttempts >= ATTEMPT_LIMIT) {
      await sleep(failedAttempts * 1000)
    }

    try {
      const hashedPassword = await hashPassword(password)
      await verifyPassword(hashedPassword)
      isAuthenticated.set(true)
      failedAttempts = 0
    } catch (error) {
      failedAttempts += 1
      alert.set(error?.message)
      password = ''
    } finally {
      isSubmitting = false
    }
  }

  onDestroy(() => {
    password = ''
    isSubmitting = false
  })
</script>

{#if !$isAuthenticated && !$isLoading}
  <div class="fixed inset-0 flex items-center justify-center">
    <div class="flex flex-col space-y-8">
      <form class="relative flex flex-row items-center" on:submit|preventDefault={handleSubmit}>
        <input type="text" name="username" autocomplete="username" class="hidden" value="wealth" />
        <input
          id="password"
          type="password"
          bind:value={password}
          required
          autocomplete="new-password"
          class="custom-input ml-0"
          placeholder={$_('enterPassword')} />
        <button type="submit" disabled={isSubmitting} class="regular-btn ml-6">
          {#if isSubmitting}
            <Spinner color="blue" size="5" />
          {/if}
          {$_('confirm')}
        </button>
      </form>
    </div>
  </div>
{/if}
