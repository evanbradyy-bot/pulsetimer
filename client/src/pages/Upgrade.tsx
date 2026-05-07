import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Infinity } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Upgrade() {
  const { isPremium, setPremium } = usePremium();
  const [, setLocation] = useLocation();

  const handleUpgrade = async () => {
    try {
      await setPremium(true);
      toast.success("Welcome to Premium! 🎉");
      setLocation("/timer");
    } catch (error: any) {
      toast.error(error.message || "Failed to upgrade");
    }
  };

  const features = [
    { icon: Zap, title: "Advanced Timer", description: "Create custom interval timers with up to 10 intervals" },
    { icon: Infinity, title: "Unlimited Saved Timers", description: "Save as many timers as you want" },
    { icon: Crown, title: "Premium Presets", description: "Access 5 expertly-designed workout presets" },
  ];

  const freeFeatures = [
    "Simple countdown timer",
    "Stopwatch with lap tracking",
    "Save up to 5 timers",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "Advanced interval timer (up to 10 intervals)",
    "Unlimited saved timers",
    "5 premium workout presets",
    "Custom colors per interval",
    "Custom sounds per interval",
  ];

  return (
    <DashboardLayout currentPage="upgrade">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Upgrade to Premium
            </h1>
            <p className="text-xl text-muted-foreground">
              Unlock advanced features and unlimited possibilities
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card rounded-2xl shadow-lg p-8 border border-border text-center"
                >
                  <Icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Pricing Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Free Plan */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-2">Free</h2>
              <p className="text-muted-foreground mb-6">Perfect for basic timing needs</p>

              <div className="space-y-4 mb-8">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full" disabled>
                Your Current Plan
              </Button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/50 rounded-2xl shadow-lg p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  RECOMMENDED
                </span>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">Premium</h2>
              <p className="text-muted-foreground mb-6">Everything you need for serious training</p>

              <div className="space-y-4 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {isPremium ? (
                <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled>
                  Your Current Plan
                </Button>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Can I cancel my Premium subscription?
                </h3>
                <p className="text-muted-foreground">
                  Yes, you can downgrade to Free at any time. Your saved timers will be preserved.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-muted-foreground">
                  You can test Premium features by upgrading. If you're not satisfied, downgrade anytime.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  What happens to my timers if I downgrade?
                </h3>
                <p className="text-muted-foreground">
                  Your saved timers remain accessible. You'll only lose access to Premium features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
