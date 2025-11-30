import { IProduct } from "./product.interface";

export interface ICart {
  userId: string;
  items: {
    id: string;
    product: IProduct;
    quantity: number;
    selected: boolean;
    variants: Record<
      string,
      {
        normalized: string;
        original: string;
      }
    >;
    createdAt: Date;
  }[];
}
