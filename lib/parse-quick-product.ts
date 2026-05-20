export const QUICK_PRODUCT_TEMPLATE = `description:
stock:
price:
delivery_fee:
variant_name:
variant_value:`;

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

const REQUIRED_FIELDS: Array<keyof QuickProductFields> = [
  "description",
  "stock",
  "price",
  "variantName",
  "variantValue",
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

function parseLine(line: string): { key: string; value: string } | null {
  const colonIndex = line.indexOf(":");
  if (colonIndex === -1) return null;

  const key = line.slice(0, colonIndex).trim();
  const value = line.slice(colonIndex + 1).trim();
  if (!key) return null;

  return { key, value };
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

  for (const rawLine of lines) {
    const segments = rawLine.includes(";")
      ? rawLine.split(";").map((s) => s.trim())
      : [rawLine.trim()];

    for (const segment of segments) {
      if (!segment) continue;

      const parsed = parseLine(segment);
      if (!parsed) continue;

      const normalizedKey = normalizeKey(parsed.key);
      const fieldKey = FIELD_ALIASES[normalizedKey];

      if (!fieldKey) {
        if (parsed.value) unknownKeys.push(parsed.key);
        continue;
      }

      fields[fieldKey] = parsed.value;
    }
  }

  return { fields, unknownKeys };
}

export function parseQuickProduct(text: string): ParseQuickProductResult {
  const { fields, unknownKeys } = extractQuickProductFields(text);

  const errors: string[] = [];

  if (unknownKeys.length > 0) {
    errors.push(`Unknown field(s): ${unknownKeys.join(", ")}`);
  }

  for (const field of REQUIRED_FIELDS) {
    const value = fields[field]?.trim();
    if (!value) {
      errors.push(`Missing required field: ${FIELD_LABELS[field]}`);
    }
  }

  const description = fields.description?.trim() ?? "";
  if (description && description.length < 10) {
    errors.push("Description must be at least 10 characters");
  }

  const stock = fields.stock?.trim() ?? "";
  if (stock && (!/^\d+$/.test(stock) || parseInt(stock, 10) < 0)) {
    errors.push("Stock must be a non-negative whole number");
  }

  const price = fields.price?.trim() ?? "";
  if (price && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
    errors.push("Price must be a positive number");
  }

  const deliveryFee = fields.deliveryFee?.trim() ?? "";
  if (
    deliveryFee &&
    (isNaN(parseFloat(deliveryFee)) || parseFloat(deliveryFee) < 0)
  ) {
    errors.push("Delivery fee must be a non-negative number");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    fields: {
      description: fields.description!.trim(),
      stock: fields.stock!.trim(),
      price: fields.price!.trim(),
      ...(fields.deliveryFee?.trim() && {
        deliveryFee: fields.deliveryFee.trim(),
      }),
      variantName: fields.variantName!.trim(),
      variantValue: fields.variantValue!.trim(),
    },
  };
}
