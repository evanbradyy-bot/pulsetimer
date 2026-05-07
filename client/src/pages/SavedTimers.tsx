import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface SavedTimer {
  id: number;
  name: string;
  duration: number;
  isAdvanced: boolean;
  rounds: number;
}

export default function SavedTimers() {
  const [, setLocation] = useLocation();
  const { data: timers, isLoading, refetch } = trpc.timers.saved.useQuery();
  const deleteMutation = trpc.timers.delete.useMutation();

  const handleDelete = async (timerId: number) => {
    try {
      await deleteMutation.mutateAsync({ timerId });
      toast.success("Timer deleted");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete timer");
    }
  };

  const handleStart = (timer: SavedTimer) => {
    if (timer.isAdvanced) {
      setLocation("/advanced");
    } else {
      setLocation("/timer");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <DashboardLayout currentPage="saved">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Saved Timers</h1>
            <p className="text-muted-foreground">Your collection of saved timers</p>
          </div>

          {/* Timers List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !timers || timers.length === 0 ? (
            <div className="bg-card rounded-2xl shadow-lg p-12 border border-border text-center">
              <p className="text-muted-foreground mb-4">No saved timers yet</p>
              <Button onClick={() => setLocation("/timer")}>
                Create Your First Timer
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {timers.map((timer) => (
                <div
                  key={timer.id}
                  className="bg-card rounded-2xl shadow-lg p-6 border border-border flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {timer.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {timer.isAdvanced ? "Advanced Timer" : "Simple Timer"}
                      </span>
                      {timer.isAdvanced ? (
                        <span>{timer.rounds} rounds</span>
                      ) : (
                        <span>{formatTime(timer.duration)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleStart(timer)}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" /> Start
                    </Button>
                    <Button
                      onClick={() => handleDelete(timer.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
