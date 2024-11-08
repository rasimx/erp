import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../server/src/schema.gql',
  ignoreNoDocuments: true,
  documents: 'src/**/*.(ts|tsx)',
  generates: {
    'src/gql-types/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
      },
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
