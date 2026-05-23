<template>
  <div class="movie-reviews">
    <h2 class="section-title">Opinie o filmie</h2>
    
    <div v-if="loading" class="loading-state">
      <div class="spinner-small"></div>
      <span>Wczytywanie recenzji...</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else class="reviews-content">
      <!-- Lista opinii -->
      <div class="reviews-list">
        <div v-if="reviews.length === 0" class="empty-reviews">
          Jeszcze nikt nie ocenił tego filmu. Bądź pierwszy!
        </div>
        <div v-for="review in sortedReviews" :key="review.id" class="review-card glass-card">
          <div class="review-header">
            <div class="review-author-group">
              <span class="review-author">{{ review.userId }}</span>
              <span v-if="review.sentiment && review.sentiment !== 'Unknown'" :class="['sentiment-badge', review.sentiment.toLowerCase()]">
                {{ translateSentiment(review.sentiment) }}
              </span>
            </div>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
          <div class="review-stars">
            <span v-for="n in 5" :key="n" class="star" :class="{ filled: n <= review.rating }">
              ★
            </span>
          </div>
          <p class="review-comment">{{ review.comment }}</p>
        </div>
      </div>

      <!-- Formularz dodawania nowej opinii -->
      <div v-if="auth.isLoggedIn" class="add-review-section glass-card">
        <h3>Dodaj swoją recenzję</h3>
        <form @submit.prevent="submitReview" class="review-form">
          <div class="rating-selector">
            <label>Ocena:</label>
            <div class="stars-input">
              <span 
                v-for="n in 5" 
                :key="n" 
                class="star-btn" 
                :class="{ active: n <= newReview.rating }"
                @click="newReview.rating = n"
              >
                ★
              </span>
            </div>
          </div>
          <div class="form-group">
            <textarea 
              v-model="newReview.comment" 
              placeholder="Co sądzisz o tym filmie?" 
              rows="3" 
              required
              class="form-input"
            ></textarea>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Wysyłanie...' : 'Dodaj recenzję' }}
          </button>
        </form>
      </div>
      <div v-else class="login-prompt">
        <p>Musisz być zalogowany, aby dodać recenzję.</p>
        <router-link to="/login" class="btn btn-secondary">Zaloguj się</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios.js';
import { authStore } from '../stores/auth.js';

const auth = authStore;

const props = defineProps({
  movieId: {
    type: String,
    required: true
  }
});

const reviews = ref([]);
const loading = ref(true);
const error = ref('');
const submitting = ref(false);

const newReview = ref({
  rating: 5,
  comment: ''
});

const sortedReviews = computed(() => {
  return [...reviews.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
};

const translateSentiment = (sentiment) => {
  switch(sentiment) {
    case 'Positive': return '😃 Pozytywna';
    case 'Negative': return '😠 Negatywna';
    case 'Neutral': return '😐 Neutralna';
    case 'Mixed': return '🤔 Mieszana';
    default: return '';
  }
};

const fetchReviews = async () => {
  if (!props.movieId) return;
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get(`/Review/movie/${props.movieId}`);
    reviews.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = 'Nie udało się wczytać opinii z bazy Cosmos DB.';
  } finally {
    loading.value = false;
  }
};

const submitReview = async () => {
  if (!newReview.value.comment.trim()) return;
  
  submitting.value = true;
  try {
    const reviewData = {
      movieId: props.movieId,
      userId: auth.user?.userName || 'Anonim',
      rating: newReview.value.rating,
      comment: newReview.value.comment.trim()
    };
    
    const res = await api.post('/Review', reviewData);
    
    // Dodajemy nową opinię do listy, żeby od razu ją wyświetlić
    reviews.value.unshift(res.data);
    
    // Resetujemy formularz
    newReview.value.rating = 5;
    newReview.value.comment = '';
  } catch (err) {
    console.error(err);
    alert('Wystąpił błąd podczas dodawania recenzji.');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchReviews();
});
</script>

<style scoped>
.movie-reviews {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid var(--border);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  text-align: center;
}

.loading-state, .error-state, .empty-reviews {
  text-align: center;
  padding: 30px;
  color: var(--text-secondary);
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 12px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.review-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-author {
  font-weight: 600;
  color: var(--accent-gold-light);
  font-size: 1.05rem;
}

.review-author-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sentiment-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}
.sentiment-badge.positive { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.sentiment-badge.negative { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.sentiment-badge.neutral, .sentiment-badge.mixed { background: rgba(156, 163, 175, 0.15); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.3); }

.review-date {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.review-stars {
  color: #444; /* Empty star color */
  font-size: 1.2rem;
  letter-spacing: 2px;
}

.review-stars .star.filled {
  color: #FBBF24; /* Gold star color */
}

.review-comment {
  margin: 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.add-review-section {
  padding: 24px;
  margin-top: 24px;
}

.add-review-section h3 {
  margin: 0 0 16px 0;
  font-size: 1.2rem;
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stars-input {
  display: flex;
  gap: 4px;
}

.star-btn {
  font-size: 1.8rem;
  color: #444;
  cursor: pointer;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.star-btn:hover {
  transform: scale(1.1);
}

.star-btn.active {
  color: #FBBF24;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-prompt {
  text-align: center;
  padding: 30px;
  background: var(--bg-input);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);
}

.login-prompt p {
  margin-bottom: 16px;
  color: var(--text-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
