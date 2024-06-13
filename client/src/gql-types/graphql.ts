/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateOperationInput = {
  cost: Scalars['Int']['input'];
  date: Scalars['String']['input'];
  name: Scalars['String']['input'];
  productBatchProportions: Array<ProductBatchOperationInput>;
  proportionType: ProportionType;
};

export type CreateOperationResponse = {
  __typename?: 'CreateOperationResponse';
  success: Scalars['Boolean']['output'];
};

export type CreateProductBatchInput = {
  costPrice: Scalars['Int']['input'];
  count: Scalars['Int']['input'];
  date: Scalars['String']['input'];
  name: Scalars['String']['input'];
  productId: Scalars['Int']['input'];
  statusId: Scalars['Int']['input'];
};

export type CreateProductInput = {
  name: Scalars['String']['input'];
  sku: Scalars['String']['input'];
};

export type CreateProductResponse = {
  __typename?: 'CreateProductResponse';
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createOperation: CreateOperationResponse;
  createProduct: CreateProductResponse;
  createProductBatch: ProductBatch;
  createStatus: Array<Status>;
  deleteProductBatch: Scalars['Int']['output'];
  deleteStatus: Array<Status>;
  splitProductBatch: SplitProductBatchResponse;
  updateProductBatch: ProductBatch;
};


export type MutationCreateOperationArgs = {
  input: CreateOperationInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateProductBatchArgs = {
  input: CreateProductBatchInput;
};


export type MutationCreateStatusArgs = {
  title: Scalars['String']['input'];
};


export type MutationDeleteProductBatchArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteStatusArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSplitProductBatchArgs = {
  input: SplitProductBatchInput;
};


export type MutationUpdateProductBatchArgs = {
  input: UpdateProductBatchInput;
};

export type Operation = {
  __typename?: 'Operation';
  cost: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type OperationList = {
  __typename?: 'OperationList';
  items: Array<Operation>;
  totalCount: Scalars['Int']['output'];
};

export type Product = {
  __typename?: 'Product';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  sku: Scalars['String']['output'];
};

export type ProductBatch = {
  __typename?: 'ProductBatch';
  costPrice: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  fullPrice: Scalars['Float']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  pricePerUnit: Scalars['Float']['output'];
  product: Product;
  statusId: Scalars['Int']['output'];
  volume: Scalars['Float']['output'];
  weight: Scalars['Int']['output'];
};

export type ProductBatchOperationInput = {
  cost: Scalars['Int']['input'];
  productBatchId: Scalars['Int']['input'];
  proportion: Scalars['Float']['input'];
};

export type ProductList = {
  __typename?: 'ProductList';
  items: Array<Product>;
  totalCount: Scalars['Int']['output'];
};

export enum ProportionType {
  costPrice = 'costPrice',
  equal = 'equal',
  manual = 'manual',
  volume = 'volume',
  weight = 'weight'
}

export type Query = {
  __typename?: 'Query';
  operationList: OperationList;
  productBatchList: Array<ProductBatch>;
  productList: ProductList;
  statusList: Array<Status>;
};


export type QueryOperationListArgs = {
  productBatchId: Scalars['Int']['input'];
};

export type SplitProductBatchInput = {
  count: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  statusId?: InputMaybe<Scalars['Int']['input']>;
};

export type SplitProductBatchResponse = {
  __typename?: 'SplitProductBatchResponse';
  newItems: Array<ProductBatch>;
};

export type Status = {
  __typename?: 'Status';
  id: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type UpdateProductBatchInput = {
  id: Scalars['Int']['input'];
  statusId: Scalars['Int']['input'];
};

export type CreateOperationMutationVariables = Exact<{
  input: CreateOperationInput;
}>;


export type CreateOperationMutation = { __typename?: 'Mutation', createOperation: { __typename?: 'CreateOperationResponse', success: boolean } };

export type OperationListQueryVariables = Exact<{
  productBatchId: Scalars['Int']['input'];
}>;


export type OperationListQuery = { __typename?: 'Query', operationList: { __typename?: 'OperationList', items: Array<{ __typename?: 'Operation', id: number, name: string }> } };

export type ProductBatchListQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductBatchListQuery = { __typename?: 'Query', productBatchList: Array<{ __typename?: 'ProductBatch', id: number, name: string, parentId?: number | null, statusId: number, count: number, pricePerUnit: number, costPrice: number, fullPrice: number, date: string, weight: number, volume: number, product: { __typename?: 'Product', sku: string, name: string } }> };

export type UpdateProductBatchMutationVariables = Exact<{
  input: UpdateProductBatchInput;
}>;


export type UpdateProductBatchMutation = { __typename?: 'Mutation', updateProductBatch: { __typename?: 'ProductBatch', id: number, name: string, parentId?: number | null, statusId: number, count: number, pricePerUnit: number, costPrice: number, fullPrice: number, date: string, weight: number, volume: number, product: { __typename?: 'Product', sku: string, name: string } } };

export type CreateProductBatchMutationVariables = Exact<{
  input: CreateProductBatchInput;
}>;


export type CreateProductBatchMutation = { __typename?: 'Mutation', createProductBatch: { __typename?: 'ProductBatch', id: number, name: string, parentId?: number | null, statusId: number, count: number, pricePerUnit: number, costPrice: number, fullPrice: number, date: string, weight: number, volume: number, product: { __typename?: 'Product', sku: string, name: string } } };

export type DeleteProductBatchMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteProductBatchMutation = { __typename?: 'Mutation', deleteProductBatch: number };

export type SplitProductBatchMutationVariables = Exact<{
  input: SplitProductBatchInput;
}>;


export type SplitProductBatchMutation = { __typename?: 'Mutation', splitProductBatch: { __typename?: 'SplitProductBatchResponse', newItems: Array<{ __typename?: 'ProductBatch', id: number, name: string, statusId: number, count: number, pricePerUnit: number, costPrice: number, fullPrice: number, date: string, weight: number, volume: number, product: { __typename?: 'Product', sku: string, name: string } }> } };

export type ProductListQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductListQuery = { __typename?: 'Query', productList: { __typename?: 'ProductList', items: Array<{ __typename?: 'Product', id: number, name: string }> } };

export type StatusListQueryVariables = Exact<{ [key: string]: never; }>;


export type StatusListQuery = { __typename?: 'Query', statusList: Array<{ __typename?: 'Status', id: number, title: string }> };

export type CreateStatusMutationVariables = Exact<{
  title: Scalars['String']['input'];
}>;


export type CreateStatusMutation = { __typename?: 'Mutation', createStatus: Array<{ __typename?: 'Status', id: number, title: string }> };

export type DeleteStatusMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteStatusMutation = { __typename?: 'Mutation', deleteStatus: Array<{ __typename?: 'Status', id: number, title: string }> };


export const CreateOperationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createOperation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOperationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOperation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateOperationMutation, CreateOperationMutationVariables>;
export const OperationListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"operationList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productBatchId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operationList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productBatchId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productBatchId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<OperationListQuery, OperationListQueryVariables>;
export const ProductBatchListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]}}]} as unknown as DocumentNode<ProductBatchListQuery, ProductBatchListQueryVariables>;
export const UpdateProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductBatchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]}}]} as unknown as DocumentNode<UpdateProductBatchMutation, UpdateProductBatchMutationVariables>;
export const CreateProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductBatchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]}}]} as unknown as DocumentNode<CreateProductBatchMutation, CreateProductBatchMutationVariables>;
export const DeleteProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProductBatchMutation, DeleteProductBatchMutationVariables>;
export const SplitProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"splitProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SplitProductBatchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"splitProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}}]}}]}}]}}]} as unknown as DocumentNode<SplitProductBatchMutation, SplitProductBatchMutationVariables>;
export const ProductListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ProductListQuery, ProductListQueryVariables>;
export const StatusListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"statusList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statusList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<StatusListQuery, StatusListQueryVariables>;
export const CreateStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<CreateStatusMutation, CreateStatusMutationVariables>;
export const DeleteStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<DeleteStatusMutation, DeleteStatusMutationVariables>;