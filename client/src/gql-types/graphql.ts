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
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
};

export type AssemblingSourceDto = {
  id: Scalars['Int']['input'];
  selectedCount: Scalars['Int']['input'];
};

export type CommandResponse = {
  __typename?: 'CommandResponse';
  success: Scalars['Boolean']['output'];
};

export type CreateOperationDto = {
  cost: Scalars['Int']['input'];
  date: Scalars['String']['input'];
  groupId?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  productBatchProportions: Array<ProductBatchOperationInput>;
  proportionType?: InputMaybe<ProportionType>;
};

export type CreateProductBatchDto = {
  costPricePerUnit: Scalars['Int']['input'];
  count: Scalars['Int']['input'];
  groupId?: InputMaybe<Scalars['Int']['input']>;
  operationsPrice?: InputMaybe<Scalars['Int']['input']>;
  operationsPricePerUnit?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  statusId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateProductBatchGroupDto = {
  existProductBatchIds: Array<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  newProductBatches: Array<CreateProductBatchDto>;
  statusId: Scalars['Int']['input'];
};

export type CreateProductBatchesByAssemblingDto = {
  fullCount: Scalars['Int']['input'];
  groupId?: InputMaybe<Scalars['Int']['input']>;
  productSetId: Scalars['Int']['input'];
  sources: Array<AssemblingSourceDto>;
  statusId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateProductBatchesFromSourcesDto = {
  fullCount: Scalars['Int']['input'];
  groupId?: InputMaybe<Scalars['Int']['input']>;
  productId: Scalars['Int']['input'];
  sources: Array<SourceProductBatchDto>;
  statusId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateProductDto = {
  name: Scalars['String']['input'];
  sku: Scalars['String']['input'];
};

export type EventDto = {
  __typename?: 'EventDto';
  data: Scalars['JSONObject']['output'];
  type: Scalars['String']['output'];
};

export type GetProductBatchListDto = {
  productIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  statusIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type MoveProductBatchDto = {
  groupId?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  statusId?: InputMaybe<Scalars['Int']['input']>;
};

export type MoveProductBatchGroupDto = {
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
  createOperation: CommandResponse;
  createProduct: ProductDto;
  createProductBatch: CommandResponse;
  createProductBatchGroup: CommandResponse;
  createProductBatchesByAssembling: CommandResponse;
  createProductBatchesFromSources: CommandResponse;
  createStatus: Array<StatusDto>;
  deleteProductBatch: CommandResponse;
  deleteProductBatchGroup: CommandResponse;
  moveProductBatch: CommandResponse;
  moveProductBatchGroup: CommandResponse;
  moveStatus: Array<StatusDto>;
};


export type MutationCreateOperationArgs = {
  dto: CreateOperationDto;
};


export type MutationCreateProductArgs = {
  input: CreateProductDto;
};


export type MutationCreateProductBatchArgs = {
  dto: CreateProductBatchDto;
};


export type MutationCreateProductBatchGroupArgs = {
  dto: CreateProductBatchGroupDto;
};


export type MutationCreateProductBatchesByAssemblingArgs = {
  dto: CreateProductBatchesByAssemblingDto;
};


export type MutationCreateProductBatchesFromSourcesArgs = {
  dto: CreateProductBatchesFromSourcesDto;
};


export type MutationCreateStatusArgs = {
  title: Scalars['String']['input'];
};


export type MutationDeleteProductBatchArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteProductBatchGroupArgs = {
  id: Scalars['Int']['input'];
};


export type MutationMoveProductBatchArgs = {
  dto: MoveProductBatchDto;
};


export type MutationMoveProductBatchGroupArgs = {
  dto: MoveProductBatchGroupDto;
};


export type MutationMoveStatusArgs = {
  dto: MoveStatusDto;
};

export type OperationDto = {
  __typename?: 'OperationDto';
  cost: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  date: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  proportionType: ProportionType;
};

export type ProductBatchDetailDto = {
  __typename?: 'ProductBatchDetailDto';
  costPricePerUnit: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
  events: Array<EventDto>;
  group?: Maybe<ProductBatchGroupDto>;
  groupId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  operations: Array<OperationDto>;
  operationsPricePerUnit: Scalars['Int']['output'];
  order: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  product: ProductDto;
  productId: Scalars['Int']['output'];
  status?: Maybe<StatusDto>;
  statusId?: Maybe<Scalars['Int']['output']>;
  volume: Scalars['Float']['output'];
  weight: Scalars['Int']['output'];
};

export type ProductBatchDto = {
  __typename?: 'ProductBatchDto';
  costPricePerUnit: Scalars['Int']['output'];
  count: Scalars['Int']['output'];
  group?: Maybe<ProductBatchGroupDto>;
  groupId?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  operationsPricePerUnit: Scalars['Int']['output'];
  order: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  product: ProductDto;
  productId: Scalars['Int']['output'];
  status?: Maybe<StatusDto>;
  statusId?: Maybe<Scalars['Int']['output']>;
  volume: Scalars['Float']['output'];
  weight: Scalars['Int']['output'];
};

export type ProductBatchGroupDetailDto = {
  __typename?: 'ProductBatchGroupDetailDto';
  events: Array<EventDto>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  productBatchList: Array<ProductBatchDto>;
  status: StatusDto;
  statusId: Scalars['Int']['output'];
};

export type ProductBatchGroupDto = {
  __typename?: 'ProductBatchGroupDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  productBatchList: Array<ProductBatchDto>;
  status: StatusDto;
  statusId: Scalars['Int']['output'];
};

export type ProductBatchOperationInput = {
  cost: Scalars['Int']['input'];
  productBatchId: Scalars['Int']['input'];
  proportion: Scalars['Float']['input'];
};

export type ProductDto = {
  __typename?: 'ProductDto';
  height: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  length: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  setItems: Array<SetItemDto>;
  sku: Scalars['String']['output'];
  weight: Scalars['Int']['output'];
  width: Scalars['Int']['output'];
};

export type ProductListDto = {
  __typename?: 'ProductListDto';
  items: Array<ProductDto>;
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
  productBatchDetail: ProductBatchDetailDto;
  productBatchGroupDetail: ProductBatchGroupDetailDto;
  productBatchGroupList: Array<ProductBatchGroupDto>;
  productBatchList: Array<ProductBatchDto>;
  productList: ProductListDto;
  productSetList: ProductListDto;
  status: StatusDto;
  statusList: Array<StatusDto>;
};


export type QueryProductBatchDetailArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProductBatchGroupDetailArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProductBatchGroupListArgs = {
  dto: GetProductBatchListDto;
};


export type QueryProductBatchListArgs = {
  dto: GetProductBatchListDto;
};


export type QueryProductListArgs = {
  ids?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryStatusArgs = {
  id: Scalars['Int']['input'];
};


export type QueryStatusListArgs = {
  ids?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type SetItemDto = {
  __typename?: 'SetItemDto';
  name: Scalars['String']['output'];
  productId: Scalars['Int']['output'];
  qty: Scalars['Int']['output'];
  sku: Scalars['String']['output'];
};

export type SourceProductBatchDto = {
  id: Scalars['Int']['input'];
  selectedCount: Scalars['Int']['input'];
};

export type StatusDto = {
  __typename?: 'StatusDto';
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

export type KanbanCardsQueryVariables = Exact<{
  dto: GetProductBatchListDto;
}>;


export type KanbanCardsQuery = { __typename?: 'Query', productBatchList: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )>, productBatchGroupList: Array<(
    { __typename?: 'ProductBatchGroupDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchGroupFragment': ProductBatchGroupFragment } }
  )> };

export type CreateOperationMutationVariables = Exact<{
  dto: CreateOperationDto;
}>;


export type CreateOperationMutation = { __typename?: 'Mutation', createOperation: { __typename?: 'CommandResponse', success: boolean } };

export type ProductBatchGroupDetailFragment = { __typename?: 'ProductBatchGroupDetailDto', id: number, name: string, statusId: number, order: number, status: { __typename?: 'StatusDto', id: number, title: string, order: number }, productBatchList: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )>, events: Array<(
    { __typename?: 'EventDto' }
    & { ' $fragmentRefs'?: { 'EventFragment': EventFragment } }
  )> } & { ' $fragmentName'?: 'ProductBatchGroupDetailFragment' };

export type ProductBatchGroupDetailQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ProductBatchGroupDetailQuery = { __typename?: 'Query', productBatchGroupDetail: (
    { __typename?: 'ProductBatchGroupDetailDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchGroupDetailFragment': ProductBatchGroupDetailFragment } }
  ) };

export type ProductBatchGroupFragment = { __typename?: 'ProductBatchGroupDto', id: number, name: string, statusId: number, order: number, status: { __typename?: 'StatusDto', id: number, title: string, order: number }, productBatchList: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> } & { ' $fragmentName'?: 'ProductBatchGroupFragment' };

export type MoveProductBatchGroupMutationVariables = Exact<{
  dto: MoveProductBatchGroupDto;
}>;


export type MoveProductBatchGroupMutation = { __typename?: 'Mutation', moveProductBatchGroup: { __typename?: 'CommandResponse', success: boolean } };

export type CreateProductBatchGroupMutationVariables = Exact<{
  dto: CreateProductBatchGroupDto;
}>;


export type CreateProductBatchGroupMutation = { __typename?: 'Mutation', createProductBatchGroup: { __typename?: 'CommandResponse', success: boolean } };

export type DeleteProductBatchGroupMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteProductBatchGroupMutation = { __typename?: 'Mutation', deleteProductBatchGroup: { __typename?: 'CommandResponse', success: boolean } };

export type EventFragment = { __typename?: 'EventDto', type: string, data: any } & { ' $fragmentName'?: 'EventFragment' };

export type OperationFragment = { __typename?: 'OperationDto', id: number, name: string, cost: number, date: string, proportionType: ProportionType, createdAt: string } & { ' $fragmentName'?: 'OperationFragment' };

export type ProductBatchDetailFragment = { __typename?: 'ProductBatchDetailDto', id: number, groupId?: number | null, productId: number, parentId?: number | null, statusId?: number | null, count: number, costPricePerUnit: number, operationsPricePerUnit: number, order: number, volume: number, weight: number, product: (
    { __typename?: 'ProductDto' }
    & { ' $fragmentRefs'?: { 'ProductFragment': ProductFragment } }
  ), status?: { __typename?: 'StatusDto', id: number, title: string, order: number } | null, group?: { __typename?: 'ProductBatchGroupDto', id: number, order: number } | null, operations: Array<(
    { __typename?: 'OperationDto' }
    & { ' $fragmentRefs'?: { 'OperationFragment': OperationFragment } }
  )>, events: Array<(
    { __typename?: 'EventDto' }
    & { ' $fragmentRefs'?: { 'EventFragment': EventFragment } }
  )> } & { ' $fragmentName'?: 'ProductBatchDetailFragment' };

export type ProductBatchDetailQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type ProductBatchDetailQuery = { __typename?: 'Query', productBatchDetail: (
    { __typename?: 'ProductBatchDetailDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchDetailFragment': ProductBatchDetailFragment } }
  ) };

export type ProductBatchListQueryVariables = Exact<{
  dto: GetProductBatchListDto;
}>;


export type ProductBatchListQuery = { __typename?: 'Query', productBatchList: Array<(
    { __typename?: 'ProductBatchDto' }
    & { ' $fragmentRefs'?: { 'ProductBatchFragment': ProductBatchFragment } }
  )> };

export type ProductBatchFragment = { __typename?: 'ProductBatchDto', id: number, groupId?: number | null, productId: number, parentId?: number | null, statusId?: number | null, count: number, costPricePerUnit: number, operationsPricePerUnit: number, order: number, volume: number, weight: number, product: (
    { __typename?: 'ProductDto' }
    & { ' $fragmentRefs'?: { 'ProductFragment': ProductFragment } }
  ), status?: { __typename?: 'StatusDto', id: number, title: string, order: number } | null, group?: { __typename?: 'ProductBatchGroupDto', id: number, order: number } | null } & { ' $fragmentName'?: 'ProductBatchFragment' };

export type MoveProductBatchMutationVariables = Exact<{
  dto: MoveProductBatchDto;
}>;


export type MoveProductBatchMutation = { __typename?: 'Mutation', moveProductBatch: { __typename?: 'CommandResponse', success: boolean } };

export type CreateProductBatchMutationVariables = Exact<{
  dto: CreateProductBatchDto;
}>;


export type CreateProductBatchMutation = { __typename?: 'Mutation', createProductBatch: { __typename?: 'CommandResponse', success: boolean } };

export type CreateProductBatchesByAssemblingMutationVariables = Exact<{
  dto: CreateProductBatchesByAssemblingDto;
}>;


export type CreateProductBatchesByAssemblingMutation = { __typename?: 'Mutation', createProductBatchesByAssembling: { __typename?: 'CommandResponse', success: boolean } };

export type CreateProductBatchesFromSourcesMutationVariables = Exact<{
  dto: CreateProductBatchesFromSourcesDto;
}>;


export type CreateProductBatchesFromSourcesMutation = { __typename?: 'Mutation', createProductBatchesFromSources: { __typename?: 'CommandResponse', success: boolean } };

export type DeleteProductBatchMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteProductBatchMutation = { __typename?: 'Mutation', deleteProductBatch: { __typename?: 'CommandResponse', success: boolean } };

export type SetItemFragment = { __typename?: 'SetItemDto', productId: number, name: string, sku: string, qty: number } & { ' $fragmentName'?: 'SetItemFragment' };

export type ProductFragment = { __typename?: 'ProductDto', id: number, name: string, sku: string, setItems: Array<(
    { __typename?: 'SetItemDto' }
    & { ' $fragmentRefs'?: { 'SetItemFragment': SetItemFragment } }
  )> } & { ' $fragmentName'?: 'ProductFragment' };

export type ProductSetFragment = { __typename?: 'ProductDto', id: number, name: string, sku: string, setItems: Array<(
    { __typename?: 'SetItemDto' }
    & { ' $fragmentRefs'?: { 'SetItemFragment': SetItemFragment } }
  )> } & { ' $fragmentName'?: 'ProductSetFragment' };

export type ProductListQueryVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type ProductListQuery = { __typename?: 'Query', productList: { __typename?: 'ProductListDto', items: Array<(
      { __typename?: 'ProductDto' }
      & { ' $fragmentRefs'?: { 'ProductFragment': ProductFragment } }
    )> } };

export type ProductSetListQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductSetListQuery = { __typename?: 'Query', productSetList: { __typename?: 'ProductListDto', items: Array<(
      { __typename?: 'ProductDto' }
      & { ' $fragmentRefs'?: { 'ProductFragment': ProductFragment } }
    )> } };

export type StatusFragment = { __typename?: 'StatusDto', id: number, title: string, type: StatusType, order: number, storeId?: number | null } & { ' $fragmentName'?: 'StatusFragment' };

export type StatusListQueryVariables = Exact<{
  ids?: InputMaybe<Array<Scalars['Int']['input']> | Scalars['Int']['input']>;
}>;


export type StatusListQuery = { __typename?: 'Query', statusList: Array<(
    { __typename?: 'StatusDto' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  )> };

export type StatusQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type StatusQuery = { __typename?: 'Query', status: (
    { __typename?: 'StatusDto' }
    & { ' $fragmentRefs'?: { 'StatusFragment': StatusFragment } }
  ) };

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

export const SetItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}}]} as unknown as DocumentNode<SetItemFragment, unknown>;
export const ProductFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}}]} as unknown as DocumentNode<ProductFragment, unknown>;
export const ProductBatchFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}}]} as unknown as DocumentNode<ProductBatchFragment, unknown>;
export const EventFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<EventFragment, unknown>;
export const ProductBatchGroupDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatchGroupDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchGroupDetailDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<ProductBatchGroupDetailFragment, unknown>;
export const ProductBatchGroupFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatchGroup"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchGroupDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]} as unknown as DocumentNode<ProductBatchGroupFragment, unknown>;
export const OperationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Operation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"proportionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<OperationFragment, unknown>;
export const ProductBatchDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatchDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDetailDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Operation"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Operation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"proportionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]} as unknown as DocumentNode<ProductBatchDetailFragment, unknown>;
export const ProductSetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductSet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}}]} as unknown as DocumentNode<ProductSetFragment, unknown>;
export const StatusFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<StatusFragment, unknown>;
export const KanbanCardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"kanbanCards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductBatchListDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}},{"kind":"Field","name":{"kind":"Name","value":"productBatchGroupList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatchGroup"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatchGroup"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchGroupDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}}]} as unknown as DocumentNode<KanbanCardsQuery, KanbanCardsQueryVariables>;
export const CreateOperationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createOperation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOperationDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOperation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateOperationMutation, CreateOperationMutationVariables>;
export const ProductBatchGroupDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productBatchGroupDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchGroupDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatchGroupDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatchGroupDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchGroupDetailDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}}]} as unknown as DocumentNode<ProductBatchGroupDetailQuery, ProductBatchGroupDetailQueryVariables>;
export const MoveProductBatchGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"moveProductBatchGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveProductBatchGroupDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveProductBatchGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<MoveProductBatchGroupMutation, MoveProductBatchGroupMutationVariables>;
export const CreateProductBatchGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProductBatchGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductBatchGroupDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductBatchGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateProductBatchGroupMutation, CreateProductBatchGroupMutationVariables>;
export const DeleteProductBatchGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteProductBatchGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProductBatchGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteProductBatchGroupMutation, DeleteProductBatchGroupMutationVariables>;
export const ProductBatchDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productBatchDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchDetail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatchDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Operation"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OperationDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"proportionType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Event"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"EventDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatchDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDetailDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"operations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Operation"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Event"}}]}}]}}]} as unknown as DocumentNode<ProductBatchDetailQuery, ProductBatchDetailQueryVariables>;
export const ProductBatchListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productBatchList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetProductBatchListDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBatchList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductBatch"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductBatch"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductBatchDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"statusId"}},{"kind":"Field","name":{"kind":"Name","value":"status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"costPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"operationsPricePerUnit"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"volume"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"group"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}}]}}]} as unknown as DocumentNode<ProductBatchListQuery, ProductBatchListQueryVariables>;
export const MoveProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"moveProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveProductBatchDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<MoveProductBatchMutation, MoveProductBatchMutationVariables>;
export const CreateProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductBatchDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateProductBatchMutation, CreateProductBatchMutationVariables>;
export const CreateProductBatchesByAssemblingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProductBatchesByAssembling"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductBatchesByAssemblingDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductBatchesByAssembling"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateProductBatchesByAssemblingMutation, CreateProductBatchesByAssemblingMutationVariables>;
export const CreateProductBatchesFromSourcesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createProductBatchesFromSources"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductBatchesFromSourcesDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductBatchesFromSources"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CreateProductBatchesFromSourcesMutation, CreateProductBatchesFromSourcesMutationVariables>;
export const DeleteProductBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteProductBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProductBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<DeleteProductBatchMutation, DeleteProductBatchMutationVariables>;
export const ProductListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}}]} as unknown as DocumentNode<ProductListQuery, ProductListQueryVariables>;
export const ProductSetListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"productSetList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productSetList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Product"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SetItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SetItemDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"qty"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"setItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SetItem"}}]}}]}}]} as unknown as DocumentNode<ProductSetListQuery, ProductSetListQueryVariables>;
export const StatusListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"statusList"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"statusList"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<StatusListQuery, StatusListQueryVariables>;
export const StatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"status"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<StatusQuery, StatusQueryVariables>;
export const CreateStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<CreateStatusMutation, CreateStatusMutationVariables>;
export const MoveStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"moveStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dto"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MoveStatusDto"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"dto"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dto"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"Status"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Status"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StatusDto"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"order"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<MoveStatusMutation, MoveStatusMutationVariables>;