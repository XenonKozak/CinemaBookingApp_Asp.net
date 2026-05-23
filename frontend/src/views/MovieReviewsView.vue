<template>
  <div class="page fade-in">
    <div class="container">
      <router-link to="/my-reservations" class="back-link">← Powrót do rezerwacji</router-link>
      
      <MovieReviews :movieId="route.params.id" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import MovieReviews from '../components/MovieReviews.vue';

const route = useRoute();
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}
.back-link {
  display: inline-block;
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  transition: color var(--transition-fast);
}
.back-link:hover {
  color: var(--accent-gold);
}
</style>
