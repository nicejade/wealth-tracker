<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import Header from '../components/Header.svelte'
  import Footer from '../components/Footer.svelte'
  import Caption from '../components/Caption.svelte'
  import { Button, Spinner, Card, Textarea } from 'flowbite-svelte'
  import { getAssets } from '../helper/apis'
  import {
    isNeedScroll,
    genAdviceWithStream,
    parse,
    sleep,
    updatePageMetaInfo,
    getCurrencySymbol,
    convertCurrency,
  } from '../helper/utils'
  import { PROMPT_TEMPLATE, LANG_ARR } from '../helper/constant'
  import { notice, alert } from '../stores'
  import { language } from '../stores'
  import { exchangeRates, targetCurrencyCode } from '../stores'
  import type { Settings } from '../typings'

  let loading: boolean = false
  let rawAssetsArr: Array<any> = []
  let advice: string = ``
  let htmlBodyNode: HTMLBodyElement = null
  let totalAssets: number = 0
  let convertedTotalAssets: number = 0
  let prompt: string = ''
  let settings: Settings = {
    apiKey: localStorage.getItem('apiKey') || '',
    baseURL: localStorage.getItem('baseURL') || 'https://api.x.ai/v1/',
    model: localStorage.getItem('model') || 'grok-beta',
    temperature: localStorage.getItem('temperature') || 0.7,
  }

  $: if ($language || $targetCurrencyCode || $exchangeRates) {
    updatePrompt()
  }

  onMount(async () => {
    updatePageMetaInfo({
      title: $_('financialAdvice'),
      description: $_('financialAdviceDetails'),
    })

    htmlBodyNode = document.getElementsByTagName('body')[0]

    try {
      rawAssetsArr = (await getAssets()) as Array<any>
      updatePrompt()
    } catch (error) {
      console.error('Error fetching assets:', error)
      alert.set(error.message)
    }
  })

  const updatePrompt = () => {
    if (!rawAssetsArr.length) return

    const assetsInfo = genAssetsInfo()
    // Calculate converted total assets with fallback for missing exchange rates
    convertedTotalAssets = rawAssetsArr.reduce((sum, item) => {
      const convertedAmount =
        $exchangeRates && Object.keys($exchangeRates).length > 0
          ? convertCurrency(item.amount, item.currency, $targetCurrencyCode, $exchangeRates)
          : item.currency === $targetCurrencyCode
            ? item.amount
            : 0
      return sum + convertedAmount
    }, 0)

    const targetSymbol = getCurrencySymbol($targetCurrencyCode)
    const formattedTotal = `${targetSymbol}${convertedTotalAssets.toLocaleString('en-US')}`

    prompt = formatTemplate(PROMPT_TEMPLATE, {
      language: findNameByValue(LANG_ARR, $language),
      total: formattedTotal,
      status: assetsInfo,
    })
  }

  const formatTemplate = (template: string, data: Record<string, any>) => {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      const trimmedKey = key.trim()
      return data[trimmedKey] ?? match
    })
  }

  const genAssetsInfo = () => {
    try {
      return rawAssetsArr
        .map((item) => {
          totalAssets += item.amount
          const { alias, amount, liquidity, risk, tags, currency } = item
          const currencySymbol = getCurrencySymbol(currency || 'CNY')
          const formattedAmount = `${currencySymbol}${amount.toLocaleString()}`
          const tagsInfo = tags && tags.trim() ? `, Tags: ${tags}` : ''
          return `- Account name: ${alias}, Amount: ${formattedAmount}, Liquidity: ${liquidity.toLowerCase()}, Risk: ${risk.toLowerCase()}${tagsInfo}`
        })
        .join('\n  ')
    } catch (error) {
      console.error('Error fetching assets:', error)
    }
  }

  const findNameByValue = (sourceArr, value) => {
    const target = sourceArr.find((item) => item.value === value)
    return target ? target.name : ''
  }

  const saveSettings = () => {
    Object.entries(settings).forEach(([key, value]) => {
      return localStorage.setItem(key, String(value))
    })
  }

  const scrollChatToBottom = async () => {
    if (!isNeedScroll()) return

    await sleep(10)
    htmlBodyNode.scrollTo({ top: 2e6, behavior: 'smooth' })
  }

  const handleGptStream = (params) => {
    const options = {
      onUpdate: (res) => {
        if (loading) loading = false
        if (res.stream) {
          advice += res.stream
        } else if (res.error) {
          advice += res.error
          alert.set(res.error)
        }
        scrollChatToBottom()
      },
      onFinish: () => {
        loading = false
        notice.set($_('assetAllocationAdvice'))
      },
      onError: (error) => {
        loading = false
        alert.set(error.message)
      },
    }
    loading = true
    genAdviceWithStream(params, options)
  }

  const onGenAdviceClick = async () => {
    try {
      handleGptStream({ prompt, settings })
    } catch (error) {
      loading = false
      alert.set(error.message)
    }
  }
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
      <div class="mb-4 flex w-5/6 justify-between">
        <Caption title={$_('financialAdvice')} subtitle={$_('financialAdviceDetails')}></Caption>
      </div>
      <Button
        class="regular-btn gradient-text hover:border-brand !min-w-fit text-center focus-within:ring-0"
        on:click={onGenAdviceClick}
        disabled={loading}>
        {#if loading}
          <Spinner color="red" class="mr-2" size="4" />
        {/if}
        {$_('getAIAdvice')}
      </Button>
    </div>
    <div class="mb-4 flex w-full items-center justify-between">
      <Textarea
        id="prompt"
        value={prompt}
        rows={18}
        class=" focus-within:border-brand focus-within:ring-0" />
    </div>
    {#if advice}
      <div class="text-brand my-4 w-full whitespace-pre-line rounded-lg p-2 shadow">
        <article class="markdown-article prose md:prose-sm md:prose-pre:max-w-md lg:prose-md">
          {@html parse(advice).replace(/>\s+</g, '><').replace(/\n/g, '').trim()}
        </article>
      </div>
    {:else}
      <div class="my-4 flex w-full items-center justify-center">
        <article
          class="markdown-article text-grey prose md:prose-sm md:prose-pre:max-w-md lg:prose-md">
          {@html parse($_('genAssetAdviceTip'))}
        </article>
      </div>
    {/if}
  </Card>
</div>

<Footer />
