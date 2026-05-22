import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme/theme';

const emptyForm = {
  title: '',
  description: '',
  duration: '',
};

export default function AdminMovieForm({
  visible,
  movie,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = !!movie;
  const [form, setForm] = useState(emptyForm);
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    if (visible) {
      setForm(
        movie
          ? {
              title: movie.title || '',
              description: movie.description || '',
              duration: String(movie.duration ?? ''),
            }
          : emptyForm
      );
      setPoster(null);
    }
  }, [visible, movie]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const pickPoster = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPoster(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    const duration = parseInt(form.duration, 10);
    if (!form.title.trim() || form.description.trim().length < 10 || !duration) {
      return;
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      duration,
      poster,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{isEdit ? 'Edytuj film' : 'Dodaj nowy film'}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Tytuł filmu</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(v) => update('title', v)}
              placeholder="np. Incepcja"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={100}
            />

            <Text style={styles.label}>Opis (min. 10 znaków)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(v) => update('description', v)}
              placeholder="Krótki opis filmu"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={100}
            />

            <Text style={styles.label}>Czas trwania (minuty)</Text>
            <TextInput
              style={styles.input}
              value={form.duration}
              onChangeText={(v) => update('duration', v.replace(/[^0-9]/g, ''))}
              placeholder="np. 148"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.label}>Plakat (opcjonalnie)</Text>
            <TouchableOpacity style={styles.posterPicker} onPress={pickPoster} activeOpacity={0.85}>
              {poster ? (
                <Image source={{ uri: poster.uri }} style={styles.posterPreview} resizeMode="cover" />
              ) : movie?.imageUrl ? (
                <Image source={{ uri: movie.imageUrl }} style={styles.posterPreview} resizeMode="cover" />
              ) : (
                <View style={styles.posterEmpty}>
                  <Text style={styles.posterPickerIcon}>📷</Text>
                  <Text style={styles.posterPickerText}>Wybierz plakat</Text>
                </View>
              )}
            </TouchableOpacity>
            {poster && (
              <TouchableOpacity onPress={() => setPoster(null)}>
                <Text style={styles.clearPoster}>Usuń wybrany plakat</Text>
              </TouchableOpacity>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={onClose} disabled={loading}>
                <Text style={styles.btnSecondaryText}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#0a0a1a" /> : <Text style={styles.btnPrimaryText}>{isEdit ? 'Zapisz zmiany' : 'Dodaj film'}</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: theme.colors.bgSecondary, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.border, maxHeight: '90%', padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary },
  closeBtn: { fontSize: 22, color: theme.colors.textSecondary, padding: 4 },
  label: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: theme.colors.bgInput, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.textPrimary, padding: theme.spacing.md, marginBottom: theme.spacing.md, fontSize: 15 },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  posterPicker: { alignSelf: 'center', width: 110, height: 165, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', backgroundColor: theme.colors.bgInput, justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' },
  posterPreview: { width: 110, height: 165 },
  posterEmpty: { alignItems: 'center', padding: 12 },
  posterPickerIcon: { fontSize: 28, marginBottom: 8 },
  posterPickerText: { color: theme.colors.textSecondary, fontSize: 13, textAlign: 'center' },
  clearPoster: { color: theme.colors.danger, fontSize: 13, marginBottom: theme.spacing.md, textAlign: 'center' },
  error: { color: theme.colors.danger, fontSize: 13, textAlign: 'center', marginBottom: theme.spacing.md, padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: theme.radius.sm },
  actions: { flexDirection: 'row', marginTop: 8 },
  btnSecondary: { flex: 1, paddingVertical: 14, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', backgroundColor: theme.colors.bgGlass, marginRight: 10 },
  btnSecondaryText: { color: theme.colors.textPrimary, fontWeight: '600' },
  btnPrimary: { flex: 1, paddingVertical: 14, borderRadius: theme.radius.sm, alignItems: 'center', backgroundColor: theme.colors.accentGold },
  btnPrimaryText: { color: '#0a0a1a', fontWeight: '800' },
  btnDisabled: { opacity: 0.7 },
});
