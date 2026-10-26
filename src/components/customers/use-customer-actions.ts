import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import type { UserStatus } from "@/store/api/auth/types";
import {
  useDeleteUserMutation,
  useSetUserStatusMutation,
} from "@/store/api/user/api/userApi";
import type { StaffUser } from "@/store/api/user/types";

export type CustomerPermissions = {
  canToggle: boolean;
  canDelete: boolean;
};

export function useCustomerActions() {
  const { user: me } = useSession();
  const permissions: CustomerPermissions = {
    canToggle: can(me, "user", "can_deactivate_user"),
    canDelete: can(me, "user", "can_delete_user"),
  };

  const [updateStatus, { isLoading: updatingStatus }] = useSetUserStatusMutation();
  const [remove, { isLoading: deleting }] = useDeleteUserMutation();

  const setStatus = async (customer: Pick<StaffUser, "_id" | "name">, status: UserStatus) => {
    try {
      await updateStatus({ id: customer._id, status }).unwrap();
      toast.success(
        `${customer.name} is now ${status === "active" ? "active" : "deactivated"}.`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the status."));
    }
  };

  const deleteCustomer = async (customer: Pick<StaffUser, "_id" | "name">) => {
    try {
      await remove(customer._id).unwrap();
      toast.success(`${customer.name} deleted.`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the customer."));
      return false;
    }
  };

  return { permissions, setStatus, deleteCustomer, updatingStatus, deleting };
}
