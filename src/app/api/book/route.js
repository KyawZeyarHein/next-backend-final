import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

    const client = await getClientPromise();
    const db = client.db("library");

    const filter = auth.role === "ADMIN" ? {} : { status: { $ne: "deleted" } };

    const books = await db.collection("books").find(filter).toArray();
    return NextResponse.json({ books }, { status: 200, headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
    if (auth.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });

    const data = await req.json();
    const { title, author, quantity, location } = data;
    if (!title || !author) return NextResponse.json({ message: "Missing required fields" }, { status: 400, headers: corsHeaders });

    const client = await getClientPromise();
    const db = client.db("library");

    const newBook = {
      title,
      author,
      quantity: quantity || 1,
      location: location || "",
      status: "active",
      createdAt: new Date()
    };

    const result = await db.collection("books").insertOne(newBook);
    return NextResponse.json({ message: "Book created", id: result.insertedId }, { status: 201, headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}