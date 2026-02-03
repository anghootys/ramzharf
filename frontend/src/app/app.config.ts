import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeuix/themes/aura'
import {definePreset, palette} from '@primeuix/themes';
import { authInterceptor } from './interceptors/auth.interceptor';

const brandColorPalette = palette("#b01e24")

const AuraCustomTheme = definePreset(Aura, {
  semantic: {
    primary: brandColorPalette,
  }
})

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: AuraCustomTheme,
        options: {
          prefix: 'p',
          darkModeSelector: '.app-dark-mode',
          cssLayer: false
        }
      },
      ripple: true
    })
  ]
};
