/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  fragment ProductBatchGroup on ProductBatchGroupDto {\n    id\n    name\n    statusId\n    status {\n      id\n      title\n      order\n    }\n    order\n    productBatchList {\n      ...ProductBatch\n    }\n  }\n": types.ProductBatchGroupFragmentDoc,
    "\n  mutation moveProductBatchGroup($dto: MoveProductBatchGroupDto!) {\n    moveProductBatchGroup(dto: $dto) {\n      success\n    }\n  }\n": types.MoveProductBatchGroupDocument,
    "\n  mutation createProductBatchGroup($dto: CreateProductBatchGroupDto!) {\n    createProductBatchGroup(dto: $dto) {\n      success\n    }\n  }\n": types.CreateProductBatchGroupDocument,
    "\n  mutation deleteProductBatchGroup($id: Int!) {\n    deleteProductBatchGroup(id: $id) {\n      success\n    }\n  }\n": types.DeleteProductBatchGroupDocument,
    "\n  query productBatchList($productId: Int) {\n    productBatchList(productId: $productId) {\n      ...ProductBatch\n    }\n    productBatchGroupList(productId: $productId) {\n      ...ProductBatchGroup\n    }\n  }\n": types.ProductBatchListDocument,
    "\n  fragment ProductBatch on ProductBatchDto {\n    id\n    name\n    groupId\n    product {\n      sku\n      name\n    }\n    parentId\n    statusId\n    status {\n      id\n      title\n      order\n    }\n    count\n    costPricePerUnit\n    operationsPricePerUnit\n    date\n    order\n  }\n": types.ProductBatchFragmentDoc,
    "\n  mutation moveProductBatch($dto: MoveProductBatchDto!) {\n    moveProductBatch(dto: $dto) {\n      success\n    }\n  }\n": types.MoveProductBatchDocument,
    "\n  mutation createProductBatch(\n    $dto: CreateProductBatchDto!\n    $statusId: Int\n    $groupId: Int\n  ) {\n    createProductBatch(dto: $dto, statusId: $statusId, groupId: $groupId) {\n      success\n    }\n  }\n": types.CreateProductBatchDocument,
    "\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id) {\n      success\n    }\n  }\n": types.DeleteProductBatchDocument,
    "\n  fragment Product on ProductDto {\n    id\n    name\n    sku\n  }\n": types.ProductFragmentDoc,
    "\n  query productList {\n    productList {\n      items {\n        ...Product\n      }\n    }\n  }\n": types.ProductListDocument,
    "\n  fragment Status on StatusDto {\n    id\n    title\n    type\n    order\n  }\n": types.StatusFragmentDoc,
    "\n  query statusList {\n    statusList {\n      ...Status\n    }\n  }\n": types.StatusListDocument,
    "\n  mutation createStatus($title: String!) {\n    createStatus(title: $title) {\n      ...Status\n    }\n  }\n": types.CreateStatusDocument,
    "\n  mutation moveStatus($dto: MoveStatusDto!) {\n    moveStatus(dto: $dto) {\n      ...Status\n    }\n  }\n": types.MoveStatusDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductBatchGroup on ProductBatchGroupDto {\n    id\n    name\n    statusId\n    status {\n      id\n      title\n      order\n    }\n    order\n    productBatchList {\n      ...ProductBatch\n    }\n  }\n"): (typeof documents)["\n  fragment ProductBatchGroup on ProductBatchGroupDto {\n    id\n    name\n    statusId\n    status {\n      id\n      title\n      order\n    }\n    order\n    productBatchList {\n      ...ProductBatch\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation moveProductBatchGroup($dto: MoveProductBatchGroupDto!) {\n    moveProductBatchGroup(dto: $dto) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation moveProductBatchGroup($dto: MoveProductBatchGroupDto!) {\n    moveProductBatchGroup(dto: $dto) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createProductBatchGroup($dto: CreateProductBatchGroupDto!) {\n    createProductBatchGroup(dto: $dto) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation createProductBatchGroup($dto: CreateProductBatchGroupDto!) {\n    createProductBatchGroup(dto: $dto) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteProductBatchGroup($id: Int!) {\n    deleteProductBatchGroup(id: $id) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation deleteProductBatchGroup($id: Int!) {\n    deleteProductBatchGroup(id: $id) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query productBatchList($productId: Int) {\n    productBatchList(productId: $productId) {\n      ...ProductBatch\n    }\n    productBatchGroupList(productId: $productId) {\n      ...ProductBatchGroup\n    }\n  }\n"): (typeof documents)["\n  query productBatchList($productId: Int) {\n    productBatchList(productId: $productId) {\n      ...ProductBatch\n    }\n    productBatchGroupList(productId: $productId) {\n      ...ProductBatchGroup\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductBatch on ProductBatchDto {\n    id\n    name\n    groupId\n    product {\n      sku\n      name\n    }\n    parentId\n    statusId\n    status {\n      id\n      title\n      order\n    }\n    count\n    costPricePerUnit\n    operationsPricePerUnit\n    date\n    order\n  }\n"): (typeof documents)["\n  fragment ProductBatch on ProductBatchDto {\n    id\n    name\n    groupId\n    product {\n      sku\n      name\n    }\n    parentId\n    statusId\n    status {\n      id\n      title\n      order\n    }\n    count\n    costPricePerUnit\n    operationsPricePerUnit\n    date\n    order\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation moveProductBatch($dto: MoveProductBatchDto!) {\n    moveProductBatch(dto: $dto) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation moveProductBatch($dto: MoveProductBatchDto!) {\n    moveProductBatch(dto: $dto) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createProductBatch(\n    $dto: CreateProductBatchDto!\n    $statusId: Int\n    $groupId: Int\n  ) {\n    createProductBatch(dto: $dto, statusId: $statusId, groupId: $groupId) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation createProductBatch(\n    $dto: CreateProductBatchDto!\n    $statusId: Int\n    $groupId: Int\n  ) {\n    createProductBatch(dto: $dto, statusId: $statusId, groupId: $groupId) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Product on ProductDto {\n    id\n    name\n    sku\n  }\n"): (typeof documents)["\n  fragment Product on ProductDto {\n    id\n    name\n    sku\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query productList {\n    productList {\n      items {\n        ...Product\n      }\n    }\n  }\n"): (typeof documents)["\n  query productList {\n    productList {\n      items {\n        ...Product\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Status on StatusDto {\n    id\n    title\n    type\n    order\n  }\n"): (typeof documents)["\n  fragment Status on StatusDto {\n    id\n    title\n    type\n    order\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query statusList {\n    statusList {\n      ...Status\n    }\n  }\n"): (typeof documents)["\n  query statusList {\n    statusList {\n      ...Status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createStatus($title: String!) {\n    createStatus(title: $title) {\n      ...Status\n    }\n  }\n"): (typeof documents)["\n  mutation createStatus($title: String!) {\n    createStatus(title: $title) {\n      ...Status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation moveStatus($dto: MoveStatusDto!) {\n    moveStatus(dto: $dto) {\n      ...Status\n    }\n  }\n"): (typeof documents)["\n  mutation moveStatus($dto: MoveStatusDto!) {\n    moveStatus(dto: $dto) {\n      ...Status\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;