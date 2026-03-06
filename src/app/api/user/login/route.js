// REFERENCE: This file is provided as a user login example.
// Students must implement authentication and role-based logic as required in the exam.
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "mydefaulyjwtsecret";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  const data = await req.json();
  const { email, password } = data;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Missing email or password" },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    const client = await getClientPromise();

    // CHANGE DATABASE NAME IF NEEDED
    const db = client.db("library");

    // USER COLLECTION
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401, headers: corsHeaders }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Generate JWT WITH ROLE
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      },
      {
        status: 200,
        headers: corsHeaders
      }
    );

    // HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production"
    });

    return response;

  } catch (exception) {
  console.log("LOGIN ERROR:", exception);

  return NextResponse.json(
    { message: exception.message },
    { status: 500, headers: corsHeaders }
  );
}
}