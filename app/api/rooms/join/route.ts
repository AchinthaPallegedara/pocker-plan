import { NextRequest, NextResponse } from "next/server";
import { roomStore } from "@/lib/room-store";
import { generatePlayerId } from "@/lib/room-utils";

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerName, isSpectator = false } = await request.json();

    if (!roomId || !playerName) {
      return NextResponse.json(
        { error: "Room ID and player name are required" },
        { status: 400 }
      );
    }

    const room = roomStore.getRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const playerId = generatePlayerId();

    room.players.push({
      id: playerId,
      name: playerName,
      vote: null,
      isSpectator: isSpectator,
    });

    roomStore.updateRoom(roomId, room);

    return NextResponse.json({ playerId });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
