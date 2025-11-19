import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { Room, Player } from "./lib/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory room storage for real-time performance
const rooms = new Map<string, Room>();

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
    socket.on("join-room", (roomId: string, playerId?: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);

      // Send current room state
      const room = rooms.get(roomId);
      if (room) {
        socket.emit("room-update", room);
      }
    });

    // Add player to room
    socket.on(
      "add-player",
      ({ roomId, player }: { roomId: string; player: Player }) => {
        const room = rooms.get(roomId);
        if (room) {
          room.players.push(player);
          io.to(roomId).emit("room-update", room);
        }
      }
    );

    // Player vote
    socket.on(
      "player-vote",
      ({
        roomId,
        playerId,
        vote,
      }: {
        roomId: string;
        playerId: string;
        vote: string;
      }) => {
        const room = rooms.get(roomId);
        if (room) {
          const player = room.players.find((p) => p.id === playerId);
          if (player) {
            player.vote = vote;
            io.to(roomId).emit("room-update", room);
          }
        }
      }
    );

    // Reveal votes
    socket.on("reveal-votes", (roomId: string) => {
      const room = rooms.get(roomId);
      if (room) {
        room.revealed = true;
        io.to(roomId).emit("room-update", room);
      }
    });

    // Reset votes
    socket.on("reset-votes", (roomId: string) => {
      const room = rooms.get(roomId);
      if (room) {
        room.players.forEach((player) => {
          player.vote = null;
        });
        room.revealed = false;
        io.to(roomId).emit("room-update", room);
      }
    });

    // Remove player from room
    socket.on(
      "remove-player",
      ({ roomId, playerId }: { roomId: string; playerId: string }) => {
        const room = rooms.get(roomId);
        if (room) {
          room.players = room.players.filter((p) => p.id !== playerId);
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

  // Make io instance and rooms available globally for API routes
  global.io = io;
  global.rooms = rooms;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
