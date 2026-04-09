import { useState } from "react";
import CodeIntegrationSection from "@/components/CodeIntegrationSection";
import {
  Search,
  User,
  Menu,
  X,
  Star,
  Clock,
  Calendar,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4";

const NAV_LINKS = [
  "Product",
  "Developers",
  "Pricing",
  "Docs",
  "Blog",
];

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-background">
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_URL}
      />

      {/* Bottom Blur Overlay */}
      <div
        className="fixed inset-0 z-[1] backdrop-blur-xl pointer-events-none"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 45%)",
          maskImage: "linear-gradient(to top, black 0%, transparent 45%)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Navbar */}
        <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6">
          {/* Logo */}
          <div
            className="animate-blur-fade-up text-xl md:text-2xl font-semibold tracking-widest"
            style={{ animationDelay: "0ms" }}
          >
            PAYSMITH
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link}
                href="#"
                className="animate-blur-fade-up text-sm text-foreground/80 hover:text-foreground/60 transition-colors"
                style={{ animationDelay: `${100 + i * 50}ms` }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="animate-blur-fade-up hidden sm:flex items-center gap-2 rounded-full liquid-glass px-4 md:px-6 py-2 text-sm"
              style={{ animationDelay: "350ms" }}
            >
              <Search size={18} />
              Search
            </button>
            <button
              className="animate-blur-fade-up hidden sm:flex items-center justify-center w-10 h-10 rounded-full liquid-glass"
              style={{ animationDelay: "400ms" }}
            >
              <User size={18} />
            </button>
            {/* Hamburger */}
            <button
              className="animate-blur-fade-up flex lg:hidden items-center justify-center w-10 h-10 rounded-full liquid-glass"
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

        {/* Mobile Menu */}
        <div
          className={`absolute left-0 right-0 top-[72px] z-40 lg:hidden transition-all duration-500 ease-out ${
            menuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-[hsl(0,0%,7%)]/95 backdrop-blur-lg border-t border-b border-[hsl(0,0%,20%)] shadow-2xl">
            <div className="flex flex-col px-4 py-2">
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link}
                  href="#"
                  className="py-3 px-3 rounded-lg text-foreground/80 hover:bg-[hsl(0,0%,15%)]/50 transition-all duration-300"
                  style={{
                    transitionDelay: menuOpen ? `${i * 50}ms` : "0ms",
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
            <div className="flex sm:hidden items-center gap-3 px-4 py-4 border-t border-[hsl(0,0%,20%)]">
              <button className="flex items-center gap-2 rounded-full liquid-glass px-4 py-2 text-sm flex-1 justify-center">
                <Search size={18} />
                Search
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full liquid-glass">
                <User size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col justify-end px-4 sm:px-6 md:px-12 pb-8 md:pb-16">
          <div className="flex flex-col md:flex-row items-end gap-8">
            {/* Left */}
            <div className="flex-1">
              {/* Metadata */}
              <div
                className="animate-blur-fade-up flex flex-wrap items-center gap-3 sm:gap-6 mb-6 md:mb-8 text-xs sm:text-sm"
                style={{ animationDelay: "300ms" }}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Star
                    size={16}
                    className="fill-foreground sm:w-5 sm:h-5"
                  />
                  YC W26
                </span>
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
                className="animate-blur-fade-up text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.04em] mb-4 md:mb-6"
                style={{ animationDelay: "400ms" }}
              >
                The Stripe for AI Agents in Africa
              </h1>

              {/* Description */}
              <p
                className="animate-blur-fade-up text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-12 max-w-2xl"
                style={{ animationDelay: "500ms" }}
              >
                Give your AI agent a mobile money wallet in 3 lines of code. MTN MoMo, Vodafone Cash, bank transfers, and USDC — one API.
              </p>

              {/* CTA */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  className="animate-blur-fade-up flex items-center gap-2 bg-primary text-primary-foreground rounded-full font-medium px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-primary/80 transition-colors"
                  style={{ animationDelay: "600ms" }}
                >
                  <Play size={18} className="fill-primary-foreground" />
                  Get Started
                </button>
                <button
                  className="animate-blur-fade-up flex items-center gap-2 rounded-full font-medium liquid-glass px-6 sm:px-8 py-2.5 sm:py-3"
                  style={{ animationDelay: "700ms" }}
                >
                  View Docs
                </button>
              </div>
            </div>

            {/* Right - Nav Arrows */}
            <div className="flex gap-3">
              <button
                className="animate-blur-fade-up rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3"
                style={{ animationDelay: "800ms" }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="animate-blur-fade-up rounded-full liquid-glass px-4 sm:px-6 py-2.5 sm:py-3"
                style={{ animationDelay: "900ms" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Code Integration Section */}
      <CodeIntegrationSection />
    </div>
  );
};

export default Index;
