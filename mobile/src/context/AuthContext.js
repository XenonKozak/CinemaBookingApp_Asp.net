import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { clearAuth, loadStoredAuth, persistLogin } from '../stores/auth';
import { theme } from '../theme/theme';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadStoredAuth();
      setToken(stored.token);
      setUser(stored.user);
      setReady(true);
    })();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      isLoggedIn: !!token && !!user,
      isAdmin: user?.role === 'Admin',
      async login(newToken) {
        const result = await persistLogin(newToken);
        if (!result) return false;
        setToken(result.token);
        setUser(result.user);
        return true;
      },
      async logout() {
        await clearAuth();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, ready]
  );

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={theme.colors.accentGold} />
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgPrimary,
  },
});

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
