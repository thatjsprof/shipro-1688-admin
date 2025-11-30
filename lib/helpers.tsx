import { IProduct } from "@/interfaces/product.interface";
import { productSchema } from "@/schemas/product";
import z from "zod";

type FormFormat = z.infer<typeof productSchema>;

export function formToApi(form: FormFormat): Partial<IProduct> {
  const getSKUKey = (
    combination: Array<{ id: string; value: string }>
  ): string => {
    return combination
      .map((item) => item.value.replace(/\s+/g, "").toLowerCase())
      .join("_");
  };

  const generateCombinations = (
    properties: FormFormat["variantProperties"]
  ): Array<Array<{ id: string; value: string }>> => {
    if (properties.length === 0) return [];
    const combinations: Array<Array<{ id: string; value: string }>> = [];

    const generate = (
      current: Array<{ id: string; value: string }>,
      depth: number
    ) => {
      if (depth === properties.length) {
        combinations.push([...current]);
        return;
      }

      const prop = properties[depth];
      for (const valueObj of prop.values) {
        if (valueObj.value.trim()) {
          current.push(valueObj);
          generate(current, depth + 1);
          current.pop();
        }
      }
    };

    generate([], 0);
    return combinations;
  };

  const combinations = generateCombinations(form.variantProperties);
  const variants: Record<string, Array<{ id: string; text: string }>> = {};
  form.variantProperties.forEach((prop) => {
    const propKey = prop.name.toLowerCase().replace(/\s+/g, "");
    variants[propKey] = prop.values.map((val, idx) => ({
      id: String(idx),
      text: val.value,
      ...(val.image && {
        image: {
          ...val.image,
          type: "image",
        },
      }),
    }));
  });

  const skuPropHeaders = form.variantProperties.map((prop) =>
    prop.name.toLowerCase().replace(/\s+/g, "")
  );

  const propsOrder = [...skuPropHeaders];
  const skuPropRows = combinations.map((combination) =>
    combination.map((item) => item.value)
  );
  const propsInfoTable = [...skuPropRows];
  const skus: any = {};
  combinations.forEach((combination, idx) => {
    const skuKey = getSKUKey(combination);
    const formSkuKey = combination.map((item) => item.id).join("_");
    const skuData = form.skus[formSkuKey];

    skus[skuKey] = {
      id: String(idx + 1),
      price: parseFloat(skuData?.price || "0"),
      stock: parseInt(skuData?.stock || "0", 10),
    };
  });

  const attrs = form.attributes.map((attr) => ({
    [attr.key]: attr.value,
  }));

  return {
    images: form.images,
    description: form.description,
    stock: parseInt(form.stock, 10),
    moq: parseInt(form.moq, 10),
    attrs,
    location: form.location,
    deliveryFeeYen: parseFloat(form.deliveryFeeYen),
    deliveryFeeNaira: form.deliveryFeeNaira
      ? parseFloat(form.deliveryFeeNaira)
      : undefined,
    variants,
    skuPropRows,
    skuPropHeaders,
    skus,
    propsOrder,
    propsInfoTable,
    totalSoldDuration: form.totalSoldDuration?.reduce((acc, item) => {
      acc[item.duration] = parseFloat(item.amount);
      return acc;
    }, {} as Record<string, number>),
  };
}

export function apiToForm(product: IProduct): FormFormat {
  const variantProperties = (product.propsOrder ?? []).map((propKey) => {
    const variantValues = product.variants[propKey] || [];
    return {
      name: propKey,
      values: variantValues.map((v: any) => ({
        id: v.id,
        value: v.text,
        ...(v.image && {
          image: v.image,
        }),
      })),
    };
  });

  const generateFormCombinations = (
    properties: typeof variantProperties
  ): Array<Array<{ id: string; value: string; propName: string }>> => {
    if (properties.length === 0) return [];
    const combinations: Array<
      Array<{ id: string; value: string; propName: string }>
    > = [];

    const generate = (
      current: Array<{ id: string; value: string; propName: string }>,
      depth: number
    ) => {
      if (depth === properties.length) {
        combinations.push([...current]);
        return;
      }

      const prop = properties[depth];
      for (const valueObj of prop.values) {
        current.push({
          id: valueObj.id,
          value: valueObj.value,
          propName: prop.name,
        });
        generate(current, depth + 1);
        current.pop();
      }
    };

    generate([], 0);
    return combinations;
  };

  const formCombinations = generateFormCombinations(variantProperties);
  const skusRecord: Record<string, { price: string; stock: string }> = {};

  formCombinations.forEach((combination) => {
    const formSkuKey = combination.map((item) => item.id).join("_");
    const apiSkuKey = combination
      .map((item) => item.value.replace(/\s+/g, "").toLowerCase())
      .join("_");

    const apiSku = product.skus[apiSkuKey];

    if (apiSku) {
      skusRecord[formSkuKey] = {
        price: String(apiSku.price),
        stock: String(apiSku.stock),
      };
    } else {
      skusRecord[formSkuKey] = {
        price: "",
        stock: "",
      };
    }
  });

  const attributes = product.attrs.map((attr) => {
    const [key, value] = Object.entries(attr)[0];
    return { key, value };
  });

  return {
    stock: String(product.stock),
    moq: String(product.moq),
    description: product.description,
    location: product.location,
    deliveryFeeYen: String(product.deliveryFeeYen),
    deliveryFeeNaira: product.deliveryFeeNaira
      ? String(product.deliveryFeeNaira)
      : undefined,
    totalSoldDuration: Object.entries(product.totalSoldDuration || {}).map(
      ([duration, amount]) => ({
        duration,
        amount: String(amount),
      })
    ),
    images: product.images,
    variantProperties,
    skus: skusRecord,
    attributes,
  };
}
