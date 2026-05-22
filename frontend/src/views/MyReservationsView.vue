<template>
  <div class="page fade-in">
    <div class="container">
      <div class="page-header">
        <h1>🎟️ Twoje <span class="text-gradient">Rezerwacje</span></h1>
        <p>Historia Twoich zamówień i nadchodzące seanse</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-center">
        <div class="spinner"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="empty-state">
        <div class="icon">⚠️</div>
        <p>{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else-if="reservations.length > 0" class="reservations-grid">
        <div v-for="res in reservations" :key="res.id" class="reservation-card glass-card">
          <div class="res-icon" :style="res.imageUrl ? `background-image: url(${res.imageUrl}); background-size: cover; background-position: center; border: 1px solid var(--border);` : ''">
            <span v-if="!res.imageUrl">🎬</span>
          </div>
          <div class="res-details">
            <h3 class="res-movie">{{ res.movieTitle }}</h3>
            <div class="res-meta">
              <span class="badge badge-gold">Rząd {{ res.row }}</span>
              <span class="badge badge-purple">Miejsce {{ res.seatNumber }}</span>
            </div>
            <p class="res-date">
              📅 {{ formatDate(res.reservationDate) }}
            </p>
          </div>
          <div class="res-status" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
            <span class="badge badge-success">Potwierdzona</span>
            <button 
              class="btn btn-secondary" 
              style="padding: 4px 12px; font-size: 0.85rem; border-color: rgba(239, 68, 68, 0.4); color: var(--danger);"
              @click="cancelReservation(res.id)">
              Anuluj
            </button>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <div class="icon">🍿</div>
        <p>Nie masz jeszcze żadnych rezerwacji.</p>
        <router-link to="/" class="btn btn-primary" style="margin-top: 20px">
          Przejdź do repertuaru
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios.js';

const reservations = ref([]);
const loading = ref(true);
const error = ref('');

async function fetchMyReservations() {
  loading.value = true;
  try {
    const res = await api.get('/Reservation/my');
    reservations.value = res.data;
  } catch (e) {
    error.value = 'Nie udało się pobrać Twoich rezerwacji.';
  } finally {
    loading.value = false;
  }
}

async function cancelReservation(id) {
  if (!window.confirm('Czy na pewno chcesz anulować ten bilet? Ta operacja jest nieodwracalna.')) return;

  try {
    await api.delete(`/Reservation/${id}`);
    fetchMyReservations();
  } catch (e) {
    alert('Nie udało się anulować rezerwacji. Upewnij się, że backend działa i jesteś zalogowany.');
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onMounted(fetchMyReservations);
</script>

<style scoped>
.reservations-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.reservation-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
}

.res-icon {
  font-size: 2.5rem;
  background: var(--bg-glass);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.res-details {
  flex-grow: 1;
}

.res-movie {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.res-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.res-date {
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.res-status {
  text-align: right;
}

@media (max-width: 640px) {
  .reservation-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .res-meta {
    justify-content: center;
  }
  
  .res-status {
    text-align: center;
  }
}
</style>
