<script lang="ts">
  import { FooterCopyright } from 'flowbite-svelte'
  import SvgIcon from './SvgIcon.svelte'
  import { SOCIAL_LINKS } from './../helper/constant'
</script>

<div class="flex h-20 items-center justify-between">
  <div class="flex items-start space-x-3">
    <FooterCopyright
      href="https://www.jeffjade.com/"
      copyrightMessage="版权所有"
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
