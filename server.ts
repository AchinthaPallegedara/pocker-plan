import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { config } from "dotenv";

// Load environment variables FIRST before any other imports
config({ path: ".env.local" });

// Now import modules that depend on env vars
import { Room, Player } from "./lib/types";
import { roomStore } from "./lib/room-store";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://${hostname}:${port}`,
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a room
    socket.on("join-room", async (roomId: string, playerId?: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);

      // Send current room state
      const room = await roomStore.getRoom(roomId);
      if (room) {
        console.log(`✅ Sending room ${roomId} state to socket ${socket.id}`);
        socket.emit("room-update", room);
      } else {
        console.log(
          `⚠️  Room ${roomId} not found when socket ${socket.id} tried to join`
        );
      }
    });

    // Add player to room
    socket.on(
      "add-player",
      async ({ roomId, player }: { roomId: string; player: Player }) => {
        const room = await roomStore.getRoom(roomId);
        if (room) {
          room.players.push(player);
          await roomStore.updateRoom(roomId, room);
          io.to(roomId).emit("room-update", room);
        }
      }
    );

    // Player vote
    socket.on(
      "player-vote",
      async ({
        roomId,
        playerId,
        vote,
      }: {
        roomId: string;
        playerId: string;
        vote: string;
      }) => {
        console.log(
          `📊 Vote received: Player ${playerId} voted ${vote} in room ${roomId}`
        );
        const room = await roomStore.getRoom(roomId);
        if (room) {
          const player = room.players.find((p) => p.id === playerId);
          if (player) {
            player.vote = vote;
            await roomStore.updateRoom(roomId, room);
            console.log(
              `✅ Vote saved and broadcasting update to room ${roomId}`
            );
            io.to(roomId).emit("room-update", room);
          } else {
            console.log(`❌ Player ${playerId} not found in room ${roomId}`);
          }
        } else {
          console.log(`❌ Room ${roomId} not found`);
        }
      }
    );

    // Reveal votes
    socket.on("reveal-votes", async (roomId: string) => {
      const room = await roomStore.getRoom(roomId);
      if (room) {
        room.revealed = true;
        await roomStore.updateRoom(roomId, room);
        io.to(roomId).emit("room-update", room);
      }
    });

    // Reset votes
    socket.on("reset-votes", async (roomId: string) => {
      const room = await roomStore.getRoom(roomId);
      if (room) {
        room.players.forEach((player) => {
          player.vote = null;
        });
        room.revealed = false;
        await roomStore.updateRoom(roomId, room);
        io.to(roomId).emit("room-update", room);
      }
    });

    // Remove player from room
    socket.on(
      "remove-player",
      async ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        const room = await roomStore.getRoom(roomId);
        if (room) {
          room.players = room.players.filter((p) => p.id !== playerId);
          await roomStore.updateRoom(roomId, room);
          io.to(roomId).emit("room-update", room);
          console.log(`Player ${playerId} removed from room ${roomId}`);
        }
      }
    );

    // Leave a room
    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Make io instance available globally for API routes
  global.io = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
