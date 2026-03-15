import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Tv } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

interface RegistrationModalProps {
  onComplete: () => void;
}

export default function RegistrationModal({
  onComplete,
}: RegistrationModalProps) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      await actor.saveCallerUserProfile({
        favorites: [],
        watchHistory: [],
        subscriptionStatus: false,
      });
      onComplete();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      data-ocid="registration.modal"
    >
      {/* Background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div className="bg-card/80 border border-border/50 rounded-2xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Tv className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">
              ozone<span className="text-primary">tv</span>
            </span>
          </div>

          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome to Ozone TV
            </h1>
            <p className="text-muted-foreground text-sm">
              Tell us a bit about yourself to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="reg-name"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </Label>
              <Input
                id="reg-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-muted/50 border-border focus:border-primary text-foreground placeholder:text-muted-foreground text-base"
                data-ocid="registration.name.input"
                autoComplete="name"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="reg-phone"
                className="text-sm font-medium text-foreground"
              >
                Phone Number
              </Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 bg-muted/50 border-border focus:border-primary text-foreground placeholder:text-muted-foreground text-base"
                data-ocid="registration.phone.input"
                autoComplete="tel"
                disabled={loading}
              />
            </div>

            {error && (
              <p
                className="text-destructive text-sm"
                data-ocid="registration.error_state"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 mt-2"
              data-ocid="registration.submit_button"
            >
              {loading ? (
                <span
                  className="flex items-center gap-2"
                  data-ocid="registration.loading_state"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Enter Ozone TV"
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
