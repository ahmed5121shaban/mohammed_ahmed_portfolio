import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Animates a number counting up from 0 to `target` once it scrolls into
 * view, using a cubic ease-out — matches the reference design's
 * `[data-count]` stat counters.
 */
@Component({
  selector: 'pf-counter',
  standalone: true,
  template: `{{ display() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) target = 0;
  @Input() pad = false;
  /** Extra delay (ms) before the count-up starts, once visible. */
  @Input() startDelay = 1000;

  readonly display = signal('0');

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.display.set(this.format(0));
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.observer?.unobserve(this.el.nativeElement);
            setTimeout(() => this.run(), this.startDelay);
          }
        }
      },
      { threshold: 0.3 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private format(value: number): string {
    return this.pad ? String(value).padStart(2, '0') : String(value);
  }

  private run(): void {
    const start = performance.now();
    const duration = 1300;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.display.set(this.format(Math.round(this.target * eased)));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
