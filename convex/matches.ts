import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";
import type { Prettify } from "../lib/utils";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const MATCHES_COLLECTION = "matches";
const PLAYERS_COLLECTION = "players";

export type MatchRecord = Doc<"matches">;
export type PlayerRecord = Doc<"players">;
export type MatchWithOpponentRecord = Prettify<
  MatchRecord & { opponent: PlayerRecord }
>;

// --- Helpers --------------------------------------------------

async function fetchMatchById(
  ctx: QueryCtx,
  matchId: Id<"matches">
): Promise<MatchRecord | null> {
  return await ctx.db
    .query(MATCHES_COLLECTION)
    .withIndex("by_id", (q) => q.eq("_id", matchId))
    .first();
}

async function fetchPlayerById(
  ctx: QueryCtx,
  playerId: Id<"players">
): Promise<PlayerRecord | null> {
  return await ctx.db
    .query(PLAYERS_COLLECTION)
    .withIndex("by_id", (q) => q.eq("_id", playerId))
    .first();
}

async function populateMatchWithOpponent(
  ctx: QueryCtx,
  match: MatchRecord
): Promise<MatchWithOpponentRecord | null> {
  const opponentRecord = await fetchPlayerById(ctx, match.opponentId);
  if (!opponentRecord) return null;
  return { ...match, opponent: opponentRecord };
}

// --- Queries --------------------------------------------------

export const getAllMatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query(MATCHES_COLLECTION).collect();
  },
});

export const getAllMatchesWithOpponent = query({
  args: {},
  handler: async (ctx) => {
    const rawMatches = await ctx.db.query(MATCHES_COLLECTION).collect();
    const matchesWithOpponent = await Promise.all(
      rawMatches.map((match) => populateMatchWithOpponent(ctx, match))
    );
    return matchesWithOpponent.filter(
      (match): match is MatchWithOpponentRecord => match !== null
    );
  },
});

export const getMatchesAgainstOpponent = query({
  args: { opponentId: v.id("players") },
  handler: async (ctx, { opponentId }) => {
    const matches = await ctx.db
      .query(MATCHES_COLLECTION)
      .filter((q) => q.eq(q.field("opponentId"), opponentId))
      .collect();

    const matchesWithOpponent = await Promise.all(
      matches.map((match) => populateMatchWithOpponent(ctx, match))
    );

    return matchesWithOpponent.filter(
      (m): m is MatchWithOpponentRecord => m !== null
    );
  },
});

export const getMatchById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    return await fetchMatchById(ctx, matchId);
  },
});

export const getMatchesByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query(MATCHES_COLLECTION)
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
  },
});

export const getMatchWithOpponentById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await fetchMatchById(ctx, matchId);
    if (!match) return null;
    return await populateMatchWithOpponent(ctx, match);
  },
});

// --- Mutations --------------------------------------------------

export const addMatch = mutation({
  handler: async (ctx, match: WithoutSystemFields<Doc<"matches">>) => {
    await ctx.db.insert("matches", match);
  },
});
