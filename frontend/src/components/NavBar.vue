<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <router-link to="/" class="navbar-brand">
        <span class="brand-icon">🎬</span>
        <span class="brand-text">CinemaBook</span>
      </router-link>

      <div class="navbar-links">
        <router-link to="/" class="nav-link">Repertuar</router-link>

        <template v-if="auth.isLoggedIn">
          <router-link v-if="auth.isAdmin" to="/admin" class="nav-link nav-link-admin">
            ⚙️ Panel Admina
          </router-link>
          <router-link to="/my-reservations" class="nav-link">
            🎟️ Moje Rezerwacje
          </router-link>

          <div class="nav-user">
            <span class="nav-user-name">{{ auth.user?.userName }}</span>
            <span v-if="auth.isAdmin" class="badge badge-gold">Admin</span>
            <span v-else class="badge badge-purple">User</span>
          </div>

          <button @click="handleLogout" class="btn btn-secondary btn-sm">Wyloguj</button>
        </template>

        <template v-else>
          <router-link to="/login" class="btn btn-secondary btn-sm">Zaloguj się</router-link>
          <router-link to="/register" class="btn btn-primary btn-sm">Rejestracja</router-link>
        </template>
      </div>

      <!-- Mobile toggle -->
      <button class="navbar-toggle" @click="mobileOpen = !mobileOpen">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileOpen" class="navbar-mobile" @click="mobileOpen = false">
      <router-link to="/" class="nav-link">Repertuar</router-link>
      <template v-if="auth.isLoggedIn">
        <router-link v-if="auth.isAdmin" to="/admin" class="nav-link">Panel Admina</router-link>
        <router-link to="/my-reservations" class="nav-link">Moje Rezerwacje</router-link>
        <button @click="handleLogout" class="btn btn-secondary btn-sm">Wyloguj ({{ auth.user?.userName }})</button>
      </template>
      <template v-else>
        <router-link to="/login" class="nav-link">Zaloguj się</router-link>
        <router-link to="/register" class="nav-link">Rejestracja</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../stores/auth.js';

const auth = authStore;
const router = useRouter();
const mobileOpen = ref(false);

function handleLogout() {
  auth.logout();
  router.push('/');
}
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 26, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-purple-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.nav-link-admin {
  color: var(--accent-gold);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}

.nav-user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.navbar-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.navbar-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all var(--transition-fast);
}

.navbar-mobile {
  display: none;
  flex-direction: column;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .navbar-links { display: none; }
  .navbar-toggle { display: flex; }
  .navbar-mobile { display: flex; }
}
</style>
