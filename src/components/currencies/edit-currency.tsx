"use client";

import { useParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { useGetCurrencyQuery } from "@/store/api/currency/api/currencyApi";

import { CurrencyForm } from "./currency-form";

export function EditCurrency() {
  const { id } = useParams<{ id: string }>();
  const { data: currency, isLoading, error } = useGetCurrencyQuery(id);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !currency) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Currency not found.")}
      </p>
    );
  }

  return <CurrencyForm key={currency._id + currency.updatedAt} currency={currency} />;
}
