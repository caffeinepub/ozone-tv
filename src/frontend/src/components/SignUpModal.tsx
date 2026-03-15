import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  ChevronLeft,
  ClipboardCopy,
  Loader2,
  ShieldCheck,
  Tv,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SignUpModalProps {
  onClose: () => void;
}

type Step = 1 | 2 | 3;

function generatePin(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export default function SignUpModal({ onClose }: SignUpModalProps) {
  const { actor } = useActor();
  const { login, isLoginSuccess, isLoggingIn } = useInternetIdentity();

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pin] = useState(generatePin);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const loginTriggered = useRef(false);

  // Step 3: trigger II login once
  useEffect(() => {
    if (step === 3 && !loginTriggered.current) {
      loginTriggered.current = true;
      login();
    }
  }, [step, login]);

  // On II success, save profile and close
  useEffect(() => {
    if (!isLoginSuccess || !actor) return;
    const handleSuccess = async () => {
      setSaving(true);
      try {
        const existing = await actor.getCallerUserProfile();
        if (!existing) {
          await actor.saveCallerUserProfile({
            favorites: [],
            watchHistory: [],
            subscriptionStatus: false,
          });
        }
      } catch {
        // best-effort
      } finally {
        setSaving(false);
        onClose();
      }
    };
    handleSuccess();
  }, [isLoginSuccess, actor, onClose]);

  const goTo = (next: Step) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Please enter your phone number.");
      return;
    }
    goTo(2);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pin).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const pinChars = pin.split("");

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      data-ocid="signup.modal"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== 3 ? onClose : undefined}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-2/3 h-2/3 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Modal card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-border/40">
            <div className="flex items-center justify-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow-sm">
                <Tv className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                ozone<span className="text-primary">tv</span>
              </span>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2">
              {([1, 2, 3] as Step[]).map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      s < step
                        ? "bg-primary text-primary-foreground"
                        : s === step
                          ? "bg-primary/20 text-primary ring-2 ring-primary/50"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-8 h-0.5 rounded-full transition-all duration-300 ${
                        s < step ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="px-8 py-7 min-h-[320px] overflow-hidden relative">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Create Your Account
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Tell us about yourself to get started
                  </p>

                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="su-name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <Input
                        id="su-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 bg-muted/40 border-border focus:border-primary"
                        data-ocid="signup.name.input"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="su-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-muted/40 border-border focus:border-primary"
                        data-ocid="signup.email.input"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="su-phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="su-phone"
                        type="tel"
                        placeholder="+1 555 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-11 bg-muted/40 border-border focus:border-primary"
                        data-ocid="signup.phone.input"
                        autoComplete="tel"
                      />
                    </div>

                    {formError && (
                      <p
                        className="text-destructive text-sm"
                        data-ocid="signup.error_state"
                      >
                        {formError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                      data-ocid="signup.step1.primary_button"
                    >
                      Continue
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="font-display text-2xl font-bold text-foreground mb-1">
                    Your Account PIN
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Save this PIN — you may need it to recover your account
                  </p>

                  {/* PIN display */}
                  <div className="bg-muted/30 border border-primary/20 rounded-xl p-6 mb-6 text-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                      Your secure PIN
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {pinChars.map((char, pos) => (
                        <span
                          key={`pin-${pos}-${char}`}
                          className="w-10 h-12 flex items-center justify-center bg-background border border-border rounded-lg font-mono text-xl font-bold text-primary shadow-sm"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPin}
                      className="gap-2 text-xs border-border hover:border-primary/50"
                      data-ocid="signup.pin.button"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-primary" /> Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardCopy className="w-3.5 h-3.5" /> Copy PIN
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mb-6">
                    ⚠️ Screenshot or write this PIN down. It will not be shown
                    again.
                  </p>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 border-border"
                      onClick={() => goTo(1)}
                      data-ocid="signup.step2.secondary_button"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 h-11 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => goTo(3)}
                      data-ocid="signup.step2.primary_button"
                    >
                      Continue to Verify
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="mb-6"
                  >
                    {saving ? (
                      <Loader2 className="w-14 h-14 text-primary" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                        <ShieldCheck
                          className="w-7 h-7 text-primary"
                          style={{ animation: "none" }}
                        />
                      </div>
                    )}
                  </motion.div>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Verify Your Identity
                  </h2>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    {saving
                      ? "Setting up your account..."
                      : isLoggingIn
                        ? "Opening secure verification..."
                        : "Complete the verification popup to continue"}
                  </p>

                  {(isLoggingIn || saving) && (
                    <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {saving
                        ? "Saving profile..."
                        : "Waiting for verification..."}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
