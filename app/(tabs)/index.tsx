import { SafeAreaView, StyleSheet, Text, View, FlatList } from 'react-native';

import { mockMatches } from '@/data/mockMatches';
import { MatchCard } from '@/components/MatchCard';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Match History</Text>
      </View>

      <FlatList
        data={mockMatches}
        renderItem={({ item }) => (
          <MatchCard match={item} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  controlButtonActive: {
    backgroundColor: '#2D5016',
    borderColor: '#2D5016',
  },
  controlButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  controlButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100,
  },
});
