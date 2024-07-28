module.exports = {
  apps: [
    {
      name: 'wealth-tracker',
      script: 'npx',
      args: 'tsx src/index.ts',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
