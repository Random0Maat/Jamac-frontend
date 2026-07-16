import { ref, reactive, isRef } from 'vue';
import axios from 'axios';

// Set up base Axios URL pointing to the Laravel API
axios.defaults.baseURL = 'http://localhost:8000/api';

// Apply the Bearer token automatically if it exists in localStorage
const token = localStorage.getItem('auth_token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Global interceptor to handle session expiration (401 Unauthorized)
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export function useForm(initialData) {
    const fields = reactive({ ...initialData });
    const errors = ref({});
    const processing = ref(false);

    const form = new Proxy({
        errors,
        processing,
        reset() {
            Object.assign(fields, initialData);
        },
        clearErrors() {
            errors.value = {};
        },
        submit(method, url, options = {}) {
            processing.value = true;
            errors.value = {};

            const requestData = method.toLowerCase() === 'delete' ? {} : fields;

            axios({
                method: method,
                url: url,
                data: requestData,
            })
            .then(response => {
                if (options.onSuccess) {
                    options.onSuccess(response.data);
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 422) {
                    const validationErrors = error.response.data.errors || {};
                    const formattedErrors = {};
                    for (const key in validationErrors) {
                        formattedErrors[key] = validationErrors[key][0];
                    }
                    errors.value = formattedErrors;
                } else if (error.response && error.response.data && error.response.data.message) {
                    errors.value = { global: error.response.data.message };
                } else {
                    errors.value = { global: 'Ocurrió un error inesperado al procesar la solicitud.' };
                }

                if (options.onError) {
                    options.onError(errors.value);
                }
            })
            .finally(() => {
                processing.value = false;
            });
        },
        post(url, options = {}) {
            this.submit('post', url, options);
        },
        put(url, options = {}) {
            this.submit('put', url, options);
        },
        delete(url, options = {}) {
            this.submit('delete', url, options);
        },
        patch(url, options = {}) {
            this.submit('patch', url, options);
        }
    }, {
        get(target, prop) {
            if (prop in target) {
                const val = target[prop];
                // Unwrap ref values so they return raw booleans/objects in Vue templates
                return isRef(val) ? val.value : val;
            }
            return fields[prop];
        },
        set(target, prop, value) {
            if (prop in target) {
                const val = target[prop];
                if (isRef(val)) {
                    val.value = value;
                } else {
                    target[prop] = value;
                }
                return true;
            }
            fields[prop] = value;
            return true;
        }
    });

    return form;
}
