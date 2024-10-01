import { openai } from "@/lib/utils/openai";
import { NextResponse } from "next/server";
export const runtime = "nodejs";

// Create a new thread
export async function POST(request: Request) {
  const thread = await openai.beta.threads.create();
  return NextResponse.json({ threadId: thread.id });
}
