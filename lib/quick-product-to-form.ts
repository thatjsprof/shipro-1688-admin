import {
  ProductFormInput,
  ProductFormValues,
} from "@/schemas/product";
import { IFile } from "@/interfaces/file.interface";
import {
  extractQuickProductFields,
  QuickProductFields,
} from "@/lib/parse-quick-product";
import { hasRichTextContent, isRichTextEmpty, sanitizeRichHtml } from "@/lib/rich-text";
import { UseFormReturn } from "react-hook-form";

function generateVariantValueId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function syncVariantImageFromFirst(
  form: UseFormReturn<ProductFormInput>
): void {
  const images = (form.getValues("images") ?? []) as IFile[];
  const first = images[0];
  const valueId = form.getValues("variantProperties")?.[0]?.values?.[0]?.id;
  if (!first || !valueId) return;

  form.setValue("variantProperties.0.values.0.image", first, {
    shouldDirty: true,
  });
}

function attributesFromVariantFields(
  fields: Partial<QuickProductFields>
): { key: string; value: string }[] {
  const name = fields.variantName?.trim();
  const value = fields.variantValue ?? "";
  if (name && hasRichTextContent(value)) {
    return [{ key: name, value: sanitizeRichHtml(value) }];
  }
  return [{ key: "", value: "" }];
}

export function applyQuickTextToForm(form: UseFormReturn<ProductFormInput>): void {
  const text = form.getValues("quickAddText") ?? "";
  const { fields } = extractQuickProductFields(text);
  if (Object.keys(fields).length === 0) return;

  const current = form.getValues();
  const images = (current.images ?? []) as IFile[];

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

  const hasVariantFields =
    fields.variantName || fields.variantValue || fields.price;

  if (hasVariantFields) {
    const existing = current.variantProperties?.[0];
    const valueId =
      existing?.values?.[0]?.id?.trim() || generateVariantValueId();
    const variantImage = images[0] ?? existing?.values?.[0]?.image ?? null;
    const existingSku = current.skus?.[valueId];

    form.setValue(
      "variantProperties",
      [
        {
          name: (fields.variantName ?? existing?.name ?? "").trim(),
          values: [
            {
              id: valueId,
              value: sanitizeRichHtml(
                fields.variantValue ?? existing?.values?.[0]?.value ?? ""
              ),
              ...(variantImage && { image: variantImage }),
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

    if (
      fields.variantName?.trim() &&
      hasRichTextContent(fields.variantValue ?? "")
    ) {
      form.setValue("attributes", attributesFromVariantFields(fields), {
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
  const variantImage = images[0] ?? null;

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
        name: fields.variantName,
        values: [
          {
            id: valueId,
            value: sanitizeRichHtml(fields.variantValue),
            ...(variantImage && { image: variantImage }),
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
