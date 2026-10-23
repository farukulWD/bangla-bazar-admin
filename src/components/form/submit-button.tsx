"use client";

import { Loader2 } from "lucide-react";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  pending: boolean;
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

const SubmitButton = ({
  pending,
  children,
  pendingLabel,
  className,
}: SubmitButtonProps) => {
  return (
    <Button
      type="submit"
      variant="default"
      size="lg"
      disabled={pending}
      className={cn("h-10 w-full", className)}
    >
      {pending && <Loader2 aria-hidden className="animate-spin" />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
};

export default SubmitButton;
