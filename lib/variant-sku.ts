import { IProduct } from "@/interfaces/product.interface";
import { stripRichHtml } from "@/lib/rich-text";

export type VariantSelectionValue = {
  normalized: string;
  original: string;
};

export type VariantSelection = Record<string, VariantSelectionValue>;

export type ProductSkuContext = Pick<IProduct, "propsOrder" | "skus">;

export function normalizeVariantValue(text: string): string {
  if (!text) return "";
  return stripRichHtml(text).replace(/\s+/g, "").toLowerCase();
}

export function selectionFromOriginals(
  variants: VariantSelection
): VariantSelection {
  return Object.fromEntries(
    Object.entries(variants).map(([prop, value]) => [
      prop,
      {
        ...value,
        normalized: normalizeVariantValue(value.original ?? value.normalized),
      },
    ])
  );
}

export function getPropsOrder(
  product: ProductSkuContext,
  variants: VariantSelection
): string[] {
  if (product.propsOrder?.length) {
    return product.propsOrder;
  }
  return Object.keys(variants).sort();
}

export function buildVariantSkuKey(
  propsOrder: string[] | undefined,
  variants: VariantSelection
): string {
  if (propsOrder?.length) {
    const key = propsOrder
      .map((prop) => variants[prop]?.normalized)
      .filter(Boolean)
      .join("_");
    if (key) return key;
  }
  return Object.keys(variants)
    .sort()
    .map((prop) => variants[prop]?.normalized)
    .filter(Boolean)
    .join("_");
}

export function buildSkuKeyFromValues(values: string[]): string {
  return values.map((v) => normalizeVariantValue(v)).filter(Boolean).join("_");
}

export function buildSelectionKeyCandidates(
  propsOrder: string[],
  variants: VariantSelection
): string[] {
  const fromStored = buildVariantSkuKey(propsOrder, variants);
  const fromOriginal = buildVariantSkuKey(
    propsOrder,
    selectionFromOriginals(variants)
  );
  return [...new Set([fromStored, fromOriginal].filter(Boolean))];
}

export function selectionMatchesSkuKey(
  skuKey: string,
  variants: VariantSelection,
  propsOrder: string[]
): boolean {
  if (!skuKey) return false;

  const candidates = buildSelectionKeyCandidates(propsOrder, variants);
  const normalizedSkuKey = normalizeVariantValue(skuKey);

  if (
    candidates.some(
      (c) => c === skuKey || normalizeVariantValue(c) === normalizedSkuKey
    )
  ) {
    return true;
  }

  if (propsOrder.length === 1) {
    const prop = propsOrder[0];
    const value = normalizeVariantValue(
      variants[prop]?.original ?? variants[prop]?.normalized ?? ""
    );
    return value === skuKey || value === normalizedSkuKey;
  }

  return false;
}

export function resolveProductSku(
  product: ProductSkuContext,
  variants: VariantSelection
) {
  const skus = product.skus ?? {};
  if (!Object.keys(skus).length || !Object.keys(variants).length) {
    return null;
  }

  const propsOrder = getPropsOrder(product, variants);
  const candidates = buildSelectionKeyCandidates(propsOrder, variants);

  for (const candidate of candidates) {
    if (skus[candidate]) {
      return { key: candidate, sku: skus[candidate] };
    }
    for (const [key, sku] of Object.entries(skus)) {
      if (normalizeVariantValue(key) === candidate) {
        return { key, sku };
      }
    }
  }

  const matches: Array<{ key: string; sku: (typeof skus)[string] }> = [];
  for (const [key, sku] of Object.entries(skus)) {
    if (selectionMatchesSkuKey(key, variants, propsOrder)) {
      matches.push({ key, sku });
    }
  }
  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}

export function cartVariantsMatch(
  a: VariantSelection,
  b: VariantSelection,
  product: ProductSkuContext
): boolean {
  const skuA = resolveProductSku(product, a);
  const skuB = resolveProductSku(product, b);

  if (skuA?.sku?.id != null && skuB?.sku?.id != null) {
    return String(skuA.sku.id) === String(skuB.sku.id);
  }

  if (skuA && skuB) {
    return skuA.key === skuB.key;
  }

  const order = getPropsOrder(product, { ...a, ...b });
  const keysA = buildSelectionKeyCandidates(order, a);
  const keysB = buildSelectionKeyCandidates(order, b);
  return keysA.some((keyA) => keysB.some((keyB) => keyA === keyB));
}
