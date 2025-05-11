module.exports = {
  apps: [
    {
      name: 'node-api',
      script: 'src/server.ts',
      interpreter: 'ts-node',
      interpreter_args: '--transpile-only -r tsconfig-paths/register',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      merge_logs: true,
      output: './logs/access.log',
      error: './logs/error.log',
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
      },
    },
  ],
};
