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
import NavBar from '../components/NavBar';
import AdminMovieForm from '../components/AdminMovieForm';
import AdminScreeningForm from '../components/AdminScreeningForm';

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

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
      screeningTime: new Date(data.screeningTime).toISOString(),
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
          <View style={styles.thumbPlaceholder}><Text>🎞️</Text></View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.badge}>{item.duration} min</Text>
        </View>
      </View>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => { setEditingMovie(item); setMovieFormVisible(true); }}>
          <Text style={styles.btnSecondaryText}>✏️ Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDanger} onPress={() => deleteMovie(item)}>
          <Text style={styles.btnDangerText}>🗑️ Usuń</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScreening = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.title}>{getMovieTitle(item.movieId)}</Text>
        <Text style={styles.badge}>{formatTime(item.screeningTime)}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => { setEditingScreening(item); setScreeningFormVisible(true); }}>
          <Text style={styles.btnSecondaryText}>✏️ Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDanger} onPress={() => deleteScreening(item)}>
          <Text style={styles.btnDangerText}>🗑️ Usuń</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <NavBar navigation={navigation} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Panel <Text style={styles.gradient}>Administratora</Text></Text>
        <Text style={styles.headerSubtitle}>Zarządzaj filmami i seansami</Text>
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
          data={screenings}
          keyExtractor={i => i.id}
          renderItem={renderScreening}
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
  tabs: { flexDirection: 'row', marginHorizontal: theme.spacing.lg, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: theme.colors.bgGlass, borderWidth: 1, borderColor: theme.colors.border },
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
  thumb: { width: 40, height: 60, borderRadius: theme.radius.sm, backgroundColor: theme.colors.bgInput },
  thumbPlaceholder: { width: 40, height: 60, borderRadius: theme.radius.sm, backgroundColor: theme.colors.bgInput, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  title: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  badge: { alignSelf: 'flex-start', color: theme.colors.accentGold, fontSize: 12, backgroundColor: 'rgba(226,172,85,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  desc: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 12 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 12, gap: 8 },
  btnSecondary: { backgroundColor: theme.colors.bgInput, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border },
  btnSecondaryText: { color: theme.colors.textPrimary, fontSize: 13 },
  btnDanger: { backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  btnDangerText: { color: theme.colors.danger, fontSize: 13 },
});
