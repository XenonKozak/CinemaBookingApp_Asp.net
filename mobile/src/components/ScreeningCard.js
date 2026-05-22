import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import Badge from './Badge';

export default function ScreeningCard({ screening, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {screening.imageUrl ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: screening.imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageScrim} />
          <View style={styles.durationOnPoster}>
            <Badge variant="dark">{screening.duration} min</Badge>
          </View>
        </View>
      ) : (
        <View style={styles.headerNoImage}>
          <Text style={styles.cardIcon}>🎞️</Text>
          <Badge variant="gold">{screening.duration} min</Badge>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {screening.movieTitle}
        </Text>
        <Text style={styles.desc} numberOfLines={3}>
          {screening.description}
        </Text>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.9}>
            <Text style={styles.btnText}>Zarezerwuj miejsce →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgGlass,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: {
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.25)',
  },
  durationOnPoster: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 2,
  },
  headerNoImage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  cardIcon: {
    fontSize: 32,
  },
  body: {
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  desc: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
  },
  btn: {
    backgroundColor: theme.colors.accentGold,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  btnText: {
    color: '#0a0a1a',
    fontWeight: '700',
    fontSize: 14,
  },
});
