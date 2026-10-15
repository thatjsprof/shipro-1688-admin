import { ISetting } from "@/interfaces/app.interface";
import {
  AirLocation,
  IOrder,
  PackageWeightUnit,
  ShippingType,
} from "@/interfaces/order.interface";

export const AIR_CLEARANCE_PER_KG_NGN = 1000;
export const AIR_PACKING_FEE_USD = 1;

export interface ShippingRates {
  freight: number;
  clearance: number;
  packingFee: number | null;
  weightUnit: PackageWeightUnit;
}

export const getShippingRates = (
  order: Pick<IOrder, "shippingType" | "airLocation"> | undefined | null,
  settings: ISetting | null | undefined,
  fallbackUnit: PackageWeightUnit = PackageWeightUnit.KG
): ShippingRates => {
  if (order?.shippingType === ShippingType.SEA) {
    return {
      freight: Number(settings?.cbmPrice) || 0,
      clearance: Number(settings?.clearanceFee) || 0,
      packingFee: null,
      weightUnit: PackageWeightUnit.CBM,
    };
  }

  return {
    freight:
      Number(
        order?.airLocation === AirLocation.HK
          ? settings?.hkPrice
          : settings?.gzPrice
      ) || 0,
    clearance: AIR_CLEARANCE_PER_KG_NGN,
    packingFee: AIR_PACKING_FEE_USD,
    weightUnit: fallbackUnit,
  };
};

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
