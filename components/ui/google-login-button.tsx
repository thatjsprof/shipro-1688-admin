import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icons } from "../shared/icons";

interface GoogleLoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const GoogleLoginButton = ({
  onClick,
  disabled = false,
  loading = false,
  className,
  children = "Continue with Google",
}: GoogleLoginButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "w-full h-11 shadow-none border-gray-300 hover:bg-gray-50 font-semibold",
        className
      )}
    >
      {loading ? (
        <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <img src="/google.png" className="h-4 w-4 mr-2" />
      )}
      {children}
    </Button>
  );
};
