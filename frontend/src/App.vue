<template>
  <NavBar />
  <router-view v-slot="{ Component }">
    <transition name="slide-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
</script>
