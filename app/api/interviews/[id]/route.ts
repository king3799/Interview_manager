import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const result = await pool.query(
      `SELECT 
        i.id, i."replyDate", i."interviewTime", i.country, 
        i."suggestedRole", i."profileName", i."intervieweeName", i.note,
        i."mailUrl", i."jobUrl", i."meetingUrl",
        i.progress, i."createdBy", i."createdAt", i."updatedAt",
        u.id as "creator_id", u.username as "creator_username", u.name as "creator_name"
      FROM interviews i
      LEFT JOIN users u ON i."createdBy" = u.id
      WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const isViewer = session.user.role === "VIEWER";

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

    return NextResponse.json(interview);
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if interview exists and get creator
    const checkResult = await pool.query(
      `SELECT "createdBy" FROM interviews WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const createdBy = checkResult.rows[0].createdBy;

    // Check permissions: Admin can edit all, Bidder can edit own only
    if (
      session.user.role === "VIEWER" ||
      (session.user.role === "BIDDER" && createdBy !== session.user.id)
    ) {
      return NextResponse.json(
        { error: "You don't have permission to edit this interview" },
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

    const result = await pool.query(
      `UPDATE interviews 
      SET 
        "replyDate" = $1, 
        "interviewTime" = $2, 
        country = $3, 
        "suggestedRole" = $4, 
        "profileName" = $5, 
        "intervieweeName" = $6, 
        note = $7,
        "mailUrl" = $8, 
        "jobUrl" = $9, 
        "meetingUrl" = $10, 
        progress = $11, 
        "updatedAt" = NOW()
      WHERE id = $12
      RETURNING *`,
      [
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
        id,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating interview:", error);
    return NextResponse.json(
      { error: "Failed to update interview" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if interview exists and get creator
    const checkResult = await pool.query(
      `SELECT "createdBy" FROM interviews WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const createdBy = checkResult.rows[0].createdBy;

    // Check permissions: Admin can delete all, Bidder can delete own only
    if (
      session.user.role === "VIEWER" ||
      (session.user.role === "BIDDER" && createdBy !== session.user.id)
    ) {
      return NextResponse.json(
        { error: "You don't have permission to delete this interview" },
        { status: 403 }
      );
    }

    await pool.query(`DELETE FROM interviews WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      { error: "Failed to delete interview" },
      { status: 500 }
    );
  }
}
