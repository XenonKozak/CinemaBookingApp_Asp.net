<template>
  <div class="page fade-in">
    <div class="container auth-container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="auth-icon">✨</span>
          <h2>Utwórz konto</h2>
          <p>Dołącz do nas i rezerwuj bilety online!</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="reg-username">Nazwa użytkownika</label>
            <input
              id="reg-username"
              v-model="form.userName"
              class="form-input"
              type="text"
              placeholder="Wpisz nazwę użytkownika"
              required
            />
          </div>

          <div class="form-group">
            <label for="reg-email">Email</label>
            <input
              id="reg-email"
              v-model="form.email"
              class="form-input"
              type="email"
              placeholder="twoj@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="reg-password">Hasło</label>
            <input
              id="reg-password"
              v-model="form.password"
              class="form-input"
              type="password"
              placeholder="Min. 6 znaków"
              required
              minlength="6"
            />
          </div>

          <div v-if="error" class="auth-error">{{ error }}</div>
          <div v-if="success" class="auth-success">{{ success }}</div>

          <button type="submit" class="btn btn-purple btn-lg auth-submit" :disabled="loading">
            {{ loading ? 'Rejestracja...' : 'Zarejestruj się' }}
          </button>
        </form>

        <p class="auth-footer">
          Masz już konto?
          <router-link to="/login">Zaloguj się</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios.js';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const success = ref('');

const form = reactive({
  userName: '',
  email: '',
  password: '',
});

async function handleRegister() {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await api.post('/Auth/Register', form);
    success.value = 'Konto utworzone! Przekierowanie do logowania...';
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (e) {
    error.value = 'Nie udało się utworzyć konta. Spróbuj inną nazwę użytkownika lub email.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 180px);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
}

.auth-header h2 {
  margin-bottom: 8px;
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  color: var(--danger);
  font-size: 0.85rem;
  text-align: center;
}

.auth-success {
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-sm);
  color: var(--success);
  font-size: 0.85rem;
  text-align: center;
}

.auth-submit {
  width: 100%;
  margin-top: 4px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 0.88rem;
  color: var(--text-secondary);
}
</style>
