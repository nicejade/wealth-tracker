<script lang="ts">
  import { FooterCopyright } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import { SOCIAL_LINKS } from './../helper/constant'
  import { version } from './../../package.json'
</script>

<footer
  class="mt-10 flex items-center justify-between border-t border-line pt-7 md:flex-col md:items-center md:space-y-3">
  <div class="flex items-center justify-center gap-2.5 md:w-full">
    <FooterCopyright
      aClass="hover:no-underline text-ink-secondary"
      href="https://www.jeffjade.com"
      copyrightMessage={$_('allRightsReserved')}
      by="晚晴幽草轩™"
      spanClass="text-sm text-ink-tertiary" />
    <span
      class="version-badge inline-flex items-center rounded-full border border-line/60 bg-black/[0.03] px-2.5 py-1 font-mono text-[11px] font-medium leading-none tracking-wide text-ink-tertiary"
      title="v{version}">
      v{version}
    </span>
  </div>
  <nav class="flex items-center justify-center gap-0.5 md:w-full">
    {#each SOCIAL_LINKS as item}
      <a class="social-link" target="_blank" rel="noopener" href={item.href} title={item.title}>
        <SvgIcon name={item.icon} width={18} height={18} color="#6E6E73" />
      </a>
    {/each}
  </nav>
</footer>
