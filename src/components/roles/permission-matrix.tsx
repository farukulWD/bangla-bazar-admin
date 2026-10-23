"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { PermissionCatalogueModule } from "@/store/api/role/types";

export type PermissionState = Record<string, Record<string, boolean>>;

type PermissionMatrixProps = {
  catalogue: PermissionCatalogueModule[];
  value: PermissionState;
  onChange: (value: PermissionState) => void;
  disabled?: boolean;
};

export function PermissionMatrix({
  catalogue,
  value,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  const setModule = (module: string, permissions: Record<string, boolean>) =>
    onChange({ ...value, [module]: permissions });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {catalogue.map((entry) => {
        const granted = value[entry.module] ?? {};
        const grantedCount = entry.permissions.filter(
          (permission) => granted[permission.key]
        ).length;
        const allGranted = grantedCount === entry.permissions.length;
        const someGranted = grantedCount > 0 && !allGranted;

        return (
          <div key={entry.module} className="rounded-lg border">
            <label className="flex cursor-pointer items-center gap-3 border-b bg-muted/40 px-4 py-3">
              <Checkbox
                checked={allGranted}
                indeterminate={someGranted}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  setModule(
                    entry.module,
                    Object.fromEntries(
                      entry.permissions.map((permission) => [
                        permission.key,
                        checked,
                      ])
                    )
                  )
                }
              />
              <span className="flex-1 font-medium">{entry.label}</span>
              <span className="text-xs text-muted-foreground">
                {grantedCount}/{entry.permissions.length}
              </span>
            </label>

            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {entry.permissions.map((permission) => (
                <label
                  key={permission.key}
                  className="flex cursor-pointer items-start gap-2 text-sm"
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={granted[permission.key] === true}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      setModule(entry.module, {
                        ...granted,
                        [permission.key]: checked,
                      })
                    }
                  />
                  <span>{permission.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
