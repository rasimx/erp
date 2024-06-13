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
    "\n  mutation createOperation($input: CreateOperationInput!) {\n    createOperation(input: $input) {\n      success\n    }\n  }\n": types.CreateOperationDocument,
    "\n  query operationList($productBatchId: Int!) {\n    operationList(productBatchId: $productBatchId) {\n      items {\n        id\n        name\n      }\n    }\n  }\n": types.OperationListDocument,
    "\n  query productBatchList {\n    productBatchList {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n": types.ProductBatchListDocument,
    "\n  mutation updateProductBatch($input: UpdateProductBatchInput!) {\n    updateProductBatch(input: $input) {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n": types.UpdateProductBatchDocument,
    "\n  mutation createProductBatch($input: CreateProductBatchInput!) {\n    createProductBatch(input: $input) {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n": types.CreateProductBatchDocument,
    "\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id)\n  }\n": types.DeleteProductBatchDocument,
    "\n  mutation splitProductBatch($input: SplitProductBatchInput!) {\n    splitProductBatch(input: $input) {\n      newItems {\n        id\n        name\n        product {\n          sku\n          name\n        }\n        statusId\n        count\n        pricePerUnit\n        costPrice\n        fullPrice\n        date\n        weight\n        volume\n      }\n    }\n  }\n": types.SplitProductBatchDocument,
    "\n  query productList {\n    productList {\n      items {\n        id\n        name\n      }\n    }\n  }\n": types.ProductListDocument,
    "\n  query statusList {\n    statusList {\n      id\n      title\n    }\n  }\n": types.StatusListDocument,
    "\n  mutation createStatus($title: String!) {\n    createStatus(title: $title) {\n      id\n      title\n    }\n  }\n": types.CreateStatusDocument,
    "\n  mutation deleteStatus($id: Int!) {\n    deleteStatus(id: $id) {\n      id\n      title\n    }\n  }\n": types.DeleteStatusDocument,
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
export function graphql(source: "\n  mutation createOperation($input: CreateOperationInput!) {\n    createOperation(input: $input) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation createOperation($input: CreateOperationInput!) {\n    createOperation(input: $input) {\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query operationList($productBatchId: Int!) {\n    operationList(productBatchId: $productBatchId) {\n      items {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query operationList($productBatchId: Int!) {\n    operationList(productBatchId: $productBatchId) {\n      items {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query productBatchList {\n    productBatchList {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n"): (typeof documents)["\n  query productBatchList {\n    productBatchList {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation updateProductBatch($input: UpdateProductBatchInput!) {\n    updateProductBatch(input: $input) {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n"): (typeof documents)["\n  mutation updateProductBatch($input: UpdateProductBatchInput!) {\n    updateProductBatch(input: $input) {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createProductBatch($input: CreateProductBatchInput!) {\n    createProductBatch(input: $input) {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n"): (typeof documents)["\n  mutation createProductBatch($input: CreateProductBatchInput!) {\n    createProductBatch(input: $input) {\n      id\n      name\n      product {\n        sku\n        name\n      }\n      parentId\n      statusId\n      count\n      pricePerUnit\n      costPrice\n      fullPrice\n      date\n      weight\n      volume\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id)\n  }\n"): (typeof documents)["\n  mutation deleteProductBatch($id: Int!) {\n    deleteProductBatch(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation splitProductBatch($input: SplitProductBatchInput!) {\n    splitProductBatch(input: $input) {\n      newItems {\n        id\n        name\n        product {\n          sku\n          name\n        }\n        statusId\n        count\n        pricePerUnit\n        costPrice\n        fullPrice\n        date\n        weight\n        volume\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation splitProductBatch($input: SplitProductBatchInput!) {\n    splitProductBatch(input: $input) {\n      newItems {\n        id\n        name\n        product {\n          sku\n          name\n        }\n        statusId\n        count\n        pricePerUnit\n        costPrice\n        fullPrice\n        date\n        weight\n        volume\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query productList {\n    productList {\n      items {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query productList {\n    productList {\n      items {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query statusList {\n    statusList {\n      id\n      title\n    }\n  }\n"): (typeof documents)["\n  query statusList {\n    statusList {\n      id\n      title\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation createStatus($title: String!) {\n    createStatus(title: $title) {\n      id\n      title\n    }\n  }\n"): (typeof documents)["\n  mutation createStatus($title: String!) {\n    createStatus(title: $title) {\n      id\n      title\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation deleteStatus($id: Int!) {\n    deleteStatus(id: $id) {\n      id\n      title\n    }\n  }\n"): (typeof documents)["\n  mutation deleteStatus($id: Int!) {\n    deleteStatus(id: $id) {\n      id\n      title\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;