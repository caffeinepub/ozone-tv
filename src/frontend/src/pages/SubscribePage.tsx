import { Button } from "@/components/ui/button";
import { Check, Crown, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsPremium, useIsStripeConfigured } from "../hooks/useQueries";

const FEATURES = [
  "Unlimited premium content",
  "HD & 4K streaming quality",
  "Ad-free experience",
  "Early access to new releases",
];

export default function SubscribePage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isPremium } = useIsPremium();
  const { data: stripeConfigured } = useIsStripeConfigured();
  const { actor } = useActor();
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Handle Stripe redirect back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId && actor) {
      actor.getStripeSessionStatus(sessionId).then((status) => {
        if (status.__kind__ === "completed") {
          setSessionStatus("success");
          toast.success("Welcome to Ozone TV Premium!");
        } else if (status.__kind__ === "failed") {
          setSessionStatus("failed");
          toast.error("Payment failed. Please try again.");
        }
      });
    }
  }, [actor]);

  // Once logged in after pending checkout, auto-start checkout
  useEffect(() => {
    if (pendingCheckout && identity && actor) {
      setPendingCheckout(false);
      startCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, actor, pendingCheckout]);

  const startCheckout = async () => {
    if (!actor) return;
    if (!stripeConfigured) {
      toast.error(
        "Payment is not configured yet. Please contact the administrator.",
      );
      return;
    }
    setIsLoading(true);
    try {
      const successUrl = `${window.location.origin}/#/subscribe?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/#/subscribe`;
      const url = await actor.createCheckoutSession(
        [
          {
            productName: "Ozone TV Premium",
            productDescription: "Monthly subscription to Ozone TV Premium",
            currency: "usd",
            priceInCents: BigInt(999),
            quantity: BigInt(1),
          },
        ],
        successUrl,
        cancelUrl,
      );
      window.location.href = url;
    } catch (_err) {
      toast.error("Failed to start checkout. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!identity) {
      // Not logged in — trigger login, then auto-proceed to checkout
      setPendingCheckout(true);
      login();
      return;
    }
    await startCheckout();
  };

  const isButtonBusy =
    isLoading || isLoggingIn || (pendingCheckout && !identity);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
            Ozone TV <span className="text-primary">Premium</span>
          </h1>
          <p className="text-muted-foreground">
            Unlock unlimited entertainment
          </p>
        </motion.div>

        {isPremium || sessionStatus === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/30 rounded-2xl p-8 text-center"
            data-ocid="subscribe.success_state"
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              You&apos;re Premium!
            </h2>
            <p className="text-muted-foreground">
              Enjoy unlimited access to all Ozone TV content.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
            data-ocid="subscribe.card"
          >
            {/* Price header */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 text-center border-b border-border">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-5xl font-display font-bold text-foreground">
                  $9
                </span>
                <span className="text-2xl font-display font-semibold text-foreground">
                  .99
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">Cancel anytime</p>
            </div>

            {/* Features */}
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                {FEATURES.map((text) => (
                  <li key={text} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-foreground text-sm">{text}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow font-semibold text-base"
                onClick={handleSubscribe}
                disabled={isButtonBusy}
                data-ocid="subscribe.primary_button"
              >
                {isButtonBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLoggingIn || pendingCheckout
                      ? "Signing in..."
                      : "Processing..."}
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" /> Subscribe Now — $9.99/mo
                  </>
                )}
              </Button>

              {!identity && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  You&apos;ll sign in quickly, then go straight to payment.
                </p>
              )}

              {!stripeConfigured && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Payment gateway not yet configured by admin.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
