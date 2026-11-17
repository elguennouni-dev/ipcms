module.exports = {
  apps: [{
    name: 'ipcms',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p ' + (process.env.PORT || 3000),
    cwd: __dirname,
    env: { NODE_ENV: 'production' },
    max_memory_restart: '900M',
    autorestart: true
  }]
};
