import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "404 — Paysmith";
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <p className="text-xs tracking-[0.2em] text-muted-foreground mb-4">PAYSMITH</p>
      <h1 className="text-6xl sm:text-7xl font-semibold tracking-tight mb-3">404</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        This page doesn&apos;t exist or was moved. Try the home page or docs.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Go home
        </Link>
        <Link
          to="/docs"
          className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary/50 transition-colors"
        >
          Docs
        </Link>
        <Link
          to="/#waitlist"
          className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary/50 transition-colors"
        >
          Join waitlist
        </Link>
      </div>
      <p className="mt-10 text-xs text-muted-foreground font-mono">{location.pathname}</p>
    </div>
  );
};

export default NotFound;
