import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const progress = searchParams.get("progress") || "";
    const country = searchParams.get("country") || "";
    const createdBy = searchParams.get("createdBy") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    let query = `
      SELECT 
        i.id, i."replyDate", i."interviewTime", i.country, 
        i."suggestedRole", i."profileName", i."intervieweeName", i.note,
        i."mailUrl", i."jobUrl", i."meetingUrl",
        i.progress, i."createdBy", i."createdAt", i."updatedAt",
        u.id as "creator_id", u.username as "creator_username", u.name as "creator_name"
      FROM interviews i
      LEFT JOIN users u ON i."createdBy" = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Keyword search
    if (q) {
      query += ` AND (
        i."suggestedRole" ILIKE $${paramIndex} OR 
        i.country ILIKE $${paramIndex} OR 
        i."mailUrl" ILIKE $${paramIndex} OR 
        i."jobUrl" ILIKE $${paramIndex} OR 
        i."meetingUrl" ILIKE $${paramIndex}
      )`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    // Progress filter
    if (progress) {
      query += ` AND i.progress = $${paramIndex}`;
      params.push(progress);
      paramIndex++;
    }

    // Country filter
    if (country) {
      query += ` AND i.country ILIKE $${paramIndex}`;
      params.push(`%${country}%`);
      paramIndex++;
    }

    // Creator filter
    if (createdBy) {
      query += ` AND i."createdBy" = $${paramIndex}`;
      params.push(createdBy);
      paramIndex++;
    }

    // Date range filter
    if (startDate) {
      query += ` AND i."interviewTime" >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      query += ` AND i."interviewTime" <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY i."interviewTime" DESC`;

    const result = await pool.query(query, params);

    // Format the response
    const isViewer = session.user.role === "VIEWER";
    const interviews = result.rows.map((row: any) => {
      const interview: any = {
        id: row.id,
        replyDate: row.replyDate,
        interviewTime: row.interviewTime,
        country: row.country,
        suggestedRole: row.suggestedRole,
        profileName: row.profileName,
        intervieweeName: row.intervieweeName,
        note: row.note,
        mailUrl: row.mailUrl,
        jobUrl: row.jobUrl,
        meetingUrl: row.meetingUrl,
        progress: row.progress,
        createdBy: row.createdBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      if (!isViewer && row.creator_id) {
        interview.creator = {
          id: row.creator_id,
          username: row.creator_username,
          name: row.creator_name,
        };
      }

      return interview;
    });

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role === "VIEWER") {
      return NextResponse.json(
        { error: "Viewers cannot create interviews" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      replyDate,
      interviewTime,
      country,
      suggestedRole,
      profileName,
      intervieweeName,
      note,
      mailUrl,
      jobUrl,
      meetingUrl,
      progress,
    } = body;

    // Validate required fields
    if (!replyDate || !interviewTime || !country || !suggestedRole) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique ID (similar to Prisma's cuid)
    const generateId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 15);
      return `int_${timestamp}${randomStr}`;
    };

    const result = await pool.query(
      `INSERT INTO interviews 
        (id, "replyDate", "interviewTime", country, "suggestedRole", "profileName", "intervieweeName", note, "mailUrl", "jobUrl", "meetingUrl", progress, "createdBy", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        generateId(),
        new Date(replyDate),
        new Date(interviewTime),
        country,
        suggestedRole,
        profileName || null,
        intervieweeName || null,
        note || null,
        mailUrl || null,
        jobUrl || null,
        meetingUrl || null,
        progress || "NOT",
        session.user.id,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { error: "Failed to create interview" },
      { status: 500 }
    );
  }
}
