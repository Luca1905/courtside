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

export default defineSchema({
  matches: defineTable({
    date: v.string(),
    type: v.union(
      v.literal("Singles"),
      v.literal("Doubles"),
    ),
    opponentId: v.id("players"),
    venue: v.string(),
    surface: v.union(
      v.literal("Clay"),
      v.literal("Hard"),
      v.literal("Grass"),
    ),
    duration: v.number(),
    score: v.object({
      sets: v.array(v.string()),
      won: v.boolean(),
    }),
    weather: v.object({
      temperature: v.number(),
      windSpeed: v.number(),
      precipitation: v.number(),
      humidity: v.number(),
    }),
    statistics: v.object({
      overall: v.object({
        aces: v.number(),
        doubleFaults: v.number(),
        firstServes: PointsSummary,
        secondServes: PointsSummary,
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
    }),
  }).index("by_date", ["date"]),

  players: defineTable({
    name: v.string(),
    club: v.optional(v.string()),
    ranking: v.optional(v.number()),
    hittingArm: v.optional(
      v.union(
        v.literal("Right"),
        v.literal("Left"),
      )),
    backhandGrip: v.optional(
      v.union(
        v.literal("Two-Handed"),
        v.literal("One-Handed"),
      )),
  }),
});
