import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../stores/auth.js';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ScreeningView from '../views/ScreeningView.vue';
import AdminView from '../views/AdminView.vue';
import MyReservationsView from '../views/MyReservationsView.vue';
import SuccessView from '../views/SuccessView.vue';
import MovieReviewsView from '../views/MovieReviewsView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/screening/:id',
    name: 'Screening',
    component: ScreeningView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/my-reservations',
    name: 'MyReservations',
    component: MyReservationsView,
    meta: { requiresAuth: true },
  },
  {
    path: '/success',
    name: 'Success',
    component: SuccessView,
    meta: { requiresAuth: true },
  },
  {
    path: '/movie/:id/reviews',
    name: 'MovieReviews',
    component: MovieReviewsView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login' });
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;
