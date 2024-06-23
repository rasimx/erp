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
  costPrice?: InputMaybe<Scalars['Int']['input']>;
  count: Scalars['Int']['input'];
  date?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
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
  createProductBatch?: Maybe<Array<ProductBatch>>;
  createStatus: Array<Status>;
  deleteProductBatch: Scalars['Int']['output'];
  deleteStatus: Array<Status>;
  moveStatus: Array<Status>;
  updateProductBatch: Array<ProductBatch>;
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


export type MutationMoveStatusArgs = {
  id: Scalars['Int']['input'];
  order: Scalars['Int']['input'];
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
  order: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  pricePerUnit: Scalars['Float']['output'];
  product: Product;
  productId: Scalars['Int']['output'];
  status: Status;
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
  storeState: Array<Store>;
};


export type QueryOperationListArgs = {
  productBatchId: Scalars['Int']['input'];
};


export type QueryStoreStateArgs = {
  productId?: InputMaybe<Scalars['Int']['input']>;
  statusId?: InputMaybe<Scalars['Int']['input']>;
};

export type Status = {
  __typename?: 'Status';
  id: Scalars['Int']['output'];
  order: Scalars['Int']['output'];
  storeId?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  type: StatusType;
};

export enum StatusType {
  custom = 'custom',
  ozon = 'ozon',
  wb = 'wb'
}

export type Store = {
  __typename?: 'Store';
  id: Scalars['Int']['output'];
  items: Array<StoreByProduct>;
};

export type StoreByProduct = {
  __typename?: 'StoreByProduct';
  inStoreCount: Scalars['Int']['output'];
  product: Product;
  productBatches: Array<ProductBatch>;
  salesCount: Scalars['Int']['output'];
};

export type UpdateProductBatchInput = {
  id: Scalars['Int']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  statusId: Scalars['Int']['input'];
};

export type ProductBatchListQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductBatchListQuery = { __typename?: 'Query', productBatchList: Array<(
    { __typename?: 'ProductBatch' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> };

export type ProductBatchFragment = { __typename?: 'ProductBatch', id: number, name: string, parentId?: number | null, statusId: number, count: number, pricePerUnit: number, costPrice: number, fullPrice: number, date: string, weight: number, volume: number, order: number, product: { __typename?: 'Product', sku: string, name: string } } & { ' $fragmentName'?: 'ProductBatchFragment' };

export type UpdateProductBatchMutationVariables = Exact<{
  input: UpdateProductBatchInput;
}>;


export type UpdateProductBatchMutation = { __typename?: 'Mutation', updateProductBatch: Array<(
    { __typename?: 'ProductBatch' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> };

export type CreateProductBatchMutationVariables = Exact<{
  input: CreateProductBatchInput;
}>;


export type CreateProductBatchMutation = { __typename?: 'Mutation', createProductBatch?: Array<(
    { __typename?: 'ProductBatch' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> | null };

export type DeleteProductBatchMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteProductBatchMutation = { __typename?: 'Mutation', deleteProductBatch: number };

export type ProductListQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductListQuery = { __typename?: 'Query', productList: { __typename?: 'ProductList', items: Array<{ __typename?: 'Product', sku: string, id: number, name: string }> } };

export type StatusFragment = { __typename?: 'Status', id: number, title: string, type: StatusType, order: number, storeId?: number | null } & { ' $fragmentName'?: 'StatusFragment' };

export type StatusListQueryVariables = Exact<{ [key: string]: never; }>;


export type StatusListQuery = { __typename?: 'Query', statusList: Array<(
    { __typename?: 'Status' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  )> };

export type CreateStatusMutationVariables = Exact<{
  title: Scalars['String']['input'];
}>;


export type CreateStatusMutation = { __typename?: 'Mutation', createStatus: Array<(
    { __typename?: 'Status' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  )> };

export type MoveStatusMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  order: Scalars['Int']['input'];
}>;


export type MoveStatusMutation = { __typename?: 'Mutation', moveStatus: Array<(
    { __typename?: 'Status' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  )> };

export type DeleteStatusMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteStatusMutation = { __typename?: 'Mutation', deleteStatus: Array<{ __typename?: 'Status', id: number }> };

export type CreateOperationMutationVariables = Exact<{
  input: CreateOperationInput;
}>;


export type CreateOperationMutation = { __typename?: 'Mutation', createOperation: { __typename?: 'CreateOperationResponse', success: boolean } };

export type OperationListQueryVariables = Exact<{
  productBatchId: Scalars['Int']['input'];
}>;


export type OperationListQuery = { __typename?: 'Query', operationList: { __typename?: 'OperationList', items: Array<{ __typename?: 'Operation', id: number, name: string }> } };

export type SourceProductBatchFragment = { __typename?: 'ProductBatch', id: number, name: string, statusId: number, count: number, order: number, status: { __typename?: 'Status', id: number, title: string, order: number } } & { ' $fragmentName'?: 'SourceProductBatchFragment' };

export type ProductParentBatchListQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductParentBatchListQuery = { __typename?: 'Query', productBatchList: Array<(
    { __typename?: 'ProductBatch' }
    & { ' $fragmentRefs'?: { 'SourceProductBatchFragment': SourceProductBatchFragment } }
  )> };

export type StoreItemFragment = { __typename?: 'StoreByProduct', salesCount: number, inStoreCount: number, productBatches: Array<{ __typename?: 'ProductBatch', id: number, name: string, count: number, pricePerUnit: number, costPrice: number, fullPrice: number, date: string }>, product: { __typename?: 'Product', id: number, sku: string, name: string } } & { ' $fragmentName'?: 'StoreItemFragment' };

export type StoreStateQueryVariables = Exact<{
  productId?: InputMaybe<Scalars['Int']['input']>;
  statusId?: InputMaybe<Scalars['Int']['input']>;
}>;


export type StoreStateQuery = { __typename?: 'Query', storeState: Array<{ __typename?: 'Store', id: number, items: Array<(
      { __typename?: 'StoreByProduct' }
      & { ' $fragmentRefs'?: { 'StoreItemFragment': StoreItemFragment } }
    )> }> };

export const ProductBatchFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<ProductBatchFragment, unknown>;
export const StatusFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Status"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<StatusFragment, unknown>;
export const SourceProductBatchFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<SourceProductBatchFragment, unknown>;
export const StoreItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreByProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesCount"}},{"kind":"Field","name":{"kind":"Name","value":"inStoreCount"}},{"kind":"Field","name":{"kind":"Name","value":"productBatches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<StoreItemFragment, unknown>;
export const ProductBatchListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<ProductBatchListQuery, ProductBatchListQueryVariables>;
export const UpdateProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductBatchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<UpdateProductBatchMutation, UpdateProductBatchMutationVariables>;
export const CreateProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductBatchInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<CreateProductBatchMutation, CreateProductBatchMutationVariables>;
export const DeleteProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProductBatchMutation, DeleteProductBatchMutationVariables>;
export const ProductListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ProductListQuery, ProductListQueryVariables>;
export const StatusListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"statusList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statusList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Status"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<StatusListQuery, StatusListQueryVariables>;
export const CreateStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Status"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<CreateStatusMutation, CreateStatusMutationVariables>;
export const MoveStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"moveStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"order"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Status"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<MoveStatusMutation, MoveStatusMutationVariables>;
export const DeleteStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteStatusMutation, DeleteStatusMutationVariables>;
export const CreateOperationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createOperation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOperationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOperation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateOperationMutation, CreateOperationMutationVariables>;
export const OperationListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"operationList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productBatchId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"operationList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productBatchId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productBatchId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<OperationListQuery, OperationListQueryVariables>;
export const ProductParentBatchListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productParentBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatch"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<ProductParentBatchListQuery, ProductParentBatchListQueryVariables>;
export const StoreStateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"storeState"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"statusId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeState"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"statusId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"statusId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreItem"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreByProduct"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"salesCount"}},{"kind":"Field","name":{"kind":"Name","value":"inStoreCount"}},{"kind":"Field","name":{"kind":"Name","value":"productBatches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"pricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"costPrice"}},{"kind":"Field","name":{"kind":"Name","value":"fullPrice"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<StoreStateQuery, StoreStateQueryVariables>;