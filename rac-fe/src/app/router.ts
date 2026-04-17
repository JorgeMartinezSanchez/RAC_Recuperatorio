// src/app/router.ts
import type { AppRoot } from './app-root';

interface Route {
    path: string;
    component: string;
}

const routes: Route[] = [
    { path: '/', component: 'main-page' },
    { path: '/create-booking', component: 'create-booking-page' }
];

class Router {
    private currentRoute: Route | null = null;
    private appRoot: AppRoot | null = null;
    
    init(): void {
        console.log('🔄 Router initializing...');
        
        // Buscar app-root en el DOM
        this.appRoot = document.querySelector('app-root');
        
        if (!this.appRoot) {
            console.error('❌ AppRoot component not found!');
            return;
        }
        
        console.log('✅ AppRoot found, setting up router');
        
        // Configurar event listeners
        window.addEventListener('popstate', () => this.handleLocation());
        document.addEventListener('click', this.handleLinkClick.bind(this));
        
        // Cargar la ruta inicial
        this.handleLocation();
    }
    
    private handleLinkClick(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        const link = target.closest('[data-link]') as HTMLAnchorElement;
        
        if (link && link.href) {
            e.preventDefault();
            const url = new URL(link.href);
            this.navigateTo(url.pathname);
        }
    }
    
    navigateTo(path: string): void {
        window.history.pushState({}, '', path);
        this.handleLocation();
    }
    
    private async handleLocation(): Promise<void> {
        const path = window.location.pathname;
        console.log(`📍 Navigating to: ${path}`);
        
        const route = routes.find(r => r.path === path) || routes[0];
        
        if (route === this.currentRoute) {
            console.log(`⏭️ Already on ${path}, skipping`);
            return;
        }
        
        this.currentRoute = route;
        console.log(`🎨 Creating component: ${route.component}`);
        
        try {
            const component = document.createElement(route.component);
            
            if (this.appRoot) {
                this.appRoot.setView(component);
                console.log(`✅ View changed to: ${route.component}`);
            } else {
                console.error('❌ AppRoot lost reference');
            }
        } catch (error) {
            console.error(`❌ Failed to create component ${route.component}:`, error);
        }
    }
    
    getCurrentRoute(): Route | null {
        return this.currentRoute;
    }
}

export const router = new Router();