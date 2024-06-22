import { graphql } from '../../gql-types';

export const STATUS_FRAGMENT = graphql(`
  fragment Status on Status {
    id
    title
    type
    order
    storeId
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
  mutation moveStatus($id: Int!, $order: Int!) {
    moveStatus(id: $id, order: $order) {
      ...Status
    }
  }
`);

export const DELETE_STATUS_MUTATION = graphql(`
  mutation deleteStatus($id: Int!) {
    deleteStatus(id: $id) {
      id
    }
  }
`);
