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

export type CreateProductBatchDto = {
  costPricePerUnit?: InputMaybe<Scalars['Int']['input']>;
  count: Scalars['Int']['input'];
  date?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  statusId: Scalars['Int']['input'];
};

export type CreateProductDto = {
  name: Scalars['String']['input'];
  sku: Scalars['String']['input'];
};

export type MoveProductBatchDto = {
  id: Scalars['Int']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  statusId: Scalars['Int']['input'];
};

export type MoveStatusDto = {
  id: Scalars['Int']['input'];
  order: Scalars['Int']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createProduct: ProductDto;
  createProductBatch: Array<ProductBatchDto>;
  createStatus: Array<StatusDto>;
  deleteProductBatch: Scalars['Int']['output'];
  moveProductBatch: Array<ProductBatchDto>;
  moveStatus: Array<StatusDto>;
};


export type MutationCreateProductArgs = {
  input: CreateProductDto;
};


export type MutationCreateProductBatchArgs = {
  dto: CreateProductBatchDto;
};


export type MutationCreateStatusArgs = {
  title: Scalars['String']['input'];
};


export type MutationDeleteProductBatchArgs = {
  id: Scalars['Int']['input'];
};


export type MutationMoveProductBatchArgs = {
  dto: MoveProductBatchDto;
};


export type MutationMoveStatusArgs = {
  dto: MoveStatusDto;
};

export type ProductBatchDto = {
  __typename?: 'ProductBatchDto';
  costPricePerUnit: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  operationsPricePerUnit: Scalars['Int']['output'];
  order: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  product: ProductDto;
  productId: Scalars['Int']['output'];
  status: StatusDto;
  statusId: Scalars['Int']['output'];
};

export type ProductDto = {
  __typename?: 'ProductDto';
  height: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  length: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  sku: Scalars['String']['output'];
  weight: Scalars['Int']['output'];
  width: Scalars['Int']['output'];
};

export type ProductListDto = {
  __typename?: 'ProductListDto';
  items: Array<ProductDto>;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  productBatchList: Array<ProductBatchDto>;
  productList: ProductListDto;
  statusList: Array<StatusDto>;
};


export type QueryProductBatchListArgs = {
  productId?: InputMaybe<Scalars['Int']['input']>;
};

export type StatusDto = {
  __typename?: 'StatusDto';
  id: Scalars['Int']['output'];
  order: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  type: StatusType;
};

export enum StatusType {
  custom = 'custom',
  ozon = 'ozon',
  wb = 'wb'
}

export type ProductBatchListQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;


export type ProductBatchListQuery = { __typename?: 'Query', productBatchList: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> };

export type ProductBatchFragment = { __typename?: 'ProductBatchDto', id: number, name: string, parentId?: number | null, statusId: number, count: number, costPricePerUnit: number, operationsPricePerUnit: number, date: string, order: number, product: { __typename?: 'ProductDto', sku: string, name: string } } & { ' $fragmentName'?: 'ProductBatchFragment' };

export type MoveProductBatchMutationVariables = Exact<{
  dto: MoveProductBatchDto;
}>;


export type MoveProductBatchMutation = { __typename?: 'Mutation', moveProductBatch: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> };

export type CreateProductBatchMutationVariables = Exact<{
  dto: CreateProductBatchDto;
}>;


export type CreateProductBatchMutation = { __typename?: 'Mutation', createProductBatch: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> };

export type DeleteProductBatchMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteProductBatchMutation = { __typename?: 'Mutation', deleteProductBatch: number };

export type ProductListQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductListQuery = { __typename?: 'Query', productList: { __typename?: 'ProductListDto', items: Array<{ __typename?: 'ProductDto', sku: string, id: number, name: string }> } };

export type StatusFragment = { __typename?: 'StatusDto', id: number, title: string, type: StatusType, order: number } & { ' $fragmentName'?: 'StatusFragment' };

export type StatusListQueryVariables = Exact<{ [key: string]: never; }>;


export type StatusListQuery = { __typename?: 'Query', statusList: Array<(
    { __typename?: 'StatusDto' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  )> };

export type CreateStatusMutationVariables = Exact<{
  title: Scalars['String']['input'];
}>;


export type CreateStatusMutation = { __typename?: 'Mutation', createStatus: Array<(
    { __typename?: 'StatusDto' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  )> };

export type MoveStatusMutationVariables = Exact<{
  dto: MoveStatusDto;
}>;


export type MoveStatusMutation = { __typename?: 'Mutation', moveStatus: Array<(
    { __typename?: 'StatusDto' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  )> };

export type SourceProductBatchFragment = { __typename?: 'ProductBatchDto', id: number, name: string, statusId: number, count: number, order: number, status: { __typename?: 'StatusDto', id: number, title: string, order: number } } & { ' $fragmentName'?: 'SourceProductBatchFragment' };

export type ProductParentBatchListQueryVariables = Exact<{
  productId: Scalars['Int']['input'];
}>;


export type ProductParentBatchListQuery = { __typename?: 'Query', productBatchList: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'SourceProductBatchFragment': SourceProductBatchFragment } }
  )> };

export const ProductBatchFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<ProductBatchFragment, unknown>;
export const StatusFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<StatusFragment, unknown>;
export const SourceProductBatchFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<SourceProductBatchFragment, unknown>;
export const ProductBatchListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productBatchList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<ProductBatchListQuery, ProductBatchListQueryVariables>;
export const MoveProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"moveProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveProductBatchDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<MoveProductBatchMutation, MoveProductBatchMutationVariables>;
export const CreateProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductBatchDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<CreateProductBatchMutation, CreateProductBatchMutationVariables>;
export const DeleteProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProductBatchMutation, DeleteProductBatchMutationVariables>;
export const ProductListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<ProductListQuery, ProductListQueryVariables>;
export const StatusListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"statusList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statusList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<StatusListQuery, StatusListQueryVariables>;
export const CreateStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<CreateStatusMutation, CreateStatusMutationVariables>;
export const MoveStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"moveStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveStatusDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<MoveStatusMutation, MoveStatusMutationVariables>;
export const ProductParentBatchListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productParentBatchList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SourceProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SourceProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]} as unknown as DocumentNode<ProductParentBatchListQuery, ProductParentBatchListQueryVariables>;