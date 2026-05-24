import { richTextPlainLength } from "@/lib/rich-text";

export const DEFAULT_QUICK_ADD_VARIANT_NAME = "info";

export const QUICK_PRODUCT_TEMPLATE = `stock: 1
price:
delivery_fee:`;

export type QuickProductFields = {
  description: string;
  stock: string;
  price: string;
  deliveryFee?: string;
  variantName: string;
  variantValue: string;
};

const FIELD_ALIASES: Record<string, keyof QuickProductFields> = {
  description: "description",
  stock: "stock",
  price: "price",
  delivery_fee: "deliveryFee",
  deliveryfee: "deliveryFee",
  variant_name: "variantName",
  variantname: "variantName",
  variant_value: "variantValue",
  variantvalue: "variantValue",
};


const REQUIRED_PARSER_FIELDS: Array<keyof QuickProductFields> = [
  "stock",
  "price",
];

const FIELD_LABELS: Record<keyof QuickProductFields, string> = {
  description: "description",
  stock: "stock",
  price: "price",
  deliveryFee: "delivery_fee",
  variantName: "variant_name",
  variantValue: "variant_value",
};

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function normalizeNumericInput(value: string): string {
  return value.replace(/,/g, "").replace(/\s+/g, "").trim();
}

function parseNumericValue(value: string): number | null {
  const normalized = normalizeNumericInput(value);
  if (!normalized) return null;
  const n = parseFloat(normalized);
  return Number.isNaN(n) ? null : n;
}

function tryParseFieldHeader(
  segment: string
): { fieldKey: keyof QuickProductFields; valuePart: string } | null {
  const colonIndex = segment.indexOf(":");
  if (colonIndex === -1) return null;

  const key = segment.slice(0, colonIndex).trim();
  const fieldKey = FIELD_ALIASES[normalizeKey(key)];
  if (!fieldKey) return null;

  return { fieldKey, valuePart: segment.slice(colonIndex + 1) };
}

export type ParseQuickProductResult =
  | { success: true; fields: QuickProductFields }
  | { success: false; errors: string[] };

export function extractQuickProductFields(text: string): {
  fields: Partial<QuickProductFields>;
  unknownKeys: string[];
} {
  const fields: Partial<QuickProductFields> = {};
  const unknownKeys: string[] = [];
  const lines = text.split(/\r?\n/);

  let currentField: keyof QuickProductFields | null = null;
  const valueParts: string[] = [];

  const flush = () => {
    if (!currentField) return;
    const value = valueParts.join("\n").trim();
    if (value) {
      fields[currentField] = value;
    }
    currentField = null;
    valueParts.length = 0;
  };

  for (const rawLine of lines) {
    const segments = rawLine.includes(";")
      ? rawLine.split(";").map((s) => s.trim())
      : [rawLine];

    for (const segment of segments) {
      const trimmed = segment.trim();
      if (!trimmed) continue;

      const header = tryParseFieldHeader(trimmed);
      if (header) {
        flush();
        currentField = header.fieldKey;
        const initial = header.valuePart.trim();
        if (initial) {
          valueParts.push(initial);
        }
        continue;
      }

      if (currentField) {
        valueParts.push(trimmed);
        continue;
      }

      const unknown = tryParseFieldHeader(`${trimmed}:`);
      if (!unknown && trimmed.includes(":")) {
        const key = trimmed.slice(0, trimmed.indexOf(":")).trim();
        if (key) unknownKeys.push(key);
      }
    }
  }

  flush();

  return { fields, unknownKeys };
}

export function parseQuickProduct(
  text: string,
  options?: { description?: string; variantValue?: string }
): ParseQuickProductResult {
  const { fields, unknownKeys } = extractQuickProductFields(text);

  const errors: string[] = [];

  if (unknownKeys.length > 0) {
    errors.push(`Unknown field(s): ${unknownKeys.join(", ")}`);
  }

  for (const field of REQUIRED_PARSER_FIELDS) {
    const value = fields[field]?.trim();
    if (!value) {
      errors.push(`Missing required field: ${FIELD_LABELS[field]}`);
    }
  }

  const description = (options?.description ?? fields.description ?? "").trim();
  if (!description || richTextPlainLength(description) < 10) {
    errors.push("Description must be at least 10 characters");
  }

  const variantValue = (
    options?.variantValue ??
    fields.variantValue ??
    ""
  ).trim();
  if (!variantValue || richTextPlainLength(variantValue) < 1) {
    errors.push("Info is required");
  }

  const stockRaw = fields.stock?.trim() ?? "";
  const stock = normalizeNumericInput(stockRaw);
  if (
    stock &&
    (!/^\d+$/.test(stock) || parseInt(stock, 10) < 0)
  ) {
    errors.push("Stock must be a non-negative whole number");
  }

  const priceRaw = fields.price?.trim() ?? "";
  const price = normalizeNumericInput(priceRaw);
  const priceNum = price ? parseNumericValue(priceRaw) : null;
  if (price && (priceNum === null || priceNum <= 0)) {
    errors.push("Price must be a positive number");
  }

  const deliveryFeeRaw = fields.deliveryFee?.trim() ?? "";
  const deliveryFee = deliveryFeeRaw
    ? normalizeNumericInput(deliveryFeeRaw)
    : "";
  const deliveryFeeNum = deliveryFee
    ? parseNumericValue(deliveryFeeRaw)
    : null;
  if (
    deliveryFee &&
    (deliveryFeeNum === null || deliveryFeeNum < 0)
  ) {
    errors.push("Delivery fee must be a non-negative number");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    fields: {
      description,
      stock,
      price,
      ...(deliveryFee && {
        deliveryFee,
      }),
      variantName: DEFAULT_QUICK_ADD_VARIANT_NAME,
      variantValue,
    },
  };
}
