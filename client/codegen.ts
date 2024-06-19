import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../metricsplace_common/graphql/erp.gql',
  ignoreNoDocuments: true,
  documents: 'src/**/*.(ts|tsx)',
  generates: {
    'src/gql-types/': {
      preset: 'client',
      plugins: [],
      config: {
        namingConvention: {
          enumValues: 'change-case-all#camelCase',
        },
      },
    },
  },
};

export default config;
