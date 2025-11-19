import { Redis } from "@upstash/redis";
import { Room } from "./types";

// Initialize Redis client
// If no env vars are set, fall back to in-memory storage
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Persistent storage with Upstash Redis
class RoomStore {
  private readonly ROOM_PREFIX = "room:";
  private readonly ROOM_TTL = 24 * 60 * 60; // 24 hours in seconds
  private fallbackRooms: Map<string, Room> = new Map(); // Fallback for local dev

  async createRoom(room: Room): Promise<void> {
    if (redis) {
      await redis.set(`${this.ROOM_PREFIX}${room.id}`, room, {
        ex: this.ROOM_TTL,
      });
    } else {
      this.fallbackRooms.set(room.id, room);
    }
  }

  async getRoom(roomId: string): Promise<Room | null> {
    if (redis) {
      const data = await redis.get<Room>(`${this.ROOM_PREFIX}${roomId}`);
      return data || null;
    } else {
      return this.fallbackRooms.get(roomId) || null;
    }
  }

  async updateRoom(roomId: string, room: Room): Promise<void> {
    if (redis) {
      await redis.set(`${this.ROOM_PREFIX}${roomId}`, room, {
        ex: this.ROOM_TTL,
      });
    } else {
      this.fallbackRooms.set(roomId, room);
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    if (redis) {
      await redis.del(`${this.ROOM_PREFIX}${roomId}`);
    } else {
      this.fallbackRooms.delete(roomId);
    }
  }
}

export const roomStore = new RoomStore();
