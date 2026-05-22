<template>
  <div class="page fade-in">
    <div class="container auth-container">
      <div class="auth-card glass-card">
        <div class="auth-header">
          <span class="auth-icon">🔐</span>
          <h2>Zaloguj się</h2>
          <p>Witaj ponownie! Zaloguj się, aby zarezerwować miejsca.</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="login-username">Nazwa użytkownika</label>
            <input
              id="login-username"
              v-model="form.userName"
              class="form-input"
              type="text"
              placeholder="Wpisz nazwę użytkownika"
              required
            />
          </div>

          <div class="form-group">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              v-model="form.email"
              class="form-input"
              type="email"
              placeholder="twoj@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="login-password">Hasło</label>
            <input
              id="login-password"
              v-model="form.password"
              class="form-input"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="auth-error">{{ error }}</div>

          <button type="submit" class="btn btn-primary btn-lg auth-submit" :disabled="loading">
            {{ loading ? 'Logowanie...' : 'Zaloguj się' }}
          </button>
        </form>

        <p class="auth-footer">
          Nie masz konta?
          <router-link to="/register">Zarejestruj się</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios.js';
import { authStore } from '../stores/auth.js';

const router = useRouter();
const loading = ref(false);
const error = ref('');

const form = reactive({
  userName: '',
  email: '',
  password: '',
});

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.post('/Auth/Login', form);
    const token = res.data;
    if (authStore.login(token)) {
      router.push('/');
    } else {
      error.value = 'Nieprawidłowy token. Spróbuj ponownie.';
    }
  } catch (e) {
    error.value = 'Nieprawidłowe dane logowania. Sprawdź login, email i hasło.';
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
