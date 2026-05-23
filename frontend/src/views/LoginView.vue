<template>
  <div class="page fade-in">
    <div class="container auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="brand-logo">
            <Clapperboard class="brand-icon" />
          </div>
          <h2>Zaloguj się</h2>
          <p>Przejdź do CinemaBook</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="material-input">
            <input
              id="login-username"
              v-model="form.userName"
              type="text"
              placeholder=" "
              required
            />
            <label for="login-username">Nazwa użytkownika</label>
          </div>

          <div class="material-input">
            <input
              id="login-email"
              v-model="form.email"
              type="email"
              placeholder=" "
              required
            />
            <label for="login-email">Email</label>
          </div>

          <div class="material-input" style="margin-bottom: 8px;">
            <input
              id="login-password"
              v-model="form.password"
              type="password"
              placeholder=" "
              required
            />
            <label for="login-password">Hasło</label>
          </div>

          <div v-if="error" class="auth-error">{{ error }}</div>

          <div class="auth-actions">
            <router-link to="/register" class="btn-text">Utwórz konto</router-link>
            <button type="submit" class="btn btn-purple auth-submit" :disabled="loading">
              {{ loading ? 'Logowanie...' : 'Dalej' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Clapperboard } from 'lucide-vue-next';
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
  min-height: calc(100vh - 120px);
}

.auth-card {
  width: 100%;
  max-width: 450px;
  padding: 48px 40px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.brand-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--accent-purple);
}

.brand-icon {
  width: 48px;
  height: 48px;
}

.auth-header h2 {
  font-size: 1.75rem;
  font-weight: 500;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.auth-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Modern Rounded Floating Input */
.material-input {
  position: relative;
}

.material-input input {
  width: 100%;
  padding: 24px 16px 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.material-input input:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 1px var(--accent-purple);
  background: rgba(255, 255, 255, 0.08);
}

.material-input label {
  position: absolute;
  top: 16px;
  left: 16px;
  color: var(--text-secondary);
  font-size: 1rem;
  pointer-events: none;
  transform-origin: left top;
  transition: transform 0.2s ease, color 0.2s ease;
}

.material-input input:focus ~ label,
.material-input input:not(:placeholder-shown) ~ label,
.material-input input:-webkit-autofill ~ label {
  transform: translateY(-8px) scale(0.75);
  color: var(--accent-purple);
}

.material-input input:not(:placeholder-shown):not(:focus) ~ label,
.material-input input:-webkit-autofill:not(:focus) ~ label {
  color: var(--text-secondary);
}

/* Fix Autofill white background */
.material-input input:-webkit-autofill,
.material-input input:-webkit-autofill:hover, 
.material-input input:-webkit-autofill:focus, 
.material-input input:-webkit-autofill:active {
  transition: background-color 5000s ease-in-out 0s;
  -webkit-text-fill-color: var(--text-primary) !important;
}

.auth-error {
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 4px;
  color: var(--danger);
  font-size: 0.85rem;
}

.auth-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.btn-text {
  color: var(--accent-purple);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  padding: 8px 8px 8px 0;
  transition: color var(--transition-fast);
}

.btn-text:hover {
  color: var(--accent-purple-light);
}

.auth-submit {
  padding: 10px 32px;
  font-weight: 600;
  border-radius: 24px;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 24px;
    border: none;
    box-shadow: none;
    background: transparent;
  }
  
  .auth-container {
    min-height: calc(100vh - 80px);
    align-items: flex-start;
    padding-top: 20px;
  }
}
</style>
