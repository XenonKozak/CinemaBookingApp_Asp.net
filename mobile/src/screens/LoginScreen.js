import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function LoginScreen({ navigation }) {
  const auth = useAuth();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/Auth/Login', { userName, email, password });
      const token = typeof res.data === 'string' ? res.data : res.data?.token;
      if (await auth.login(token)) {
        navigation.replace('Home');
      } else {
        setError('Nieprawidłowy token. Spróbuj ponownie.');
      }
    } catch {
      setError('Nieprawidłowe dane logowania. Sprawdź login, email i hasło.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.authHeader}>
              <Text style={styles.authIcon}>🔐</Text>
              <Text style={styles.title}>Zaloguj się</Text>
              <Text style={styles.subtitle}>
                Witaj ponownie! Zaloguj się, aby zarezerwować miejsca.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nazwa użytkownika</Text>
              <TextInput
                style={styles.input}
                placeholder="Wpisz nazwę użytkownika"
                placeholderTextColor={theme.colors.textMuted}
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="twoj@email.com"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hasło</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0a0a1a" />
              ) : (
                <Text style={styles.buttonText}>Zaloguj się</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>
                Nie masz konta? <Text style={styles.linkAccent}>Zarejestruj się</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.bgGlass,
    borderRadius: theme.radius.lg,
    padding: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxWidth: 440,
    alignSelf: 'center',
    width: '100%',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  authIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  error: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: theme.radius.sm,
    color: theme.colors.danger,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: theme.colors.accentGold,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0a0a1a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
  },
  linkAccent: {
    color: theme.colors.accentGold,
    fontWeight: '600',
  },
});
