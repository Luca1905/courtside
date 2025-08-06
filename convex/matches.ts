import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";
import type { Prettify } from "../lib/utils";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  fetchPlayerById,
  getPlayerForUserId,
  PlayerRecord,
  retrieveCurrentUserId,
} from "./players";

export type MatchRecord = Doc<"matches">;
export type MatchWithOpponentRecord = Prettify<
  MatchRecord & { opponent: PlayerRecord }
>;

// --- Helpers --------------------------------------------------

async function fetchMatchById(
  ctx: QueryCtx,
  matchId: Id<"matches">
): Promise<MatchRecord | null> {
  return await ctx.db
    .query("matches")
    .withIndex("by_id", (q) => q.eq("_id", matchId))
    .first();
}

async function populateMatchWithOpponent(
  ctx: QueryCtx,
  match: MatchRecord,
  opponentTeam: MatchRecord["winner"]
): Promise<MatchWithOpponentRecord | null> {
  const opponentRecord = await fetchPlayerById(
    ctx,
    opponentTeam === "Guest" ? match.players.guest : match.players.home
  );
  if (!opponentRecord) return null;
  return { ...match, opponent: opponentRecord };
}

export async function getAllMatchesPlayedForPlayer(
  ctx: QueryCtx,
  playerId: Id<"players">
): Promise<MatchRecord[] | null> {
  const matchesAsGuestPromise = ctx.db
    .query("matches")
    .withIndex("by_guestPlayerId", (q) => q.eq("players.guest", playerId))
    .order("asc")
    .collect();

  const matchesAsHomePromise = ctx.db
    .query("matches")
    .withIndex("by_homePlayerId", (q) => q.eq("players.home", playerId))
    .order("asc")
    .collect();

  return (
    await Promise.all([matchesAsGuestPromise, matchesAsHomePromise])
  ).flat();
}

// --- Queries --------------------------------------------------

export const getAllMatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("matches").collect();
  },
});

export const getAllMatchesWithOpponent = query({
  args: {},
  handler: async (ctx) => {
    const rawMatches = await ctx.db.query("matches").collect();
    const userId = await retrieveCurrentUserId(ctx);
    if (!userId) {
      return null;
    }
    const playerForUser = await getPlayerForUserId(ctx, userId);
    if (!playerForUser) {
      return null;
    }
    const matchesWithOpponent = await Promise.all(
      rawMatches.map((match) =>
        populateMatchWithOpponent(
          ctx,
          match,
          playerForUser._id === match.players.guest ? "Guest" : "Home"
        )
      )
    );
    return matchesWithOpponent.filter(
      (match): match is MatchWithOpponentRecord => match !== null
    );
  },
});

export const getMatchesAgainstPlayer = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    const matches = await getAllMatchesPlayedForPlayer(ctx, playerId);
    if (!matches) {
      return null;
    }
    const userId = await retrieveCurrentUserId(ctx);
    if (!userId) {
      return null;
    }
    const playerForUser = await getPlayerForUserId(ctx, userId);
    if (!playerForUser) {
      return null;
    }

    const matchesWithOpponent = await Promise.all(
      matches.map((match) =>
        populateMatchWithOpponent(
          ctx,
          match,
          playerForUser._id === match.players.guest ? "Guest" : "Home"
        )
      )
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
      .query("matches")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
  },
});

export const getMatchWithOpponentById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await fetchMatchById(ctx, matchId);
    const userId = await retrieveCurrentUserId(ctx);
    if (!userId) {
      return null;
    }
    const playerForUser = await getPlayerForUserId(ctx, userId);
    if (!playerForUser) {
      return null;
    }
    if (!match) return null;
    return await populateMatchWithOpponent(
      ctx,
      match,
      playerForUser._id === match.players.guest ? "Guest" : "Home"
    );
  },
});

// --- Mutations --------------------------------------------------

export const addMatch = mutation({
  handler: async (ctx, match: WithoutSystemFields<Doc<"matches">>) => {
    await ctx.db.insert("matches", match);
  },
});
