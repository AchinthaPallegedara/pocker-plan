import { Redis } from "@upstash/redis";
import { Room } from "./types";

// Lazy initialization - only create Redis client when first accessed
let redis: Redis | null = null;
let redisInitialized = false;

function getRedis(): Redis | null {
  if (!redisInitialized) {
    redisInitialized = true;

    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      console.log("✅ Redis initialized with Upstash");
    } else {
      console.log("⚠️  Redis not configured, using in-memory fallback");
      console.log(
        "   UPSTASH_REDIS_REST_URL:",
        process.env.UPSTASH_REDIS_REST_URL ? "SET" : "NOT SET"
      );
      console.log(
        "   UPSTASH_REDIS_REST_TOKEN:",
        process.env.UPSTASH_REDIS_REST_TOKEN ? "SET" : "NOT SET"
      );
    }
  }
  return redis;
}

// Persistent storage with Upstash Redis
class RoomStore {
  private readonly ROOM_PREFIX = "room:";
  private readonly ROOM_TTL = 24 * 60 * 60; // 24 hours in seconds
  private fallbackRooms: Map<string, Room> = new Map(); // Fallback for local dev

  async createRoom(room: Room): Promise<void> {
    const redisClient = getRedis();
    console.log(
      `Creating room ${room.id}`,
      redisClient ? "in Redis" : "in memory"
    );
    if (redisClient) {
      await redisClient.set(`${this.ROOM_PREFIX}${room.id}`, room, {
        ex: this.ROOM_TTL,
      });
      console.log(`✅ Room ${room.id} created in Redis`);
    } else {
      this.fallbackRooms.set(room.id, room);
      console.log(`✅ Room ${room.id} created in memory`);
    }
  }

  async getRoom(roomId: string): Promise<Room | null> {
    const redisClient = getRedis();
    console.log(
      `Getting room ${roomId}`,
      redisClient ? "from Redis" : "from memory"
    );
    if (redisClient) {
      const data = await redisClient.get<Room>(`${this.ROOM_PREFIX}${roomId}`);
      console.log(`Room ${roomId}:`, data ? "found" : "not found");
      return data || null;
    } else {
      const data = this.fallbackRooms.get(roomId) || null;
      console.log(
        `Room ${roomId}:`,
        data ? "found" : "not found",
        `(${this.fallbackRooms.size} rooms in memory)`
      );
      return data;
    }
  }

  async updateRoom(roomId: string, room: Room): Promise<void> {
    const redisClient = getRedis();
    console.log(
      `Updating room ${roomId}`,
      redisClient ? "in Redis" : "in memory"
    );
    if (redisClient) {
      await redisClient.set(`${this.ROOM_PREFIX}${roomId}`, room, {
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
