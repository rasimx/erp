// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v1.176.1
//   protoc               v4.25.3
// source: erp_ozon.proto

/* eslint-disable */
import { Metadata } from "@grpc/grpc-js";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "erp_ozon";

export interface ProductBatch {
  id: number;
  count: number;
  order: number;
}

export interface RelinkPostingsItem {
  baseProductId: number;
  productBatches: ProductBatch[];
}

export interface RelinkPostingsRequest {
  items: RelinkPostingsRequestItem[];
}

export interface RelinkPostingsRequestItem {
  storeId: number;
  items: RelinkPostingsItem[];
}

export interface RelinkPostingsResponse {
  success: boolean;
}

export const ERP_OZON_PACKAGE_NAME = "erp_ozon";

export interface PostingProductServiceClient {
  relinkPostings(request: RelinkPostingsRequest, metadata?: Metadata): Observable<RelinkPostingsResponse>;
}

export interface PostingProductServiceController {
  relinkPostings(
    request: RelinkPostingsRequest,
    metadata?: Metadata,
  ): Promise<RelinkPostingsResponse> | Observable<RelinkPostingsResponse> | RelinkPostingsResponse;
}

export function PostingProductServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["relinkPostings"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("PostingProductService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("PostingProductService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const POSTING_PRODUCT_SERVICE_NAME = "PostingProductService";
