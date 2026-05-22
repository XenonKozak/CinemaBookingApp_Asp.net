<template>
  <div class="page fade-in">
    <div class="container">
      <div class="hero">
        <h1 class="hero-title">
          Odkryj najlepsze <span class="text-gradient">seanse filmowe</span>
        </h1>
        <p class="hero-subtitle">
          Wybierz film, zarezerwuj miejsce i ciesz się magią kina
        </p>
      </div>

      <div v-if="loading" class="loading-center">
        <div class="spinner"></div>
      </div>

      <div v-else-if="error" class="empty-state">
        <div class="icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="btn btn-secondary" style="margin-top: 16px" @click="fetchMovies">
          Spróbuj ponownie
        </button>
      </div>

      <div v-else-if="movies.length === 0" class="empty-state">
        <div class="icon">🎬</div>
        <p>Brak dostępnych filmów</p>
      </div>

      <div v-else class="grid grid-3">
        <ScreeningCard
          v-for="m in movies"
          :key="m.id"
          :movie="m"
          @select-screening="goToScreening"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios.js';
import ScreeningCard from '../components/ScreeningCard.vue';

const router = useRouter();
const movies = ref([]);
const loading = ref(true);
const error = ref('');

async function fetchMovies() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.get('/Movie/with-screenings');
    // Filtrujemy tylko filmy, które mają przypisane jakieś seanse
    movies.value = res.data.filter(m => m.screenings && m.screenings.length > 0);
  } catch (e) {
    error.value = 'Nie udało się pobrać listy seansów. Upewnij się, że backend jest uruchomiony.';
  } finally {
    loading.value = false;
  }
}

function goToScreening(screeningId) {
  router.push(`/screening/${screeningId}`);
}

onMounted(fetchMovies);
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 40px 0 50px;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 12px;
  line-height: 1.15;
}

.hero-subtitle {
  color: var(--text-secondary);
  font-size: 1.15rem;
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 1.8rem;
  }
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
