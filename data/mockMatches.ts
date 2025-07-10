import { Match } from "@/types/match";

export const mockMatches: Match[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    date: "2025-06-20",
    opponent: {
      name: "Alex Johnson",
      club: "Riverside Tennis Club",
      ranking: 12
    },
    venue: "Riverside Stadium",
    surface: "Hard",
    duration: 125,
    score: {
      sets: ["6-4", "3-6", "7-5"],
      won: true
    },
    weather: {
      temperature: 24,
      windSpeed: 12,
      precipitation: 0,
      humidity: 58
    },
    statistics: {
      overall: {
        aces: 7,
        doubleFaults: 3,
        firstServes: { count: 65, won: 44 },
        secondServes: { count: 27, won: 14 },
        netPoints: { count: 30, won: 21 },
        breakPoints: { count: 7, won: 4 },
        receivingPoints: { count: 83, won: 46 },
        winners: 52,
        unforcedError: 18,
        totalPoints: { count: 142, won: 84 }
      },
      serve: {
        aces: { firstServe: 7, secondServe: 0, total: 7 },
        serviceWinners: { firstServe: 5, secondServe: 1, total: 6 },
        doubleFaults: { firstServe: 1, secondServe: 2, total: 3 },
        totalPoints: { firstServe: 65, secondServe: 27, total: 92 },
        totalPointsWon: { firstServe: 44, secondServe: 14, total: 58 },
        serviceGames: 9
      },
      return: {
        returnWinners: { firstServe: 10, secondServe: 4, total: 14 },
        returnUnforcedErrors: { firstServe: 8, secondServe: 6, total: 14 },
        returnPoints: { firstServe: 60, secondServe: 23, total: 83 },
        returnPointsWon: { firstServe: 30, secondServe: 16, total: 46 }
      },
      rally: {
        approachShots: {
          winners: { fh: 5, bh: 2 },
          forcedErrors: { fh: 3, bh: 1 },
          unforcedErrors: { fh: 2, bh: 3 }
        },
        dropShots: {
          winners: { fh: 1, bh: 0 },
          forcedErrors: { fh: 0, bh: 0 },
          unforcedErrors: { fh: 1, bh: 0 }
        },
        groundStrokes: {
          winners: { fh: 30, bh: 20 },
          forcedErrors: { fh: 15, bh: 10 },
          unforcedErrors: { fh: 12, bh: 8 }
        },
        lobs: {
          winners: { fh: 3, bh: 1 },
          forcedErrors: { fh: 2, bh: 1 },
          unforcedErrors: { fh: 1, bh: 0 }
        },
        overheadStroke: {
          winners: { fh: 2, bh: 0 },
          forcedErrors: { fh: 1, bh: 0 },
          unforcedErrors: { fh: 0, bh: 1 }
        },
        passingShot: {
          winners: { fh: 4, bh: 3 },
          forcedErrors: { fh: 2, bh: 1 },
          unforcedErrors: { fh: 1, bh: 2 }
        },
        volleys: {
          winners: { fh: 10, bh: 8 },
          forcedErrors: { fh: 4, bh: 3 },
          unforcedErrors: { fh: 3, bh: 2 }
        }
      }
    }
  }
];
