export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        // Apps
        'api',
        'web',
        'desktop',
        'mobile',

        // Packages
        'ui',
        'db',
        'contracts',
        'shared',
        'api-client',
        'design-tokens',
        'config',

        // Backend modules
        'identity',
        'organizations',
        'accounting',
        'invoices',
        'customers',
        'vendors',
        'inventory',
        'treasury',
        'reports',
        'audit',
        'notifications',
        'files',

        // Infrastructure
        'ci',
        'docker',
        'deps',
        'repo',
        'docs',
        'release',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 200],
  },
};
