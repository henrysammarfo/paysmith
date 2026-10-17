import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Wallet } from "lucide-react";

/**
 * Freighter-connected demo surface for Stellar 14 Demo Day.
 * Uses window.freighterApi when the extension is installed (no npm dep required for judges).
 */
type FreighterApi = {
  isConnected: () => Promise<{ isConnected: boolean } | boolean>;
  requestAccess: () => Promise<{ address?: string } | string>;
  getNetwork: () => Promise<{ network?: string; networkPassphrase?: string } | string>;
};

declare global {
  interface Window {
    freighterApi?: FreighterApi;
    stellar?: FreighterApi;
  }
}

const CONTRACT_ID =
  "CAXYX34FEXUNWELLIFFH24UFUGOVPITBA5BBGTZNWR23OWB5L46VNKUW";
const LAB_URL = `https://lab.stellar.org/smart-contracts/contract-explorer?network=testnet&contractId=${CONTRACT_ID}`;

function getFreighter(): FreighterApi | null {
  return window.freighterApi ?? window.stellar ?? null;
}

const StellarDemo = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const connect = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const api = getFreighter();
      if (!api) {
        setError("Install Freighter (freighter.app) then refresh this page.");
        return;
      }
      const access = await api.requestAccess();
      const addr =
        typeof access === "string" ? access : access.address ?? null;
      if (!addr) {
        setError("Freighter did not return an address.");
        return;
      }
      setAddress(addr);
      try {
        const net = await api.getNetwork();
        setNetwork(
          typeof net === "string" ? net : net.network ?? net.networkPassphrase ?? "unknown",
        );
      } catch {
        setNetwork("testnet (assumed)");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Paysmith
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-4">
            Stellar 14 — Freighter demo
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect Freighter on <strong>testnet</strong> to verify your pubkey. Agent
            payments settle via Horizon USDC/XLM; spending caps are enforced on-chain by
            our Soroban policy contract.
          </p>
        </div>

        <div className="rounded-2xl border border-border p-6 space-y-4">
          <button
            type="button"
            onClick={connect}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-medium disabled:opacity-50"
          >
            <Wallet size={18} />
            {busy ? "Connecting…" : address ? "Reconnect Freighter" : "Connect Freighter"}
          </button>

          {error && (
            <p className="text-sm text-destructive">
              {error}{" "}
              <a
                className="underline"
                href="https://freighter.app"
                target="_blank"
                rel="noreferrer"
              >
                Get Freighter
              </a>
            </p>
          )}

          {address && (
            <div className="text-sm space-y-2 font-mono break-all">
              <p>
                <span className="text-muted-foreground">Address: </span>
                {address}
              </p>
              {network && (
                <p>
                  <span className="text-muted-foreground">Network: </span>
                  {network}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border p-6 space-y-3 text-sm">
          <h2 className="font-medium text-base">Soroban spending policy (testnet)</h2>
          <p className="font-mono text-xs break-all text-muted-foreground">{CONTRACT_ID}</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>
              <code className="text-foreground">try_spend</code> — authoritative daily
              spend ledger
            </li>
            <li>
              <code className="text-foreground">get_spent</code> /{" "}
              <code className="text-foreground">set_wallet_policy</code> — read &amp;
              override caps
            </li>
            <li>
              <code className="text-foreground">init_admin</code> — optional admin gate
            </li>
          </ul>
          <a
            href={LAB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Open in Stellar Lab <ExternalLink size={14} />
          </a>
        </div>

        <div className="rounded-2xl border border-border p-6 space-y-2 text-sm text-muted-foreground">
          <h2 className="font-medium text-base text-foreground">Ecosystem stack (Stellar 14)</h2>
          <p>
            Horizon payments · Soroban policy · Freighter · Stellar Lab · OpenZeppelin
            Relayer path (roadmap) ·{" "}
            <code className="text-foreground">@paysmithhq/sdk</code> + MCP for AI agents.
          </p>
          <p>
            Docs: <Link to="/docs" className="text-primary hover:underline">/docs</Link> ·
            Waitlist:{" "}
            <a href="/#waitlist" className="text-primary hover:underline">
              /#waitlist
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StellarDemo;
