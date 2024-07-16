<script lang="ts">
  export let text: string = 'AI 正在生成回复，请稍后'
</script>

<div class="flex items-center justify-center w-full">
  <span class="md:text-sm text-brand">{text}</span>
  <div class="mx-2 balls">
    <div />
    <div />
    <div />
  </div>
</div>

<style>
  .balls {
    width: 2rem;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
  }

  .balls div {
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background-color: #1e293b;
    transform: translateY(-100%);
    animation: wave 0.6s ease-in-out alternate infinite;
  }

  .balls div:nth-of-type(1) {
    animation-delay: -0.4s;
  }

  .balls div:nth-of-type(2) {
    animation-delay: -0.2s;
  }

  @keyframes wave {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(100%);
    }
  }
</style>
