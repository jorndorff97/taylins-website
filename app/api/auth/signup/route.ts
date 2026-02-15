import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setBuyerSession } from "@/lib/buyer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if buyer already exists
    const existing = await prisma.buyer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password and create buyer
    const passwordHash = await hash(password, 10);
    const buyer = await prisma.buyer.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || null,
        phone: phone || null,
      },
    });

    // Set session
    await setBuyerSession(buyer.id);

    return NextResponse.json({
      success: true,
      buyer: {
        id: buyer.id,
        email: buyer.email,
        name: buyer.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
