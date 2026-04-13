"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users, MapPin, Clock, Scroll, Search, Upload, ChevronRight,
  X, ArrowLeft, FileDown
} from "lucide-react";
import type { Character, Location, TimelineEvent, WorldRule } from "@/types";

type Tab = "characters" | "locations" | "timeline" | "world_rules";

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E2D9CC] rounded-xl p-5 shadow-soft">
      <div className="skeleton h-5 w-1/2 mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  );
}

function SourceBadge({ ref: r }: { ref: { book_number: number; chapter_number: number } }) {
  return (
    <span className="source-badge">
      Book {r.book_number}, Ch. {r.chapter_number}
    </span>
  );
}

function CharacterPanel({
  character,
  onClose,
}: {
  character: Character;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-[#E2D9CC] shadow-hover z-40 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-[#E2D9CC] px-6 py-4 flex items-center justify-between">
        <h3 className="font-serif text-xl font-bold text-ink-blue">{character.name}</h3>
        <button
          onClick={onClose}
          className="text-ink-muted hover:text-ink-blue transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-6">
        {/* First appearance */}
        {character.first_appearance && (
          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">First Appearance</h4>
            <p className="text-ink-blue text-sm">{character.first_appearance}</p>
          </div>
        )}

        {/* Physical description */}
        {character.physical_description?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Physical Description</h4>
            <ul className="space-y-2">
              {character.physical_description.map((desc, i) => (
                <li key={i} className="text-sm text-ink-blue bg-parchment rounded-lg px-3 py-2 border border-[#E2D9CC]">
                  {desc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Personality traits */}
        {character.personality_traits?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Personality</h4>
            <div className="flex flex-wrap gap-2">
              {character.personality_traits.map((trait, i) => (
                <span key={i} className="px-2.5 py-1 bg-ink-blue/10 text-ink-blue text-xs font-medium rounded-full">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        {character.relationships?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Relationships</h4>
            <ul className="space-y-2">
              {character.relationships.map((rel, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-ink-blue">{typeof rel === 'string' ? rel : rel.character}</span>
                  {typeof rel !== 'string' && rel.relationship && (
                    <>
                      <ChevronRight size={12} className="text-ink-muted" />
                      <span className="text-ink-muted">{rel.relationship}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key events */}
        {character.key_events?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Key Events</h4>
            <ul className="space-y-2">
              {character.key_events.map((ev, i) => (
                <li key={i} className="text-sm text-ink-muted bg-parchment rounded-lg px-3 py-2 border border-[#E2D9CC]">
                  {ev}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source refs */}
        {character.source_refs?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Sources</h4>
            <div className="flex flex-wrap gap-2">
              {character.source_refs.map((ref, i) => (
                <SourceBadge key={i} ref={ref} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BiblePage() {
  const params = useParams();
  const seriesId = params.series_id as string;

  const [activeTab, setActiveTab] = useState<Tab>("characters");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [worldRules, setWorldRules] = useState<WorldRule[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const urls: Record<Tab, string> = {
      characters: `/api/bible/${seriesId}/characters`,
      locations: `/api/bible/${seriesId}/locations`,
      timeline: `/api/bible/${seriesId}/timeline`,
      world_rules: `/api/bible/${seriesId}/world-rules`,
    };

    fetch(urls[activeTab])
      .then((r) => r.json())
      .then((data) => {
        if (activeTab === "characters") setCharacters(data);
        else if (activeTab === "locations") setLocations(data);
        else if (activeTab === "timeline") setTimeline(data);
        else if (activeTab === "world_rules") setWorldRules(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab, seriesId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export-bible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ series_id: seriesId }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "series-bible.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const tabs = [
    { key: "characters" as Tab, label: "Characters", icon: <Users size={16} />, count: characters.length },
    { key: "locations" as Tab, label: "Locations", icon: <MapPin size={16} />, count: locations.length },
    { key: "timeline" as Tab, label: "Timeline", icon: <Clock size={16} />, count: timeline.length },
    { key: "world_rules" as Tab, label: "World Rules", icon: <Scroll size={16} />, count: worldRules.length },
  ];

  const filteredChars = characters.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredLocs = locations.filter(
    (l) => !search || l.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group world rules by category
  const rulesByCategory = worldRules.reduce<Record<string, WorldRule[]>>((acc, rule) => {
    const cat = rule.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rule);
    return acc;
  }, {});

  const isEmpty =
    (activeTab === "characters" && !loading && characters.length === 0) ||
    (activeTab === "locations" && !loading && locations.length === 0) ||
    (activeTab === "timeline" && !loading && timeline.length === 0) ||
    (activeTab === "world_rules" && !loading && worldRules.length === 0);

  return (
    <div className="max-w-dashboard mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href={`/series/${seriesId}`}
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-blue transition-colors mb-3"
          >
            <ArrowLeft size={16} />
            Back to Series
          </Link>
          <h1 className="font-serif text-3xl font-bold text-ink-blue">Series Bible</h1>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-white border border-[#E2D9CC] text-ink-blue font-medium px-4 py-2.5 rounded-lg hover:border-ink-blue/40 hover:shadow-soft transition-all text-sm"
        >
          <FileDown size={16} />
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E2D9CC] mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "border-amber text-amber"
                : "border-transparent text-ink-muted hover:text-ink-blue"
            }`}
          >
            {tab.icon}
            {tab.label}
            {!loading && tab.count > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-parchment-dark text-ink-muted text-xs rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search (for characters/locations) */}
      {(activeTab === "characters" || activeTab === "locations") && (
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full max-w-sm pl-9 pr-4 py-2.5 rounded-lg border border-[#E2D9CC] bg-white text-ink-blue placeholder-[#B8AFA3] text-sm focus:outline-none focus:border-ink-blue"
          />
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-[#E2D9CC]">
          <div className="text-5xl mb-4">
            {activeTab === "characters" ? "👥" : activeTab === "locations" ? "🗺️" : activeTab === "timeline" ? "📅" : "📖"}
          </div>
          <h3 className="font-serif text-xl font-bold text-ink-blue mb-2">
            No {activeTab.replace("_", " ")} yet
          </h3>
          <p className="text-ink-muted mb-6 text-sm">
            Upload a manuscript and ThreadKey will extract them automatically.
          </p>
          <Link
            href={`/upload/${seriesId}`}
            className="inline-flex items-center gap-2 bg-amber text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-light transition-colors"
          >
            <Upload size={15} />
            Upload a Book
          </Link>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* CHARACTERS TAB */}
      {activeTab === "characters" && !loading && filteredChars.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChars.map((char) => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char)}
              className="text-left bg-white border border-[#E2D9CC] rounded-xl p-5 shadow-soft hover:shadow-card hover:border-ink-blue/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-ink-blue/10 flex items-center justify-center font-serif font-bold text-ink-blue">
                  {char.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-ink-blue group-hover:text-amber transition-colors">
                    {char.name}
                  </div>
                  {char.first_appearance && (
                    <div className="text-xs text-ink-muted">{char.first_appearance}</div>
                  )}
                </div>
              </div>
              {char.physical_description?.length > 0 && (
                <p className="text-xs text-ink-muted line-clamp-2 mb-3">
                  {char.physical_description[0]}
                </p>
              )}
              <div className="flex flex-wrap gap-1">
                {char.personality_traits?.slice(0, 3).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-parchment text-ink-muted text-xs rounded border border-[#E2D9CC]">
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* LOCATIONS TAB */}
      {activeTab === "locations" && !loading && filteredLocs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLocs.map((loc) => (
            <div key={loc.id} className="bg-white border border-[#E2D9CC] rounded-xl p-5 shadow-soft">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-amber flex-shrink-0" />
                <h3 className="font-medium text-ink-blue">{loc.name}</h3>
              </div>
              {loc.description && (
                <p className="text-sm text-ink-muted mb-3 leading-relaxed">{loc.description}</p>
              )}
              {loc.significance && (
                <div className="bg-amber-pale rounded-lg px-3 py-2 text-xs text-amber mb-3">
                  <span className="font-medium">Significance:</span> {loc.significance}
                </div>
              )}
              {loc.source_refs?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {loc.source_refs.map((ref, i) => (
                    <SourceBadge key={i} ref={ref} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TIMELINE TAB */}
      {activeTab === "timeline" && !loading && timeline.length > 0 && (
        <div className="space-y-4">
          {timeline
            .sort((a, b) => (a.event_order || 0) - (b.event_order || 0))
            .map((ev, idx) => (
              <div key={ev.id} className="flex gap-4">
                {/* Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ink-blue flex items-center justify-center text-white text-xs font-bold">
                  {ev.event_order || idx + 1}
                </div>
                {/* Content */}
                <div className="flex-1 bg-white border border-[#E2D9CC] rounded-xl p-5 shadow-soft">
                  <p className="font-medium text-ink-blue mb-2">{ev.event}</p>
                  {ev.when_occurred && (
                    <p className="text-xs text-ink-muted mb-2">
                      <span className="font-medium">When:</span> {ev.when_occurred}
                    </p>
                  )}
                  {ev.who_involved?.length > 0 && (
                    <p className="text-xs text-ink-muted mb-2">
                      <span className="font-medium">Who:</span>{" "}
                      {Array.isArray(ev.who_involved) ? ev.who_involved.join(", ") : ev.who_involved}
                    </p>
                  )}
                  {ev.consequences && (
                    <p className="text-xs text-ink-muted mb-3">
                      <span className="font-medium">Consequences:</span> {ev.consequences}
                    </p>
                  )}
                  {ev.source_refs?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {ev.source_refs.map((ref, i) => (
                        <SourceBadge key={i} ref={ref} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* WORLD RULES TAB */}
      {activeTab === "world_rules" && !loading && worldRules.length > 0 && (
        <div className="space-y-6">
          {Object.entries(rulesByCategory).map(([category, rules]) => (
            <div key={category}>
              <h3 className="font-serif text-lg font-bold text-ink-blue mb-3 flex items-center gap-2">
                <Scroll size={16} className="text-amber" />
                {category}
              </h3>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div key={rule.id} className="bg-white border border-[#E2D9CC] rounded-xl p-5 shadow-soft">
                    <p className="font-medium text-ink-blue mb-2">{rule.rule_description}</p>
                    {rule.details && (
                      <p className="text-sm text-ink-muted mb-3 leading-relaxed">{rule.details}</p>
                    )}
                    {rule.source_refs?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rule.source_refs.map((ref, i) => (
                          <SourceBadge key={i} ref={ref} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Character detail panel */}
      {selectedCharacter && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30"
            onClick={() => setSelectedCharacter(null)}
          />
          <CharacterPanel
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />
        </>
      )}
    </div>
  );
}
