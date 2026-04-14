import { useState } from "react";
import { Link } from "react-router-dom";
import CodeIntegrationSection from "@/components/CodeIntegrationSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import SectionDivider from "@/components/SectionDivider";
import ProblemSection from "@/components/ProblemSection";
import FeaturesSection from "@/components/FeaturesSection";
import MoatSection from "@/components/MoatSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import {
  Menu,
  X,
  Clock,
  Calendar,
  Play,
  ArrowRight,
} from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4";

const NAV_LINKS = [
  { label: "Product", href: "#features", isPage: false },
  { label: "Developers", href: "#code", isPage: false },
  { label: "Pricing", href: "/pricing", isPage: true },
  { label: "Docs", href: "/docs", isPage: true },
  { label: "Playground", href: "/playground", isPage: true },
  { label: "Blog", href: "/blog", isPage: true },
];

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_URL}
      />

      {/* Video darkening overlay for text readability */}
      <div className="fixed inset-0 z-[1] bg-background/40" />

      {/* Bottom Blur Overlay */}
      <div
        className="fixed inset-0 z-[2] backdrop-blur-xl pointer-events-none"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 45%)",
          maskImage: "linear-gradient(to top, black 0%, transparent 45%)",
        }}
      />

      {/* Hero Section */}
      <div className="relative h-[100svh] w-full overflow-hidden">
        {/* Main Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Navbar */}
          <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
            <div
              className="animate-blur-fade-up text-xl md:text-2xl font-semibold tracking-widest"
              style={{ animationDelay: "0ms" }}
            >
              PAYSMITH
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link, i) =>
                link.isPage ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="animate-blur-fade-up text-sm text-foreground/80 hover:text-foreground/60 transition-colors"
                    style={{ animationDelay: `${100 + i * 50}ms` }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="animate-blur-fade-up text-sm text-foreground/80 hover:text-foreground/60 transition-colors"
                    style={{ animationDelay: `${100 + i * 50}ms` }}
                  >
                    {link.label}
                  </a>
                )
              )}
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                className="animate-blur-fade-up flex lg:hidden items-center justify-center w-10 h-10 rounded-full liquid-glass relative z-[60]"
                style={{ animationDelay: "350ms" }}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <div className="relative w-[18px] h-[18px]">
                  <Menu
                    size={18}
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      menuOpen
                        ? "rotate-180 opacity-0 scale-50"
                        : "rotate-0 opacity-100 scale-100"
                    }`}
                  />
                  <X
                    size={18}
                    className={`absolute inset-0 transition-all duration-500 ease-out ${
                      menuOpen
                        ? "rotate-0 opacity-100 scale-100"
                        : "-rotate-180 opacity-0 scale-50"
                    }`}
                  />
                </div>
              </button>
            </div>
          </nav>

          {/* Full-screen Mobile Menu */}
          <div
            className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ease-out ${
              menuOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-background/98 backdrop-blur-2xl" />
            <div className="relative z-10 flex flex-col h-full px-6 pt-24 pb-12">
              <div className="flex-1 flex flex-col justify-center gap-2">
                {NAV_LINKS.map((link, i) => {
                  const content = (
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl font-light tracking-tight">{link.label}</span>
                      <ArrowRight size={20} className="text-muted-foreground" />
                    </div>
                  );
                  const className = `py-4 border-b border-border/50 text-foreground transition-all duration-500 ${
                    menuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  }`;
                  const style = { transitionDelay: menuOpen ? `${150 + i * 75}ms` : "0ms" };

                  return link.isPage ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={className}
                      style={style}
                      onClick={() => setMenuOpen(false)}
                    >
                      {content}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className={className}
                      style={style}
                      onClick={() => setMenuOpen(false)}
                    >
                      {content}
                    </a>
                  );
                })}
              </div>

              {/* Menu CTA */}
              <div
                className={`flex flex-col gap-3 transition-all duration-500 ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: menuOpen ? "600ms" : "0ms" }}
              >
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full font-medium px-8 py-3"
                  onClick={() => setMenuOpen(false)}
                >
                  <Play size={18} className="fill-primary-foreground" />
                  Get Started
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center md:justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
              <div className="flex-1 max-w-3xl">
                {/* Metadata */}
                <div
                  className="animate-blur-fade-up flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm"
                  style={{ animationDelay: "300ms" }}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="sm:w-5 sm:h-5" />
                    3-Line Integration
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="sm:w-5 sm:h-5" />
                    Stellar WA Residency
                  </span>
                </div>

                {/* Title */}
                <h1
                  className="animate-blur-fade-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.04em] mb-4 md:mb-6 leading-[1.1]"
                  style={{ animationDelay: "400ms" }}
                >
                  The Stripe for AI Agents in Africa
                </h1>

                {/* Description */}
                <p
                  className="animate-blur-fade-up text-sm sm:text-lg md:text-xl text-foreground/70 mb-6 md:mb-12 max-w-2xl leading-relaxed"
                  style={{ animationDelay: "500ms" }}
                >
                  Give your AI agent a mobile money wallet in 3 lines of code. MTN MoMo, Vodafone Cash, bank transfers, and USDC — one API.
                </p>

                {/* CTA */}
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Link
                    to="/signup"
                    className="animate-blur-fade-up flex items-center gap-2 bg-primary text-primary-foreground rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-primary/80 transition-colors text-sm sm:text-base"
                    style={{ animationDelay: "600ms" }}
                  >
                    <Play size={16} className="fill-primary-foreground" />
                    Get Started
                  </Link>
                  <Link
                    to="/docs"
                    className="animate-blur-fade-up flex items-center gap-2 rounded-full font-medium liquid-glass px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                    style={{ animationDelay: "700ms" }}
                  >
                    View Docs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Integration Section */}
      <SectionDivider />
      <CodeIntegrationSection />
      <SectionDivider />
      <ProblemSection />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <MoatSection />
      <SectionDivider />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
