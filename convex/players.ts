import { v } from "convex/values";
import { query } from "./_generated/server";

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
