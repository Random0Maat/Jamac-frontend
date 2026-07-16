<script setup>
import { useRouter, RouterLink } from 'vue-router';
import axios from 'axios';
import { useForm } from '../composables/useForm';
import { useNotification } from '../composables/useNotification';

const router = useRouter();
const { notify } = useNotification();

const form = useForm({
    email: '',
    password: '',
});

const submitLogin = () => {
    form.post('/login', {
        onSuccess: (data) => {
            // Save token and apply to axios header
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_name', data.user.name);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            notify('Sesión iniciada con éxito.');
            router.push('/');
        },
        onError: (errs) => {
            const errorMsg = errs.email || errs.global || 'Error al iniciar sesión. Verifique sus credenciales.';
            notify(errorMsg, 'error');
        }
    });
};
</script>

<template>
    <div class="min-h-screen bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
            <!-- Branding logo -->
            <span class="text-4xl font-black tracking-widest bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent select-none">
                PHOENIX
            </span>
            <h2 class="mt-4 text-center text-xl font-bold tracking-tight text-white/95">
                Ingreso al Sistema Administrativo
            </h2>
            <p class="mt-1 text-sm text-indigo-200/60">
                Gestión de Clientes, Inventario y Pedidos
            </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white/10 backdrop-blur-md py-8 px-4 shadow-2xl border border-white/10 sm:rounded-2xl sm:px-10">
                <form class="space-y-6" @submit.prevent="submitLogin">
                    <!-- Global/Server validation error alert -->
                    <div v-if="form.errors.global" class="rounded-md bg-rose-500/20 p-3 border border-rose-500/30 text-rose-200 text-xs">
                        {{ form.errors.global }}
                    </div>

                    <!-- Email Input -->
                    <div>
                        <label for="email" class="block text-xs font-semibold uppercase tracking-wider text-indigo-200">
                            Correo Electrónico
                        </label>
                        <div class="mt-1.5 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg class="h-5 w-5 text-indigo-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </span>
                            <input
                                v-model="form.email"
                                id="email"
                                type="email"
                                autocomplete="email"
                                placeholder="admin@example.com"
                                required
                                class="block w-full rounded-lg border-0 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-indigo-200/30 shadow-inner ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 sm:text-sm focus:outline-none transition-all"
                            />
                        </div>
                        <div v-if="form.errors.email" class="text-xs text-rose-300 mt-1.5">
                            {{ form.errors.email }}
                        </div>
                    </div>

                    <!-- Password Input -->
                    <div>
                        <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-indigo-200">
                            Contraseña
                        </label>
                        <div class="mt-1.5 relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg class="h-5 w-5 text-indigo-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </span>
                            <input
                                v-model="form.password"
                                id="password"
                                type="password"
                                autocomplete="current-password"
                                placeholder="••••••••"
                                required
                                class="block w-full rounded-lg border-0 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-indigo-200/30 shadow-inner ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 sm:text-sm focus:outline-none transition-all"
                            />
                        </div>
                        <div v-if="form.errors.password" class="text-xs text-rose-300 mt-1.5">
                            {{ form.errors.password }}
                        </div>
                    </div>

                    <!-- Action Button -->
                    <div>
                        <button
                            type="submit"
                            :disabled="form.processing"
                            class="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all select-none"
                        >
                            {{ form.processing ? 'Verificando...' : 'Iniciar Sesión' }}
                        </button>
                    </div>
                </form>

                <div class="mt-6 text-center">
                    <RouterLink to="/register" class="text-sm font-semibold text-indigo-300 hover:text-indigo-200 transition">
                        ¿No tienes una cuenta? Regístrate aquí
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
