import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasValidAdminSession } from "@/lib/auth";
import { sanitizeMessage } from "@/lib/sanitize";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await hasValidAdminSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { message, messageType = "TEXT", metadata } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(id) },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const newMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "SELLER",
        messageType,
        body: sanitizeMessage(message),
        metadata: metadata ?? undefined,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadByUser: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      messageId: newMessage.id,
    });
  } catch (error) {
    console.error("Error sending admin reply:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
