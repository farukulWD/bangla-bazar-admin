import Link from "next/link";
import { cn } from "cn";
import {
  Archive,
  ArchiveRestore,
  Eye,
  Mail,
  MailOpen,
  MoreHorizontal,
  Reply,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { replyHref } from "@/lib/contacts";
import { formatDateTime } from "@/lib/orders";
import type { Contact, ContactStatus } from "@/store/api/contact/types";

import { ContactStatusBadge } from "./contact-status-badge";
import type { ContactPermissions } from "./use-contact-actions";

type ContactRowProps = {
  contact: Contact;
  permissions: ContactPermissions;
  onSetStatus: (status: ContactStatus) => void;
  onDelete: () => void;
};

export function ContactRow({ contact, permissions, onSetStatus, onDelete }: ContactRowProps) {
  const href = `/contacts/${contact._id}`;
  const unread = contact.status === "new";
  const archived = contact.status === "archived";

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className={cn(unread ? "font-semibold" : "font-medium")}>{contact.name}</div>
        <div className="text-xs text-muted-foreground">{contact.email}</div>
      </TableCell>
      <TableCell className="max-w-xs">
        <Link
          href={href}
          className={cn("block truncate hover:underline", unread && "font-semibold")}
        >
          {contact.subject}
        </Link>
        <div className="truncate text-xs text-muted-foreground">{contact.message}</div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {formatDateTime(contact.createdAt)}
      </TableCell>
      <TableCell>
        <ContactStatusBadge status={contact.status} />
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Message actions" />
              }
            >
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link href={href} />}>
                  <Eye />
                  View message
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={
                    <a href={replyHref(contact)} target="_blank" rel="noopener noreferrer" />
                  }
                  onClick={() =>
                    permissions.canEdit &&
                    contact.status !== "replied" &&
                    onSetStatus("replied")
                  }
                >
                  <Reply />
                  Reply in Gmail
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {permissions.canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {unread ? (
                      <DropdownMenuItem onClick={() => onSetStatus("read")}>
                        <MailOpen />
                        Mark read
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onSetStatus("new")}>
                        <Mail />
                        Mark unread
                      </DropdownMenuItem>
                    )}
                    {archived ? (
                      <DropdownMenuItem onClick={() => onSetStatus("read")}>
                        <ArchiveRestore />
                        Unarchive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onSetStatus("archived")}>
                        <Archive />
                        Archive
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </>
              )}
              {permissions.canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
