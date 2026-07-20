<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import axios from 'axios';
import AuthenticatedLayout from '../components/AuthenticatedLayout.vue';

const stats = ref({
    totalCustomers: 0,
    totalProductsStock: 0,
    totalOrders: 0,
    totalRevenue: 0,
});
const recentOrders = ref([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const [custRes, prodRes, ordRes] = await Promise.all([
            axios.get('/customers'),
            axios.get('/products'),
            axios.get('/orders')
        ]);

        const custData = custRes.data;
        const prodData = prodRes.data;
        const ordData = ordRes.data;

        // Calculate counts and aggregations safely
        stats.value.totalCustomers = custData.total || (Array.isArray(custData) ? custData.length : (custData.data ? custData.data.length : 0));
        
        const productsArr = Array.isArray(prodData) ? prodData : (prodData.data || []);
        stats.value.totalProductsStock = productsArr.reduce((sum, p) => sum + parseInt(p.stock || 0), 0);

        const ordersArr = Array.isArray(ordRes.data) ? ordRes.data : (ordRes.data.data || []);
        stats.value.totalOrders = ordData.total || ordersArr.length;
        stats.value.totalRevenue = ordersArr.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

        // Take last 5 orders
        recentOrders.value = ordersArr.slice(0, 5);
    } catch (e) {
        console.error("Error loading dashboard stats", e);
    } finally {
        loading.value = false;
    }
});

const getStatusClasses = (status) => {
    switch (status) {
        case 'PENDING':
            return 'bg-amber-50 text-amber-700 ring-amber-600/10';
        case 'CONFIRMED':
            return 'bg-blue-50 text-blue-700 ring-blue-600/10';
        case 'DELIVERED':
            return 'bg-emerald-50 text-emerald-700 ring-emerald-600/10';
        case 'CANCELLED':
            return 'bg-rose-50 text-rose-700 ring-rose-600/10';
        default:
            return 'bg-gray-50 text-gray-700 ring-gray-600/10';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'PENDING':
            return 'Pendiente';
        case 'CONFIRMED':
            return 'Confirmado';
        case 'DELIVERED':
            return 'Entregado';
        case 'CANCELLED':
            return 'Cancelado';
        default:
            return status;
    }
};
</script>

<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="text-xl font-bold leading-tight text-gray-800">
        Panel de Control
      </h2>
    </template>

    <div class="py-6">
      <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
        
        <!-- Welcome banner -->
        <div class="overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg sm:rounded-2xl text-white p-8">
          <h1 class="text-2xl font-extrabold mb-2 text-white">¡Bienvenido al Panel de Control de Ventas!</h1>
          <p class="text-indigo-100 max-w-2xl text-sm leading-relaxed">
            Aquí tienes un resumen de la actividad comercial y el inventario disponible de Phoenix Orders. Usa los accesos directos para agilizar las operaciones de facturación..
          </p>
        </div>

        <!-- Dashboard Stat Cards -->
        <div v-if="loading" class="text-center py-10 text-gray-500 text-sm">
            Cargando estadísticas del negocio...
        </div>
        <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <!-- Stat 1: Total Revenue -->
          <div class="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 p-6">
            <dt class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Recaudado</dt>
            <dd class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-gray-900">Bs. {{ stats.totalRevenue.toFixed(2) }}</span>
              <span class="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">Ventas</span>
            </dd>
          </div>

          <!-- Stat 2: Total Orders -->
          <div class="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 p-6">
            <dt class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedidos Registrados</dt>
            <dd class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-gray-900">{{ stats.totalOrders }}</span>
              <span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">Pedidos</span>
            </dd>
          </div>

          <!-- Stat 3: Total Stock -->
          <div class="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 p-6">
            <dt class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventario en Stock</dt>
            <dd class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-gray-900">{{ stats.totalProductsStock }} uds</span>
              <span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">Almacén</span>
            </dd>
          </div>

          <!-- Stat 4: Customers Count -->
          <div class="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 p-6">
            <dt class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Clientes Registrados</dt>
            <dd class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-gray-900">{{ stats.totalCustomers }}</span>
              <span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">Clientes</span>
            </dd>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <!-- Left: Recent Orders Table -->
          <div class="lg:col-span-2 space-y-4">
            <div class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6">
              <h3 class="text-base font-bold text-gray-900 mb-4">Últimos Pedidos Registrados</h3>
              
              <div v-if="loading" class="text-center py-6 text-gray-500 text-sm">
                  Cargando pedidos...
              </div>
              <div v-else-if="recentOrders.length === 0" class="text-center py-10 text-gray-400 text-sm">
                  No hay pedidos registrados en el sistema todavía.
              </div>
              <div v-else class="overflow-x-auto">
                <table class="w-full text-left text-sm text-gray-700">
                  <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                    <tr>
                      <th class="px-4 py-3">ID</th>
                      <th class="px-4 py-3">Cliente</th>
                      <th class="px-4 py-3">Estado</th>
                      <th class="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50/50 transition">
                      <td class="px-4 py-3 font-mono text-xs text-indigo-600 font-bold">
                        <RouterLink :to="`/orders/${order.id}`" class="hover:underline">
                          {{ order.id.substring(0, 8) }}...
                        </RouterLink>
                      </td>
                      <td class="px-4 py-3 font-medium text-gray-900">
                        {{ order.customer ? order.customer.full_name : 'Cliente Eliminado' }}
                      </td>
                      <td class="px-4 py-3">
                        <span :class="getStatusClasses(order.status)" class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset">
                          {{ getStatusLabel(order.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right font-bold text-gray-900 font-mono">
                        Bs. {{ parseFloat(order.total).toFixed(2) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right: Module Quick Access -->
          <div class="space-y-6">
            <div class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6 space-y-4">
              <h3 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Acciones Rápidas</h3>
              <div class="space-y-3">
                <RouterLink to="/orders/create" class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-150 hover:bg-indigo-50/20 transition group">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span class="text-sm font-semibold text-gray-800">Crear Nuevo Pedido</span>
                  </div>
                  <span class="text-gray-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </RouterLink>

                <RouterLink to="/customers/create" class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-150 hover:bg-indigo-50/20 transition group">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <span class="text-sm font-semibold text-gray-800">Registrar Cliente</span>
                  </div>
                  <span class="text-gray-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </RouterLink>

                <RouterLink to="/products/create" class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-indigo-150 hover:bg-indigo-50/20 transition group">
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center">
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span class="text-sm font-semibold text-gray-800">Agregar Producto</span>
                  </div>
                  <span class="text-gray-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>
