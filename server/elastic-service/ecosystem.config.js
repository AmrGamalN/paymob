module.exports = {
  apps: [
    {
      name: 'elastic-service',
      script: 'dist/app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
