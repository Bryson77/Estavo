import { Router } from "express";
import { db } from "@workspace/db";
import { users, estates } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const requestOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

router.post("/auth/request-otp", async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }
  const { email } = parsed.data;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      res.status(404).json({ error: "No account found with this email. Contact your estate manager." });
      return;
    }

    if (user.status !== "active") {
      res.status(403).json({ error: "Your account has been suspended. Contact your estate manager." });
      return;
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.update(users)
      .set({ otpCode: otp, otpExpiresAt: expiresAt })
      .where(eq(users.id, user.id));

    console.log(`[DEV] OTP for ${email}: ${otp}`);

    res.json({ message: "OTP sent to your email.", devOtp: process.env.NODE_ENV === "development" ? otp : undefined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { email, otp } = parsed.data;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const devBypass = process.env.NODE_ENV === "development" && otp === "123456";

    if (!devBypass) {
      if (!user.otpCode || user.otpCode !== otp) {
        res.status(401).json({ error: "Invalid OTP code" });
        return;
      }
      if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
        res.status(401).json({ error: "OTP has expired. Request a new one." });
        return;
      }
    }

    await db.update(users)
      .set({
        otpCode: null,
        otpExpiresAt: null,
        firstLogin: false,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const estate = await db.query.estates.findFirst({
      where: eq(estates.id, user.estateId),
    });

    const token = signToken({
      userId: user.id,
      estateId: user.estateId,
      role: user.role,
      email: user.email,
      unitNumber: user.unitNumber,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        unitNumber: user.unitNumber,
        accountStanding: user.accountStanding,
        estateId: user.estateId,
        estateName: estate?.name ?? "",
        estateAddress: estate?.address ?? "",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const estate = await db.query.estates.findFirst({
      where: eq(estates.id, user.estateId),
    });

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      unitNumber: user.unitNumber,
      accountStanding: user.accountStanding,
      estateId: user.estateId,
      estateName: estate?.name ?? "",
      estateAddress: estate?.address ?? "",
      phone: user.phone,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;
