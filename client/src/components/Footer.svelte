<script lang="ts">
  import { FooterCopyright } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import { SOCIAL_LINKS } from './../helper/constant'
</script>

<div class="my-6 flex items-center justify-between">
  <div class="flex items-start space-x-3">
    <FooterCopyright
      href="https://www.jeffjade.com/"
      copyrightMessage={$_('allRightsReserved')}
      by="晚晴幽草轩™" />
  </div>
  <nav class="flex space-x-1 md:hidden">
    {#each SOCIAL_LINKS as item}
      <a class="social-link" target="_blank" rel="noopener" href={item.href} title={item.title}>
        <SvgIcon name={item.icon} width={20} height={20} color="#6b7280" />
      </a>
    {/each}
  </nav>
</div>
