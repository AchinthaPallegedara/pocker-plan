"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

let socketInstance: Socket | null = null;

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection only once
    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
        path: "/socket.io",
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance?.id);
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
