import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";
import { prisma } from "@/lib/prisma";

function getRpConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const url = new URL(baseUrl);
  return {
    rpID: url.hostname,
    rpName: "Admin Dashboard",
    origin: url.origin,
  };
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return Buffer.from(arr).toString("base64url");
}

function base64UrlToUint8Array(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, "base64url"));
}

export async function getRegistrationOptions(adminUserId: number) {
  const { rpID, rpName } = getRpConfig();

  const admin = await prisma.adminUser.findUniqueOrThrow({
    where: { id: adminUserId },
    select: { email: true },
  });

  const existingPasskeys = await prisma.adminPasskey.findMany({
    where: { adminUserId },
    select: { credentialId: true, transports: true },
  });

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: String(adminUserId),
    userName: admin.email,
    userDisplayName: admin.email,
    attestationType: "none",
    excludeCredentials: existingPasskeys.map((pk) => ({
      id: base64UrlToUint8Array(pk.credentialId),
      type: "public-key" as const,
      transports: pk.transports as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  return options;
}

export async function verifyAndSaveRegistration(
  adminUserId: number,
  response: RegistrationResponseJSON,
  expectedChallenge: string,
  deviceName?: string,
) {
  const { rpID, origin } = getRpConfig();

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error("Registration verification failed");
  }

  const { credentialID, credentialPublicKey, counter } =
    verification.registrationInfo;

  const transports =
    (response.response.transports as string[] | undefined) ?? [];

  await prisma.adminPasskey.create({
    data: {
      adminUserId,
      credentialId: uint8ArrayToBase64Url(credentialID),
      credentialPublicKey: Buffer.from(credentialPublicKey),
      counter,
      transports,
      deviceName: deviceName || null,
    },
  });

  return verification;
}

export async function getAuthenticationOptions() {
  const { rpID } = getRpConfig();

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
  });

  return options;
}

export async function verifyAuthentication(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
) {
  const { rpID, origin } = getRpConfig();

  const passkey = await prisma.adminPasskey.findUnique({
    where: { credentialId: response.id },
  });

  if (!passkey) {
    throw new Error("Passkey not found");
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: base64UrlToUint8Array(passkey.credentialId),
      credentialPublicKey: new Uint8Array(passkey.credentialPublicKey),
      counter: Number(passkey.counter),
      transports: passkey.transports as AuthenticatorTransportFuture[],
    },
  });

  if (!verification.verified) {
    throw new Error("Authentication verification failed");
  }

  await prisma.adminPasskey.update({
    where: { id: passkey.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    },
  });

  return { verified: true, adminUserId: passkey.adminUserId };
}

