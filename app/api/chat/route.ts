import { buildChatUserContext } from "@/lib/chat-context";
import { generateChatReply, type ChatMessage } from "@/lib/chat-engine";
import { QUICK_PROMPTS } from "@/lib/chat-knowledge";
import { NextResponse } from "next/server";

function promptKeyForRole(role: string) {
  if (role === "ADMIN") return "admin";
  if (role === "BORROWER") return "borrower";
  if (role === "CLIENT") return "client";
  return "guest";
}

export async function GET() {
  try {
    const ctx = await buildChatUserContext();
    const promptKey = promptKeyForRole(ctx.role);

    return NextResponse.json({
      suggestions: QUICK_PROMPTS[promptKey],
      context: {
        isAuthenticated: ctx.isAuthenticated,
        role: ctx.role,
        name: ctx.name,
      },
    });
  } catch (err) {
    console.error("Chat init error:", err);
    return NextResponse.json({ suggestions: QUICK_PROMPTS.guest }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = (body.messages || []) as ChatMessage[];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const last = messages[messages.length - 1];
    if (last.role !== "user" || !last.content?.trim()) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const ctx = await buildChatUserContext();
    const promptKey = promptKeyForRole(ctx.role);

    if (last.content === "__init__") {
      return NextResponse.json({
        reply: "",
        suggestions: QUICK_PROMPTS[promptKey],
        context: {
          isAuthenticated: ctx.isAuthenticated,
          role: ctx.role,
          name: ctx.name,
        },
      });
    }

    if (last.content.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const filtered = messages.filter((m) => m.content !== "__init__");
    const reply = await generateChatReply(filtered, ctx);

    return NextResponse.json({
      reply,
      suggestions: QUICK_PROMPTS[promptKey],
      context: {
        isAuthenticated: ctx.isAuthenticated,
        role: ctx.role,
        name: ctx.name,
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}
