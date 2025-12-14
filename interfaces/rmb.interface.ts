import { IUser } from "./user.interface";

export interface IBeneficiary {
  id: string;
  alipayId: string;
  alipayName: string;
  pictures: {
    fileName: string;
    key: string;
    url: string;
    type: string;
  }[];
  userId: string;
}

export enum PurchaseStatus {
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface RMBPurchase {
  id: string;
  userId: string;
  reference: string;
  status: PurchaseStatus;
  rmbAmount: number;
  rate: number;
  nairaAmount: number;
  description: string;
  datePaid: Date;
  user: IUser;
  details: {
    rmb: number;
    naira: number;
    alipayID: string;
    aliPayName: string;
    aliPayQRcode: string;
  };
}
