"use client";

import { useState } from "react";
import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import {
  BookOpen,
  Search,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Wand2,
  Upload,
  FileText,
} from "lucide-react";

const faqs = [
  {
    q: "What file formats can I upload?",
    a: "ThreadKey accepts PDF, DOCX (Microsoft Word), and plain text files. You can upload your manuscript in whatever format you write in — no conversion needed.",
  },
  {
    q: "How long does processing take?",
    a: "A typical 80,000-word novel takes about 2–4 minutes to fully process. ThreadKey reads every chapter, extracts all characters and locations, and builds the timeline in the background while you continue writing.",
  },
  {
    q: "Will it work for series that are already written?",
    a: "Absolutely. Upload all your existing books at once. ThreadKey processes them in order and builds a unified bible across your entire series. It's especially powerful for catching inconsistencies that slipped through across multiple books.",
  },
  {
    q: "What genres does ThreadKey support?",
    a: "Any fiction genre with complex world-building or recurring characters. Fantasy, romance, sci-fi, mystery/thriller, historical fiction, and contemporary series all benefit. It's especially powerful for fantasy and sci-fi with complex magic systems or political structures.",
  },
  {
    q: "How accurate is the continuity checker?",
    a: "ThreadKey uses your actual manuscript text as its source of truth. It cross-references every factual claim against what you've already written. Like any AI tool, it occasionally misses subtle implications — but it catches the kinds of errors (eye color changes, dead characters reappearing, timeline contradictions) that are hardest to catch manually.",
  },
  {
    q: "Can I export my series bible?",
    a: "Yes. You can export a formatted PDF of your complete series bible at any time — organized by characters, locations, timeline, and world rules. Useful for sending to editors, co-authors, or just keeping an offline backup.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E2D9CC] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-[#F5F0E8] transition-colors"
      >
        <span className="font-medium text-ink-blue pr-4">{q}</span>
        {open ? (
          <ChevronUp size={18} className="text-amber flex-shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-amber flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 py-4 bg-parchment border-t border-[#E2D9CC]">
          <p className="text-ink-muted leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment font-sans">
      <LandingNav />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* subtle texture */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #1E3A5F08 0%, transparent 50%), radial-gradient(circle at 80% 20%, #B4530908 0%, transparent 40%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-pale rounded-full text-sm text-amber font-medium mb-6 border border-amber/20">
            <Wand2 size={14} />
            AI-powered series continuity for fiction authors
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-ink-blue mb-6 leading-tight text-balance">
            Never Lose Track of
            <br />
            <span className="text-amber">Your Story</span> Again
          </h1>
          <p className="text-xl text-ink-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            ThreadKey reads your manuscripts and automatically builds a living series bible —
            tracking every character, location, timeline event, and world-building rule across
            your entire series. Catch continuity errors before your readers do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?tab=signup"
              className="inline-flex items-center gap-2 bg-amber text-white font-semibold px-8 py-4 rounded-lg hover:bg-amber-light transition-colors shadow-card text-lg"
            >
              Start Free 14-Day Trial
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-ink-blue font-medium px-6 py-4 rounded-lg border border-[#E2D9CC] hover:border-ink-blue/30 bg-white transition-colors"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-ink-muted mt-4">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ─── THE PROBLEM ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-dashboard mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-ink-blue mb-4">
              Series Writing Is a Memory Problem
            </h2>
            <p className="text-lg text-ink-muted max-w-2xl mx-auto">
              Every author who has written more than one book knows this pain.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <AlertTriangle size={28} className="text-red-500" />,
                title: "Continuity Contradictions",
                desc: "Your protagonist's eyes were green in book one. Now they're blue. A reader noticed on page 1 of book 4.",
              },
              {
                icon: <Search size={28} className="text-amber" />,
                title: "The Great Manuscript Search",
                desc: "You spend 45 minutes ctrl+F searching three books to remember what your antagonist's castle looks like.",
              },
              {
                icon: <FileText size={28} className="text-ink-blue" />,
                title: "The Broken Bible",
                desc: "You started a spreadsheet for characters. You abandoned it in book two. Now you have a 400-page PDF you never open.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-parchment border border-[#E2D9CC] rounded-xl p-6 shadow-soft"
              >
                <div className="mb-4">{card.icon}</div>
                <h3 className="font-serif text-xl font-bold text-ink-blue mb-3">{card.title}</h3>
                <p className="text-ink-muted leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 bg-parchment">
        <div className="max-w-dashboard mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-ink-blue mb-4">How ThreadKey Works</h2>
            <p className="text-lg text-ink-muted max-w-xl mx-auto">
              Upload your manuscripts. ThreadKey does the rest.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Upload size={24} className="text-white" />,
                title: "Upload Your Books",
                desc: "Drop in your manuscripts — PDF, DOCX, or TXT. ThreadKey reads every chapter and extracts every named entity using AI.",
              },
              {
                step: "02",
                icon: <Wand2 size={24} className="text-white" />,
                title: "AI Builds Your Bible",
                desc: "Characters, locations, timeline events, and world rules are automatically organized into a searchable, structured series bible.",
              },
              {
                step: "03",
                icon: <CheckCircle size={24} className="text-white" />,
                title: "Write with Confidence",
                desc: "Query your bible in plain English, check new chapters for continuity errors, and export a formatted bible PDF for editors.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-start">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-ink-blue flex items-center justify-center shadow-card">
                    {item.icon}
                  </div>
                  <span className="font-serif text-5xl font-bold text-[#E2D9CC]">{item.step}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-ink-blue mb-3">{item.title}</h3>
                <p className="text-ink-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERIES BIBLE PREVIEW ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-dashboard mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-ink-blue/10 rounded-full text-sm text-ink-blue font-medium mb-4">
                <BookOpen size={14} />
                Series Bible
              </div>
              <h2 className="font-serif text-4xl font-bold text-ink-blue mb-5">
                Every Character.
                <br />Every Detail. Organized.
              </h2>
              <p className="text-ink-muted leading-relaxed mb-6">
                ThreadKey builds structured profiles for every character in your series —
                including physical descriptions, personality traits, relationships, key events,
                and citations back to the exact chapter where each detail was established.
              </p>
              <ul className="space-y-3">
                {[
                  "Physical descriptions with source citations",
                  "Relationship maps across all books",
                  "First appearance and key event timeline",
                  "Search across your entire series instantly",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-ink-muted">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mock UI */}
            <div className="bg-parchment rounded-xl border border-[#E2D9CC] shadow-card overflow-hidden">
              <div className="bg-ink-blue px-5 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-white/70 text-sm font-sans">Series Bible — The Ashwood Chronicles</span>
              </div>
              {/* Tabs */}
              <div className="flex border-b border-[#E2D9CC] bg-white">
                {["Characters", "Locations", "Timeline", "World Rules"].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 ${
                      i === 0
                        ? "border-amber text-amber"
                        : "border-transparent text-ink-muted hover:text-ink-blue"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Character card */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E2D9CC] cursor-pointer hover:border-ink-blue/30">
                  <div className="w-10 h-10 rounded-full bg-ink-blue/10 flex items-center justify-center font-serif font-bold text-ink-blue">
                    E
                  </div>
                  <div>
                    <div className="font-medium text-ink-blue text-sm">Elara Voss</div>
                    <div className="text-xs text-ink-muted">Protagonist · First appears Book 1, Ch. 1</div>
                  </div>
                </div>
                {/* Expanded character */}
                <div className="bg-white rounded-lg border border-ink-blue/20 p-4 text-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center font-serif font-bold text-amber text-xs">
                      K
                    </div>
                    <div>
                      <div className="font-medium text-ink-blue">Kael Morden</div>
                      <div className="text-xs text-ink-muted">Antagonist</div>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">Physical</div>
                      <p className="text-ink-blue text-xs leading-relaxed">
                        Tall, angular features, dark hair with silver streaks at the temples.
                        Scar along left jaw from the Battle of Varenhold.
                      </p>
                      <span className="source-badge mt-1">Book 2, Ch. 7</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1">Personality</div>
                      <div className="flex flex-wrap gap-1">
                        {["Calculating", "Charismatic", "Ruthless", "Loyal to family"].map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-parchment rounded text-xs text-ink-blue border border-[#E2D9CC]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTINUITY CHECKER PREVIEW ──────────────────────────────── */}
      <section className="py-20 px-6 bg-parchment">
        <div className="max-w-dashboard mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Mock UI */}
            <div className="bg-white rounded-xl border border-[#E2D9CC] shadow-card overflow-hidden order-2 lg:order-1">
              <div className="px-5 py-3 border-b border-[#E2D9CC]">
                <h3 className="font-sans text-sm font-medium text-ink-blue">Continuity Check Results</h3>
                <p className="text-xs text-ink-muted mt-0.5">Book 4, Chapter 12 — cross-referenced against 3 books</p>
              </div>
              {/* Summary bar */}
              <div className="flex items-center gap-4 px-5 py-3 bg-parchment border-b border-[#E2D9CC]">
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-medium text-red-700">2 contradictions</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-2 h-2 rounded-full bg-amber" />
                  <span className="font-medium text-amber">1 possible issue</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium text-green-700">9 confirmed</span>
                </div>
              </div>
              {/* Flag cards */}
              <div className="p-4 space-y-3">
                <div className="border-l-4 border-l-red-500 bg-red-50 rounded-r-lg p-4 pulse-contradiction">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-red-800 mb-1">Contradiction</div>
                      <p className="text-xs text-red-700 leading-relaxed">
                        &ldquo;Kael&apos;s silver ring...&rdquo; — Kael lost his ring finger in Book 2, Ch. 14 during the siege of Merrath.
                      </p>
                      <span className="source-badge mt-2">Book 2, Ch. 14</span>
                    </div>
                  </div>
                </div>
                <div className="border-l-4 border-l-amber bg-amber-pale rounded-r-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-amber mb-1">Possible Issue</div>
                      <p className="text-xs text-amber/90 leading-relaxed">
                        &ldquo;The east gate of Varenhold...&rdquo; — Varenhold&apos;s east gate was described as sealed permanently in Book 1, Ch. 8. Verify if intentional plot point.
                      </p>
                      <span className="source-badge mt-2">Book 1, Ch. 8</span>
                    </div>
                  </div>
                </div>
                <div className="border-l-4 border-l-green-500 bg-green-50 rounded-r-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-green-800 mb-1">Confirmed Consistent</div>
                      <p className="text-xs text-green-700 leading-relaxed">
                        Elara&apos;s ability to read Old Script — first established Book 1, Ch. 3. Consistent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber/10 rounded-full text-sm text-amber font-medium mb-4">
                <AlertTriangle size={14} />
                Continuity Checker
              </div>
              <h2 className="font-serif text-4xl font-bold text-ink-blue mb-5">
                Catch Errors Before
                <br />Your Readers Do
              </h2>
              <p className="text-ink-muted leading-relaxed mb-6">
                Paste a new chapter and ThreadKey cross-references every factual claim against
                your previous books. It finds contradictions, flags possible issues, and
                confirms what&apos;s consistent — in seconds.
              </p>
              <ul className="space-y-3">
                {[
                  "Checks physical descriptions against prior books",
                  "Flags dead characters who reappear",
                  "Catches location and timeline contradictions",
                  "Dismissible flags for intentional plot twists",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-ink-muted">
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-dashboard mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-ink-blue mb-4">Built for Series Authors</h2>
            <p className="text-lg text-ink-muted max-w-xl mx-auto">
              Whatever genre you write, if your story spans multiple books, ThreadKey was made for you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                genre: "Fantasy & Sci-Fi",
                icon: "✦",
                desc: "Track magic systems, alien cultures, political factions, invented languages, and complex world-building rules.",
              },
              {
                genre: "Romance Series",
                icon: "♡",
                desc: "Keep relationship timelines straight, track recurring characters across books, and maintain character voice consistency.",
              },
              {
                genre: "Mystery & Thriller",
                icon: "◈",
                desc: "Maintain clue trails, track detective methodology, and ensure your series antagonist&apos;s backstory stays consistent.",
              },
              {
                genre: "Historical Fiction",
                icon: "◎",
                desc: "Juggle real historical events alongside fictional characters across decades or centuries of your saga.",
              },
            ].map((card) => (
              <div
                key={card.genre}
                className="bg-parchment border border-[#E2D9CC] rounded-xl p-6 shadow-soft hover:shadow-card transition-shadow"
              >
                <div className="text-3xl mb-4 text-amber">{card.icon}</div>
                <h3 className="font-serif text-lg font-bold text-ink-blue mb-3">{card.genre}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-6 bg-parchment">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-serif text-4xl font-bold text-ink-blue mb-4">Simple Pricing</h2>
          <p className="text-lg text-ink-muted mb-12">One plan. Everything included. No surprises.</p>

          <div className="bg-white border-2 border-ink-blue rounded-xl shadow-card overflow-hidden">
            {/* Pricing header */}
            <div className="bg-ink-blue px-8 py-8 text-center">
              <div className="text-sm text-blue-300 font-medium uppercase tracking-widest mb-2">ThreadKey Pro</div>
              <div className="flex items-start justify-center gap-1">
                <span className="text-white text-2xl mt-2">$</span>
                <span className="text-white text-7xl font-bold font-serif leading-none">29</span>
                <span className="text-blue-300 mt-4">/mo</span>
              </div>
              <p className="text-blue-300 text-sm mt-2">14-day free trial · cancel anytime</p>
            </div>
            {/* Features */}
            <div className="px-8 py-8">
              <ul className="space-y-4 text-left mb-8">
                {[
                  "Unlimited series and book uploads",
                  "AI-powered series bible generation",
                  "Character, location, timeline, world rules tracking",
                  "Natural language query across all manuscripts",
                  "Continuity checker for new chapters",
                  "PDF export of complete series bible",
                  "Supports PDF, DOCX, and TXT files",
                  "Secure cloud storage for manuscripts",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle size={17} className="text-green-600 flex-shrink-0" />
                    <span className="text-ink-muted">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login?tab=signup"
                className="block w-full text-center bg-amber text-white font-semibold px-8 py-4 rounded-lg hover:bg-amber-light transition-colors shadow-sm text-lg"
              >
                Start Your Free Trial
              </Link>
              <p className="text-xs text-ink-muted text-center mt-3">
                No credit card required for trial. $29/month after 14 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-6 bg-white">
        <div className="max-w-reading mx-auto">
          <h2 className="font-serif text-4xl font-bold text-ink-blue text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-ink-blue text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Your Story Deserves a
            <span className="text-amber"> Keeper</span>
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Upload your first book free. See your series bible appear in minutes.
            Join authors who write with confidence instead of chaos.
          </p>
          <Link
            href="/login?tab=signup"
            className="inline-flex items-center gap-2 bg-amber text-white font-semibold px-10 py-4 rounded-lg hover:bg-amber-light transition-colors shadow-card text-lg"
          >
            Start Free Trial — No Card Required
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="bg-navy py-12 px-6">
        <div className="max-w-dashboard mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-1 mb-3">
                <span className="font-serif text-xl font-bold text-white">Thread</span>
                <span className="font-serif text-xl font-bold text-amber">Key</span>
              </div>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                AI-powered series management for fiction authors. Never lose track of your story.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Account</h4>
                <ul className="space-y-2">
                  <li><Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
                  <li><Link href="/login?tab=signup" className="text-sm text-slate-400 hover:text-white transition-colors">Start Free Trial</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} ThreadKey. Built for the authors who keep writing.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
