"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useCategoryOptions } from "@/components/form/category-select-field";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROOT_PARENT } from "@/lib/validation/category-schemas";

type SetCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  pending: boolean;
  onConfirm: (categoryId: string) => void;
};

export function SetCategoryDialog({
  open,
  onOpenChange,
  count,
  pending,
  onConfirm,
}: SetCategoryDialogProps) {
  const { options } = useCategoryOptions();
  const categories = options.filter((option) => option.value !== ROOT_PARENT);
  const [target, setTarget] = useState<string | null>(null);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Set category for {count} product{count === 1 ? "" : "s"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            It becomes their primary category. Their other categories stay.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Select items={categories} value={target} onValueChange={setTarget}>
          <SelectTrigger className="w-full data-[size=default]:h-10">
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            disabled={pending || !target}
            onClick={() => target && onConfirm(target)}
          >
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            Apply
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
