"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { can } from "@/lib/permissions";
import { isEmptyPatch } from "@/lib/settings";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useGetSettingsQuery,
  useResetSettingsGroupMutation,
  useUpdateSettingsGroupMutation,
} from "@/store/api/settings/api/settingsApi";
import type { Settings, SettingsGroup } from "@/store/api/settings/types";

export const useCanEditSettings = () => {
  const { user } = useSession();
  return can(user, "settings", "can_edit_settings");
};

export function SettingsLoader({
  children,
}: {
  children: (settings: Settings) => React.ReactNode;
}) {
  const { data, isLoading, error } = useGetSettingsQuery();

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Settings could not be loaded.")}
      </p>
    );
  }

  return <>{children(data)}</>;
}

export const useSaveSettingsGroups = () => {
  const [update, { isLoading }] = useUpdateSettingsGroupMutation();

  const save = async (
    patches: Partial<Record<SettingsGroup, Record<string, unknown>>>,
  ) => {
    const entries = Object.entries(patches).filter(
      ([, patch]) => patch && !isEmptyPatch(patch),
    ) as [SettingsGroup, Record<string, unknown>][];

    if (entries.length === 0) {
      toast.info("No changes to save.");
      return null;
    }

    const results: Partial<Settings> = {};
    for (const [group, data] of entries) {
      Object.assign(results, { [group]: await update({ group, data }).unwrap() });
    }
    toast.success("Settings saved.");
    return results;
  };

  return { save, saving: isLoading };
};

type ResetGroupButtonProps = {
  groups: SettingsGroup[];
  description: React.ReactNode;
  onReset: (results: Partial<Settings>) => void;
};

export function ResetGroupButton({
  groups,
  description,
  onReset,
}: ResetGroupButtonProps) {
  const [open, setOpen] = useState(false);
  const [reset, { isLoading }] = useResetSettingsGroupMutation();

  const confirm = async () => {
    try {
      const results: Partial<Settings> = {};
      for (const group of groups) {
        Object.assign(results, { [group]: await reset(group).unwrap() });
      }
      toast.success("Restored default settings.");
      setOpen(false);
      onReset(results);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <RotateCcw />
        Reset to defaults
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Reset to defaults?"
        description={description}
        confirmLabel="Reset"
        pending={isLoading}
        onConfirm={confirm}
      />
    </>
  );
}

type SettingsFooterProps = {
  pending: boolean;
  dirty: boolean;
  onDiscard: () => void;
};

export function SettingsFooter({ pending, dirty, onDiscard }: SettingsFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:-mb-6 md:px-6">
      {dirty && (
        <span className="mr-auto text-sm text-muted-foreground">
          You have unsaved changes.
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        disabled={pending || !dirty}
        onClick={onDiscard}
      >
        Discard
      </Button>
      <Button type="submit" disabled={pending || !dirty}>
        {pending && <Loader2 aria-hidden className="animate-spin" />}
        Save changes
      </Button>
    </div>
  );
}
