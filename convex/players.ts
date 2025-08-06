import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { WithoutSystemFields } from "convex/server";
import { Doc } from "./_generated/dataModel";

// --- Queries --------------------------------------------------

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
    const playedMatches = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("opponentId"), playerId))
      .collect();
    const results = playedMatches.reduce(
      (acc, { winner, playerTeam }) => {
        const won = winner === playerTeam;
        if (won) acc.wins++;
        else acc.losses++;
        return acc;
      },
      { wins: 0, losses: 0 }
    );

    return results;
  },
});

// --- Mutations --------------------------------------------------

export const addPlayer = mutation({
  handler: async (ctx, data: WithoutSystemFields<Doc<"players">>) => {
    await ctx.db.insert("players", data);
  },
});
