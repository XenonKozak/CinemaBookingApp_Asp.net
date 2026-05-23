<template>
  <article class="movie-card glass-card">
    <div 
      class="card-header"
      :style="movie.imageUrl ? `background-image: url(${movie.imageUrl})` : ''"
    >
      <div v-if="!movie.imageUrl" class="card-thumb-placeholder">
        <span class="icon">🎞️</span>
      </div>
      <div class="duration-badge">⏱ {{ movie.duration }} min</div>
    </div>

    <div class="card-content">
      <h3 class="card-title" :title="movie.title">{{ movie.title }}</h3>
      <p class="card-desc">{{ movie.description }}</p>

      <div class="screenings-section">
        <div class="times-row">
          <button
            v-for="s in sortedScreenings"
            :key="s.id"
            type="button"
            class="time-pill"
            @click="$emit('select-screening', s.id)"
          >
            <span class="time-pill-clock">{{ formatScreeningClock(s.screeningTime) }}</span>
            <span class="time-pill-dot">·</span>
            <span class="time-pill-day">{{ formatScreeningDayShort(s.screeningTime) }}</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import {
  parseScreeningTime,
  formatScreeningClock,
  formatScreeningDayShort,
  getMovieScreenings,
} from '../utils/screeningTime.js';

const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
});

defineEmits(['select-screening']);

const sortedScreenings = computed(() => {
  const list = getMovieScreenings(props.movie);
  return [...list].sort(
    (a, b) => parseScreeningTime(a.screeningTime) - parseScreeningTime(b.screeningTime)
  );
});
</script>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease;
}

.movie-card:hover {
  transform: scale(1.01) translateY(-4px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
}

.movie-card:active {
  transform: scale(0.99);
  transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.card-header {
  position: relative;
  width: 100%;
  height: 380px;
  background-size: cover;
  background-position: center;
  background-color: var(--bg-input);
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
}

.card-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  opacity: 0.5;
}

.duration-badge {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.card-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin: 0 0 6px;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--text-primary);
  word-break: break-word;
}

.card-desc {
  margin: 0 0 14px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.screenings-section {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.times-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.time-pill:hover {
  background: var(--accent-gold);
  border-color: var(--accent-gold);
  box-shadow: 0 4px 14px rgba(212, 168, 67, 0.25);
}

.time-pill:hover .time-pill-clock,
.time-pill:hover .time-pill-day,
.time-pill:hover .time-pill-dot {
  color: #0a0a1a;
}

.time-pill-clock {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.time-pill-dot {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.7;
}

.time-pill-day {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
}

@media (max-width: 480px) {
  .card-header {
    height: 300px;
  }
}
</style>
