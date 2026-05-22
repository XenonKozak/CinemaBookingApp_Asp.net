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
        <p>Brak dostępnych filmów z seansami</p>
        <button class="btn btn-secondary" style="margin-top: 16px" @click="fetchMovies">
          Odśwież listę
        </button>
      </div>

      <div v-else class="grid grid-repertoire">
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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../api/axios.js';
import ScreeningCard from '../components/ScreeningCard.vue';
import { buildRepertoire, REPERTOIRE_REFRESH_EVENT } from '../utils/screeningTime.js';

const router = useRouter();
const route = useRoute();
const movies = ref([]);
const loading = ref(true);
const error = ref('');

async function fetchMovies() {
  loading.value = true;
  error.value = '';
  const bust = Date.now();
  try {
    const [moviesRes, screeningsRes] = await Promise.all([
      api.get('/Movie', { params: { _: bust }, headers: { 'Cache-Control': 'no-cache' } }),
      api.get('/Screening', { params: { _: bust }, headers: { 'Cache-Control': 'no-cache' } }),
    ]);
    movies.value = buildRepertoire(moviesRes.data, screeningsRes.data);
  } catch {
    error.value = 'Nie udało się pobrać listy seansów. Upewnij się, że backend jest uruchomiony.';
  } finally {
    loading.value = false;
  }
}

function goToScreening(screeningId) {
  router.push(`/screening/${screeningId}`);
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible' && route.name === 'Home') {
    fetchMovies();
  }
}

onMounted(() => {
  fetchMovies();
  window.addEventListener(REPERTOIRE_REFRESH_EVENT, fetchMovies);
  document.addEventListener('visibilitychange', onVisibilityChange);
});

onUnmounted(() => {
  window.removeEventListener(REPERTOIRE_REFRESH_EVENT, fetchMovies);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});

watch(
  () => route.name,
  (name) => {
    if (name === 'Home') fetchMovies();
  }
);
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

:global(.grid-repertoire) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
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
