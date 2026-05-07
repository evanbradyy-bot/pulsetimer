import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Plus, Trash2, Save } from "lucide-react";
import { playBeep } from "@/shared/sounds";
import { trpc } from "@/lib/trpc";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Interval {
  id: string;
  duration: number;
  sound: string;
  color: string;
}

export default function AdvancedTimer() {
  const { isPremium } = usePremium();
  const [, setLocation] = useLocation();
  const [intervals, setIntervals] = useState<Interval[]>([
    { id: "1", duration: 20, sound: "bell", color: "#3b82f6" },
    { id: "2", duration: 10, sound: "beep", color: "#10b981" },
  ]);
  const [rounds, setRounds] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(intervals[0]?.duration || 0);
  const [timerName, setTimerName] = useState("Advanced Timer");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const createMutation = trpc.timers.create.useMutation();
  const createIntervalMutation = trpc.intervals.create.useMutation();

  // Check premium access
  useEffect(() => {
    if (!isPremium) {
      toast.error("Advanced Timer is a Premium feature");
      setLocation("/upgrade");
    }
  }, [isPremium, setLocation]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move to next interval
            const nextIndex = currentIntervalIndex + 1;
            if (nextIndex < intervals.length) {
              setCurrentIntervalIndex(nextIndex);
              setTimeLeft(intervals[nextIndex].duration);
              playBeep(800, 200);
            } else {
              // Move to next round
              if (currentRound < rounds) {
                setCurrentRound(currentRound + 1);
                setCurrentIntervalIndex(0);
                setTimeLeft(intervals[0].duration);
                playBeep(800, 300);
              } else {
                // Timer complete
                setIsRunning(false);
                playBeep(800, 300);
                playBeep(800, 300);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentIntervalIndex, currentRound, intervals, rounds]);

  const currentInterval = intervals[currentIntervalIndex];
  const displayMinutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const displaySeconds = String(timeLeft % 60).padStart(2, "0");

  const handleAddInterval = () => {
    if (intervals.length < 10) {
      setIntervals([
        ...intervals,
        {
          id: Date.now().toString(),
          duration: 30,
          sound: "bell",
          color: "#3b82f6",
        },
      ]);
    } else {
      toast.error("Maximum 10 intervals allowed");
    }
  };

  const handleDeleteInterval = (id: string) => {
    if (intervals.length > 1) {
      setIntervals(intervals.filter((i) => i.id !== id));
    } else {
      toast.error("At least one interval is required");
    }
  };

  const handleUpdateInterval = (id: string, field: string, value: any) => {
    setIntervals(
      intervals.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      )
    );
  };

  const handleStart = () => {
    if (intervals.length > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setCurrentIntervalIndex(0);
    setTimeLeft(intervals[0]?.duration || 0);
  };

  const handleSaveTimer = async () => {
    try {
      const result = await createMutation.mutateAsync({
        name: timerName,
        duration: 0,
        isAdvanced: true,
        rounds,
      });

      if (result && (result as any).insertId) {
        const timerId = (result as any).insertId;

        // Save intervals
        for (let i = 0; i < intervals.length; i++) {
          await createIntervalMutation.mutateAsync({
            timerId,
            orderIndex: i,
            duration: intervals[i].duration,
            sound: intervals[i].sound,
            color: intervals[i].color,
          });
        }

        toast.success("Advanced timer saved successfully!");
        setShowSaveDialog(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save timer");
    }
  };

  if (!isPremium) {
    return null;
  }

  return (
    <DashboardLayout currentPage="advanced">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Advanced Timer</h1>
            <p className="text-muted-foreground">Create custom interval timers with up to 10 intervals</p>
          </div>

          {/* Main Display */}
          <div
            className="rounded-2xl shadow-lg p-12 mb-8 border border-border transition-all"
            style={{ backgroundColor: currentInterval?.color || "#3b82f6" }}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-white/80 mb-2">
                Round {currentRound} of {rounds} • Interval {currentIntervalIndex + 1} of {intervals.length}
              </div>
              <div className="timer-display text-7xl font-mono mb-8 text-white">
                {displayMinutes}:{displaySeconds}
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4 justify-center">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="gap-2 bg-white text-black hover:bg-white/90"
                  >
                    <Play className="w-5 h-5" /> Start
                  </Button>
                ) : (
                  <Button
                    onClick={handlePause}
                    size="lg"
                    className="gap-2 bg-white text-black hover:bg-white/90"
                  >
                    <Pause className="w-5 h-5" /> Pause
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="gap-2 border-white text-white hover:bg-white/10"
                >
                  <RotateCcw className="w-5 h-5" /> Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Rounds Configuration */}
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold">Rounds</label>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setRounds(Math.max(1, rounds - 1))}
                  variant="outline"
                  disabled={isRunning}
                >
                  −
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={rounds}
                  onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isRunning}
                  className="w-20 text-center"
                />
                <Button
                  onClick={() => setRounds(rounds + 1)}
                  variant="outline"
                  disabled={isRunning}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Intervals Configuration */}
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Intervals ({intervals.length}/10)</h2>
              <Button
                onClick={handleAddInterval}
                disabled={intervals.length >= 10 || isRunning}
                className="gap-2"
              >
                <Plus className="w-4 h-4" /> Add Interval
              </Button>
            </div>

            <div className="space-y-4">
              {intervals.map((interval, index) => (
                <div
                  key={interval.id}
                  className="flex items-end gap-4 p-4 bg-muted rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                    <Input
                      type="number"
                      min="1"
                      max="3600"
                      value={interval.duration}
                      onChange={(e) =>
                        handleUpdateInterval(interval.id, "duration", parseInt(e.target.value) || 1)
                      }
                      disabled={isRunning}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Sound</label>
                    <select
                      value={interval.sound}
                      onChange={(e) =>
                        handleUpdateInterval(interval.id, "sound", e.target.value)
                      }
                      disabled={isRunning}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="bell">Bell</option>
                      <option value="beep">Beep</option>
                      <option value="ding">Ding</option>
                      <option value="buzzer">Buzzer</option>
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={interval.color}
                        onChange={(e) =>
                          handleUpdateInterval(interval.id, "color", e.target.value)
                        }
                        disabled={isRunning}
                        className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{interval.color}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDeleteInterval(interval.id)}
                    variant="destructive"
                    size="sm"
                    disabled={intervals.length === 1 || isRunning}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              onClick={() => setShowSaveDialog(true)}
              className="flex-1 gap-2"
            >
              <Save className="w-5 h-5" /> Save Advanced Timer
            </Button>
          </div>

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 border border-border">
                <h2 className="text-2xl font-bold mb-4">Save Advanced Timer</h2>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Timer Name</label>
                  <Input
                    type="text"
                    value={timerName}
                    onChange={(e) => setTimerName(e.target.value)}
                    placeholder="Enter timer name"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={handleSaveTimer}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setShowSaveDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
