import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Timer from "@/pages/Timer";
import AdvancedTimer from "@/pages/AdvancedTimer";
import Stopwatch from "@/pages/Stopwatch";
import SavedTimers from "@/pages/SavedTimers";
import Presets from "@/pages/Presets";
import Upgrade from "@/pages/Upgrade";

function Router() {
  return (
    <Switch>
      <Route path={"/timer"} component={Timer} />
      <Route path={"/advanced"} component={AdvancedTimer} />
      <Route path={"/stopwatch"} component={Stopwatch} />
      <Route path={"/saved"} component={SavedTimers} />
      <Route path={"/presets"} component={Presets} />
      <Route path={"/upgrade"} component={Upgrade} />
      <Route path={"/"} component={Timer} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
