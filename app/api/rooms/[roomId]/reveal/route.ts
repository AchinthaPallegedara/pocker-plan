import { NextRequest, NextResponse } from "next/server";
import { roomStore } from "@/lib/room-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = roomStore.getRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    room.revealed = true;
    roomStore.updateRoom(roomId, room);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revealing votes:", error);
    return NextResponse.json(
      { error: "Failed to reveal votes" },
      { status: 500 }
    );
  }
}
