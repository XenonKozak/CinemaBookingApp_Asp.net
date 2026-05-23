import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/axios';
import { theme } from '../theme/theme';
import { Feather } from '@expo/vector-icons';
import AdminMovieForm from '../components/AdminMovieForm';
import AdminScreeningForm from '../components/AdminScreeningForm';
import { formatScreeningDateTime, toApiScreeningTime } from '../utils/screeningTime';
import NavBar from '../components/NavBar';

export default function AdminScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('movies');

  const [movies, setMovies] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [movieFormVisible, setMovieFormVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [screeningFormVisible, setScreeningFormVisible] = useState(false);
  const [editingScreening, setEditingScreening] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moviesRes, screeningsRes] = await Promise.all([
        api.get('/Movie'),
        api.get('/Screening')
      ]);
      setMovies(moviesRes.data);
      setScreenings(screeningsRes.data);
    } catch {
      Alert.alert('Błąd', 'Nie udało się pobrać danych z serwera.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const getMovieTitle = (id) => {
    const m = movies.find(x => x.id === id);
    return m ? m.title : 'Nieznany film';
  };

  const getMoviePoster = (id) => {
    const m = movies.find(x => x.id === id);
    return m ? m.imageUrl : null;
  };

  const formatTime = (dateStr) => formatScreeningDateTime(dateStr);

  // Movies
  const handleMovieSubmit = async (data) => {
    setFormLoading(true);
    setFormError('');
    try {
      const { poster, ...movieData } = data;
      let movieId = editingMovie?.id;

      if (editingMovie) {
        await api.put(`/Movie/${movieId}`, movieData);
      } else {
        const res = await api.post('/Movie', movieData);
        movieId = res.data?.id || res.data?.Id;
      }

      if (poster && movieId) {
        const formData = new FormData();
        formData.append('file', {
          uri: poster.uri,
          name: poster.fileName || 'poster.jpg',
          type: poster.mimeType || 'image/jpeg',
        });
        await api.post(`/Movie/${movieId}/poster`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setMovieFormVisible(false);
      fetchData();
    } catch (e) {
      setFormError('Wystąpił błąd zapisu filmu.');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteMovie = (movie) => {
    Alert.alert('Usuń film', `Czy na pewno usunąć „${movie.title}”?\nWszystkie seanse zostaną usunięte!`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/Movie/${movie.id}`);
            fetchData();
          } catch {
            Alert.alert('Błąd', 'Nie udało się usunąć filmu.');
          }
        },
      },
    ]);
  };

  // Screenings
  const handleScreeningSubmit = async (data) => {
    setFormLoading(true);
    setFormError('');
    const payload = {
      movieId: data.movieId,
      screeningTime: toApiScreeningTime(data.screeningTime),
    };
    try {
      if (editingScreening) {
        await api.put(`/Screening/${editingScreening.id}`, payload);
      } else {
        await api.post('/Screening', payload);
      }
      setScreeningFormVisible(false);
      fetchData();
    } catch (e) {
      setFormError('Wystąpił błąd zapisu seansu.');
    } finally {
      setFormLoading(false);
    }
  };

  const deleteScreening = (screening) => {
    Alert.alert('Usuń seans', `Czy na pewno usunąć ten seans?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/Screening/${screening.id}`);
            fetchData();
          } catch {
            Alert.alert('Błąd', 'Nie udało się usunąć seansu.');
          }
        },
      },
    ]);
  };

  const renderMovie = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
        ) : (
          <View style={styles.thumbPlaceholder}><Feather name="film" size={24} color={theme.colors.textMuted} /></View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.duration} min</Text>
          </View>
        </View>
      </View>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => { setEditingMovie(item); setMovieFormVisible(true); }}>
          <Feather name="edit-2" size={14} color={theme.colors.textPrimary} style={{ marginRight: 6 }} />
          <Text style={styles.btnSecondaryText}>Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDanger} onPress={() => deleteMovie(item)}>
          <Feather name="trash-2" size={14} color={theme.colors.danger} style={{ marginRight: 6 }} />
          <Text style={styles.btnDangerText}>Usuń</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScreeningsGroup = ({ item: movie }) => {
    const movieScreenings = screenings.filter(s => s.movieId === movie.id);
    if (movieScreenings.length === 0) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {movie.imageUrl ? (
            <Image source={{ uri: movie.imageUrl }} style={styles.thumb} />
          ) : (
            <View style={styles.thumbPlaceholder}><Feather name="film" size={24} color={theme.colors.textMuted} /></View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.desc}>{movieScreenings.length} seansów</Text>
          </View>
        </View>
        <View style={styles.screeningsList}>
          {movieScreenings.map(s => (
            <View key={s.id} style={styles.screeningRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatTime(s.screeningTime)}</Text>
              </View>
              <View style={styles.screeningActions}>
                <TouchableOpacity onPress={() => { setEditingScreening(s); setScreeningFormVisible(true); }}>
                  <Feather name="edit-2" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteScreening(s)}>
                  <Feather name="trash-2" size={16} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <NavBar navigation={navigation} />

      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <Feather name="settings" size={32} color={theme.colors.textSecondary} />
        <View>
          <Text style={styles.headerTitle}>Panel <Text style={styles.gradient}>Administratora</Text></Text>
          <Text style={styles.headerSubtitle}>Zarządzaj filmami i seansami</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'movies' && styles.tabActive]} onPress={() => setActiveTab('movies')}>
          <Text style={[styles.tabText, activeTab === 'movies' && styles.tabTextActive]}>Filmy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'screenings' && styles.tabActive]} onPress={() => setActiveTab('screenings')}>
          <Text style={[styles.tabText, activeTab === 'screenings' && styles.tabTextActive]}>Seanse</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <Text style={styles.toolbarCount}>
          {activeTab === 'movies' ? `${movies.length} filmów` : `${screenings.length} seansów`}
        </Text>
        <TouchableOpacity
          style={[styles.btnAdd, activeTab === 'screenings' && movies.length === 0 && styles.btnAddDisabled]}
          disabled={activeTab === 'screenings' && movies.length === 0}
          onPress={() => {
            if (activeTab === 'movies') { setEditingMovie(null); setMovieFormVisible(true); }
            else { setEditingScreening(null); setScreeningFormVisible(true); }
          }}
        >
          <Text style={styles.btnAddText}>+ Dodaj {activeTab === 'movies' ? 'film' : 'seans'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={theme.colors.accentGold} /></View>
      ) : activeTab === 'movies' ? (
        <FlatList
          data={movies}
          keyExtractor={i => i.id}
          renderItem={renderMovie}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Brak filmów.</Text></View>}
        />
      ) : (
        <FlatList
          data={movies.filter(m => screenings.some(s => s.movieId === m.id))}
          keyExtractor={i => i.id}
          renderItem={renderScreeningsGroup}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Brak seansów.</Text></View>}
        />
      )}

      <AdminMovieForm
        visible={movieFormVisible}
        movie={editingMovie}
        loading={formLoading}
        error={formError}
        onClose={() => setMovieFormVisible(false)}
        onSubmit={handleMovieSubmit}
      />

      <AdminScreeningForm
        visible={screeningFormVisible}
        screening={editingScreening}
        movies={movies}
        loading={formLoading}
        error={formError}
        onClose={() => setScreeningFormVisible(false)}
        onSubmit={handleScreeningSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgPrimary },
  header: { padding: theme.spacing.lg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.textPrimary },
  gradient: { color: theme.colors.accentGold },
  headerSubtitle: { color: theme.colors.textSecondary, marginTop: 4 },
  tabs: { flexDirection: 'row', marginHorizontal: theme.spacing.lg, marginBottom: 16, gap: 12 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.colors.bgGlass, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999 },
  tabActive: { backgroundColor: theme.colors.accentGold, borderColor: theme.colors.accentGold },
  tabText: { color: theme.colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: theme.spacing.lg, marginBottom: 16, padding: 16, backgroundColor: theme.colors.bgGlass, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  toolbarCount: { color: theme.colors.textSecondary, fontWeight: '500' },
  btnAdd: { backgroundColor: theme.colors.accentGold, paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.sm },
  btnAddDisabled: { opacity: 0.5 },
  btnAddText: { color: '#000', fontWeight: '700' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: theme.colors.textSecondary },
  list: { paddingHorizontal: theme.spacing.lg, paddingBottom: 20 },
  card: { backgroundColor: theme.colors.bgGlass, borderRadius: theme.radius.md, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border },
  cardTop: { flexDirection: 'row', marginBottom: 8 },
  thumb: { width: 80, height: 120, borderRadius: theme.radius.sm, backgroundColor: theme.colors.bgInput },
  thumbPlaceholder: { width: 80, height: 120, borderRadius: theme.radius.sm, backgroundColor: theme.colors.bgInput, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  title: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(226,172,85,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: theme.colors.accentGold, fontSize: 13, fontWeight: '600' },
  desc: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, gap: 8 },
  btnSecondary: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.bgInput, paddingHorizontal: 12, paddingVertical: 10, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border },
  btnSecondaryText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  btnDanger: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  btnDangerText: { color: theme.colors.danger, fontSize: 14, fontWeight: '600' },
  screeningsList: { marginTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, gap: 8 },
  screeningRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.bgInput, padding: 8, borderRadius: theme.radius.sm },
  screeningActions: { flexDirection: 'row', gap: 16, marginLeft: 12 },
});
