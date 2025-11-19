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

    // Reset all votes
    room.players.forEach((player) => {
      player.vote = null;
    });
    room.revealed = false;

    roomStore.updateRoom(roomId, room);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting room:", error);
    return NextResponse.json(
      { error: "Failed to reset room" },
      { status: 500 }
    );
  }
}
