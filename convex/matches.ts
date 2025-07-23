import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

const MATCHES = "matches";
const PLAYERS = "players";

export type Match = Doc<"matches">;
export type Player = Doc<"players">;
export type MatchWithOpponent = Match & { opponent: Player };

// --- Helpers --------------------------------------------------

async function fetchMatchById(
  ctx: QueryCtx,
  id: Id<"matches">
): Promise<Match | null> {
  return await ctx.db
    .query(MATCHES)
    .withIndex("by_id", (q) => q.eq("_id", id))
    .first();
}

async function fetchPlayerById(
  ctx: QueryCtx,
  id: Id<"players">
): Promise<Player | null> {
  return await ctx.db
    .query(PLAYERS)
    .withIndex("by_id", (q) => q.eq("_id", id))
    .first();
}

async function attachOpponent(
  ctx: QueryCtx,
  match: Doc<"matches">
): Promise<MatchWithOpponent | null> {
  const opponent = await fetchPlayerById(ctx, match.opponentId);
  if (!opponent) return null;
  return { ...match, opponent };
}

// --- Queries --------------------------------------------------

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query(MATCHES).collect();
  },
});

export const getAllWithOpponent = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query(MATCHES).collect();
    const enriched = await Promise.all(
      matches.map((m) => attachOpponent(ctx, m))
    );
    return enriched.filter((m): m is MatchWithOpponent => m !== null);
  },
});

export const getById = query({
  args: { id: v.id("matches") },
  handler: async (ctx, { id }) => {
    return await fetchMatchById(ctx, id);
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query(MATCHES)
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
  },
});

export const getMatchWithOpponent = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await fetchMatchById(ctx, matchId);
    if (!match) return null;
    return await attachOpponent(ctx, match);
  },
});
