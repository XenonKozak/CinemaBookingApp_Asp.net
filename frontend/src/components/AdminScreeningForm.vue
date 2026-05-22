<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Edytuj seans' : 'Dodaj nowy seans' }}</h3>
        <button type="button" class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group" v-if="!isEdit">
          <label>Wybierz film</label>
          <div class="movie-picker">
            <button
              v-for="m in movies"
              :key="m.id"
              type="button"
              class="movie-picker-item"
              :class="{ active: form.movieId === m.id }"
              @click="form.movieId = m.id"
            >
              <span class="movie-picker-title">{{ m.title }}</span>
              <span class="movie-picker-meta">{{ m.duration }} min</span>
            </button>
          </div>
          <p v-if="!form.movieId" class="picker-hint">Wybierz film z listy powyżej.</p>
        </div>

        <div class="form-group">
          <label for="screeningTime">Data i godzina seansu</label>
          <input
            id="screeningTime"
            v-model="form.screeningTime"
            class="form-input"
            type="datetime-local"
            required
          />
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Anuluj</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Zapisuję...' : isEdit ? 'Zapisz zmiany' : 'Dodaj seans' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { toDatetimeLocalValue, defaultDatetimeLocal } from '../utils/screeningTime.js';

const props = defineProps({
  screening: {
    type: Object,
    default: null,
  },
  movies: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['submit', 'close']);

const isEdit = computed(() => !!props.screening);

const form = reactive({
  movieId: '',
  screeningTime: '',
});

watch(
  () => props.screening,
  (s) => {
    form.movieId = s?.movieId || '';
    
    form.screeningTime = s?.screeningTime
      ? toDatetimeLocalValue(s.screeningTime)
      : defaultDatetimeLocal(1);
  },
  { immediate: true }
);

function handleSubmit() {
  if (!isEdit.value && !form.movieId) return;
  emit('submit', { ...form });
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  color: var(--danger);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}

.movie-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.movie-picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.movie-picker-item:hover {
  border-color: var(--accent-gold);
  background: rgba(212, 168, 67, 0.08);
}

.movie-picker-item.active {
  border-color: var(--accent-gold);
  background: rgba(212, 168, 67, 0.15);
  box-shadow: 0 0 0 2px rgba(212, 168, 67, 0.2);
}

.movie-picker-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.movie-picker-meta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent-gold-light);
  flex-shrink: 0;
}

.picker-hint {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
