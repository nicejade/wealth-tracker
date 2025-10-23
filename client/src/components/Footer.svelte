<script lang="ts">
  import { Badge, FooterCopyright } from 'flowbite-svelte'
  import { _ } from 'svelte-i18n'
  import SvgIcon from './SvgIcon.svelte'
  import { SOCIAL_LINKS } from './../helper/constant'
  import { version } from './../../package.json'
</script>

<footer class="my-6 flex items-center justify-between md:flex-col md:items-center md:space-y-2">
  <div class="flex items-center justify-center space-x-3 md:w-full">
    <FooterCopyright
      aClass="hover:no-underline"
      href="https://www.jeffjade.com"
      copyrightMessage={$_('allRightsReserved')}
      by="晚晴幽草轩™" />
    <Badge large color="dark">v{version}</Badge>
  </div>
  <nav class="flex items-center justify-center space-x-1 md:w-full">
    {#each SOCIAL_LINKS as item}
      <a class="social-link" target="_blank" rel="noopener" href={item.href} title={item.title}>
        <SvgIcon name={item.icon} width={20} height={20} color="#6b7280" />
      </a>
    {/each}
  </nav>
</footer>
