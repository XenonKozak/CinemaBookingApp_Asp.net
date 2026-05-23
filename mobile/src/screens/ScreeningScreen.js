import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api/axios';
import { theme } from '../theme/theme';
import SeatPicker from '../components/SeatPicker';
import NavBar from '../components/NavBar';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';

const FOOTER_BASE_HEIGHT = 150;

export default function ScreeningScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const auth = useAuth();
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (selectedSeats.length > 0) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedSeats.length > 0]);

  useEffect(() => {
    if (!auth.isLoggedIn) {
      navigation.replace('Login');
      return;
    }
    fetchScreening();
  }, [id, auth.isLoggedIn]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchScreening = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/Screening/${id}/Details`);
      setScreening(res.data);
    } catch {
      setError('Nie udało się pobrać danych seansu.');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (selectedSeats.length === 0) return;
    setReserving(true);
    const reservationDate = new Date().toISOString();
    const booked = [];
    let hadError = false;

    for (const seat of selectedSeats) {
      try {
        await api.post('/Reservation', {
          seatNumber: seat.seat,
          row: seat.row,
          reservationDate,
          screeningId: id,
        });
        booked.push(seat);
      } catch (e) {
        hadError = true;
        if (e.response?.status === 401) {
          showToast('error', 'Musisz być zalogowany, aby dokonać rezerwacji.');
          navigation.replace('Login');
          setReserving(false);
          return;
        }
      }
    }

    if (booked.length > 0) {
      const labels = booked.map((s) => `${s.row}${s.seat}`).join(', ');
      showToast(
        'success',
        booked.length === 1
          ? `Zarezerwowano miejsce ${labels}! 🎉`
          : `Zarezerwowano ${booked.length} miejsca: ${labels} 🎉`
      );
      setSelectedSeats([]);
      await fetchScreening();
    }

    if (hadError) {
      showToast(
        'error',
        booked.length > 0
          ? 'Część miejsc nie została zarezerwowana (może być już zajęta).'
          : 'Nie udało się zarezerwować wybranych miejsc.'
      );
    }

    setReserving(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <NavBar navigation={navigation} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.accentGold} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <NavBar navigation={navigation} />
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.backBtnText}>← Powrót do repertuaru</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takenSeats = screening.reservations || [];
  const hasFooter = selectedSeats.length > 0;
  const footerOffset = FOOTER_BASE_HEIGHT + insets.bottom + (selectedSeats.length > 3 ? 24 : 0);
  const seatsLabel = selectedSeats.map((s) => `${s.row}${s.seat}`).join(', ');

  return (
    <View style={styles.container}>
      <NavBar navigation={navigation} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          hasFooter && { paddingBottom: footerOffset + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Powrót do repertuaru</Text>
        </TouchableOpacity>

        <View style={styles.movieCard}>
          {screening.imageUrl ? (
            <Image source={{ uri: screening.imageUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterIcon}>🎞️</Text>
            </View>
          )}
          <View style={styles.movieInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {screening.movieTitle}
            </Text>
            <View style={styles.meta}>
              <Badge variant="gold">{screening.duration} min</Badge>
              <View style={styles.metaSpacer} />
              <Badge variant="purple">{takenSeats.length} rez.</Badge>
            </View>
            {screening.description ? (
              <Text style={styles.descPreview} numberOfLines={2}>
                {screening.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.hallSection}>
          <Text style={styles.sectionTitle}>Wybierz swoje miejsce</Text>
          <Text style={styles.sectionSubtitle}>Mapa sali — wybierz jedno lub więcej miejsc</Text>

          <SeatPicker
            takenSeats={takenSeats}
            selectedSeats={selectedSeats}
            onSelectionChange={setSelectedSeats}
          />
        </View>

      </ScrollView>

      <Animated.View style={[styles.footerSafe, { transform: [{ translateY: slideAnim }] }]}>
        <SafeAreaView edges={['bottom']}>
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerLabel}>
                Wybrane miejsca ({selectedSeats.length})
              </Text>
              <Text style={styles.footerSeat} numberOfLines={2}>
                {selectedSeats.length > 0 ? seatsLabel : '-'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.footerBtn, reserving && styles.footerBtnDisabled]}
              onPress={handleReservation}
              disabled={reserving || selectedSeats.length === 0}
              activeOpacity={0.85}
            >
              {reserving ? (
                <ActivityIndicator color="#0a0a1a" />
              ) : (
                <Text style={styles.footerBtnText}>
                  {selectedSeats.length === 1
                    ? 'Potwierdź rezerwację ✓'
                    : `Rezerwuj ${selectedSeats.length} miejsca ✓`}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerCancel}
              onPress={() => setSelectedSeats([])}
              disabled={reserving}
            >
              <Text style={styles.footerCancelText}>Wyczyść wybór</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {toast && (
        <View
          style={[
            styles.toast,
            hasFooter && { bottom: footerOffset + 12 },
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
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
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  backLink: {
    marginBottom: 16,
  },
  backLinkText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  movieCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.bgGlass,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 20,
    overflow: 'hidden',
  },
  poster: {
    width: 92,
    height: 138,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgInput,
  },
  posterPlaceholder: {
    width: 92,
    height: 138,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgInput,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  posterIcon: {
    fontSize: 36,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 16,
    minWidth: 0,
    paddingTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 8,
  },
  metaSpacer: {
    width: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  descPreview: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 19,
  },
  hallSection: {
    marginBottom: 8,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backBtnText: {
    color: theme.colors.textPrimary,
  },
  footerSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  footerInfo: {
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footerSeat: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.accentGoldLight,
  },
  footerBtn: {
    backgroundColor: theme.colors.accentGold,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  footerBtnDisabled: {
    opacity: 0.7,
  },
  footerBtnText: {
    color: '#0a0a1a',
    fontWeight: '800',
    fontSize: 16,
  },
  footerCancel: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  footerCancelText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    padding: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    zIndex: 20,
  },
  toastSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  toastError: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  toastText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
