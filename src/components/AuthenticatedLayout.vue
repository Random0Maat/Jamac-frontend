<script setup>
import { ref, onMounted } from 'vue';
import { useNotification } from '../composables/useNotification';
import { RouterLink, useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const { message, type, notify, clear } = useNotification();

const userName = ref(localStorage.getItem('user_name') || 'Administrador');
const userInitials = ref('AD');

onMounted(() => {
    // Dynamic initials calculation
    const name = userName.value;
    const parts = name.split(' ');
    if (parts.length >= 2) {
        userInitials.value = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (name.length > 0) {
        userInitials.value = name.substring(0, 2).toUpperCase();
    }
});

const logout = async () => {
    try {
        await axios.post('/logout');
    } catch (e) {
        console.error('Error logging out of backend API', e);
    }
    // Remove authentication details from storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    delete axios.defaults.headers.common['Authorization'];
    
    notify('Sesión cerrada con éxito.');
    router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <!-- Navbar Navigation -->
    <nav class="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between items-center">
          <div class="flex items-center gap-8">
            <!-- App Logo / Name -->
            <RouterLink to="/" class="flex items-center gap-2">
              <span class="text-xl font-extrabold tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PHOENIX ORDERS
              </span>
            </RouterLink>

            <!-- Nav Links -->
            <div class="hidden sm:flex space-x-4">
              <RouterLink
                to="/"
                class="rounded-md px-3 py-2 text-sm font-semibold transition"
                active-class="bg-indigo-50 text-indigo-700"
                inactive-class="text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Dashboard
              </RouterLink>
              <RouterLink
                to="/customers"
                class="rounded-md px-3 py-2 text-sm font-semibold transition"
                active-class="bg-indigo-50 text-indigo-700"
                inactive-class="text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Clientes
              </RouterLink>
              <RouterLink
                to="/products"
                class="rounded-md px-3 py-2 text-sm font-semibold transition"
                active-class="bg-indigo-50 text-indigo-700"
                inactive-class="text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Productos
              </RouterLink>
              <RouterLink
                to="/orders"
                class="rounded-md px-3 py-2 text-sm font-semibold transition"
                active-class="bg-indigo-50 text-indigo-700"
                inactive-class="text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                Pedidos
              </RouterLink>
            </div>
          </div>

          <!-- User Indicator & Logout button -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {{ userInitials }}
              </span>
              <span class="text-xs font-semibold text-gray-700 hidden sm:inline">{{ userName }}</span>
            </div>
            <button
              @click="logout"
              class="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-inset ring-rose-200 hover:bg-rose-100 transition cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Nav Links -->
      <div class="sm:hidden border-t border-gray-50 bg-white flex justify-around py-2">
        <RouterLink
          to="/"
          class="text-xs font-semibold px-2.5 py-1.5 rounded transition"
          active-class="bg-indigo-50 text-indigo-700"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/customers"
          class="text-xs font-semibold px-2.5 py-1.5 rounded transition"
          active-class="bg-indigo-50 text-indigo-700"
        >
          Clientes
        </RouterLink>
        <RouterLink
          to="/products"
          class="text-xs font-semibold px-2.5 py-1.5 rounded transition"
          active-class="bg-indigo-50 text-indigo-700"
        >
          Productos
        </RouterLink>
        <RouterLink
          to="/orders"
          class="text-xs font-semibold px-2.5 py-1.5 rounded transition"
          active-class="bg-indigo-50 text-indigo-700"
        >
          Pedidos
        </RouterLink>
      </div>
    </nav>

    <!-- Header Section -->
    <header v-if="$slots.header" class="bg-white border-b border-gray-100">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot name="header" />
      </div>
    </header>

    <!-- Notification Banner -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="message" class="fixed top-18 right-4 z-50 max-w-md w-full shadow-lg rounded-lg border pointer-events-auto overflow-hidden bg-white"
           :class="type === 'success' ? 'border-emerald-500' : 'border-rose-500'">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg v-if="type === 'success'" class="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-semibold text-gray-900">
                {{ type === 'success' ? 'Operación Exitosa' : 'Ocurrió un Problema' }}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {{ message }}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button type="button" @click="clear" class="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <span class="sr-only">Cerrar</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Content Slot -->
    <main class="flex-1 py-10">
      <slot />
    </main>
  </div>
</template>
