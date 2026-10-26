import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { can } from "@/lib/permissions";
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from "@/lib/orders";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from "@/store/api/order/api/orderApi";
import type { Order, OrderStatus, PaymentStatus } from "@/store/api/order/types";

export type OrderPermissions = {
  canUpdateStatus: boolean;
  canUpdatePayment: boolean;
  canCancel: boolean;
};

export function useOrderActions() {
  const { user: me } = useSession();
  const permissions: OrderPermissions = {
    canUpdateStatus: can(me, "order", "can_update_order_status"),
    canUpdatePayment: can(me, "order", "can_update_payment_status"),
    canCancel: can(me, "order", "can_cancel_order"),
  };

  const [updateStatus, { isLoading: updatingStatus }] = useUpdateOrderStatusMutation();
  const [updatePayment, { isLoading: updatingPayment }] =
    useUpdatePaymentStatusMutation();
  const [cancel, { isLoading: cancelling }] = useCancelOrderMutation();

  const setStatus = async (order: Order, status: OrderStatus) => {
    try {
      await updateStatus({ id: order._id, status }).unwrap();
      toast.success(`Order #${order.invoice} is now ${STATUS_LABELS[status].toLowerCase()}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the order status."));
    }
  };

  const setPaymentStatus = async (order: Order, paymentStatus: PaymentStatus) => {
    try {
      await updatePayment({ id: order._id, paymentStatus }).unwrap();
      toast.success(
        `Order #${order.invoice} marked ${PAYMENT_STATUS_LABELS[paymentStatus].toLowerCase()}.`,
      );
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the payment status."));
    }
  };

  const cancelOrder = async (order: Order) => {
    try {
      await cancel(order._id).unwrap();
      toast.success(`Order #${order.invoice} cancelled.`);
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not cancel the order."));
      return false;
    }
  };

  return {
    permissions,
    setStatus,
    setPaymentStatus,
    cancelOrder,
    updatingStatus,
    updatingPayment,
    cancelling,
  };
}
