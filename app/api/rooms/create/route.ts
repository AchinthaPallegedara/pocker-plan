import { NextRequest, NextResponse } from "next/server";
import { generateRoomId, generatePlayerId } from "@/lib/room-utils";
import "@/lib/socket-types";

export async function POST(request: NextRequest) {
  try {
    const { roomName, playerName } = await request.json();

    if (!roomName || !playerName) {
      return NextResponse.json(
        { error: "Room name and player name are required" },
        { status: 400 }
      );
    }

    const roomId = generateRoomId();
    const playerId = generatePlayerId();

    const room = {
      id: roomId,
      name: roomName,
      players: [
        {
          id: playerId,
          name: playerName,
          vote: null,
          isSpectator: false,
        },
      ],
      revealed: false,
      createdAt: Date.now(),
    };

    global.rooms?.set(roomId, room);

    return NextResponse.json({ roomId, playerId });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
