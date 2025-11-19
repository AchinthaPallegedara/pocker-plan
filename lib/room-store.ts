import { Room } from "./types";

// In-memory storage (for production, use a database like Redis or PostgreSQL)
class RoomStore {
  private rooms: Map<string, Room> = new Map();

  createRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  updateRoom(roomId: string, room: Room): void {
    this.rooms.set(roomId, room);
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  // Clean up old rooms (older than 24 hours)
  cleanupOldRooms(): void {
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.createdAt > oneDayInMs) {
        this.rooms.delete(roomId);
      }
    }
  }
}

export const roomStore = new RoomStore();

// Clean up old rooms every hour
if (typeof window === "undefined") {
  setInterval(() => {
    roomStore.cleanupOldRooms();
  }, 60 * 60 * 1000);
}
