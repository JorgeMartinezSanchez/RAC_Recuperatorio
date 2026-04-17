// src/app/register-components.ts
// Este archivo registra TODOS los Web Components de la aplicación

console.log('🔧 Registering Web Components...');

// Componentes de entidad
import '../entity/booking/ui/booking-card/booking-card';
import '../entity/guest/ui/guest-card/guest-card';
import '../entity/room/ui/room-card/room-card';

// Componentes de página
import '../pages/main-page/main-page';
import '../pages/create-booking-page/create-booking-page';

// Componente raíz de la aplicación
import './app-root';

// Importar helpers de Handlebars
import './handlebars-helper';

console.log('✅ All Web Components registered successfully');