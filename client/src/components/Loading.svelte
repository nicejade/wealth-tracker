<script lang="ts">
  export let text: string = ''
</script>

<div class="flex w-full items-center justify-center">
  <span class="text-brand md:text-sm">{text}</span>
  <div class="balls mx-2">
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
