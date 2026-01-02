export default {
  files: ['tests/**/*.test.ts'],
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=tsx'],
  timeout: '1m',
  failFast: false,
  verbose: true,
  environmentVariables: {
    NODE_OPTIONS: '--loader=tsx',
  },
};
