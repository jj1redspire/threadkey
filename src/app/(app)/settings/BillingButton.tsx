"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";

export default function BillingButton() {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManageBilling}
      disabled={loading}
      className="flex items-center gap-2 bg-ink-blue text-white font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-ink-blue-light transition-colors disabled:opacity-60"
    >
      <ExternalLink size={15} />
      {loading ? "Loading..." : "Manage Billing"}
    </button>
  );
}
