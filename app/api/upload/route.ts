import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { hasValidAdminSession, getAdminSession } from "@/lib/auth";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logSecurityEvent, getClientInfo } from "@/lib/audit-log";

export async function POST(request: NextRequest) {
  const rateLimited = applyRateLimit(request, "upload", RATE_LIMITS.upload);
  if (rateLimited) return rateLimited;

  if (!(await hasValidAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, ".");

    const blob = await put(sanitizedName, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const { ip, userAgent } = getClientInfo(request);
    const adminId = await getAdminSession();
    await logSecurityEvent({
      event: "FILE_UPLOADED",
      ip,
      userAgent,
      adminUserId: adminId,
      metadata: { fileName: sanitizedName, fileSize: file.size, url: blob.url },
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
