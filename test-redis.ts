// Test Redis connection
import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function testRedis() {
  console.log("Testing Redis connection...");
  console.log("URL:", process.env.UPSTASH_REDIS_REST_URL);
  console.log(
    "Token:",
    process.env.UPSTASH_REDIS_REST_TOKEN?.substring(0, 20) + "..."
  );

  try {
    // Test write
    await redis.set("test:key", { hello: "world" }, { ex: 60 });
    console.log("✅ Write successful");

    // Test read
    const data = await redis.get("test:key");
    console.log("✅ Read successful:", data);

    // Test room format
    const testRoom = {
      id: "TEST123",
      name: "Test Room",
      players: [],
      revealed: false,
      createdAt: Date.now(),
    };

    await redis.set("room:TEST123", testRoom, { ex: 60 });
    console.log("✅ Test room written");

    const readRoom = await redis.get("room:TEST123");
    console.log("✅ Test room read:", readRoom);

    // Cleanup
    await redis.del("test:key");
    await redis.del("room:TEST123");
    console.log("✅ Cleanup successful");
  } catch (error) {
    console.error("❌ Redis error:", error);
  }
}

testRedis();
