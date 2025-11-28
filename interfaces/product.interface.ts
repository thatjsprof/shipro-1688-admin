export interface IPrice {
  moq: number;
  amountYen: number;
  amountNaira: number;
}

export type ProductFormValues = {
  description?: string;
};

export interface IVariant {
  id: string;
  text: string;
  image?: string;
}

export interface IRating {
  id: string;
  feedback: string;
  feedback_date: Date;
  rate_star: number;
  sku_map: string;
  user_nick: string;
}

export type ISku = Record<
  string,
  {
    height: string;
    id: string;
    length: number;
    price: number;
    stock: number;
    totalSold: number;
    volume: number;
    weight: number;
    width: number;
    priceNaira: number;
  }
>;

export interface IProduct {
  id: string;
  image: string;
  description: string;
  amountYen: number;
  amountNaira: number;
  company: string;
  companyId: string;
  internalProduct: boolean;
  stock: number;
  moq: number;
  category: string;
  info: string[];
  skuPropRows: string[][];
  deliveryFeeYen: number;
  priceRange: [number, number];
  deliveryFeeNaira: number;
  attrs: Record<string, string>[];
  location: string;
  url: string;
  soldOut: boolean;
  prices: IPrice[];
  unit: string;
  totalSold: number;
  variants: {
    size?: IVariant[];
    color?: IVariant[];
    [x: string]: any;
  };
  propsOrder?: string[];
  totalSoldDuration: Record<string, number>;
  supplierConditions: string[]; // e.g 7 days no-reason return
  images: {
    type: string;
    url: string;
    fileName: string;
    key: string;
    // thumbnail: string;
  }[];
  skuPropHeaders: string[];
  propsInfoTable: (string | number)[][];
  skus: Partial<ISku>;
}
