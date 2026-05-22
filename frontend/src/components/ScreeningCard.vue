<template>
  <div class="screening-card glass-card" @click="$emit('select', screening.id)">
    <div v-if="screening.imageUrl" class="card-image-wrapper">
      <img :src="screening.imageUrl" alt="Poster" class="card-image" />
    </div>
    <div class="card-header">
      <div v-if="!screening.imageUrl" class="card-icon">🎞️</div>
      <span class="badge badge-gold" :class="{ 'absolute-badge': screening.imageUrl }">{{ screening.duration }} min</span>
    </div>
    <h3 class="card-title">{{ screening.movieTitle }}</h3>
    <p class="card-desc">{{ screening.description }}</p>
    <div class="card-footer">
      <button class="btn btn-primary btn-sm" @click.stop="$emit('select', screening.id)">
        Zarezerwuj miejsce →
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  screening: {
    type: Object,
    required: true,
  },
});

defineEmits(['select']);
</script>

<style scoped>
.screening-card {
  padding: 28px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  overflow: hidden;
}

.screening-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-purple));
  opacity: 0;
  transition: opacity var(--transition-base);
}

.screening-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-icon {
  font-size: 2rem;
}

.card-image-wrapper {
  width: calc(100% + 56px);
  margin: -28px -28px 14px -28px;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.screening-card:hover .card-image {
  transform: scale(1.05);
}

.absolute-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-desc {
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.5;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  padding-top: 8px;
}
</style>
