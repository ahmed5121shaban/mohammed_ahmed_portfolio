import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { PROFILE_CONTENT_REPOSITORY } from '@kola-profile/application';
import { StaticProfileContentRepository } from '@kola-profile/infrastructure-data';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    // Composition root: bind the domain repository interface to its
    // concrete infrastructure implementation. Only this file (and no
    // presentation/application code) knows the concrete class.
    { provide: PROFILE_CONTENT_REPOSITORY, useClass: StaticProfileContentRepository },
  ],
};
