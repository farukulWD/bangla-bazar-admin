"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Power, ShoppingBag, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api-error";
import { formatMoney } from "@/lib/coupons";
import {
  formatAddress,
  formatDateTime,
  formatOrderMoney,
  ORDER_STATUSES,
  STATUS_LABELS,
} from "@/lib/orders";
import { useGetOrdersQuery } from "@/store/api/order/api/orderApi";
import { useGetPublicSettingsQuery } from "@/store/api/settings/api/settingsApi";
import { useGetCustomerSummaryQuery } from "@/store/api/user/api/userApi";

import { CustomerStatusBadge, dateFormat, initials } from "./customer-row";
import { useCustomerActions } from "./use-customer-actions";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-heading text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: summary, isLoading, error } = useGetCustomerSummaryQuery(id);
  const { data: recent, isLoading: ordersLoading } = useGetOrdersQuery({
    userId: id,
    limit: 5,
    sort: "-createdAt",
  });
  const { data: settings } = useGetPublicSettingsQuery();
  const currency = settings?.store?.currencySymbol ?? "৳";
  const { permissions, setStatus, deleteCustomer, updatingStatus, deleting } =
    useCustomerActions();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Customer not found.")}
      </p>
    );
  }

  const { user: customer, stats, addresses } = summary;
  const active = customer.status === "active";
  const orders = recent?.data ?? [];

  const onDelete = async () => {
    if (await deleteCustomer(customer)) router.push("/customers");
  };

  return (
    <div className="w-full">
      <PageHeader
        title={customer.name}
        description={`Customer since ${dateFormat.format(new Date(customer.createdAt))}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/customers" />} nativeButton={false}>
              <ArrowLeft />
              Back
            </Button>
            {permissions.canToggle && (
              <Button
                variant="outline"
                disabled={updatingStatus}
                onClick={() => setStatus(customer, active ? "inactive" : "active")}
              >
                <Power />
                {active ? "Deactivate" : "Activate"}
              </Button>
            )}
            {permissions.canDelete && (
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 />
                Delete
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Orders" value={stats.orderCount.toLocaleString()} />
        <Stat label="Total spent" value={formatMoney(stats.totalSpent, currency)} />
        <Stat
          label="Average order"
          value={formatMoney(
            stats.orderCount ? stats.totalSpent / stats.orderCount : 0,
            currency,
          )}
        />
        <Stat
          label="Last order"
          value={
            <span className="text-base">
              {stats.lastOrderAt ? formatDateTime(stats.lastOrderAt) : "—"}
            </span>
          }
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent orders</CardTitle>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/orders?userId=${customer._id}`} />}
                nativeButton={false}
              >
                <ShoppingBag />
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {ordersLoading &&
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              {!ordersLoading && orders.length === 0 && (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              )}
              {orders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3 text-sm hover:bg-muted/50"
                >
                  <div>
                    <div className="font-mono font-medium">#{order.invoice}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium tabular-nums">
                      {formatOrderMoney(order.total, order.currency)}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved addresses.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <div key={address._id} className="space-y-1 rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{address.name}</span>
                        {address.isDefault && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <div className="text-muted-foreground">{address.contact}</div>
                      <div className="text-muted-foreground">{formatAddress(address)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  {customer.image && <AvatarImage src={customer.image} alt="" />}
                  <AvatarFallback>{initials(customer.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <CustomerStatusBadge status={customer.status} />
                </div>
              </div>
              <Row label="Email">
                {customer.email ?? "—"}
                {customer.email && customer.isEmailVerify && (
                  <Badge variant="secondary" className="ml-2">
                    Verified
                  </Badge>
                )}
              </Row>
              <Row label="Phone">
                {customer.phone ?? "—"}
                {customer.phone && customer.isPhoneVerify && (
                  <Badge variant="secondary" className="ml-2">
                    Verified
                  </Badge>
                )}
              </Row>
              <Row label="City">{customer.city || "—"}</Row>
              <Row label="Country">{customer.country || "—"}</Row>
              <Row label="Joined">{formatDateTime(customer.createdAt)}</Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ORDER_STATUSES.map((status) => (
                <Row key={status} label={STATUS_LABELS[status]}>
                  <span className="tabular-nums">{stats.byStatus[status] ?? 0}</span>
                </Row>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete customer?"
        description={
          <>
            <strong>{customer.name}</strong> will be deactivated and removed from the customer
            list. Their past orders are kept.
          </>
        }
        pending={deleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
