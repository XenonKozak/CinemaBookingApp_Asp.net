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
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axios';
import { theme } from '../theme/theme';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import {
  parseScreeningTime,
  formatScreeningClock,
  formatScreeningDayShort,
  getMovieScreenings,
  buildRepertoire,
} from '../utils/screeningTime';

export default function HomeScreen({ navigation }) {
  const auth = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMovies = async () => {
    setError('');
    try {
      const bust = Date.now();
      const [moviesRes, screeningsRes] = await Promise.all([
        api.get('/Movie', { params: { _: bust } }),
        api.get('/Screening', { params: { _: bust } }),
      ]);
      setMovies(buildRepertoire(moviesRes.data, screeningsRes.data));
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
    const sortedScreenings = [...getMovieScreenings(item)].sort(
      (a, b) => parseScreeningTime(a.screeningTime) - parseScreeningTime(b.screeningTime)
    );

    return (
      <Pressable style={({ pressed }) => [styles.card, { padding: 0, overflow: 'hidden', transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
        <View style={styles.cardHeader}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.posterFull} resizeMode="cover" />
          ) : (
            <View style={styles.posterPlaceholderFull}>
              <Text style={styles.posterIcon}>🎞️</Text>
            </View>
          )}
          <View style={styles.durationBadgeOverlay}>
            <Text style={styles.durationTextOverlay}>⏱ {item.duration} min</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
          
          <View style={styles.screeningsSection}>
          <View style={styles.timesRow}>
            {sortedScreenings.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.timePill}
                onPress={() => goToScreening(s.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.timePillClock}>{formatScreeningClock(s.screeningTime)}</Text>
                <Text style={styles.timePillDot}> · </Text>
                <Text style={styles.timePillDay}>{formatScreeningDayShort(s.screeningTime)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Pressable>
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
  cardHeader: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.bgInput,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  posterFull: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholderFull: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadgeOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(10, 10, 26, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  durationTextOverlay: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 28,
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
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  timePillClock: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  timePillDot: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  timePillDay: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
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
