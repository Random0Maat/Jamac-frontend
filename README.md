# Phoenix Orders - Frontend SPA (Vue 3 + Vite)

Este es el cliente web de administración de Phoenix Orders. Es una aplicación de página única (SPA) rápida y responsiva que consume de forma segura la API del backend.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:
*   **Node.js** (versión 18 o superior recomendada)
*   **npm** (instalador de paquetes, viene con Node.js)

---

## 🚀 Pasos para hacerlo funcionar

Abre una terminal dentro de esta carpeta y sigue estos sencillos pasos:

### 1. Instalar dependencias
Descarga e instala las librerías de Vue y Tailwind necesarias ejecutando:
```bash
npm install
```

### 2. Configurar la URL de la API (Opcional)
El frontend ya está configurado para apuntar a la API en `http://localhost:8000/api` de forma local. Si necesitas cambiar el puerto o la dirección, puedes hacerlo editando la línea 5 del archivo:
`src/composables/useForm.js`

### 3. Iniciar el servidor de desarrollo
Arranca el cliente web de desarrollo con Vite:
```bash
npm run dev
```
*(Vite te indicará en qué dirección local está corriendo, por lo general es: **`http://localhost:5173`**)*

---

## 🔑 Cómo ingresar al sistema por primera vez

Una vez levantado el frontend y el backend:
1.  Abre el navegador en `http://localhost:5173`.
2.  Haz clic en **"¿No tienes una cuenta? Regístrate aquí"** para crear un usuario administrador directamente.
3.  O bien, puedes iniciar sesión con los datos de prueba generados por el backend (si corriste los seeders):

