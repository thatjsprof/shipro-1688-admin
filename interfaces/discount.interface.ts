export enum DiscountRule {
  ONE_PER_USER = "ONE_PER_USER",
  MULTIPLE_PER_USER = "MULTIPLE_PER_USER",
  SINGLE_USE = "SINGLE_USE",
  PUBLIC = "PUBLIC",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export interface IDiscountUser {
  id: string;
  name?: string;
  email?: string;
}

export interface IDiscount {
  id: string;
  title: string;
  description?: string;
  type?: DiscountType;
  percentage?: number | null;
  amount?: number | null;
  rule: DiscountRule;
  active: boolean;
  global: boolean;
  userId?: string | null;
  user?: IDiscountUser | null;
  users?: IDiscountUser[];
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  redemptionCount: number;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdOn: string;
  modifiedOn: string;
}

export type CreateDiscountPayload = {
  title: string;
  description?: string;
  type: DiscountType;
  percentage?: number | null;
  amount?: number | null;
  rule: DiscountRule;
  active?: boolean;
  global?: boolean;
  userId?: string | null;
  userIds?: string[];
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
};

export type UpdateDiscountPayload = Partial<
  Omit<CreateDiscountPayload, "title">
>;
