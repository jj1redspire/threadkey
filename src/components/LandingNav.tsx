"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-parchment/95 backdrop-blur-sm shadow-soft border-b border-[#E2D9CC]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-dashboard mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="font-serif text-xl font-bold text-ink-blue">Thread</span>
          <span className="font-serif text-xl font-bold text-amber">Key</span>
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-ink-muted hover:text-ink-blue transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm font-medium text-ink-muted hover:text-ink-blue transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm font-medium text-ink-muted hover:text-ink-blue transition-colors">
            FAQ
          </a>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-blue hover:text-ink-blue-light transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/login?tab=signup"
            className="text-sm font-semibold bg-amber text-white px-5 py-2.5 rounded-lg hover:bg-amber-light transition-colors shadow-sm"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}
