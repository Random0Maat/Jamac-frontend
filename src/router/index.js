import { createRouter, createWebHistory } from 'vue-router';
import Welcome from '../views/Welcome.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import CustomersIndex from '../views/Customers/Index.vue';
import CustomersCreate from '../views/Customers/Create.vue';
import CustomersEdit from '../views/Customers/Edit.vue';
import ProductsIndex from '../views/Products/Index.vue';
import ProductsCreate from '../views/Products/Create.vue';
import ProductsEdit from '../views/Products/Edit.vue';
import OrdersIndex from '../views/Orders/Index.vue';
import OrdersCreate from '../views/Orders/Create.vue';
import OrdersShow from '../views/Orders/Show.vue';

const routes = [
    { path: '/login', name: 'login', component: Login, meta: { public: true } },
    { path: '/register', name: 'register', component: Register, meta: { public: true } },
    { path: '/', name: 'welcome', component: Welcome },
    { path: '/customers', name: 'customers.index', component: CustomersIndex },
    { path: '/customers/create', name: 'customers.create', component: CustomersCreate },
    { path: '/customers/:id/edit', name: 'customers.edit', component: CustomersEdit, props: true },
    { path: '/products', name: 'products.index', component: ProductsIndex },
    { path: '/products/create', name: 'products.create', component: ProductsCreate },
    { path: '/products/:id/edit', name: 'products.edit', component: ProductsEdit, props: true },
    { path: '/orders', name: 'orders.index', component: OrdersIndex },
    { path: '/orders/create', name: 'orders.create', component: OrdersCreate },
    { path: '/orders/:id', name: 'orders.show', component: OrdersShow, props: true },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard to enforce authentication checks
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth_token');
    
    if (!to.meta.public && !token) {
        // Enforce login redirect
        next({ name: 'login' });
    } else if (to.meta.public && token) {
        // Logged in users cannot visit public auth pages (login/register)
        next({ name: 'welcome' });
    } else {
        next();
    }
});

export default router;
