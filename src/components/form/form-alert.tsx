import { OctagonAlert } from "lucide-react";

import { Alert, AlertTitle } from "@/components/ui/alert";

const FormAlert = ({ message }: { message: string | null }) => {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="border-destructive/30">
      <OctagonAlert aria-hidden />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
};

export default FormAlert;
