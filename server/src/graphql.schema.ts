
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum ProportionType {
    equal = "equal",
    manual = "manual",
    weight = "weight",
    volume = "volume",
    costPrice = "costPrice"
}

export enum StoreType {
    ozon = "ozon",
    wb = "wb"
}

export interface StoreInput {
    storeId: number;
    storeType: StoreType;
}

export interface CreateProductInput {
    sku: string;
    name: string;
}

export interface UpdateProductBatchInput {
    id: number;
    statusId: number;
    order?: Nullable<number>;
}

export interface CreateProductBatchInput {
    count: number;
    parentId?: Nullable<number>;
    productId?: Nullable<number>;
    date?: Nullable<string>;
    name?: Nullable<string>;
    costPrice?: Nullable<number>;
    order?: Nullable<number>;
    statusId?: Nullable<number>;
    storeId?: Nullable<number>;
    storeType?: Nullable<StoreType>;
}

export interface ProductBatchOperationInput {
    productBatchId: number;
    proportion: number;
    cost: number;
}

export interface CreateOperationInput {
    name: string;
    cost: number;
    proportionType: ProportionType;
    productBatchProportions: ProductBatchOperationInput[];
    date: string;
}

export interface Product {
    id: number;
    sku: string;
    name: string;
}

export interface ProductList {
    items: Product[];
    totalCount: number;
}

export interface Status {
    id: number;
    title: string;
}

export interface ProductBatch {
    id: number;
    name: string;
    productId: number;
    product: Product;
    count: number;
    costPrice: number;
    pricePerUnit: number;
    fullPrice: number;
    date: string;
    weight: number;
    volume: number;
    order: number;
    statusId?: Nullable<number>;
    parentId?: Nullable<number>;
    storeId?: Nullable<number>;
}

export interface Operation {
    id: number;
    name: string;
    cost: number;
    date: string;
}

export interface OperationList {
    items: Operation[];
    totalCount: number;
}

export interface StoreByProduct {
    product: Product;
    productBatches: ProductBatch[];
    salesCount: number;
    inStoreCount: number;
}

export interface Store {
    id: number;
    items: StoreByProduct[];
}

export interface IQuery {
    productList(): ProductList | Promise<ProductList>;
    statusList(): Status[] | Promise<Status[]>;
    productBatchList(): ProductBatch[] | Promise<ProductBatch[]>;
    operationList(productBatchId: number): OperationList | Promise<OperationList>;
    storeState(productId?: Nullable<number>, storeInput?: Nullable<StoreInput>): Store[] | Promise<Store[]>;
}

export interface CreateProductResponse {
    success: boolean;
}

export interface CreateOperationResponse {
    success: boolean;
}

export interface IMutation {
    createOperation(input: CreateOperationInput): CreateOperationResponse | Promise<CreateOperationResponse>;
    createProduct(input: CreateProductInput): CreateProductResponse | Promise<CreateProductResponse>;
    createProductBatch(input: CreateProductBatchInput): Nullable<ProductBatch[]> | Promise<Nullable<ProductBatch[]>>;
    updateProductBatch(input: UpdateProductBatchInput): Nullable<ProductBatch[]> | Promise<Nullable<ProductBatch[]>>;
    deleteProductBatch(id: number): number | Promise<number>;
    createStatus(title: string): Status[] | Promise<Status[]>;
    deleteStatus(id: number): Status[] | Promise<Status[]>;
}

type Nullable<T> = T | null;
