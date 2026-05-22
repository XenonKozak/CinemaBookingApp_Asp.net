import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axios';
import { theme } from '../theme/theme';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const auth = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = async () => {
    setError('');
    try {
      const response = await api.get('/Movie/with-screenings');
      // Tylko filmy, które mają zaplanowane seanse
      setMovies(response.data.filter(m => m.screenings && m.screenings.length > 0));
    } catch {
      setError('Nie udało się pobrać listy seansów. Upewnij się, że backend jest uruchomiony.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMovies();
    }, [])
  );

  const goToScreening = (id) => {
    if (!auth.isLoggedIn) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Screening', { id });
  };

  const renderHeader = () => (
    <View style={styles.heroBlock}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Odkryj najlepsze{'\n'}
          <Text style={styles.heroGradient}>seanse filmowe</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Wybierz film, zarezerwuj miejsce i ciesz się magią kina
        </Text>
      </View>
      {!loading && !error && movies.length > 0 && (
        <View style={styles.sectionBar}>
          <Text style={styles.sectionTitle}>Repertuar</Text>
          <Text style={styles.sectionCount}>{movies.length} filmów</Text>
        </View>
      )}
    </View>
  );

  const renderMovie = ({ item }) => {
    const sortedScreenings = [...item.screenings].sort((a, b) => new Date(a.screeningTime) - new Date(b.screeningTime));

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.poster} />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterIcon}>🎞️</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration} min</Text>
            </View>
          </View>
        </View>
        <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
        
        <View style={styles.screeningsSection}>
          <Text style={styles.screeningsTitle}>Dostępne godziny:</Text>
          <View style={styles.chipsContainer}>
            {sortedScreenings.map((s) => {
              const d = new Date(s.screeningTime);
              const timeStr = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
              const dateStr = d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
              return (
                <TouchableOpacity
                  key={s.id}
                  style={styles.chip}
                  onPress={() => goToScreening(s.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipDate}>{dateStr}</Text>
                  <Text style={styles.chipTime}>{timeStr}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <NavBar navigation={navigation} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accentGold} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchMovies}>
            <Text style={styles.retryBtnText}>Spróbuj ponownie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id}
          renderItem={renderMovie}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMovies();
              }}
              tintColor={theme.colors.accentGold}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🎬</Text>
              <Text style={styles.emptyText}>Brak dostępnych filmów z seansami</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  heroBlock: {
    marginBottom: 8,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: theme.spacing.md,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroGradient: {
    color: theme.colors.accentGoldLight,
  },
  heroSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  sectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.lg,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bgGlass,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sectionCount: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.bgGlass,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgInput,
  },
  posterPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgInput,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterIcon: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(226, 172, 85, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(226, 172, 85, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: {
    color: theme.colors.accentGold,
    fontSize: 12,
    fontWeight: '700',
  },
  desc: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  screeningsSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  screeningsTitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.bgInput,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipDate: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginBottom: 2,
  },
  chipTime: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: theme.colors.bgInput,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  retryBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
});
