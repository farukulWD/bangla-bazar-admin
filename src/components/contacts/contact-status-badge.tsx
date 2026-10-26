import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import { CONTACT_STATUS_LABELS } from "@/lib/contacts";
import type { ContactStatus } from "@/store/api/contact/types";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_VARIANTS: Record<ContactStatus, BadgeVariant> = {
  new: "default",
  read: "outline",
  replied: "secondary",
  archived: "outline",
};

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      className={cn(status === "archived" && "text-muted-foreground")}
    >
      {CONTACT_STATUS_LABELS[status]}
    </Badge>
  );
}
