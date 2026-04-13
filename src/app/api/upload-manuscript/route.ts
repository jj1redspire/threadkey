import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function splitIntoChapters(text: string): Array<{ chapter: number; content: string }> {
  const chapterRegex = /(?:^|\n)\s*(?:chapter|ch\.?)\s*(?:\d+|[ivxlcdm]+)[^\n]*/gi;
  const splits = text.split(chapterRegex);
  const matches = Array.from(text.matchAll(chapterRegex));

  if (splits.length <= 1 || matches.length === 0) {
    return [{ chapter: 1, content: text.trim() }];
  }

  return matches.map((_, i) => ({
    chapter: i + 1,
    content: (splits[i + 1] || "").trim(),
  })).filter((c) => c.content.length > 100);
}

function chunkText(text: string, wordsPerChunk = 700, overlapWords = 100): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + wordsPerChunk, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end >= words.length) break;
    start = end - overlapWords;
  }

  return chunks;
}

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

async function extractEntities(
  chapterContent: string,
  chapterNumber: number,
  bookNumber: number,
  seriesName: string,
  genre: string
) {
  const prompt = `You are ThreadKey, an AI that reads fiction manuscripts and extracts story elements.
Read this chapter and extract:
- CHARACTERS: name, physical descriptions (array of strings), personality traits (array), relationships (array of {character, relationship} objects), key events (array of strings)
- LOCATIONS: name, description, significance
- TIMELINE EVENTS: event description, who_involved (array), when_occurred, consequences
- WORLD RULES: category (e.g. "Magic System", "Political Structure", "Cultural Norms"), rule_description, details

Context: Book ${bookNumber}, Chapter ${chapterNumber} of "${seriesName}" (${genre}).

CHAPTER TEXT:
${chapterContent.substring(0, 6000)}

Return ONLY valid JSON with this exact structure:
{
  "characters": [{"name": "", "physical_description": [], "personality_traits": [], "relationships": [], "key_events": []}],
  "locations": [{"name": "", "description": "", "significance": ""}],
  "timeline_events": [{"event": "", "who_involved": [], "when_occurred": "", "consequences": ""}],
  "world_rules": [{"category": "", "rule_description": "", "details": ""}]
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bookTitle = formData.get("book_title") as string;
    const bookNumber = parseInt(formData.get("book_number") as string) || 1;
    const seriesId = formData.get("series_id") as string;

    if (!file || !bookTitle || !seriesId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: series } = await supabase
      .from("tk_series")
      .select("*")
      .eq("id", seriesId)
      .eq("user_id", session.user.id)
      .single();

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    let text = "";
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".txt")) {
      text = fileBuffer.toString("utf-8");
    } else if (fileName.endsWith(".pdf")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse: any = await import("pdf-parse");
      const result = await (pdfParse.default || pdfParse)(fileBuffer);
      text = result.text;
    } else if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const storagePath = `${session.user.id}/${seriesId}/${Date.now()}_${file.name}`;

    // Attempt storage upload (ignore error if bucket not configured)
    await admin.storage
      .from("manuscripts")
      .upload(storagePath, fileBuffer, { contentType: file.type, upsert: false })
      .catch(() => null);

    const { data: book, error: bookError } = await admin
      .from("tk_books")
      .insert({
        series_id: seriesId,
        title: bookTitle,
        book_number: bookNumber,
        file_url: storagePath,
        processing_status: "processing",
      })
      .select()
      .single();

    if (bookError || !book) {
      throw new Error(bookError?.message || "Failed to create book record");
    }

    // Process in background (fire and forget)
    processManuscript(
      book.id,
      seriesId,
      text,
      bookNumber,
      series.name,
      series.genre || "fiction",
      admin
    ).catch(async (err) => {
      console.error("Processing error:", err);
      await admin
        .from("tk_books")
        .update({ processing_status: "error" })
        .eq("id", book.id);
    });

    return NextResponse.json({ bookId: book.id, status: "processing" });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}

async function processManuscript(
  bookId: string,
  seriesId: string,
  text: string,
  bookNumber: number,
  seriesName: string,
  genre: string,
  admin: ReturnType<typeof getSupabaseAdmin>
) {
  const chapters = splitIntoChapters(text);

  await admin
    .from("tk_books")
    .update({ chapter_count: chapters.length })
    .eq("id", bookId);

  const allChunks: Array<{ content: string; chapter: number; index: number }> = [];
  for (const ch of chapters) {
    const chunks = chunkText(ch.content);
    chunks.forEach((chunk, idx) => {
      allChunks.push({ content: chunk, chapter: ch.chapter, index: idx });
    });
  }

  const batchSize = 20;
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const embeddings = await generateEmbeddings(batch.map((c) => c.content));

    const inserts = batch.map((chunk, j) => ({
      book_id: bookId,
      series_id: seriesId,
      content: chunk.content,
      embedding: JSON.stringify(embeddings[j]),
      book_number: bookNumber,
      chapter_number: chunk.chapter,
      chunk_index: chunk.index,
    }));

    await admin.from("tk_chunks").insert(inserts);
  }

  const chaptersToProcess = chapters.slice(0, 10);
  const sourceRef = { book_number: bookNumber, chapter_number: 0 };

  for (const ch of chaptersToProcess) {
    sourceRef.chapter_number = ch.chapter;
    const entities = await extractEntities(ch.content, ch.chapter, bookNumber, seriesName, genre);
    if (!entities) continue;

    for (const char of entities.characters || []) {
      if (!char.name?.trim()) continue;
      const existing = await admin
        .from("tk_characters")
        .select("*")
        .eq("series_id", seriesId)
        .ilike("name", char.name.trim())
        .single();

      if (existing.data) {
        await admin.from("tk_characters").update({
          physical_description: [...(existing.data.physical_description || []), ...(char.physical_description || [])].slice(0, 20),
          personality_traits: Array.from(new Set([...(existing.data.personality_traits || []), ...(char.personality_traits || [])])).slice(0, 15),
          relationships: [...(existing.data.relationships || []), ...(char.relationships || [])].slice(0, 20),
          key_events: [...(existing.data.key_events || []), ...(char.key_events || [])].slice(0, 30),
          source_refs: [...(existing.data.source_refs || []), { ...sourceRef }],
          updated_at: new Date().toISOString(),
        }).eq("id", existing.data.id);
      } else {
        await admin.from("tk_characters").insert({
          series_id: seriesId,
          name: char.name.trim(),
          physical_description: char.physical_description || [],
          personality_traits: char.personality_traits || [],
          relationships: char.relationships || [],
          key_events: char.key_events || [],
          first_appearance: `Book ${bookNumber}, Chapter ${ch.chapter}`,
          source_refs: [{ ...sourceRef }],
        });
      }
    }

    for (const loc of entities.locations || []) {
      if (!loc.name?.trim()) continue;
      const existing = await admin
        .from("tk_locations")
        .select("*")
        .eq("series_id", seriesId)
        .ilike("name", loc.name.trim())
        .single();

      if (!existing.data) {
        await admin.from("tk_locations").insert({
          series_id: seriesId,
          name: loc.name.trim(),
          description: loc.description || null,
          significance: loc.significance || null,
          source_refs: [{ ...sourceRef }],
        });
      }
    }

    for (const ev of entities.timeline_events || []) {
      if (!ev.event?.trim()) continue;
      await admin.from("tk_timeline_events").insert({
        series_id: seriesId,
        event: ev.event.trim(),
        who_involved: ev.who_involved || [],
        when_occurred: ev.when_occurred || null,
        consequences: ev.consequences || null,
        source_refs: [{ ...sourceRef }],
        event_order: ch.chapter,
      });
    }

    for (const rule of entities.world_rules || []) {
      if (!rule.rule_description?.trim()) continue;
      await admin.from("tk_world_rules").insert({
        series_id: seriesId,
        category: rule.category || "General",
        rule_description: rule.rule_description.trim(),
        details: rule.details || null,
        source_refs: [{ ...sourceRef }],
      });
    }
  }

  await admin
    .from("tk_books")
    .update({ processing_status: "complete" })
    .eq("id", bookId);
}
