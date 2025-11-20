import { NextRequest, NextResponse } from "next/server";
import { generatePlayerId } from "@/lib/room-utils";
import { roomStore } from "@/lib/room-store";
import "@/lib/socket-types";

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerName, isSpectator = false } = await request.json();

    if (!roomId || !playerName) {
      return NextResponse.json(
        { error: "Room ID and player name are required" },
        { status: 400 }
      );
    }

    const room = await roomStore.getRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const playerId = generatePlayerId();

    // Return playerId immediately - player will be added via Socket.IO
    return NextResponse.json({ playerId, playerName, isSpectator });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
