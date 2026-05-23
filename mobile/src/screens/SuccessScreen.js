import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

export default function SuccessScreen({ route, navigation }) {
  const { title, imageUrl, seats } = route.params || {};

  const popAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(popAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacityAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Animated.View 
            style={[
              styles.pulse, 
              { transform: [{ scale: pulseAnim }], opacity: pulseOpacityAnim }
            ]} 
          />
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: popAnim }] }]}>
            <Text style={styles.icon}>✅</Text>
          </Animated.View>
        </View>

        <Text style={styles.title}>Rezerwacja potwierdzona!</Text>
        <Text style={styles.subtitle}>Twoje bilety są gotowe.</Text>

        <View style={styles.ticketInfo}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterIcon}>🎞️</Text>
            </View>
          )}
          
          <View style={styles.ticketDetails}>
            <Text style={styles.ticketMovie} numberOfLines={2}>{title || 'Nieznany film'}</Text>
            <Text style={styles.metaLabel}>MIEJSCA</Text>
            <Text style={styles.metaValue}>{seats || 'Brak danych'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.replace('MyReservations')}
          >
            <Text style={styles.primaryBtnText}>Zobacz moje rezerwacje</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => navigation.replace('Home')}
          >
            <Text style={styles.secondaryBtnText}>Wróć do repertuaru</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.bgGlass,
    borderRadius: theme.radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(48, 209, 88, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  icon: {
    fontSize: 36,
  },
  pulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    zIndex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  ticketInfo: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgInput,
    padding: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  poster: {
    width: 70,
    height: 105,
    borderRadius: theme.radius.sm,
    marginRight: 16,
  },
  posterPlaceholder: {
    width: 70,
    height: 105,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  posterIcon: {
    fontSize: 28,
  },
  ticketDetails: {
    flex: 1,
  },
  ticketMovie: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.accentGoldLight,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: theme.colors.accentPurple,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.bgInput,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    width: '100%',
  },
  secondaryBtnText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  }
});
