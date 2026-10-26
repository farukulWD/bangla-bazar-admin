"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Reply, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { CONTACT_STATUS_LABELS, CONTACT_STATUSES, replyHref } from "@/lib/contacts";
import { formatDateTime } from "@/lib/orders";
import { useGetContactQuery } from "@/store/api/contact/api/contactApi";
import type { ContactStatus } from "@/store/api/contact/types";

import { ContactStatusBadge } from "./contact-status-badge";
import { useContactActions } from "./use-contact-actions";

const STATUS_OPTIONS = CONTACT_STATUSES.map((value) => ({
  label: CONTACT_STATUS_LABELS[value],
  value,
}));

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right break-words">{children}</span>
    </div>
  );
}

export function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: contact, isLoading, error } = useGetContactQuery(id);
  const { permissions, setStatus, deleteContact, updatingStatus, deleting } =
    useContactActions();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const markedRead = useRef(false);

  useEffect(() => {
    if (!contact || contact.status !== "new" || !permissions.canEdit) return;
    if (markedRead.current) return;
    markedRead.current = true;
    setStatus(contact, "read", { silent: true });
  }, [contact, permissions.canEdit, setStatus]);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Message not found.")}
      </p>
    );
  }

  const onDelete = async () => {
    if (await deleteContact(contact)) {
      setConfirmDelete(false);
      router.push("/contacts");
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title={contact.subject}
        description={`From ${contact.name} · ${formatDateTime(contact.createdAt)}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/contacts" />} nativeButton={false}>
              <ArrowLeft />
              Back
            </Button>
            <Button
              render={
                <a href={replyHref(contact)} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
              onClick={() =>
                permissions.canEdit &&
                contact.status !== "replied" &&
                setStatus(contact, "replied")
              }
            >
              <Reply />
              Reply in Gmail
            </Button>
            {permissions.canDelete && (
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 />
                Delete
              </Button>
            )}
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="break-words whitespace-pre-wrap">{contact.message}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Status">
                {permissions.canEdit ? (
                  <Select
                    items={STATUS_OPTIONS}
                    value={contact.status}
                    disabled={updatingStatus}
                    onValueChange={(next) =>
                      next &&
                      next !== contact.status &&
                      setStatus(contact, next as ContactStatus)
                    }
                  >
                    <SelectTrigger className="w-32 data-[size=default]:h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <ContactStatusBadge status={contact.status} />
                )}
              </Row>
              <Row label="Received">{formatDateTime(contact.createdAt)}</Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sender</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="font-medium">{contact.name}</div>
              <div className="break-all text-muted-foreground">{contact.email}</div>
              {contact.user ? (
                <Button
                  variant="link"
                  className="h-auto px-0"
                  render={<Link href={`/customers/${contact.user}`} />}
                  nativeButton={false}
                >
                  Registered customer
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">Guest</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete message?"
        description={
          <>
            The message from <strong>{contact.name}</strong> will be permanently deleted.
            This cannot be undone.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
