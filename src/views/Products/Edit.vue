<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router';
import axios from 'axios';
import AuthenticatedLayout from '../../components/AuthenticatedLayout.vue';
import { useForm } from '../../composables/useForm';
import { useNotification } from '../../composables/useNotification';

const router = useRouter();
const route = useRoute();
const { notify } = useNotification();
const id = route.params.id;

const loading = ref(true);

const form = useForm({
    name: '',
    description: '',
    price: '',
    stock: 0,
    is_active: true,
});

onMounted(async () => {
    try {
        const response = await axios.get(`/products/${id}`);
        const product = response.data;
        form.name = product.name;
        form.description = product.description || '';
        form.price = product.price;
        form.stock = product.stock;
        form.is_active = !!product.is_active;
        loading.value = false;
    } catch (error) {
        notify('No se pudieron cargar los datos del producto.', 'error');
        router.push('/products');
    }
});

const submitForm = () => {
    form.put(`/products/${id}`, {
        onSuccess: (data) => {
            notify('Producto actualizado con éxito.');
            router.push('/products');
        },
        onError: (errs) => {
            notify('Error al actualizar el producto. Verifique los datos.', 'error');
        }
    });
};
</script>

<template>
    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold leading-tight text-gray-800">
                    Editar Datos del Producto
                </h2>
                <RouterLink
                    to="/products"
                    class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
                >
                    Volver
                </RouterLink>
            </div>
        </template>

        <div class="py-12">
            <div class="mx-auto max-w-2xl sm:px-6 lg:px-8">
                <div v-if="loading" class="text-center py-12 text-sm text-gray-500 bg-white shadow-sm sm:rounded-lg border border-gray-100 p-6">
                    Cargando datos del producto...
                </div>
                <div v-else class="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100 p-6">
                    <form @submit.prevent="submitForm">
                        <div class="space-y-6">
                            <!-- Name Input -->
                            <div>
                                <label for="name" class="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                                <input
                                    v-model="form.name"
                                    id="name"
                                    type="text"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                                <div v-if="form.errors.name" class="text-sm text-rose-600 mt-1">
                                    {{ form.errors.name }}
                                </div>
                            </div>

                            <!-- Description Input -->
                            <div>
                                <label for="description" class="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                                <textarea
                                    v-model="form.description"
                                    id="description"
                                    rows="3"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                ></textarea>
                                <div v-if="form.errors.description" class="text-sm text-rose-600 mt-1">
                                    {{ form.errors.description }}
                                </div>
                            </div>

                            <!-- Price and Stock Inputs in Grid -->
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label for="price" class="block text-sm font-medium text-gray-700">Precio (Bs.)</label>
                                    <input
                                        v-model="form.price"
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                    <div v-if="form.errors.price" class="text-sm text-rose-600 mt-1">
                                        {{ form.errors.price }}
                                    </div>
                                </div>

                                <div>
                                    <label for="stock" class="block text-sm font-medium text-gray-700">Inventario (Stock)</label>
                                    <input
                                        v-model="form.stock"
                                        id="stock"
                                        type="number"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        required
                                    />
                                    <div v-if="form.errors.stock" class="text-sm text-rose-600 mt-1">
                                        {{ form.errors.stock }}
                                    </div>
                                </div>
                            </div>

                            <!-- Active Status Toggle -->
                            <div class="flex items-center">
                                <input
                                    v-model="form.is_active"
                                    id="is_active"
                                    type="checkbox"
                                    class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label for="is_active" class="ml-2 block text-sm font-medium text-gray-900 font-semibold select-none">
                                    Producto Activo
                                </label>
                            </div>
                        </div>

                        <!-- Submit Buttons -->
                        <div class="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                            <RouterLink
                                to="/products"
                                class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Cancelar
                            </RouterLink>
                            <button
                                type="submit"
                                :disabled="form.processing"
                                class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition"
                            >
                                {{ form.processing ? 'Guardando...' : 'Guardar Cambios' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
