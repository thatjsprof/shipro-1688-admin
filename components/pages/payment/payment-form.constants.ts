import { PackageWeightUnit } from "@/interfaces/order.interface";

export enum PaymentBreakdownType {
  freight = "freight",
  packing_fee = "packing_fee",
  clearance = "clearance",
}

export const defaultPaymentBreakdown = [
  { label: "Freight", value: PaymentBreakdownType.freight },
  { label: "Packing Fee", value: PaymentBreakdownType.packing_fee },
  { label: "Clearance", value: PaymentBreakdownType.clearance },
];

export const getBreakdownUnitsMap = (
  packageWeightUnit: PackageWeightUnit
): Record<string, { prefix: string; suffix: string }> => ({
  [PaymentBreakdownType.freight]: {
    prefix: "$",
    suffix: ` / ${packageWeightUnit.toUpperCase()}`,
  },
  [PaymentBreakdownType.clearance]: {
    prefix: "₦",
    suffix: ` / ${packageWeightUnit.toUpperCase()}`,
  },
  [PaymentBreakdownType.packing_fee]: { prefix: "$", suffix: " / Piece" },
});

export const defaultRedirectLinks = [
  {
    label: "Warehouse",
    value: `${process.env.CLIENT_URL}/orders?tab=warehouse`,
  },
  {
    label: "Orders",
    value: `${process.env.CLIENT_URL}/orders?tab=placed`,
  },
  {
    label: "Shipments",
    value: `${process.env.CLIENT_URL}/orders?tab=shipments`,
  },
];

export const ordersRedirectLink = defaultRedirectLinks[1].value;
export const shipmentsRedirectLink = defaultRedirectLinks[2].value;
