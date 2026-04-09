export default {
  forbidden: [
    {
      name: 'no-circular-dependencies',
      comment: 'Circular dependencies make NodeBB core modules harder to reason about and refactor.',
      severity: 'warn',
      from: {
        path: '^(src|public/src)',
      },
      to: {
        circular: true,
      },
    },
    {
      name: 'no-server-imports-from-browser-bundle',
      comment: 'Back-end modules should not depend on front-end bundle code under public/src.',
      severity: 'error',
      from: {
        path: '^src',
      },
      to: {
        path: '^public/src',
      },
    },
    {
      name: 'no-browser-imports-from-server-core',
      comment: 'Browser bundles should not depend directly on server implementation modules under src.',
      severity: 'error',
      from: {
        path: '^public/src',
      },
      to: {
        path: '^src',
      },
    },
    {
      name: 'no-production-imports-from-test',
      comment: 'Production code should not depend on test-only helpers or fixtures.',
      severity: 'error',
      from: {
        path: '^(app\\.js|loader\\.js|require-main\\.js|src|public/src)',
      },
      to: {
        path: '^test',
      },
    },
  ],
  options: {
    exclude: '^(install|logs|build|public/vendor|public/uploads|vendor|node_modules|src/upgrades|test/mocks)',
    doNotFollow: {
      path: '^(node_modules|vendor)',
    },
    tsPreCompilationDeps: false,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: '^(node_modules|src/upgrades|public/vendor)/',
      },
    },
  },
};
