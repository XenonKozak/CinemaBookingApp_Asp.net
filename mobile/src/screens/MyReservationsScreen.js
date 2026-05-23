import React, { useState, useEffect } from 'react';
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
import api from '../api/axios';
import { theme } from '../theme/theme';
import NavBar from '../components/NavBar';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyReservationsScreen({ navigation }) {
  const auth = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigation.replace('Login');
      return;
    }
    fetchMyReservations();
  }, [auth.isLoggedIn]);

  const fetchMyReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/Reservation/my');
      
      const grouped = {};
      for (const item of res.data) {
        if (!grouped[item.bookingId]) {
          grouped[item.bookingId] = {
            bookingId: item.bookingId,
            movieId: item.movieId,
            movieTitle: item.movieTitle,
            imageUrl: item.imageUrl,
            reservationDate: item.reservationDate,
            seats: []
          };
        }
        grouped[item.bookingId].seats.push({
          row: item.row,
          seatNumber: item.seatNumber
        });
      }
      const sorted = Object.values(grouped).sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));
      setReservations(sorted);
    } catch {
      setError('Nie udało się pobrać Twoich rezerwacji.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (bookingId) => {
    Alert.alert(
      'Anuluj rezerwację',
      'Czy na pewno chcesz anulować całą rezerwację? Ta operacja jest nieodwracalna.',
      [
        { text: 'Nie', style: 'cancel' },
        { text: 'Tak', style: 'destructive', onPress: () => cancelReservation(bookingId) },
      ]
    );
  };

  const cancelReservation = async (bookingId) => {
    try {
      await api.delete(`/Reservation/${bookingId}`);
      setReservations(prev => prev.filter(r => r.bookingId !== bookingId));
    } catch {
      Alert.alert('Błąd', 'Nie udało się anulować rezerwacji.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.posterImage} resizeMode="cover" />
          ) : (
            <Text style={styles.resIcon}>🎬</Text>
          )}
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.movieTitle}
          </Text>
        </View>
        <Badge variant="success">Potwierdzona</Badge>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBadgeSpacer}>
          <Badge variant="gold">{item.seats.length} {item.seats.length === 1 ? 'miejsce' : 'miejsca'}</Badge>
        </View>
        <Badge variant="purple">{item.seats.map(s => `${s.row}${s.seatNumber}`).join(', ')}</Badge>
      </View>

      <View style={styles.dateRow}>
        <View>
          <Text style={styles.dateLabel}>Data rezerwacji</Text>
          <Text style={styles.dateValue}>{formatDate(item.reservationDate)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 12 }}>
        <TouchableOpacity 
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.sm, backgroundColor: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)', borderWidth: 1 }} 
          onPress={() => navigation.navigate('MovieReviews', { movieId: item.movieId, movieTitle: item.movieTitle })}>
          <Text style={{ color: theme.colors.accentGold, fontSize: 13, fontWeight: '600' }}>⭐ Oceń</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.sm, borderColor: 'rgba(239, 68, 68, 0.4)', borderWidth: 1 }} 
          onPress={() => handleCancel(item.bookingId)}>
          <Text style={{ color: theme.colors.danger, fontSize: 13, fontWeight: '600' }}>Odwołaj całość</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <NavBar navigation={navigation} />

      <PageHeader
        icon="🎟️"
        title="Twoje"
        titleAccent="Rezerwacje"
        subtitle="Historia Twoich zamówień i nadchodzące seanse"
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accentGold} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.bookingId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🍿</Text>
              <Text style={styles.emptyText}>Nie masz jeszcze żadnych rezerwacji.</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.primaryBtnText}>Przejdź do repertuaru</Text>
              </TouchableOpacity>
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
    borderRadius: theme.radius.lg,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgInput,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  resIcon: {
    fontSize: 26,
  },
  titleBlock: {
    flex: 1,
    marginRight: 8,
    paddingTop: 4,
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  metaBadgeSpacer: {
    marginRight: 8,
    marginBottom: 6,
  },
  dateRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: theme.colors.accentGold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.sm,
  },
  primaryBtnText: {
    color: '#0a0a1a',
    fontWeight: '700',
    fontSize: 15,
  },
});
