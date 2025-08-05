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
    date: v.string(),
    type: v.union(v.literal("Singles"), v.literal("Doubles")),
    opponentId: v.id("players"),
    venue: v.object({
      name: v.string(),
      coordinates: v.object({
        latitude: v.number(),
        longitude: v.number(),
      }),
    }),
    surface: v.union(v.literal("Clay"), v.literal("Hard"), v.literal("Grass")),
    startTime: v.number(),
    endTime: v.number(),
    sets: v.array(v.object({ guest: v.number(), home: v.number() })),
    won: v.union(v.literal("guest"), v.literal("home")),
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
    .index("by_opponent", ["opponentId"]),

  players: defineTable({
    name: v.string(),
    club: v.optional(v.string()),
    ranking: v.optional(v.number()),
    hittingArm: v.optional(v.union(v.literal("Right"), v.literal("Left"))),
    backhandGrip: v.optional(
      v.union(v.literal("Two-Handed"), v.literal("One-Handed"))
    ),
    playingSince: v.optional(v.number()),
    birthYear: v.optional(v.number()),
  }),
});
