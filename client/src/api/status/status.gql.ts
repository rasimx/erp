import { graphql } from '../../gql-types';

export const STATUS_FRAGMENT = graphql(`
  fragment Status on StatusDto {
    id
    title
    type
    order
  }
`);

export const STATUS_LIST_QUERY = graphql(`
  query statusList {
    statusList {
      ...Status
    }
  }
`);

export const CREATE_STATUS_MUTATION = graphql(`
  mutation createStatus($title: String!) {
    createStatus(title: $title) {
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
