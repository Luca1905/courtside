import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPlayerStats = query({
  args: { playerId: v.id("players") },
  returns: v.object({
    current: v.object({
      aces: v.number(),
      doubleFaults: v.number(),
      firstServePercentage: v.number(),
      firstServeWonPercentage: v.number(),
    }),
    trend: v.object({
      aces: v.number(),
      doubleFaults: v.number(),
      firstServePercentage: v.number(),
      firstServeWonPercentage: v.number(),
    }),
    history: v.object({
      firstServeWonPercentage: v.array(v.number()),
    }),
  }),
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_opponent", (q) => q.eq("opponentId", args.playerId))
      .order("asc")
      .collect();

    const playerMatchStats = [];
    let totalAces = 0;
    let totalDoubleFaults = 0;
    let totalFirstServeIn = 0;
    let totalFirstServeTotal = 0;
    let totalFirstServeWon = 0;
    let totalFirstServeInForWon = 0;

    for (const match of matches) {
      const stats = match.stats.player;
      const firstServePct =
        stats.overall.firstServes.total > 0
          ? Math.round(
              (stats.overall.firstServes.in / stats.overall.firstServes.total) *
                100
            )
          : 0;
      const firstServeWonPct =
        stats.overall.firstServeWon.count > 0
          ? Math.round(
              (stats.overall.firstServeWon.won /
                stats.overall.firstServeWon.count) *
                100
            )
          : 0;

      playerMatchStats.push({
        aces: stats.serve.aces.total,
        doubleFaults: stats.serve.doubleFaults.total,
        firstServePercentage: firstServePct,
        firstServeWonPercentage: firstServeWonPct,
      });

      totalAces += stats.serve.aces.total;
      totalDoubleFaults += stats.serve.doubleFaults.total;
      totalFirstServeIn += stats.overall.firstServes.in;
      totalFirstServeTotal += stats.overall.firstServes.total;
      totalFirstServeWon += stats.overall.firstServeWon.won;
      totalFirstServeInForWon += stats.overall.firstServeWon.count;
    }

    const numMatches = matches.length;

    const current = {
      aces: numMatches > 0 ? Math.round(totalAces / numMatches) : 0,
      doubleFaults:
        numMatches > 0 ? Math.round(totalDoubleFaults / numMatches) : 0,
      firstServePercentage:
        totalFirstServeTotal > 0
          ? Math.round((totalFirstServeIn / totalFirstServeTotal) * 100)
          : 0,
      firstServeWonPercentage:
        totalFirstServeInForWon > 0
          ? Math.round((totalFirstServeWon / totalFirstServeInForWon) * 100)
          : 0,
    };

    const trend = {
      aces: 0,
      doubleFaults: 0,
      firstServePercentage: 0,
      firstServeWonPercentage: 0,
    };
    if (numMatches >= 2) {
      const last = playerMatchStats[playerMatchStats.length - 1];
      const prev = playerMatchStats[playerMatchStats.length - 2];
      trend.aces = last.aces - prev.aces;
      trend.doubleFaults = last.doubleFaults - prev.doubleFaults;
      trend.firstServePercentage =
        last.firstServePercentage - prev.firstServePercentage;
      trend.firstServeWonPercentage =
        last.firstServeWonPercentage - prev.firstServeWonPercentage;
    }

    const historyData = Array(5).fill(0);
    const numHistory = Math.min(5, playerMatchStats.length);
    for (let i = 0; i < numHistory; i++) {
      historyData[5 - numHistory + i] =
        playerMatchStats[
          playerMatchStats.length - numHistory + i
        ].firstServeWonPercentage;
    }

    return {
      current,
      trend,
      history: {
        firstServeWonPercentage: historyData,
      },
    };
  },
});
