// src/main.ts
import './style.css';
import './app/register-components';
import { router } from './app/router';

// Crear la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear el componente app-root en el DOM
    const app = document.getElementById('app');
    if (app && !app.hasChildNodes()) {
        const appRoot = document.createElement('app-root');
        app.appendChild(appRoot);
    }
    
    // Inicializar el router (esto buscará app-root y empezará a navegar)
    router.init();
});

console.log('🚀 Application started');