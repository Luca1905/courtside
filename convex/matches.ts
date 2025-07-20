import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("matches").collect();
  },
});

export const getById = query({
  args: {
    id: v.id('matches'),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_id", (q) => q.eq("_id", id))
      .first();
  }
})

export const getByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();
  },
})

export type MatchWithOpponent = Doc<"matches"> & {
  opponent: Doc<"players">;
};

export const getMatchWithOpponent = query({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, { matchId }): Promise<MatchWithOpponent | null> => {
    const match = await ctx.db
      .query("matches")
      .withIndex("by_id", (q) => q.eq("_id", matchId))
      .first();
    if (!match) return null;
    const opponent = await ctx.db
      .query("players")
      .withIndex("by_id", (q) => q.eq("_id", match.opponentId))
      .first();
    if (!opponent) return null;
    return {
      ...match,
      opponent: opponent
    }
  }
})
