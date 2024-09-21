import { graphql } from '../../gql-types';

export const STATUS_FRAGMENT = graphql(`
  fragment Status on StatusDto {
    id
    title
    type
    order
    storeId
  }
`);

export const STATUS_LIST_QUERY = graphql(`
  query statusList($ids: [Int!]) {
    statusList(ids: $ids) {
      ...Status
    }
  }
`);

export const GET_STATUS_QUERY = graphql(`
  query status($id: Int!) {
    status(id: $id) {
      ...Status
    }
  }
`);

export const CREATE_STATUS_MUTATION = graphql(`
  mutation createStatus($dto: CreateStatusDto!) {
    createStatus(dto: $dto) {
      ...Status
    }
  }
`);

export const MOVE_STATUS_MUTATION = graphql(`
  mutation moveStatus($dto: MoveStatusDto!) {
    moveStatus(dto: $dto) {
      ...Status
    }
  }
`);

// export const DELETE_STATUS_MUTATION = graphql(`
//   mutation deleteStatus($id: Int!) {
//     deleteStatus(id: $id) {
//       id
//     }
//   }
// `);
