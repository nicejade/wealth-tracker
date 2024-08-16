module.exports = {
  apps: [
    {
      name: 'wealth-tracker',
      script: 'node dist/index.js',
      args: '',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PORT: 8888,
        NODE_ENV: 'production',
      },
    },
  ],
}
