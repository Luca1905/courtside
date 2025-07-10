import { Match } from "~/types/match";
import { TrendingDown, Trophy } from "lucide-react-native";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.95}>
      <View style={styles.header}>
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultBadge,
              match.score.won ? styles.wonBadge : styles.lostBadge,
            ]}
          >
            {match.score.won ? (
              <Trophy size={14} color="#ffffff" />
            ) : (
              <TrendingDown size={14} color="#ffffff" />
            )}
            <Text style={styles.resultText}>
              {match.score.won ? "Won" : "Lost"}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.surfaceBadge,
            styles[`surface${match.surface}`],
          ]}
        >
          <Text style={styles.surfaceText}>{match.surface}</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.opponentSection}>
          <View style={styles.nameRow}>
            <Text style={styles.opponentName}>{match.opponent.name}</Text>
            <Text style={styles.lkBadge}>LK {match.opponent.ranking}</Text>
          </View>
          <Text style={styles.opponentClub}>{match.opponent.club}</Text>
        </View>

        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.score}>{match.score.sets.join("  ")}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{match.duration}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{match.statistics.overall.aces}</Text>
          <Text style={styles.statLabel}>Aces</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resultContainer: {
    flex: 1,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  wonBadge: {
    backgroundColor: "#10B981",
  },
  lostBadge: {
    backgroundColor: "#EF4444",
  },
  resultText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  surfaceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: "center",
  },
  surfaceHard: {
    backgroundColor: "#3B82F6",
  },
  surfaceClay: {
    backgroundColor: "#F59E0B",
  },
  surfaceGrass: {
    backgroundColor: "#22C55E",
  },
  surfaceText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  mainContent: {
    marginBottom: 20,
  },
  opponentSection: {
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  opponentName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  lkBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  opponentClub: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  score: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
