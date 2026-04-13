import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, series_id } = await req.json();
    if (!question?.trim() || !series_id) {
      return NextResponse.json({ error: "Question and series_id required" }, { status: 400 });
    }

    const { data: series } = await supabase
      .from("tk_series")
      .select("id, name")
      .eq("id", series_id)
      .eq("user_id", session.user.id)
      .single();

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    // Generate embedding for the question
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question.trim(),
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Vector similarity search
    const { data: chunks } = await supabase.rpc("match_chunks", {
      query_embedding: queryEmbedding,
      match_series_id: series_id,
      match_count: 8,
    });

    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find relevant information in your manuscripts to answer this question. Make sure you've uploaded books to this series.",
        sources: [],
      });
    }

    const contextParts = chunks.map(
      (chunk: { content: string; book_number: number; chapter_number: number }, i: number) =>
        `[Excerpt ${i + 1} — Book ${chunk.book_number}, Chapter ${chunk.chapter_number}]\n${chunk.content}`
    );
    const context = contextParts.join("\n\n---\n\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `You are a helpful assistant for fiction authors. You have access to excerpts from "${series.name}".

Using ONLY the following manuscript excerpts, answer the question below. For each piece of information, cite the source as (Book X, Chapter Y). If the answer isn't found in the excerpts, say so clearly — do not make up details.

MANUSCRIPT EXCERPTS:
${context}

QUESTION: ${question}

Answer clearly and helpfully, citing sources for each key fact.`,
        },
      ],
    });

    const answer = message.content[0].type === "text" ? message.content[0].text : "No answer generated";

    const sources = chunks.map((chunk: { content: string; book_number: number; chapter_number: number }) => ({
      book_number: chunk.book_number,
      chapter_number: chunk.chapter_number,
      excerpt: chunk.content.substring(0, 150),
    }));

    return NextResponse.json({ answer, sources });
  } catch (err: unknown) {
    console.error("Query error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 }
    );
  }
}
