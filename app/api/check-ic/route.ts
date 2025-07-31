import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { icNumber } = await request.json();

    if (!icNumber) {
      return NextResponse.json({ error: "IC number is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("registrations")
      .select("id")
      .eq("identity_card_number", icNumber)
      .maybeSingle();

    if (error) {
      console.error("Error checking IC number:", error);
      return NextResponse.json({ error: "Error checking IC number" }, { status: 500 });
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
