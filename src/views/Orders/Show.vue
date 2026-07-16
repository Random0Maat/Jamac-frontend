<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import axios from 'axios';
import AuthenticatedLayout from '../../components/AuthenticatedLayout.vue';
import { useNotification } from '../../composables/useNotification';

const route = useRoute();
const { notify } = useNotification();
const id = route.params.id;

const order = ref(null);
const loading = ref(true);
const updating = ref(false);

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

const fetchOrderDetails = async () => {
    try {
        const response = await axios.get(`/orders/${id}`);
        order.value = response.data;
    } catch (error) {
        notify('No se pudieron cargar los detalles del pedido.', 'error');
    } finally {
        loading.value = false;
    }
};

const updateStatus = async (newStatus) => {
    updating.value = true;
    try {
        const response = await axios.patch(`/orders/${id}`, {
            status: newStatus
        });
        order.value = response.data.data;
        notify(`Estado del pedido cambiado a ${getStatusLabel(newStatus)} con éxito.`);
    } catch (e) {
        if (e.response && e.response.data && e.response.data.error) {
            notify(e.response.data.error, 'error');
        } else {
            notify('Error al actualizar el estado del pedido.', 'error');
        }
    } finally {
        updating.value = false;
    }
};

onMounted(() => {
    fetchOrderDetails();
});
</script>

<template>
    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold leading-tight text-gray-800" v-if="order">
                    Detalle del Pedido #{{ order.id.substring(0, 8) }}
                </h2>
                <h2 class="text-xl font-bold leading-tight text-gray-800" v-else>
                    Detalle del Pedido
                </h2>
                <RouterLink
                    to="/orders"
                    class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
                >
                    <svg class="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver a Pedidos
                </RouterLink>
            </div>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                <div v-if="loading" class="text-center py-12 text-sm text-gray-500 bg-white shadow sm:rounded-lg p-6 border border-gray-100">
                    Cargando detalles del pedido...
                </div>
                
                <template v-else-if="order">
                    <!-- Order Summary & Customer Details Cards -->
                    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <!-- General Details Card -->
                        <div class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6 flex flex-col justify-between">
                            <div>
                                <h3 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Información del Pedido</h3>
                                <div class="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                    <div class="text-gray-500">ID Completo:</div>
                                    <div class="font-mono text-xs text-gray-900 break-all select-all font-bold">{{ order.id }}</div>

                                    <div class="text-gray-500">Fecha:</div>
                                    <div class="font-semibold text-gray-900">{{ new Date(order.order_date).toLocaleString() }}</div>

                                    <div class="text-gray-500">Estado:</div>
                                    <div>
                                        <span
                                            :class="getStatusClasses(order.status)"
                                            class="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset"
                                        >
                                            {{ getStatusLabel(order.status) }}
                                        </span>
                                    </div>

                                    <div class="text-gray-500">Total Facturado:</div>
                                    <div class="font-black text-lg text-indigo-600">Bs. {{ parseFloat(order.total).toFixed(2) }}</div>
                                </div>
                            </div>

                            <!-- Actions block -->
                            <div class="border-t border-gray-100 pt-4 mt-6 space-y-3">
                                <span class="block text-xs font-extrabold text-gray-400 uppercase tracking-wider">Flujo de Estados</span>
                                <div class="flex flex-col gap-2">
                                    <!-- Transitions from PENDING -->
                                    <template v-if="order.status === 'PENDING'">
                                        <button 
                                            @click="updateStatus('CONFIRMED')"
                                            :disabled="updating"
                                            class="w-full inline-flex justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-500 transition cursor-pointer disabled:opacity-50"
                                        >
                                            Confirmar Pedido
                                        </button>
                                        <button 
                                            @click="updateStatus('CANCELLED')"
                                            :disabled="updating"
                                            class="w-full inline-flex justify-center items-center rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                                        >
                                            Cancelar Pedido
                                        </button>
                                    </template>
                                    
                                    <!-- Transitions from CONFIRMED -->
                                    <template v-if="order.status === 'CONFIRMED'">
                                        <button 
                                            @click="updateStatus('DELIVERED')"
                                            :disabled="updating"
                                            class="w-full inline-flex justify-center items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition cursor-pointer disabled:opacity-50"
                                        >
                                            Marcar como Entregado
                                        </button>
                                        <button 
                                            @click="updateStatus('CANCELLED')"
                                            :disabled="updating"
                                            class="w-full inline-flex justify-center items-center rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
                                        >
                                            Cancelar Pedido
                                        </button>
                                    </template>

                                    <!-- Finalized States Display -->
                                    <div v-if="order.status === 'DELIVERED'" class="text-center p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                        ✓ Pedido completado y entregado.
                                    </div>
                                    <div v-if="order.status === 'CANCELLED'" class="text-center p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                                        ✕ Pedido anulado / cancelado.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Customer Details Card -->
                        <div class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100 p-6 space-y-4 md:col-span-2">
                            <h3 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Datos del Cliente</h3>
                            <div v-if="order.customer" class="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 text-sm">
                                <div>
                                    <div class="text-gray-500 font-semibold">Nombre Completo:</div>
                                    <div class="font-bold text-gray-900 text-base mt-1">{{ order.customer.full_name }}</div>
                                </div>
                                <div>
                                    <div class="text-gray-500 font-semibold">Correo Electrónico:</div>
                                    <div class="font-medium text-gray-900 text-base mt-1">{{ order.customer.email }}</div>
                                </div>
                                <div>
                                    <div class="text-gray-500 font-semibold">Teléfono:</div>
                                    <div class="font-medium text-gray-900 text-base mt-1">{{ order.customer.phone || 'N/A' }}</div>
                                </div>
                                <div>
                                    <div class="text-gray-500 font-semibold">Estado del Cliente:</div>
                                    <div class="mt-2">
                                        <span
                                            :class="order.customer.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                                            class="inline-flex items-center rounded px-2.5 py-0.5 text-xs font-bold"
                                        >
                                            {{ order.customer.is_active ? 'Activo' : 'Inactivo' }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-sm text-rose-600 font-bold bg-rose-50 p-4 rounded-lg border border-rose-150">
                                Atención: Este cliente ha sido eliminado del sistema.
                            </div>
                        </div>
                    </div>

                    <!-- Products in Order Card -->
                    <div class="overflow-hidden bg-white shadow-sm sm:rounded-xl border border-gray-100">
                        <div class="p-6 border-b border-gray-100">
                            <h3 class="text-base font-bold text-gray-900">Productos Incluidos</h3>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full table-auto text-left text-sm text-gray-700">
                                <thead class="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                                    <tr>
                                        <th class="px-6 py-4">Producto</th>
                                        <th class="px-6 py-4 text-center">Cantidad</th>
                                        <th class="px-6 py-4 text-right">Precio Unitario</th>
                                        <th class="px-6 py-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100">
                                    <tr v-for="item in order.items" :key="item.id" class="hover:bg-gray-50/30 transition">
                                        <td class="px-6 py-4">
                                            <div class="font-bold text-gray-900">
                                                {{ item.product ? item.product.name : 'Producto Eliminado' }}
                                            </div>
                                            <div class="text-xs text-gray-400 font-mono mt-0.5" v-if="item.product">
                                                ID: {{ item.product.id }}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 text-center font-bold text-gray-900">
                                            {{ item.quantity }}
                                        </td>
                                        <td class="px-6 py-4 text-right text-gray-500 font-mono">
                                            Bs. {{ parseFloat(item.unit_price).toFixed(2) }}
                                        </td>
                                        <td class="px-6 py-4 text-right font-black text-gray-900 font-mono">
                                            Bs. {{ parseFloat(item.sub_total).toFixed(2) }}
                                        </td>
                                    </tr>
                                    <!-- Final Summary Row -->
                                    <tr class="bg-gray-50/50">
                                        <td colspan="3" class="px-6 py-5 text-right font-bold text-gray-950 uppercase">
                                            Total del Pedido:
                                        </td>
                                        <td class="px-6 py-5 text-right font-black text-indigo-600 text-xl font-mono">
                                            Bs. {{ parseFloat(order.total).toFixed(2) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </template>
                
                <div v-else class="text-center py-12 text-sm text-gray-500 bg-white shadow sm:rounded-lg p-6 border border-gray-100">
                    No se encontró el pedido solicitado.
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
