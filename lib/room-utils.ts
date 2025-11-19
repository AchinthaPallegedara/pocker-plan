export function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generatePlayerId(): string {
  return `player-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateAverage(votes: string[]): string {
  const numericVotes = votes
    .filter((vote) => vote !== "?" && vote !== "☕")
    .map((vote) => parseFloat(vote))
    .filter((vote) => !isNaN(vote));

  if (numericVotes.length === 0) return "N/A";

  const sum = numericVotes.reduce((acc, vote) => acc + vote, 0);
  const average = sum / numericVotes.length;

  return average.toFixed(1);
}

export function getMostVoted(votes: string[]): string {
  if (votes.length === 0) return "N/A";

  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(voteCounts));
  const mostVoted = Object.entries(voteCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([vote]) => vote);

  return mostVoted.join(", ");
}
