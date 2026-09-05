import { InjectionToken } from '@angular/core';
import type { ProfileContentRepository } from '@kola-profile/domain';

/**
 * DI token for the profile-content repository interface. The app
 * composition root (`app.config.ts`) provides the concrete
 * implementation from `infrastructure-data` — this layer and everything
 * above it only ever depend on the `domain` interface.
 */
export const PROFILE_CONTENT_REPOSITORY = new InjectionToken<ProfileContentRepository>(
  'PROFILE_CONTENT_REPOSITORY',
);
