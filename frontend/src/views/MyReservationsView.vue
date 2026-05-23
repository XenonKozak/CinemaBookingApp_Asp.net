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
              <Calendar size="14" style="margin-right: 6px;" />
              {{ formatDate(res.reservationDate) }}
            </p>
          </div>
          <div class="res-status">
            <div class="status-indicator">
              <span class="status-dot"></span>
              <span>Potwierdzona</span>
            </div>
            <button 
              class="btn-cancel" 
              @click="cancelReservation(res.id)"
              title="Zrezygnuj z rezerwacji"
            >
              <Trash2 size="14" />
              Odwołaj
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
import { Calendar, Trash2 } from 'lucide-vue-next';
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
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  margin: 0;
}

.res-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 120px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--success);
}

.btn-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.btn-review {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
  color: var(--accent-gold);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-review:hover {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.4);
  transform: translateY(-1px);
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

  .res-date {
    justify-content: center;
  }
  
  .res-status {
    align-items: center;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
}
</style>
