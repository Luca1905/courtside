import type { Doc } from "~/convex/_generated/dataModel";
import type { MatchWithOpponentRecord } from "~/convex/matches";

export const calculatePerformanceStats = (matches: Doc<"matches">[]) => {
  const totalMatches = matches.length;
  const wins = matches.filter((match) => match.score.won).length;
  const losses = totalMatches - wins;
  const winPercentage =
    totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const totalDuration = matches.reduce((sum, match) => sum + match.duration, 0);
  const averageMatchDuration =
    totalMatches > 0 ? Math.round(totalDuration / totalMatches) : 0;

  // Calculate surface statistics
  const surfaceStats: {
    [key: string]: { matches: number; wins: number; winPercentage: number };
  } = {};

  matches.forEach((match) => {
    if (!surfaceStats[match.surface]) {
      surfaceStats[match.surface] = { matches: 0, wins: 0, winPercentage: 0 };
    }
    surfaceStats[match.surface].matches++;
    if (match.score.won) {
      surfaceStats[match.surface].wins++;
    }
  });

  // Calculate win percentages for each surface
  Object.keys(surfaceStats).forEach((surface) => {
    const stats = surfaceStats[surface];
    stats.winPercentage =
      stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 100) : 0;
  });

  return {
    totalMatches,
    wins,
    losses,
    winPercentage,
    averageMatchDuration,
    surfaceStats,
  };
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getHeadToHeadRecord = (
  matches: MatchWithOpponentRecord[],
  opponentName: string
): { wins: number; losses: number } => {
  const h2hMatches = matches.filter(
    (match) => match.opponent.name === opponentName
  );
  const wins = h2hMatches.filter((match) => match.score.won).length;
  const losses = h2hMatches.length - wins;
  return { wins, losses };
};

export const sortMatches = (
  matches: MatchWithOpponentRecord[],
  sortBy: "date" | "opponent" | "venue"
): MatchWithOpponentRecord[] => {
  return [...matches].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "opponent":
        return a.opponent.name.localeCompare(b.opponent.name);
      case "venue":
        return a.venue.name.localeCompare(b.venue.name);
      default:
        return 0;
    }
  });
};

export const filterMatches = (
  matches: MatchWithOpponentRecord[],
  filters: {
    surface?: string;
    opponent?: string;
    venueName?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): MatchWithOpponentRecord[] => {
  return matches.filter((match) => {
    if (filters.surface && match.surface !== filters.surface) return false;
    if (
      filters.opponent &&
      !match.opponent.name
        .toLowerCase()
        .includes(filters.opponent.toLowerCase())
    )
      return false;
    if (
      filters.venueName &&
      !match.venue.name.toLowerCase().includes(filters.venueName.toLowerCase())
    )
      return false;
    if (filters.dateFrom && new Date(match.date) < new Date(filters.dateFrom))
      return false;
    if (filters.dateTo && new Date(match.date) > new Date(filters.dateTo))
      return false;
    return true;
  });
};
