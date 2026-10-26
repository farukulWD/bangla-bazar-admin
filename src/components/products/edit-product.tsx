"use client";

import { useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { useGetProductQuery } from "@/store/api/product/api/productApi";

import { ProductForm } from "./product-form";

const POLL_MS = 3000;

export function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useGetProductQuery(id);
  const processing = product?.imageStatus === "processing";
  useGetProductQuery(id, { pollingInterval: POLL_MS, skip: !processing });

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Product not found.")}
      </p>
    );
  }

  return (
    <div className="w-full space-y-4">
      {product.imageStatus === "processing" && (
        <Alert>
          <Loader2 className="animate-spin" />
          <AlertTitle>Images are still uploading</AlertTitle>
          <AlertDescription>
            Saving is paused until the upload finishes. This page refreshes on
            its own.
          </AlertDescription>
        </Alert>
      )}
      {product.imageStatus === "failed" && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>The last image upload failed</AlertTitle>
          <AlertDescription>Add the images again and save.</AlertDescription>
        </Alert>
      )}
      <ProductForm
        key={product._id + product.updatedAt}
        product={product}
        locked={product.imageStatus === "processing"}
      />
    </div>
  );
}
