import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

registerLocaleData(localeFr);

/** Aura with the platform's navy (--blue-color #10386B) as primary color; 500 is the brand color. */
const EnsaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#edf2f8',
      100: '#d3dfee',
      200: '#a8bfdc',
      300: '#7698c4',
      400: '#4570a6',
      500: '#10386b',
      600: '#0e315e',
      700: '#0b294f',
      800: '#09213f',
      900: '#061830',
      950: '#040f1f'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'fr' },

    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),

    provideHttpClient(withInterceptors([authInterceptor])),

    providePrimeNG({
      theme: {
        preset: EnsaPreset,
        options: {
          darkModeSelector: 'none'
        }
      }
    })
  ]
};
