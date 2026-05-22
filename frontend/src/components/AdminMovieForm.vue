<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Edytuj film' : 'Dodaj nowy film' }}</h3>
        <button type="button" class="modal-close" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="title">Tytuł filmu</label>
          <input
            id="title"
            v-model="form.title"
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
          <label>Plakat (opcjonalnie)</label>
          <div class="poster-zone">
            <label for="poster" class="poster-picker">
              <img
                v-if="previewUrl"
                :src="previewUrl"
                alt="Podgląd plakatu"
                class="poster-preview"
              />
              <span v-else class="poster-empty">
                <span class="poster-icon">📷</span>
                <span>Wybierz plakat</span>
              </span>
            </label>
            <input
              id="poster"
              type="file"
              accept="image/*"
              class="poster-input"
              @change="handleFileChange"
            />
            <button
              v-if="previewUrl"
              type="button"
              class="poster-clear"
              @click="clearPoster"
            >
              Usuń wybrany plakat
            </button>
          </div>
        </div>

        <div v-if="error" class="form-error">{{ error }}</div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Anuluj</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Zapisuję...' : isEdit ? 'Zapisz zmiany' : 'Dodaj film' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';

const props = defineProps({
  movie: {
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

const isEdit = computed(() => !!props.movie);

const form = reactive({
  title: '',
  description: '',
  duration: 0,
});

const selectedFile = ref(null);
const objectPreviewUrl = ref(null);

const previewUrl = computed(() => {
  if (objectPreviewUrl.value) return objectPreviewUrl.value;
  if (!selectedFile.value && props.movie?.imageUrl) return props.movie.imageUrl;
  return null;
});

watch(
  () => props.movie,
  (m) => {
    form.title = m?.title || '';
    form.description = m?.description || '';
    form.duration = m?.duration || 0;
    
    selectedFile.value = null;
    revokeObjectUrl();
  },
  { immediate: true }
);

function revokeObjectUrl() {
  if (objectPreviewUrl.value) {
    URL.revokeObjectURL(objectPreviewUrl.value);
    objectPreviewUrl.value = null;
  }
}

function handleFileChange(event) {
  const file = event.target.files[0];
  revokeObjectUrl();
  if (file) {
    selectedFile.value = file;
    objectPreviewUrl.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
  }
}

function clearPoster() {
  revokeObjectUrl();
  selectedFile.value = null;
  const input = document.getElementById('poster');
  if (input) input.value = '';
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

.poster-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.poster-picker {
  display: block;
  width: 110px;
  height: 165px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border);
  background: var(--bg-input);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.poster-picker:hover {
  border-color: var(--accent-gold);
}

.poster-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-align: center;
  padding: 8px;
}

.poster-icon {
  font-size: 1.6rem;
}

.poster-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.poster-clear {
  background: none;
  border: none;
  color: var(--danger);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px;
}

.poster-clear:hover {
  text-decoration: underline;
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
