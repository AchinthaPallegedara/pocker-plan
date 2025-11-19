import { Server as SocketIOServer } from "socket.io";
import { Room } from "./types";

declare global {
  var io: SocketIOServer | undefined;
  var rooms: Map<string, Room> | undefined;
}

export {};
