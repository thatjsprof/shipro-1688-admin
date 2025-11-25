export interface IRate {
  id: string;
  name: string;
  baseToConverted: number;
  convertedToBase: number;
  baseCurrency: string;
  convertedCurrency: string;
  description: string;
  isActive: boolean;
}

export interface ISetting {
  hkPrice: number;
  gzPrice: number;
}
