import z from "zod";

export const productSchema = z.object({
  stock: z.string().min(1, "Stock is required"),
  moq: z.string().min(1, "MOQ is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  deliveryFeeYen: z.string().min(1, "Delivery fee is required"),
  deliveryFeeNaira: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().min(1, { message: "Url is required" }),
        fileName: z.string().min(1, { message: "FileName is required" }),
        key: z.string(),
      })
    )
    .min(1, "At least one image is required"),
  variantProperties: z
    .array(
      z.object({
        name: z.string().min(1, "Property name is required"),
        values: z
          .array(z.string().min(1, "Value cannot be empty"))
          .min(1, "At least one value is required"),
      })
    )
    .min(1, "At least one variant property is required"),
  skus: z
    .record(
      z.string(),
      z.object({
        price: z.string().min(1, "Price is required"),
        stock: z.string().min(1, "Stock is required"),
      })
    )
    .refine((skus) => Object.keys(skus).length > 0, {
      message: "At least one SKU is required",
    }),
  attributes: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .min(1, "At least one attribute is required"),
});
