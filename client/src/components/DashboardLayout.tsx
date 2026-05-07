import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { Clock, Zap, Activity, Save, Sparkles, LogOut, Crown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { getLoginUrl } from "@/const";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const { user, logout, loading } = useAuth();
  const { isPremium } = usePremium();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();

  const navItems = [
    { id: "timer", label: "Timer", icon: Clock, href: "/timer" },
    { id: "advanced", label: "Advanced Timer", icon: Zap, href: "/advanced", premium: true },
    { id: "stopwatch", label: "Stopwatch", icon: Activity, href: "/stopwatch" },
    { id: "saved", label: "Saved Timers", icon: Save, href: "/saved" },
    { id: "presets", label: "Presets", icon: Sparkles, href: "/presets" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
                PulseTimer
              </h1>
              <p className="text-sm text-muted-foreground">
                Elegant interval and workout timing for everyone
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
              size="lg"
              className="w-full"
            >
              Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Sign in with your Manus account to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">PulseTimer</h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isLocked = item.premium && !isPremium;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!isLocked) {
                    setLocation(item.href);
                  }
                }}
                disabled={isLocked}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isLocked
                    ? "text-muted-foreground opacity-50 cursor-not-allowed"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.premium && !isPremium && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Premium Banner */}
        {!isPremium && sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">Upgrade to Premium</span>
              </div>
              <p className="text-xs text-amber-800 mb-3">
                Unlock Advanced Timer, unlimited saved timers, and premium presets.
              </p>
              <button
                onClick={() => setLocation("/upgrade")}
                className="w-full inline-flex items-center justify-center px-3 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
                {isPremium && (
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    <Crown className="w-3 h-3" /> Premium
                  </p>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="ml-auto"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full"
          >
            {sidebarOpen ? "←" : "→"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
