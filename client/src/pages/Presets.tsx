import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Play, Crown, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Preset {
  id: number;
  name: string;
  description: string | null;
  intervalsData: Array<{ duration: number; sound: string; color: string }>;
  rounds: number;
}

export default function Presets() {
  const { isPremium } = usePremium();
  const [, setLocation] = useLocation();
  const { data: presets, isLoading } = trpc.presets.list.useQuery();
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  // Initialize presets if empty
  useEffect(() => {
    if (presets && presets.length === 0) {
      initializePresets();
    }
  }, [presets]);

  const initializePresets = async () => {
    // Presets will be initialized on backend via database seeding
    // This is just a placeholder for future enhancements
  };

  const handleStartPreset = (preset: Preset) => {
    if (!isPremium) {
      toast.error("Premium feature - Upgrade to start presets");
      setLocation("/upgrade");
      return;
    }
    setSelectedPreset(preset);
    // In a real app, this would navigate to advanced timer with preset data
    toast.success(`Starting ${preset.name}...`);
  };

  const presetDescriptions: Record<string, string> = {
    "Tabata": "20 seconds work, 10 seconds rest - 8 rounds for maximum intensity",
    "HIIT": "30 seconds high intensity, 30 seconds recovery - 10 rounds",
    "Pomodoro": "25 minutes focused work, 5 minutes break - 4 rounds",
    "Warm-up": "5 minutes light cardio, 5 minutes dynamic stretching",
    "Cool-down": "5 minutes walking, 10 minutes static stretching",
  };

  return (
    <DashboardLayout currentPage="presets">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Premium Presets</h1>
            <p className="text-muted-foreground">
              {isPremium
                ? "Choose from our curated workout presets"
                : "Upgrade to Premium to unlock preset timers"}
            </p>
          </div>

          {/* Presets Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !presets || presets.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-lg p-12 border border-border text-center">
              <p className="text-muted-foreground mb-4">Presets are being initialized</p>
              <p className="text-sm text-muted-foreground">Please refresh the page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="bg-card rounded-2xl shadow-lg p-6 border border-border hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-foreground">
                      {preset.name}
                    </h3>
                    {!isPremium && (
                      <Crown className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    {presetDescriptions[preset.name] || preset.description}
                  </p>

                  {/* Preset Details */}
                  <div className="space-y-3 mb-6">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Rounds: </span>
                      <span className="font-medium">{preset.rounds}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Intervals: </span>
                      <span className="font-medium">{preset.intervalsData.length}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total Time: </span>
                      <span className="font-medium">
                        {Math.floor(
                          (preset.intervalsData.reduce((sum, i) => sum + i.duration, 0) *
                            preset.rounds) /
                            60
                        )}{" "}
                        min
                      </span>
                    </div>
                  </div>

                  {/* Interval Preview */}
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground mb-2">Intervals:</p>
                    <div className="flex gap-1 flex-wrap">
                      {preset.intervalsData.map((interval, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                          style={{ backgroundColor: interval.color }}
                          title={`${interval.duration}s`}
                        >
                          {interval.duration}s
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <Button
                    onClick={() => handleStartPreset(preset)}
                    disabled={!isPremium}
                    className="w-full gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isPremium ? "Start" : "Upgrade to Start"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Premium CTA */}
          {!isPremium && (
            <div className="mt-12 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center">
              <Crown className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Unlock Premium Presets
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get access to expertly-designed workout presets and unlimited saved timers
              </p>
              <Button
                onClick={() => setLocation("/upgrade")}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Upgrade to Premium
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
