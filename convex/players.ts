import { v } from "convex/values";
import { query } from "./_generated/server";

export const getById = query({
  args: {
    playerId: v.id("players"),
  },
  handler: async (ctx, { playerId }) => {
    return await ctx.db
      .query("players")
      .withIndex("by_id", (q) => q.eq("_id",  playerId))
      .first();
  },
});

