import { v } from "convex/values";
import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("matches").collect();
  },
});

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
