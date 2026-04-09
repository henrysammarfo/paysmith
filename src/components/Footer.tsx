import { Link } from "react-router-dom";
import { Twitter, Github, Linkedin } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <span className="text-lg font-semibold tracking-tight">Paysmith</span>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Payment infrastructure for AI agents across Africa.
          </p>
          <div className="flex items-center gap-3 mt-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <s.icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {footerLinks.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-medium mb-3">{group.title}</h4>
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
          © {new Date().getFullYear()} Paysmith. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
