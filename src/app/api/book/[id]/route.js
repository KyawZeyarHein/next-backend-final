import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req, { params }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });

    const client = await getClientPromise();
    const db = client.db("library");

    const book = await db.collection("books").findOne({ _id: new ObjectId(params.id) });
    if (!book) return NextResponse.json({ message: "Book not found" }, { status: 404, headers: corsHeaders });
    if (auth.role !== "ADMIN" && book.status === "deleted") return NextResponse.json({ message: "Book not found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json({ book }, { status: 200, headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
    if (auth.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });

    const data = await req.json();
    const client = await getClientPromise();
    const db = client.db("library");

    await db.collection("books").updateOne({ _id: new ObjectId(params.id) }, { $set: data });
    const updatedBook = await db.collection("books").findOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ book: updatedBook }, { status: 200, headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await verifyAuth(req);
    if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: corsHeaders });
    if (auth.role !== "ADMIN") return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: corsHeaders });

    const client = await getClientPromise();
    const db = client.db("library");

    await db.collection("books").updateOne({ _id: new ObjectId(params.id) }, { $set: { status: "deleted", deletedAt: new Date() }});
    return NextResponse.json({ message: "Book deleted" }, { status: 200, headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: corsHeaders });
  }
}