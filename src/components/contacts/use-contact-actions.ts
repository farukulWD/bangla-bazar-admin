import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { CONTACT_STATUS_LABELS } from "@/lib/contacts";
import { can } from "@/lib/permissions";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useDeleteContactMutation,
  useUpdateContactStatusMutation,
} from "@/store/api/contact/api/contactApi";
import type { Contact, ContactStatus } from "@/store/api/contact/types";

export type ContactPermissions = {
  canEdit: boolean;
  canDelete: boolean;
};

export function useContactActions() {
  const { user: me } = useSession();
  const permissions: ContactPermissions = {
    canEdit: can(me, "contact", "can_edit_contact"),
    canDelete: can(me, "contact", "can_delete_contact"),
  };

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateContactStatusMutation();
  const [remove, { isLoading: deleting }] = useDeleteContactMutation();

  const setStatus = async (
    contact: Contact,
    status: ContactStatus,
    { silent = false }: { silent?: boolean } = {},
  ) => {
    try {
      await updateStatus({ id: contact._id, status }).unwrap();
      if (!silent) {
        toast.success(
          `Message marked ${CONTACT_STATUS_LABELS[status].toLowerCase()}.`,
        );
      }
    } catch (err) {
      if (!silent) toast.error(getErrorMessage(err, "Could not change the message status."));
    }
  };

  const deleteContact = async (contact: Contact) => {
    try {
      await remove(contact._id).unwrap();
      toast.success(`Message from ${contact.name} deleted.`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the message."));
      return false;
    }
  };

  return { permissions, setStatus, deleteContact, updatingStatus, deleting };
}
