import { Injectable, Signal, inject, signal } from '@angular/core';
import type { ProfileContent } from '@kola-profile/domain';
import { PROFILE_CONTENT_REPOSITORY } from './profile-content-repository.token';

/**
 * Application-layer use-case exposing the profile content as a Signal.
 * Presentation components depend only on this facade, never on the
 * repository interface or its concrete implementation directly.
 */
@Injectable({ providedIn: 'root' })
export class ProfileFacade {
  private readonly repository = inject(PROFILE_CONTENT_REPOSITORY);
  private readonly _profile = signal<ProfileContent>(this.repository.getProfile());

  readonly profile: Signal<ProfileContent> = this._profile.asReadonly();
}
