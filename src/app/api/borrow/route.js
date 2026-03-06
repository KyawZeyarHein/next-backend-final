import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET all borrow requests
export async function GET(req) {
  try {
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const client = await getClientPromise();
    const db = client.db("library");

    let filter = {};

    // USER only sees their own requests
    if (auth.role !== "ADMIN") {
      filter.userId = new ObjectId(auth.id);
    }

    const requests = await db.collection("borrow").find(filter).toArray();

    return NextResponse.json(
      { requests },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST create borrow request
export async function POST(req) {
  try {
    const auth = await verifyAuth(req);

    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Only USER can create borrow request
    if (auth.role !== "USER") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403, headers: corsHeaders }
      );
    }

    const data = await req.json();
    const { bookId, targetDate } = data;

    if (!bookId || !targetDate) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await getClientPromise();
    const db = client.db("library");

    const newRequest = {
      userId: new ObjectId(auth.id),
      bookId: new ObjectId(bookId),
      targetDate: new Date(targetDate),
      status: "INIT",
      createdAt: new Date()
    };

    const result = await db.collection("borrow").insertOne(newRequest);

    return NextResponse.json(
      { message: "Borrow request created", id: result.insertedId },
      { status: 201, headers: corsHeaders }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}