import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpDown,
  Key,
  Webhook,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  BarChart3,
  Gauge,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const BASE_NAV_ITEMS = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Wallets", path: "/dashboard/wallets", icon: Wallet },
  { label: "Transactions", path: "/dashboard/transactions", icon: ArrowUpDown },
  { label: "API Keys", path: "/dashboard/api-keys", icon: Key },
  { label: "Webhook Logs", path: "/dashboard/webhook-logs", icon: Webhook },
  { label: "API Usage", path: "/dashboard/api-usage", icon: Gauge },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];

const ADMIN_NAV_ITEMS = [
  { label: "Metrics", path: "/dashboard/metrics", icon: BarChart3 },
];

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null }>({ full_name: null, avatar_url: null });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
        setIsAdmin(!!data);
      });
    }
  }, [user]);

  const NAV_ITEMS = isAdmin ? [...BASE_NAV_ITEMS, ...ADMIN_NAV_ITEMS] : BASE_NAV_ITEMS;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = profile.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-30 ${sidebarWidth} bg-card border-r border-border flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-border`}>
          {!collapsed && (
            <Link to="/" className="text-xl font-semibold tracking-widest text-foreground">PAYSMITH</Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            const link = (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-2 py-4 border-t border-border">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Sign Out</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground w-full transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar (full overlay) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <Link to="/" className="text-xl font-semibold tracking-widest text-foreground">PAYSMITH</Link>
          <button onClick={() => setMobileOpen(false)} className="text-foreground">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground w-full transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "md:ml-[68px]" : "md:ml-64"}`}>
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-foreground">
            <Menu size={20} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground hidden sm:block">{profile.full_name || user?.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
