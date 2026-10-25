"use client";

import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getErrorMessage } from "@/lib/api-error";
import { rateSchema } from "@/lib/validation/currency-schemas";
import { useSetCurrencyRateMutation } from "@/store/api/currency/api/currencyApi";
import type { Currency } from "@/store/api/currency/types";

type CurrencyRatePopoverProps = {
  currency: Currency;
  baseCode: string;
};

export function CurrencyRatePopover({ currency, baseCode }: CurrencyRatePopoverProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(currency.rate));
  const [error, setError] = useState<string | null>(null);
  const [setRate, { isLoading }] = useSetCurrencyRateMutation();

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setValue(String(currency.rate));
      setError(null);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = rateSchema.safeParse(value);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid rate");
      return;
    }

    try {
      await setRate({ id: currency._id, rate: Number(parsed.data) }).unwrap();
      toast.success(`${currency.code} rate updated.`);
      setOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update the rate."));
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-xs" aria-label={`Edit ${currency.code} rate`} />
        }
      >
        <Pencil />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <PopoverHeader>
          <PopoverTitle>Exchange rate</PopoverTitle>
          <PopoverDescription>
            {currency.code} per 1 {baseCode}
          </PopoverDescription>
        </PopoverHeader>
        <form onSubmit={onSubmit} className="space-y-2">
          <Input
            autoFocus
            inputMode="decimal"
            aria-label="Exchange rate"
            aria-invalid={Boolean(error)}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            className="h-9"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading && <Loader2 aria-hidden className="animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
