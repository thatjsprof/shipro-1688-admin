import { IProduct } from "@/interfaces/product.interface";
import { productSchema } from "@/schemas/product";
import z from "zod";

type FormFormat = z.infer<typeof productSchema>;

export function formToApi(form: FormFormat): Partial<IProduct> {
  const getSKUKey = (combination: string[]): string => {
    return combination
      .map((value) => value.replace(/\s+/g, "").toLowerCase())
      .join("_");
  };

  const generateCombinations = (
    properties: FormFormat["variantProperties"]
  ): string[][] => {
    if (properties.length === 0) return [];
    const combinations: string[][] = [];

    const generate = (current: string[], depth: number) => {
      if (depth === properties.length) {
        combinations.push([...current]);
        return;
      }

      const prop = properties[depth];
      for (const value of prop.values) {
        if (value.trim()) {
          current.push(value);
          generate(current, depth + 1);
          current.pop();
        }
      }
    };

    generate([], 0);
    return combinations;
  };

  const combinations = generateCombinations(form.variantProperties);
  const propsOrder = form.variantProperties.map((p) => p.name.toLowerCase());
  const variants: IProduct["variants"] = {};
  form.variantProperties.forEach((prop) => {
    const propKey = prop.name.toLowerCase();
    variants[propKey] = prop.values.map((value, idx) => ({
      id: idx.toString(),
      text: value,
    }));
  });

  const skus: IProduct["skus"] = {};
  let skuIdCounter = 1;

  combinations.forEach((combination) => {
    const skuKey = getSKUKey(combination);
    const formSku = form.skus[skuKey];

    if (formSku) {
      skus[skuKey] = {
        id: skuIdCounter.toString(),
        price: parseFloat(formSku.price) || 0,
        stock: parseFloat(formSku.stock) || 0,
        priceNaira: 0,
      } as any;
      skuIdCounter++;
    }
  });
  const images = form.images.map((img) => ({
    url: img.url,
    type: "image",
    thumbnail: img.url,
  }));

  const attrs = form.attributes.map((attr) => ({
    [attr.key]: attr.value,
  }));

  return {
    images,
    description: form.description,
    stock: parseFloat(form.stock) || 0,
    moq: parseFloat(form.moq) || 1,
    attrs,
    location: form.location ?? "",
    deliveryFeeYen: parseFloat(form.deliveryFeeYen) || 0,
    deliveryFeeNaira: parseFloat(form.deliveryFeeNaira || "") || 0,
    propsOrder,
    variants,
    skuPropRows: combinations,
    skuPropHeaders: propsOrder,
    skus,
    propsInfoTable: combinations,
  };
}
