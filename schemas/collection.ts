import { z } from "zod";

export const collectionFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(255),
  description: z.string(),
  coverImage: z.string(),
  active: z.boolean(),
  productLinks: z.string(),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;
