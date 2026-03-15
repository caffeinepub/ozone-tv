import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface LoginPromptProps {
  message?: string;
}

export default function LoginPrompt({
  message = "Sign in to access this content",
}: LoginPromptProps) {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div
      className="flex flex-col items-center justify-center py-24 gap-6"
      data-ocid="login.panel"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <LogIn className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="font-display font-semibold text-xl text-foreground mb-2">
          Sign In Required
        </h3>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Button
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm"
        onClick={login}
        disabled={isLoggingIn}
        data-ocid="login.primary_button"
      >
        {isLoggingIn ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  );
}
