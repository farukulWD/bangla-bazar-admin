"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AccessDenied } from "@/components/auth/access-denied";
import Form from "@/components/form/form";
import FormAlert from "@/components/form/form-alert";
import ImageField from "@/components/form/image-field";
import SwitchField from "@/components/form/switch-field";
import TextField from "@/components/form/text-field";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { toCouponFormData, toCouponFormValues } from "@/lib/coupons";
import { applyServerErrors } from "@/lib/form-errors";
import { can } from "@/lib/permissions";
import { couponSchema, type CouponValues } from "@/lib/validation/coupon-schemas";
import { useSession } from "@/store/api/auth/hooks/use-session";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from "@/store/api/coupon/api/couponApi";
import type { Coupon } from "@/store/api/coupon/types";

import { CouponDiscountFields } from "./coupon-discount-fields";
import { CouponScheduleFields } from "./coupon-schedule-fields";

const FIELDS = [
  "title",
  "couponCode",
  "logo",
  "discountType",
  "discountValue",
  "maxDiscountAmount",
  "minimumAmount",
  "startTime",
  "endTime",
  "status",
] as const;

type CouponFormProps = {
  coupon?: Coupon;
};

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const { user, isLoading: loadingSession } = useSession();
  const isEdit = Boolean(coupon);
  const allowed = can(user, "coupon", isEdit ? "can_edit_coupon" : "can_add_coupon");

  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: updating }] = useUpdateCouponMutation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<CouponValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: toCouponFormValues(coupon),
  });

  const onSubmit = async (values: CouponValues) => {
    setFormMessage(null);
    const data = toCouponFormData(values, isEdit);

    try {
      if (coupon) {
        await updateCoupon({ id: coupon._id, data }).unwrap();
        toast.success("Coupon updated.");
      } else {
        await createCoupon(data).unwrap();
        toast.success("Coupon created.");
      }
      router.push("/coupons");
    } catch (error) {
      const outcome = applyServerErrors(error, form.setError, FIELDS);
      setFormMessage(outcome.formMessage);
    }
  };

  if (!loadingSession && !allowed) {
    return (
      <AccessDenied
        message={`Your role does not include permission to ${isEdit ? "edit" : "add"} coupons.`}
      />
    );
  }

  const pending = creating || updating;

  return (
    <div className="w-full">
      <PageHeader
        title={isEdit ? `Edit ${coupon?.couponCode}` : "New coupon"}
        description="A code shoppers enter at checkout for a discount."
        actions={
          <Button
            variant="outline"
            render={<Link href="/coupons" />}
            nativeButton={false}
          >
            <ArrowLeft />
            Back
          </Button>
        }
      />

      <Form form={form} onSubmit={onSubmit} className="space-y-6">
        <FormAlert message={formMessage} />

        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <FieldGroup className="grid gap-6 md:grid-cols-2">
                  <TextField
                    control={form.control}
                    name="title"
                    label="Title"
                    placeholder="e.g. Eid sale"
                  />
                  <TextField
                    control={form.control}
                    name="couponCode"
                    label="Code"
                    placeholder="e.g. EID10"
                    className="font-mono uppercase"
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <CouponDiscountFields control={form.control} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>When shoppers can use the code.</CardDescription>
              </CardHeader>
              <CardContent>
                <CouponScheduleFields control={form.control} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
                <CardDescription>
                  Hidden coupons cannot be applied at checkout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SwitchField
                  control={form.control}
                  name="status"
                  label="Show in store"
                  checkedValue="show"
                  uncheckedValue="hide"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageField control={form.control} name="logo" label="Coupon logo" />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:-mb-6 md:px-6">
          <Button
            variant="outline"
            render={<Link href="/coupons" />}
            nativeButton={false}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 aria-hidden className="animate-spin" />}
            {isEdit ? "Save changes" : "Create coupon"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
