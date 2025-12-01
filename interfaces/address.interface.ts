export interface IAddress {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  state: string;
  city: string;
  country: string;
  address: string;
  addressPlaceId: string;
  postalCode: string;
  phoneNumber: string;
  isDefault: boolean;
  apartment?: string;
  save?: boolean;
}
