export enum ActionTypes {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum WalletTransactionStatus {
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
}

export interface IWallet {
  id: string;
  balance: number;
  currency: string;
  userId: string;
  transactions: IWalletTransation[];
}

export interface IWalletTransation {
  id: string;
  userId: string;
  type: ActionTypes;
  amount: number;
  status: WalletTransactionStatus;
  reference: string;
  description: string;
}
