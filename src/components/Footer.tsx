import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "/docs" },
      { label: "Stellar demo", href: "/stellar" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Waitlist", href: "/#waitlist" },
      { label: "Playground", href: "/playground" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const socials = [
  { icon: Twitter, href: "https://x.com/henrysammarfo", label: "Twitter" },
  { icon: Github, href: "https://github.com/henrysammarfo/paysmith", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/henrysammarfo", label: "LinkedIn" },
];

const Footer = () => (
  <footer className="relative z-20 border-t border-border bg-background">
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 sm:col-span-1">
          <span className="text-lg font-semibold tracking-tight">Paysmith</span>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
            Policy-bound agent wallets for Africa MoMo sandboxes and Stellar
            testnet.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <s.icon size={18} aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {footerLinks.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-medium mb-3 text-foreground">{group.title}</h4>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Paysmith. Sandbox only — not a licensed
          VASP.{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy
          </Link>
          {" · "}
          <Link to="/terms" className="underline hover:text-foreground">
            Terms
          </Link>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
