import { Match } from "@/types/match";
import { TrendingDown, Trophy } from "lucide-react-native";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultBadge, match.score.won ? styles.wonBadge : styles.lostBadge]}>
            {match.score.won ? (
              <Trophy size={16} color="#ffffff" />
            ) : (
              <TrendingDown size={16} color="#ffffff" />
            )}
            <Text style={styles.resultText}>
              {match.score.won ? "Won" : "Lost"}
            </Text>
          </View>
          <Text style={styles.score}>
            {match.score.sets.join(' ')}
          </Text>
        </View>
        <View style={styles.surfaceContainer}>
          <View style={[styles.surfaceBadge, styles[`surface${match.surface}`]]}>
            <Text style={styles.surfaceText}>
              {match.surface}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.opponentSection}>
        <Text style={styles.opponentName}>{match.opponent.name}</Text>
        <Text style={styles.opponentClub}>{match.opponent.club}</Text>
        <Text style={styles.opponentRanking}>{match.opponent.ranking}</Text>
      </View>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultContainer: {
    flex: 1,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  wonBadge: {
    backgroundColor: '#2D5016',
  },
  lostBadge: {
    backgroundColor: '#DC2626',
  },
  resultText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  score: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
  },
  surfaceContainer: {
    alignItems: 'flex-end',
  },
  surfaceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  surfaceHard: {
    backgroundColor: '#3B82F6',
  },
  surfaceClay: {
    backgroundColor: '#DC2626',
  },
  surfaceGrass: {
    backgroundColor: '#16A34A',
  },
  surfaceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  opponentSection: {
    marginBottom: 12,
  },
  opponentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  opponentClub: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  opponentRanking: {
    fontSize: 12,
    color: '#888888',
  },
  matchInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  duration: {
    fontSize: 12,
    color: '#888888',
  },
  aces: {
    fontSize: 12,
    color: '#888888',
  },
});
