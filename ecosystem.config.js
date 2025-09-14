module.exports = {
  apps: [
    {
      name: 'finclick-ai',
      script: 'server.js',
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // PM2 monitoring
      monitoring: false,

      // Error handling
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Auto restart on file changes (development only)
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: [
        'node_modules',
        'uploads',
        'reports',
        'charts',
        'logs',
        'coverage',
        'tests'
      ],

      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Health check
      health_check_grace_period: 3000,

      // Auto scaling (production only)
      autorestart: true,

      // Environment variables will be loaded from .env file
      env_file: '.env'
    }
  ]
};