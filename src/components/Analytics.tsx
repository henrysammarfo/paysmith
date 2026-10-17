import { useEffect, useState } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { getCookieConsent } from "@/components/CookieConsent";

/** Loads Vercel Analytics only after cookie consent is accepted. */
export function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(getCookieConsent() === "accepted");
    sync();
    const onConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setEnabled(detail === "accepted");
    };
    window.addEventListener("paysmith-consent", onConsent);
    return () => window.removeEventListener("paysmith-consent", onConsent);
  }, []);

  if (!enabled) return null;
  return <VercelAnalytics />;
}
