import { graphql } from '@/gql-types';

export const KANBAN_CARDS_QUERY = graphql(`
  query kanbanCards($dto: GetProductBatchListDto!) {
    productBatchList(dto: $dto) {
      ...ProductBatch
    }
    productBatchGroupList(dto: $dto) {
      ...ProductBatchGroup
    }
  }
`);
