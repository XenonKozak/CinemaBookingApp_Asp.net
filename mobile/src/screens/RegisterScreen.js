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
import { theme } from '../theme/theme';

export default function RegisterScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/Auth/Register', { userName, email, password });
      setSuccess('Konto utworzone! Przekierowanie do logowania...');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch {
      setError('Nie udało się utworzyć konta. Spróbuj inną nazwę użytkownika lub email.');
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
              <Text style={styles.authIcon}>✨</Text>
              <Text style={styles.title}>Utwórz konto</Text>
              <Text style={styles.subtitle}>Dołącz do nas i rezerwuj bilety online!</Text>
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
                placeholder="Min. 6 znaków"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? <Text style={styles.success}>{success}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Zarejestruj się</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>
                Masz już konto? <Text style={styles.linkAccent}>Zaloguj się</Text>
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
  success: {
    padding: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: theme.radius.sm,
    color: theme.colors.success,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: theme.colors.accentPurple,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
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
