import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin and Bidder can view users (Bidder might need it for filtering)
    if (session.user.role === "VIEWER") {
      return NextResponse.json(
        { error: "Viewers cannot view users" },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT id, username, name, location, note, role, "createdAt", "updatedAt"
       FROM users
       ORDER BY "createdAt" DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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

    // Only Admin can create users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can create users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, name, location, note, role, password } = body;

    // Validate required fields
    if (!username || !name || !role || !password) {
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

    // Check if username already exists
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate ID
    const generateId = () => {
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 15);
      return `user_${timestamp}${randomStr}`;
    };

    // Create user
    const result = await pool.query(
      `INSERT INTO users 
        (id, username, name, location, note, role, "passwordHash", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, username, name, location, note, role, "createdAt", "updatedAt"`,
      [
        generateId(),
        username,
        name,
        location || null,
        note || null,
        role,
        passwordHash,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
