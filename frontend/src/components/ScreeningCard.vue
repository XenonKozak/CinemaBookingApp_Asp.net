<template>
  <article class="movie-card glass-card">
    <div class="card-thumb-wrapper">
      <img
        v-if="movie.imageUrl"
        :src="movie.imageUrl"
        alt="Plakat filmu"
        class="card-thumb"
      />
      <div v-else class="card-thumb-placeholder">
        <span class="icon">🎞️</span>
      </div>
      <div class="duration-badge">{{ movie.duration }} min</div>
    </div>

    <div class="card-content">
      <h3 class="card-title" :title="movie.title">{{ movie.title }}</h3>
      <p class="card-desc">{{ movie.description }}</p>

      <div class="screenings-section">
        <p class="screenings-title">Dostępne godziny:</p>
        <div class="screenings-list">
          <button
            v-for="s in sortedScreenings"
            :key="s.id"
            class="screening-chip"
            @click="$emit('select-screening', s.id)"
          >
            {{ formatTime(s.screeningTime) }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
});

defineEmits(['select-screening']);

const sortedScreenings = computed(() => {
  if (!props.movie.screenings) return [];
  return [...props.movie.screenings].sort((a, b) => new Date(a.screeningTime) - new Date(b.screeningTime));
});

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('pl-PL', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}
</script>

<style scoped>
.movie-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.movie-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
}

.card-thumb-wrapper {
  position: relative;
  width: 100%;
  padding-top: 130%;
  background: var(--bg-input);
  overflow: hidden;
}

.card-thumb {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.movie-card:hover .card-thumb {
  transform: scale(1.05);
}

.card-thumb-placeholder {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  opacity: 0.5;
}

.duration-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: var(--accent-gold);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgba(226, 172, 85, 0.3);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  margin: 0 0 8px;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc {
  margin: 0 0 16px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.screenings-section {
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.screenings-title {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.screenings-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.screening-chip {
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.screening-chip:hover {
  background: var(--accent-gold);
  color: #000;
  border-color: var(--accent-gold);
  transform: translateY(-2px);
}
</style>
