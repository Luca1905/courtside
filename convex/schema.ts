import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const PointsSummary = v.object({
  count: v.number(),
  won: v.number(),
});

const Breakdown = v.object({
  firstServe: v.number(),
  secondServe: v.number(),
  total: v.number(),
});

const Outcome = v.object({
  winners: v.object({
    fh: v.number(),
    bh: v.number(),
  }),
  forcedErrors: v.object({
    fh: v.number(),
    bh: v.number(),
  }),
  unforcedErrors: v.object({
    fh: v.number(),
    bh: v.number(),
  }),
});

const StatsSchema = v.object({
  overall: v.object({
    aces: v.number(),
    doubleFaults: v.number(),
    firstServes: v.object({
      in: v.number(),
      total: v.number(),
    }),
    firstServeWon: PointsSummary,
    secondServeWon: PointsSummary,
    netPoints: PointsSummary,
    breakPoints: PointsSummary,
    receivingPoints: PointsSummary,
    winners: v.number(),
    unforcedError: v.number(),
    totalPoints: PointsSummary,
  }),
  serve: v.object({
    aces: Breakdown,
    serviceWinners: Breakdown,
    doubleFaults: Breakdown,
    totalPoints: Breakdown,
    totalPointsWon: Breakdown,
    serviceGames: v.number(),
  }),
  return: v.object({
    returnWinners: Breakdown,
    returnUnforcedErrors: Breakdown,
    returnPoints: Breakdown,
    returnPointsWon: Breakdown,
  }),
  rally: v.object({
    approachShots: Outcome,
    dropShots: Outcome,
    groundStrokes: Outcome,
    lobs: Outcome,
    overheadStroke: Outcome,
    passingShot: Outcome,
    volleys: Outcome,
  }),
});

export default defineSchema({
  matches: defineTable({
    players: v.object({ guest: v.id("players"), home: v.id("players") }),
    type: v.union(v.literal("Singles"), v.literal("Doubles")),

    surface: v.union(v.literal("Hard"), v.literal("Clay"), v.literal("Grass")),
    venue: v.object({
      name: v.string(),
      coordinates: v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
    }),

    date: v.string(),
    startTime: v.number(),
    endTime: v.number(),

    sets: v.array(v.object({ guest: v.number(), home: v.number() })),
    winner: v.union(v.literal("Home"), v.literal("Guest")),

    weather: v.object({
      temperature: v.number(),
      windSpeed: v.number(),
      precipitation: v.number(),
      humidity: v.number(),
    }),

    stats: v.optional(
      v.object({
        player: StatsSchema,
        opponent: StatsSchema,
      })
    ),
  })
    .index("by_date", ["date"])
    .index("by_homePlayerId", ["players.home"])
    .index("by_guestPlayerId", ["players.guest"]),

  players: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    club: v.optional(v.string()),
    ranking: v.optional(v.number()),
    hittingArm: v.optional(v.union(v.literal("Left"), v.literal("Right"))),
    backhandGrip: v.optional(
      v.union(v.literal("One-Handed"), v.literal("Two-Handed"))
    ),
    playingSince: v.optional(v.number()),
    birthYear: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  ...authTables,
});
