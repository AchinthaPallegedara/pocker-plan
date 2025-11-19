"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !playerName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, playerName }),
      });

      const data = await response.json();
      if (data.roomId && data.playerId) {
        router.push(`/room/${data.roomId}?playerId=${data.playerId}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim() || !joinPlayerName.trim()) return;

    setIsJoining(true);
    try {
      // Navigate to room with player name in query params
      const params = new URLSearchParams({
        playerName: joinPlayerName,
      });
      router.push(`/room/${joinRoomId.toUpperCase()}?${params.toString()}`);
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Failed to join room. Please check the room ID and try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
            🃏 Poker Planning
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Collaborative story point estimation for agile teams
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Room</CardTitle>
              <CardDescription>
                Start a new poker planning session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="Sprint Planning #42"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="playerName">Your Name</Label>
                <Input
                  id="playerName"
                  placeholder="John Doe"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreateRoom}
                disabled={!roomName.trim() || !playerName.trim() || isCreating}
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join Existing Room</CardTitle>
              <CardDescription>
                Enter the room ID to join a session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinRoomId">Room ID</Label>
                <Input
                  id="joinRoomId"
                  placeholder="ABC123"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinPlayerName">Your Name</Label>
                <Input
                  id="joinPlayerName"
                  placeholder="Jane Smith"
                  value={joinPlayerName}
                  onChange={(e) => setJoinPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleJoinRoom}
                disabled={
                  !joinRoomId.trim() || !joinPlayerName.trim() || isJoining
                }
                variant="outline"
              >
                {isJoining ? "Joining..." : "Join Room"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Fibonacci Sequence: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
          </p>
          <p>Special cards: ? (unsure) • ☕ (break needed)</p>
        </div>
      </div>
    </div>
  );
}
