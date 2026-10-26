import { Card, CardContent } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const AuthCard = ({ title, subtitle, children }: AuthCardProps) => {
  return (
    <Card className="shadow-xl [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(10)]">
      <CardContent className="space-y-8 px-(--card-spacing)">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {subtitle}
          </p>
        </div>

        {children}
      </CardContent>
    </Card>
  );
};

export default AuthCard;
