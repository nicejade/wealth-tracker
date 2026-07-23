<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import Caption from '../components/Caption.svelte'
  import { Button, Spinner, Card, Textarea } from 'flowbite-svelte'
  import { getAssets, getRecords } from '../helper/apis'
  import {
    isNeedScroll,
    genAdviceWithStream,
    parse,
    sleep,
    updatePageMetaInfo,
    fetchExchangeRates,
  } from '../helper/utils'
  import { buildSystemContext } from '../helper/aiContext'
  import type { ChatMessage } from '../helper/aiContext'
  import { trackEvent } from '../helper/analytics'
  import { LANG_ARR } from '../helper/constant'
  import { notice, alert } from '../stores'
  import { language } from '../stores'
  import { exchangeRates, targetCurrencyCode, customCurrencies } from '../stores'
  import { loadUserSettings, saveUserSettings } from '../helper/settings'
  import type { RecordsItem, Settings } from '../typings'

  interface DisplayMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    streaming?: boolean
  }

  let loading = false
  let rawAssetsArr: Array<any> = []
  let rawRecordsArr: Array<any> = []
  let messages: DisplayMessage[] = []
  let userInput = ''
  let systemContext = ''
  let htmlBodyNode: HTMLBodyElement = null
  let chatContainer: HTMLDivElement = null
  let settings: Settings = {
    apiKey: '',
    baseURL: 'https://api.x.ai/v1/',
    model: 'grok-beta',
    temperature: 0.7,
  }

  $: if ($language || $targetCurrencyCode || $exchangeRates) {
    rebuildSystemContext()
  }

  const findNameByValue = (sourceArr, value) => {
    const target = sourceArr.find((item) => item.value === value)
    return target ? target.name : ''
  }

  const rebuildSystemContext = () => {
    if (!rawAssetsArr.length) return
    systemContext = buildSystemContext({
      assets: rawAssetsArr,
      records: rawRecordsArr,
      targetCurrency: $targetCurrencyCode,
      exchangeRates: $exchangeRates,
      customCurrencies: $customCurrencies,
      languageName: findNameByValue(LANG_ARR, $language),
    })
  }

  onMount(async () => {
    updatePageMetaInfo({
      title: $_('chat.title'),
      description: $_('chat.subtitle'),
    })

    htmlBodyNode = document.getElementsByTagName('body')[0]
    fetchExchangeRates()

    try {
      const userSettings = await loadUserSettings()
      settings = {
        apiKey: userSettings.apiKey || '',
        baseURL: userSettings.baseURL || 'https://api.x.ai/v1/',
        model: userSettings.model || 'grok-beta',
        temperature: userSettings.temperature || 0.7,
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      settings = {
        apiKey: localStorage.getItem('apiKey') || '',
        baseURL: localStorage.getItem('baseURL') || 'https://api.x.ai/v1/',
        model: localStorage.getItem('model') || 'grok-beta',
        temperature: parseFloat(localStorage.getItem('temperature') || '0.7'),
      }
    }

    try {
      const results = await Promise.all([getAssets(), getRecords()])
      rawAssetsArr = results[0] as any[]
      const records: RecordsItem = results[1]
      rawRecordsArr = records.data || []
      rebuildSystemContext()
    } catch (error) {
      console.error('Error fetching data:', error)
      alert.set(error.message)
    }
  })

  const saveSettings = async () => {
    await saveUserSettings({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      model: settings.model,
      temperature: settings.temperature,
    }).catch((err) => {
      console.error('Failed to save settings:', err)
      Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, String(value))
      })
    })
  }

  const scrollChatToBottom = async () => {
    if (!isNeedScroll()) return
    await sleep(10)
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    } else {
      htmlBodyNode?.scrollTo({ top: 2e6, behavior: 'smooth' })
    }
  }

  const buildApiMessages = (history: DisplayMessage[]): ChatMessage[] => {
    const apiMessages: ChatMessage[] = [{ role: 'system', content: systemContext }]
    history.forEach((msg) => {
      if (msg.content) {
        apiMessages.push({ role: msg.role, content: msg.content })
      }
    })
    return apiMessages
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    if (!settings.apiKey) {
      alert.set($_('chat.noApiKey'))
      return
    }

    if (!rawAssetsArr.length) {
      alert.set($_('chat.noAssets'))
      return
    }

    rebuildSystemContext()

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    const assistantMsg: DisplayMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      streaming: true,
    }

    messages = [...messages, userMsg, assistantMsg]
    userInput = ''
    loading = true
    scrollChatToBottom()

    trackEvent('ai-chat-request', { model: settings.model })

    const historyBeforeAssistant = messages.slice(0, -1)

    genAdviceWithStream(
      {
        messages: buildApiMessages(historyBeforeAssistant),
        settings,
      },
      {
        onUpdate: (res) => {
          if (res.stream) {
            messages = messages.map((msg) =>
              msg.id === assistantMsg.id ? { ...msg, content: msg.content + res.stream } : msg,
            )
          } else if (res.error) {
            messages = messages.map((msg) =>
              msg.id === assistantMsg.id ? { ...msg, content: res.error, streaming: false } : msg,
            )
            alert.set(res.error)
          }
          scrollChatToBottom()
        },
        onFinish: () => {
          loading = false
          messages = messages.map((msg) =>
            msg.id === assistantMsg.id ? { ...msg, streaming: false } : msg,
          )
          notice.set($_('chat.responseDone'))
        },
        onError: (error) => {
          loading = false
          messages = messages.map((msg) =>
            msg.id === assistantMsg.id
              ? { ...msg, content: error.message || $_('chat.error'), streaming: false }
              : msg,
          )
          alert.set(error.message)
        },
      },
    )
  }

  const onSendClick = () => sendMessage(userInput)

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSendClick()
    }
  }

  const onSuggestedClick = (question: string) => {
    sendMessage(question)
  }

  const onClearChat = () => {
    messages = []
    userInput = ''
  }

  const suggestedQuestions = ['chat.suggestedQ1', 'chat.suggestedQ2', 'chat.suggestedQ3']
</script>

<Header />

<div class="flex w-full flex-col items-center justify-center space-y-8">
  <Card class="w-full max-w-none shadow-none 2xl:col-span-2">
    <div class="mb-2 flex justify-between">
      <Caption title={$_('aiSettings')} subtitle={$_('aiSettingsDesc')}></Caption>
    </div>
    <div class="flex flex-col items-center justify-center">
      <div class="module-warp">
        <label for="api-key" class="custom-label">API KEY</label>
        <input
          id="api-key"
          type="password"
          class="custom-input"
          bind:value={settings.apiKey}
          on:blur={saveSettings}
          placeholder="API Key" />
      </div>

      <div class="module-warp">
        <label for="base-url" class="custom-label">BASE URL</label>
        <input
          id="base-url"
          class="custom-input"
          bind:value={settings.baseURL}
          on:blur={saveSettings}
          placeholder="API Base URL" />
      </div>

      <div class="module-warp">
        <label for="model" class="custom-label">MODEL</label>
        <input
          id="model"
          class="custom-input"
          bind:value={settings.model}
          on:blur={saveSettings}
          placeholder="Select Model" />
      </div>

      <div class="module-warp">
        <label for="temperature" class="custom-label">Temperature</label>
        <input
          class="custom-input"
          id="temperature"
          type="number"
          min="0"
          max="1"
          step="0.1"
          on:blur={saveSettings}
          bind:value={settings.temperature} />
      </div>
    </div>
  </Card>

  <Card class="w-full max-w-none shadow-none 2xl:col-span-2">
    <div class="mb-4 flex w-full items-center justify-between">
      <Caption title={$_('chat.title')} subtitle={$_('chat.subtitle')}></Caption>
      {#if messages.length}
        <Button
          class="regular-btn !min-w-fit text-center focus-within:ring-0"
          color="light"
          size="sm"
          on:click={onClearChat}
          disabled={loading}>
          {$_('chat.clear')}
        </Button>
      {/if}
    </div>

    <div
      bind:this={chatContainer}
      class="chat-container mb-4 flex max-h-[32rem] min-h-[16rem] flex-col gap-4 overflow-y-auto rounded-lg border border-gray-100 p-4">
      {#if !messages.length}
        <div class="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
          <article
            class="markdown-article text-grey prose md:prose-sm md:prose-pre:max-w-md lg:prose-md max-w-lg">
            {@html parse($_('chat.emptyTip'))}
          </article>
          <div class="flex flex-wrap justify-center gap-2">
            {#each suggestedQuestions as key}
              <button
                class="suggested-chip hover:border-brand rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900"
                on:click={() => onSuggestedClick($_(key))}
                disabled={loading}>
                {$_(key)}
              </button>
            {/each}
          </div>
        </div>
      {:else}
        {#each messages as msg (msg.id)}
          <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
            <div
              class="max-w-[85%] rounded-2xl px-4 py-3 {msg.role === 'user'
                ? 'bg-brand text-white'
                : 'bg-gray-50 text-gray-800'}">
              {#if msg.role === 'assistant'}
                <article
                  class="markdown-article prose prose-sm md:prose-sm max-w-none {msg.streaming &&
                  !msg.content
                    ? 'text-gray-400'
                    : ''}">
                  {#if msg.streaming && !msg.content}
                    <span class="inline-flex items-center gap-2">
                      <Spinner color="red" size="4" />
                      {$_('chat.thinking')}
                    </span>
                  {:else}
                    {@html parse(msg.content).replace(/>\s+</g, '><').replace(/\n/g, '').trim()}
                  {/if}
                </article>
              {:else}
                <p class="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    </div>

    {#if messages.length}
      <div class="mb-3 flex flex-wrap gap-2">
        {#each suggestedQuestions as key}
          <button
            class="suggested-chip hover:border-brand rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 transition-colors hover:text-gray-800"
            on:click={() => onSuggestedClick($_(key))}
            disabled={loading}>
            {$_(key)}
          </button>
        {/each}
      </div>
    {/if}

    <div class="flex w-full items-end gap-3">
      <Textarea
        id="chat-input"
        bind:value={userInput}
        on:keydown={onKeydown}
        rows={2}
        placeholder={$_('chat.inputPlaceholder')}
        disabled={loading}
        class="focus-within:border-brand flex-1 focus-within:ring-0" />
      <Button
        class="regular-btn gradient-text hover:border-brand !min-w-fit shrink-0 text-center focus-within:ring-0"
        on:click={onSendClick}
        disabled={loading || !userInput.trim()}>
        {#if loading}
          <Spinner color="red" class="mr-2" size="4" />
        {/if}
        {$_('chat.send')}
      </Button>
    </div>
  </Card>
</div>

<Footer />

<style>
  .chat-container {
    scroll-behavior: smooth;
  }

  .suggested-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
