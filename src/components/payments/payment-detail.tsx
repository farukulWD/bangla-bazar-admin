"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/orders/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api-error";
import { formatDateTime } from "@/lib/orders";
import { CALLBACK_SOURCE_LABELS, formatPaymentAmount } from "@/lib/payments";
import { useGetPaymentQuery } from "@/store/api/payment/api/paymentApi";

import { PaymentStateBadge } from "./payment-status-badge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right break-all">{children}</span>
    </div>
  );
}

const orDash = (value: string) => value || "—";

export function PaymentDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: payment, isLoading, error } = useGetPaymentQuery(id);

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

  if (error || !payment) {
    return (
      <p className="py-10 text-center text-destructive">
        {getErrorMessage(error, "Payment not found.")}
      </p>
    );
  }

  const money = (value: number | null) =>
    value === null ? "—" : formatPaymentAmount(value, payment.currency);

  return (
    <div className="w-full">
      <PageHeader
        title={`Payment for #${payment.invoice}`}
        description={`Started ${formatDateTime(payment.initiatedAt)}`}
        actions={
          <>
            <Button variant="outline" render={<Link href="/payments" />} nativeButton={false}>
              <ArrowLeft />
              Back
            </Button>
            {payment.order && (
              <Button
                variant="outline"
                render={<Link href={`/orders/${payment.order._id}`} />}
                nativeButton={false}
              >
                <ShoppingCart />
                View order
              </Button>
            )}
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Gateway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Provider">
                <span className="capitalize">{payment.provider}</span>
              </Row>
              <Row label="Transaction ID">
                <span className="font-mono">{payment.tranId}</span>
              </Row>
              <Row label="Validation ID">
                <span className="font-mono">{orDash(payment.valId)}</span>
              </Row>
              <Row label="Bank transaction ID">
                <span className="font-mono">{orDash(payment.bankTranId)}</span>
              </Row>
              <Row label="Card type">{orDash(payment.cardType)}</Row>
              <Row label="Card issuer">{orDash(payment.cardIssuer)}</Row>
              <Row label="Risk">
                {payment.riskLevel
                  ? `${payment.riskLevel}${payment.riskTitle ? ` · ${payment.riskTitle}` : ""}`
                  : "—"}
              </Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Callbacks</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {payment.callbacks.length === 0 ? (
                <p className="px-6 text-muted-foreground">No callbacks received yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Source</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Gateway status</TableHead>
                      <TableHead className="hidden md:table-cell">Validation ID</TableHead>
                      <TableHead className="hidden pr-6 md:table-cell">IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payment.callbacks.map((callback, index) => (
                      <TableRow key={`${callback.at}-${index}`}>
                        <TableCell className="pl-6">
                          {CALLBACK_SOURCE_LABELS[callback.source]}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(callback.at)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {orDash(callback.gatewayStatus)}
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs md:table-cell">
                          {orDash(callback.valId)}
                        </TableCell>
                        <TableCell className="hidden pr-6 font-mono text-xs md:table-cell">
                          {orDash(callback.ip)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Status">
                <span className="inline-flex flex-wrap justify-end gap-1">
                  <PaymentStateBadge status={payment.status} />
                  {payment.duplicate && <Badge variant="outline">Duplicate</Badge>}
                </span>
              </Row>
              <Row label="Amount">
                <span className="font-medium tabular-nums">{money(payment.amount)}</span>
              </Row>
              <Row label="Validated amount">{money(payment.validatedAmount)}</Row>
              <Row label="Store amount">{money(payment.storeAmount)}</Row>
              {payment.settledBy && (
                <Row label="Settled by">{CALLBACK_SOURCE_LABELS[payment.settledBy]}</Row>
              )}
              {payment.failedReason && <Row label="Reason">{payment.failedReason}</Row>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Initiated">{formatDateTime(payment.initiatedAt)}</Row>
              {payment.verifiedAt && (
                <Row label="Verified">{formatDateTime(payment.verifiedAt)}</Row>
              )}
              {payment.paidAt && <Row label="Paid">{formatDateTime(payment.paidAt)}</Row>}
              {payment.failedAt && (
                <Row label="Failed">{formatDateTime(payment.failedAt)}</Row>
              )}
              <Row label="Last updated">{formatDateTime(payment.updatedAt)}</Row>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payment.order ? (
                <>
                  <Row label="Invoice">
                    <Link
                      href={`/orders/${payment.order._id}`}
                      className="font-mono font-medium hover:underline"
                    >
                      #{payment.order.invoice}
                    </Link>
                  </Row>
                  <Row label="Order status">
                    <OrderStatusBadge status={payment.order.status} />
                  </Row>
                  <Row label="Payment status">
                    <PaymentStatusBadge status={payment.order.paymentStatus} />
                  </Row>
                  <Button
                    variant="link"
                    className="h-auto px-0"
                    render={<Link href={`/payments?orderId=${payment.order._id}`} />}
                    nativeButton={false}
                  >
                    All payments for this order
                  </Button>
                </>
              ) : (
                <div className="text-muted-foreground">Order no longer exists.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {payment.user ? (
                <>
                  <div className="font-medium">{payment.user.name}</div>
                  {payment.user.email && (
                    <div className="text-muted-foreground">{payment.user.email}</div>
                  )}
                  {payment.user.phone && (
                    <div className="text-muted-foreground">{payment.user.phone}</div>
                  )}
                  <Button
                    variant="link"
                    className="h-auto px-0"
                    render={<Link href={`/customers/${payment.user._id}`} />}
                    nativeButton={false}
                  >
                    View customer
                  </Button>
                </>
              ) : (
                <div className="text-muted-foreground">Account no longer exists.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
