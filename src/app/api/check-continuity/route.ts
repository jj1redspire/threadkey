import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { ContinuityFlag } from "@/types";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Claim {
  claim: string;
  category: string;
  character?: string;
  detail?: string;
  value?: string;
}

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chapter_text, series_id } = await req.json();
    if (!chapter_text?.trim() || !series_id) {
      return NextResponse.json({ error: "chapter_text and series_id required" }, { status: 400 });
    }

    const { data: series } = await supabase
      .from("tk_series")
      .select("id")
      .eq("id", series_id)
      .eq("user_id", session.user.id)
      .single();

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Step 1: Extract claims from the chapter
    const claimsMessage = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Extract every specific factual claim from this fiction chapter that could be verified or contradicted by earlier books in the series.

Focus on:
- Character physical descriptions (eye color, hair, height, scars, missing limbs, etc.)
- Character names and spellings
- Character status (alive/dead, relationships, allegiances)
- Location names and descriptions
- Timeline references ("three years ago", "since the battle", dates)
- World rules (magic limitations, political structures, cultural facts)
- Object/artifact properties

CHAPTER TEXT:
${chapter_text.substring(0, 5000)}

Return ONLY a JSON array of claims, max 15 most important:
[{"claim": "exact quote or paraphrase", "category": "physical_description|character_status|location|timeline|world_rule|relationship", "character": "character name if applicable", "value": "the specific claimed value"}]`,
        },
      ],
    });

    const claimsText =
      claimsMessage.content[0].type === "text" ? claimsMessage.content[0].text : "[]";
    const claimsMatch = claimsText.match(/\[[\s\S]*\]/);
    let claims: Claim[] = [];
    try {
      claims = claimsMatch ? JSON.parse(claimsMatch[0]) : [];
    } catch {
      claims = [];
    }

    if (claims.length === 0) {
      return NextResponse.json({
        flags: [],
        confirmed_count: 0,
        contradiction_count: 0,
      });
    }

    // Step 2: Verify each claim in parallel
    const verificationPromises = claims.slice(0, 12).map(async (claim): Promise<ContinuityFlag> => {
      try {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: claim.claim,
        });
        const embedding = embeddingResponse.data[0].embedding;

        const { data: chunks } = await supabase.rpc("match_chunks", {
          query_embedding: embedding,
          match_series_id: series_id,
          match_count: 3,
        });

        if (!chunks || chunks.length === 0) {
          return {
            claim: claim.claim,
            category: claim.category,
            character: claim.character,
            status: "no_data",
            explanation: "No prior text found to verify this claim.",
          };
        }

        const chunkContext = chunks
          .map((c: { content: string; book_number: number; chapter_number: number }) =>
            `[Book ${c.book_number}, Ch. ${c.chapter_number}]: ${c.content}`
          )
          .join("\n\n");

        const verifyMessage = await anthropic.messages.create({
          model: "claude-haiku-4-5",
          max_tokens: 600,
          messages: [
            {
              role: "user",
              content: `CLAIM FROM NEW CHAPTER: "${claim.claim}"

EXISTING MANUSCRIPT TEXT:
${chunkContext}

Does the existing text contradict, confirm, or have no relevant data about this claim?

Return ONLY valid JSON:
{"status": "contradiction|confirmed|no_data", "explanation": "brief explanation", "source": "Book X, Ch. Y format", "existing_value": "what was previously established if different"}`,
            },
          ],
        });

        const verifyText =
          verifyMessage.content[0].type === "text" ? verifyMessage.content[0].text : "";
        const jsonMatch = verifyText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return {
            claim: claim.claim,
            category: claim.category,
            status: "no_data",
            explanation: "Could not verify claim.",
          };
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
          claim: claim.claim,
          category: claim.category,
          character: claim.character,
          status: result.status || "no_data",
          explanation: result.explanation || "",
          source: result.source || "",
          existing_value: result.existing_value || undefined,
        };
      } catch {
        return {
          claim: claim.claim,
          category: claim.category,
          status: "no_data",
          explanation: "Error verifying claim.",
        };
      }
    });

    const flags = await Promise.all(verificationPromises);
    const confirmed_count = flags.filter((f) => f.status === "confirmed").length;
    const contradiction_count = flags.filter((f) => f.status === "contradiction").length;

    await supabase.from("tk_continuity_checks").insert({
      series_id,
      input_text: chapter_text.substring(0, 2000),
      flags,
      confirmed_count,
      contradiction_count,
    });

    return NextResponse.json({ flags, confirmed_count, contradiction_count });
  } catch (err: unknown) {
    console.error("Continuity check error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Check failed" },
      { status: 500 }
    );
  }
}
