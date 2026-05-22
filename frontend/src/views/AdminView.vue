<template>
  <div class="page fade-in">
    <div class="container">
      <div class="page-header">
        <h1>⚙️ Panel <span class="text-gradient">Administratora</span></h1>
        <p>Zarządzaj seansami filmowymi</p>
      </div>

      <!-- Toolbar -->
      <div class="admin-toolbar">
        <span class="admin-count">{{ screenings.length }} seansów</span>
        <button class="btn btn-primary" @click="openCreate">
          + Dodaj nowy seans
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-center">
        <div class="spinner"></div>
      </div>

      <!-- Table -->
      <div v-else-if="screenings.length > 0" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tytuł</th>
              <th>Opis</th>
              <th>Czas (min)</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in screenings" :key="s.id">
              <td class="td-title">{{ s.movieTitle }}</td>
              <td class="td-desc">{{ s.description }}</td>
              <td>
                <span class="badge badge-gold">{{ s.duration }} min</span>
              </td>
              <td class="td-actions">
                <button class="btn btn-secondary btn-sm" @click="openEdit(s)">✏️ Edytuj</button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(s)">🗑️ Usuń</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-else class="empty-state">
        <div class="icon">🎬</div>
        <p>Brak seansów. Dodaj pierwszy seans!</p>
      </div>

      <!-- Create/Edit Modal -->
      <AdminScreeningForm
        v-if="showForm"
        :screening="editingScreening"
        :loading="formLoading"
        :error="formError"
        @submit="handleFormSubmit"
        @close="closeForm"
      />

      <!-- Delete Confirmation -->
      <div v-if="deletingScreening" class="modal-overlay" @click.self="deletingScreening = null">
        <div class="modal">
          <div class="modal-header">
            <h3>Potwierdź usunięcie</h3>
            <button class="modal-close" @click="deletingScreening = null">&times;</button>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 8px;">
            Czy na pewno chcesz usunąć seans:
          </p>
          <p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 24px;">
            „{{ deletingScreening.movieTitle }}"?
          </p>
          <p style="color: var(--danger); font-size: 0.85rem; margin-bottom: 24px;">
            ⚠️ Wszystkie rezerwacje powiązane z tym seansem zostaną również usunięte!
          </p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="btn btn-secondary" @click="deletingScreening = null">Anuluj</button>
            <button class="btn btn-danger" @click="handleDelete" :disabled="deleteLoading">
              {{ deleteLoading ? 'Usuwanie...' : 'Usuń' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div v-if="toast" :class="['toast', toast.type === 'success' ? 'toast-success' : 'toast-error']">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios.js';
import AdminScreeningForm from '../components/AdminScreeningForm.vue';

const screenings = ref([]);
const loading = ref(true);

// Form state
const showForm = ref(false);
const editingScreening = ref(null);
const formLoading = ref(false);
const formError = ref('');

// Delete state
const deletingScreening = ref(null);
const deleteLoading = ref(false);

// Toast
const toast = ref(null);

async function fetchScreenings() {
  loading.value = true;
  try {
    const res = await api.get('/Screening');
    screenings.value = res.data;
  } catch (e) {
    showToast('error', 'Nie udało się pobrać seansów.');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingScreening.value = null;
  formError.value = '';
  showForm.value = true;
}

function openEdit(screening) {
  editingScreening.value = { ...screening };
  formError.value = '';
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingScreening.value = null;
}

async function handleFormSubmit(data) {
  formLoading.value = true;
  formError.value = '';
  try {
    const file = data.file;
    delete data.file;

    let screeningId = editingScreening.value?.id;

    if (editingScreening.value) {
      // Update
      await api.put(`/Screening/${screeningId}`, data);
      showToast('success', `Seans „${data.movieTitle}" został zaktualizowany.`);
    } else {
      // Create
      const res = await api.post('/Screening', data);
      screeningId = res.data.id;
      showToast('success', `Seans „${data.movieTitle}" został dodany.`);
    }

    if (file && screeningId) {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/Screening/${screeningId}/poster`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('success', 'Plakat został pomyślnie wgrany.');
    }

    closeForm();
    await fetchScreenings();
  } catch (e) {
    if (e.response?.status === 400) {
      formError.value = 'Seans o tych danych już istnieje lub dane są nieprawidłowe.';
    } else if (e.response?.status === 403) {
      formError.value = 'Brak uprawnień. Musisz być administratorem.';
    } else {
      formError.value = 'Wystąpił błąd. Spróbuj ponownie.';
    }
  } finally {
    formLoading.value = false;
  }
}

function confirmDelete(screening) {
  deletingScreening.value = screening;
}

async function handleDelete() {
  deleteLoading.value = true;
  try {
    await api.delete(`/Screening/${deletingScreening.value.id}`);
    showToast('success', `Seans „${deletingScreening.value.movieTitle}" został usunięty.`);
    deletingScreening.value = null;
    await fetchScreenings();
  } catch (e) {
    showToast('error', 'Nie udało się usunąć seansu.');
  } finally {
    deleteLoading.value = false;
  }
}

function showToast(type, message) {
  toast.value = { type, message };
  setTimeout(() => {
    toast.value = null;
  }, 3000);
}

onMounted(fetchScreenings);
</script>

<style scoped>
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

.td-title {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 150px;
}

.td-desc {
  color: var(--text-secondary);
  font-size: 0.85rem;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-actions {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .admin-toolbar {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
