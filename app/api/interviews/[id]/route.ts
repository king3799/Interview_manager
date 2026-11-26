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
        i.id, i."replyDate", i."interviewTime", i.timezone, i.country, 
        i."suggestedRole", i."profileName", i."intervieweeName", i.note,
        i.resume_url, i.resume_filename, i.resume_size,
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
      timezone: row.timezone,
      country: row.country,
      suggestedRole: row.suggestedRole,
      profileName: row.profileName,
      intervieweeName: row.intervieweeName,
      note: row.note,
      resumeUrl: row.resume_url,
      resumeFilename: row.resume_filename,
      resumeSize: row.resume_size,
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
      timezone,
      country,
      suggestedRole,
      profileName,
      intervieweeName,
      note,
      resumeUrl,
      resumeFilename,
      resumeSize,
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
        timezone = $3,
        country = $4, 
        "suggestedRole" = $5, 
        "profileName" = $6, 
        "intervieweeName" = $7, 
        note = $8,
        resume_url = $9,
        resume_filename = $10,
        resume_size = $11,
        "mailUrl" = $12, 
        "jobUrl" = $13, 
        "meetingUrl" = $14, 
        progress = $15, 
        "updatedAt" = NOW()
      WHERE id = $16
      RETURNING *`,
      [
        new Date(replyDate),
        new Date(interviewTime),
        timezone || "UTC",
        country,
        suggestedRole,
        profileName || null,
        intervieweeName || null,
        note || null,
        resumeUrl || null,
        resumeFilename || null,
        resumeSize || null,
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

    // Check if interview exists and get creator and resume URL
    const checkResult = await pool.query(
      `SELECT "createdBy", resume_url FROM interviews WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const createdBy = checkResult.rows[0].createdBy;
    const resumeUrl = checkResult.rows[0].resume_url;

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

    // Delete resume from Vercel Blob if exists
    if (resumeUrl) {
      try {
        const { del } = await import("@vercel/blob");
        await del(resumeUrl);
      } catch (error) {
        console.error("Error deleting resume from blob:", error);
        // Continue with interview deletion even if blob deletion fails
      }
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
