import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setBuyerSession } from "@/lib/buyer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[LOGIN] Attempt for email:', email);

    if (!email || !password) {
      console.log('[LOGIN] Missing credentials');
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find buyer
    const buyer = await prisma.buyer.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log('[LOGIN] Buyer found:', !!buyer, buyer ? `ID: ${buyer.id}` : 'Not found');

    if (!buyer) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await compare(password, buyer.passwordHash);
    console.log('[LOGIN] Password valid:', valid);
    
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Set session
    console.log('[LOGIN] Setting session for buyer:', buyer.id);
    await setBuyerSession(buyer.id);
    console.log('[LOGIN] Session set successfully');

    return NextResponse.json({
      success: true,
      buyer: {
        id: buyer.id,
        email: buyer.email,
        name: buyer.name,
      },
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}
