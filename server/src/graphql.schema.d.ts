
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* eslint-disable */

export interface CreateProductInput {
    sku: string;
    name: string;
}

export interface OperationInput {
    name: string;
    price: number;
}

export interface UpdateProductBatchInput {
    id: number;
    statusId: number;
    operations?: Nullable<OperationInput[]>;
}

export interface CreateProductBatchInput {
    statusId: number;
    productId: number;
    count: number;
    price: number;
    date: string;
}

export interface CreateOperationInput {
    name: string;
    price: number;
    productBatchId: number;
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
    product: Product;
    status: Status;
    count: number;
    price: number;
    date: string;
}

export interface Operation {
    id: number;
    name: string;
    price: number;
    date: string;
}

export interface OperationList {
    items: Operation[];
    totalCount: number;
}

export interface IQuery {
    productList(): ProductList | Promise<ProductList>;
    statusList(): Status[] | Promise<Status[]>;
    productBatchList(): ProductBatch[] | Promise<ProductBatch[]>;
    operationList(productBatchId: number): OperationList | Promise<OperationList>;
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
    createProductBatch(input: CreateProductBatchInput): ProductBatch | Promise<ProductBatch>;
    updateProductBatch(input: UpdateProductBatchInput): ProductBatch | Promise<ProductBatch>;
    deleteProductBatch(id: number): number | Promise<number>;
    createStatus(title: string): Status[] | Promise<Status[]>;
    deleteStatus(id: number): Status[] | Promise<Status[]>;
}

type Nullable<T> = T | null;
