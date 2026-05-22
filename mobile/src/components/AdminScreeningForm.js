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
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/theme';
import { toApiScreeningTime, toDatetimeLocalValue } from '../utils/screeningTime';
import { Picker } from '@react-native-picker/picker'; // you may need to install @react-native-picker/picker if not already, wait, I will use standard RN or simple list if Picker is not there. Wait, I will use a simple list of buttons if Picker is absent to be safe.

const emptyForm = {
  movieId: '',
  screeningTime: '',
};

export default function AdminScreeningForm({
  visible,
  screening,
  movies,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const isEdit = !!screening;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (visible) {
      setForm(
        screening
          ? {
              movieId: screening.movieId || '',
              screeningTime: screening.screeningTime ? toDatetimeLocalValue(screening.screeningTime) : '',
            }
          : emptyForm
      );
    }
  }, [visible, screening]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.screeningTime.trim() || (!isEdit && !form.movieId)) {
      return;
    }
    onSubmit({
      movieId: form.movieId,
      screeningTime: toApiScreeningTime(form.screeningTime),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{isEdit ? 'Edytuj seans' : 'Dodaj nowy seans'}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {!isEdit && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Wybierz film</Text>
                {movies.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.movieOption, form.movieId === m.id && styles.movieOptionSelected]}
                    onPress={() => update('movieId', m.id)}
                  >
                    <Text style={[styles.movieOptionText, form.movieId === m.id && styles.movieOptionTextSelected]}>
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Data i godzina seansu</Text>
            <TextInput
              style={styles.input}
              value={form.screeningTime}
              onChangeText={(v) => update('screeningTime', v)}
              placeholder="YYYY-MM-DD HH:MM"
              placeholderTextColor={theme.colors.textMuted}
              maxLength={16}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnSecondary} onPress={onClose} disabled={loading}>
                <Text style={styles.btnSecondaryText}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, loading && styles.btnDisabled]} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#0a0a1a" /> : <Text style={styles.btnPrimaryText}>{isEdit ? 'Zapisz zmiany' : 'Dodaj seans'}</Text>}
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
  pickerContainer: { marginBottom: 16 },
  movieOption: { padding: 12, backgroundColor: theme.colors.bgInput, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 8 },
  movieOptionSelected: { borderColor: theme.colors.accentGold, backgroundColor: 'rgba(226, 172, 85, 0.1)' },
  movieOptionText: { color: theme.colors.textPrimary, fontSize: 14 },
  movieOptionTextSelected: { color: theme.colors.accentGold, fontWeight: '700' },
  error: { color: theme.colors.danger, fontSize: 13, textAlign: 'center', marginBottom: theme.spacing.md, padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: theme.radius.sm },
  actions: { flexDirection: 'row', marginTop: 8 },
  btnSecondary: { flex: 1, paddingVertical: 14, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', backgroundColor: theme.colors.bgGlass, marginRight: 10 },
  btnSecondaryText: { color: theme.colors.textPrimary, fontWeight: '600' },
  btnPrimary: { flex: 1, paddingVertical: 14, borderRadius: theme.radius.sm, alignItems: 'center', backgroundColor: theme.colors.accentGold },
  btnPrimaryText: { color: '#0a0a1a', fontWeight: '800' },
  btnDisabled: { opacity: 0.7 },
});
