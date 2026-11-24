import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only Admin can view user details
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can view users" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const result = await pool.query(
      `SELECT id, username, name, location, note, role, "createdAt", "updatedAt"
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
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

    // Only Admin can update users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can update users" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { username, name, location, note, role, password } = body;

    // Validate required fields
    if (!username || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["ADMIN", "BIDDER", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if username is taken by another user
    const usernameCheck = await pool.query(
      `SELECT id FROM users WHERE username = $1 AND id != $2`,
      [username, id]
    );

    if (usernameCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Update user (with or without password)
    let result;
    if (password && password.trim() !== "") {
      const passwordHash = await bcrypt.hash(password, 10);
      result = await pool.query(
        `UPDATE users 
         SET username = $1, name = $2, location = $3, note = $4, role = $5, "passwordHash" = $6, "updatedAt" = NOW()
         WHERE id = $7
         RETURNING id, username, name, location, note, role, "createdAt", "updatedAt"`,
        [username, name, location || null, note || null, role, passwordHash, id]
      );
    } else {
      result = await pool.query(
        `UPDATE users 
         SET username = $1, name = $2, location = $3, note = $4, role = $5, "updatedAt" = NOW()
         WHERE id = $6
         RETURNING id, username, name, location, note, role, "createdAt", "updatedAt"`,
        [username, name, location || null, note || null, role, id]
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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

    // Only Admin can delete users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete users" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete yourself" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user (CASCADE will delete their interviews)
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
