import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

const VARIANTS = {
  gold: {
    bg: 'rgba(212, 168, 67, 0.18)',
    border: 'rgba(212, 168, 67, 0.45)',
    text: theme.colors.accentGoldLight,
  },
  purple: {
    bg: 'rgba(124, 58, 237, 0.2)',
    border: 'rgba(167, 139, 250, 0.4)',
    text: theme.colors.accentPurpleLight,
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.18)',
    border: 'rgba(16, 185, 129, 0.45)',
    text: theme.colors.success,
  },
  dark: {
    bg: 'rgba(10, 10, 26, 0.92)',
    border: theme.colors.accentGold,
    text: theme.colors.accentGoldLight,
  },
};

export default function Badge({ children, variant = 'gold', style, textStyle }) {
  const v = VARIANTS[variant] || VARIANTS.gold;
  return (
    <View style={[styles.badge, { backgroundColor: v.bg, borderColor: v.border }, style]}>
      <Text style={[styles.text, { color: v.text }, textStyle]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
