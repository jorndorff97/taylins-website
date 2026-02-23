import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth-config";
import { sanitizeMessage } from "@/lib/sanitize";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to send a message" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = body;

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

    if (conversation.userId !== userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const newMessage = await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: "BUYER",
        messageType: "TEXT",
        body: sanitizeMessage(message),
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        unreadByAdmin: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      messageId: newMessage.id,
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
