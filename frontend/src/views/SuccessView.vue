<template>
  <div class="page fade-in">
    <div class="container success-container">
      <div class="success-card glass-card">
        <div class="success-icon-wrapper">
          <div class="success-icon">
            <Check size="48" color="var(--success)" />
          </div>
          <div class="success-pulse"></div>
        </div>

        <h1 class="success-title">Rezerwacja potwierdzona!</h1>
        <p class="success-subtitle">Twoje bilety są gotowe.</p>

        <div class="ticket-info">
          <img
            v-if="movie.imageUrl"
            :src="movie.imageUrl"
            alt="Plakat"
            class="ticket-poster"
          />
          <div v-else class="ticket-poster-placeholder">
            <Film size="32" color="var(--text-muted)" />
          </div>
          
          <div class="ticket-details">
            <h3 class="ticket-movie">{{ movie.title }}</h3>
            <div class="ticket-meta">
              <span class="meta-label">MIEJSCA</span>
              <span class="meta-value text-gradient">{{ seats }}</span>
            </div>
          </div>
        </div>

        <div class="success-actions">
          <router-link to="/my-reservations" class="btn btn-purple btn-lg">
            Zobacz moje rezerwacje
          </router-link>
          <router-link to="/" class="btn btn-secondary btn-lg">
            Wróć do repertuaru
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Check, Film } from 'lucide-vue-next';

const route = useRoute();

const movie = computed(() => ({
  title: route.query.title || 'Nieznany film',
  imageUrl: route.query.imageUrl || '',
}));

const seats = computed(() => route.query.seats || 'Brak danych');
</script>

<style scoped>
.success-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
}

.success-card {
  width: 100%;
  max-width: 500px;
  padding: 48px;
  text-align: center;
  border-radius: 24px;
}

.success-icon-wrapper {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  position: relative;
  z-index: 2;
  width: 80px;
  height: 80px;
  background: rgba(48, 209, 88, 0.15);
  border: 2px solid rgba(48, 209, 88, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.success-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: rgba(48, 209, 88, 0.2);
  border-radius: 50%;
  z-index: 1;
  animation: pulse 2s infinite ease-out;
}

.success-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.success-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.ticket-info {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--bg-input);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--border);
  margin-bottom: 40px;
  text-align: left;
}

.ticket-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--bg-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.ticket-poster-placeholder {
  width: 80px;
  height: 120px;
  border-radius: 8px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
}

.ticket-details {
  flex: 1;
}

.ticket-movie {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  color: var(--text-primary);
  line-height: 1.2;
}

.ticket-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 2px;
}

.meta-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.success-actions .btn {
  width: 100%;
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
}

@media (max-width: 480px) {
  .success-card {
    padding: 32px 24px;
  }
  .success-title {
    font-size: 1.8rem;
  }
}
</style>
