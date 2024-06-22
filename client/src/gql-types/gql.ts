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
    "\n  query productBatchList {\n    productBatchList {\n      ...ProductBatch\n    }\n  }\n": types.ProductBatchListDocument,
    "\n  fragment ProductBatch on ProductBatch {\n    id\n    name\n    product {\n      sku\n      name\n    }\n    parentId\n    statusId\n    count\n    pricePerUnit\n    costPrice\n    fullPrice\n    date\n    weight\n    volume\n    order\n  }\n": types.ProductBatchFragmentDoc,
    "\n  mutation updateProductBatch($input: UpdateProductBatchInput!) {\n    updateProductBatch(input: $input) {\n      ...ProductBatch\n    }\n  }\n": types.UpdateProductBatchDocument,
    "\n  mutation createProductBatch($input: CreateProductBatchInput!) {\n    createProductBatch(input: $input) {\n      ...ProductBatch\n    }\n  }\n": types.CreateProductBatchDocument,
    "\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id)\n  }\n": types.DeleteProductBatchDocument,
    "\n  query productList {\n    productList {\n      items {\n        sku\n        id\n        name\n      }\n    }\n  }\n": types.ProductListDocument,
    "\n  fragment Status on Status {\n    id\n    title\n    type\n    order\n    storeId\n  }\n": types.StatusFragmentDoc,
    "\n  query statusList {\n    statusList {\n      ...Status\n    }\n  }\n": types.StatusListDocument,
    "\n  mutation createStatus($title: String!) {\n    createStatus(title: $title) {\n      ...Status\n    }\n  }\n": types.CreateStatusDocument,
    "\n  mutation moveStatus($id: Int!, $order: Int!) {\n    moveStatus(id: $id, order: $order) {\n      ...Status\n    }\n  }\n": types.MoveStatusDocument,
    "\n  mutation deleteStatus($id: Int!) {\n    deleteStatus(id: $id) {\n      id\n    }\n  }\n": types.DeleteStatusDocument,
    "\n  mutation createOperation($input: CreateOperationInput!) {\n    createOperation(input: $input) {\n      success\n    }\n  }\n": types.CreateOperationDocument,
    "\n  query operationList($productBatchId: Int!) {\n    operationList(productBatchId: $productBatchId) {\n      items {\n        id\n        name\n      }\n    }\n  }\n": types.OperationListDocument,
    "\n  fragment StoreItem on StoreByProduct {\n    salesCount\n    inStoreCount\n    productBatches {\n      id\n      name\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n    }\n    product {\n      id\n      sku\n      name\n    }\n  }\n": types.StoreItemFragmentDoc,
    "\n  query storeState($productId: Int, $statusId: Int) {\n    storeState(productId: $productId, statusId: $statusId) {\n      id\n      items {\n        ...StoreItem\n      }\n    }\n  }\n": types.StoreStateDocument,
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
export function graphql(source: "\n  query productBatchList {\n    productBatchList {\n      ...ProductBatch\n    }\n  }\n"): (typeof documents)["\n  query productBatchList {\n    productBatchList {\n      ...ProductBatch\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ProductBatch on ProductBatch {\n    id\n    name\n    product {\n      sku\n      name\n    }\n    parentId\n    statusId\n    count\n    pricePerUnit\n    costPrice\n    fullPrice\n    date\n    weight\n    volume\n    order\n  }\n"): (typeof documents)["\n  fragment ProductBatch on ProductBatch {\n    id\n    name\n    product {\n      sku\n      name\n    }\n    parentId\n    statusId\n    count\n    pricePerUnit\n    costPrice\n    fullPrice\n    date\n    weight\n    volume\n    order\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation updateProductBatch($input: UpdateProductBatchInput!) {\n    updateProductBatch(input: $input) {\n      ...ProductBatch\n    }\n  }\n"): (typeof documents)["\n  mutation updateProductBatch($input: UpdateProductBatchInput!) {\n    updateProductBatch(input: $input) {\n      ...ProductBatch\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createProductBatch($input: CreateProductBatchInput!) {\n    createProductBatch(input: $input) {\n      ...ProductBatch\n    }\n  }\n"): (typeof documents)["\n  mutation createProductBatch($input: CreateProductBatchInput!) {\n    createProductBatch(input: $input) {\n      ...ProductBatch\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id)\n  }\n"): (typeof documents)["\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query productList {\n    productList {\n      items {\n        sku\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query productList {\n    productList {\n      items {\n        sku\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment Status on Status {\n    id\n    title\n    type\n    order\n    storeId\n  }\n"): (typeof documents)["\n  fragment Status on Status {\n    id\n    title\n    type\n    order\n    storeId\n  }\n"];
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
export function graphql(source: "\n  mutation moveStatus($id: Int!, $order: Int!) {\n    moveStatus(id: $id, order: $order) {\n      ...Status\n    }\n  }\n"): (typeof documents)["\n  mutation moveStatus($id: Int!, $order: Int!) {\n    moveStatus(id: $id, order: $order) {\n      ...Status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteStatus($id: Int!) {\n    deleteStatus(id: $id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation deleteStatus($id: Int!) {\n    deleteStatus(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createOperation($input: CreateOperationInput!) {\n    createOperation(input: $input) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation createOperation($input: CreateOperationInput!) {\n    createOperation(input: $input) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query operationList($productBatchId: Int!) {\n    operationList(productBatchId: $productBatchId) {\n      items {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query operationList($productBatchId: Int!) {\n    operationList(productBatchId: $productBatchId) {\n      items {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StoreItem on StoreByProduct {\n    salesCount\n    inStoreCount\n    productBatches {\n      id\n      name\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n    }\n    product {\n      id\n      sku\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment StoreItem on StoreByProduct {\n    salesCount\n    inStoreCount\n    productBatches {\n      id\n      name\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n    }\n    product {\n      id\n      sku\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query storeState($productId: Int, $statusId: Int) {\n    storeState(productId: $productId, statusId: $statusId) {\n      id\n      items {\n        ...StoreItem\n      }\n    }\n  }\n"): (typeof documents)["\n  query storeState($productId: Int, $statusId: Int) {\n    storeState(productId: $productId, statusId: $statusId) {\n      id\n      items {\n        ...StoreItem\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;