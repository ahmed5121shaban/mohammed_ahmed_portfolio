import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * A thin fixed bar at the top of the page that fills as the reader
 * scrolls through the document — matches the reference design's
 * `#pf-progress` element.
 */
@Component({
  selector: 'pf-progress-bar',
  standalone: true,
  template: '',
  styles: `
    :host {
      position: fixed;
      top: 0;
      right: 0;
      height: 3px;
      background: var(--color-accent);
      z-index: 60;
      display: block;
    }
  `,
  host: {
    '[style.width.%]': 'progress()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent implements OnDestroy {
  readonly progress = signal(0);

  private readonly platformId = inject(PLATFORM_ID);
  private onScroll?: () => void;

  constructor() {
    afterNextRender(() => this.boot());
  }

  private boot(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const update = () => {
      const doc = document.documentElement;
      const span = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / span));
      this.progress.set(Math.round(p * 10000) / 100);
    };
    this.onScroll = update;
    update();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
  }

  ngOnDestroy(): void {
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onScroll);
    }
  }
}
