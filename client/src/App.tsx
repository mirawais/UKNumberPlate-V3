import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import Admin from "@/pages/Admin";
import Checkout from "@/pages/Checkout";
import Confirmation from "@/pages/Confirmation";
import { SiteConfigProvider } from "./context/SiteConfigContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/confirmation" component={Confirmation} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteConfigProvider>
        <Router />
        <Toaster />
      </SiteConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
