import {
  ProductFormInput,
  ProductFormValues,
} from "@/schemas/product";
import { IFile } from "@/interfaces/file.interface";
import {
  DEFAULT_QUICK_ADD_VARIANT_NAME,
  extractQuickProductFields,
  QuickProductFields,
} from "@/lib/parse-quick-product";
import { hasRichTextContent, isRichTextEmpty, sanitizeRichHtml } from "@/lib/rich-text";
import { UseFormReturn } from "react-hook-form";

function generateVariantValueId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function attributesFromVariantFields(
  fields: Partial<QuickProductFields>
): { key: string; value: string }[] {
  const value = fields.variantValue ?? "";
  if (hasRichTextContent(value)) {
    return [
      {
        key: DEFAULT_QUICK_ADD_VARIANT_NAME,
        value: sanitizeRichHtml(value),
      },
    ];
  }
  return [{ key: "", value: "" }];
}

export function applyQuickTextToForm(form: UseFormReturn<ProductFormInput>): void {
  const text = form.getValues("quickAddText") ?? "";
  const { fields } = extractQuickProductFields(text);
  if (Object.keys(fields).length === 0) return;

  const current = form.getValues();
  const currentDescription = form.getValues("description") ?? "";

  if (
    fields.description &&
    hasRichTextContent(fields.description) &&
    isRichTextEmpty(currentDescription)
  ) {
    form.setValue("description", sanitizeRichHtml(fields.description), {
      shouldDirty: true,
    });
  }

  if (fields.stock?.trim()) {
    form.setValue("stock", fields.stock.trim(), { shouldDirty: true });
  }

  if (!current.moq) {
    form.setValue("moq", "1", { shouldDirty: true });
  }

  if (fields.deliveryFee?.trim()) {
    form.setValue("deliveryFeeYen", fields.deliveryFee.trim(), {
      shouldDirty: true,
    });
  } else if (!current.deliveryFeeYen) {
    form.setValue("deliveryFeeYen", "0", { shouldDirty: true });
  }

  const existing = current.variantProperties?.[0];
  const existingValue = existing?.values?.[0]?.value ?? "";
  const hasVariantFields =
    fields.price?.trim() ||
    hasRichTextContent(fields.variantValue ?? existingValue);

  if (hasVariantFields) {
    const valueId =
      existing?.values?.[0]?.id?.trim() || generateVariantValueId();
    const existingSku = current.skus?.[valueId];
    const variantValue = sanitizeRichHtml(
      fields.variantValue ?? existingValue
    );

    form.setValue(
      "variantProperties",
      [
        {
          name: DEFAULT_QUICK_ADD_VARIANT_NAME,
          values: [
            {
              id: valueId,
              value: variantValue,
            },
          ],
        },
      ],
      { shouldDirty: true }
    );

    form.setValue(
      "skus",
      {
        ...current.skus,
        [valueId]: {
          price: (fields.price ?? existingSku?.price ?? "").trim(),
          stock: (fields.stock ?? existingSku?.stock ?? "").trim(),
        },
      },
      { shouldDirty: true }
    );

    if (hasRichTextContent(variantValue)) {
      form.setValue("attributes", attributesFromVariantFields({ variantValue }), {
        shouldDirty: true,
      });
    }
  }
}

export function quickProductToForm(
  fields: QuickProductFields,
  images: IFile[]
): ProductFormValues {
  const valueId = generateVariantValueId();

  return {
    description: sanitizeRichHtml(fields.description),
    stock: fields.stock,
    moq: "1",
    location: "",
    deliveryFeeYen: fields.deliveryFee?.trim() || "0",
    deliveryFeeNaira: undefined,
    images,
    attributes: attributesFromVariantFields(fields),
    variantProperties: [
      {
        name: DEFAULT_QUICK_ADD_VARIANT_NAME,
        values: [
          {
            id: valueId,
            value: sanitizeRichHtml(fields.variantValue),
          },
        ],
      },
    ],
    skus: {
      [valueId]: {
        price: fields.price,
        stock: fields.stock,
      },
    },
  };
}
