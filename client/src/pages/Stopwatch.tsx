import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";

interface Lap {
  id: string;
  time: string;
  duration: number;
}

export default function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [lastLapTime, setLastLapTime] = useState(0);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTotalSeconds(0);
    setLaps([]);
    setLastLapTime(0);
  };

  const handleLap = () => {
    const lapDuration = totalSeconds - lastLapTime;
    const newLap: Lap = {
      id: Date.now().toString(),
      time: formatTime(totalSeconds),
      duration: lapDuration,
    };
    setLaps([newLap, ...laps]);
    setLastLapTime(totalSeconds);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const displayTime = formatTime(totalSeconds);

  return (
    <DashboardLayout currentPage="stopwatch">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Stopwatch</h1>
            <p className="text-muted-foreground">Track elapsed time with lap functionality</p>
          </div>

          {/* Main Display */}
          <div className="bg-card rounded-2xl shadow-lg p-12 mb-8 border border-border">
            <div className="text-center">
              <div className="timer-display text-7xl font-mono mb-8 text-primary">
                {displayTime}
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4 justify-center mb-8">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
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
              </div>

              {/* Lap Button */}
              <Button
                onClick={handleLap}
                variant="secondary"
                size="lg"
                disabled={!isRunning}
                className="gap-2 w-full"
              >
                <Flag className="w-5 h-5" /> Record Lap
              </Button>
            </div>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
              <h2 className="text-2xl font-bold mb-4">Laps</h2>
              <div className="space-y-2">
                {laps.map((lap, index) => (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <span className="font-medium">Lap {laps.length - index}</span>
                    <div className="text-right">
                      <div className="font-mono text-lg text-primary">
                        {formatTime(lap.duration)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total: {lap.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setLaps([])}
                variant="outline"
                className="w-full mt-4"
              >
                Clear Laps
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
