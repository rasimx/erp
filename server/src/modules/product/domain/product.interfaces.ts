export interface CreateProductProps {
  id: number;
  name: string;
  sku: string;
  width: number; // в мм
  height: number; // в мм
  length: number; // в мм
  weight: number; // в граммах

  setItems: { productId: number; qty: number }[];
}

export interface ProductProps {
  id: number;
  name: string;
  sku: string;
  width: number; // в мм
  height: number; // в мм
  length: number; // в мм
  weight: number; // в граммах

  setItems: { productId: number; qty: number }[];

  revision?: number;
}
