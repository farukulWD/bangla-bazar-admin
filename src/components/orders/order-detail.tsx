"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Ban, FileText, Loader2, Truck } from "lucide-react";

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
import {
  formatAddress,
  formatDateTime,
  isCancellable,
  nextStatuses,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
  SHIPPING_LABELS,
  STATUS_LABELS,
} from "@/lib/orders";
import { useGetOrderQuery } from "@/store/api/order/api/orderApi";
import type { PaymentStatus } from "@/store/api/order/types";

import { OrderItems, OrderTotals } from "./order-items";
import { OrderStatusBadge, PaymentStatusBadge } from "./order-status-badge";
import { OrderTimeline } from "./order-timeline";
import { useOrderActions } from "./use-order-actions";

const PAYMENT_OPTIONS = PAYMENT_STATUSES.map((value) => ({
  label: PAYMENT_STATUS_LABELS[value],
  value,
}));

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useGetOrderQuery(id);
  const {
    permissions,
    setStatus,
    setPaymentStatus,
    cancelOrder,
    updatingStatus,
    updatingPayment,
    cancelling,
  } = useOrderActions();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Order not found.")}
      </p>
    );
  }

  const advances = permissions.canUpdateStatus ? nextStatuses(order) : [];
  const cancellable = permissions.canCancel && isCancellable(order);

  const onCancel = async () => {
    if (await cancelOrder(order)) setConfirmCancel(false);
  };

  return (
    <div className="w-full">
      <PageHeader
        title={`Order #${order.invoice}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/orders" />} nativeButton={false}>
              <ArrowLeft />
              Back
            </Button>
            <Button
              variant="outline"
              render={<Link href={`/orders/${order._id}/invoice`} />}
              nativeButton={false}
            >
              <FileText />
              Invoice
            </Button>
            {cancellable && (
              <Button variant="destructive" onClick={() => setConfirmCancel(true)}>
                <Ban />
                Cancel order
              </Button>
            )}
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderItems order={order} />
              <div className="border-t pt-4">
                <OrderTotals order={order} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Current">
                <OrderStatusBadge status={order.status} />
              </Row>
              <Row label="Delivery">{SHIPPING_LABELS[order.shippingOption]}</Row>
              {order.deliveredAt && (
                <Row label="Delivered">{formatDateTime(order.deliveredAt)}</Row>
              )}
              {order.cancelledAt && (
                <Row label="Cancelled">{formatDateTime(order.cancelledAt)}</Row>
              )}
              {advances.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {advances.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      disabled={updatingStatus}
                      onClick={() => setStatus(order, status)}
                    >
                      {updatingStatus ? <Loader2 className="animate-spin" /> : <Truck />}
                      Mark {STATUS_LABELS[status].toLowerCase()}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Method">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Row>
              <Row label="Status">
                {permissions.canUpdatePayment ? (
                  <Select
                    items={PAYMENT_OPTIONS}
                    value={order.paymentStatus}
                    disabled={updatingPayment}
                    onValueChange={(next) =>
                      next &&
                      next !== order.paymentStatus &&
                      setPaymentStatus(order, next as PaymentStatus)
                    }
                  >
                    <SelectTrigger className="w-32 data-[size=default]:h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <PaymentStatusBadge status={order.paymentStatus} />
                )}
              </Row>
              {order.paidAt && <Row label="Paid">{formatDateTime(order.paidAt)}</Row>}
              {order.paymentMethod === "sslcommerz" && (
                <Button
                  variant="link"
                  className="h-auto px-0"
                  render={<Link href={`/payments?orderId=${order._id}`} />}
                  nativeButton={false}
                >
                  View payment attempts
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {order.user ? (
                <>
                  <div className="font-medium">{order.user.name}</div>
                  {order.user.email && (
                    <div className="text-muted-foreground">{order.user.email}</div>
                  )}
                  {order.user.phone && (
                    <div className="text-muted-foreground">{order.user.phone}</div>
                  )}
                  <Button
                    variant="link"
                    className="h-auto px-0"
                    render={<Link href={`/orders?userId=${order.user._id}`} />}
                    nativeButton={false}
                  >
                    View all orders
                  </Button>
                </>
              ) : (
                <div className="text-muted-foreground">Account no longer exists.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="font-medium">{order.address.name}</div>
              <div className="text-muted-foreground">{order.address.contact}</div>
              {order.address.email && (
                <div className="text-muted-foreground">{order.address.email}</div>
              )}
              <div>{formatAddress(order.address)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel order?"
        description={
          <>
            Order <strong>#{order.invoice}</strong> will be cancelled and its stock returned.
            This cannot be undone.
          </>
        }
        confirmLabel="Cancel order"
        pending={cancelling}
        onConfirm={onCancel}
      />
    </div>
  );
}
