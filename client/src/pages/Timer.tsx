import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { playBeep } from "@/shared/sounds";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Timer() {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(minutes * 60 + seconds);
  const [timerName, setTimerName] = useState("My Timer");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const saveMutation = trpc.timers.save.useMutation();
  const createMutation = trpc.timers.create.useMutation();

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playBeep(800, 300);
            playBeep(800, 300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  // Update display when totalSeconds changes
  useEffect(() => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    setMinutes(mins);
    setSeconds(secs);
  }, [totalSeconds]);

  const handleStart = () => {
    if (totalSeconds > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalSeconds(0);
    setMinutes(0);
    setSeconds(0);
  };

  const handleSetDuration = (mins: number, secs: number) => {
    setIsRunning(false);
    setMinutes(mins);
    setSeconds(secs);
    setTotalSeconds(mins * 60 + secs);
  };

  const handleSaveTimer = async () => {
    try {
      const result = await createMutation.mutateAsync({
        name: timerName,
        duration: totalSeconds,
        isAdvanced: false,
      });

      if (result) {
        await saveMutation.mutateAsync({ timerId: (result as any).insertId });
        toast.success("Timer saved successfully!");
        setShowSaveDialog(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save timer");
    }
  };

  const displayMinutes = String(minutes).padStart(2, "0");
  const displaySeconds = String(seconds).padStart(2, "0");

  return (
    <DashboardLayout currentPage="timer">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Timer</h1>
            <p className="text-muted-foreground">Set a countdown timer with custom duration</p>
          </div>

          {/* Main Timer Display */}
          <div className="bg-card rounded-2xl shadow-lg p-12 mb-8 border border-border">
            <div className="text-center">
              <div className="timer-display text-7xl font-mono mb-8 text-primary">
                {displayMinutes}:{displaySeconds}
              </div>

              {/* Quick Duration Buttons */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                {[
                  { label: "1m", mins: 1, secs: 0 },
                  { label: "5m", mins: 5, secs: 0 },
                  { label: "10m", mins: 10, secs: 0 },
                  { label: "15m", mins: 15, secs: 0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handleSetDuration(preset.mins, preset.secs)}
                    disabled={isRunning}
                    className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Duration Input */}
              <div className="flex gap-4 mb-8 justify-center">
                <div className="flex flex-col items-center">
                  <label className="text-sm text-muted-foreground mb-2">Minutes</label>
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={minutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setMinutes(val);
                      setTotalSeconds(val * 60 + seconds);
                    }}
                    disabled={isRunning}
                    className="w-20 text-center text-lg"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <label className="text-sm text-muted-foreground mb-2">Seconds</label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => {
                      const val = Math.min(59, parseInt(e.target.value) || 0);
                      setSeconds(val);
                      setTotalSeconds(minutes * 60 + val);
                    }}
                    disabled={isRunning}
                    className="w-20 text-center text-lg"
                  />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4 justify-center">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
                    disabled={totalSeconds === 0}
                    size="lg"
                    className="gap-2"
                  >
                    <Play className="w-5 h-5" /> Start
                  </Button>
                ) : (
                  <Button
                    onClick={handlePause}
                    size="lg"
                    className="gap-2"
                  >
                    <Pause className="w-5 h-5" /> Pause
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Reset
                </Button>
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Save className="w-5 h-5" /> Save
                </Button>
              </div>
            </div>
          </div>

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 border border-border">
                <h2 className="text-2xl font-bold mb-4">Save Timer</h2>
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
