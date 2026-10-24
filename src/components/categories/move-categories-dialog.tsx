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

type MoveCategoriesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
  pending: boolean;
  onConfirm: (parentId: string | null) => void;
};

export function MoveCategoriesDialog({
  open,
  onOpenChange,
  ids,
  pending,
  onConfirm,
}: MoveCategoriesDialogProps) {
  const { options } = useCategoryOptions(ids);
  const [target, setTarget] = useState<string>(ROOT_PARENT);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Move {ids.length} categor{ids.length === 1 ? "y" : "ies"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Pick the new parent. Subcategories move along with them.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Select
          items={options}
          value={target}
          onValueChange={(value) => setTarget(value ?? ROOT_PARENT)}
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            disabled={pending}
            onClick={() => onConfirm(target === ROOT_PARENT ? null : target)}
          >
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            Move
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
