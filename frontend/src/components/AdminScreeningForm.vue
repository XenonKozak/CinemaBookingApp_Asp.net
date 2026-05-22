<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Edytuj seans' : 'Dodaj nowy seans' }}</h3>
        <button type="button" class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group" v-if="!isEdit">
          <label for="movieId">Wybierz film</label>
          <select id="movieId" v-model="form.movieId" class="form-input" required>
            <option disabled value="">-- wybierz film --</option>
            <option v-for="m in movies" :key="m.id" :value="m.id">
              {{ m.title }}
            </option>
          </select>
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
    
    if (s?.screeningTime) {
      const d = new Date(s.screeningTime);
      const tzOffset = d.getTimezoneOffset() * 60000;
      form.screeningTime = (new Date(d - tzOffset)).toISOString().slice(0, 16);
    } else {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const tzOffset = now.getTimezoneOffset() * 60000;
      form.screeningTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
    }
  },
  { immediate: true }
);

function handleSubmit() {
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
</style>
