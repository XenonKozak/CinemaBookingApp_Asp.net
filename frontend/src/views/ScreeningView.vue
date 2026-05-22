<template>
  <div class="page fade-in">
    <div class="container">
      <!-- Loading -->
      <div v-if="loading" class="loading-center">
        <div class="spinner"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="empty-state">
        <div class="icon">⚠️</div>
        <p>{{ error }}</p>
        <router-link to="/" class="btn btn-secondary" style="margin-top: 16px">
          ← Powrót do repertuaru
        </router-link>
      </div>

      <!-- Content -->
      <template v-else-if="screening">
        <div class="screening-header slide-up">
          <router-link to="/" class="back-link">← Powrót do repertuaru</router-link>

          <div class="screening-info">
            <div v-if="screening.imageUrl" class="screening-poster-container">
              <img :src="screening.imageUrl" alt="Plakat" class="screening-poster-large" />
            </div>

            <div class="screening-meta">
              <span class="badge badge-gold">{{ screening.duration }} min</span>
              <span class="badge badge-purple">
                {{ screening.reservations?.length || 0 }} rezerwacji
              </span>
            </div>

            <h1>{{ screening.movieTitle }}</h1>
            <p class="screening-desc">{{ screening.description }}</p>
          </div>
        </div>

        <div class="screening-content">
          <h2 style="text-align: center; margin-bottom: 32px;">Wybierz swoje miejsce</h2>

          <SeatPicker
            :takenSeats="screening.reservations || []"
            :loading="reserving"
            @confirm="handleReservation"
          />
        </div>

        <!-- Toast -->
        <div v-if="toast" :class="['toast', toast.type === 'success' ? 'toast-success' : 'toast-error']">
          {{ toast.message }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../api/axios.js';
import SeatPicker from '../components/SeatPicker.vue';

const route = useRoute();
const screening = ref(null);
const loading = ref(true);
const error = ref('');
const reserving = ref(false);
const toast = ref(null);

async function fetchScreening() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get(`/Screening/${route.params.id}/Details`);
    screening.value = res.data;
  } catch (e) {
    error.value = 'Nie udało się pobrać danych seansu.';
  } finally {
    loading.value = false;
  }
}

async function handleReservation(seat) {
  reserving.value = true;
  try {
    await api.post('/Reservation', {
      seatNumber: seat.seat,
      row: seat.row,
      reservationDate: new Date().toISOString(),
      screeningId: route.params.id,
    });

    showToast('success', `Zarezerwowano miejsce ${seat.row}${seat.seat}! 🎉`);

    // Odśwież dane seansu żeby zaktualizować zajęte miejsca
    await fetchScreening();
  } catch (e) {
    if (e.response?.status === 400) {
      showToast('error', 'To miejsce jest już zajęte lub dane są nieprawidłowe.');
    } else if (e.response?.status === 401) {
      showToast('error', 'Musisz być zalogowany, aby dokonać rezerwacji.');
    } else {
      showToast('error', 'Wystąpił błąd podczas rezerwacji.');
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
.screening-header {
  margin-bottom: 48px;
}

.back-link {
  display: inline-block;
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--accent-gold);
}

.screening-info {
  text-align: center;
}

.screening-meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.screening-poster-container {
  max-width: 400px;
  margin: 0 auto 32px auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.screening-poster-large {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.screening-info h1 {
  font-size: 2.4rem;
  font-weight: 800;
  margin-bottom: 12px;
}

.screening-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto;
}

.screening-content {
  max-width: 700px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .screening-info h1 {
    font-size: 1.6rem;
  }
}
</style>
