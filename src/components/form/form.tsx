"use client";

import type {
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

type FormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
  className?: string;
};

const Form = <T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormProps<T>) => {
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className={className}
    >
      {children}
    </form>
  );
};

export default Form;
