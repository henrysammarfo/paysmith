import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WaitlistGate from "./pages/WaitlistGate";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import ApiPlayground from "./pages/ApiPlayground";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Overview from "./pages/dashboard/Overview";
import Wallets from "./pages/dashboard/Wallets";
import ApiKeys from "./pages/dashboard/ApiKeys";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import Transactions from "./pages/dashboard/Transactions";
import WebhookLogs from "./pages/dashboard/WebhookLogs";
import AdminMetrics from "./pages/dashboard/AdminMetrics";
import ApiUsage from "./pages/dashboard/ApiUsage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark">
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<WaitlistGate />} />
            <Route path="/signup" element={<WaitlistGate />} />
            <Route path="/forgot-password" element={<WaitlistGate />} />
            <Route path="/reset-password" element={<WaitlistGate />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/playground" element={<ApiPlayground />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="wallets" element={<Wallets />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="webhook-logs" element={<WebhookLogs />} />
              <Route path="api-usage" element={<ApiUsage />} />
              <Route path="settings" element={<DashboardSettings />} />
              <Route path="metrics" element={<AdminRoute><AdminMetrics /></AdminRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
