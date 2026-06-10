import { Router } from "express";
import { db } from "@workspace/db";
import { estates, users, guestCodes, maintenanceReports, communityPosts, communityEvents, amenities, contractors, managementBroadcasts } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/seed", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Seed disabled in production" });
    return;
  }

  try {
    const existingEstate = await db.query.estates.findFirst({
      where: eq(estates.name, "Hillcrest Estate"),
    });

    if (existingEstate) {
      const existingUser = await db.query.users.findFirst({ where: eq(users.estateId, existingEstate.id) });
      res.json({ message: "Already seeded", estateId: existingEstate.id, userId: existingUser?.id });
      return;
    }

    const [estate] = await db.insert(estates).values({
      name: "Hillcrest Estate",
      address: "136 Hillcrest Boulevard, Hillcrest, KZN",
      province: "KwaZulu-Natal",
      estateType: "gated_residential",
      unitCount: 180,
      status: "active",
      onboardingComplete: true,
      gates: [
        { id: "gate-main", label: "Main Entry Gate", type: "vehicle", access: "both", pi_configured: false },
        { id: "gate-exit", label: "Exit Gate", type: "vehicle", access: "both", pi_configured: false },
        { id: "gate-ped", label: "Pedestrian Gate", type: "pedestrian", access: "both", pi_configured: false },
      ],
    }).returning();

    const [resident] = await db.insert(users).values({
      estateId: estate.id,
      firstName: "Thandi",
      lastName: "Mthembu",
      email: "thandi@estatehq.app",
      phone: "+27 82 555 0136",
      role: "resident",
      unitNumber: "136",
      status: "active",
      accountStanding: "good",
    }).returning();

    const [manager] = await db.insert(users).values({
      estateId: estate.id,
      firstName: "Estate",
      lastName: "Manager",
      email: "manager@hillcrest.co.za",
      phone: "+27 11 000 0000",
      role: "manager",
      status: "active",
    }).returning();

    const now = Date.now();
    await db.insert(guestCodes).values([
      {
        estateId: estate.id,
        unitId: resident.id,
        guestFirstName: "John",
        guestLastName: "Smith",
        guestPhone: "+27 83 444 0001",
        isParcel: false,
        pinCode: "847261",
        qrPayload: `ehq:${estate.id}:847261:${now}`,
        validUntil: new Date(now + 18 * 3600000),
        usesTotal: 3,
        usesRemaining: 2,
        isActive: true,
      },
      {
        estateId: estate.id,
        unitId: resident.id,
        guestFirstName: "Maria",
        guestLastName: "Santos",
        guestPhone: "+27 71 555 0002",
        isParcel: false,
        pinCode: "K4R9",
        qrPayload: `ehq:${estate.id}:K4R9:${now}`,
        validUntil: new Date(now + 48 * 3600000),
        usesTotal: 3,
        usesRemaining: 3,
        isActive: true,
      },
      {
        estateId: estate.id,
        unitId: resident.id,
        guestFirstName: "Plumber",
        guestLastName: "PipeFix",
        guestPhone: "",
        isParcel: false,
        pinCode: "P1L7",
        qrPayload: `ehq:${estate.id}:P1L7:${now}`,
        validUntil: new Date(now + 6 * 3600000),
        usesTotal: 1,
        usesRemaining: 1,
        isActive: true,
      },
      {
        estateId: estate.id,
        unitId: resident.id,
        guestFirstName: "Sarah",
        guestLastName: "Chen",
        guestPhone: "",
        isParcel: false,
        pinCode: "D6Q3",
        qrPayload: `ehq:${estate.id}:D6Q3:${now}`,
        validUntil: new Date(now - 3600000),
        usesTotal: 3,
        usesRemaining: 0,
        isActive: false,
      },
    ]);

    await db.insert(maintenanceReports).values([
      {
        estateId: estate.id,
        submittedBy: resident.id,
        unitNumber: "136",
        title: "Leaking tap in main bathroom",
        description: "The bathroom tap has been dripping for 2 days and is getting worse.",
        category: "maintenance",
        priority: "medium",
        status: "in_progress",
        ticketNumber: "TKT-1024",
      },
      {
        estateId: estate.id,
        submittedBy: resident.id,
        unitNumber: "136",
        title: "Gate motor making noise",
        description: "The main vehicle gate motor is making a loud grinding sound when opening.",
        category: "maintenance",
        priority: "high",
        status: "open",
        ticketNumber: "TKT-1019",
      },
    ]);

    await db.insert(communityPosts).values([
      {
        estateId: estate.id,
        authorId: resident.id,
        content: "Anyone else hear a car alarm near North gate around midnight?",
        isAnonymous: true,
        commentCount: 4,
        viewCount: 38,
        status: "active",
      },
      {
        estateId: estate.id,
        authorId: resident.id,
        content: "Reminder: pool gate latch has been loose. Reported to maintenance.",
        isAnonymous: true,
        commentCount: 2,
        viewCount: 71,
        status: "active",
      },
    ]);

    const eventNow = Date.now();
    await db.insert(communityEvents).values([
      {
        estateId: estate.id,
        createdBy: manager.id,
        title: "Community Braai",
        location: "Clubhouse lawn",
        startsAt: new Date(eventNow + 5 * 86400000),
        endsAt: new Date(eventNow + 5 * 86400000 + 4 * 3600000),
        status: "active",
      },
      {
        estateId: estate.id,
        createdBy: manager.id,
        title: "AGM Meeting",
        location: "Clubhouse hall",
        startsAt: new Date(eventNow + 10 * 86400000),
        endsAt: new Date(eventNow + 10 * 86400000 + 2 * 3600000),
        status: "active",
      },
      {
        estateId: estate.id,
        createdBy: manager.id,
        title: "Kids' Movie Night",
        description: "Family movie night at the pool deck. Bring your own snacks!",
        location: "Pool deck",
        startsAt: new Date(eventNow + 14 * 86400000),
        endsAt: new Date(eventNow + 14 * 86400000 + 3 * 3600000),
        status: "active",
      },
    ]);

    await db.insert(amenities).values([
      {
        estateId: estate.id,
        name: "Clubhouse",
        description: "Full entertainment facility with kitchen and braai area",
        availableDays: ["saturday", "sunday"],
        availableFrom: "14:00",
        availableUntil: "22:00",
        isActive: true,
      },
      {
        estateId: estate.id,
        name: "Tennis court",
        description: "Full-size tennis court with lights",
        availableDays: ["sunday"],
        availableFrom: "08:00",
        availableUntil: "10:00",
        isActive: true,
      },
      {
        estateId: estate.id,
        name: "Padel court",
        description: "Indoor padel court",
        availableDays: ["wednesday"],
        availableFrom: "17:00",
        availableUntil: "18:00",
        isActive: true,
      },
      {
        estateId: estate.id,
        name: "Braai area",
        description: "Covered braai area with outdoor seating",
        availableDays: ["friday"],
        availableFrom: "18:00",
        availableUntil: "22:00",
        isActive: true,
      },
    ]);

    await db.insert(contractors).values([
      {
        estateId: estate.id,
        name: "Thabo Mokoena",
        description: "PipeFix Plumbing",
        tradeCategories: ["Plumbing"],
        phone: "+27 82 444 0101",
        whatsapp: "+27 82 444 0101",
        ratingSum: 490,
        ratingCount: 100,
        jobCount: 142,
        avgResponseMins: 30,
        isVerified: true,
      },
      {
        estateId: estate.id,
        name: "Rocky Venter",
        description: "RV Electrical Services",
        tradeCategories: ["Electrical"],
        phone: "+27 71 555 0202",
        whatsapp: "+27 71 555 0202",
        ratingSum: 235,
        ratingCount: 50,
        jobCount: 87,
        avgResponseMins: 45,
        isVerified: true,
      },
    ]);

    await db.insert(managementBroadcasts).values([
      {
        estateId: estate.id,
        sentBy: manager.id,
        messageType: "broadcast",
        subject: "Water maintenance - 15 Jun",
        content: "Scheduled water maintenance on Saturday 15 June from 09:00–13:00. Please store water in advance.",
        deliveryChannel: ["push", "email"],
        isRead: false,
      },
      {
        estateId: estate.id,
        sentBy: manager.id,
        messageType: "broadcast",
        subject: "Levies due 25 June",
        content: "Monthly levies are due by 25 June. Please ensure your payment is up to date.",
        deliveryChannel: ["push", "email"],
        isRead: false,
      },
      {
        estateId: estate.id,
        sentBy: manager.id,
        messageType: "broadcast",
        subject: "New gate access system",
        content: "We have upgraded to a new gate access system. Your EstateHQ app is now your primary access method.",
        deliveryChannel: ["push", "email"],
        isRead: true,
      },
    ]);

    res.json({
      message: "Seeded successfully",
      estateId: estate.id,
      residentId: resident.id,
      loginEmail: "thandi@estatehq.app",
      devOtp: "123456",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;
