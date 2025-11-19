"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Room, VOTE_OPTIONS } from "@/lib/types";
import { calculateAverage, getMostVoted } from "@/lib/room-utils";
import { Copy, Eye, EyeOff, RotateCcw, Users } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const playerId = searchParams.get("playerId");

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}`);
      if (!response.ok) {
        throw new Error("Room not found");
      }
      const data = await response.json();
      setRoom(data);
      setError(null);
    } catch (err) {
      setError("Failed to load room");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();

    if (playerId) {
      const interval = setInterval(fetchRoom, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, roomId]);

  // Show join dialog after room is loaded
  useEffect(() => {
    if (!playerId && room && !loading) {
      setShowJoinDialog(true);
    }
  }, [playerId, room, loading]);

  const handleVote = async (vote: string) => {
    if (!playerId) return;

    try {
      await fetch(`/api/rooms/${roomId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, vote }),
      });
      fetchRoom();
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const handleReveal = async () => {
    try {
      await fetch(`/api/rooms/${roomId}/reveal`, {
        method: "POST",
      });
      fetchRoom();
    } catch (err) {
      console.error("Failed to reveal:", err);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`/api/rooms/${roomId}/reset`, {
        method: "POST",
      });
      fetchRoom();
    } catch (err) {
      console.error("Failed to reset:", err);
    }
  };

  const copyRoomLink = () => {
    const link = window.location.origin + `/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = async (asSpectator: boolean) => {
    if (!joinName.trim()) return;

    setIsJoining(true);
    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          playerName: joinName,
          isSpectator: asSpectator,
        }),
      });

      const data = await response.json();
      if (data.playerId) {
        // Update URL with playerId
        router.push(`/room/${roomId}?playerId=${data.playerId}`);
        setShowJoinDialog(false);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Failed to join room. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-2xl font-semibold">Loading room...</div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="text-2xl font-semibold text-red-500">
            {error || "Room not found"}
          </div>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Show join dialog if no playerId
  if (!playerId && showJoinDialog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Dialog
          open={showJoinDialog}
          onOpenChange={(open) => {
            setShowJoinDialog(open);
            if (!open) router.push("/");
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join Room: {room.name}</DialogTitle>
              <DialogDescription>
                Enter your name and choose how you want to participate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="join-name">Your Name</Label>
                <Input
                  id="join-name"
                  placeholder="John Doe"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJoinRoom(false)}
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <div className="text-sm font-medium">Join as:</div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleJoinRoom(false)}
                    disabled={!joinName.trim() || isJoining}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🗳️</span>
                    <div>
                      <div className="font-semibold">Voter</div>
                      <div className="text-xs opacity-90">
                        Can vote on stories
                      </div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleJoinRoom(true)}
                    disabled={!joinName.trim() || isJoining}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">👁️</span>
                    <div>
                      <div className="font-semibold">Spectator</div>
                      <div className="text-xs opacity-90">Watch only</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);
  const activePlayers = room.players.filter((p) => !p.isSpectator);
  const allVoted =
    activePlayers.length > 0 && activePlayers.every((p) => p.vote !== null);
  const votes = room.revealed
    ? activePlayers.map((p) => p.vote!).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🃏 {room.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Room ID:{" "}
                <span className="font-mono font-semibold">{roomId}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyRoomLink} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="sm"
              >
                Leave Room
              </Button>
            </div>
          </div>
        </div>

        {/* Players Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players ({room.players.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleReveal}
                  disabled={!allVoted || room.revealed}
                  size="sm"
                >
                  {room.revealed ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {room.revealed ? "Revealed" : "Reveal"}
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    player.id === playerId
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {player.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {player.name}
                      {player.id === playerId && " (You)"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {player.isSpectator ? (
                        <Badge variant="secondary">Spectator</Badge>
                      ) : room.revealed && player.vote ? (
                        <Badge className="text-lg font-bold">
                          {player.vote}
                        </Badge>
                      ) : player.vote ? (
                        <Badge variant="outline">✓ Voted</Badge>
                      ) : (
                        <Badge variant="outline">Waiting...</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voting Cards */}
        {!currentPlayer?.isSpectator && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Vote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-13 gap-3">
                {VOTE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleVote(option)}
                    disabled={room.revealed}
                    className={`aspect-3/4 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      currentPlayer?.vote === option
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white dark:bg-gray-800"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {currentPlayer?.vote && (
                <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  Your current vote:{" "}
                  <span className="font-bold text-lg">
                    {currentPlayer.vote}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {room.revealed && votes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Average
                  </div>
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {calculateAverage(votes)}
                  </div>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Most Voted
                  </div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {getMostVoted(votes)}
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Vote Distribution
                </div>
                <div className="flex flex-wrap gap-2">
                  {VOTE_OPTIONS.map((option) => {
                    const count = votes.filter((v) => v === option).length;
                    if (count === 0) return null;
                    return (
                      <div key={option} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-lg">
                          {option}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          × {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {allVoted && !room.revealed && (
          <div className="text-center py-8">
            <div className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
              ✓ All players have voted!
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Click &ldquo;Reveal&rdquo; to show the results
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
