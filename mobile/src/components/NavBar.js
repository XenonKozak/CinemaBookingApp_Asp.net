import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import Badge from './Badge';
import { Feather } from '@expo/vector-icons';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function NavBar({ navigation }) {
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const nextState = !mobileOpen;
    if (nextState) setMobileOpen(true);
    Animated.timing(animation, {
      toValue: nextState ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (!nextState) setMobileOpen(false);
    });
  };

  const handleLogout = async () => {
    await auth.logout();
    setMobileOpen(false);
    navigation.navigate('Home');
  };

  const go = (screen) => {
    Animated.timing(animation, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setMobileOpen(false);
      navigation.navigate(screen);
    });
  };

  const NavLink = ({ label, onPress, gold, active }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.navLink, active && styles.navLinkActive]}
    >
      <Text style={[styles.navLinkText, gold && styles.navLinkGold, active && styles.navLinkTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const userName = auth.user?.userName || '';

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { zIndex: 1000, elevation: 1000 }]}>
      <View style={[styles.navbar, { zIndex: 100, elevation: 100 }]}>
        <View style={styles.inner}>
          <TouchableOpacity onPress={() => go('Home')} style={styles.brand}>
            <Feather name="film" size={20} color={theme.colors.accentGoldLight} style={{ marginRight: 8 }} />
            <Text style={styles.brandText}>CinemaBook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggle}
            onPress={toggleMenu}
            accessibilityLabel="Menu"
          >
            <View style={styles.toggleBar} />
            <View style={styles.toggleBar} />
            <View style={styles.toggleBar} />
          </TouchableOpacity>
        </View>

        <Animated.View 
          pointerEvents={mobileOpen ? 'auto' : 'none'}
          style={{ 
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.bgSecondary,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 20,
            opacity: animation,
            transform: [{
              translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] })
            }],
            zIndex: 50,
        }}>
          <View style={styles.mobileMenu}>
            <NavLink label="Repertuar" onPress={() => go('Home')} />

            {auth.isLoggedIn ? (
              <>
                <View style={styles.userCard}>
                  <View style={[styles.avatar, auth.isAdmin && styles.avatarAdmin]}>
                    <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userLabel}>Zalogowany jako</Text>
                    <Text style={styles.userName} numberOfLines={1}>
                      {userName}
                    </Text>
                  </View>
                  <Badge variant={auth.isAdmin ? 'gold' : 'purple'}>
                    {auth.isAdmin ? 'Admin' : 'User'}
                  </Badge>
                </View>

                {auth.isAdmin && (
                  <NavLink label={<><Feather name="settings" size={16} /> Panel Admina</>} gold onPress={() => go('Admin')} />
                )}
                <NavLink label={<><Feather name="bookmark" size={16} /> Moje Rezerwacje</>} onPress={() => go('MyReservations')} />

                <TouchableOpacity style={styles.btnSecondary} onPress={handleLogout}>
                  <Text style={styles.btnSecondaryText}>Wyloguj</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <NavLink label="Zaloguj się" onPress={() => go('Login')} />
                <TouchableOpacity style={styles.btnPrimary} onPress={() => go('Register')}>
                  <Text style={styles.btnPrimaryText}>Rejestracja</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: theme.colors.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  navbar: {
    backgroundColor: theme.colors.bgSecondary,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    height: 56,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.accentGoldLight,
  },
  toggle: {
    padding: 8,
    justifyContent: 'center',
    gap: 5,
  },
  toggleBar: {
    width: 22,
    height: 2,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: 2,
  },
  mobileMenu: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  navLink: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.sm,
    marginBottom: 4,
  },
  navLinkActive: {
    backgroundColor: theme.colors.bgInput,
  },
  navLinkText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  navLinkTextActive: {
    color: theme.colors.textPrimary,
  },
  navLinkGold: {
    color: theme.colors.accentGoldLight,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 12,
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(124, 58, 237, 0.35)',
    borderWidth: 2,
    borderColor: theme.colors.accentPurpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarAdmin: {
    backgroundColor: 'rgba(212, 168, 67, 0.25)',
    borderColor: theme.colors.accentGold,
  },
  avatarText: {
    color: theme.colors.textPrimary,
    fontWeight: '800',
    fontSize: 15,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  userLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  btnSecondary: {
    backgroundColor: theme.colors.bgGlass,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
  },
  btnSecondaryText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  btnPrimary: {
    backgroundColor: theme.colors.accentGold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryText: {
    color: '#0a0a1a',
    fontWeight: '700',
    fontSize: 15,
  },
});
