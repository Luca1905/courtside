import { Match } from "@/types/match";

export const mockMatches: Match[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    date: "2025-06-20",
    opponent: {
      name: "Alex Johnson",
      club: "Riverside Tennis Club",
      ranking: 76
    },
    venue: "Riverside Stadium",
    surface: "Hard",
    duration: 125, // minutes
    score: {
      sets: ["6-4", "3-6", "7-5"],
      won: true
    },
    weather: {
      temperature: 24,    // °C
      windSpeed: 12,      // km/h
      precipitation: 0,   // mm
      humidity: 58        // %
    },
    statistics: {
      overall: {
        aces: 7,
        doubleFaults: 3,
        firstServes: {
          count: 65,
          won: 44
        },
        secondServes: {
          count: 27,
          won: 14
        },
        netPoints: {
          count: 30,
          won: 21
        },
        breakPoints: {
          count: 7,
          won: 4
        },
        receivingPoints: {
          count: 83,
          won: 46
        },
        winners: 52,
        unforcedError: 18,
        totalPoints: {
          count: 142,
          won: 84
        }
      }
    }
  },
]
