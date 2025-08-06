import { getAuthUserId } from "@convex-dev/auth/server";
import { WithoutSystemFields } from "convex/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";
import { getAllMatchesPlayedForPlayer } from "./matches";

export type PlayerRecord = Doc<"players">;

// --- Helpers --------------------------------------------------
export async function retrieveCurrentUserId(
  ctx: QueryCtx
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}
export async function getPlayerForUserId(
  ctx: QueryCtx,
  userId: Id<"users">
): Promise<Doc<"players"> | null> {
  return await ctx.db
    .query("players")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
}

export async function fetchPlayerById(
  ctx: QueryCtx,
  playerId: Id<"players">
): Promise<PlayerRecord | null> {
  return await ctx.db
    .query("players")
    .withIndex("by_id", (q) => q.eq("_id", playerId))
    .first();
}

async function getUserIdForPlayerId(
  ctx: QueryCtx,
  playerId: Id<"players">
): Promise<Id<"users"> | null> {
  const player = await ctx.db
    .query("players")
    .withIndex("by_id", (q) => q.eq("_id", playerId))
    .first();

  return player?.userId ?? null;
}

// --- Queries --------------------------------------------------
export const currentUserId = query({
  args: {},
  handler: async (ctx) => {
    return await retrieveCurrentUserId(ctx);
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const getById = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, { playerId }) => {
    return await ctx.db
      .query("players")
      .withIndex("by_id", (q) => q.eq("_id", playerId))
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("players").collect();
  },
});

export const getResultForPlayer = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, { playerId }) => {
    const userId = await retrieveCurrentUserId(ctx);
    if (!userId) {
      return undefined;
    }

    const playerForUser = await getPlayerForUserId(ctx, userId);
    if (!playerForUser) {
      return null;
    }

    const playedMatches = await getAllMatchesPlayedForPlayer(ctx, playerId);
    if (!playedMatches) {
      return null;
    }

    const results = playedMatches.reduce(
      (acc, { winner, players }) => {
        const winnerId = winner === "Home" ? players.home : players.guest;
        const won = winnerId === playerForUser._id;
        if (won) acc.wins++;
        else acc.losses++;
        return acc;
      },
      { wins: 0, losses: 0 }
    );

    return results;
  },
});

export const getForCurrentUser = query({
  handler: async (ctx) => {
    const userId = await retrieveCurrentUserId(ctx);
    if (!userId) {
      return null;
    }
    return await getPlayerForUserId(ctx, userId);
  },
});

// --- Mutations --------------------------------------------------

export const addPlayer = mutation({
  handler: async (ctx, data: WithoutSystemFields<Doc<"players">>) => {
    await ctx.db.insert("players", data);
  },
});
