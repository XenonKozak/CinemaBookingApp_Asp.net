import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Alert } from 'react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function MovieReviews({ movieId }) {
  const auth = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Zmienne stanu edycji recenzji
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const hasExistingReview = auth.isLoggedIn && auth.user?.userName && reviews.some(r => r.userId === auth.user?.userName);

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const fetchReviews = async () => {
    if (!movieId) {
      setLoading(false);
      setError('Brak ID filmu. Spróbuj zrestartować backend (API).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/Review/movie/${movieId}`);
      setReviews(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Nie udało się pobrać opinii.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    
    try {
      const reviewData = {
        movieId,
        userId: auth.user?.userName || 'Anonim',
        rating: newRating,
        comment: newComment.trim()
      };
      
      const res = await api.post('/Review', reviewData);
      setReviews([res.data, ...reviews]);
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się dodać recenzji.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStart = (review) => {
    setEditingReviewId(review.id);
    setEditingRating(review.rating);
    setEditingComment(review.comment);
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditingRating(5);
    setEditingComment('');
  };

  const handleEditSave = async (originalReview) => {
    if (!editingComment.trim()) return;
    setSavingEdit(true);
    try {
      const updatedData = {
        ...originalReview,
        rating: editingRating,
        comment: editingComment.trim()
      };
      
      const res = await api.put(`/Review/${originalReview.id}`, updatedData);
      
      // Aktualizuj lokalną listę
      setReviews(reviews.map(r => r.id === originalReview.id ? res.data : r));
      handleEditCancel();
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się zapisać zmian.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = (review) => {
    Alert.alert(
      'Potwierdzenie',
      'Czy na pewno chcesz usunąć swoją recenzję?',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Usuń', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/Review/${review.id}`, {
                params: {
                  movieId: review.movieId
                }
              });
              // Usuń lokalnie
              setReviews(reviews.filter(r => r.id !== review.id));
            } catch (err) {
              Alert.alert('Błąd', 'Nie udało się usunąć recenzji.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            disabled={!interactive}
            onPress={() => {
              if (interactive) {
                if (onRatingChange) {
                  onRatingChange(star);
                } else {
                  setNewRating(star);
                }
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.star, star <= rating && styles.starFilled, interactive && styles.starInteractive]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Opinie o filmie</Text>

      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.accentGold} style={{ margin: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>Jeszcze nikt nie ocenił tego filmu. Bądź pierwszy!</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                {editingReviewId === review.id ? (
                  /* TRYB EDYCJI INLINE */
                  <View style={styles.inlineEditContainer}>
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewAuthor}>{review.userId} <Text style={styles.editingText}>(Edycja)</Text></Text>
                      <Text style={styles.reviewDate}>Teraz</Text>
                    </View>
                    <View style={styles.formRow}>
                      <Text style={styles.formLabel}>Ocena:</Text>
                      {renderStars(editingRating, true, setEditingRating)}
                    </View>
                    <TextInput
                      style={styles.inlineInput}
                      placeholder="Edytuj recenzję..."
                      placeholderTextColor={theme.colors.textMuted}
                      multiline
                      value={editingComment}
                      onChangeText={setEditingComment}
                    />
                    <View style={styles.inlineActionsContainer}>
                      <TouchableOpacity 
                        style={[styles.inlineActionBtn, (!editingComment.trim() || savingEdit) && styles.submitBtnDisabled]}
                        onPress={() => handleEditSave(review)}
                        disabled={!editingComment.trim() || savingEdit}
                      >
                        {savingEdit ? (
                          <ActivityIndicator color="#0a0a1a" size="small" />
                        ) : (
                          <Text style={styles.inlineActionBtnText}>Zapisz</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.inlineActionCancelBtn]}
                        onPress={handleEditCancel}
                        disabled={savingEdit}
                      >
                        <Text style={styles.inlineActionCancelBtnText}>Anuluj</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* TRYB WYŚWIETLANIA */
                  <View>
                    <View style={styles.reviewHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 8 }}>
                        <Text style={[styles.reviewAuthor, { flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">{review.userId}</Text>
                        {review.sentiment && review.sentiment !== 'Unknown' && (
                          <View style={[styles.sentimentBadge, styles[`sentiment${review.sentiment}`]]}>
                            <Text style={[styles.sentimentText, styles[`sentimentText${review.sentiment}`]]}>
                              {review.sentiment === 'Positive' ? '😃 Pozytywna' : 
                               review.sentiment === 'Negative' ? '😠 Negatywna' : 
                               review.sentiment === 'Neutral' ? '😐 Neutralna' : '🤔 Mieszana'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                    </View>
                    {renderStars(review.rating)}
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    
                    {/* Przyciski akcji dla właściciela opinii */}
                    {auth.isLoggedIn && review.userId === auth.user?.userName && (
                      <View style={styles.reviewActions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditStart(review)}>
                          <Text style={styles.editBtnText}>✏️ Edytuj</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(review)}>
                          <Text style={styles.deleteBtnText}>🗑️ Usuń</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {auth.isLoggedIn ? (
        hasExistingReview ? (
          <View style={styles.alreadyReviewedBox}>
            <Text style={styles.alreadyReviewedTitle}>📝 Dodałeś już opinię do tego filmu</Text>
            <Text style={styles.alreadyReviewedText}>Możesz ją edytować lub usunąć za pomocą przycisków "Edytuj" / "Usuń" na swojej opinii powyżej.</Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Dodaj swoją recenzję</Text>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Ocena:</Text>
              {renderStars(newRating, true, setNewRating)}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Co sądzisz o tym filmie?"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={3}
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity 
              style={[styles.submitBtn, (!newComment.trim() || submitting) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#0a0a1a" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Dodaj recenzję</Text>
              )}
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>Zaloguj się, aby dodać recenzję.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginVertical: 16,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  reviewsList: {
    marginBottom: 24,
  },
  reviewCard: {
    backgroundColor: theme.colors.bgGlass,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontWeight: '700',
    color: theme.colors.accentGoldLight,
    fontSize: 16,
  },
  sentimentBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sentimentPositive: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  sentimentTextPositive: { color: '#34d399' },
  sentimentNegative: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  sentimentTextNegative: { color: '#f87171' },
  sentimentNeutral: { backgroundColor: 'rgba(156, 163, 175, 0.15)', borderColor: 'rgba(156, 163, 175, 0.3)' },
  sentimentTextNeutral: { color: '#9ca3af' },
  sentimentMixed: { backgroundColor: 'rgba(156, 163, 175, 0.15)', borderColor: 'rgba(156, 163, 175, 0.3)' },
  sentimentTextMixed: { color: '#9ca3af' },
  reviewDate: {
    color: theme.colors.textMuted,
    fontSize: 12,
    minWidth: 85,
    textAlign: 'right',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    color: '#444',
    fontSize: 18,
    marginRight: 4,
  },
  starFilled: {
    color: theme.colors.accentGold,
  },
  starInteractive: {
    fontSize: 28,
    marginRight: 8,
  },
  reviewComment: {
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formLabel: {
    color: theme.colors.textSecondary,
    marginRight: 12,
    fontSize: 16,
  },
  input: {
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    color: theme.colors.textPrimary,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: theme.colors.accentGold,
    borderRadius: theme.radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#0a0a1a',
    fontWeight: '800',
    fontSize: 16,
  },
  loginPrompt: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
  },
  loginPromptText: {
    color: theme.colors.textSecondary,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
  },
  editBtnText: {
    color: theme.colors.accentGold,
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtnText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 13,
  },
  inlineEditContainer: {
    width: '100%',
  },
  editingText: {
    fontSize: 12,
    color: theme.colors.accentGold,
    fontWeight: 'normal',
  },
  inlineInput: {
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    color: theme.colors.textPrimary,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  inlineActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineActionBtn: {
    backgroundColor: theme.colors.accentGold,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineActionBtnText: {
    color: '#0a0a1a',
    fontWeight: '800',
    fontSize: 14,
  },
  inlineActionCancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineActionCancelBtnText: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  alreadyReviewedBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: theme.radius.md,
    padding: 16,
  },
  alreadyReviewedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.accentGoldLight,
    marginBottom: 6,
  },
  alreadyReviewedText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  }
});
