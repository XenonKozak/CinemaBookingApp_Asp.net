<template>
  <div class="page fade-in screening-page">
    <div class="container">
      <div v-if="loading" class="loading-center">
        <div class="spinner"></div>
      </div>

      <div v-else-if="error" class="empty-state">
        <div class="icon">⚠️</div>
        <p>{{ error }}</p>
        <router-link to="/" class="btn btn-secondary" style="margin-top: 16px">
          ← Powrót do repertuaru
        </router-link>
      </div>

      <template v-else-if="screening">
        <router-link to="/" class="back-link">← Powrót do repertuaru</router-link>

        <div class="movie-card glass-card">
          <img
            v-if="screening.imageUrl"
            :src="screening.imageUrl"
            alt="Plakat"
            class="movie-poster"
          />
          <div v-else class="movie-poster-placeholder">🎞️</div>
          <div class="movie-info">
            <h1 class="movie-title">{{ screening.movieTitle }}</h1>
            <div class="movie-meta">
              <span class="badge badge-gold">{{ screening.duration }} min</span>
              <span class="badge badge-purple">
                {{ screening.reservations?.length || 0 }} rezerwacji
              </span>
            </div>
            <p v-if="screening.description" class="movie-desc-preview">
              {{ screening.description }}
            </p>
          </div>
        </div>

        <section class="hall-section">
          <h2 class="section-title">Wybierz swoje miejsce</h2>
          <p class="section-subtitle">Mapa sali — wybierz jedno lub więcej miejsc</p>

          <SeatPicker
            :taken-seats="screening.reservations || []"
            v-model:selected-seats="selectedSeats"
          />
        </section>

        <div
          v-if="selectedSeats.length > 0"
          class="booking-footer"
          :class="{ 'booking-footer--open': selectedSeats.length > 0 }"
        >
          <div class="footer-inner">
            <div class="footer-info">
              <span class="footer-label">Wybrane miejsca ({{ selectedSeats.length }})</span>
              <span class="footer-seats">{{ seatsLabel }}</span>
            </div>
            <button
              class="btn btn-primary footer-btn"
              :disabled="reserving"
              @click="handleReservation"
            >
              {{
                reserving
                  ? 'Rezerwuję...'
                  : selectedSeats.length === 1
                    ? 'Potwierdź rezerwację ✓'
                    : `Rezerwuj ${selectedSeats.length} miejsca ✓`
              }}
            </button>
            <button
              type="button"
              class="footer-clear"
              :disabled="reserving"
              @click="selectedSeats = []"
            >
              Wyczyść wybór
            </button>
          </div>
        </div>

        <div
          v-if="toast"
          :class="[
            'toast',
            toast.type === 'success' ? 'toast-success' : 'toast-error',
            { 'toast--above-footer': selectedSeats.length > 0 },
          ]"
        >
          {{ toast.message }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/axios.js';
import SeatPicker from '../components/SeatPicker.vue';

const route = useRoute();
const router = useRouter();
const screening = ref(null);
const loading = ref(true);
const error = ref('');
const reserving = ref(false);
const toast = ref(null);
const selectedSeats = ref([]);

const seatsLabel = computed(() =>
  selectedSeats.value.map((s) => `${s.row}${s.seat}`).join(', ')
);

async function fetchScreening() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get(`/Screening/${route.params.id}/Details`);
    screening.value = res.data;
  } catch {
    error.value = 'Nie udało się pobrać danych seansu.';
  } finally {
    loading.value = false;
  }
}

async function handleReservation() {
  if (selectedSeats.value.length === 0) return;

  reserving.value = true;
  const reservationDate = new Date().toISOString();

  try {
    const seatsPayload = selectedSeats.value.map(seat => ({
      seatNumber: seat.seat,
      row: seat.row
    }));

    await api.post('/Reservation', {
      seats: seatsPayload,
      reservationDate,
      screeningId: route.params.id,
    });

    const labels = selectedSeats.value.map((s) => `${s.row}${s.seat}`).join(', ');
    router.push({
      name: 'Success',
      query: {
        title: screening.value.movieTitle,
        seats: labels,
        imageUrl: screening.value.imageUrl || ''
      }
    });
  } catch (e) {
    if (e.response?.status === 401) {
      showToast('error', 'Musisz być zalogowany, aby dokonać rezerwacji.');
    } else {
      showToast('error', 'Część miejsc nie została zarezerwowana (może być już zajęta).');
    }
  } finally {
    reserving.value = false;
  }
}

function showToast(type, message) {
  toast.value = { type, message };
  setTimeout(() => {
    toast.value = null;
  }, 3000);
}

onMounted(fetchScreening);
</script>

<style scoped>
.screening-page {
  padding-bottom: 40px;
}

.screening-page:has(.booking-footer--open) {
  padding-bottom: 200px;
}

.back-link {
  display: inline-block;
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--accent-gold);
}

.movie-card {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  padding: 32px;
  margin-bottom: 40px;
}

.movie-poster {
  width: 180px;
  height: 270px;
  object-fit: cover;
  border-radius: 16px;
  flex-shrink: 0;
  background: var(--bg-input);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.movie-poster-placeholder {
  width: 180px;
  height: 270px;
  border-radius: 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.movie-info {
  flex: 1;
  min-width: 0;
  padding-top: 12px;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 16px;
  line-height: 1.2;
}

.movie-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.movie-meta .badge {
  font-size: 1rem;
  padding: 6px 14px;
}

.movie-desc-preview {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.hall-section {
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 6px;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0 0 20px;
}

.booking-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.35);
}

.footer-inner {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px 24px 20px;
}

.footer-info {
  margin-bottom: 12px;
}

.footer-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.footer-seats {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--accent-gold-light);
  word-break: break-word;
}

.footer-btn {
  width: 100%;
  padding: 14px;
  font-weight: 800;
  margin-bottom: 8px;
}

.footer-clear {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.88rem;
  cursor: pointer;
  padding: 8px;
}

.footer-clear:hover {
  color: var(--text-primary);
}

.toast--above-footer {
  bottom: 180px;
}

@media (max-width: 640px) {
  .movie-card {
    flex-direction: row;
  }

  .movie-title {
    font-size: 1.1rem;
  }
}
</style>
