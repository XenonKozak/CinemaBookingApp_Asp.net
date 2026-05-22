import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export default function PageHeader({ icon, title, titleAccent, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>
        {icon ? `${icon} ` : ''}
        {title}
        {titleAccent ? <Text style={styles.accent}> {titleAccent}</Text> : null}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    lineHeight: 32,
    marginBottom: 8,
  },
  accent: {
    color: theme.colors.accentGold,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
