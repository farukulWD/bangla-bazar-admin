"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/auth/access-denied";
import { useCategoryOptions } from "@/components/form/category-select-field";
import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import MultiCategoryField from "@/components/form/multi-category-field";
import MultiImageField from "@/components/form/multi-image-field";
import SelectField from "@/components/form/select-field";
import SwitchField from "@/components/form/switch-field";
import TagsField from "@/components/form/tags-field";
import TextField from "@/components/form/text-field";
import TextareaField from "@/components/form/textarea-field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { applyServerErrors } from "@/lib/form-errors";
import { can } from "@/lib/permissions";
import { ROOT_PARENT } from "@/lib/validation/category-schemas";
import {
  createProductSchema,
  DEFAULT_IMAGE_LIMIT,
  type ProductValues,
} from "@/lib/validation/product-schemas";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/store/api/product/api/productApi";
import type { Product, ProductPayload } from "@/store/api/product/types";
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";

import { VariantBuilder, variantKey } from "./variant-builder";

const FIELDS = [
  "title",
  "slug",
  "description",
  "sku",
  "barcode",
  "category",
  "categories",
  "tags",
  "images",
  "stock",
  "status",
  "variants",
] as const;

export const categoryIdOf = (product: Product) =>
  typeof product.category === "string" ? product.category : product.category._id;

const toFormValues = (product?: Product): ProductValues => {
  const primary = product ? categoryIdOf(product) : "";
  return {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? "",
    category: primary,
    categories: (product?.categories ?? []).filter((id) => id !== primary),
    tags: product?.tags ?? [],
    originalPrice: product ? String(product.prices.originalPrice) : "",
    price: product ? String(product.prices.price) : "",
    stock: product ? String(product.stock) : "0",
    status: product?.status ?? "show",
    images: (product?.images ?? []).map((url) => ({ file: null, url })),
    hasVariants: Boolean(product?.variants.length),
    variants: (product?.variants ?? []).map((variant) => ({
      _id: variant._id,
      key: variantKey(variant.options),
      options: variant.options.map(({ attributeId, valueId }) => ({
        attributeId,
        valueId,
      })),
      sku: variant.sku ?? "",
      barcode: variant.barcode ?? "",
      originalPrice: String(variant.originalPrice),
      price: String(variant.price),
      stock: String(variant.stock),
      image: variant.image ?? "",
    })),
  };
};

const toFormData = (values: ProductValues, isEdit: boolean) => {
  const payload: ProductPayload = {
    title: values.title,
    description: values.description,
    sku: values.sku,
    barcode: values.barcode,
    category: values.category,
    categories: [...new Set([values.category, ...values.categories])],
    tags: values.tags,
    images: values.images.filter((image) => !image.file).map((image) => image.url),
    prices: {
      originalPrice: Number(values.originalPrice),
      price: Number(values.price),
    },
    status: values.status,
  };
  if (values.slug) payload.slug = values.slug.toLowerCase();

  if (values.hasVariants) {
    payload.variants = values.variants.map((variant) => ({
      ...(variant._id ? { _id: variant._id } : {}),
      options: variant.options,
      sku: variant.sku,
      barcode: variant.barcode,
      originalPrice: Number(variant.originalPrice),
      price: Number(variant.price),
      stock: Number(variant.stock || 0),
      ...(variant.image ? { image: variant.image } : {}),
    }));
  } else {
    payload.stock = Number(values.stock || 0);
    if (isEdit) payload.variants = [];
  }

  const data = new FormData();
  data.append("data", JSON.stringify(payload));
  values.images.forEach((image) => {
    if (image.file) data.append("images", image.file);
  });
  return data;
};

type ProductFormProps = {
  product?: Product;
  locked?: boolean;
};

export function ProductForm({ product, locked = false }: ProductFormProps) {
  const router = useRouter();
  const { user, isLoading: loadingSession } = useSession();
  const isEdit = Boolean(product);
  const allowed = can(
    user,
    "product",
    isEdit ? "can_edit_product" : "can_add_product",
  );

  const { data: settings } = useGetPublicSettingsQuery();
  const imageLimit =
    settings?.store?.numberOfImagePerProduct ?? DEFAULT_IMAGE_LIMIT;
  const resolver = useMemo<Resolver<ProductValues>>(
    () => zodResolver(createProductSchema(imageLimit)),
    [imageLimit],
  );

  const { options: categoryOptions, isLoading: loadingCategories } =
    useCategoryOptions();
  const primaryOptions = categoryOptions.filter(
    (option) => option.value !== ROOT_PARENT,
  );

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<ProductValues>({
    resolver,
    defaultValues: toFormValues(product),
  });
  const hasVariants = useWatch({ control: form.control, name: "hasVariants" });
  const primary = useWatch({ control: form.control, name: "category" });

  const onSubmit = async (values: ProductValues) => {
    setFormMessage(null);
    const data = toFormData(values, isEdit);
    const uploading = values.images.some((image) => image.file);

    try {
      if (product) {
        await updateProduct({ id: product._id, data }).unwrap();
        toast.success("Product updated.");
      } else {
        await createProduct(data).unwrap();
        toast.success("Product created.");
      }
      if (uploading) toast.info("Images are uploading in the background.");
      router.push("/products");
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  if (!loadingSession && !allowed) {
    return (
      <AccessDenied
        message={
          isEdit
            ? "Your role does not include permission to edit products."
            : "Your role does not include permission to add products."
        }
      />
    );
  }

  const pending = creating || updating;

  return (
    <div className="w-full">
      <PageHeader
        title={isEdit ? `Edit ${product?.title}` : "New product"}
        description="Products are what customers browse and buy in the store."
        actions={
          <Button
            variant="outline"
            render={<Link href="/products" />}
            nativeButton={false}
          >
            <ArrowLeft />
            Back
          </Button>
        }
      />

      <Form form={form} onSubmit={onSubmit} className="space-y-6">
        <FormAlert message={formMessage} />

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <TextField
                      control={form.control}
                      name="title"
                      label="Title"
                      placeholder="e.g. Organic red apples"
                    />
                  </div>
                  <TextField
                    control={form.control}
                    name="slug"
                    label="Slug"
                    placeholder="Generated from the title"
                    description="Used in the store URL. Leave empty to generate it."
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <TextField control={form.control} name="sku" label="SKU" />
                    <TextField
                      control={form.control}
                      name="barcode"
                      label="Barcode"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <TextareaField
                      control={form.control}
                      name="description"
                      label="Description"
                      placeholder="What makes this product worth buying?"
                      className="min-h-36"
                    />
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
                <CardDescription>The first saved image is the cover.</CardDescription>
              </CardHeader>
              <CardContent>
                <MultiImageField
                  control={form.control}
                  name="images"
                  label="Product images"
                  max={imageLimit}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing & stock</CardTitle>
                <CardDescription>
                  {hasVariants
                    ? "Base price shown before a variant is picked. Stock is the sum of the variants."
                    : "Discount is worked out from the two prices."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-6 md:grid-cols-3">
                  <TextField
                    control={form.control}
                    name="originalPrice"
                    label="Original price"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                  />
                  <TextField
                    control={form.control}
                    name="price"
                    label="Sale price"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                  />
                  {!hasVariants && (
                    <TextField
                      control={form.control}
                      name="stock"
                      label="Stock"
                      type="number"
                      min={0}
                      step="1"
                      inputMode="numeric"
                    />
                  )}
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>
                  Combinations of attributes like size and colour, each with its
                  own price and stock.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SwitchField
                  control={form.control}
                  name="hasVariants"
                  label="This product has variants"
                />
                {hasVariants && <VariantBuilder form={form} />}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <SelectField
                    control={form.control}
                    name="category"
                    label="Primary category"
                    placeholder="Choose a category"
                    options={primaryOptions}
                    disabled={loadingCategories}
                  />
                  <MultiCategoryField
                    control={form.control}
                    name="categories"
                    label="Also list in"
                    lockedId={primary}
                    description="The product shows up in each checked category."
                  />
                  <TagsField
                    control={form.control}
                    name="tags"
                    label="Tags"
                    placeholder="Type and press Enter"
                    description="Tags help customers find the product in search."
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <SwitchField
                  control={form.control}
                  name="status"
                  label="Show in store"
                  description="Hidden products stay in the admin but customers cannot see them."
                  checkedValue="show"
                  uncheckedValue="hide"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:-mb-6 md:px-6">
          <Button
            variant="outline"
            render={<Link href="/products" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending || locked}>
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
