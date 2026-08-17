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

export interface IAccountDialogSlide {
  id: string;
  active: boolean;
  title: string;
  message: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  displaySeconds: number;
  durationHours: number;
  publishedAt?: string | null;
  expiresAt?: string | null;
  restart?: boolean;
}

export interface ISetting {
  hkPrice: number;
  gzPrice: number;
  cbmPrice: number;
  clearanceFee: number;
  accountDialogEnabled: boolean;
  accountDialogTitle: string;
  accountDialogMessage: string;
  accountDialogId: string | null;
  accountDialogImageUrl: string;
  accountDialogCtaLabel: string;
  accountDialogCtaUrl: string;
  accountDialogDurationHours: number | null;
  accountDialogPublishedAt: string | null;
  accountDialogExpiresAt: string | null;
  accountDialogSlides: IAccountDialogSlide[] | null;
}
