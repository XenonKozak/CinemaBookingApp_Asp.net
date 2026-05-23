<template>
  <div class="page fade-in">
    <div class="container">
      <div class="page-header" style="display:flex;align-items:center;gap:16px;">
        <Settings size="40" color="var(--text-secondary)" />
        <div>
          <h1>Panel <span class="text-gradient">Administratora</span></h1>
          <p>Zarządzaj filmami i seansami</p>
        </div>
      </div>

      <div class="admin-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'movies' }" @click="activeTab = 'movies'">Filmy</button>
        <button class="tab-btn" :class="{ active: activeTab === 'screenings' }" @click="activeTab = 'screenings'">Seanse</button>
      </div>

      <!-- MOVIES TAB -->
      <div v-if="activeTab === 'movies'" class="tab-content">
        <div class="admin-toolbar">
          <span class="admin-count">{{ movies.length }} filmów</span>
          <button class="btn btn-primary" @click="openMovieCreate">+ Dodaj film</button>
        </div>

        <div v-if="loading" class="loading-center">
          <div class="spinner"></div>
        </div>

        <div v-else-if="movies.length > 0" class="admin-list">
          <article v-for="m in movies" :key="m.id" class="admin-card glass-card">
            <div class="admin-card-top">
              <img v-if="m.imageUrl" :src="m.imageUrl" alt="" class="admin-thumb" />
              <div v-else class="admin-thumb-placeholder"><Film size="24" color="var(--text-muted)" /></div>
              <div class="admin-head">
                <h3 class="admin-title">{{ m.title }}</h3>
                <span class="badge badge-gold">{{ m.duration }} min</span>
              </div>
            </div>
            <p class="admin-desc">{{ m.description }}</p>
            <div class="admin-actions">
              <button class="btn btn-secondary btn-sm" @click="openMovieEdit(m)"><Pencil size="14" style="margin-right:4px; margin-top:-2px;" /> Edytuj</button>
              <button class="btn btn-danger btn-sm" @click="confirmMovieDelete(m)"><Trash2 size="14" style="margin-right:4px; margin-top:-2px;" /> Usuń</button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="icon"><Clapperboard size="48" /></div>
          <p>Brak filmów. Dodaj pierwszy film!</p>
          <button class="btn btn-primary" style="margin-top: 16px" @click="openMovieCreate">
            + Dodaj film
          </button>
        </div>
      </div>

      <!-- SCREENINGS TAB -->
      <div v-if="activeTab === 'screenings'" class="tab-content">
        <div class="admin-toolbar">
          <span class="admin-count">{{ screenings.length }} seansów</span>
          <button class="btn btn-primary" @click="openScreeningCreate">+ Dodaj seans</button>
        </div>

        <div v-if="loading" class="loading-center">
          <div class="spinner"></div>
        </div>

        <div v-else-if="moviesWithScreenings.length > 0" class="admin-list">
          <article v-for="m in moviesWithScreenings" :key="m.id" class="admin-card glass-card">
            <div class="admin-card-top">
              <img v-if="m.imageUrl" :src="m.imageUrl" alt="" class="admin-thumb" />
              <div v-else class="admin-thumb-placeholder">🎞️</div>
              <div class="admin-head">
                <h3 class="admin-title">{{ m.title }}</h3>
                <span class="admin-desc" style="display:block; margin:0">{{ m.movieScreenings.length }} seansów</span>
              </div>
            </div>
            <div class="screenings-list">
              <div v-for="s in m.movieScreenings" :key="s.id" class="screening-row">
                <span class="badge badge-purple" style="font-weight: 600">{{ formatTime(s.screeningTime) }}</span>
                <div class="screening-actions">
                  <button class="icon-btn" @click="openScreeningEdit(s)"><Pencil size="16" /></button>
                  <button class="icon-btn danger" @click="confirmScreeningDelete(s)"><Trash2 size="16" /></button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <div class="icon"><Calendar size="48" /></div>
          <p>Brak seansów. Najpierw dodaj film, a potem zaplanuj seans!</p>
          <button class="btn btn-primary" style="margin-top: 16px" @click="openScreeningCreate" :disabled="movies.length === 0">
            + Dodaj seans
          </button>
        </div>
      </div>

      <!-- MODALS -->
      <AdminMovieForm
        v-if="showMovieForm"
        :movie="editingMovie"
        :loading="formLoading"
        :error="formError"
        @submit="handleMovieSubmit"
        @close="closeMovieForm"
      />

      <AdminScreeningForm
        v-if="showScreeningForm"
        :screening="editingScreening"
        :movies="movies"
        :loading="formLoading"
        :error="formError"
        @submit="handleScreeningSubmit"
        @close="closeScreeningForm"
      />

      <!-- DELETE MOVIE CONFIRM -->
      <div v-if="deletingMovie" class="modal-overlay" @click.self="deletingMovie = null">
        <div class="modal">
          <div class="modal-header">
            <h3>Potwierdź usunięcie</h3>
            <button class="modal-close" @click="deletingMovie = null">&times;</button>
          </div>
          <p class="modal-text">Czy na pewno chcesz usunąć film:</p>
          <p class="modal-title">„{{ deletingMovie.title }}"?</p>
          <p class="modal-warning">
            ⚠️ Wszystkie seanse powiązane z tym filmem zostaną również usunięte!
          </p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="deletingMovie = null">Anuluj</button>
            <button class="btn btn-danger" @click="handleMovieDelete" :disabled="deleteLoading">
              {{ deleteLoading ? 'Usuwanie...' : 'Usuń' }}
            </button>
          </div>
        </div>
      </div>

      <!-- DELETE SCREENING CONFIRM -->
      <div v-if="deletingScreening" class="modal-overlay" @click.self="deletingScreening = null">
        <div class="modal">
          <div class="modal-header">
            <h3>Potwierdź usunięcie</h3>
            <button class="modal-close" @click="deletingScreening = null">&times;</button>
          </div>
          <p class="modal-text">Czy na pewno chcesz usunąć seans:</p>
          <p class="modal-title">„{{ getMovieTitle(deletingScreening.movieId) }}" ({{ formatTime(deletingScreening.screeningTime) }})?</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="deletingScreening = null">Anuluj</button>
            <button class="btn btn-danger" @click="handleScreeningDelete" :disabled="deleteLoading">
              {{ deleteLoading ? 'Usuwanie...' : 'Usuń' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="toast" :class="['toast', toast.type === 'success' ? 'toast-success' : 'toast-error']">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios.js';
import AdminMovieForm from '../components/AdminMovieForm.vue';
import AdminScreeningForm from '../components/AdminScreeningForm.vue';
import { formatScreeningDateTime, toApiScreeningTime, notifyRepertoireRefresh } from '../utils/screeningTime.js';
import { Settings, Film, Clapperboard, Pencil, Trash2, Calendar } from 'lucide-vue-next';

const activeTab = ref('movies');

const movies = ref([]);
const screenings = ref([]);
const loading = ref(true);

const moviesWithScreenings = computed(() => {
  return movies.value
    .map(m => ({ ...m, movieScreenings: screenings.value.filter(s => s.movieId === m.id) }))
    .filter(m => m.movieScreenings.length > 0);
});

const showMovieForm = ref(false);
const editingMovie = ref(null);

const showScreeningForm = ref(false);
const editingScreening = ref(null);

const formLoading = ref(false);
const formError = ref('');

const deletingMovie = ref(null);
const deletingScreening = ref(null);
const deleteLoading = ref(false);
const toast = ref(null);

async function fetchData() {
  loading.value = true;
  try {
    const [moviesRes, screeningsRes] = await Promise.all([
      api.get('/Movie'),
      api.get('/Screening')
    ]);
    movies.value = moviesRes.data;
    screenings.value = screeningsRes.data;
  } catch {
    showToast('error', 'Nie udało się pobrać danych.');
  } finally {
    loading.value = false;
  }
}

function getMovieTitle(id) {
  const m = movies.value.find(x => x.id === id);
  return m ? m.title : 'Nieznany film';
}

function formatTime(dateStr) {
  return formatScreeningDateTime(dateStr);
}

// Movies
function openMovieCreate() { editingMovie.value = null; formError.value = ''; showMovieForm.value = true; }
function openMovieEdit(movie) { editingMovie.value = { ...movie }; formError.value = ''; showMovieForm.value = true; }
function closeMovieForm() { showMovieForm.value = false; editingMovie.value = null; }

async function handleMovieSubmit(data) {
  formLoading.value = true; formError.value = '';
  try {
    const file = data.file; delete data.file;
    let movieId = editingMovie.value?.id;

    if (editingMovie.value) {
      await api.put(`/Movie/${movieId}`, data);
      showToast('success', `Film „${data.title}" zaktualizowany.`);
    } else {
      const res = await api.post('/Movie', data);
      movieId = res.data?.id ?? res.data?.Id;
      showToast('success', `Film „${data.title}" dodany.`);
    }

    if (file && movieId) {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/Movie/${movieId}/poster`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    closeMovieForm();
    await fetchData();
    notifyRepertoireRefresh();
  } catch (e) {
    const msg = e.response?.data?.title || e.response?.data?.message || e.response?.data;
    formError.value = typeof msg === 'string' ? msg : 'Wystąpił błąd zapisu filmu (sprawdź połączenie z API).';
  } finally { formLoading.value = false; }
}

function confirmMovieDelete(movie) { deletingMovie.value = movie; }
async function handleMovieDelete() {
  deleteLoading.value = true;
  try {
    await api.delete(`/Movie/${deletingMovie.value.id}`);
    showToast('success', `Film usunięty.`);
    deletingMovie.value = null; await fetchData();
  } catch { showToast('error', 'Nie udało się usunąć filmu.'); }
  finally { deleteLoading.value = false; }
}

// Screenings
function openScreeningCreate() { editingScreening.value = null; formError.value = ''; showScreeningForm.value = true; }
function openScreeningEdit(screening) { editingScreening.value = { ...screening }; formError.value = ''; showScreeningForm.value = true; }
function closeScreeningForm() { showScreeningForm.value = false; editingScreening.value = null; }

async function handleScreeningSubmit(data) {
  formLoading.value = true; formError.value = '';
  const payload = {
    movieId: data.movieId,
    screeningTime: toApiScreeningTime(data.screeningTime),
  };
  try {
    if (editingScreening.value) {
      await api.put(`/Screening/${editingScreening.value.id}`, payload);
      showToast('success', `Zaktualizowano seans.`);
    } else {
      await api.post('/Screening', payload);
      showToast('success', `Dodano nowy seans.`);
    }
    closeScreeningForm();
    await fetchData();
    notifyRepertoireRefresh();
  } catch (e) {
    const msg = e.response?.data;
    formError.value =
      typeof msg === 'string' && msg
        ? msg
        : 'Wystąpił błąd zapisu seansu (sprawdź czy ta godzina już nie istnieje).';
  } finally { formLoading.value = false; }
}

function confirmScreeningDelete(screening) { deletingScreening.value = screening; }
async function handleScreeningDelete() {
  deleteLoading.value = true;
  try {
    await api.delete(`/Screening/${deletingScreening.value.id}`);
    showToast('success', `Seans usunięty.`);
    deletingScreening.value = null;
    await fetchData();
    notifyRepertoireRefresh();
  } catch { showToast('error', 'Nie udało się usunąć seansu.'); }
  finally { deleteLoading.value = false; }
}

function showToast(type, message) {
  toast.value = { type, message };
  setTimeout(() => { toast.value = null; }, 3000);
}

onMounted(fetchData);
</script>

<style scoped>
.admin-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.tab-btn {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 10px 20px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
}
.tab-btn:hover { background: rgba(255, 255, 255, 0.1); }
.tab-btn.active { background: var(--accent-gold); color: #000; border-color: var(--accent-gold); }

.admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.admin-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 640px;
  margin: 0 auto;
}

.admin-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.admin-card-top {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 0;
}

.admin-thumb {
  width: 140px;
  height: 210px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  background: var(--bg-input);
}

.admin-thumb-placeholder {
  width: 140px;
  height: 210px;
  border-radius: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-head {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin-title {
  margin: 0 0 12px;
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.2;
}

.admin-desc {
  margin: 16px 0 20px;
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.admin-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.modal-text {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.modal-title {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.modal-warning {
  color: var(--danger);
  font-size: 0.85rem;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.screenings-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.screening-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-input);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
}
.screening-actions {
  display: flex;
  gap: 12px;
}
.icon-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.icon-btn:hover { opacity: 1; }
.icon-btn.danger { color: var(--danger); }
</style>
