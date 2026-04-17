// src/app/app-root.ts
// src/app/app-root.ts
import './app-root.css';

export class AppRoot extends HTMLElement {
    private currentView: HTMLElement | null = null;
    
    constructor() {
        super();
    }
    
    connectedCallback() {
        this.render();
    }
    
    private render() {
        this.innerHTML = `
            <div class="app-root">
                <nav class="app-root__nav">
                    <div class="app-root__nav-container">
                        <a href="/" data-link class="app-root__logo">
                            <span class="app-root__logo-icon">🏨</span>
                            <span class="app-root__logo-text">RAC Hotel</span>
                        </a>
                        <div class="app-root__nav-links">
                            <a href="/" data-link class="app-root__nav-link">Dashboard</a>
                            <a href="/create-booking" data-link class="app-root__nav-link">New Booking</a>
                        </div>
                    </div>
                </nav>
                <main class="app-root__content" id="router-outlet">
                    <!-- El router cargará los componentes aquí -->
                </main>
            </div>
        `;
    }
    
    setView(component: HTMLElement) {
        const outlet = this.querySelector('#router-outlet');
        if (outlet) {
            outlet.innerHTML = '';
            outlet.appendChild(component);
            this.currentView = component;
        }
    }
    
    getView(): HTMLElement | null {
        return this.currentView;
    }
}

customElements.define('app-root', AppRoot);