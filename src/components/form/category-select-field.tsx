"use client";

import { useMemo } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { collectBranchIds, flattenTree } from "@/lib/categories";
import { ROOT_PARENT } from "@/lib/validation/category-schemas";
import { useGetCategoryTreeQuery } from "@/store/api/category/api/categoryApi";

import SelectField, { type SelectOption } from "./select-field";

type CategorySelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  excludeIds?: string[];
  description?: React.ReactNode;
  disabled?: boolean;
};

export const useCategoryOptions = (excludeIds: string[] = []) => {
  const { data: tree = [], isLoading } = useGetCategoryTreeQuery();

  const options = useMemo<SelectOption[]>(() => {
    const excluded = collectBranchIds(tree, excludeIds);
    return [
      { label: "None — top-level category", value: ROOT_PARENT },
      ...flattenTree(tree)
        .filter(({ node }) => !excluded.has(node._id))
        .map(({ node, depth }) => ({
          label: `${"— ".repeat(depth)}${node.name}`,
          value: node._id,
        })),
    ];
  }, [tree, excludeIds]);

  return { options, isLoading };
};

const CategorySelectField = <T extends FieldValues>({
  control,
  name,
  label,
  excludeIds,
  description,
  disabled,
}: CategorySelectFieldProps<T>) => {
  const { options, isLoading } = useCategoryOptions(excludeIds);

  return (
    <SelectField
      control={control}
      name={name}
      label={label}
      options={options}
      description={description}
      disabled={disabled || isLoading}
    />
  );
};

export default CategorySelectField;
