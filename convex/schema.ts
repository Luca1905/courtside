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

function enumLiteral(literals: string[]) {
  return v.union(
    ...literals.map((l) => {
      return v.literal(l);
    })
  );
}

export default defineSchema({
  matches: defineTable({
    opponentId: v.id("players"),
    type: enumLiteral(["Singles", "Doubles"]),

    surface: enumLiteral(["Hard", "Clay", "Grass"]),
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
    winner: enumLiteral(["Home", "Guest"]),
    playerTeam: enumLiteral(["Home", "Guest"]),

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
    hittingArm: v.optional(enumLiteral(["Left", "Right"])),
    backhandGrip: v.optional(enumLiteral(["One-Handed", "Two-Handed"])),
    playingSince: v.optional(v.number()),
    birthYear: v.optional(v.number()),
  }),
});
