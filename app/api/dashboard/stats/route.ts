import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total interviews
    const totalResult = await pool.query(
      `SELECT COUNT(*) as total FROM interviews`
    );
    const total = parseInt(totalResult.rows[0].total);

    // By progress status
    const progressResult = await pool.query(
      `SELECT progress, COUNT(*) as count 
       FROM interviews 
       GROUP BY progress`
    );
    const byProgress = progressResult.rows.reduce((acc: any, row: any) => {
      acc[row.progress] = parseInt(row.count);
      return acc;
    }, {});

    // By country (top 10)
    const countryResult = await pool.query(
      `SELECT country, COUNT(*) as count 
       FROM interviews 
       GROUP BY country 
       ORDER BY count DESC 
       LIMIT 10`
    );
    const byCountry = countryResult.rows.map((row: any) => ({
      country: row.country,
      count: parseInt(row.count),
    }));

    // Recent interviews (last 5)
    const recentResult = await pool.query(
      `SELECT 
        i.id, i."replyDate", i."interviewTime", i.country, 
        i."suggestedRole", i.progress, i."createdBy",
        u.username as "creator_username", u.name as "creator_name"
      FROM interviews i
      LEFT JOIN users u ON i."createdBy" = u.id
      ORDER BY i."createdAt" DESC
      LIMIT 5`
    );

    const isViewer = session.user.role === "VIEWER";
    const recentInterviews = recentResult.rows.map((row: any) => {
      const interview: any = {
        id: row.id,
        replyDate: row.replyDate,
        interviewTime: row.interviewTime,
        country: row.country,
        suggestedRole: row.suggestedRole,
        progress: row.progress,
        createdBy: row.createdBy,
      };

      if (!isViewer) {
        interview.creator = {
          username: row.creator_username,
          name: row.creator_name,
        };
      }

      return interview;
    });

    // Calculate statistics
    const scheduled = byProgress.SCHEDULED || 0;
    const inProgress = (byProgress.PHONE_CALL || 0) + (byProgress.TEST || 0) + (byProgress.INITIAL || 0) + (byProgress.TECHNICAL || 0);
    const completed = byProgress.CEO_CTO || 0;
    const rejected = byProgress.REJECTED || 0;
    const notStarted = byProgress.NOT || 0;

    return NextResponse.json({
      total,
      scheduled,
      inProgress,
      completed,
      rejected,
      notStarted,
      byProgress,
      byCountry,
      recentInterviews,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
