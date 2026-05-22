<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Edytuj seans' : 'Dodaj nowy seans' }}</h3>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="movieTitle">Tytuł filmu</label>
          <input
            id="movieTitle"
            v-model="form.movieTitle"
            class="form-input"
            type="text"
            placeholder="np. Incepcja"
            required
            minlength="1"
            maxlength="100"
          />
        </div>

        <div class="form-group">
          <label for="description">Opis</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-input"
            placeholder="Krótki opis filmu (min. 10 znaków)"
            required
            minlength="10"
            maxlength="100"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="duration">Czas trwania (minuty)</label>
          <input
            id="duration"
            v-model.number="form.duration"
            class="form-input"
            type="number"
            placeholder="np. 148"
            required
            min="1"
            max="239"
          />
        </div>

        <div class="form-group">
          <label for="poster">Plakat (opcjonalnie)</label>
          <input
            id="poster"
            type="file"
            accept="image/*"
            class="form-input"
            @change="handleFileChange"
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
import { reactive, ref } from 'vue';

const props = defineProps({
  screening: {
    type: Object,
    default: null,
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

const isEdit = !!props.screening;

const form = reactive({
  movieTitle: props.screening?.movieTitle || '',
  description: props.screening?.description || '',
  duration: props.screening?.duration || 0,
});

const selectedFile = ref(null);

function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  } else {
    selectedFile.value = null;
  }
}

function handleSubmit() {
  emit('submit', { ...form, file: selectedFile.value });
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
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
