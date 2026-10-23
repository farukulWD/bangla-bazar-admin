import Link from "next/link";

type AuthFooterLinkProps = {
  prompt: string;
  href: string;
  label: string;
};

const AuthFooterLink = ({ prompt, href, label }: AuthFooterLinkProps) => {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-foreground hover:text-primary hover:underline">
        {label}
      </Link>
    </p>
  );
};

export default AuthFooterLink;
