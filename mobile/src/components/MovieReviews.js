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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            disabled={!interactive}
            onPress={() => interactive && setNewRating(star)}
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
                <View style={styles.reviewHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap', marginRight: 8 }}>
                    <Text style={styles.reviewAuthor} numberOfLines={1} ellipsizeMode="tail">{review.userId}</Text>
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
              </View>
            ))
          )}
        </View>
      )}

      {auth.isLoggedIn ? (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Dodaj swoją recenzję</Text>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Ocena:</Text>
            {renderStars(newRating, true)}
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
    flexShrink: 0,
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
  }
});
