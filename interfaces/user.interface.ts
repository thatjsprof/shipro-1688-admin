export enum IUserRole {
  user = "user",
  admin = "admin",
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  image: string;
  phoneNumber: string;
  country: string;
  role: IUserRole;
}
