import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQueryTabs } from "@/hooks/use-query-tabs";
import { Basic } from "@/components/pages/products/basic";
import { IProduct } from "@/interfaces/product.interface";
import {
  productFormSchema,
  productSchema,
  ProductFormInput,
} from "@/schemas/product";
import Picture from "@/components/pages/products/pictures";
import Variant from "@/components/pages/products/variant";
import Attribute from "@/components/pages/products/attribute";
import QuickAdd from "@/components/pages/products/quick-add";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/use-upload";
import { IFile } from "@/interfaces/file.interface";
import { apiToForm, formToApi } from "@/lib/helpers";
import { quickProductToForm } from "@/lib/quick-product-to-form";
import {
  parseQuickProduct,
  QUICK_PRODUCT_TEMPLATE,
} from "@/lib/parse-quick-product";
import { applyQuickTextToForm } from "@/lib/quick-product-to-form";
import { applyOutOfStockToForm } from "@/lib/product-listing";
import { useRouter } from "next/router";
import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/services/product.service";
import { Icons } from "@/components/shared/icons";
import { notify } from "@/lib/toast";
import { useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

enum ITabs {
  Quick = "quick",
  Basic = "basic",
  Variant = "variant",
  Picture = "picture",
  Attribute = "attribute",
}

const TAB_VALUES = [
  ITabs.Quick,
  ITabs.Basic,
  ITabs.Picture,
  ITabs.Variant,
  ITabs.Attribute,
] as const;

const TAB_FIELD_MAP: Record<ITabs, string[]> = {
  [ITabs.Quick]: [],
  [ITabs.Basic]: [
    "description",
    "stock",
    "moq",
    "location",
    "deliveryFeeYen",
    "deliveryFeeNaira",
  ],
  [ITabs.Variant]: ["variantProperties", "skus"],
  [ITabs.Picture]: ["images"],
  [ITabs.Attribute]: ["attributes"],
};

const Product = () => {
  const router = useRouter();
  const { id } = router.query;
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isLoadingUpdate }] =
    useUpdateProductMutation();
  const { data: productData } = useGetProductQuery(id as string, { skip: !id });
  const isEditMode = Boolean(id);
  const tabValues = isEditMode
    ? (TAB_VALUES.filter((t) => t !== ITabs.Quick) as [
        typeof ITabs.Basic,
        typeof ITabs.Picture,
        typeof ITabs.Variant,
        typeof ITabs.Attribute,
      ])
    : TAB_VALUES;

  const { activeTab, handleTabChange } = useQueryTabs({
    tabValues,
    defaultValue: isEditMode ? ITabs.Basic : ITabs.Quick,
  });

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    mode: "onTouched",
    defaultValues: {
      quickAddText: QUICK_PRODUCT_TEMPLATE,
      description: "",
      location: "",
      stock: "",
      moq: "",
      deliveryFeeYen: "",
      deliveryFeeNaira: "",
      images: [],
      attributes: [{ key: "", value: "" }],
      variantProperties: [
        {
          name: "",
          values: [
            {
              id: "",
              value: "",
            },
          ],
        },
      ],
      skus: {},
      isMoment: true,
      pinTrending: false,
      outOfStock: false,
    },
  });

  const images = form.watch("images") as IFile[];

  const handleTabChangeWithSync = useCallback(
    (nextTab: string) => {
      if (activeTab === ITabs.Quick && nextTab !== ITabs.Quick) {
        applyQuickTextToForm(form);
      }
      handleTabChange(nextTab);
    },
    [activeTab, form, handleTabChange]
  );

  const {
    isDragging,
    fileInputRef,
    setFileContainerRef,
    handleFileInputChange,
    uploading,
    handleUploadFiles,
    files,
    calculateOverallProgress,
  } = useFileUpload({
    fileTypes: ["image/*"],
    noOfFiles: 1000,
    currentFiles: images ?? [],
    maxFileSize: 10 * 1024 * 1024,
    onFilesAdded: () => {
      handleUploadFiles();
    },
    setUploadedFiles: (files) => {
      form.setValue(
        "images",
        files.map((file) => {
          return {
            url: file.url,
            fileName: file.fileName,
            key: file.key,
            type: file.type.includes("video") ? "video" : "image",
          };
        }),
        { shouldValidate: false, shouldDirty: false }
      );
      form.clearErrors("images");
    },
    isMultiple: true,
  });

  const handleQuickCreate = async () => {
    try {
      const quickAddText = form.getValues("quickAddText") ?? "";
      const parseResult = parseQuickProduct(quickAddText);
      if (!parseResult.success) {
        notify(parseResult.errors[0] ?? "Invalid quick add input", "error");
        return;
      }

      const images = (form.getValues("images") ?? []) as IFile[];
      const values = quickProductToForm(parseResult.fields, images);
      const validated = productSchema.safeParse(values);

      if (!validated.success) {
        const message =
          validated.error.issues[0]?.message ?? "Validation failed";
        notify(message, "error");
        return;
      }

      const isMoment = form.getValues("isMoment") ?? true;
      const pinTrending = form.getValues("pinTrending") ?? false;
      const outOfStock = form.getValues("outOfStock") ?? false;
      form.reset({
        ...validated.data,
        quickAddText,
        isMoment,
        pinTrending,
        outOfStock,
      });

      if (outOfStock) {
        applyOutOfStockToForm(form);
      }

      const toSave = formToApi(form.getValues());
      const response = await createProduct(toSave).unwrap();

      if (response.status === 200) {
        notify(response.message, "success");
        router.push("/products");
      } else {
        notify(response.message, "error");
      }
    } catch {
      notify("Failed to create product", "error");
    }
  };

  const onSubmit = async (values: ProductFormInput) => {
    try {
      const toSave = formToApi(values);
      let response: ApiResponse<IProduct>;
      if (id) {
        response = await updateProduct({
          id: id as string,
          data: toSave,
        }).unwrap();
      } else {
        response = await createProduct(toSave).unwrap();
      }
      if (response.status === 200) {
        notify(response.message, "success");
        router.push("/products");
      } else {
        notify(response.message, "error");
      }
    } catch (err) {
      notify("Failed to save product");
    }
  };

  const getErrorByPath = (path: string) => {
    const segments = path.split(".");
    let current: any = form.formState.errors;
    for (const segment of segments) {
      if (!current) return undefined;
      current = current[segment as keyof typeof current];
    }
    return current;
  };

  const tabHasErrors = (tab: ITabs) =>
    TAB_FIELD_MAP[tab].some((fieldPath) => !!getErrorByPath(fieldPath));

  useEffect(() => {
    if (!productData?.data) return;
    const converted = apiToForm(productData?.data);
    form.reset(converted);
  }, [productData?.data]);

  useEffect(() => {
    document.title = `Product Details | Shipro Africa`;
  }, []);

  return (
    <div className="py-8">
      <Link href="/products">
        <div className="flex items-center gap-2 text-gray-500 mb-6 text-sm cursor-pointer w-fit">
          <ArrowLeft className="size-5" />
          Back to Products
        </div>
      </Link>
      <h1 className="text-2xl font-semibold mb-8">
        {id ? "Update" : "Create"} Product
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChangeWithSync}>
            <TabsList className="gap-1">
              {!isEditMode && (
                <TabsTrigger value={ITabs.Quick}>Quick add</TabsTrigger>
              )}
              <TabsTrigger
                value={ITabs.Basic}
                className={cn(tabHasErrors(ITabs.Basic) && "text-destructive")}
              >
                Basic
                {tabHasErrors(ITabs.Basic) && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value={ITabs.Variant}
                className={cn(
                  tabHasErrors(ITabs.Variant) && "text-destructive"
                )}
              >
                Variants
                {tabHasErrors(ITabs.Variant) && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value={ITabs.Picture}
                className={cn(
                  tabHasErrors(ITabs.Picture) && "text-destructive"
                )}
              >
                Pictures
                {tabHasErrors(ITabs.Picture) && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value={ITabs.Attribute}
                className={cn(
                  tabHasErrors(ITabs.Attribute) && "text-destructive"
                )}
              >
                Attributes
                {tabHasErrors(ITabs.Attribute) && (
                  <span className="ml-2 h-2 w-2 rounded-full bg-destructive" />
                )}
              </TabsTrigger>
            </TabsList>
            {!isEditMode && (
              <TabsContent value={ITabs.Quick} className="pt-5">
                <QuickAdd
                  form={form}
                  isDragging={isDragging}
                  fileInputRef={fileInputRef}
                  setFileContainerRef={setFileContainerRef}
                  handleFileInputChange={handleFileInputChange}
                  uploading={uploading}
                  files={files}
                  calculateOverallProgress={calculateOverallProgress}
                  onCreate={handleQuickCreate}
                  isLoading={isLoading}
                />
              </TabsContent>
            )}
            <TabsContent value={ITabs.Basic} className="pt-5">
              <Basic form={form} />
            </TabsContent>
            <TabsContent value={ITabs.Variant} className="pt-5">
              <Variant form={form} />
            </TabsContent>
            <TabsContent value={ITabs.Picture} className="pt-5">
              <Picture
                form={form}
                isDragging={isDragging}
                fileInputRef={fileInputRef}
                setFileContainerRef={setFileContainerRef}
                handleFileInputChange={handleFileInputChange}
                uploading={uploading}
                files={files}
                calculateOverallProgress={calculateOverallProgress}
              />
            </TabsContent>
            <TabsContent value={ITabs.Attribute} className="pt-5">
              <Attribute form={form} />
            </TabsContent>
          </Tabs>
          {activeTab !== ITabs.Quick && (
            <Button
              type="submit"
              disabled={isLoading || isLoadingUpdate}
              className="h-14 font-semibold px-6 shadow-none mt-[3rem]"
            >
              {(isLoading || isLoadingUpdate) && (
                <Icons.spinner className="h-3 w-3 animate-spin" />
              )}
              Save Product
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default Product;
